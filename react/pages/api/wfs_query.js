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

// import { el } from "date-fns/locale";

// https://dev.cioosatlantic.ca/geoserver/ows?service=wfs&version=2.0.0&request=GetCapabilities

export default async function handler(req, res) {
    const storm_name = req.query["storm_name"]
    const season = req.query["season"]
    const source = req.query["source"].split(",")
    const source_type = req.query["source_type"]

    console.log("handler", storm_name, season, source, source_type);

    try {
        const result = await wfs_query(storm_name, season, source, source_type, storm_id, filters, selected_features = "", storm_line_filter= false)
        res.status(200).json({ "storm_name": storm_name, "season": season, "source": source, "source_type": source_type, ...result })
    } catch (err) {
        res.status(500).json({ error: 'failed to load data: ' + err })
    }
}

export async function wfs_query(storm_name, season, source, source_type, storm_id, filters, selected_features = "", storm_line_filter= false) {
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

    let get_ibtracs = false;
    let get_eccc = false;
    let get_erddap = false;
    let wfs_sources = [];
    let responses = {};
    let workspace = process.env.NEXT_PUBLIC_GEOSERVER_WORKSPACE + ":";

    if (source.indexOf("IBTRACS") > -1) {
        get_ibtracs = true;
    }

    if (source.indexOf("ECCC") > -1) {
        get_eccc = true;
    }

    if (source.indexOf("ERDDAP") > -1) {
        get_erddap = true;
    }

    // cioos-atlantic:ibtracs_active_storms
    // cioos-atlantic:ibtracs_historical_storms
    if (get_ibtracs) {
        console.debug("Fetching IBTRACS active storm data...");
        let ib_filters = [];
        let ib_source = "ibtracs_active_storms&sortby=SID ASC, ISO_TIME ASC";

        if (source_type !== undefined && source_type.trim().toUpperCase() != "ACTIVE") {
            ib_source = "ibtracs_historical_storms&sortby=SID ASC, ISO_TIME ASC";
        }

        // Test if storm name is populated, if so add to array
        if (storm_name && storm_name.trim().toUpperCase() != "") {
            ib_filters.push("NAME='" + storm_name.trim().toUpperCase() + "'");
        }

        // Test if season is populated, if so add to array
        if (season) {
            ib_filters.push("SEASON=" + season);
        }

        if (storm_id) {
            ib_filters.push("SID='" + storm_id + "'");
        }

        if (storm_line_filter) {
            ib_source = "ibtracs_historical_storm_lines&sortby=SID ASC, ISO_TIME_START ASC"
            const filter_string = Object.entries(filters)
                .map(([key, value]) => {
                    return `${key}${value}`
                })
            ib_filters.push(...filter_string);
        }
        console.debug(ib_filters);

        let ib_features_url = '';

        if (selected_features) {
            ib_features_url = build_wfs_query(workspace + ib_source, ib_filters, source_type, selected_features);
        }
        else {
            ib_features_url = build_wfs_query(workspace + ib_source, ib_filters, source_type);

        }

        console.debug("IBTRACS URL: ", ib_features_url);

        responses["ib_data"] = await fetch_wfs_data(ib_features_url);

        

        


        if (storm_line_filter){
            responses["ib_data"].features = responses["ib_data"].features.map((storm_line) => {
                storm_line.properties.STORMNAME = storm_line.properties.NAME;
    
                return storm_line;
            });

            
        }
        else{
            responses["ib_data"].features = responses["ib_data"].features.map((storm_point) => {
                storm_point.properties.TIMESTAMP = storm_point.id.match(/\d+-\d+-\d+[\sT]\d+:\d+:\d+/)[0].replace(" ", "T");
                storm_point.properties.STORMNAME = storm_point.properties.NAME;
    
                return storm_point;
            });
        }

        

        
    }

    if (get_eccc) {
        console.debug("Fetching ECCC active storm data...");
        let eccc_filters = [];
        let eccc_sources = [];

        // eccc_sources.push("eccc_storm_error_cones")
        // eccc_sources.push("eccc_storm_lines")
        eccc_sources.push("eccc_storm_points")
        // eccc_sources.push("eccc_storm_wind_radii")

        console.debug(workspace + eccc_sources.join(",cioos-atlantic:"));

        if (storm_name && storm_name.trim().toUpperCase() != "") {
            eccc_filters.push("STORMNAME='" + storm_name.trim().toUpperCase() + "'");
        }

        // Test if season is populated, if so add to array
        if (season) {
            eccc_filters.push("(TIMESTAMP BETWEEN " + season + "-01-01 AND " + season + "-12-31)")
        }

        const eccc_features_url = build_wfs_query(workspace + eccc_sources.join(",cioos-atlantic:"), eccc_filters, source_type,);

        console.debug("ECCC URL: ", eccc_features_url);

        responses["eccc_data"] = await fetch_wfs_data(eccc_features_url);
    }

    if (get_erddap && source_type === "ACTIVE") {
        // Example: https://cioosatlantic.ca/geoserver/ows?service=wfs&version=2.0.0&request=GetFeature&typeName=erddap_active_cache&sortby=station_id&outputFormat=application/json
        console.debug("Getting ERDDAP data");
        // cioos-atlantic:erddap_cache
        wfs_sources.push("erddap_active_cache_lite");

        let erddap_source = "erddap_active_cache_lite&sortby=station_id,max_time"
        const erddap_features_url = build_wfs_query(workspace + erddap_source, [], source_type)

        console.debug("ERDDAP URL: ", erddap_features_url)
        responses["erddap_data"] = await fetch_wfs_data(erddap_features_url)
    }

    if (get_erddap && source_type === "HISTORICAL") {// edit for historical data
        let erddap_filters;
        if (!filters) {
            console.debug("Filters not provided, returning an empty array.");
            erddap_filters = [];
        }
        else {
            erddap_filters = filters;
        }

        console.debug("Getting ERDDAP data");
        // cioos-atlantic:erddap_cache
        wfs_sources.push("erddap_historical_cache");

        let erddap_source = "erddap_historical_cache&sortby=station_id,max_time"
        const erddap_features_url = build_wfs_query(workspace + erddap_source, erddap_filters, source_type)

        console.debug("ERDDAP URL: ", erddap_features_url)
        responses["erddap_data"] = await fetch_wfs_data(erddap_features_url);
    }

    return responses;
}

export async function wfs_data_query(station_id, storm){
    let responses = {};
    let workspace = process.env.NEXT_PUBLIC_GEOSERVER_WORKSPACE + ":";
    let station_data_source = ""
    let data_filters = []
    let source_type = 'ACTIVE'
    data_filters.push('station_id=%27' + station_id + '%27')
    if(storm == "ACTIVE"){
        station_data_source = "erddap_active_cache&sortby=station_id,max_time"
    }
    else{
        station_data_source = "erddap_historical_cache&sortby=station_id,max_time"
        data_filters.push('storm=%27' + storm + '%27')
    }
    const station_data_url = build_wfs_query(workspace + station_data_source, data_filters, 'station_data')
    responses['station_data'] = await fetch_wfs_data(station_data_url);
    return responses;
}

function build_wfs_query(source, filters, source_type, selected_features = "", storm_bbox = "", output_format = "application/json", base_url = process.env.NEXT_PUBLIC_GEOSERVER_BASE_URL,) {
    output_format = "&outputFormat=" + encodeURI(output_format);
    //Filter causes issues for ERDDAP cache
    console.log(filters.join(" AND "));

    const final_filter = (source.includes("erddap") && source_type === "ACTIVE") ? ("") : ("&cql_filter=" + filters.join(" AND "))
    console.log("final filter", final_filter)

    let url = '';

    if (selected_features) {
        url = base_url + "&request=GetFeature&typeName=" + source + output_format + selected_features + final_filter;
    }
    else {
        url = base_url + "&request=GetFeature&typeName=" + source + output_format + final_filter;
    }

    return url;
}


async function fetch_wfs_data(url) {
    const response = await fetch(url);
    const data = await response.json();
    return data;
}