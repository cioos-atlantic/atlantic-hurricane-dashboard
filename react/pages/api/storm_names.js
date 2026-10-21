import { wfs_query } from "./wfs_query"

export default async function handler(req, res) {
    const storm_names = (req.query["name"]) ? req.query["name"] : "";
    const names_list = storm_names ? storm_names.split("_").filter(Boolean) : [];
    const source = "IBTRACS"; // to gather just ibtracs 



    const filters = {};  // Use an object, not an array


    if (names_list.length > 0) {

        const names_string = names_list.join("','"); 
        filters["(NAME IN "] =  "('" + names_string.trim().toUpperCase() + "'))";
        
    }
    const source_type = "HISTORICAL";
    const selected_features = '&propertyName=NAME';


    try {
        const result = await wfs_query("", "", source, source_type, "", filters, selected_features, true)
        res.status(200).json({  "source": source, "source_type": source_type, ...result })
    } catch (err) {
        res.status(500).json({ error: 'failed to load data', obj: err })
    }
}
