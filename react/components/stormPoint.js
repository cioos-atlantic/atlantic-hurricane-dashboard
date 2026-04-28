import React, { useState, useEffect, useRef } from "react";
import { Marker, Popup } from 'react-leaflet'
import { storm_cat} from '@/lib/storm_cat'
import { flip_coords,  } from "@/lib/storm_utils";
import { useMediaQuery, useTheme } from '@mui/material';
import StormPointDetailsTooltip from "./storm_dashboard/storm_point_details_tooltip";
import { createSvgIconWithText } from "./utils/storm_display_utils";
import { getStormCategory } from "./storm_dashboard/utils";






/**
 * This function represents a React component that renders a storm marker on a map.
 * It takes in three props: storm_point_data, setHoverMarker, and setShowPopup.
 *
 * @param {Object} storm_point_data - The data object representing a storm point.
 * @param {Function} setHoverMarker - A function to set the hovered marker.
 * @param {Function} setShowPopup - A function to show or hide the popup.
 *
 * @returns {JSX.Element} - A React Marker component with event handlers and custom icon.
 */
export default function StormMarker({ storm_point_data, storm_point_hover, dispatch }) {
    const [isMounted, setIsMounted] = useState(false);
    const [customIcon, setCustomIcon] = useState(null);
   
    

    const markerRef = useRef(null);

    const clickedRef = useRef(false);

    // Keep track of previously clicked marker to default back to?
    const position = flip_coords(storm_point_data.geometry.coordinates);
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

    useEffect(() => {
        setIsMounted(true);
        return () => setIsMounted(false);
    }, []);

    const isSelected = storm_point_data.id === storm_point_hover?.id;
    //console.log(`Marker for storm point with category ${storm_cat[getStormCategory(storm_point_data)].name.en || "Unknown"}`)
    



    useEffect(() => {
        (async () => {
            console.log(storm_point_data.properties);
            const storm_category = getStormCategory(storm_point_data) || "";
            const categoryInfo = storm_cat[storm_category] || {};
            const baseIcon = categoryInfo.img;
            console.log(baseIcon);
             const icon = L.divIcon({ 
                className: `storm-marker ${isSelected ? "selected" : ""}`,
                html: `
                    <img 
                        src="${categoryInfo.img}" 
                        style="width:100%; height:100%;"
                    />
                `,
                iconSize: isSelected ? [70, 70] : [40, 40],
                iconAnchor: isSelected ? [35, 35] : [20, 20]
                //iconSize: [40, 40],
                //iconAnchor: [20, 20]
            });

            setCustomIcon(icon);
          
        
            
        })();
    }, [ storm_point_data, isSelected, ]);

    if (!isMounted || !customIcon) return null;

    return (
        <Marker
            key={storm_point_data.id}
            position={position}
            ref={markerRef}
            zIndexOffset={isSelected ? 1000 : 0}
            aria-label={`Marker for storm point with category ${storm_cat[getStormCategory(storm_point_data)].name.en || "Unknown"}`}

            eventHandlers={{
                mouseover: () => {
                    //setHoverMarker(storm_point_data);
                    dispatch({ type: "SET_HOVER_MARKER", payload: storm_point_data });
                    //setIsDashOpen(true);
                    //setIsStormDashOpen(true);

                    markerRef.current?.openPopup();
                },
                click: () => {
                    dispatch({ type: "SET_HOVER_MARKER", payload: storm_point_data });
                    dispatch({ type: "TOGGLE_DASH", payload: true });
                    dispatch({ type: "TOGGLE_STORM_DASH", payload: true });
                    clickedRef.current = true;
                },
                mouseout: () => {
                    if (!clickedRef.current) {
                        //setHoverMarker(empty_point_obj);
                        markerRef.current?.closePopup();
                    }
                }
            }}
            icon={customIcon}
        >
            {storm_point_hover && (
                <Popup
                    offset={[0, -40]}
                    closeButton={false}
                    autoPan={false}
                    closeOnEscapeKey={false}
                    closeOnClick={false}
                    interactive={false}
                >
                    <StormPointDetailsTooltip
                        storm_point_hover={storm_point_hover}
                    />
                </Popup>
            )}
        </Marker>
    );
}
