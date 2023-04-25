// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { getAllStormData } from '../../lib/storms'

export default function handler(req, res) {
    res.status(200).json({ storm_data: getAllStormData() })
}
