// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
// import storm_list from '../../data/forecasts/list.json'

import { el } from "date-fns/locale";

// https://dev.cioosatlantic.ca/geoserver/ows?service=wfs&version=2.0.0&request=GetCapabilities

export default async function handler(req, res) {
    const storm_name = req.query["storm_name"]
    const season = req.query["season"]
    const source = req.query["source"]

    console.log(storm_name, season, source)

    try {
        const result = await wfs_query(storm_name, season, source)
        res.status(200).json({ "storm_name": storm_name, "season": season, "source": source, ...result })
      } catch (err) {
        res.status(500).json({ error: 'failed to load data' })
      }

    // res.status(200).json(result);
}

async function wfs_query(storm_name, season, source) {
    // https://dev.cioosatlantic.ca/geoserver/cioos-atlantic/ows?service=WFS&version=2.0.0&request=GetFeature&typeName=cioos-atlantic%3Aibtracs_active_storms&maxFeatures=50&outputFormat=application%2Fjson
    const base_url = "https://dev.cioosatlantic.ca/geoserver/ows?service=wfs&version=2.0.0";
    const output_format = "&outputFormat=application%2Fjson";
    let cql_filter = [];
    
    const property_list = "&propertyName=SEASON,NUMBER,BASIN,SUBBASIN,NAME,NATURE,LAT,LON,WMO_WIND,WMO_PRES,WMO_AGENCY,TRACK_TYPE,DIST2LAND,LANDFALL,IFLAG,STORM_SPEED,STORM_DIR";

    if (storm_name && storm_name.trim().toUpperCase() != ""){
        cql_filter.push("NAME='" + storm_name.trim().toUpperCase() + "'");
    }

    if (season){
        cql_filter.push("SEASON=" + season);
    }

    const final_filter = (cql_filter.length > 0) ? "&cql_filter=" + cql_filter.join(" AND ") : "";
    console.log("Final Filter: ", final_filter)
    
    const get_features_url = base_url + "&request=GetFeature&typeName=cioos-atlantic%3Aibtracs_active_storms" + output_format + final_filter + property_list;
    console.log("URL: ", get_features_url)

    const response = await fetch(get_features_url);
    const data = await response.json();

    return data;
}