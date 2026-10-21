import React, { useState, useEffect } from "react";
import { basePath } from "@/next.config";
import { populateAllStormDetails } from '../lib/storm_utils';
import StormListItem from "./storm_list_item";
// import { parse, format } from 'date-fns';
import LoadingScreen from "./loading_screen";

export const show_all_storms = "SHOW_ALL_ACTIVE_STORMS";

// export async function fetchAllDatasets() {
//   const erddapUrl = "https://cioosatlantic.ca/erddap/tabledap/allDatasets.json?datasetID,title";
// 
//   try {
//     // Fetch the data from the ERDDAP server
//     const response = await fetch(erddapUrl);
// 
//     if (!response.ok) {
//       throw new Error(`HTTP error! Status: ${response.status}`);
//     }
//     // Parse the response as JSON
//     const data = await response.json();
//     return data;
//   }
//   catch(err){
//     return({});
//   }
// }


/**
 * The ActiveStormList function displays a list of active storms with details and allows users to
 * select and view storm data.
 * @returns The `ActiveStormList` component is returning JSX elements that display a list of active
 * storms. It includes a heading "Active Storms", a list of storm search results, and a list of storm
 * items with details for each storm. The component also conditionally renders a "Show All" link if
 * there are active storms available.
 */
export default function ActiveStormList({ setStormPoints, map, Leaflet, setSelectedStation }) {
  const [selected_storm, setSelectedStorm] = useState("");

  const [active_storm_data, setActiveStormData] = useState(null)
  const [active_station_data, setActiveStationData] = useState(null)
  const [is_loading_storm, setActiveStormLoading] = useState(true)
  const [is_loading_station, setActiveStationLoading] = useState(true)
  const [pageLoading, setPageLoading] = useState(false);

  // Fetch active storm data
  useEffect(() => {
    fetch(`${basePath}/api/active_storms`)
      .then((res) => res.json())
      .then((data) => {
        setActiveStormData(data);
        setActiveStormLoading(false);
      })
  }, []);

  // Fetch active station data
  useEffect(() => {
    fetch(`${basePath}/api/query_stations`)
      .then((res) => res.json())
      .then((data) => {
        setActiveStationData(data);
        setActiveStationLoading(false);
      })
  }, []);

  let ib_storm_list = []
  let storm_details = {}

  let active_storms = false;


  if (!is_loading_storm) {

    if (active_storm_data.ib_data?.features.length > 0 || active_storm_data.eccc_data?.features.length > 0) {
      active_storms = true;

      active_storm_data.ib_data?.features.map(storm_point => {
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
    }
  }

  return (
     <div className="active-drawer">
        {pageLoading ? (
            <LoadingScreen/>
            ) : (
              <>
                <h2>Active Storms: </h2>
                <div id="storm_search_result" className="storm_search_result"
                >
                  <ul className="results">
                    {active_storms ? (
                      <li key={"show_all_storms"} >
                        <a onClick={(e) => { setPageLoading(true);
                          populateAllStormDetails(e, storm_details, setSelectedStorm, setStormPoints); setPageLoading(false);}}>Show All</a>
                      </li>
                    ) : (
                      <p>No data exists for active storms right now</p>
                    )}
                  </ul>

                  <div>
                    {ib_storm_list.map(storm_name => {
                      return (
                        <StormListItem
                          key={storm_name + storm_details[storm_name].year}
                          storm_name={storm_name}
                          storm_data={storm_details[storm_name]}
                          setSelectedStorm={setSelectedStorm}
                          setStormPoints={setStormPoints}
                          is_selected={(storm_name == selected_storm)}
                          map={map}
                          Leaflet={Leaflet}
                          setSelectedStation={setSelectedStation}
                        />
                      )
                    })}
                  </div>
                </div>
              </>
          )}
    </div>
  )
}