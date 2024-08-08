import { wfs_query } from "./wfs_test";

export default async function handler(req, res) {
    const source = ["ERDDAP"]
    const source_type = "ACTIVE"


    console.log('test')
    try {
        console.log("handler", source, source_type);
        /*
        const result = await wfs_query(storm_name, season, source, source_type)
        res.status(200).json({ "storm_name": storm_name, "season": season, "source": source, "source_type": source_type, ...result })
        */
        const result = await wfs_query("","",source,source_type)
        res.status(200).json(result)
    } catch (err) {
        res.status(500).json({ error: 'failed to load data' })
    }
}
