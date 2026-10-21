import { wfs_query } from "./wfs_query"

export default async function handler(req, res) {
    const source = "IBTRACS"; // to gather just ibtracs 

    const source_type = "HISTORICAL";
    const selected_features = '&propertyName=NAME';
    const filters = {};  // Use an object, not an array



    try {
        const result = await wfs_query("", "", source, source_type, "", filters, selected_features, true)
        res.status(200).json({  "source": source, "source_type": source_type, ...result })
    } catch (err) {
        res.status(500).json({ error: 'failed to load data', obj: err })
    }
}