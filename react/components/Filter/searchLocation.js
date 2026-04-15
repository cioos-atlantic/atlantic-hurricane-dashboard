import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

import "leaflet-control-geocoder";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";

export default function SearchControl() {
  console.debug("Rendering SearchControl component...");
  const map = useMap();

  useEffect(() => {
    const geocoder = L.Control.geocoder({
      position: "bottomleft",
      defaultMarkGeocode: false,
      placeholder: "Search location...",
      
    })
      /*.on("markgeocode", function (e) {
        const bbox = e.geocode.bbox;
        console.debug("Geocode result: ", e.geocode);
        map.fitBounds(bbox);
      })*/

      .on("markgeocode", function (e) {
        const center = e.geocode.center;
        L.marker(center).addTo(map);
        map.setView(center, 10);
      })
      .addTo(map);

    return () => {
      map.removeControl(geocoder);
    };
  }, [map]);

  return null;
}