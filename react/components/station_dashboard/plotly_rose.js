import React from 'react';
import Plot from 'react-plotly.js';
import { windSpeedBins, colorPalette, categorizeWindSpeed, extractWindSpeedBins, cardinalPoints } from "./wind_rose_utils";

//const cardinalPoints = ["North", "N-E", "East", "S-E", "South", "S-W", "West", "N-W"];
export function categorizeWindDirection(direction, cardinalPoints) {
  
  const sectors = 360 / cardinalPoints.length;
  const index = Math.round(direction / sectors) % cardinalPoints.length;
  return cardinalPoints[index];
};


function calculateWindSpeedDistribution(directions, speeds, totalDataPoints) {
  const windSpdLabel = extractWindSpeedBins();
  windSpdLabel.push('Unknown') // to accomodate negative values which would be wrong and will be filtered out in the future

  const freqObj = makeEmptyfreqObj(windSpdLabel, cardinalPoints);

  
  const cardinal =  directions.map((direction)=> categorizeWindDirection(direction, cardinalPoints))
  const speedBin =  speeds.map((speed)=> categorizeWindSpeed(speed))
  
  
  
  const freqDist = {};

  for (let i = 0; i < cardinal.length; i++) {
    const dir = cardinal[i];
    const speed = speedBin[i];

    if (!freqDist[speed]) {
      freqDist[speed] = {};
    }

    if (!freqDist[speed][dir]) {
      freqDist[speed][dir] = 0;
    }

    freqDist[speed][dir]++;
  }

  const freqFrac= structuredClone(freqObj);
  Object.keys(freqDist).forEach((speedBin)=>{

    Object.keys(freqDist[speedBin]).forEach((cardinalDirection)=>{
      const dirIdx= cardinalPoints.findIndex((point) => point === cardinalDirection);
      const freqPercent = ((freqDist[speedBin][cardinalDirection]/ totalDataPoints) * 100).toFixed(2);
      freqFrac[speedBin][dirIdx]= freqPercent;
    });
    
  });
  return freqFrac

  
}

export function makeEmptyfreqObj(windSpeedBins, cardinalPoints){
  const freqObj =  {};
  windSpeedBins.forEach((bin)=>{
    freqObj[bin] = new Array(cardinalPoints.length).fill(0);});
  

  return freqObj
  
}

export function RenderPlotlyRose ( { windData, directionData, timeData }){
  const totalDataPoints= timeData.length;
  const parsed_data = calculateWindSpeedDistribution(directionData, windData, totalDataPoints);
  const data = [];
  Object.keys(parsed_data).forEach((speedBin, index)=>
  (
    data.push({
      r: parsed_data[speedBin],
      theta:cardinalPoints,
      name: speedBin,
      marker: { color: colorPalette[index] },
      type: "barpolar"
    })
  ));

  const layout = {
    font: { size: 13 },
    showlegend: true,
    legend: { font: { size: 13 }, x: 1.15, y: 0.5, orientation: "v"},
    polar: {
      barmode: "stack", // Better than "overlay" for wind roses
      bargap: 0,
      radialaxis: { ticksuffix: "%", angle: 45, dtick: 20 },
      angularaxis: { direction: "clockwise" }
    },
    margin: { t: 50, r: 30, l: 30, b: 30 },
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      padding: '0px',
      
    }}>
      <Plot
        data={data}
        layout={layout}
        config={{ responsive: true, modeBarButtonsToRemove: ['select2d', 'lasso2d', 'zoom2d'] }}
        style={{ width: '400px', height: '350px' }}
        
      />
    </div>

  );


 
}