import React, { useEffect, useRef, useState, useMemo } from 'react';
import { get_station_field_data, get_station_field_units, getColumnNameList, getUniqueStdNamesList } from '../utils/station_data_format_util';
import { convert_unit_data } from '../utils/unit_conversion';

export const windSpeedBins = [
  { min: 0, max: 62, label: "< 63 km/h" },
  { min: 63, max: 117, label: "63–117 km/h" },
  { min: 118, max: 153, label: "118–153 km/h" },
  { min: 154, max: 177, label: "154–177 km/h" },
  { min: 178, max: 208, label: "178–208 km/h" },
  { min: 209, max: 251, label: "209–251 km/h" },
  { min: 252, max: Infinity, label: "≥ 252 km/h" }
];
export const colorPalette= [
  '#5E4FA2', // Deep Purple
'#3288BD', // Blue
'#66C2A5', // Teal
'#ABDDA4', // Light Green
'#FEE08B', // Yellow
'#FDAE61', // Orange
'#F46D43', // Red-Orange
'#D53E4F', // Deep Red
'#808080', // grey - unknown storms
];

export const cardinalPoints = [
  'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW',
];



/**
 * The function categorizeWindDirection converts a wind direction angle into a cardinal direction
  * @returns The function `categorizeWindDirection` takes a numerical direction value and categorizes it
 * into one of the cardinal wind directions (e.g., N, NE, E, etc.). The function calculates the index
 * of the corresponding cardinal direction based on the input direction value and returns the cardinal
 * direction as a string.
 */
export function categorizeWindDirection(direction) {
  const cardinalPoints = [
    'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW',
  ];
  const sectors = 360 / cardinalPoints.length;
  const index = Math.round(direction / sectors) % cardinalPoints.length;
  return cardinalPoints[index];
}

/**
 * The function categorizeWindSpeed(speed) categorizes wind speeds into predefined bins and returns the
 * corresponding label.
 
 * @returns The function `categorizeWindSpeed` returns the label of the wind speed bin that the input
 * speed falls into. If the input speed does not match any bin, it returns "Unknown".
 */
export function categorizeWindSpeed(speed) {
  for (const bin of windSpeedBins) {
    if (speed >= bin.min && (bin.max === undefined || speed < bin.max)) {
      return bin.label; // Return the label instead of the index
    }
  }
  return "Unknown"; // For speeds that don't match any bin
}



/**
 * The function `makeEmptyfreqObj` creates an empty frequency object with cardinal points as keys and
 * arrays of zeros as values.
 * @returns The function `makeEmptyfreqObj` is returning an object `freqObj` that has keys representing
 * cardinal points and values as arrays filled with zeros based on the length of the `windSpeedBins`
 * array.
 */
export function makeEmptyfreqObj(windSpeedBins, cardinalPoints){
  const freqObj =  {};
  cardinalPoints.forEach((point)=>{
    freqObj[point] = new Array(windSpeedBins.length).fill(0);});
  

  return freqObj
  
}

/**
 * The function `makeFreqFraction` calculates the frequency fraction of each data point in a given object based on the total number of data points.
 * @returns The function `makeFreqFraction` returns a modified version of the `freqObj` object where
 * each value has been converted to a frequency fraction based on the `totalDataPoints`. The values in
 * the object have been transformed to represent the percentage of the total data points that they
 * account for.
 */
export function makeFreqFraction(freqObj, totalDataPoints){
  const freqFrac= structuredClone(freqObj);

  Object.values(freqFrac).forEach((point) =>{


    point.forEach((value, index) => {
      
      point[index] = (value / totalDataPoints) * 100

    });
  });

  return freqFrac
};

/**
 * The function `extractWindSpeedBins` extracts and returns an array of wind speed labels from a given a set of wind speed bins.

 */
export function extractWindSpeedBins(){
  const windSpdLabel= []
    
    windSpeedBins.forEach((obj) =>
      {windSpdLabel.push(obj.label)})

    return windSpdLabel
};

/**
 * The function `makeGroupedList` takes arrays of wind directions and speeds, categorizes them, and
 * returns a list of objects with wind speed, speed bin, direction, and cardinal direction.
 
 */
export function makeGroupedList(directions, speeds){
    const groupedList = [];
    directions.forEach((direction, index) => {
    
        const cardinal = categorizeWindDirection(direction);
        const speedBin = categorizeWindSpeed(speeds[index]);
    
        groupedList.push({
          windSpeed : speeds[index],
          speedBin : speedBin,
          direction : direction,
          cardinal : cardinal,
        });
      });

    return groupedList

}

/**
 * The function `processWindSpeeds` processes wind speed data from a source and stores it in an object with unique keys like "wind_speed_1", "wind_speed_2",
 * etc.
 */
export function processWindSpeeds(sourceData){
    const include_var = [ "wind_speed"]
    // Initialize the result object
    const windSpeed = {};
    const  column_names = sourceData.column_names;
  
    const column_std_names = sourceData.column_std_names;
    const uniqueColStdNames= getUniqueStdNamesList(column_std_names);
  
    uniqueColStdNames.filter((variable) => include_var.includes(variable))
    .forEach((variable, index) => {
      const column_names_list = getColumnNameList(column_std_names, column_names, variable)


      column_names_list.forEach(col_name => {
        const station_data_obj = get_station_field_data(sourceData, col_name);
        const data_unit = get_station_field_units(sourceData, col_name);
        let values = station_data_obj.data;
        if (data_unit !== 'km/h'){
          values= values.map((value)=> {
            
            const converted_value = convert_unit_data(value, data_unit, 'km/h');
            return converted_value.value
          })
        }


        const long_name= station_data_obj.long_name;

    
        // Store each instance of wind_speed with a unique name like "wind_speed_1", "wind_speed_2", etc.
        windSpeed[long_name] = values;
      });
  
    });
  
    return windSpeed;
  }
  
/**
 * The function `parseWindData` takes frequency fraction data and wind speed labels, and organizes them
 * into an array of objects with direction, value, and wind speed bin properties.

 * @returns The `parseWindData` function returns an array of objects containing wind data. Each object
 * in the array has the properties `direction`, `value`, and `windSpeedBin`. The `direction` property
 * corresponds to the key from the `freqFrac` object, the `value` property corresponds to the value at
 * a specific index in the points array, and the `windSpeedBin` property
 */
export function parseWindData(freqFrac, windSpdLabel){
    const data = [];
    Object.entries(freqFrac).forEach(([key, points]) => {

        points.forEach((value, index)=> {
            data.push(
                {
                direction: key,
                    value: value,
                    windSpeedBin: windSpdLabel[index]
                }
            )
        })
    });
    return data;

}
