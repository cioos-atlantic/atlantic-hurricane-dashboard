import {windSpeedToKnots, windSpeedToKmh, tempToDegreeF, tempToDegreeC, pressureToKPa, pressureToInHg, windHeightToM, windHeightToFt} from './utils/unit_conversion.js'
import Image from "next/image";
//TODO: Clean up


export function formatCioosStations(data_obj, children){
  const attributes_of_interest = {
    'sea_surface_wave_significant_height':'Wave Height (Avg)',
    'sea_surface_wave_maximum_height':'Wave Height (Max)'
  }
  // Separate section for wind since the arrows need to be drawn
  if(data_obj['wind_from_direction']){
    const wind_direction = (180 + parseInt(data_obj['wind_from_direction'].value)) % 360
    children.push(<strong>Wind:  </strong>)
    children.push(<Image class="wind_arrow" alt={wind_direction} src="arrow.svg" height={20} width={20} 
      style={{ transform: 'rotate(' + (wind_direction) + 'deg)' }}></Image>)
  }
  if(data_obj['wind_speed']){
    //console.log(data_obj['wind_speed']);
    const resultKmh = windSpeedToKmh(data_obj['wind_speed'].value)
    const resultKnots = windSpeedToKnots(data_obj['wind_speed'].value)
    children.push(<span>    {resultKnots.converted_value} {resultKnots.unit} ({resultKmh.converted_value} {resultKmh.unit})</span>)}


  if(data_obj['air_temperature']){
    //console.log(data_obj['wind_speed']);
    const resultDegreeF = tempToDegreeF(data_obj['air_temperature'].value)
    const resultDegreeC = tempToDegreeC(data_obj['air_temperature'].value)
    children.push(<p><strong>Temperature (Air):</strong> {resultDegreeC.converted_value} {resultDegreeC.unit}   ({resultDegreeF.converted_value} {resultDegreeF.unit})</p>)}


  if(data_obj['sea_surface_temperature']){
    //console.log(data_obj['wind_speed']);
    const resultDegreeF = tempToDegreeF(data_obj['sea_surface_temperature'].value)
    const resultDegreeC = tempToDegreeC(data_obj['sea_surface_temperature'].value)
    children.push(<p><strong>Temperature (Sea Surface):</strong> {resultDegreeC.converted_value} {resultDegreeC.unit} ({resultDegreeF.converted_value} {resultDegreeF.unit})</p>)}

  if(data_obj['relative_humidity']){
    //console.log(data_obj['wind_speed']);

    children.push(<p><strong>Humidity:</strong> {parseInt(data_obj['relative_humidity'].value)}%</p>)}

  if(data_obj['air_pressure']){
    //console.log(data_obj['wind_speed']);
    const resultKPa = pressureToKPa(data_obj['air_pressure'].value)
    const resultInHg = pressureToInHg(data_obj['air_pressure'].value)
    children.push(<p><strong>Air Pressure:</strong> {resultKPa.converted_value} {resultKPa.unit} ({resultInHg.converted_value} {resultInHg.unit})</p>)}

  if(data_obj['sea_surface_wave_maximum_height']){
    //console.log(data_obj['wind_speed']);
    const resultM = windHeightToM(data_obj['sea_surface_wave_maximum_height'].value)
    const resultFt = windHeightToFt(data_obj['sea_surface_wave_maximum_height'].value)
    children.push(<p><strong>Wave Height (Max):</strong> {resultM.converted_value} {resultM.unit} ({resultFt.converted_value} {resultFt.unit})</p>)}

  if(data_obj['sea_surface_wave_significant_height']){
    //console.log(data_obj['wind_speed']);
    const resultM = windHeightToM(data_obj['sea_surface_wave_significant_height'].value)
    const resultFt = windHeightToFt(data_obj['sea_surface_wave_significant_height'].value)
    children.push(<p><strong>Wave Height (Avg):</strong> {resultM.converted_value} {resultM.unit} ({resultFt.converted_value} {resultFt.unit})</p>)}

    

  /*Object.entries(attributes_of_interest).forEach(entry =>{
    const key = entry[0]
    const val = entry[1]
    if(data_obj[key] && data_obj[key].value){
        children.push(<p><strong>{val}:</strong> {(parseFloat(data_obj[key].value).toFixed(1))} {data_obj[key].units}</p>)}
  })
  //return children*/
}

export function formatCioosDateTime(date_str){
  const date = new Date(date_str * 1);
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit',
    timeZoneName: 'short'
};

  const timestamp = date.toLocaleString('en-US', options);
  return timestamp
}