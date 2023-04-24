import React, { useState } from "react";
import storm_list from '../data/forecasts/list.json'

export default function StormSearch({ }) {
    const [storms, setStorms] = useState([]);
    const [selected_storm, setSelectedStorm] = useState({});
    // const data = get_forecast_sources();

    function updateStormList(event) {
        const filtered_storms = event.target.value != "" ? storm_list.filter(storm => {
            const storm_index = storm.name + storm.year;
            return (
                storm_index.toLowerCase().indexOf(event.target.value.toLowerCase()) > -1)
        }) : [];

        setStorms(filtered_storms);
    }

    function populateStormDetails(event, storm_obj) {
        console.log(event, storm_obj);
        setSelectedStorm(storm_obj);
    }

    return (
        <>
            <div className="">
                Find Storm: <input name="storm_search" type="text" onChange={updateStormList} />
            </div>
            <div id="storm_search_result">
                <ul className="results">
                    {storms.map(storm => {
                        return (
                            <li key={storm.name + storm.year} >
                                <a onClick={(e) => { populateStormDetails(e, storm) }}>{storm.name} ({storm.year})</a>
                            </li>
                        );
                    })}
                </ul>
            </div>
            <hr />
            <div id="storm_details">
                {
                    selected_storm &&
                    <p>{selected_storm.name} ({selected_storm.year}) - Source: {selected_storm.source}</p>
                }
            </div>
            <div id="storm_timeline">

            </div>
        </>
    )
}