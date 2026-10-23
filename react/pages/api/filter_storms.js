import { wfs_query } from "./wfs_query"

// Every value below goes straight into the CQL filter, so only accept the formats the filter UI sends
// formatFilterDate sends YYYY-MM-DD; the recent storms list (getHistoricalStormList) sends YYYY-MM-DDTHH:MM:SSZ
const DATE_PATTERN = /^(\d{4}-\d{2}-\d{2})(T\d{2}:\d{2}:\d{2}Z)?$/;
const INTEGER_PATTERN = /^\d+$/; // wind speeds (knots)
const NUMBER = "-?\\d+(\\.\\d+)?";
const POLYGON_POINT_PATTERN = new RegExp(`^${NUMBER} ${NUMBER}$`); // processPolygon: "lat lng" pairs joined by ","

function isValidDate(value) {
    const match = DATE_PATTERN.exec(value);
    if (!match) return false;
    const day = match[1];
    const date = new Date(`${day}T00:00:00Z`);
    return !isNaN(date) && date.toISOString().startsWith(day) && !isNaN(new Date(value)); // rejects e.g. 2020-02-31, 25:00:00
}

function isValidPolygon(value) {
    const points = value.split(",");
    return points.length >= 4 && points.every((point) => POLYGON_POINT_PATTERN.test(point)); // closed ring: 3 corners + first again
}

// CQL string literal: a single quote is escaped by doubling it
const escapeCql = (value) => value.replace(/'/g, "''");

export default async function handler(req, res) {

    const storm_category = (req.query["storm_category"]) ? req.query["storm_category"] : "";
    //const storm_bbox = (req.query["bbox"]) ? req.query["bbox"] : "";
    const storm_poly = (req.query["polygon"]) ? req.query["polygon"] : "";
    const storm_names = (req.query["name"]) ? req.query["name"] : "";
    const start_date = (req.query["start_date"]) ? req.query["start_date"] : "";
    const end_date = (req.query["end_date"]) ? req.query["end_date"] : "";
    const start_category = (req.query["start_category"]) ? req.query["start_category"] : "";
    const end_category = (req.query["end_category"]) ? req.query["end_category"] : "";
    
    const source = "IBTRACS"; // to gather just ibtracs 
    const category_list = storm_category ? storm_category.split("_").filter(Boolean) : [];
    const names_list = storm_names ? storm_names.split("_").filter(Boolean) : [];

    const invalid_params = [];
    if (start_date !== "" && !isValidDate(start_date)) invalid_params.push("start_date");
    if (end_date !== "" && !isValidDate(end_date)) invalid_params.push("end_date");
    if (start_category !== "" && !INTEGER_PATTERN.test(start_category)) invalid_params.push("start_category");
    if (end_category !== "" && !INTEGER_PATTERN.test(end_category)) invalid_params.push("end_category");
    if (!category_list.every((category) => INTEGER_PATTERN.test(category))) invalid_params.push("storm_category");
    if (storm_poly !== "" && !isValidPolygon(storm_poly)) invalid_params.push("polygon");

    if (invalid_params.length > 0) {
        return res.status(400).json({ error: `invalid filter value: ${invalid_params.join(", ")}` });
    }


    const filters = {};  // Use an object, not an array

    // Each date is optional: start only = storms from that date on, end only = storms up to that date
    if (start_date !== "") {
        filters["(ISO_TIME_START >= "] = `'${start_date}')`;
    }
    if (end_date !== "") {
        filters["(ISO_TIME_END <= "] = `'${end_date}')`;
    }

    /*if (start_category !== "" && end_category !== "") {
        filters["(USA_SSHS_MIN >= "] = `'${start_category}' AND USA_SSHS_MAX <= '${end_category}')`};*/

    if (start_category !== "" && end_category !== "") {
        filters["(WMO_WIND_MAX BETWEEN "] = `'${start_category}' AND '${end_category}')`};
    

    if (category_list.length > 0) {
        const category_string = category_list.join(", "); 
        //filters["(USA_SSHS IN ("] = category_string + "))";
        filters["(WMO_WIND_MIN IN ("] = category_string + ") OR WMO_WIND_MAX IN (" + category_string + "))" ;
    }
    


    if (names_list.length > 0) {

        const names_string = names_list.map((name) => escapeCql(name.trim().toUpperCase())).join("','");
        filters["(NAME IN "] =  "('" + names_string + "'))";
        
    }

    /*if(storm_bbox !==""){
        const storm_bbox_list = storm_bbox.split("_")
        filters["(LAT BETWEEN "] = `${storm_bbox_list[0]} AND ${storm_bbox_list[2]})`;
        filters["(LON BETWEEN "] = `${storm_bbox_list[1]} AND ${storm_bbox_list[3]})`;
    }*/
    if(storm_poly !==""){
        
        filters["INTERSECTS(geom_storm_line, POLYGON(("] = `${storm_poly})))`;
        
    }



    const source_type = "HISTORICAL";
    const selected_features = '&propertyName=SID,NAME,SEASON,geom_storm_line';


    try {
        const result = await wfs_query("", "", source, source_type, "", filters, selected_features, true)
        res.status(200).json({  "source": source, "source_type": source_type, ...result })
    } catch (err) {
        res.status(500).json({ error: 'failed to load data', obj: err })
    }
}
