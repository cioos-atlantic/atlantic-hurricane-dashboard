// import React, { useState } from "react";
import { parse, format } from 'date-fns';

export default function StormSearch({ onSearch, onPopulateStormDetails, onPopulateTimeline, storms, selected_storm, storm_timeline }) {
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
                <a onClick={(e) => { onPopulateStormDetails(e, storm) }}>{storm.name} ({storm.year})</a>
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
        <ul>
        {
          storm_timeline &&
          storm_timeline.map(storm => {
            const key = storm.storm_date + storm.storm_time;
            const timeline = parse(''.concat(storm.storm_date, storm.storm_time, 'Z'), "yyyyMMddHHmmX", new Date());
            return (
              <li 
                key={key} 
                onMouseEnter={(e)=>{e.target.style.background = 'red'}} 
                onMouseLeave={(e)=>{e.target.style.background = ''}} 
                onClick={(e) => { onPopulateTimeline(e, storm) }}>{format(timeline, 'PP pp X')}</li>
            )
          })
        }
        </ul>
      </div>
    </>
  )
}