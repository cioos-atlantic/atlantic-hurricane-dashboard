//Takes from ['erddap_data]['features']
//Initializes the data into a format the OSV can use
//Run when collecting the stations
export default function station_data_init(features, filter_station, skip_data=true) {
    try {
        let station_data = {}
        for (let feature in features){
            const station_name = features[feature]['properties']['station']
            // Can change the WFS query to only get one station, but for now easier to filter out here
            if(!filter_station || filter_station==station_name){
                if(station_data[station_name]) {
                    //Theory that data is already sorted, but perhaps not so - it's not - all alphabetical
                    station_data[station_name]['properties']['max_time'] = features[feature]['properties']['max_time']
                }
                else {
                    station_data[station_name] = features[feature];
                }
            }
        }
        return station_data
    } catch (err) {
        console.log("Error reformatting data")
        return err
    }
}