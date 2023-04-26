// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import fs from 'fs'
import path from 'path'
import { forecastDataDir } from '../../lib/storms'


export default function handler(req, res) {
    const file_types = ["pts", "err", "rad", "lin"]
    // console.log("Path Basename: ", path.dirname(req.query.path))
    const root_path = path.dirname(req.query.path);
    const data = JSON.parse(fs.readFileSync(path.join(forecastDataDir, req.query.path)));
    let storm_data = {};
    file_types.forEach(ftype => {
        // console.log(path.join(forecastDataDir, root_path, ftype + '.json'));
        storm_data[ftype] = JSON.parse(fs.readFileSync(path.join(forecastDataDir, root_path, ftype + '.json')))
    })
    console.log(storm_data);
    // console.log(req, res)
    res.status(200).json(storm_data);
}
