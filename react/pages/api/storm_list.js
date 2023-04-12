// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import storm_list from '../../data/forecasts/list.json'

export default function handler(req, res) {
    res.status(200).json(storm_list)
}
