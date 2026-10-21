import React, { useState, useRef, forwardRef, useImperativeHandle } from "react";
import L from "leaflet";
import {
  
  FeatureGroup
} from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import { useFilterDispatch } from "./FilterContext";
import { filterActions } from "./filterReducer";
import 'leaflet-draw/dist/leaflet.draw.css';

export const RenderSpatialFilter = forwardRef(function RenderSpatialFilter (props, ref) {
  const filterDispatch = useFilterDispatch();
  const setPolyFilterCoords = (coords) => filterDispatch(filterActions.setPolyFilterCoords(coords));
  const featureGroupRef = useRef(null);
  // Get the FeatureGroup reference
  function clearShapes(){
    const featureGroup = featureGroupRef.current;
    if (featureGroup) {
      // Remove all existing layers (only one shape allowed at a time)
      featureGroup.eachLayer(existingLayer => {
        featureGroup.removeLayer(existingLayer);
      });
    }

  }
  // Expose clearShapes to parent component
  useImperativeHandle(ref, () => ({
      clearShapes
  }));
  



  const _onEdited = e => {
    let numEdited = 0;
    e.layers.eachLayer(layer => {
      numEdited += 1;
    });
     
    

    // this._onChange();
  };

  const _onCreated = e => {
    
    let type = e.layerType;
    let layer = e.layer;
    

    featureGroupRef.current.addLayer(layer);

    
  
     
 
     // Add the new shape
     //featureGroupRef.current.addLayer(layer);

  
    if (type === "rectangle") {
      
    } else if (type === "polygon") {
      
    } 
      const poly = processPolygon(layer.getLatLngs())
      setPolyFilterCoords(poly);


  

  
  };

  const _onDeleted = e => {
    let numDeleted = 0;
    e.layers.eachLayer(layer => {
      numDeleted += 1;
    });
    
    setPolyFilterCoords('');      // Clear polygon filter

    // this._onChange();
  };

  const _onMounted = drawControl => {
  };

  const _onEditStart = e => {
  };

  const _onEditStop = e => {
    const featureGroup = featureGroupRef.current;

    if (featureGroup) {
        featureGroup.eachLayer((layer) => {
            /*if (layer instanceof L.Rectangle) {
                const bbox = processRectangle(layer.getLatLngs());
                setPolyFilterCoords('');
                setBboxFilterCoordinates(bbox);

            } else if (layer instanceof L.Polygon) {
                const poly = processPolygon(layer.getLatLngs());
                setBboxFilterCoordinates('');
                setPolyFilterCoords(poly);
            }*/
                const poly = processPolygon(layer.getLatLngs());
                setPolyFilterCoords(poly);
        });
    }
    
  };

  const _onDeleteStart = e => {
  };

  const _onDeleteStop = e => {
  };

  const _onDrawStart = e => {
    clearShapes(); 
    
  };

  /*onEdited	function	hook to leaflet-draw's draw:edited event
onCreated	function	hook to leaflet-draw's draw:created event
onDeleted	function	hook to leaflet-draw's draw:deleted event
onMounted	function	hook to leaflet-draw's draw:mounted event
onEditStart	function	hook to leaflet-draw's draw:editstart event
onEditStop	function	hook to leaflet-draw's draw:editstop event
onDeleteStart	function	hook to leaflet-draw's draw:deletestart event
onDeleteStop	function	hook to leaflet-draw's draw:deletestop event
onDrawStart	function	hook to leaflet-draw's draw:drawstart event
onDrawStop	function	hook to leaflet-draw's draw:drawstop event
onDrawVertex	function	hook to leaflet-draw's draw:drawvertex event
onEditMove	function	hook to leaflet-draw's draw:editmove event
onEditResize	function	hook to leaflet-draw's draw:editresize event
onEditVertex	function	hook to leaflet-draw's draw:editvertex event*/
  return (
    <FeatureGroup ref={featureGroupRef}>
      <EditControl
        onDrawStart={_onDrawStart}
        position="topright"
        onEdited={_onEdited}
        onEditStop={_onEditStop}
        onCreated={_onCreated}
        onDeleted={_onDeleted}
        draw={{
          polyline: false,
          rectangle: true,
          circlemarker: false,
          circle: false,
          polygon: true,
          marker: false,
        }}
      />
    </FeatureGroup>
  );
});


export function processRectangle(coords){
  const latitudes = coords.flat().map(coord => coord.lat);
  const longitudes = coords.flat().map(coord => coord.lng);


  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLng = Math.min(...longitudes);
  const maxLng = Math.max(...longitudes);

  return `${minLat}_${minLng}_${maxLat}_${maxLng}`

}; 


export function ProcessPolygon({}){};

export function processPolygon(coords){
  coords = coords.flat();
  let polyList = [];
  coords.forEach(point => {
    polyList.push(`${point.lat} ${point.lng}`)
  });

  const first_point = coords[0];

  polyList.push(`${first_point.lat} ${first_point.lng}`);
  
  const polyCoords = polyList.join(",")
  

  return polyCoords;

  

};