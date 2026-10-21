import { useEffect, useState } from 'react';
import { getHistoricalStormList } from './historical_storm_utils.js';
import { useRouter } from 'next/router';
import {  Box, Button } from '@mui/material';
import {  handleClick,  handleSearch } from './historical_storm_utils.js';
import { RenderRecentStorms } from './render_recent_storms.js';
import { RenderFilterResult } from '../Filter/renderFilterResult.js';
import LoadingScreen from '../loading_screen.js';
import { empty_station_obj } from '../point_defaults.js';
import {  FiltersSelected, FiltersSubmitted } from '../Filter/viewFilters.js';
import { RenderFilter } from '../Filter/filter.js';
import { mapActions } from "@/components/mapReducer";
import { filterActions } from "@/components/Filter/filterReducer";




/**
 * The `HistoricalStormList` function fetches historical storm data, displays recent storms with
 * clickable links, and allows users to search for specific storms by name or year.
 
 */
export default function HistoricalStormList({ setStationPoints, map, Leaflet, dispatch, filterDispatch, returnFilterResult, filterResult, drawerButtonClicked, startDate, endDate, startCategory, endCategory, polyFilterCoords, filterQuery, filterStormName, showFilterSelected, clearShapesRef, isDrawerOpen, showDateSelection, showCatSelection }) {

  const [loading, setLoading] = useState(false);

  
  const [stormList, setStormList] = useState([]);
  //const [searchResult, setSearchResult] = useState({})
  const router = useRouter();
  const [previousQuery, setPreviousQuery] = useState(null);

  console.log("Historical Storms Loading...");
  const setStormPoints = (point) => dispatch(mapActions.setStormPoints(point));
  const setSelectedStation= (station) => dispatch(mapActions.setSelectedStation(station));
  //const setReturnFilterResult = (state) => dispatch({ type: "TOGGLE_FILTER_RESULT", payload: state });
  //const setDrawerButtonClicked = (clicked) => dispatch({ type: "SET_DRAWER_BUTTON_CLICKED", payload: clicked });
  const closeAllDashboards = () => dispatch(mapActions.closeAllDashboards());

  const cancelFilters = () => filterDispatch(filterActions.cancelFilters());
  const setDrawerButtonClicked = (buttonClicked) => dispatch(mapActions.setDrawerButtonClicked(buttonClicked));


   // Check query parameters on mount and trigger `handleClick`
   /* This `useEffect` hook is used to run a search query when the component mounts. Here's a breakdown
   of what it does: */
   useEffect(() => { 
    if (!router.isReady) return; // Ensure router is ready
    const { name, season, sid } = router.query;
    console.log( name, season, sid )
    if (previousQuery?.name !== name || previousQuery?.season !== season || previousQuery?.sid !== sid ) {
    
      async function searchQuery(){
        
        /* This code snippet is checking if both `name` and `season` are present in the query
        parameters received from the router. If both parameters exist, it calls the `handleSearch`
        function with the `name` and `season` values to fetch storm data based on the search
        criteria. */
        console.log('here')
        if (name && season) {
          const stormObjectList = await handleSearch(name, season);
          console.log(stormObjectList);

          let selectedStorm;
          if (stormObjectList.length > 1){ // this accounts for unnamed storms that has the same name and season
            stormObjectList.forEach((stormObj) => {
              if (stormObj['storm_id'] === sid){
                selectedStorm= stormObj;
              }
            })

          }
          else{selectedStorm = stormObjectList[0];}
          
          console.log(selectedStorm);
          if (selectedStorm) {
            //setDrawerButtonClicked(selectedStorm.storm_id);
            console.log(selectedStorm.storm_id)
            dispatch(mapActions.setDrawerButtonClicked(selectedStorm.storm_id))
            

            await handleClick(selectedStorm, setStationPoints, setStormPoints, map, Leaflet, router, setSelectedStation,setLoading, closeAllDashboards);
          }
        }
    }
    searchQuery()
    setPreviousQuery({ name, season, sid });

  }
  }, [router.query, previousQuery, drawerButtonClicked]); // 

  useEffect(() => {
    async function fetchStormData() {
      try {
        const fetchedStormList = await getHistoricalStormList();
        setStormList(fetchedStormList);


        console.log(fetchedStormList);  // Log the returned storm list
      } catch (error) {
        console.error('Error fetching storm list:', error);
      }
    }
    
    fetchStormData();  // Call the async function

    
    
  }, []); // Empty dependency array ensures it runs only once on mount


  useEffect(() => {
    if (filterResult.length <= 0 && returnFilterResult) {
      filterDispatch(filterActions.setReturnFilterResult(false));
    }
  }, [filterResult.length, returnFilterResult, filterDispatch]);

  // const [selected_storm, setSelectedStorm] = useState("");
  return (
    <>
    {loading ? (
        <LoadingScreen/>
        ) : (
        <>
          {/*<Box className='historical_page_drawer_header'
          sx={{
            fontSize: { xs: '20px', sm: '20px', md: '24px', lg: '24px' }
          }}
          >Historical Storms: </Box>
          <hr style={{ height: '4px', backgroundColor: 'black', border: 'none' , margin: '5px'}}/>  {/* Bold line */}
          


        <div className="view-filter-space">
          <RenderFilter
            clearShapesRef={clearShapesRef} // Pass the ref to 
            dispatch={dispatch}
            filterDispatch={filterDispatch}
            setStationPoints={setStationPoints}
            startDate={startDate}
            endDate={endDate}
            startCategory={startCategory}
            endCategory={endCategory}
            polyFilterCoords={polyFilterCoords}
            isDrawerOpen={isDrawerOpen}
            filterStormName={filterStormName}
            showDateSelection={showDateSelection}
            showCatSelection={showCatSelection}
            showFilterSelected={showFilterSelected}
            filterQuery={filterQuery}

        />

        </div>
      
        
      



          
      {/*(showFilterSelected )  ? (
        <>
          <FiltersSelected
          startDate={startDate}
          endDate={endDate}
          startCategory={startCategory}
          endCategory={endCategory}
          polyFilterCoords={polyFilterCoords}
          filterStormName={filterStormName}/>
          <hr style={{ height: '4px', backgroundColor: 'black', border: 'none' }}/>
        </>
        ): (
          <>
          <FiltersSubmitted 
        filterQuery={filterQuery}/>

        
          </>
        )*/}
      
       <hr style={{ height: '4px', backgroundColor: 'black', border: 'none', margin: '5px' }}/>

      {returnFilterResult ?
        (<>
        
        
        
        <RenderFilterResult 
          filterResult={filterResult}
          router={router}
          drawerButtonClicked={drawerButtonClicked}
          cancelFilters={cancelFilters}
          setDrawerButtonClicked={setDrawerButtonClicked}
          
                
        />
        </> ):
        (
        <RenderRecentStorms
          stormList={stormList}
          router={router}
          drawerButtonClicked={drawerButtonClicked}
          setDrawerButtonClicked={setDrawerButtonClicked}
        />
        )}


      <hr style={{ height: '4px', backgroundColor: 'black', border: 'none', margin: '5px' }}/> 
      <Button
      onClick={()=> {
        dispatch(mapActions.closeStormTracks())
        setStationPoints(empty_station_obj)
    
      router.push(`/?page=historical`)
      }}
      className="cancel-search"
      >Clear Storm Tracks</Button>
      <hr style={{ height: '4px', backgroundColor: 'black', border: 'none', margin: '5px' }}/> 

      
          
          
        </>
         )}
    </>
  );


}






