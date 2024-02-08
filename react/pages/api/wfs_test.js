// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
// import storm_list from '../../data/forecasts/list.json'

import { el } from "date-fns/locale";

// https://dev.cioosatlantic.ca/geoserver/ows?service=wfs&version=2.0.0&request=GetCapabilities

export default async function handler(req, res) {
    const storm_name = req.query["storm_name"]
    const season = req.query["season"]
    const source = req.query["source"].split(",")
    const source_type = req.query["source_type"]

    console.log("handler", storm_name, season, source, source_type);

    try {
        const result = await wfs_query(storm_name, season, source, source_type)
        res.status(200).json({ "storm_name": storm_name, "season": season, "source": source, "source_type": source_type, ...result })
    } catch (err) {
        res.status(500).json({ error: 'failed to load data' })
    }
}

async function wfs_query(storm_name, season, source, source_type) {
    // https://dev.cioosatlantic.ca/geoserver/cioos-atlantic/ows?service=WFS&version=2.0.0&request=GetFeature&typeName=cioos-atlantic%3Aibtracs_active_storms&maxFeatures=50&outputFormat=application%2Fjson
    
    console.log("wfs_query", storm_name, season, source, source_type);

    // Define base URL
    const base_url = "https://dev.cioosatlantic.ca/geoserver/ows?service=wfs&version=2.0.0";

    // Define output format from WFS Request
    const output_format = "&outputFormat=application%2Fjson";
    let cql_filter = [];

    // Define list of fields to be returned
    const property_list = "&propertyName=SEASON,NUMBER,BASIN,SUBBASIN,NAME,NATURE,LAT,LON,WMO_WIND,WMO_PRES,WMO_AGENCY,TRACK_TYPE,DIST2LAND,LANDFALL,IFLAG,STORM_SPEED,STORM_DIR";

    // Test if storm name is populated, if so add to array
    if (storm_name && storm_name.trim().toUpperCase() != "") {
        cql_filter.push("NAME='" + storm_name.trim().toUpperCase() + "'");
    }
    
    // Test if season is populated, if so add to array
    if (season) {
        cql_filter.push("SEASON=" + season);
    }
    
    let get_ibtracs = false;
    let get_eccc = false;
    let get_erddap = false;
    
    if (source.indexOf("IBTRACS") > -1){
        get_ibtracs = true;
    }

    if (source.indexOf("ECCC") > -1){
        get_eccc = true;
    }

    if (source.indexOf("ERDDAP") > -1){
        get_erddap = true;
    }
    


    let wfs_source = "ibtracs_historical_storms";
    if (source_type !== undefined && source_type.trim().toUpperCase() == "ACTIVE") {
        wfs_source = "ibtracs_active_storms";
    }
    console.log(cql_filter, wfs_source);

    // Build final filter if 1 or more conditions have been added to the array, join with an AND
    // Otherwise, return an empty string representing no filter
    const final_filter = (cql_filter.length > 0) ? "&cql_filter=" + cql_filter.join(" AND ") : "";
    console.log("Final Filter: ", final_filter);

    // Build final URL
    const get_features_url = base_url + "&request=GetFeature&typeName=cioos-atlantic%3A" + wfs_source + output_format + final_filter + property_list;
    console.log("URL: ", get_features_url);

    // Fetch response
    const response = await fetch(get_features_url);

    // Fetch data from response
    const data = await response.json();

    return data;
}