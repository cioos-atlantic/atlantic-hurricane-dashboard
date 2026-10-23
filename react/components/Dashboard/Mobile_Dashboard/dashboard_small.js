import React, { useState, useEffect } from"react";
import { Box } from "@mui/material";
import { FaWindowClose } from "react-icons/fa";
import { StormSummaryText } from "@/components/storm_dashboard/storm_details";
import { parseStormData } from "./utils";
import CombinedStationStormDash from "./dashboard_combined_layout";
import { basePath } from "@/next.config";


export function RenderSmallDashboard({selected_station, hover_point, storm_points, onClose }){
	const stationData = selected_station;
  	const stationValues = stationData[1];
	const [api_data, set_api_data] = useState(0)

	const storm = stationValues?.properties?.storm
	// Active stations are cached with storm = "ACTIVE" (data_ingest/ERDDAP/cache_ERDDAP.py);
	// historical ones carry the storm id. Same rule the /api/station_data route uses to pick the cache.
	const isHistorical = storm !== "ACTIVE"

	const ibtracs_link = 'https://www.ncei.noaa.gov/products/international-best-track-archive';

	//const [stationSummary, stationDisplayName, institution, institutionLink] = getStationInfo(stationValues, stationName, source_type, time);
	const stationName = stationValues?.properties?.station
  	const stationDisplayName = stationValues?.properties?.dataset_title || "Unknown Station";
  	const institution = stationValues?.properties?.institution || "Unknown Institution";
  	const institutionLink = stationValues?.properties?.institution_link || "#";  
  	const station_id = stationValues?.properties?.station_id


	const [stormName, stormTimes, stormType, stormDataDict, stormCategory] = parseStormData(storm_points);



	useEffect(() => {
		if (!station_id) return;
		const fetchData = async () => {
			try{
			const query = new URLSearchParams({station_id, storm}).toString();
			const response = await fetch(`${basePath}/api/station_data?${query}`)
			const data = await response.json();
			set_api_data(data)
			}
			catch(error){
			console.error(error)
			}
	};
	fetchData();
	}, [station_id, storm]);

	return (
		<Box
		key="01-station-dashboard"
		className={`combined_dashboard_small`}
		sx={{
					bottom: { xs: "20px", sm: "30px", md: "35px", lg: "50px", xl: "50px" },
					width: "100%",
					gap: 0,
					display: "flex",
					alignItems: "stretch", // Ensures both boxes are equal height
					maxHeight:  { xs: "45%",  md: "55%" }, 
			}}
		>
		<Box
			className="dash-header"
			sx={{
			fontSize: { xs: "14px", sm: "16px", md: "18px", lg: "18px" },
			padding: "10px",
			
			}}
		>
			<button
			className="close"
			onClick={onClose}
			title="Close"
			aria-label="Close"
			>
			<FaWindowClose />
			</button>
			<div>
			<strong key={stormName}>Storm Name: </strong>
						{stormName}
			</div>
					<div>
			<strong key={stormName}>Storm DataSource: </strong>
						<a href={ibtracs_link} target="_blank" rel="noopener noreferrer">
				IBTrACS
			</a>
			</div>
					<div>
			<strong key={stationDisplayName}>Station Name: </strong>
						{stationDisplayName}
			</div>
			<div>
			<a href={institutionLink} target="_blank" rel="noopener noreferrer">
				{institution}
			</a>
			</div>
		</Box>
		<CombinedStationStormDash
			stationData={api_data[stationName]?.properties?.station_data}
			stationValues={stationValues}
			storm_points={storm_points}
			hover_point={hover_point}
		/>
		</Box>
	)}




function parseStormInfo(hover_point){
	return (
		<StormSummaryText storm_point_hover={hover_point}/>
	)
}

