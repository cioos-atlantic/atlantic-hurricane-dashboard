import React, { useState, useMemo } from "react";
import { populateStormDetails, populateAllStormDetails } from '../lib/storm_utils';

import styles from './active_storm_list.module.css'
import { parse, format } from 'date-fns';

export const show_all_storms = "SHOW_ALL_ACTIVE_STORMS";

export default function ActiveStormList({ active_storm_data, setStormPoints }) {
  const [selected_storm, setSelectedStorm] = useState("");

  let ib_storm_list = []
  let storm_details = {}
  
  console.log("Selected Storm: " + selected_storm);
  console.debug("IBTRACS Storm List: " + active_storm_data.ib_data.features.length + " points");
  console.debug("ECCC Storm List: " + active_storm_data.eccc_data.features.length + " points");

  let active_storms = false;
  if(active_storm_data.ib_data.features.length > 0 || active_storm_data.eccc_data.features.length > 0){
    active_storms = true;
  }

  active_storm_data.ib_data.features.map(storm_point => {
    if (!ib_storm_list.includes(storm_point.properties.NAME)) {
      ib_storm_list.push(storm_point.properties.NAME)
      storm_details[storm_point.properties.NAME] = {
        source: "ibtracs", 
        year: storm_point.properties.SEASON, 
        data: []
      }
    }

    storm_details[storm_point.properties.NAME].data.push(storm_point)
  })

  return (
    <>
      <h2>Active Storms: </h2>
      <div id="storm_search_result">
        <ul className="results">
          {active_storms ? (
            <li key={"show_all_storms"} className={(selected_storm == show_all_storms ? styles.selected_storm : '')}>
              <a onClick={(e) => { populateAllStormDetails(e, storm_details, setSelectedStorm, setStormPoints) }}>Show All</a>
            </li>
          ):(
            <></>
          )}

          {ib_storm_list.map(storm_name => {
            return (
              <li key={storm_name + storm_details[storm_name].year} className={(storm_name == selected_storm ? styles.selected_storm : '')}>
                <a onClick={(e) => { populateStormDetails(e, storm_details[storm_name], setSelectedStorm, setStormPoints) }}>{storm_name}</a>
              </li>
            )
          })}
        </ul>
      </div>
    </>
  )
}