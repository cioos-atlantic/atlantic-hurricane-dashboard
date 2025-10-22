// Return station data given a station ID
import { wfs_data_query } from "./wfs_query";
import station_data_format from "@/components/utils/station_data_format";

export default async function handler(req, res) {
    const filter_station = req.query["station_id"]
    const filter_storm = req.query["storm"]
    let result = ""
    let features = []

    try {
        result = await wfs_data_query(filter_station,filter_storm)
        features = result['erddap_data']['features']
        const station_data = station_data_format(features, filter_station)
        res.status(200).json('hello')
        console.log(station_data)
    } catch (err) {
        res.status(200).json({ result })
    }
}