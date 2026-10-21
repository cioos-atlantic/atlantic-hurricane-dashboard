import {  handleFormSubmit } from "./historical_storm/historical_storm_list";
import { IconButton,  Box, Typography, Paper } from "@mui/material";
import Search from "@mui/icons-material/Search";
import { Stack } from "@mui/system";
import {handleStormNameClick} from '../pages/about_page'
import { useRouter } from 'next/router';


export  function StormSearchQuery({isSearchSubmitted, setIsSearchSubmitted, searchResult, setSearchResult, setIsDrawerOpen, isDrawerOpen,}){
  //const [searchResult, setSearchResult] = useState([]);
  //const [isSubmitted, setIsSubmitted] = useState(false);
  
  
  const router = useRouter();


  function handleSubmit(e) {
    changeUrlToHistorical(router)
    setSearchResult([]);
    handleFormSubmit(e, setSearchResult);
    setIsSearchSubmitted(true); 
  };

  

  return(
    <>

      <div id="storm_search"
        className="storm_search">
          
         <Box className="search-container">
          <form className='storm_search_form'
          onSubmit={
            handleSubmit}>
              <input type="text" 
                    className="storm_search_input" 
                    name="historical_storm_search"
                    required 
                    minLength="4" 
                    placeholder='Joan 2014 or Joan or 2014'
                    onClick={() => {
                      setIsSearchSubmitted(false)}}/>
              <IconButton type="submit" aria-label='search' className="search-button">
                <Search/>
              </IconButton>
            </form>
             {/* Conditionally render search results after submission */}
            {isSearchSubmitted && 
              //<RenderSearchResult 
              //  searchResult={searchResult}
              //  router={router}
                
              //   />}
              setIsDrawerOpen(true)}
          </Box> 
          
        
        </div>
          
      

    </>

);}



export function RenderSearchResult({searchResult, router}){
  
  return(
    <Box >
      
      <Stack
      
        spacing={1}
        className='search-output-space'
        sx={{
          
        }}
      >
        {console.log(searchResult)}
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
            onClick={(e) => { console.log()
                              handleStormNameClick(storm.name, storm.year, router);
                              //triggerReload(); // Reload page when a storm is clicked
            
                              //console.log(storm);
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
    </Box>
  )
}


export function changeUrlToHistorical(router){
  const url = `/?page=historical`;
  console.log(url)
  router.push(url);
}

