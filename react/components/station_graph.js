import React, { useEffect, useRef } from 'react';
import { Chart, LineElement, LinearScale, PointElement, CategoryScale, Tooltip, Legend, LineController, TimeScale} from 'chart.js';
import { get_station_field_data, get_station_field_units,  getColumnNameList, getUniqueStdNamesList } from './utils/station_data_format_util';
import { convert_unit_data } from './utils/unit_conversion';
import { graph_colour } from './station_dashboard/station_graph/graph_config.js'
import { ProgressiveAnimation } from './storm_dashboard/utils';
import annotationPlugin from 'chartjs-plugin-annotation';
import 'chartjs-adapter-luxon';

// Register necessary components, including the Line controller
Chart.register(LineController, LineElement, LinearScale, PointElement, CategoryScale, Tooltip, Legend, annotationPlugin, TimeScale);


/**
 * Renders a line chart using Chart.js to display station data.
 */
function RenderChart({ sourceData, position, stationName, varCategory, hoverPointTime }) {


  const chartRef = useRef(null); // Reference to the canvas element

  const startAtZero = varCategory === 'air_pressure' ? false : true
  
  useEffect(() => {
    // Check if chartData is available
    if (sourceData && sourceData.rows.length > 0) {
      const ctx = chartRef.current.getContext('2d'); // Get context for the canvas
      
      console.log(hoverPointTime);
      const highlightTime = new Date(hoverPointTime).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',   // full month name
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    
      });

      console.log(hoverPointTime);
      
      const chartData = parseChartData(sourceData, varCategory, hoverPointTime);
      console.log(chartData);
      const datasets = chartData.datasets;
      const timeData = chartData.timeData;

      
    
        
      // Chart.js configuration
      const chartConfig = {
        type: 'line',
        data: {
          labels: timeData, // Set the labels (time)
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
            }
          },
          responsive: true,
          spanGaps:true,
          maintainAspectRatio: true,
          
          plugins: {
            annotation: {
            annotations: {
              
            }
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
              }
              
            },
            title: {
              display: false,
              text: `Data for ${stationName}`,
            },

          },
        },
      };

      // Destroy the previous chart if it exists
      //console.log(chartRef.current.chart);
      if (chartRef.current.chart) {
        chartRef.current.chart.destroy();
      }

      // Create a new chart
      chartRef.current.chart = new Chart(ctx, chartConfig);

      setTimeout(() => {
        const chart = chartRef.current.chart;
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
          borderColor: '#1F1617',
          borderWidth: 2,
          borderDash: [5,2],
          label: {
            display: true,
            content: `Hovered Date: ${highlightTime}`,
            position: 'end', // options: 'start', 'center', 'end'
            backgroundColor: '#1F1617',
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
  
    }

    // Cleanup function to destroy the chart on unmount
    return () => {
      if (chartRef?.current?.chart) {
        chartRef.current.chart.destroy();
      }
    };
  }, [sourceData, varCategory, stationName, startAtZero, hoverPointTime]); // Re-run effect if chartData or stationName changes

  return (

    <div  className='chart-render'>
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

function getColour(graph_colour_list, var_name, indx) {
  let colour = '';
  console.log(var_name);
  console.log(graph_colour_list);

  colour = var_name in graph_colour_list ? graph_colour[var_name][indx] : getRandomColor()
  return colour;

    
}


export default React.memo(RenderChart);

function parseChartData(sourceData, varCategory, hoverPointTime){
  console.log(sourceData);
  const  column_names = sourceData.column_names;
  const hoverTimestamp = new Date(hoverPointTime).getTime();
  
  const column_std_names = sourceData.column_std_names;
  const uniqueColStdNames= getUniqueStdNamesList(column_std_names);
  console.log(uniqueColStdNames);

  const timeData = get_station_field_data(sourceData,"time", "column_std_names")?.data
  console.log(timeData);
  // Move this to config later
  const exclude_var = ['time', 'latitude', 'longitude', 'wind_from_direction', 'relative_humidity',
      'sea_surface_wave_from_direction', 'sea_surface_wave_maximum_period', 'sea_surface_wave_mean_period'
  ]
  // Prepare datasets for each variable, excluding 'time'
  const datasets = [];
  uniqueColStdNames.filter((variable) => !exclude_var.includes(variable) && variable.includes(varCategory)).map((variable, index) =>{
    console.log(variable)

    const column_names_list = getColumnNameList(column_std_names, column_names, variable)
    console.log(column_names_list);
    var graph_colour_list = {}
    Object.assign(graph_colour_list, graph_colour);
   
    console.log(graph_colour_list)
    column_names_list.forEach((col_name, indx) => {
      const unit = get_station_field_units(sourceData, col_name)
      
      
      const data_obj = get_station_field_data(sourceData, col_name);
      const values = data_obj?.data
      // If array of values is empty / all null skip it
      if(!values.every(element => element === null)) {
        datasets.push({
        label: `${data_obj.long_name} (${convert_unit_data(values[0], unit).unit})` || key, //  std_name if available
        data: values.map((value)=>convert_unit_data(value,unit).value) || [], // Ensure that value exists
        borderColor: getColour(graph_colour_list, variable, indx), // Generate random colors for each line
        backgroundColor: 'rgba(0, 0, 0, 0)',
        fill: false,
        pointRadius: (context) => {
          const pointTime = timeData[context.dataIndex];
          return pointTime === hoverTimestamp ? 10 : 0;
        },
        pointBackgroundColor: (context) => {
          const pointTime = timeData[context.dataIndex];
          //console.log(hoverTimestamp);
          return pointTime === hoverTimestamp ? '#1F1617' : 'blue';
        },
      })}
      
    });
    
  });
      console.log(datasets)
      return {datasets: datasets,
              timeData: timeData}
};