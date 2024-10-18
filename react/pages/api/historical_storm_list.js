//import styles from './active_storm_list.module.css'
//import { parse, format } from 'date-fns';
import storm_list from '../../data/forecasts/list.json'
import CustomButton from '../../custom/custom-button.js';
//import {forecastDataDir, getStormData} from '../../lib/storms.js';

export default function HistoricalStormList() {
  console.log("historical")
  //console.log(storm_list)

  return (
    <>
      <h2>Historical Storms: </h2>
      <div id="storm_search_result">

        <ul className="results">
        {storm_list.map((storm, index) => {
          return (
            <li key={storm.name + storm.year} className={(storm.name)}>
              <a onClick={(e) => {handleClick(storm)}}>{`${storm.name}-${storm.year}`}</a>
            </li>
          )
        })}
      </ul>
      </div>
    </>
  );


}

export async function handleClick(storm)  {
  console.log('Button clicked for', storm.name);
  const storm_name= storm.name;
  const storm_year= storm.year;
  const storm_source = storm.source;

  // Construct query parameters
  const query = new URLSearchParams({
    name: storm_name,
    season: storm_year,      // Using season for storm year
    source: storm_source
  }).toString();

  //const resource = await fetch(process.env.BASE_URL + '/api/historical_storms')

  // process.env reading empty

  //console.log(process)
  const resource = await fetch(`/api/historical_storms?${query}`);
  console.log(resource);
  const historical_storm_data = await resource.json();

  console.log(historical_storm_data);

  


  if (storm_source === "eccc"){
    //const storm_data = getStormData(storm_name, storm_source)

    //console.log(storm_data)
    
  }
};
