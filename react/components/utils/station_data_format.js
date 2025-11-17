//Takes from ['erddap_data]['features']
//Filter_station can be provided if you have the full feature data,
//but only want one station
export default function station_data_format(features, filter_station) {
    try {
        let station_data = {}
        const re_match = /(?<var_name>.*)\s\((?<standard_name>.*)\|(?<units>.*)\|(?<long_name>.*)\)/g; 
        for (let feature in features){
            const station_name = features[feature]['properties']['station']
            const station_id = features[feature]['properties']['station_id']
            // Can change the WFS query to only get one station, but for now easier to filter out here
            if(!filter_station || filter_station==station_id){
                const parsed_data = JSON.parse(features[feature]['properties']['station_data']);
                if(station_data[station_name]) {
                    //Theory that data is already sorted, but perhaps not so - it's not - all alphabetical
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
        return station_data
    } catch (err) {
        console.log("Error reformatting data")
        return err
    }
}