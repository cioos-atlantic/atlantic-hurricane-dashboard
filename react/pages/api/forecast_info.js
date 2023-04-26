// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import fs from 'fs'
import path from 'path'
import { forecastDataDir } from '../../lib/storms'


export default function handler(req, res) {
    const data = JSON.parse(fs.readFileSync(path.join(forecastDataDir, req.query.path)))
    // console.log(req, res)
    res.status(200).json({ storm_data: data })
}
