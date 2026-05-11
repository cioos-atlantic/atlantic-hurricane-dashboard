import React, { useState, useMemo, useEffect } from "react";
import Head from 'next/head'
import Image from 'next/image'
import styles from './layout.module.css'
import FooterNav from './footer_nav'
import { useRouter } from 'next/router';
import dynamic from "next/dynamic";
import About from "@/pages/about_page";
import Grid from '@mui/material/Grid2';
import { Box } from "@mui/material";
import HeaderNav from "./header_nav";
import { loadSpace } from "@usersnap/browser";
import { TourProvider } from "@reactour/tour";
import { getTourSteps } from "./Tour/tourSteps";


import { basePath } from "@/next.config";

export const siteTitle = 'Atlantic Hurricane Dashboard'

/**
 * The Layout function in JavaScript sets up a webpage layout with header, main content, and footer,
 * displaying different content based on query parameters.
 * @returns The `Layout` component is being returned. It includes the structure of the webpage with a
 * header, main content area (which may include a map component based on the conditions), and a footer.
 * The content and components rendered within the `Layout` component depend on the values of `home`,
 * `topNav`, `logo`, `active_storm_data`, `station_data`, and `querystring`
 */
export default function Layout({ children, home, topNav, logo, querystring }) {
  
  const [station_points, setStationPoints] = useState({});
  const [sourceType, setSourceType] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  const router = useRouter();
  const routerReady = router?.isReady;

  const spaceKey = 'dbba29d9-e060-4d56-8a09-923ef07e516d'
  // Will need to find some better way to store as secret

  useEffect(() => {
    loadSpace(spaceKey).then((api) => {
      api.init()
    })
  })
  

  useEffect(() => {
    setIsMounted(true);
  }, []);


  

  const mode = router?.query?.storms;


  const isActive = mode === "active";
  const isHistorical = mode === "historical";
  const isAbout = mode === "hurricanes";

  const isTourReady =
    routerReady;

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

  
  useEffect(() => {
    if (isActive) {
      setSourceType("active");
      fetch(`${basePath}/api/query_stations`)
        .then((res) => res.json())
        .then((data) => {
          setStationPoints(data);
        })
    };
    if (isHistorical)
      { setSourceType("historical")
        
      };
  }, [isActive, isHistorical]);


 
    
  
 
    
  const steps = useMemo(() => {

    return getTourSteps({
      isActive,
      isHistorical,
    });
  }, [ isActive, isHistorical]);
  

  return (
    <div className={styles.body}>
      <Head>
        <link rel="icon" href={`${basePath}/favicon.ico`} />
        <meta
          name="description"
          content=""
        />
        <meta name="og:title" content={siteTitle} />
      </Head>
      <header className={styles.header}>
        <Grid container alignItems="center" spacing={1}  
        sx={{ justifyContent: 'space-between', flexWrap: 'nowrap',  maxHeight: { xs: '80px', sm: '100px', md: '120px', lg: '140px' }, // Responsive max height for the header 
        //maxWidth: '50%'
        }}
        >
          {/* Logo Section */}
          <Grid size ='auto' 
                sx={{maxWidth: '50%'}} >
          
              <a href={logo.href}>
                <Image
                  src={logo.src}
                  width={200}
                  height={100}
                  className="logo" // Preserving your existing class for the logo
                  alt="logo"
                  
                />
              </a>
            
          </Grid>
          

          {/* Content Section */}
          <Grid size ='auto' >
          
            {home ? (
              <>
                {/* Home Page Header Content */}
              </>
            ) : (
              <>
                {/* Other Page Header Content */}
              </>
            )}

          </Grid>
          

          {/* Navigation Section */}
          <Grid size ='auto'
            sx={{
              maxWidth: '100%', // Ensures responsiveness
              overflow: 'visible', // 
              //display: 'flex',
              //justifyContent: 'flex-end',
              //gap: 1, // Adds spacing between navigation items
              fontSize: { xs: '12px', sm: '14px', md: '16px', lg: '18px', xl: '20px', xxl: '22px' }, // Font size changes based on breakpoints
            }} ><HeaderNav navItems={topNav} />
          </Grid>

          
          
        </Grid>
      </header>
      {!isMounted ? null : isAbout ?  (
        <About
            
            />):(<>
      <main className="body">
       
        
          <MapWithNoSSR
          station_data={station_points}
          source_type={sourceType}
          setStationPoints={setStationPoints}
          isTourReady={isTourReady}
          

        />


        


        
      </main>
      </>)}
      <footer>
        <Box sx={{
          height:{ xs: '20px', sm: '30px', md: '35px', lg: '50px', xl: '50px', xxl: '50px' }, // if changed, remember to change the station dashboard bottom in the station_dashboard.js
        }}>
        <FooterNav></FooterNav>
        </Box>
        
      </footer>
    </div>
  )
}
