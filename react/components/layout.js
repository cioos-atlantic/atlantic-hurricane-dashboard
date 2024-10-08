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

// NOTE:  This data and form was used early on for 
//        testing purposes and will be removed.
//        
//        The data represented here should be swapped 
//        out in favour of data from the WFS service
import storm_list from '../data/forecasts/list.json'

import ErddapHandler from "../pages/api/query_stations";

import * as geolib from 'geolib';

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

    console.debug("Printing out storm properties");
    console.debug(storm_data);

    storm_data.data.forEach((storm_pt, idx) => {
      console.debug("Storm Point: ", idx, storm_pt);

      for(let field in storm_pt.properties){
        // Dropping null fields 
        if(!storm_pt.properties[field]){
          delete storm_data.data[idx].properties[field];
        }
        // Calculating wind radius points based on wind speed radii quadrant distances
        else{
          let wind_spd_rad_dir = field.match(/^\w+R(?<speed>\d+)\w+(?<direction>NE|SE|NW|SW)$/);

          if(wind_spd_rad_dir){
            console.debug(field, storm_pt.properties[field], wind_spd_rad_dir);

            // let radius_m = geolib.convertDistance(storm_pt.properties[field], 'sm');
            let radius_m = storm_pt.properties[field] * 1852.216;
            console.debug(`Converted Radius: ${storm_pt.properties[field]}NM to ${radius_m}m `);

            let rad_dir_1 = undefined, 
                rad_dir_2 = undefined;

            switch(wind_spd_rad_dir.groups["direction"]){
              case "NE":
                rad_dir_1 = 0;
                rad_dir_2 = 90;
                break;

              case "SE":
                rad_dir_1 = 90;
                rad_dir_2 = 180;
                break;
              case "SW":
                rad_dir_1 = 180;
                rad_dir_2 = 270;
                break;
              case "NW":
                rad_dir_1 = 270;
                rad_dir_2 = 0;
                break;
            }

            let dest_point_1 = geolib.computeDestinationPoint(
              // { latitude: 52.518611, longitude: 13.408056 },
              storm_pt.geometry.coordinates,
              radius_m,
              rad_dir_1
            );

            let dest_point_2 = geolib.computeDestinationPoint(
              // { latitude: 52.518611, longitude: 13.408056 },
              storm_pt.geometry.coordinates,
              radius_m,
              rad_dir_2
            );
            console.debug(`Original Coordinates: ${storm_pt.geometry.coordinates}`)
            console.debug(`New Destination Points for Wind Radii in quadrant ${wind_spd_rad_dir.groups["direction"]} at ${wind_spd_rad_dir.groups["speed"]} knots`, dest_point_1, dest_point_2)
          }
        }
      }
    });


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
              selected_storm={selected_storm}
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
        <MapWithNoSSR storm_data={storm_points} station_data={station_data}></MapWithNoSSR>
      </main>
      <footer>
        <FooterNav></FooterNav>
      </footer>
    </div>
  )
}
