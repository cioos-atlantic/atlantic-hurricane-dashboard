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
        const result = await wfs_query("","",source,source_type)
        console.log('getting features...')
        let station_recent = {}
        const features = result['erddap_data']['features']
        //console.log(result);
        for (let feature in features){
            station_recent[features[feature]['properties']['station']] = features[feature]
        }
        res.status(200).json(station_recent)
    } catch (err) {
        res.status(500).json({ error: 'failed to load data' })
    }
}