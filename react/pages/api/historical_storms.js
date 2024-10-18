import { wfs_query } from "./wfs_test"

export default async function handler(req, res) {
    
    const storm_name = (req.query["name"]) ? req.query["name"] : "";
    const season = (req.query["season"]) ? req.query["season"] : new Date().getFullYear();
    const source = (req.query["source"]) ? req.query["source"] : "ibtracs";;
    const source_type = "HISTORICAL";

    console.log("handler", storm_name, season, source, source_type);

    try {
        console.log(req)
        const result = await wfs_query(storm_name, season, source, source_type)
        res.status(200).json({ "storm_name": storm_name, "season": season, "source": source, "source_type": source_type, ...result })
    } catch (err) {
        res.status(500).json({ error: 'failed to load data' })
    }
}
