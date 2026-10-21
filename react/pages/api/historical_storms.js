import { wfs_query } from "./wfs_query"

export default async function handler(req, res) {
    
    const storm_name = (req.query["name"]) ? req.query["name"] : "";
    const season = (req.query["season"]) ? req.query["season"] : "";
    const storm_id = (req.query["id"]) ? req.query["id"] : "";
    //const source = (req.query["source"]) ? req.query["source"] : "ibtracs"; // this gathers from just one source
    //const source = ["IBTRACS", "ECCC"]; // to gather both if available 
    const source = "IBTRACS"; // to gather just ibtracs 
    const min_time = (req.query["minTime"]) ? req.query["minTime"] : "";
    let filters = {};

    if (min_time !== ""){
         filters= {
            "ISO_TIME_START >=": min_time}
        }
    


    const source_type = "HISTORICAL";


    try {
        const result = await wfs_query(storm_name, season, source, source_type, storm_id, filters, "")
        res.status(200).json({ "storm_name": storm_name, "season": season, "source": source, "source_type": source_type, ...result })
    } catch (err) {
        res.status(500).json({ error: 'failed to load data' })
    }
}
