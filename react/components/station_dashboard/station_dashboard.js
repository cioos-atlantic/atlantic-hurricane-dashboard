import React, { useState, useEffect } from"react";
import { FaWindowClose } from "react-icons/fa";
import { useMediaQuery, Box, useTheme } from "@mui/material";
import StationDataLayout from "./station_layout_small_screen";
import BasicTabs from "./tabs";
import {  getMatchedStation, getStationDataText, } from "../utils/station_data_format_util";
import { basePath } from "@/next.config";

/**
 * The `StationDashboard` function renders a dashboard for a selected station with relevant data and
 * tabs for different variables.
 */
export default function StationDashboard({ station, hoverPointTime, onClose, time = new Date() }) {

  
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('md')); // `md` in MUI = 960px
  const isExtraSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const [api_data, set_api_data] = useState(0)

  // Local tab state; resets to 0 whenever a different station is opened because
  // dashboard.js gives this component key={station name}, which remounts it.
  const [selectedTab, setSelectedTab] = useState(0);
  const stationValues = station?.[1];


  // const stationDescription = getMatchedStation(station_descriptions, stationName);
  // const displayName = stationDescription.title || "Unknown Station";
  //const institution = stationDescription.institution || "Unknown Institution";
   //const institutionLink = stationDescription.institution_link || "#";\


  const displayName = stationValues?.properties?.dataset_title || "Unknown Station";
  const stationName = stationValues?.properties?.station
  const institution = stationValues?.properties?.institution || "Unknown Institution";
  const institutionLink = stationValues?.properties?.institution_link || "#";  

  const station_id = stationValues?.properties?.station_id
  const storm = stationValues?.properties?.storm
  // Active stations are cached with storm = "ACTIVE" (data_ingest/ERDDAP/cache_ERDDAP.py);
  // historical ones carry the storm id. Same rule the /api/station_data route uses to pick the cache.
  const isHistorical = storm !== "ACTIVE"

  const erddapSource = stationValues?.properties?.source_url || ""
  const datasetId = stationValues?.properties?.dataset || ""
  const dataLink = erddapSource + "/tabledap/" + datasetId 

  useEffect(() => {
    if (!station_id) return;
    const fetchData = async () => {
      try{
        const query = new URLSearchParams({station_id, storm}).toString();
        const response = await fetch(`${basePath}/api/station_data?${query}`)
        const data = await response.json();
        set_api_data(data)
      }
      catch(error){
        console.error(error)
      }
    };
    fetchData();
  }, [station_id, storm]);
  
  let dataText = ''
  let standardNames = []
  let rowData =[]
  const excludeVars = [
    "time",
    "latitude",
    "longitude",
    "relative_humidity",
    "sea_surface_wave_from_direction",
    "sea_surface_wave_maximum_period",
  ];
  const variablePresence = {
    wind_speed: false,
    wind_from_direction: false,
    temperature: false,
    wave: false,
    air_pressure: false,
  };
  if(api_data != undefined){
    
    dataText = getStationDataText(api_data[stationName], time, isHistorical)
    standardNames = api_data[stationName]?.properties?.station_data?.column_std_names || [];
    rowData = api_data[stationName]?.properties?.station_data?.rows;
  
  
    standardNames.forEach((varName, indx) => {
      if (!excludeVars.includes(varName)) {

        
        rowData.forEach((datalist) => {
          if (datalist[indx]) {
              variablePresence.wind_speed ||= varName.includes("wind_speed");
              variablePresence.wind_from_direction ||= varName.includes("wind_from_direction");
              variablePresence.temperature ||= varName.includes("temperature");
              variablePresence.wave ||= varName.includes("wave");
              variablePresence.air_pressure ||= varName.includes("air_pressure");
            }
          })
        }
      });
  }

    return (
      isExtraSmall ? (
        <Box
        key="01-station-dashboard"
        className={`station_dashboard`}
        sx={{
          display: 'flex',
        }}
      >
        <Box
          className="dash-header"
          sx={{
            fontSize: { xs: "14px", sm: "16px", md: "18px", lg: "18px" },
            padding: "10px",
            
          }}
        >
          <button
            className="close"
            onClick={onClose}
            title="Close"
            aria-label="Close"
          >
            <FaWindowClose />
          </button>
          <div>
            <strong key={displayName}>{displayName}</strong>
          </div>
          <div>
            <p key={stationName}>{stationName}</p>
            <a href={institutionLink} target="_blank" rel="noopener noreferrer">
              {institution}
            </a>
          </div>
        </Box>
        <Box
          className="dash-body"
          sx={{
            fontSize: { xs: "12px", sm: "14px", md: "16px", lg: "16px" },
            
          }}
        >
            <StationDataLayout
              stationName={stationName}
              sourceDataLink={dataLink}
              stationData={api_data[stationName]?.properties?.station_data}
              stationSummaryText={dataText}
              variablePresence={variablePresence}
              hoverPointTime={hoverPointTime}
            />
        </Box>
      </Box>
      ):(
        <Box
        key="01-station-dashboard"
        className={`station_dashboard`}
        sx={{display:  'flex',
          //bottom: { xs: "20px", sm: "30px", md: "35px", lg: "50px", xl: "50px" },
          
          
        }}
      >
        <Box
          className="dash-header"
          sx={{
            fontSize: { xs: "14px", sm: "16px", md: "18px", lg: "18px" },
            padding: "10px",
          }}
        >
          <button
            className="close"
            onClick={onClose}
            title="Close"
            aria-label="Close"
          >
            <FaWindowClose />
          </button>
          <div>
            <strong key={displayName}>{displayName}</strong>
          </div>
          <div>
            <p key={stationName}>{stationName}</p>
            <a href={institutionLink} target="_blank" rel="noopener noreferrer">
              {institution}
            </a>
          </div>
        </Box>
        <Box
          className="dash-body"
          sx={{
            fontSize: { xs: "12px", sm: "14px", md: "16px", lg: "16px" },
            
          }}
        >
            <BasicTabs
              stationName={stationName}
              sourceDataLink={dataLink}
              stationData={api_data[stationName]?.properties?.station_data}
              stationSummaryText={dataText}
              variablePresence={variablePresence}
              selectedTab={selectedTab}
              setSelectedTab={setSelectedTab}
              hoverPointTime={hoverPointTime}
            />
          
        </Box>
      </Box>
      )

    );
}
  