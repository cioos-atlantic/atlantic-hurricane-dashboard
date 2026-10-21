import React, { useEffect, useRef } from 'react';
import { Chart, PolarAreaController, RadialLinearScale, ArcElement, Legend, Title } from 'chart.js';
import { storm_type_info } from '@/lib/storm_class';

// Register necessary components
Chart.register(PolarAreaController, RadialLinearScale, ArcElement, Legend, Title);



function StormTypeChart({ chartData }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!chartData || !chartData.data) return;

    const uniqueStormTypes = [...new Set(chartData.data)];
    
    
    // Extract background colors based on storm types
    const labels = uniqueStormTypes.map(type => storm_type_info[type]?.name.en || type);
    const backgroundColors = uniqueStormTypes.map(type => 
    storm_type_info[type]?.chart_color || "#CCCCCC" // Default color if type is missing
    );

    const data = {
      labels: labels,
      datasets: [
        {
          label: chartData.name,
          data: uniqueStormTypes.map(type => chartData.data.filter(t => t === type).length), // Count occurrences,
          backgroundColor: backgroundColors,
        },
      ],
    };

    // Chart configuration
    const config = {
      type: 'polarArea',
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false, 
        plugins: {
          
          legend: { position: 'top' },
          title: { display: true, text: 'Storm Type Distribution (Data Points)' },
        },
      },
    };

    // Destroy previous chart instance if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Create new chart instance
    chartInstance.current = new Chart(chartRef.current, config);

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [chartData]);

  return (
    <div className='chart-box chart-box--square'>
      <canvas ref={chartRef} id="stormTypeChart"></canvas>
    </div>
  );
}

export default StormTypeChart;



function getLabelName(name_code){
  const labelName = storm_type_info[name_code]['name']['en']
  return labelName
}