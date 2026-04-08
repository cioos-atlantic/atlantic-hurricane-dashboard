import React, { useState, useEffect, useMemo } from 'react';
import Layout from './layout';
import dynamic from 'next/dynamic';
import { basePath } from '@/next.config';
import { getHistoricalStormList } from '@/components/historical_storm/historical_storm_utils';
import { empty_storm_obj, empty_station_obj } from '@/components/point_defaults';
import * as storm_utils from '@/lib/storm_utils'

/* 
TODO: Add calls for recent storms (if there is no query string/filter supplied)
Pass down filtered storms and station data to map components for proper rendering
*/

export default function HistoricalStormsPage() {
  const [station_points, setStationPoints] = useState(empty_station_obj);
  const [storm_data, setStormList] = useState(empty_storm_obj);

  // useMemo() tells React to "memorize" the map component.
  // Without this, the map will get redrawn by many interactions 
  // and cause flashing - this lets us update map layers without
  // the map constant flashing with each change and click.
  const MapWithNoSSR = useMemo(
    () => (dynamic(() => import("../components/map"), {
      ssr: false
    })),
    [],
  );


  // TODO: Replace this with calls similar to active storms, fetch storm data to 
  // feed map and decouple the fetching of storm data from the 
  // getHistoricalStormList() funciton, this function can then be focused on 
  // creating the storm list from the storm data as a parameter rather than 
  // doing everything.

  // Fetch active storm data
  useEffect(() => {
    console.debug("Fetching Active Storm data...");
    fetch(`${basePath}/api/active_storms`)
      .then((res) => res.json())
      .then((active_storm_data) => {
        let storm_details = {};

        console.debug("Active Storm Data from /api/active_storms", active_storm_data);

        if (active_storm_data.ib_data?.features.length > 0 || active_storm_data.eccc_data?.features.length > 0) {

          active_storm_data.ib_data?.features.map(storm_point => {
            if (!(storm_point.properties.NAME in storm_details)) {
              storm_details[storm_point.properties.NAME] = {
                source: "ibtracs",
                year: storm_point.properties.SEASON,
                data: []
              }
            }

            storm_details[storm_point.properties.NAME].data.push(storm_point)
          })
        }
        console.debug("Storm Details from /api/active_storms", storm_details);

        const storm_points = storm_utils.build_ib_active_storm_features(storm_details);

        console.debug("Final storm points built from active storm data", storm_points);
        setStormPoints(storm_points);

        // setActiveStormLoading(false);
      })
  }, []);

  // Fetch storm data using filters or the last year (if no filters specified)
  // TODO: Add historical storm filters to this block and logic to decide when to use which list
  useEffect(() => {
    async function fetchStormData() {
      try {
        const fetchedStormList = await getHistoricalStormList();
        setStormList(fetchedStormList);
        console.debug("Fetched Historical Storm Data: ", fetchedStormList);
      } catch (error) {
        console.error('Error fetching storm list:', error);
      }
    }

    fetchStormData();  // Call the async function
  }, []); // Empty dependency array ensures it runs only once on mount

  return (
    <Layout
      page_description={"Allows the user to search for historical storms and explore the recorded weather data from coastal stations and platforms during that time period."}
      page_subtitle={"Historical Storms"}
    >
      <div className="map_container">
        <div className='inner_container'>

          <MapWithNoSSR
            station_data={station_points}
            // storm_data={storm_data}
            source_type={"historical"}
            setStationPoints={setStationPoints}
          />
        </div>
      </div>

    </Layout>
  )
}