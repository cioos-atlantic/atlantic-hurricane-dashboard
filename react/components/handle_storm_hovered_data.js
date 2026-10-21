import { basePath } from "@/next.config";

/**
 * The function `handleStormHoveredData` extracts information from a point object representing a storm
 * and logs the storm's time.
 */
export function handleStormHoveredData(point){
  const stormId= point.id;
  const [stormSource, code, stormTime] = stormId.split('.');

  //TODO
  // not full proof expand for is no retrieve USA lat and lon if lat & lon not available


  const stormName= point.properties.Name;
  const stormLat= point.properties.LAT;
  const stormLon= point.properties.LON;


  

}
  //passStormData(point)}
  // Construct query parameters
  
  
/**
 * The function `passStormData` takes storm time, latitude, and longitude as input parameters,
 * constructs a query string, fetches historical station data based on the query, and logs the
 * retrieved data.

 */
export async function passStormData(stormTime, stormLat, stormLon ){
  const query = new URLSearchParams({
    time: stormTime,
    lat: stormLat,      // Using season for storm year
    lon: stormLon
  }).toString();

  //const resource = await fetch(process.env.BASE_URL + '/api/historical_storms')

  // process.env reading empty

  const resource = await fetch(`${basePath}/api/query_stations_historical?${query}`);
  
  const historical_station_data = await resource.json();


   // Trigger the callback to send data back to the parent


};