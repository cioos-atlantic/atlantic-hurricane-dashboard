import { wfs_query } from "./wfs_test"

export default async function handler(req, res) {
    // (cql_filter.length > 0) ? "&cql_filter=" + cql_filter.join(";") : "";
    const storm_name = (req.query["name"]) ? req.query["name"] : "";
    const season = (req.query["season"]) ? req.query["season"] : new Date().getFullYear();
    const source = ["IBTRACS", "ECCC"];
    const source_type = "ACTIVE";

    console.log("handler", storm_name, season, source, source_type);
    
    try {
        const result = await wfs_query(storm_name, season, source, source_type);
        res.status(200).json({ "storm_name": storm_name, "season": season, "source": source, "source_type": source_type, ...result });
    } catch (err) {
        res.status(500).json({ error: 'failed to load data', obj: err });
    }
}
