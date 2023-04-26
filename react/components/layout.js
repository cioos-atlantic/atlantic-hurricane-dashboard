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

import dynamic from "next/dynamic";
import storm_list from '../data/forecasts/list.json'


export const siteTitle = 'Atlantic Hurricane Dashboard'

export default function Layout({ children, home, topNav, logo, forecasts }) {
  const empty_storm_obj = {
    pts:{features:[]},
    err:{features:[]},
    lin:{features:[]},
    rad:{features:[]},
  };

  const [storms, setStorms] = useState([]);
  const [selected_storm, setSelectedStorm] = useState({});
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

  console.log(forecasts[0].storm[0])

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

  function populateTimeline(event, storm_obj) {
    console.log(event, storm_obj)
    const url = `/api/forecast_info?path=${storm_obj.path}`
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
          <StormSearch
            onSearch={updateStormList}
            onPopulateStormDetails={populateStormDetails}
            onPopulateTimeline={populateTimeline}
            forecasts={forecasts}
            storms={storms}
            selected_storm={selected_storm}
            storm_timeline={storm_timeline}
          />
        </Drawer>
        <MapWithNoSSR storm_data={storm_points}></MapWithNoSSR>
      </main>
      <footer>
        <FooterNav></FooterNav>
      </footer>
    </div>
  )
}
