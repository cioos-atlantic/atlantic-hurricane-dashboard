// https://iconoir.com/ icon library that can be installed via npm
import React, { useState, useRef, useReducer, useEffect } from "react";
import { MapContainer, TileLayer, WMSTileLayer, LayersControl, LayerGroup } from 'react-leaflet'
import Drawer from '@/components/drawer';
import 'leaflet/dist/leaflet.css'
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css'
import "leaflet-defaulticon-compatibility";
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
import { IconButton } from "@mui/material";
import InfoIcon from '@mui/icons-material/Info';
import { useMediaQuery, Box, useTheme } from "@mui/material";

const defaultPosition = [46.9736, -54.69528]; // Mouth of Placentia Bay
const defaultZoom = 4


export default function Map({ children, station_data, source_type,  setStationPoints}) {

  const clearShapesRef = useRef(null);

  const [state, dispatch] = useReducer(mapReducer, initialMapState);
  const [map, setMap] = useState()
  const theme = useTheme();

  
  
  console.debug("Storm Points in map.js: ", state.storm_points);


    



  return (
    <div className="map_container">
      <div className='inner_container'>
      {<InfoScreen
          setInfo = {(state) =>dispatch({ type: "SET_INFO_GUIDE", payload: state})}
          open={state.info}
          onClose = {state.info}
        />}
        

      { 
        <IconButton
          className="info-guide"
          sx={{ display: 'flex'
            }}
          onClick={() => {
            dispatch({ type: "SET_INFO_GUIDE", payload: true});
          }}
          ><InfoIcon />
        </IconButton>

      
      }
        
        { source_type === "historical" &&
          <RenderFilter
          clearShapesRef={clearShapesRef} // Pass the ref to 
          state={state}
          dispatch={dispatch}
          setStationPoints={setStationPoints}
          />
        }
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

          
          
        > <CustomZoomControl /> 
          
          

          

          <LayersControl position="bottomright">

            {/* OpenStreetMap */}
            <LayersControl.BaseLayer checked name="Open Street Map">
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a>'
              />
            </LayersControl.BaseLayer>

            {/* CARTO Light */}
            <LayersControl.BaseLayer name="Light">
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a> &copy; <a href="https://carto.com/" target="_blank" rel="noopener noreferrer">CARTO</a>'
              />
            </LayersControl.BaseLayer>

            {/* CARTO Dark */}
            <LayersControl.BaseLayer name="Dark">
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a> &copy; <a href="https://carto.com/" target="_blank" rel="noopener noreferrer">CARTO</a>'
              />
            </LayersControl.BaseLayer>

            {/* OpenTopoMap */}
            <LayersControl.BaseLayer name="Terrain">
              <TileLayer
                url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
                attribution='Map data: &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a> | Map style: &copy; <a href="https://opentopomap.org" target="_blank" rel="noopener noreferrer">OpenTopoMap</a>'
              />
            </LayersControl.BaseLayer>

            {/* ESRI Satellite */}
            <LayersControl.BaseLayer name="Satellite">
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution='Tiles &copy; <a href="https://www.esri.com/" target="_blank" rel="noopener noreferrer">Esri</a>'
              />
            </LayersControl.BaseLayer>

            {/* ESRI Satellite + Labels */}
            <LayersControl.BaseLayer name="Satellite + Labels">
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
              {/* ESRI Topographic Map */}
            </LayersControl.BaseLayer>
              <LayersControl.BaseLayer name="Topographic">
                <TileLayer
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
                  attribution='Tiles &copy; <a href="https://www.esri.com/" target="_blank" rel="noopener noreferrer">Esri</a>'
                />
              </LayersControl.BaseLayer>
              {/* ESRI World Street Map */}
              <LayersControl.BaseLayer name="Street Map">
                <TileLayer
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
                  attribution='Tiles &copy; <a href="https://www.esri.com/" target="_blank" rel="noopener noreferrer">Esri</a>'
                />
              </LayersControl.BaseLayer>
                {/* ESRI World Physical Map */}
              <LayersControl.BaseLayer name="Physical Map">
                <TileLayer
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}"
                  attribution='Tiles &copy; <a href="https://www.esri.com/" target="_blank" rel="noopener noreferrer">Esri</a>'
                />
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
           {/* <LayersControl.Overlay checked name="Rain Radar">
              {radarTime &&(<TileLayer
                url={`https://tilecache.rainviewer.com/v2/radar/${radarTime}/256/{z}/{x}/{y}/2/1_1.png`}
                opacity={0.6}
                attribution='&copy; <a href="https://www.rainviewer.com/">RainViewer</a>'
              />)}
            </LayersControl.Overlay>*/}
            <LayersControl.Overlay  checked name="Stations">
              <LayerGroup>
                {
                  station_data ? (
                    Object.entries(station_data).map((station) => {
                      const storm_timestamp = new Date(state.hover_marker.properties["TIMESTAMP"]);
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
              </LayerGroup>
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

          {<RenderSpatialFilter
          ref={clearShapesRef} 
          setPolyFilterCoords={(coords) => dispatch({ type: "SET_POLY_FILTER_COORDS", payload: coords })}
          />} {/* Calling the EditControl function here */}
        </MapContainer>

        { map && (<Drawer
            element_id="left-side"
            classes="left"
            source_type={source_type}
            setStationPoints={setStationPoints}
            state={state}
            dispatch={dispatch}
            map={map}
          />)}
      </div>
    </div>
  )
}