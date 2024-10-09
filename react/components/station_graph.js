import React, { useEffect, useRef } from 'react';
import { Chart, LineElement, LinearScale, PointElement, CategoryScale, Tooltip, Legend, LineController } from 'chart.js';
import {windSpeedToKnots, windSpeedToKmh, tempToDegreeF, tempToDegreeC, pressureToKPa, pressureToInHg, windHeightToM, windHeightToFt} from './utils/unit_conversion.js'

// Register necessary components, including the Line controller
Chart.register(LineController, LineElement, LinearScale, PointElement, CategoryScale, Tooltip, Legend);

function RenderChart({ chartData, stationName }) {
  console.log(chartData.data)
  const chartRef = useRef(null); // Reference to the canvas element

  useEffect(() => {
    // Check if chartData is available
    if (chartData && chartData.data && Object.keys(chartData.data).length > 0) {
      const ctx = chartRef.current.getContext('2d'); // Get context for the canvas

      
      //console.log(chartData.data.time.value)
      if (!Array.isArray(chartData.data.time.value)) {
        chartData.data.time.value= [chartData.data.time.value]}
      

        // Time data
      const timeData = chartData.data.time.value.map((timestamp) => new Date(timestamp).toLocaleString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                                //day: '2-digit',
                                //month: '2-digit',
                                //year: 'numeric'
      }));

      // Prepare datasets for each variable, excluding 'time'
      const datasets = Object.entries(chartData.data)
        .filter(([key]) => key !== 'time') // Exclude 'time' from datasets
        .map(([key, variable]) => {
          console.log(`Processing key: ${key}`); // Log the key being processed
          if (!Array.isArray( variable.value)) {
            variable.value= [ variable.value]}
          
          if (key === 'air_pressure'){
            variable.units = 'kPa';
            variable.value = variable.value.map(v => {
              const resultKPa = pressureToKPa(v);
              console.log(`Value: ${v}, Converted: ${resultKPa.converted_value}`);
              return resultKPa.converted_value}); 
          }
          return{
          label: `${variable.std_name} (${variable.units})` || key, //  std_name if available
          data: variable.value || [], // Ensure that value exists
          borderColor: getRandomColor(), // Generate random colors for each line
          backgroundColor: 'rgba(0, 0, 0, 0)',
          fill: false,
        };});

      // Chart.js configuration
      const chartConfig = {
        type: 'line',
        data: {
          labels: timeData, // Set the labels (time)
          datasets: datasets, // Set the datasets
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
            },
          },
          responsive: true,
          //maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
            },
            title: {
              display: true,
              text: `Data for ${stationName}`,
            },
          },
        },
      };

      // Destroy the previous chart if it exists
      if (chartRef.current.chart) {
        chartRef.current.chart.destroy();
      }

      // Create a new chart
      chartRef.current.chart = new Chart(ctx, chartConfig);
    }

    // Cleanup function to destroy the chart on unmount
    return () => {
      if (chartRef.current.chart) {
        chartRef.current.chart.destroy();
      }
    };
  }, [chartData, stationName]); // Re-run effect if chartData or stationName changes

  return <canvas ref={chartRef} style={{ width: '700px', height: '400px' }} />; // Render the canvas
}

// Function to generate a random color for chart lines
const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};


export default React.memo(RenderChart);
