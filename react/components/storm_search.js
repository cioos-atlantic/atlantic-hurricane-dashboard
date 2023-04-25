import React, { useState } from "react";
import storm_list from '../data/forecasts/list.json'

export default function StormSearch({ forecasts }) {
    const [storms, setStorms] = useState([]);
    const [selected_storm, setSelectedStorm] = useState({});
    const [storm_timeline, setStormTimeline] = useState([]);
    const [storm_points, setStormPoints] = useState([]);
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
        const filtered = forecasts.map(source => { return source.storm.filter(storm_part => storm_part.storm == storm_obj.name && storm_part.file_type == "pts") })[0];
        console.log(filtered[0]);
        setStormTimeline(filtered);
    }


    function getStormInfo(event, storm_obj){
        console.log(event, storm_obj)
        const url = `/api/forecast_info?path=${storm_obj.path}`
        fetch(url).then(res => {
            if(res.ok){
                return res.json();
            }
            throw res;
        }).then(data => {
            console.log(data);
            setStormPoints(data);
        });
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
                {
                    // storm_timeline &&
                    storm_timeline.map(storm => {
                        return (
                            <div onClick={(e) => { getStormInfo(e, storm) }}>{storm.storm_date} {storm.storm_time}</div>
                        )
                    })
                }
            </div>
        </>
    )
}