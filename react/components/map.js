// https://iconoir.com/ icon library that can be installed via npm
import React, { useState, useRef, useReducer, useEffect, useMemo } from "react";
import { MapContainer, TileLayer, WMSTileLayer, LayersControl, LayerGroup } from 'react-leaflet'
import Drawer from '@/components/drawer';
import 'leaflet/dist/leaflet.css'
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css'
import "leaflet-defaulticon-compatibility";
//import "leaflet.markercluster/dist/MarkerCluster.css";
//import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import MarkerClusterGroup from "react-leaflet-markercluster";
import LineOfTravel from "@/components/line_of_travel";
import WindSpeedRadius from "@/components/wind_radii";
import SeaHeightRadius from "@/components/sea_height_radii";
import StationMarker from "./station_marker";
import ErrorCone from "@/components/error_cone";
import { RenderFilter } from "./Filter/filter";
import { RenderSpatialFilter } from "./Filter/Edit_spatial_filter";
import CustomZoomControl from "./custom_zoom_control";
import { RenderDashboards } from "./Dashboard/dashboard";
import StormMarker from "./stormPoint";
import { mapReducer, initialMapState } from "./mapReducer";
import InfoScreen from "./message_screens/info_screen";
import { IconButton, Stack } from "@mui/material";
import InfoIcon from '@mui/icons-material/Info';
import { useMediaQuery, Box, useTheme, Tooltip, Button } from "@mui/material";
import TourWrapper from "@/components/Tour/UseTour";
import { getTourSteps } from "@/components/Tour/tourSteps";
import { useTour } from "@reactour/tour";
import Cookies from "js-cookie";


import MeasureControl from 'react-leaflet-measure';


const defaultPosition = [46.9736, -54.69528]; // Mouth of Placentia Bay
const defaultZoom = 4


export default function Map({ children, station_data, source_type,  setStationPoints, isTourReady}) {

  const clearShapesRef = useRef(null);

  const [state, dispatch] = useReducer(mapReducer, initialMapState);
  const [map, setMap] = useState()
  const theme = useTheme();
  const { setIsOpen, setCurrentStep } = useTour();
  const [showModal, setShowModal] = useState(true);
  const [tourStarted, setTourStarted] = useState(false);
  const [isRulerActive, setIsRulerActive] = useState(false);

  useEffect(() => {  
    const tourCompleted = Cookies.get("tourCompleted");

    if (!tourCompleted) {
      Cookies.set("tourCompleted", "false", { expires: 5 });
      
    }
    if (tourCompleted == 'true')
      {setShowModal(false);}

    if (tourCompleted == 'false') {
      setShowModal(true);}
  }, []);
  
  
  const startTour = () => {
    setShowModal(false);
    setTourStarted(true);
     Cookies.set("tourCompleted", "true", {
      expires: 5,
    });
    
  };

  const skipTour = () => {
    setShowModal(false);

    Cookies.set("tourCompleted", "true", {
      expires: 5,
    });
  };


 useEffect(() => {
    if (!tourStarted) return;

    setCurrentStep(0);
    setIsOpen(true);
  }, [tourStarted]);



   
  

  
  
  console.debug("Storm Points in map.js: ", state.storm_points);
  const measureOptions = {
    position: 'topright',
    primaryLengthUnit: 'meters',
    secondaryLengthUnit: 'kilometers',
    primaryAreaUnit: 'sqmeters',
    secondaryAreaUnit: 'acres',
    activeColor: '#db4a29',
    completedColor: '#9b2d14',
    captureZIndex: 10000,
    onMeasureStart: (e) => console.log('Measurement started:', e),
    onMeasureFinish: (e) => console.log('Measurement finished:', e),
  };
  

  const mapContent = (<div className="map_container">
      <div className='inner_container'>
         
       {showModal && (
          <div className="tour-modal-overlay">
            <div className="tour-modal">
              <h2>Welcome</h2>
              <p>
                Want a quick tour of how to explore storms and use the map?
              </p>

              <div className="tour-actions">
                <button
                  onClick={startTour}
                  className="primary"
                  
                >
                  Take a Tour
                </button>

                <button onClick={skipTour} className="secondary">
                  No, thanks
                </button>
              </div>
            </div>
          </div>
        )}

       
      
      
        
       
        {
          <RenderDashboards
            source_type={source_type}
            time = {new Date()}
            state={state}
            dispatch={dispatch}
            
            />
        }
        {//state.isDrawerOpen && <div className="drawer-touch-blocker"/>
         }

       
          

        <MapContainer
          center={defaultPosition}
          zoom={defaultZoom}
          style={{ height: "100%", width: "100%" }}
          worldCopyJump={true}
          zoomControl={false}
          ref={setMap}
          whenReady={() => {
            console.log("Map is fully ready!");
            
          }}

          
          
        > 
        
          {// Map Controls
          }

            <CustomZoomControl /> 
            {source_type === "active" && (
              <MeasureControl {...measureOptions} />
            )}
           
          { source_type == "historical" &&
              (<RenderSpatialFilter
                ref={clearShapesRef} 
                setPolyFilterCoords={(coords) => dispatch({ type: "SET_POLY_FILTER_COORDS", payload: coords })}
                />)} {/* Calling the EditControl function here */}
          
          <Tooltip title="Take a tour of the tool features">
            <IconButton
              className="tour-reload"
              sx={{   
                 
                left: state.isDrawerOpen == true ? "355px !important" : "9px !important" }}
              onClick={() => {
                setIsOpen(false);// Reset any open tour popovers
                setShowModal(true)
                setTourStarted(false);
              }}
            >
              <InfoIcon />
            </IconButton>
          </Tooltip>

          
          


       
          
          
          
       
          
          

          

          <LayersControl position="bottomright">

            {/* OpenStreetMap */}
            <LayersControl.BaseLayer checked name="Open Street Map">
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a>'
              />
            </LayersControl.BaseLayer>

          

            {/* OpenTopoMap */}
            <LayersControl.BaseLayer name="Terrain">
              <LayerGroup>
                <TileLayer
                  url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
                  attribution='Map data: &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a> | Map style: &copy; <a href="https://opentopomap.org" target="_blank" rel="noopener noreferrer">OpenTopoMap</a>'
                />
                <TileLayer
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
                  attribution='Labels &copy; <a href="https://www.esri.com/" target="_blank" rel="noopener noreferrer">Esri</a>'
                />

              </LayerGroup>
              
            </LayersControl.BaseLayer>

            

            {/* ESRI Satellite*/}
            <LayersControl.BaseLayer name="Satellite">
              <LayerGroup>
                <TileLayer
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  attribution='Tiles &copy; <a href="https://www.esri.com/" target="_blank" rel="noopener noreferrer">Esri</a>'
                />
                <TileLayer
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
                  attribution='Labels &copy; <a href="https://www.esri.com/" target="_blank" rel="noopener noreferrer">Esri</a>'
                />
              </LayerGroup>
              
            </LayersControl.BaseLayer>
            
            {/* ESRI Topographic Map */}
              <LayersControl.BaseLayer name="Topographic">
                <TileLayer
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
                  attribution='Tiles &copy; <a href="https://www.esri.com/" target="_blank" rel="noopener noreferrer">Esri</a>'
                />
              </LayersControl.BaseLayer>
             
                {/* ESRI World Physical Map */}
              <LayersControl.BaseLayer name="Physical Map">
                <LayerGroup>
                    <TileLayer
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}"
                    attribution='Tiles &copy; <a href="https://www.esri.com/" target="_blank" rel="noopener noreferrer">Esri</a>'
                    />
                    <TileLayer
                      url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
                      attribution='Labels &copy; <a href="https://www.esri.com/" target="_blank" rel="noopener noreferrer">Esri</a>'
                    />

                </LayerGroup>
                
              </LayersControl.BaseLayer>

              {/* ESRI NatGeo World Map */}
              <LayersControl.BaseLayer name="NatGeo World Map">
                <TileLayer
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}"
                  attribution='Tiles &copy; <a href="https://www.esri.com/" target="_blank" rel="noopener noreferrer">Esri</a>'
                />
              </LayersControl.BaseLayer>
            

          


            <LayersControl.Overlay checked name="ECCC Hurricane Response Zone">
              <LayerGroup>
                <WMSTileLayer
                  url="https://geo.weather.gc.ca/geomet"
                  layers='HURRICANE_RESPONSE_ZONE'
                  format='image/png'
                  transparent='true'
                  styles='HURRICANE_LINE_BLACK_DASHED'
                  attribution='<a href=&quot;https://www.canada.ca/en/environment-climate-change.html&quot;>ECCC</a>'
                  version='1.3.0'
                />
              </LayerGroup>
            </LayersControl.Overlay>
           
            <LayersControl.Overlay  checked name="Stations">

              <MarkerClusterGroup>
                {
                  station_data ? (
                    Object.entries(station_data).map((station) => {
                      let storm_timestamp = new Date()
                      if("TIMESTAMP" in state.hover_marker.properties){
                        storm_timestamp = new Date(["TIMESTAMP"]);
                      }
                      console.log(JSON.stringify(state.hover_marker))
                      console.log(storm_timestamp)
                      console.log(station)
                      return (
                        <StationMarker
                          key={station[0]}
                          station_data={station}
                          time={storm_timestamp}
                          selected_station={state.selected_station}
                          dispatch={dispatch} 
                    />)
                      
                    })
                  ) : (
                    <></>
                  )
                }
              </MarkerClusterGroup>
             
            </LayersControl.Overlay>
            <LayersControl.Overlay checked name="Error Cone">
              <LayerGroup>
                {
                  state.storm_points?.err?.features?.map(err_cone => {
                    return (
                      <ErrorCone
                        key={err_cone.id}
                        error_cone_data={err_cone}
                      />
                    );
                  })
                }
              </LayerGroup>
            </LayersControl.Overlay>
            <LayersControl.Overlay checked name="Points">
              <LayerGroup>
                {
                  state.storm_points?.pts?.features?.map(point => {
                    return (

                      <StormMarker
                        key={point.id}
                        storm_point_data={point}
                        storm_point_hover= {state.hover_marker}
                        dispatch={dispatch}

                      />
                    );
                  })
                }
              </LayerGroup>
            </LayersControl.Overlay>
            <LayersControl.Overlay checked name="Track Line">
              <LayerGroup>
                { 
                  state.storm_points?.lin?.features?.length > 0 &&
                  state.storm_points?.lin?.features?.map(line => {
                    

                    return (
                      <LineOfTravel
                        key={line.id}
                        storm_line_data={line}
                      />
                    );
                  })
                }
              </LayerGroup>
            </LayersControl.Overlay>
            <LayersControl.Overlay checked name="Wind Speed Radius">
              <LayerGroup>
                {
                  state.storm_points?.rad?.features?.length > 0 &&
                  state.storm_points?.rad?.features?.map(radii => {
                    return (
                      <WindSpeedRadius
                        key={radii.id}
                        storm_wind_radii_data={radii}
                        hover_marker={state.hover_marker}
                      />
                    );
                  })
                }
              </LayerGroup>
            </LayersControl.Overlay>
            <LayersControl.Overlay checked name="Sea Height Radius">
              <LayerGroup>
                {
                  state.storm_points?.sea?.features?.length > 0 &&
                  state.storm_points?.sea?.features?.map(radii => {
                    return (
                      <SeaHeightRadius
                        key={radii.id}
                        storm_sea_height_data={radii}
                        hover_marker={state.hover_marker}
                      />
                    );
                  })
                }
              </LayerGroup>
            </LayersControl.Overlay>
          </LayersControl>

          
        </MapContainer>

        { map && (<Drawer
            element_id="left-side"
            classes="left"
            source_type={source_type}
            setStationPoints={setStationPoints}
            state={state}
            dispatch={dispatch}
            map={map}
            clearShapesRef= {clearShapesRef}
          />)}
      </div>
    </div>)

  return  tourStarted ? (
  <TourWrapper
    steps={getTourSteps({
      isActive: source_type === "active",
      isHistorical: source_type === "historical",
    })}
      >
        {mapContent}
      </TourWrapper>
    ) : (
      mapContent
    );
  
}