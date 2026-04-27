import React, { useState, useEffect } from"react";
import { FaWindowClose } from "react-icons/fa";
import { useMediaQuery, Box, useTheme } from "@mui/material";
import StationDataLayout from "./station_layout_small_screen";
import BasicTabs from "./tabs";
import {  getMatchedStation, getStationDataText, } from "../utils/station_data_format_util";
import { fetch_value } from "@/lib/storm_utils";
import { basePath } from "@/next.config";

/**
 * The `StationDashboard` function renders a dashboard for a selected station with relevant data and
 * tabs for different variables.
 */
export default function StationDashboard({state, dispatch, station_descriptions, time = new Date(), source_type
}) {

  
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('md')); // `md` in MUI = 960px
  const isExtraSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const [api_data, set_api_data] = useState(0)

  //const [selectedTab, setSelectedTab] = useState(0);
  const stationData = state.selected_station;
  const stationValues = stationData[1];
  // Determine if active or historic
  const isHistorical = source_type == "historical" ? true : false


  // const stationDescription = getMatchedStation(station_descriptions, stationName);
  // const displayName = stationDescription.title || "Unknown Station";
  //const institution = stationDescription.institution || "Unknown Institution";
   //const institutionLink = stationDescription.institution_link || "#";\

   //console.log(stationValues.properties)

  const displayName = stationValues?.properties?.dataset_title || "Unknown Station";
  const stationName = stationValues?.properties?.station
  const institution = stationValues?.properties?.institution || "Unknown Institution";
  const institutionLink = stationValues?.properties?.institution_link || "#";  

  const station_id = stationValues?.properties?.station_id
  const storm = stationValues?.properties?.storm

  const erddapSource = stationValues?.properties?.source_url || ""
  const datasetId = stationValues?.properties?.dataset || ""
  const dataLink = erddapSource + "/tabledap/" + datasetId 

  useEffect(() => {
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
  }, [state]);
  
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
  const hoverPointTime = fetch_value(state.hover_marker, ["TIMESTAMP", "ISO_TIME"]);

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
            onClick={() => {
              dispatch({ type: "CLOSE_STATION_DASHBOARD"});
              dispatch({ type: "TOGGLE_STATION_DASH", payload: false});
            }}
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
            onClick={() => {
              dispatch({ type: "CLOSE_STATION_DASHBOARD"});
              dispatch({ type: "TOGGLE_STATION_DASH", payload: false});
              //setIsStationDashOpen(false);
            }}
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
              selectedTab={state.selectedTab}
              setSelectedTab={(tab) => dispatch({ type: "SET_SELECTED_TAB", payload: tab })}
              hoverPointTime={hoverPointTime}
            />
          
        </Box>
      </Box>
      )

    );
}
  