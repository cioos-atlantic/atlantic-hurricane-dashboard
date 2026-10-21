import { Button } from "@mui/material";
import {  Box, Typography, Paper } from "@mui/material";
import { Stack } from "@mui/system";
import { handleStormButtonClick } from "./historical_storm_utils";


export function RenderSearchResult({searchResult, router, setIsSearchSubmitted}){
  
  return(
    <Box >
      
      <Stack
      
        spacing={1}
        className='search-output-space'
        sx={{
          
        }}
      >
        {searchResult.length > 0 ? (
          <>
          <Box
          sx={{
            color: "white",
            position: "static"
          }}>
          Search Result...</Box>
          {searchResult.map((storm, index) => (
          <Paper
            key={storm.storm_id}
            onClick={(e) => {
              handleStormButtonClick(storm.name, storm.year, storm.storm_id, router);
                              //triggerReload(); // Reload page when a storm is clicked
            
                              }}      
          >
            <Typography className='search-output'>
              <strong>{`${storm.display_name}`}</strong>
            </Typography>
            
          </Paper>
          
        ))}
        </>
        ): (<Box
          sx={{
            color: "white"
          }}>
          ...</Box>)}
      </Stack>
      <Button
      onClick={()=> {setIsSearchSubmitted(false)}}
      className="cancel-search"
      >Cancel Search</Button>
    </Box>
  )
}