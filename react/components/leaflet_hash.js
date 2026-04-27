import L from "leaflet";
import "leaflet-hash";
import { useMap } from "react-leaflet";
import { useEffect } from "react";

export function LeafletHash() {
  const map = useMap();

  useEffect(() => {
    if (!map._hash) {
      map._hash = new L.Hash(map);
    }
  }, [map]);

  return null;
}

 