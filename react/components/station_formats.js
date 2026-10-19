import {convert_unit_data, toKmh, toKPa} from './utils/unit_conversion.js'
import Image from "next/image";
import attributes from '../data/station/attributes.json'
import { basePath } from '@/next.config.js';
//TODO: Clean up


export function formatCioosStations(data_obj, children, row_position, isHistorical=false){
  // Get the data value in the specified column in the object's row
  let data_value = (column_name) => {
    if(!row_data[row_position]) return null
    const col_index = column_data.indexOf(column_name)
    return col_index > -1 ? row_data[row_position][col_index] : null
  }

  let max_value = (column_name) => {
    const col_index = column_data.indexOf(column_name)
    return col_index > -1 ? Math.max.apply(Math, row_data.map(v => v[col_index])) :
      null
  }

  let min_value = (column_name) => {
    const col_index = column_data.indexOf(column_name)
    return col_index > -1 ? Math.min.apply(Math, row_data.map(v => v[col_index])) :
      null
  } 

  // Conversion handling, but just in case
  let column_units = (column_name) => {
    const col_index = column_data.indexOf(column_name)
    return col_index > -1 ? unit_data[col_index] : null
  }

  const column_data = data_obj['column_std_names']
  const unit_data = data_obj['column_units']
  const row_data = data_obj['rows']

  // Separate section for wind since the arrows need to be drawn
  //Possible to do this in a loop?

  const datetime = data_value('time')

  if(isHistorical){
    children.push(<strong>Data Period: </strong>)
    children.push(<br></br>)
    children.push(<span>{formatCioosDateTime(min_value('time'))} to </span>)
    children.push(<span>{formatCioosDateTime(max_value('time'))}</span>)
  }
  else{
    children.push(<strong>Last Updated: </strong>)
    children.push(<span>{formatCioosDateTime(datetime)}</span>)
  }
  //children.push(<br></br>)
  children.push(<p></p>)
  
  const historic_prefix_max = isHistorical ? "Highest " : ""
  const historic_prefix_min = isHistorical ? "Lowest " : ""

  const wind_from_direction = data_value('wind_from_direction')
  wind_from_direction ? (180 + parseInt(wind_from_direction)) % 360 : null
  if(wind_from_direction){
    const wind_direction = (180 + parseInt(wind_from_direction)) % 360
    children.push(<strong title={attributes.wind_from_direction.definition}>Wind Direction:  </strong>)
    children.push(<Image className="wind_arrow" alt={wind_direction} src={`${basePath}/arrow.svg`} height={20} width={20} 
      style={{ transform: 'rotate(' + (wind_direction) + 'deg)' }}></Image>)
    children.push(<p></p>)
    //children.push(<br></br>)
  }
  
  const wind_speed = isHistorical ? max_value('wind_speed') : data_value('wind_speed') 
  if(wind_speed){
    wind_from_direction ? children.push(<br />) : null
    children.push()
    const resultKmh = convert_unit_data(wind_speed, column_units('wind_speed'), 'km/h')
    const resultKnots = convert_unit_data(wind_speed, column_units('wind_speed'), 'knots')
    children.push(<p><span title={attributes.wind_speed.definition}><strong>{historic_prefix_max}Wind Speed:  </strong>{resultKmh.value} {resultKmh.unit} ({resultKnots.value} {resultKnots.unit})</span></p>)}
  
  const wind_speed_of_gust = isHistorical ? max_value('wind_speed_of_gust') : data_value('wind_speed_of_gust')
  if(wind_speed_of_gust){
    const resultKmh = convert_unit_data(wind_speed_of_gust, column_units('wind_speed_of_gust'), 'km/h')
    const resultKnots = convert_unit_data(wind_speed_of_gust, column_units('wind_speed_of_gust'), 'knots')
    
    children.push(<p><span title={attributes.wind_speed_of_gust.definition}><strong>{historic_prefix_max}Gust Speed: </strong>{resultKmh.value} {resultKmh.unit} ({resultKnots.value} {resultKnots.unit})</span></p>)}
  
  const air_temperature = isHistorical ? max_value('air_temperature') : data_value('air_temperature')
  if(air_temperature){
    const resultDegreeF = convert_unit_data(air_temperature, column_units('air_temperature'),'°F')
    const resultDegreeC = convert_unit_data(air_temperature, column_units('air_temperature'),'°C')
    
    children.push(<p><span title={attributes.air_temperature.definition}><strong>{historic_prefix_max}Temperature (Air):</strong> {resultDegreeC.value} {resultDegreeC.unit}   ({resultDegreeF.value} {resultDegreeF.unit})</span></p>)}

  const sea_surface_temperature = isHistorical ? max_value('sea_surface_temperature') : data_value('sea_surface_temperature')
  if(sea_surface_temperature){
    const resultDegreeF = convert_unit_data(sea_surface_temperature, column_units('sea_surface_temperature'),'°F')
    const resultDegreeC = convert_unit_data(sea_surface_temperature, column_units('sea_surface_temperature'),'°C')
    
    children.push(<p><span title={attributes.sea_surface_temperature.definition}><strong>{historic_prefix_max}Temperature (Sea Surface):</strong> {resultDegreeC.value} {resultDegreeC.unit} ({resultDegreeF.value} {resultDegreeF.unit})</span></p>)}

  const sea_surface_wave_maximum_height = isHistorical ? max_value('sea_surface_wave_maximum_height') : data_value('sea_surface_wave_maximum_height')
  if(sea_surface_wave_maximum_height){
    const resultM = convert_unit_data(sea_surface_wave_maximum_height, column_units('sea_surface_wave_maximum_height'),'m')
    const resultFt = convert_unit_data(sea_surface_wave_maximum_height, column_units('sea_surface_wave_maximum_height'),'ft')
    
    children.push(<p><span title={attributes.sea_surface_wave_maximum_height.definition}><strong>{historic_prefix_max}Wave Height (Max):</strong> {resultM.value} {resultM.unit} ({resultFt.value} {resultFt.unit})</span></p>)}
  
  const sea_surface_wave_significant_height = isHistorical ? max_value('sea_surface_wave_significant_height') : data_value('sea_surface_wave_significant_height')
  if(sea_surface_wave_significant_height){
    const resultM = convert_unit_data(sea_surface_wave_significant_height, column_units('sea_surface_wave_significant_height'),'m')
    const resultFt = convert_unit_data(sea_surface_wave_significant_height, column_units('sea_surface_wave_significant_height'),'ft')
    
    children.push(<p><span title={attributes.sea_surface_wave_significant_height.definition}><strong>{historic_prefix_max}Wave Height (Avg):</strong> {resultM.value} {resultM.unit} ({resultFt.value} {resultFt.unit})</span></p>)}

  const air_pressure = isHistorical ? min_value('air_pressure') : data_value('air_pressure')
  if(air_pressure){
    const resultKPa = convert_unit_data(air_pressure, column_units('air_pressure'),'kPa')
    const resultInHg = convert_unit_data(air_pressure, column_units('air_pressure'),'inHg')
    
    children.push(<p><span title={attributes.air_pressure.definition}><strong>{historic_prefix_min}Air Pressure:</strong> {resultKPa.value} {resultKPa.unit} ({resultInHg.value} {resultInHg.unit})</span></p>)}

    
  const relative_humidity = isHistorical ? max_value('relative_humidity') : data_value('relative_humidity')
  if(data_obj['relative_humidity']){
    
    children.push(<p><span title={attributes.relative_humidity.definition}><strong>Humidity:</strong> {parseInt(relative_humidity)}%</span></p>)
  }
}


  /**
 * Converts a Unix timestamp to a human-readable date and time string.//++
 */
export function formatCioosDateTime(date_str){
  const date = new Date(date_str * 1);
  const options = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit',
    timeZoneName: 'short'
  };

  const timestamp = date.toLocaleString('en-US', options);
  return timestamp
}


/**
 * Parses and converts raw station data into a structured format.//+
 */
export function parseData(fullStationData) {

  let stationDataTable = {}; 

  Object.entries(fullStationData).forEach(([station_name, station_details]) => {
    const stationBbox = station_details.bbox;

    const stationEntries= station_details.properties.station_data;

    if (!stationDataTable[station_name]) {
      stationDataTable[station_name] = { 
        bbox: stationBbox,
        data: {} };}  // Initialize the station entry if not found


    const station_data = stationDataTable[station_name].data;

    stationEntries.column_std_names.forEach((variable) =>{

      let index = stationEntries.column_std_names.indexOf(variable);
      station_data[variable]= {
        column_long_names: stationEntries.column_long_names[index],
        column_std_names: stationEntries.column_std_names[index],
        column_names: stationEntries.column_names[index],
        column_units: stationEntries.column_units[index],
        value:[]

      };


      stationEntries.rows.forEach((list) =>{
        station_data[variable].value.push(list[index])
      });
    })



  });
  const convertedStationData= dataConversion(stationDataTable);


  return convertedStationData 
}

/**
 * Converts raw station data into a structured format with converted units.
 */
function dataConversion(stationDataTable){
  let rawStationData = { ...stationDataTable }; // make deep copy

  Object.entries(rawStationData).forEach(([stationName, stationData]) => {
    const station = stationData.data
    Object.entries(station).forEach(([key, variable]) => {
      if (!Array.isArray(variable.value)) {
        variable.value= [variable.value]}

      if (key === 'air_pressure'){
        variable.units = 'kPa';
        variable.value = variable.value.map(v => {
          const resultKPa = toKPa(v);

          return resultKPa.value}); 
      }
      if (key === 'wind_speed'){
        variable.units = 'Kmh';
        variable.value = variable.value.map(v => {
          const resultKmh = toKmh(v);

          return resultKmh.value}); 
      }

      if (key === 'wind_speed_of_gust'){
        variable.units = 'Kmh';
        variable.value = variable.value.map(v => {
          const resultKmh = toKmh(v);

          return resultKmh.value}); 
      }

    })

  })
  return rawStationData

}
/**
 * Retrieves the bounding box (bbox) of a storm's track data.
 *
 */
export function getStormBbox (storm_data){
  const bbox = storm_data["pts"]["features"]['0'].bbox;
  return bbox;
}
