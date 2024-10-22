import React, { useState, useMemo, useEffect } from "react";
import Head from 'next/head'
import Image from 'next/image'
import styles from './layout.module.css'
import utilStyles from '../styles/utils.module.css'
import Link from 'next/link'
import HeaderNav from './header_nav'
import FooterNav from './footer_nav'
import Drawer from '../components/drawer'
import StormSearch from "@/components/storm_search";
import ActiveStormList from "@/components/active_storm_list";
import HistoricalStormList from "./historical_storm_list";
import { useRouter } from 'next/router';


import dynamic from "next/dynamic";

// NOTE:  This data and form was used early on for 
//        testing purposes and will be removed.
//        
//        The data represented here should be swapped 
//        out in favour of data from the WFS service
import storm_list from '../data/forecasts/list.json'

import ErddapHandler from "../pages/api/query_stations";

export const siteTitle = 'Atlantic Hurricane Dashboard'

export const empty_storm_obj = {
  pts:{features:[]},
  err:{features:[]},
  lin:{features:[]},
  rad:{features:[]},
};

export const empty_station_obj = {
  pts:{features:[]}
};

export default function Layout({ children, home, topNav, logo, active_storm_data, station_data, querystring }) {

  const [storms, setStorms] = useState([]);
  const [selected_storm, setSelectedStorm] = useState("");
  const [selected_forecast, setSelectedForecast] = useState({});
  const [storm_timeline, setStormTimeline] = useState([]);
  const [storm_points, setStormPoints] = useState(empty_storm_obj);
  const [station_points, setStationPoints] = useState([empty_station_obj]);
  const [historicalStormData, setHistoricalStormData] = useState({}); // State for storing historical storm data

  const router = useRouter();

  
  // useMemo() tells React to "memorize" the map component.
  // Wthout this, the map will get redrawn by many interactions 
  // and cause flashing - this lets us update map layers without
  // the map constant flashing with each change and click.
  const MapWithNoSSR = useMemo(
    () => (dynamic(() => import("../components/map"), {
      ssr: false
    })),
    [],
  );

  <main><MapWithNoSSR station_data={station_data}></MapWithNoSSR></main>




  const DefaultMapWithNoSSR = useMemo(
    () => dynamic(() => import("../components/default_map"), { ssr: false }),
    []
  );
   // Function to handle harvested historical storm data
  function handleHarvestHistoricalData (data) {
    console.log("Harvested Historical Storm Data:", data);
    //console.log(data.ib_data.features)
    //if(data.ib_data.features){}
    setHistoricalStormData(data.storm_data);  // Set the storm data
    setStationPoints(data.station_data);  // Set the station data
     // Update the state with the harvested data
    //console.log("Historical Storm Data set:", data);
  };

  useEffect(() => {
    // Check if stormData is an empty array

    if (historicalStormData?.ib_data?.features?.length === 0) {
      console.log("Empty array, redirecting to 404...");
      // Redirect to the 404 page
      router.replace('/404'); 
      //TODO 
      // fix 404
    }
  }, [historicalStormData]);

  if (historicalStormData?.ib_data?.features?.length === 0) {
    return null;
  }


  

  // console.log(querystring.storms)
  // console.log(active_storm_data.season)

  // const data = get_forecast_sources();

  function updateStormList(event) { 
    const filtered_storms = event.target.value != "" ? storm_list.filter(storm => {
      const storm_index = storm.name + storm.year;
      return (
        storm_index.toLowerCase().indexOf(event.target.value.toLowerCase()) > -1)
    }) : [];

    setStorms(filtered_storms);
    
  }

  function populateStormDetails(event, storm_data) {
    console.log("Set Selected storm to: " + storm_data.data[0].properties.NAME);
    setSelectedStorm(storm_data.data[0].properties.NAME);

    // const filtered = forecasts.map(source => {
    //    return source.storm.filter(storm_part => storm_part.storm == storm_obj.name && storm_part.file_type == "pts") 
    // })[0];
    setStormPoints(empty_storm_obj);
    
    // console.log(storm_obj);
    let storm_features = {
      pts:{features:[]},
      err:{features:[]},
      lin:{features:[]},
      rad:{features:[]},
    };
    
    for(var i in storm_data.data){
      switch(storm_data.data[i].geometry.type){
        case "Point":
          storm_features.pts.features.push(storm_data.data[i])
          break;
        // case "LineString":
        //   break;
        // case "Polygon":
        //   break;
      }
    }
    
    setStormPoints(storm_features);
    //console.log(storm_points)
  }

  function populateTimeline(event, storm_obj) {
    // console.log(event.target.style)
    const url = `/api/forecast_info?path=${storm_obj.path}`
    setSelectedForecast(storm_obj);
    setStormPoints(empty_storm_obj);

    fetch(url).then(res => {
      if (res.ok) {
        return res.json();
      }
      throw res;
    }).then(data => {
      console.log("Storm Data: ", data);
      setStormPoints(data);
    });
  }
  console.log(querystring)
  const active_storms = querystring.query.storms == "active"
  const historical_storms = querystring.query.storms == "historical"


  return (
    <div className={styles.body}>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <meta
          name="description"
          content=""
        />
        <meta name="og:title" content={siteTitle} />
      </Head>
      <header className={styles.header}>
        <a href={logo.href}><Image src={logo.src} width={200} height={100} className='logo' alt="logo" /></a>
        {home ? (
          <>
            {/* Home Page Header Content */}
          </>
        ) : (
          <>
            {/* Other Page Header Content */}
          </>
        )}
        <HeaderNav navItems={topNav}></HeaderNav>
      </header>
      <main className="body">
        <Drawer element_id="left-side" classes="left">
          {active_storms ? (
            <ActiveStormList 
              active_storm_data={active_storm_data}
              onPopulateStormDetails={populateStormDetails}
            />
          ) : historical_storms ? ( <HistoricalStormList onHarvestData={handleHarvestHistoricalData}
          />) : (
            <StormSearch
              onSearch={updateStormList}
              onPopulateStormDetails={populateStormDetails}
              onPopulateTimeline={populateTimeline}
              active_storm_data={active_storm_data}
              storms={storms}
              selected_storm={selected_storm}
              selected_forecast={selected_forecast}
              storm_timeline={storm_timeline}
            />
          )}
        </Drawer>
        {active_storms && (
        <MapWithNoSSR storm_data={storm_points} station_data={station_data} source_type={"active"}></MapWithNoSSR>)}
        {historical_storms && (
          // Check if historicalStormData is empty
          Object.keys(historicalStormData).length === 0 ? (
            <DefaultMapWithNoSSR station_data={station_data} />
          ) : (
            <MapWithNoSSR storm_data={historicalStormData} station_data={station_points} source_type={"historical"} />
          )
        )}
      </main>
      <footer>
        <FooterNav></FooterNav>
      </footer>
    </div>
  )
}
