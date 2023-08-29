// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
// import storm_list from '../../data/forecasts/list.json'

// https://dev.cioosatlantic.ca/geoserver/ows?service=wfs&version=2.0.0&request=GetCapabilities

export default async function handler(req, res) {
    const {storm_name, year, source} = req.query

    try {
        const result = await wfs_query(storm_name, year, source)
        res.status(200).json({ "storm_name": storm_name, "year": year, "source": source, ...result })
      } catch (err) {
        res.status(500).json({ error: 'failed to load data' })
      }

    // res.status(200).json(result);
}

async function wfs_query(storm_name, year, source) {
    // https://dev.cioosatlantic.ca/geoserver/cioos-atlantic/ows?service=WFS&version=2.0.0&request=GetFeature&typeName=cioos-atlantic%3Aibtracs_active_storms&maxFeatures=50&outputFormat=application%2Fjson
    const base_url = "https://dev.cioosatlantic.ca/geoserver/ows?service=wfs&version=2.0.0";
    const output_format = "&outputFormat=application%2Fjson";
    const cql_filter = "&cql_filter=NAME='" + storm_name + "'&YEAR=" + year + "";
    const get_features_url = base_url + "&request=GetFeature&typeName=cioos-atlantic%3Aibtracs_active_storms" + output_format + cql_filter;
    const response = await fetch(get_features_url);
    const data = await response.json();
    return data;
}