import React, { useEffect, useRef } from 'react';
import { Chart, LineElement, LinearScale, PointElement, CategoryScale, Tooltip, Legend, LineController, BarController, BarElement, Filler, TimeScale } from 'chart.js';
import { storm_graph_color, } from './storm_color';
import { ProgressiveAnimation } from './utils';
import annotationPlugin from 'chartjs-plugin-annotation';
import 'chartjs-adapter-luxon';

//import { graph_colour } from './station_dashboard/station_graph/graph_config.js'




// Register necessary components, including the Line controller
Chart.register(LineController, LineElement, LinearScale, PointElement, CategoryScale, Tooltip, Legend, BarController, BarElement, Filler, annotationPlugin, TimeScale );


/**
 * Renders a line chart using Chart.js to display station data.
 */
function RenderStormChart({ sourceData,  varCategory, timeData, hoverPointTime }) {
  const chartRef = useRef(null); // Reference to the canvas element
  const chartInstance = useRef(null); // Store Chart.js instance

  // Find the index of the given time dynamically
  //const highlightIndex = chartTimeData.indexOf(highlightTime);
  const formattedTimeData = timeData.map(timeString => Date.parse(timeString));
  const datasets = makeDataset(sourceData, formattedTimeData, hoverPointTime);

  useEffect(() => {
    const startAtZero = varCategory === 'Pressure' || 'seaHeight' ? false : true

    const highlightTime = new Date(hoverPointTime).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',   // full month name
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    // Check if the canvas and data are available
    const canvas = chartRef.current;
    if (!canvas || !sourceData) return;

    // Always destroy the existing chart before creating a new one
    if (chartInstance.current) {
      chartInstance.current.destroy();
      chartInstance.current = null;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

      
      // Chart.js configuration
    const chartConfig = {
      type: 'line',
      data: {
        labels: formattedTimeData, // Set the labels (time)
        datasets: datasets, // Set the datasets
      },
      
      options: {
        animation:ProgressiveAnimation(datasets),
        interaction: {
          intersect: false,
          mode: 'index',
        },
        scales: {
          x: {
            grid: {
              display: true, // Show grid on the x-axis
            },
            type: "time",
              time: {
                parser: 'yyyy/MM/dd t',
                tooltipFormat: 'yyyy/MM/dd t',
                unit: "day",
                displayFormats: {
                  'hour':'MM/dd'
                }
              },
              ticks:{
                stepSize: 1
              }
          },
          y: {
            grid: {
              display: true, // Show grid on the y-axis
            },
            beginAtZero: startAtZero,
          },
        },
        responsive: true,
        maintainAspectRatio: true,
        spanGaps:true,
        //maintainAspectRatio: false,
        plugins: {
          annotation: {
            annotations: {
              
            }
          },
          filler: {
            propagate: false,
          },
          legend: {
            position: 'right',
            fullSize: true,
            labels: {
              padding: 5,
              boxWidth: 10,
              font: {
                  size: 10,
              }
            },
          },
        },
      },
    };

    // Create a new chart
    chartInstance.current = new Chart(ctx, chartConfig);
    setTimeout(() => {
      const chart = chartInstance.current;
      if (!chart || !hoverPointTime) return;

      //const yScale = chart.scales.y;
      //const yMin = yScale.min;
      //const yMax = yScale.max;

      // Add annotation using yMin/yMax
      chart.options.plugins.annotation.annotations.line1 = {
        drawTime: 'afterDraw',
        type: 'line',
        xMin: new Date(hoverPointTime),
        xMax: new Date(hoverPointTime),
        //yMin: yMin,
        //yMax: yMax,
        borderColor: 'black',
        borderWidth: 2,
        borderDash: [5,2],
        label: {
          display: true,
          content: `Hovered Date: ${highlightTime}`,
          position: 'end', // options: 'start', 'center', 'end'
          backgroundColor: '#1F1617',
          color: '#fff',
          font: {
            weight: '#1F1617',
            size: 10
          },
          padding: 4
        }
      }
     chart.update();
    }, 500) // set delay to heart's content. Set to anything above 250, 20 cause a very interesting bug

    // Cleanup function to destroy the chart on unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [datasets, varCategory, hoverPointTime]); // Re-run effect if chartData or stationName changes


  return (
    <div className='chart-render'>
    <canvas
      ref={chartRef}
      style={{
        top: 0,
        left: 0,
        
      }}
    />
  </div>
  );
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


function getColour(var_name){
  let colour = '';
  console.log(var_name)
  console.log(storm_graph_color)
  colour = storm_graph_color[var_name] || getRandomColor();
  return colour;
}


//Generate datasets
function makeDataset(dataList, formattedTimeData, hoverPointTime) {
  const datasets=[];
  const hoverTimeStamp = new Date(hoverPointTime).getTime();
  dataList.forEach((dataDict) => {console.log(dataDict);
    Object.entries(dataDict).forEach(([key, value]) => {console.log(key)
      datasets.push({
        label: value.name,
        data: value.data,
        borderColor: getColour(value.name),
        backgroundColor: 'rgba(0, 0, 0, 0)',
        fill: true,
        pointRadius: (context) => {
          const pointTime = new Date(formattedTimeData[context.dataIndex]).getTime();
          return pointTime === hoverTimeStamp ? 10 : 0;
        },
        pointBackgroundColor: (context) => {
          const pointTime = new Date(formattedTimeData[context.dataIndex]).getTime();
          return pointTime === hoverTimeStamp ? '#1F1617' : 'blue';
        },
      })
    })
    })
 
  return datasets;
}

export default React.memo(RenderStormChart);
