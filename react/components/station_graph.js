import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import PropTypes from 'prop-types';

function parseData(chartData) {
  //console.log(JSON.parse(chartData));
  const stationDataTable = {}; 


  const attributes_of_interest = ['sea_surface_wave_significant_height',
    'sea_surface_wave_maximum_height', "wind_speed_of_gust", "air_temperature", "time", "sea_surface_temperature", "wind_speed"]
  const dataObj = chartData.chartData
  //console.log(dataObj)
    //console.log(Object.values(chartData))
  Object.entries(dataObj).forEach(([station_name, station_details]) => {
    //console.log(`Station_name: ${station_name}`);
    //console.log(`station_details: ${station_details.properties.station_data}`);
    const stationEntries= station_details.properties.station_data

    const station_data = JSON.parse(stationEntries);
    //console.log(station_data)


    const re_match = /(?<var_name>[\w_]+)\s\((?<standard_name>[\w_]+)\|(?<units>[\w\s\/()-]+)\|(?<long_name>[\w\s\d\/()]+)\)/g;



    
    

    //let names = undefined;
    let field_value = undefined;
    let field_obj = undefined;
        
    station_data.forEach((row) => {
    //console.log("Row:", row);
      //console.log(Object.keys(row));
      


      Object.keys(row).forEach((field) => {
        //console.log(field)
        
        field_value = row[field]
        //console.log(field_value);
        //console.log(field);
        const names = [...field.matchAll(re_match)];
        if (names.length > 0) {
          field_obj = {};
          //console.log(names[0])

          field_obj.var_name = names[0].groups["var_name"];
          field_obj.std_name = names[0].groups["standard_name"];
          field_obj.units = names[0].groups["units"];
          field_obj.long_name = names[0].groups["long_name"];
          field_obj.value = row[field];}
          
          if (attributes_of_interest.includes(field_obj.std_name)){
            if (!stationDataTable[station_name]) {
              stationDataTable[station_name] = { data: {} };}  // Initialize the station entry if not found
            
            const station = stationDataTable[station_name];
            // Check if the std_name field already exists in the station data
            if (!station.data[field_obj.std_name]) {
                // Create a new entry for this field
              station.data[field_obj.std_name] = field_obj;}
            else {
              // If the field already exists, append the value
              const existingField = station.data[field_obj.std_name];
          
              if (!Array.isArray(existingField.value)) {
                existingField.value = [existingField.value];}
              existingField.value.push(field_obj.value);};
      }});});
      });
    console.log(stationDataTable) 
    return stationDataTable }
    
    //console.log(data_array);
        
function checkStationNameExists (stationName, stationDataTable) {

      const stationNames = Object.keys(stationDataTable);
      //console.log(stationNames)
    
      // Check if the provided station name exists in the list
      return stationNames.includes(stationName);
    };
    

export function RenderChart (chartData, targetStationName) {
  console.log(targetStationName)
  const parsedData= parseData(chartData)
  

  if (checkStationNameExists(targetStationName, parsedData)) {
    console.log(`${targetStationName} exists in the parsed data.`);




  } else {
    console.log(`${targetStationName} does not exist in the parsed data.`);
  }



  // check if station name is part of station names in the parsed data, add error (Station not Found)
  // then check if there is any data (No data)
  // plot chart



      
    /*
      const chartRef = useRef(null);

  useEffect(() => {
    const ctx = chartRef.current.getContext('2d');

    const myChart = new Chart(ctx, {
      type: 'line', // You can change this to 'bar', 'pie', etc.
      data: {
        labels: ['January', 'February', 'March', 'April', 'May', 'June'],
        datasets: [
          {
            label: 'Dataset 1',
            data: [65, 59, 80, 81, 56, 55],
            borderColor: 'rgba(255, 99, 132, 1)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            fill: true,
          },
          {
            label: 'Dataset 2',
            data: [28, 48, 40, 19, 86, 27],
            borderColor: 'rgba(54, 162, 235, 1)',
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            fill: true,
          },
          {
            label: 'Dataset 3',
            data: [18, 48, 77, 9, 100, 67],
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            fill: true,
          },
        ]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
          }
        },
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Station Data',
          },
        },
      },
    });

    return () => {
      myChart.destroy(); // Cleanup chart instance on component unmount
    };
  }, []);

  return (
    <div style={{ width: '400px', margin: 'auto', height: '200px' }}>
      <canvas ref={chartRef} style={{ width: '100%', height: '100%' }}></canvas>
    </div>
  );*/
};
///*
RenderChart.propTypes = {
  chartData: PropTypes.object.isRequired, // Adjust according to your data structure
  targetStationName: PropTypes.string.isRequired,
};//*/


