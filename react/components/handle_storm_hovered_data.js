export function handleStormHoveredData(point){
  //console.log(point);
  const stormId= point.id;
  const [stormSource, code, stormTime] = stormId.split('.');

  //TODO
  // not full proof expand for is no retrieve USA lat and lon if lat & lon not available


  const stormName= point.properties.Name;
  const stormLat= point.properties.LAT;
  const stormLon= point.properties.LON;


  

  console.log(stormTime)}
  //passStormData(point)}
  // Construct query parameters
  
  
export async function passStormData(stormTime, stormLat, stormLon ){
  const query = new URLSearchParams({
    time: stormTime,
    lat: stormLat,      // Using season for storm year
    lon: stormLon
  }).toString();

  //const resource = await fetch(process.env.BASE_URL + '/api/historical_storms')

  // process.env reading empty

  //console.log(process)
  const resource = await fetch(`/api/query_stations_historical?${query}`);
  
  const historical_station_data = await resource.json();

  console.log(historical_station_data);

   // Trigger the callback to send data back to the parent


};