import styles from './active_storm_list.module.css'
import { parse, format } from 'date-fns';

export default function ActiveStormList({ active_storm_data, onPopulateStormDetails, selected_storm }) {
  let ib_storm_list = []
  let storm_details = {}
  
  console.log("Selected Storm: " + selected_storm)

  active_storm_data.ib_data.features.map(storm_point => {
    if (!ib_storm_list.includes(storm_point.properties.NAME)) {
      ib_storm_list.push(storm_point.properties.NAME)
      storm_details[storm_point.properties.NAME] = {
        source: "ibtracs", 
        year: storm_point.properties.SEASON, 
        data: []
      }
    }

    storm_details[storm_point.properties.NAME].data.push(storm_point)
  })

  return (
    <>
      <h2>Active Storms: </h2>
      <div id="storm_search_result">
        <ul className="results">
          {ib_storm_list.map(storm_name => {
            return (
              <li key={storm_name + storm_details[storm_name].year} className={(storm_name == selected_storm ? styles.selected_storm : '')}>
                <a onClick={(e) => { onPopulateStormDetails(e, storm_details[storm_name]) }}>{storm_name}</a>
              </li>
            )
          })}
        </ul>
      </div>
    </>
  )
}