//import styles from './active_storm_list.module.css'
//import { parse, format } from 'date-fns';
//import storm_list from '../data/forecasts/list.json'
import CustomButton from '../custom/custom-button.js';
import { addDays, subDays, lightFormat } from "date-fns";

//import {forecastDataDir, getStormData} from '../../lib/storms.js';

const storm_list = [
  { "name": "FIONA", "year": 2022, "source":"eccc" },
  { "name": "ERNESTO", "year": 2018, "source":"eccc" },
  { "name": "EARL", "year": 2022, "source":"eccc" },
  { "name": "LEE", "year": 2017, "source":"eccc" },
  { "name": "IRMA", "year": 2017, "source":"eccc" },
  { "name": "BLAMMO", "year": 1999, "source":"ibtracs" },
  { "name": "CLAUDETTE", "year": 2015, "source":"ibtracs" },
  
]

export default function HistoricalStormList({onHarvestData}) {
  onHarvestData= onHarvestData
  console.log("Historical Storms Loading...");

  
  //console.log(storm_list)

  return (
    <>
      <h2>Historical Storms: </h2>
      <div id="storm_search_result">

        <ul className="results">
        {storm_list.map((storm, index) => {
          return (
            <li key={storm.name + storm.year} className={(storm.name)}>
              <a onClick={(e) => {handleClick(storm, onHarvestData)}}>{`${storm.name}-${storm.year}`}</a>
            </li>
          )
        })}
      </ul>
      </div>
    </>
  );


}

export async function handleClick(storm, onHarvestData)  {
  console.log('Button clicked for', storm.name);
  const storm_name= storm.name;
  const storm_year= storm.year;

  let storm_source;
  
  // if condition because of what list.json looks like eccc instead of ECCC
  if (storm.source === 'eccc'){
    storm_source = "ECCC";
  }
  else if (storm.source === 'ibtracs'){
    storm_source = "IBTRACS"
  }
  //console.log(storm_source)


  // Construct query parameters
  const query = new URLSearchParams({
    name: storm_name,
    season: storm_year,      // Using season for storm year
    source: storm_source
  }).toString();

  //const resource = await fetch(process.env.BASE_URL + '/api/historical_storms')

  // process.env reading empty

  //console.log(process)
  try {
  const resource = await fetch(`/api/historical_storms?${query}`);
  
  const historical_storm_data = await resource.json();
  //const [min_lon, min_lat, max_lon, max_lat, max_storm_time, min_storm_time] = getStationQueryParams (historical_storm_data)

  //console.log(min_lon, min_lat, max_lon, max_lat, max_storm_time, min_storm_time);

  //const historical_station_data = await getStationData(min_lon, min_lat, max_lon, max_lat, max_storm_time, min_storm_time )

  //console.log(historical_station_data)
  const station_resource = await fetch(`/api/query_stations_historical?${query}`);
  const historical_station_data = await station_resource.json();

   // Trigger the callback to send data back to the parent
   if (onHarvestData) {
    onHarvestData({ 
      storm_data: historical_storm_data,
      station_data: historical_station_data });
  }
  } catch (error) {
    console.error('Error fetching storm or station data:', error);
  }

  
};

async function getStationData(min_lon, min_lat, max_lon, max_lat, max_storm_time, min_storm_time ){
  const query = new URLSearchParams({
    min_time: min_storm_time,
    max_time: max_storm_time, 
    min_lon,
    min_lat,
    max_lon,
    max_lat
  }).toString();

  //const resource = await fetch(process.env.BASE_URL + '/api/historical_storms')

  // process.env reading empty

  //console.log(process)
  const resource = await fetch(`/api/query_stations_historical?${query}`);
  
  const historical_station_data = await resource.json();

  console.log(historical_station_data);
  return historical_station_data

   // Trigger the callback to send data back to the parent


};

function getStationQueryParams (historical_storm_data){
  const [min_lon, min_lat, max_lon, max_lat] = historical_storm_data.ib_data.bbox.map(num => num.toString());

  const storm_id= historical_storm_data.ib_data.features['0'].id;
  const [_, __, storm_time] = storm_id.split('.');
  console.log(storm_time)

  const max_storm_time= lightFormat(addDays(new Date(storm_time), 15), "yyyy-MM-dd'T'00:00:00");
  const min_storm_time= lightFormat(subDays(new Date(storm_time), 15), "yyyy-MM-dd'T'00:00:00");
  console.log(min_lon, min_lat, max_lon, max_lat, max_storm_time, min_storm_time)
  

  return [min_lon, min_lat, max_lon, max_lat, max_storm_time, min_storm_time]

}
