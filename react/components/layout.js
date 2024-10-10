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
import { empty_storm_obj } from '../lib/storm_utils';
import dynamic from "next/dynamic";

import ErddapHandler from "../pages/api/query_stations";

export const siteTitle = 'Atlantic Hurricane Dashboard'

export const empty_station_obj = {
  pts: { features: [] }
};

export default function Layout({ children, home, topNav, logo, active_storm_data, station_data, querystring }) {

  const [storms, setStorms] = useState([]);
  const [selected_forecast, setSelectedForecast] = useState({});
  const [storm_timeline, setStormTimeline] = useState([]);
  const [storm_points, setStormPoints] = useState(empty_storm_obj);
  const [station_points, setStationPoints] = useState([empty_station_obj]);

  const active_storms = querystring.query.storms == "active";
  const historical_storms = querystring.query.storms == "historical";

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
          {
            active_storms ? (
              <ActiveStormList
                active_storm_data={active_storm_data}
                setStormPoints={setStormPoints}
              />
            ) :
            historical_storms ? (
              <>
                <div>Placeholder for Historical Storms Page</div>
              </>
            ) : (
              <>
                <div>Placeholder for Home Page</div>
              </>
            )
          }
        </Drawer>
        <MapWithNoSSR storm_data={storm_points} station_data={station_data}></MapWithNoSSR>
      </main>
      <footer>
        <FooterNav></FooterNav>
      </footer>
    </div>
  )
}
