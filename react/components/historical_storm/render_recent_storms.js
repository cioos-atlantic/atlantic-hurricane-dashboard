import {  handleStormButtonClick } from "./historical_storm_utils";
import { Button, Stack, Typography, Box } from "@mui/material";


export function RenderRecentStorms({stormList, router, drawerButtonClicked, setDrawerButtonClicked}){
  return(
    
      <Stack
      spacing={0.3}
      className='historical_storm_search_result'>
        <Box className='historical_page_drawer_subheader'
        sx={{
          fontSize: '14px',
          
        }}
        >Recent Storms: ({stormList.length} result(s) found)</Box>

        <Stack id="storm_search_result"
              spacing={0.5}
              sx={{overflowX: 'hidden', 
                paddingLeft: '7px', 
                paddingRight: '7px',
              backgroundColor: "darkgrey"}}
              
              >
        {stormList.map((storm, index) => {
            const isClicked = drawerButtonClicked === storm.storm_id;
              return (
                <div key={storm.storm_id} className={(storm.name)}>
                  <Button 
                  className='historical_storm_button'
                  sx={{
                    fontSize: { xs: '10px', sm: '10px', md: '12px'},
                    color: isClicked ? 'white' : '#e55162', 
                    backgroundColor: isClicked ? 'black' : '#f5f5f5',
                    padding: isClicked ? '3px' : '0.5px',
                    fontWeight: isClicked ? 'bolder': 'normal'
                    
                  }}
                  onClick={(e) => { 
                    //setDrawerButtonClicked(storm.storm_id);
                    handleStormButtonClick(storm.name, storm.year, storm.storm_id, router);
                    //setDrawerButtonClicked(storm.storm_id);
                    //handleClick(storm, setStationPoints, setStormPoints, map, Leaflet, router, setSelectedStation, setLoading, setIsDashOpen, setIsStormDashOpen,setIsStationDashOpen);
                    }}><Typography className='search-output' sx ={{fontWeight: isClicked ? '650': 'normal'}} >
                    {`${storm.display_name}`}
                  </Typography></Button>
                </div>
              )
            })}


          
        </Stack>

      </Stack>
    

    
    

  )
}