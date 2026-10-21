import React, { useCallback } from 'react';
import StormDashboard from '../storm_dashboard/storm_dashboard';
import StationDashboard from '../station_dashboard/station_dashboard';
import { Stack } from '@mui/material';
import { useMediaQuery, Box, useTheme } from "@mui/material";
import { RenderSmallDashboard } from './Mobile_Dashboard/dashboard_small';
import { mapActions } from "@/components/mapReducer";
import { fetch_value } from "@/lib/storm_utils";




export function RenderDashboards({ dashboards, selected_station, hover_marker, storm_points, isDrawerOpen, dispatch
    }){


        const showStorm = dashboards.storm;
        const showStation = dashboards.station;
        
        // Determine width dynamically
        const flexValue = showStorm && showStation ? 1 : 2; // 50% if both, 100% if one
        const theme = useTheme();
        const isSmall = useMediaQuery(theme.breakpoints.down('md')); // `md` in MUI = 960px
        const isExtraSmall = useMediaQuery(theme.breakpoints.down('sm'));

        // Stable callbacks (dispatch never changes), so they don't defeat React.memo on the dashboards
        // closeDashboard also clears the panel's selection (see CLOSE_DASHBOARD in mapReducer)
        const closeStormDashboard = useCallback(() => {
            dispatch(mapActions.closeDashboard('storm'));
        }, [dispatch]);
        const closeStationDashboard = useCallback(() => {
            dispatch(mapActions.closeDashboard('station'));
        }, [dispatch]);
        const closeAllDashboards = useCallback(() => {
            dispatch(mapActions.closeAllDashboards());
        }, [dispatch]);

        if (!showStorm && !showStation) return null;

        const hoverPointTime = fetch_value(hover_marker, ["TIMESTAMP", "ISO_TIME"]);

    return (
    isExtraSmall && showStorm && showStation ? (
        <RenderSmallDashboard
        selected_station={selected_station}
        hover_point={hover_marker}
        storm_points={storm_points}
        onClose={closeAllDashboards}
        />
    ) : (
        <Stack
        key="combined-dashboard"
        className="dashboards"
        direction="row"
        sx={{
            // Must match the footer height in layout.js (35px from md up)
            bottom: { xs: "20px", sm: "30px", md: "35px", lg: "35px", xl: "35px" },
            width: {
            xs: "100%",
            md: "100%",
            lg: isDrawerOpen ? "calc(100vw - 350px)" : "100%",
            },
            marginLeft: {
            xs: 0,
            md: 0,
            lg: isDrawerOpen ? "350px" : 0,
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
                hover_marker={hover_marker}
                storm_points={storm_points}
                onClose={closeStormDashboard}
            />
            </Box>
        )}
        {showStation && (
            <Box sx={{ flex: flexValue, minWidth: showStorm ? "50%" : "100%" }}>
            <StationDashboard
                key={selected_station?.[0] ?? 'no-station'} // remount (and reset tab) when the station changes
                station={selected_station}
                hoverPointTime={hoverPointTime}
                onClose={closeStationDashboard}
            />
            </Box>
        )}
        </Stack>
    )
    );
};



