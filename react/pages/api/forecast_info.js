// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import fs from 'fs'
import path from 'path'
import { forecastDataDir } from '../../lib/storms'


export default function handler(req, res) {
    const file_types = ["pts", "err", "rad", "lin"];
    const root_path = path.dirname(req.query.path);
    const data = JSON.parse(fs.readFileSync(path.join(forecastDataDir, req.query.path)));
    
    let storm_data = {};
    file_types.forEach(ftype => {
        storm_data[ftype] = JSON.parse(fs.readFileSync(path.join(forecastDataDir, root_path, ftype + '.json')));
    })

    res.status(200).json(storm_data);
}
