import styles from './drawer.module.css'
//import { useMap } from "react-leaflet";
import ActiveStormList from "@/components/active_storm_list";
import HistoricalStormList from "@/components/historical_storm/historical_storm_list";
import Leaflet from 'leaflet';
import React from "react";
import { Tooltip, Box, Button } from '@mui/material';



/**
 * The function `Drawer` renders a side drawer component with different content based on the
 * `source_type` prop.
 * @returns The `Drawer` component is being returned, which contains a div element with the specified
 * element_id and classes. Inside this div, there is another div with the class
 * `styles.drawer_interior`. Depending on the `source_type`, either the `ActiveStormList`,
 * `HistoricalStormList`, or a placeholder for the Home Page is rendered within the `Drawer` component.
 */
export default function Drawer({ children, element_id, classes, source_type, setStationPoints, state, dispatch, map }) {

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
                        maxWidth:{xs:'258px', sm:'258px', md:'258px', lg:'258px',},
                        width:{xs:'100%', sm:'50%', md:'50%', lg:'50%',},
                        display: state.isDrawerOpen ? 'block' : 'none',
                    }}
                    onClick={(e) => e.stopPropagation()} // Prevent closing on internal clicks
            >
                <button className={styles.closeButton}
                onClick={() => {//setIsDrawerOpen(false); 
                                dispatch({ type: "TOGGLE_DRAWER", payload: false});} }
                >
                    X
                </button>
                <Box className={styles.drawer_interior}
                    
                    >
                    {
                        source_type == "active" ? (
                            <ActiveStormList
                                setStormPoints = {(point) => dispatch({ type: "SET_STORM_POINT", payload: point })}
                                map={map}
                                Leaflet={Leaflet}
                                setSelectedStation = {(station) => dispatch({ type: "SET_SELECTED_STATION", payload: station })}
                                
                            />
                        ) : 
                        source_type == "historical" ? (
                            <HistoricalStormList
                                setStationPoints={setStationPoints}
                                map={map}
                                Leaflet={Leaflet}
                                dispatch={dispatch}
                                returnFilterResult={state.returnFilterResult}
                                filterResult={state.filterResult}
                                drawerButtonClicked={state.drawerButtonClicked}
                                startDate={state.startDate}
                                endDate={state.endDate}
                                startCategory={state.startCategory}
                                endCategory={state.endCategory}
                                polyFilterCoords={state.polyFilterCoords}
                                filterQuery={state.filterQuery}
                                filterStormName={state.filterStormName}
                                showFilterSelected={state.showFilterSelected}
                                
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


            <Tooltip title="Open storm menu" arrow
                sx={{
                    "& .MuiTooltip-tooltip": {
                    backgroundColor: "white", // Custom background color
                    color: "#e55162", // Custom text color
                    fontSize: "0.9rem", // Adjust font size
                    },
                }}>
                <Button
                className={styles.openButton}
                onClick={() => dispatch({ type: "TOGGLE_DRAWER", payload: true})} // Open the drawer
                sx={{
                    display: !state.isDrawerOpen ? 'grid' : 'none',
                }}
                >{'>'}
                </Button>
            </Tooltip>
        </>
        
        

    )
}



