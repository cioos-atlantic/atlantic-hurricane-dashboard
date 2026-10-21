import React from 'react';
import StormDashboard from '../storm_dashboard/storm_dashboard';
import StationDashboard from '../station_dashboard/station_dashboard';
import { Stack } from '@mui/material';
import { useMediaQuery, Box, useTheme } from "@mui/material";
import { RenderSmallDashboard } from './Mobile_Dashboard/dashboard_small';




export function RenderDashboards({ source_type, time, state, dispatch
    }){
        

        const showStorm = state.isStormDashOpen;
        const showStation = state.isStationDashOpen;
        console.log(showStation, showStorm)
            // Determine width dynamically
        const flexValue = showStorm && showStation ? 1 : 2; // 50% if both, 100% if one
        const theme = useTheme();
        const isSmall = useMediaQuery(theme.breakpoints.down('md')); // `md` in MUI = 960px
        const isExtraSmall = useMediaQuery(theme.breakpoints.down('sm'));
    
        if (!state.isDashOpen) return null;

    return (
    isExtraSmall && showStorm && showStation ? (
        <RenderSmallDashboard
        selected_station={state.selected_station}
        hover_point={state.hover_marker}
        source_type={source_type}
        time={time}
        storm_points={state.storm_points}
        setIsDashOpen= {(state) => dispatch({ type: "TOGGLE_DASH", payload: state })}
        setIsStormDashOpen={(state) => dispatch({ type: "TOGGLE_STORM_DASH", payload: state })}
        setIsStationDashOpen={(state) => dispatch({ type: "TOGGLE_STATION_DASH", payload: state })}
        />
    ) : (
        <Stack
        key="combined-dashboard"
        className="dashboards"
        direction="row"
        sx={{
            bottom: { xs: "20px", sm: "30px", md: "35px"},
            width: {
            xs: "100%",
            md: "100%",
            lg: state.isDrawerOpen ? "calc(100vw - 350px)" : "100%",
            },
            marginLeft: {
            xs: 0,
            md: 0,
            lg: state.isDrawerOpen ? "350px" : 0,
            },
            gap: 0,
            display: "flex",
            alignItems: "stretch",
            maxHeight: { xs: "45%", md: "55%" },
        }}
        >
        {showStorm && (
            <Box sx={{ flex: flexValue, minWidth: showStation ? "50%" : "100%" }}>
            <StormDashboard
                dispatch={dispatch}
                hover_marker={state.hover_marker}
                storm_points={state.storm_points}
                isStormDashOpen={state.isStormDashOpen}
                
            />
            </Box>
        )}
        {showStation && (
            <Box sx={{ flex: flexValue, minWidth: showStorm ? "50%" : "100%" }}>
            <StationDashboard
                state={state}
                dispatch={dispatch}
                //selected_station={selected_station}
                //setSelectedStation={setSelectedStation}
                storm_timestamp={new Date()}
                //selectedTab={selectedTab}
                //setSelectedTab={setSelectedTab}
                source_type={source_type}
                //isStationDashOpen={isStationDashOpen}
                //setIsStationDashOpen={setIsStationDashOpen}
                //hover_point={hover_point}
            />
            </Box>
        )}
        </Stack>
    )
    );
};



