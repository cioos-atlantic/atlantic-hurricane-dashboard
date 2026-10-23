import { wfs_query } from "./wfs_query";
import station_data_format from "@/components/utils/station_data_format";
import station_data_init from "@/components/utils/station_data_init";

export default async function handler(req, res) {
  const station = req.query["station"]
  const source = ["ERDDAP"]
  const source_type = "HISTORICAL"
  const storm_name = (req.query["name"]) ? req.query["name"] : "";
  const season = (req.query["season"]) ? req.query["season"] : "";
  /*Commented out as these are being filtered by data ingest instead of during API call
  const time =  (req.query["time"]) ? req.query["time"] : "";
  const lat =  (req.query["lat"]) ? req.query["lat"] : ""; // can set max atlantic region lat
  const lon =  (req.query["lon"]) ? req.query["lon"] : ""; // can set max atlantic region lat*/
  //const filters= [`min_lon>=${req.query["min_lon"]}`, `min_lat>=${req.query["min_lat"]}`, `max_lon<=${req.query["max_lon"]}`, `max_lat<=${req.query["max_lat"]}`, `min_time>=${req.query["min_time"]}`, `max_time<=${req.query["max_time"]}`]
  const filters = [`storm='${season}_${storm_name}'`]
  //const filters= [ `min_time BETWEEN ${req.query["min_time"]}`, `${req.query["max_time"]}`]

  console.debug("query_stations_historical.js -> filters: ", filters);

  try {
    //console.debug("query_stations_historical.js -> source & type", source, source_type);
    /*
    const result = await wfs_query(storm_name, season, source, source_type)
    res.status(200).json({ "storm_name": storm_name, "season": season, "source": source, "source_type": source_type, ...result })
    */
    const result = await wfs_query("", "", source, source_type, "", filters)
    const features = result['erddap_data']['features']
    const station_data = station_data_init(features, station)

    //const station_recent = station_data_format(result['erddap_data']['features'], station)//parseStationData(result, station)
    //console.log('HR')
    res.status(200).json(station_data)
  } catch (err) {
    res.status(500).json({ error: err.message}) //
  }
}

// Unused
function parseStationData(result, station) {
  if (Object.keys(result).length === 0) {
    return {}
  };
  let station_data = {};
  const features = result['erddap_data']['features'];
  

  const re_match = /(?<var_name>.*)\s\((?<standard_name>.*)\|(?<units>.*)\|(?<long_name>.*)\)/g;
  for (let feature in features) {
    const station_name = features[feature]['properties']['station'];

    // Can change the WFS query to only get one station, but for now easier to filter out here
    const parsed_data = (!station || station === station_name) && JSON.parse(features[feature]['properties']['station_data']);

    if (parsed_data && parsed_data.length !== 0) {
      // incase there is no data, just skip to the next feature

      //const parsed_data = JSON.parse(features[feature]['properties']['station_data']);

      //if (parsed_data.length !== 0){
        if (station_data[station_name]) {
          station_data[station_name]['properties']['max_time'] = features[feature]['properties']['max_time']
        }
        else {
          station_data[station_name] = features[feature];
          let station_data_formatted = {
            'column_names': [],
            'column_units': [],
            'column_std_names': [],
            'column_long_names': [],
            'column_raw_names': [],
            'rows': []
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
            };
          });
          station_data[station_name]['properties']['station_data'] = station_data_formatted;
        };
        const station_column_data = station_data[station_name]['properties']['station_data']['column_raw_names'];
        parsed_data.forEach((row) => {
          let row_data = []
          station_column_data.forEach((column) => {
            row_data.push(row[column])
          });
          station_data[station_name]['properties']['station_data']['rows'].push(row_data);
        });
      }
      else{
        continue
      }
    
    //};
  };
  return station_data
}

