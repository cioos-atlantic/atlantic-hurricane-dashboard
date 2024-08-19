// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
// import storm_list from '../../data/forecasts/list.json'

// WFS Sources
// cioos-atlantic:eccc_storm_error_cones
// cioos-atlantic:eccc_storm_lines
// cioos-atlantic:eccc_storm_points
// cioos-atlantic:eccc_storm_wind_radii
// cioos-atlantic:erddap_cache
// cioos-atlantic:ibtracs_active_storms
// cioos-atlantic:ibtracs_historical_storms

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
        res.status(500).json({ error: 'failed to load data: ' + err })
    }
}

export async function wfs_query(storm_name, season, source, source_type) {
    // https://dev.cioosatlantic.ca/geoserver/cioos-atlantic/ows?service=WFS&version=2.0.0&request=GetFeature&typeName=cioos-atlantic%3Aibtracs_active_storms&maxFeatures=50&outputFormat=application%2Fjson
    
    /*
    How to query multiple layers simultaneously:
        - "typeName" should be used with comma delimited list of values

    https://dev.cioosatlantic.ca/geoserver/ows?service=wfs
    &version=2.0.0
    &request=GetFeature
    &typeName=cioos-atlantic:ibtracs_active_storms,cioos-atlantic:eccc_storm_error_cones,cioos-atlantic:eccc_storm_lines,cioos-atlantic:eccc_storm_points,cioos-atlantic:eccc_storm_wind_radii
    &outputFormat=application/json
    &cql_filter=(SEASON=2024);(TIMESTAMP BETWEEN 2024-01-01 AND 2024-12-31)
    */

    console.log("wfs_query", storm_name, season, source, source_type);

    // Define base URL
    const base_url = "https://dev.cioosatlantic.ca/geoserver/ows?service=wfs&version=2.0.0";

    // Define output format from WFS Request
    const output_format = "&outputFormat=application%2Fjson";
    let cql_filter = [];

    // Define list of fields to be returned
    const property_list = "&propertyName=SEASON,NUMBER,BASIN,SUBBASIN,NAME,NATURE,LAT,LON,WMO_WIND,WMO_PRES,WMO_AGENCY,TRACK_TYPE,DIST2LAND,LANDFALL,IFLAG,STORM_SPEED,STORM_DIR";
    
    let get_ibtracs = false;
    let get_eccc = false;
    let get_erddap = false;
    let wfs_sources = [];
    let responses = {};

    if (source.indexOf("IBTRACS") > -1){
        get_ibtracs = true;
    }

    if (source.indexOf("ECCC") > -1){
        get_eccc = true;
    }

    if (source.indexOf("ERDDAP") > -1){
        get_erddap = true;
    }

    // cioos-atlantic:ibtracs_active_storms
    // cioos-atlantic:ibtracs_historical_storms
    if(get_ibtracs){
        console.debug("Fetching IBTRACS active storm data...");
        let ib_filters = [];
        let ib_source = "ibtracs_active_storms";

        if (source_type !== undefined && source_type.trim().toUpperCase() != "ACTIVE") {
            ib_source = "ibtracs_historical_storms";
        }

        // Test if storm name is populated, if so add to array
        if (storm_name && storm_name.trim().toUpperCase() != "") {
            ib_filters.push("NAME='" + storm_name.trim().toUpperCase() + "'");
        }
        
        // Test if season is populated, if so add to array
        if (season) {
            ib_filters.push("SEASON=" + season);
        }
        
        const ib_features_url = build_wfs_query("cioos-atlantic:" + ib_source, ib_filters);

        console.debug("IBTRACS URL: ", ib_features_url);

        responses["ib_data"] = await fetch_wfs_data(ib_features_url);
    }

    if(get_eccc){
        console.debug("Fetching ECCC active storm data...");
        let eccc_filters = [];
        let eccc_sources = [];

        // eccc_sources.push("eccc_storm_error_cones")
        // eccc_sources.push("eccc_storm_lines")
        eccc_sources.push("eccc_storm_points")
        // eccc_sources.push("eccc_storm_wind_radii")
        
        console.debug("cioos-atlantic:" + eccc_sources.join(",cioos-atlantic:"));

        if (storm_name && storm_name.trim().toUpperCase() != "") {
            eccc_filters.push("STORMNAME='" + storm_name.trim().toUpperCase() + "'");
        }
        
        // Test if season is populated, if so add to array
        if (season) {
            eccc_filters.push("(TIMESTAMP BETWEEN " + season + "-01-01 AND " + season + "-12-31)")
        }
        
        const eccc_features_url = build_wfs_query("cioos-atlantic:" + eccc_sources.join(",cioos-atlantic:"), eccc_filters);
        
        console.debug("ECCC URL: ", eccc_features_url);

        responses["eccc_data"] = await fetch_wfs_data(eccc_features_url);
    }

    return responses;

    
    if(get_erddap){
        // cioos-atlantic:erddap_cache
        wfs_sources.push("erddap_cache")
    }
    
    console.log(cql_filter, wfs_sources.join(",cioos-atlantic:"));   

    // Build final filter if 1 or more conditions have been added to the array, join with an AND
    // Otherwise, return an empty string representing no filter
    const final_filter = (cql_filter.length > 0) ? "&cql_filter=" + cql_filter.join(";") : "";
    console.log("Final Filter: ", final_filter);

    // Build final URL
    // const get_features_url = base_url + "&request=GetFeature&typeName=cioos-atlantic%3A" + wfs_source + output_format + final_filter + property_list;
    const get_features_url = base_url + "&request=GetFeature&typeName=cioos-atlantic%3A" + wfs_sources.join(",cioos-atlantic:") + output_format + final_filter;
    console.log("URL: ", get_features_url);

    // Fetch response
    const response = await fetch(get_features_url);

    // Fetch data from response
    const data = await response.json();

    return data;
}

function build_wfs_query(source, filters, output_format="application/json", base_url="https://dev.cioosatlantic.ca/geoserver/ows?service=wfs&version=2.0.0"){
    console.debug();

    output_format = "&outputFormat=" + encodeURI(output_format);
    const final_filter = "&cql_filter=" + filters.join(" AND ");
    const url = base_url + "&request=GetFeature&typeName=" + source + output_format + final_filter;

    return url;
}

async function fetch_wfs_data(url){
    const response = await fetch(url);
    const data = await response.json();

    return data; 
}