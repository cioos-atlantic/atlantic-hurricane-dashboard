// import React, { useState } from "react";
import { parse, format } from 'date-fns';

export default function StormSearch({ onSearch, onPopulateStormDetails, onPopulateTimeline, storms, selected_storm, selected_forecast, storm_timeline }) {
  const timeline_day_flags = new Set();
  let timeline_days = [];
  storm_timeline.map(forecast => {
    if (!timeline_day_flags.has(forecast.storm_date)) {
      timeline_day_flags.add(forecast.storm_date);
      timeline_days.push(forecast.storm_date);
    }
  });

  console.log("Unique Days in Forecast", timeline_days);

  return (
    <>
      <div>
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
        {
          timeline_days.length > 0 &&
          <h4>Forecasts (Newest First)</h4>
        }
        {
          timeline_days.map(date => {
            let formatted_date = format(parse(date,'yyyyMMdd', new Date()), 'PP');
            
            const times = storm_timeline.map(storm => {
              if (storm.storm_date == date) {
                const item_class = (selected_forecast.path == storm.path) ? 'selected' : '';
                const key = storm.storm_date + storm.storm_time;
                const forecast_dt = parse(''.concat(storm.storm_date, storm.storm_time, 'Z'), "yyyyMMddHHmmX", new Date());

                return (
                  <li
                    key={key}
                    onClick={(e) => { onPopulateTimeline(e, storm) }}
                    className={item_class}
                  >{format(forecast_dt, 'HH:mm X')} ({storm.storm_time} UTC)</li>
                );
              }
            });
            
            return (
                <ul key={date + "_parent_list"}>
                  <li key={date}>
                    {formatted_date}
                    <ul key={date + "_sub_list"}>
                      {times}
                    </ul>
                  </li>
                </ul>
            );
          })
        }
      </div>
    </>
  )
}