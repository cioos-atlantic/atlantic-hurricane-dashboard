import styles from './drawer.module.css'
//import { useMap } from "react-leaflet";
import ActiveStormList from "@/components/active_storm_list";
import HistoricalStormList from "@/components/historical_storm/historical_storm_list";
import Leaflet from 'leaflet';
import React from "react";
import { Tooltip, Box, Button } from '@mui/material';
import { mapActions } from "@/components/mapReducer";



/**
 * The function `Drawer` renders a side drawer component with different content based on the
 * `source_type` prop.
 * @returns The `Drawer` component is being returned, which contains a div element with the specified
 * element_id and classes. Inside this div, there is another div with the class
 * `styles.drawer_interior`. Depending on the `source_type`, either the `ActiveStormList`,
 * `HistoricalStormList`, or a placeholder for the Home Page is rendered within the `Drawer` component.
 */
export default function Drawer({ children, element_id, classes, source_type, setStationPoints, state, dispatch, filters, filterDispatch, map, clearShapesRef }) {

    let sideClass = null;
    
    switch (classes) {
        case "left":
            sideClass = styles.left;
            break;
        case "right":
            sideClass = styles.right;
            break;
        default:
            break;
    }

    //const map = useMap();
    console.debug("Map Object: ", map);
    

    return ( 
        <>   
            <Box id={element_id} 
                    className={styles.drawer + " h-100 " + sideClass}
                    sx={{
                        maxWidth:'350px',
                        width:{xs:'100%', sm:'50%', md:'50%', lg:'50%',},
                        display: state.isDrawerOpen ? 'block' : 'none',
                    }}
                    onClick={(e) => e.stopPropagation()} // Prevent closing on internal clicks
            >
                
                
                <Box className={styles.drawer_interior}
                    
                    >
                    {
                        source_type == "active" ? (
                            <ActiveStormList
                                setStormPoints = {(point) => dispatch(mapActions.setStormPoints(point))}
                                map={map}
                                Leaflet={Leaflet}
                                setSelectedStation = {(station) => dispatch(mapActions.setSelectedStation(station))}
                                
                            />
                        ) : 
                        source_type == "historical" ? (
                            <HistoricalStormList
                                setStationPoints={setStationPoints}
                                map={map}
                                Leaflet={Leaflet}
                                dispatch={dispatch}
                                filterDispatch={filterDispatch}
                                returnFilterResult={filters.returnFilterResult}
                                filterResult={filters.filterResult}
                                drawerButtonClicked={state.drawerButtonClicked}
                                startDate={filters.startDate}
                                endDate={filters.endDate}
                                startCategory={filters.startCategory}
                                endCategory={filters.endCategory}
                                polyFilterCoords={filters.polyFilterCoords}
                                filterQuery={filters.filterQuery}
                                filterStormName={filters.filterStormName}
                                showFilterSelected={filters.showFilterSelected}
                                clearShapesRef={clearShapesRef}
                                isDrawerOpen={state.isDrawerOpen}
                                showDateSelection= {filters.showDateSelection}
                                showCatSelection={filters.showCatSelection}


                                
                        />
                        ) : 
                        (
                            <>
                                <div>Placeholder for Home Page</div>
                            </>
                        )
                    }

                </Box>
            </Box>


            <Tooltip
                title={state.isDrawerOpen ? "Close storm menu" : "Open storm menu"}
                arrow
                sx={{
                    "& .MuiTooltip-tooltip": {
                    backgroundColor: "white",
                    color: "#e55162",
                    fontSize: "0.9rem",
                    },
                }}
                >
                <Button
                    className='drawer_close_button'
                    sx={{left: state.isDrawerOpen ? "355px" : "10px",}}
                    onClick={() =>
                    dispatch(mapActions.setDrawerOpen(!state.isDrawerOpen))
                    }
                >
                    {state.isDrawerOpen ? "X" : ">"}
                </Button>
            </Tooltip>
        </>
        
        

    )
}



