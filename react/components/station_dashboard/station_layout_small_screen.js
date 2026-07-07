import React from "react";
import Box from "@mui/material/Box";
import { RenderWindRose } from "./wind_rose";
import RenderChart from "../station_graph.js";
import { RenderPlotlyRose } from "./plotly_rose";
import { get_station_field_data } from "../utils/station_data_format_util";
import { processWindSpeeds } from "./wind_rose_utils";

export default function StationDataLayout({stationName, stationData, setSelectedStation, stationSummaryText, variablePresence, hoverPointTime}){

  if (stationData === undefined) {
    return
  }

  let timeData, directionData, windSpeedData = []

  try {
    timeData = get_station_field_data(stationData, "time", "column_std_names").data;
    directionData = get_station_field_data(stationData, 'wind_from_direction', "column_std_names").data;
    windSpeedData = processWindSpeeds(stationData);
  }
  catch (error) {
    console.error(error)
  }

  console.log(stationData)
  
  function generateGraph(selectedVar){
      return (
       <div className="station_chart" 
       style={{
       height: 'auto',
       width: 'auto', // Adjust width based on content (chart)
       padding: '0px', // Optional padding around chart
       display:'flex',
       }}>
       <RenderChart 
           sourceData={stationData}
           stationName={stationName}
           varCategory={selectedVar}
           hoverPointTime={hoverPointTime}
         />
     </div>
      )
  }

  const dataLink = "https://cioosatlantic.ca/erddap/tabledap/" + stationName + ".html"

  return (
    <Box sx={{ width: "100%",
      fontSize: { xs: '12px', sm: '14px', md: '16px', lg: '16px' }
      
     }}>
      {/* Summary Section */}
      <section className="station_dashboard_small_screen_section">
        <Box
          sx= {{
            fontSize: { xs: '14px', sm: '16px', md: '18px', lg: '18px' }
          }}
          className="section-header"
        >Summary</Box>
        <p>{stationSummaryText}</p>
        <div className="data-footer">
          <a href={dataLink} target="_blank" rel="noopener noreferrer">
            Full data
          </a>
        </div>
      </section>

      {/* Wind Speed Section */}
      {variablePresence["wind_speed"] && (
        <section className="station_dashboard_small_screen_section">
          <Box
            sx= {{
              fontSize: { xs: '14px', sm: '16px', md: '18px', lg: '18px' }
            }}
            className="section-header"
          >Wind Speed</Box>
          {generateGraph("wind_speed")}
        </section>
      )}

      {/* Wind Direction Section */}
				{variablePresence["wind_from_direction"] && (
					Object.keys(windSpeedData).map((key, index) => {
						const label = key.replace(/^wind speed(?=\s+\S)/i, '').trim();
						return(
						<section key={`windbin-tab-${key}`} className="station_dashboard_small_screen_section">
						<Box className="section-header"
						sx= {{
							fontSize: { xs: '14px', sm: '16px', md: '18px', lg: '18px' }
						}}>{`WINDROSE-${label}`}</Box>
						<RenderPlotlyRose 
							windData={windSpeedData[key]}
							directionData={directionData}
								timeData={timeData}/>
					</section>

					)})
					
				)}

      {/* Temperature Section */}
      {variablePresence["temperature"] && (
        <section className="station_dashboard_small_screen_section">
          <Box
          sx= {{
            fontSize: { xs: '14px', sm: '16px', md: '18px', lg: '18px' }
          }}
          className="section-header"
          >Temperature</Box>
          {generateGraph("temperature")}
        </section>
      )}

      {/* Waves Section */}
      {variablePresence["wave"] && (
        <section className="station_dashboard_small_screen_section">
          <Box
          sx= {{
            fontSize: { xs: '14px', sm: '16px', md: '18px', lg: '18px' }
          }}
          className="section-header"
          >Waves</Box>
          {generateGraph("wave")}
        </section>
      )}

      {/* Pressure Section */}
      {variablePresence["air_pressure"] && (
        <section className="station_dashboard_small_screen_section">
          <Box
          sx= {{
            fontSize: { xs: '14px', sm: '16px', md: '18px', lg: '18px' }
          }}
          className="section-header"
          >Pressure</Box>
          {generateGraph("air_pressure")}
        </section>
      )}
    </Box>
  );
}