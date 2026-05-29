import React, { useState } from "react";
import Box from "@mui/material/Box";
import RenderStormChart from "./storm_graph";
import StormTypeChart from './storm_type_chart';
import StormCategoryChart from './storm_cat_chart';


export default function StormDataLayout({ stormData, stormSummaryText, variablePresence, stormTime, hoverPointTime, stormType, stormCategory}) {
  function generateGraph(selectedVar){
      return (
       <div className="station_chart" 
       style={{
       height: 'auto',
       width: 'auto', // Adjust width based on content (chart)
       padding: '0px', // Optional padding around chart
       display:'flex',
       }}>
       <RenderStormChart   
                sourceData={stormData[selectedVar]}
                varCategory={selectedVar}
                 timeData={stormTime}
                 hoverPointTime={hoverPointTime}
              />
     </div>
      )
  }

  

  return (
    <Box sx={{ width: "100%",
      fontSize: { xs: '12px', sm: '14px', }
      
     }}>
      {/* Summary Section */}
      <section className="station_dashboard_small_screen_section">
        <Box
          sx= {{
            fontSize: { xs: '14px', sm: '16px'}
          }}
          className="section-header"
        >Summary</Box>
        <p>{stormSummaryText}</p>
        
      </section>

      


      {/* Storm Category */}
      <section className="station_dashboard_small_screen_section">
        <Box
          sx= {{
            fontSize: { xs: '14px', sm: '16px'}
          }}
          className="section-header"
        >{stormCategory['name']}</Box>
        <p>{<StormCategoryChart chartData={stormCategory}/>}</p>
        
      </section>

      {
            Object.entries(stormData).map(([key, value], index) => {
              
              return(
                <>
                {variablePresence[key] && (
                  <section className="station_dashboard_small_screen_section">
                    <Box
                      sx= {{
                        fontSize: { xs: '14px', sm: '16px'}
                      }}
                      className="section-header"
                    >{key}</Box>
                    {generateGraph(key)}
                </section>)}
                </>
                
              )
            })
      }


    </Box>
  );
}