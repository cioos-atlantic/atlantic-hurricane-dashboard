import { wfs_query } from "./wfs_test";

export default async function handler(req, res) {
    const station = req.query["station"]
    const source = ["ERDDAP"]
    const source_type = "ACTIVE"
    try {
        // Ask for a station, get the data
        const result = await wfs_query("","",source,source_type)
        let station_data = {}
        const features = result['erddap_data']['features']
        const re_match = /(?<var_name>.*)\s\((?<standard_name>.*)\|(?<units>.*)\|(?<long_name>.*)\)/g; 
        for (let feature in features){
            const station_name = features[feature]['properties']['station']
            // Can change the WFS query to only get one station, but for now easier to filter out here
            if(!station || station==station_name){
                const parsed_data = JSON.parse(features[feature]['properties']['station_data']);
                if(station_data[station_name]) {
                    station_data[station_name]['properties']['max_time'] = features[feature]['properties']['max_time']
                }
                else {
                    station_data[station_name] = features[feature];
                    let station_data_formatted = {
                        'column_names':[],
                        'column_units':[],
                        'column_std_names':[],
                        'column_long_names':[],
                        'column_raw_names':[],
                        'rows':[]
                    };
                    const data_fields = Object.keys(parsed_data[0]);

                    data_fields.forEach((field) => {
                        const names = [...field.matchAll(re_match)];
                        if (names.length > 0) {
                            station_data_formatted['column_names'].push(names[0].groups["var_name"]);
                            station_data_formatted['column_std_names'].push(names[0].groups["standard_name"]);
                            station_data_formatted['column_units'].push(names[0].groups["units"]);
                            station_data_formatted['column_long_names'].push(names[0].groups["long_name"]);
                            station_data_formatted['column_raw_names'].push(field);
                        }
                    })
                    station_data[station_name]['properties']['station_data'] = station_data_formatted;
                }
                const station_column_data = station_data[station_name]['properties']['station_data']['column_raw_names']
                parsed_data.forEach((row) => {
                    let row_data = []
                    station_column_data.forEach((column) => {
                        row_data.push(row[column])
                    })
                    station_data[station_name]['properties']['station_data']['rows'].push(row_data)
                })
            }
        }
        res.status(200).json(station_data)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}
