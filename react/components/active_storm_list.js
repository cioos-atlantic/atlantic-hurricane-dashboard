import { parse, format } from 'date-fns';

export default function ActiveStormList({ active_storm_data }) {
    let ib_storm_list = []

    active_storm_data.ib_data.features.map(storm_point => {
        console.log(storm_point.properties.NAME)
        if (!ib_storm_list.includes(storm_point.properties.NAME)) {
            ib_storm_list.push(storm_point.properties.NAME)
        }
    })

    return (
        <>
            <div>Storm List Here: </div>
            {ib_storm_list.map(storm_name => {
                return (<p>{storm_name}</p>)
            })}
        </>
    )
}