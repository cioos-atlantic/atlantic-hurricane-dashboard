import { wfs_query } from "./wfs_test";

export default async function handler(req, res) {
    const source = ["ERDDAP"]
    const source_type = "ACTIVE"


    try {
        console.log("handler", source, source_type);
        /*
        const result = await wfs_query(storm_name, season, source, source_type)
        res.status(200).json({ "storm_name": storm_name, "season": season, "source": source, "source_type": source_type, ...result })
        */

        // Ask for a station, get the data
        const result = await wfs_query("","",source,source_type)
        console.log('getting features...')
        let station_data = {}
        const features = result['erddap_data']['features']
        const re_match = /(?<var_name>[\w_]+)\s\((?<standard_name>[\w_]+)\|(?<units>[\w\s\/()-]+)\|(?<long_name>[\w\s\d\/()]+)\)/g; 
        for (let feature in features){
            const station_name = features[feature]['properties']['station']
            station_data[station_name] = features[feature]

            let station_data_formatted = {
                'column_names':[],
                'column_units':[],
                'column_std_names':[],
                'column_long_names':[],
                'column_raw_names':[],
                'rows':[]
            };
            const parsed_data = JSON.parse(station_data[station_name]['properties']['station_data']);
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

            parsed_data.forEach((row) => {
                let row_data = []
                station_data_formatted['column_raw_names'].forEach((column) => {
                    row_data.push(row[column])
                })
                station_data_formatted['rows'].push(row_data)
            })
            

            station_data[station_name]['properties']['station_data'] = station_data_formatted
          
            //station_data[station_name]['properties']['station_data']
            //Get station_data (first element)

            
        }
        res.status(200).json(station_data)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}
