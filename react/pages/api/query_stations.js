
export default async function handler(req, res) {
    const storm_name = req.query["storm_name"]
    const season = req.query["season"]
    const source = req.query["source"]
    const source_type = req.query["source_type"]

    console.log("handler", storm_name, season, source, source_type);

    try {
        const result = await wfs_query(storm_name, season, source, source_type)
        res.status(200).json({ "storm_name": storm_name, "season": season, "source": source, "source_type": source_type, ...result })
    } catch (err) {
        res.status(500).json({ error: 'failed to load data' })
    }
}
