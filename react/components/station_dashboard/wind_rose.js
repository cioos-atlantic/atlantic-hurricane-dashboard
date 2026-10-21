import React, { useEffect, useRef} from 'react';
import { get_station_field_data, get_station_field_units } from '../utils/station_data_format_util';
import { Chart } from "@antv/g2";
import {  makeEmptyfreqObj, makeFreqFraction, makeGroupedList, extractWindSpeedBins, processWindSpeeds, parseWindData, windSpeedBins, cardinalPoints, colorPalette } from './wind_rose_utils';


/**
 * The `RenderWindRose` function renders a wind rose chart based on provided source data if wind rose
 * data is available.
 * @returns The `RenderWindRose` function returns a JSX element that conditionally renders either a
 * message stating "No data available" or a `div` element with an id of "container" that is assigned a
 * reference using the `chartContainerRef` variable.
 */
export function RenderWindRose ( { sourceData, hasWindRoseData }){
  
  const chartContainerRef = useRef(null);
  useEffect(() => {
    // Check if container ref exists
    const container = chartContainerRef.current;
    if (!container) return;

//const [chartData, setChartData] = useState(null);
    const stationDirData = get_station_field_data(sourceData, 'wind_from_direction', "column_std_names").data;
    if (!stationDirData || stationDirData.every(element => element === undefined)) {
        return; // Exit early
    }

    const windSpeeds = processWindSpeeds(sourceData);
    const unit = get_station_field_units(sourceData,"wind_speed", "column_std_names");
    const station_timeData = get_station_field_data(sourceData, "time", "column_std_names").data;
    const totalDataPoints= station_timeData.length;
      //generateChartOption(windSpeeds, stationDirData, totalDataPoints)

      //return Object.entries(windSpeeds).map(([key, windSpeed]) => {
      //  const windChartData = calculateWindSpeedDistribution(stationDirData, windSpeed, totalDataPoints);
      //  return <ChartComponent key={key} data={windChartData} chartKey={key} />;
      //});  
    const chartOptions = generateChartOption(windSpeeds, stationDirData, totalDataPoints);
    renderChart(chartOptions)  

    return () => {
      while (container.firstChild) {
        container.firstChild.remove();
      }
    };
    
      
  }, [sourceData]);
  // Add a container div for all charts

  return (
    <div>
      {!hasWindRoseData ? (
        <div>No data available</div>
      ) : (
        <div id="container" 
        ref={chartContainerRef}
        className='chart-render'
        />
      )}
    </div>
  );
}





// Calculate wind speed distribution per direction
/**
 * The function `calculateWindSpeedDistribution` processes wind direction and speed data to generate a
 * distribution chart.
 
 * @returns The function `calculateWindSpeedDistribution` is returning the `windChartData` after
 * processing the input data points.
 */
function calculateWindSpeedDistribution(directions, speeds, totalDataPoints) {

  
  const freqObj = makeEmptyfreqObj(windSpeedBins, cardinalPoints);

  const windSpdLabel = extractWindSpeedBins();
  
  const groupedList = makeGroupedList(directions, speeds)

  groupedList.forEach((dataPoint) => {
    const cardinalList= freqObj[dataPoint.cardinal];
    const windIdx= windSpdLabel.findIndex((lbl) => lbl === dataPoint.speedBin);
    cardinalList[windIdx]++;
  });
    
  const freqFrac= makeFreqFraction(freqObj, totalDataPoints);

  const windChartData = parseWindData(freqFrac, windSpdLabel);

  return windChartData
}



/**
 * The function `generateChartOption` creates chart options for displaying wind speed distribution data
 * based on input parameters.
 * @returns The function `generateChartOption` returns an array of chart options for each wind speed
 * category. Each chart option object contains various configurations for a chart, such as type, title,
 * data, encoding, scales, coordinates, axes, tooltips, and interactions.
 */
function generateChartOption(windSpeeds, stationDirData, totalDataPoints){
  const chartOption = [];
  Object.entries(windSpeeds).map(([key, windSpeed]) => {
    const windChartData = calculateWindSpeedDistribution(stationDirData, windSpeed, totalDataPoints);
    chartOption.push({
      type: "interval",
      title: {title: key, fontSize:'10px'},
      autoFit: true,
      //height: "350",
      //width: "100%",
      //padding: "0,0,0,0",
      //margin: "0,0,0,0",
      paddingBottom: '0',
      paddingTop:'35',
      //margin:'30',
      style: { inset: 0.5 },

      data: windChartData,
      encode: { x: "direction", y: "value", color: "windSpeedBin" },
      transform: [{ type: "stackY" }],
      scale: {
          color: {
          range: colorPalette,
          },
      },
      
      coordinate: { type: "polar", 
       
       },
      axis: {
          x: { line: true, grid: true, gridLineDash: [0, 0], gridLineWidth: 1 },
          y: { title: false, line: true, gridLineWidth: 1 },
      },
      tooltip: {
          title: (d) => d.direction,
          items: [
          (d, i, data, column) => ({
              name: d.windSpeedBin,
              value: d.value,
              channel: "y",
          }),
          ],
          
      },
      interaction: { tooltip: { 
        shared: true, 
       } },
      })
    
  });
  return chartOption
}

/**
 * The function `renderChart` creates a new chart with specified options and renders it in a container.
 */
function renderChart(chartOptions) {
  if (chartOptions){
    const chart = new Chart({ container: "container" });

    chart.options({
      type: "spaceFlex",
      children: chartOptions,
      //width: "auto", // Set the desired width of the chart
      //height: "auto", // Set the desired height of the chart
      //overflow: 'auto',
      //aspectRatio: "100 / 100",
      //height: 360,
      //width: 780,

    });

    chart.render();
  }
}
