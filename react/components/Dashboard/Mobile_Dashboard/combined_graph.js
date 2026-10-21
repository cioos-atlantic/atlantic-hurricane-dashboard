import React, { useEffect, useRef } from 'react';
import { Chart, LineElement, LinearScale, PointElement, CategoryScale, Tooltip, Legend, LineController, BarController, BarElement, Filler, TimeScale } from 'chart.js';
import { storm_graph_color } from '../../storm_dashboard/storm_color';
import { keyframes } from '@emotion/react';
import { ProgressiveAnimation } from '../../storm_dashboard/utils';
import annotationPlugin from 'chartjs-plugin-annotation';
import 'chartjs-adapter-luxon';
import { combined_graph_color } from './chart_color';

//import { graph_colour } from './station_dashboard/station_graph/graph_config.js'

// Register necessary components, including the Line controller
Chart.register(LineController, LineElement, LinearScale, PointElement, CategoryScale, Tooltip, Legend, BarController, BarElement, Filler, annotationPlugin, TimeScale);


/**
 * Renders a line chart using Chart.js to display station data.
 */
function RenderCombinedChart({ sourceData, varCategory, timeData, hoverPointTime }) {
  const chartRef = useRef(null); // Reference to the canvas element
  const chartInstance = useRef(null); // Store Chart.js instance

  const datasets = makeDataset(sourceData, varCategory);

  // Find the index of the given time dynamically
  //const highlightIndex = chartTimeData.indexOf(highlightTime);
  useEffect(() => {
    const startAtZero = varCategory === 'Pressure' || 'seaHeight' ? false : true;
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
    if (!canvas || !datasets) return;

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
        labels: timeData, // Set the labels (time)
        datasets: datasets, // Set the datasets
      },

      options: {
        animation: ProgressiveAnimation(datasets),
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
                'hour': 'MM/dd'
              }
            },
            ticks: {
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
        maintainAspectRatio: false, 
        spanGaps: true,
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
        borderColor: 'rgb(255, 99, 132)',
        borderWidth: 2,
        borderDash: [5, 2],
        label: {
          display: true,
          content: `Hovered Date: ${highlightTime}`,
          position: 'end', // options: 'start', 'center', 'end'
          backgroundColor: 'rgba(255,99,132,0.8)',
          color: '#fff',
          font: {
            weight: 'bold',
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
  }, [datasets, timeData, varCategory, hoverPointTime]); // Re-run effect if chartData or stationName changes


  return (
    <div className='chart-box'>
      <canvas ref={chartRef} />
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

function getColour(graph_colour_list, var_name, indx) {
  let colour = '';

  colour = var_name in graph_colour_list ? combined_graph_color[var_name][indx] : getRandomColor()
  return colour;
}

//Generate datasets
function makeDataset(dataList, varCategory) {
  const datasets = [];
  var graph_colour_list = {}
  Object.assign(graph_colour_list, combined_graph_color);

  dataList.forEach((dataDict, index) => {

    Object.entries(dataDict).forEach(([key, value]) => {

      datasets.push({
        label: value.name,
        data: value.data,
        borderColor: getColour(graph_colour_list, varCategory, index),
        backgroundColor: 'rgba(0, 0, 0, 0)',
        fill: true,
        pointRadius: (context) => {
          return 0;
        },
      })
    })
  })

  return datasets;
}

export default React.memo(RenderCombinedChart);
