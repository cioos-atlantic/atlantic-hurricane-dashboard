import React, { useState, useMemo } from "react";
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

import dynamic from "next/dynamic";
// import storm_list from '../data/forecasts/list.json'


export const siteTitle = 'Atlantic Hurricane Dashboard'

export const empty_storm_obj = {
  pts:{features:[]},
  err:{features:[]},
  lin:{features:[]},
  rad:{features:[]},
};

export default function Layout({ children, home, topNav, logo, active_storm_data, querystring }) {

  const [storms, setStorms] = useState([]);
  const [selected_storm, setSelectedStorm] = useState("");
  const [selected_forecast, setSelectedForecast] = useState({});
  const [storm_timeline, setStormTimeline] = useState([]);
  const [storm_points, setStormPoints] = useState(empty_storm_obj);
  
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

  const active_storms = querystring.query.storms == "active"

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
          ) : (
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
        <MapWithNoSSR storm_data={storm_points}></MapWithNoSSR>
      </main>
      <footer>
        <FooterNav></FooterNav>
      </footer>
    </div>
  )
}
