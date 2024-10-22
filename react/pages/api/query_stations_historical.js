import { wfs_query } from "./wfs_test";

export default async function handler(req, res) {
    const source = ["ERDDAP"]
    const source_type = "HISTORICAL"
    /*const time =  (req.query["time"]) ? req.query["time"] : "";
    const lat =  (req.query["lat"]) ? req.query["lat"] : ""; // can set max atlantic region lat
    const lon =  (req.query["lon"]) ? req.query["lon"] : ""; // can set max atlantic region lat*/
    const filters= [`min_lon=${req.query["min_lon"]}`, `min_lat=${req.query["min_lat"]}`, `max_lon=${req.query["max_lon"]}`, `max_lat=${req.query["max_lat"]}`, `min_time>=${req.query["min_time"]}`, `max_time<=${req.query["max_time"]}`]

    console.log(filters)




    try {
        console.log("handler", source, source_type);
        /*
        const result = await wfs_query(storm_name, season, source, source_type)
        res.status(200).json({ "storm_name": storm_name, "season": season, "source": source, "source_type": source_type, ...result })
        */
        const result = await wfs_query("","",source,source_type, filters)
        console.log('getting features...')
        let station_recent = {}
        const features = result['erddap_data']['features']
        for (let feature in features){
            station_recent[features[feature]['properties']['station']] = features[feature]
        }
        res.status(200).json(station_recent)
    } catch (err) {
        res.status(500).json({ error: 'failed to load data' })
    }
}
