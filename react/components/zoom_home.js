import { useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";
import "leaflet.zoomhome/dist/leaflet.zoomhome.js";


const defaultPosition = [46.9736, -54.69528]; // Mouth of Placentia Bay
const defaultZoom = 4

export default function ZoomHomeControl() {
  const map = useMap();

  useEffect(() => {
    const control = L.Control.zoomHome({
      position: "topright",
      homeCoordinates: defaultPosition,
      homeZoom: defaultZoom,
      
    });

    map.addControl(control);

    return () => map.removeControl(control);
  }, [map]);

  return null;
}