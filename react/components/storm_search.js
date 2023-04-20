import React, { useState } from "react";
import storm_list from '../data/forecasts/list.json'

export default function StormSearch({ }) {
    const [storms, setStorms] = useState([{ "name": "BLAMMO", "year": 1999, "source": "ibtracs" }])
    console.log(storms.length)

    function updateStormList(event) {
        setStorms(storm_list.filter(storm => {
            const storm_index = storm.name + storm.year
            return (
                storm_index.toLowerCase().indexOf(event.target.value.toLowerCase()) > -1)
        }))
    }
    return (
        <>
            <div className="">
                Find Storm: <input name="storm_search" type="text" onChange={updateStormList} />
            </div>
            <div id="storm_search_result">
                <ul>
                    {storms.map(storm => {
                        return (<li key={storm.name + storm.year} className="storm_item">
                            {storm.name} ({storm.year})<br />
                            {storm.source}
                        </li>)
                    })}
                </ul>
            </div>
        </>
    )
}