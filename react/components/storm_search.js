import React, { useState } from "react";

export default function StormSearch({ forecasts, onSearch, onPopulateStormDetails, onPopulateTimeline, storms, selected_storm, storm_timeline }) {

    return (
        <>
            <div className="">
                Find Storm: <input name="storm_search" type="text" onChange={onSearch} />
            </div>
            <div id="storm_search_result">
                <ul className="results">
                    {storms.map(storm => {
                        return (
                            <li key={storm.name + storm.year} >
                                <a onClick={(e) => {onPopulateStormDetails(e, storm)}}>{storm.name} ({storm.year})</a>
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
                        const key = storm.storm_date + storm.storm_time;
                        return (
                            <div key={ key } onClick={(e) => {onPopulateTimeline(e, storm)}}>{storm.storm_date} {storm.storm_time}</div>
                        )
                    })
                }
            </div>
        </>
    )
}