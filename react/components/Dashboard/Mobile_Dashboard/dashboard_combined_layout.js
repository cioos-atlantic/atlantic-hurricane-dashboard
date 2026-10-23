import { createVarPresenceDict, alignMergedData, mergeData, parseStationData, parseStormData, getStationInfo } from "./utils";
import { getStationDataText, getMatchedStation, get_station_field_data } from "../../utils/station_data_format_util";
import { fetch_value } from "@/lib/storm_utils";
import RenderCombinedChart from './combined_graph'
import RenderStormChart from "../../storm_dashboard/storm_graph";
import StormTypeChart from "@/components/storm_dashboard/storm_type_chart";
import StormCategoryChart from "@/components/storm_dashboard/storm_cat_chart";
import { RenderWindRose } from "@/components/station_dashboard/wind_rose";
import { RenderPlotlyRose } from "@/components/station_dashboard/plotly_rose";
import { processWindSpeeds } from "@/components/station_dashboard/wind_rose_utils";
import { convert_unit_data } from "../../utils/unit_conversion";
import { Box } from "@mui/material";

export default function CombinedStationStormDash({stationData, stationValues, storm_points, hover_point}){

	function generateGraph(selectedVar){
				return (
				 <div className="station_chart" 
				 style={{
				 height: 'auto',
				 width: 'auto', // Adjust width based on content (chart)
				 padding: '0px', // Optional padding around chart
				 display:'flex',
				 }}>
				 <RenderCombinedChart   
									sourceData={alignedMergedData[selectedVar]}
									varCategory={selectedVar}
									 timeData={unifiedTimes}
									 hoverPointTime={hoverPointTime}
								/>
			 </div>
				)
		}
	if (stationData === undefined) {
		return
	}

	const stationDataDict = parseStationData(stationValues, stationData)//parseStationData(stationValues)
	const [stormName, stormTimes, stormType, stormDataDict, stormCategory] = parseStormData(storm_points);
	const mergedData = mergeData(stationDataDict, stormDataDict);

	const hoverPointTime = fetch_value(hover_point, ["TIMESTAMP", "ISO_TIME"]);
	const stationTimes = get_station_field_data(stationData,"time", "column_std_names")?.data

	const convertedStormTimes = stormTimes.map(time =>  Date.parse(time));

	const { unifiedTimes, alignedMergedData } = alignMergedData(mergedData, convertedStormTimes, stationTimes);


	const variablePresence = createVarPresenceDict(alignedMergedData, stormCategory, stormType, stationData );
	const directionData = get_station_field_data(stationData, 'wind_from_direction', "column_std_names").data;
	const windSpeedData = processWindSpeeds(stationData);
	
 	return <Box
				className="dash-body"
				sx={{
				fontSize: { xs: "12px", sm: "14px", md: "16px", lg: "16px" },
				
				}}
			>{/* Storm Type */}
			{variablePresence[stormType] && (<section className="station_dashboard_small_screen_section">
				<Box
				sx= {{
					fontSize: { xs: '14px', sm: '16px'}
				}}
				className="section-header"
				>{stormType['name']}</Box>
				<p>{<StormTypeChart chartData={stormType}/>}</p>
				
			</section>)}


			{/* Storm Category */}
			{variablePresence[stormCategory] && (<section className="station_dashboard_small_screen_section">
				<Box
				sx= {{
					fontSize: { xs: '14px', sm: '16px'}
				}}
				className="section-header"
				>{stormCategory['name']}</Box>
				<p>{<StormCategoryChart chartData={stormCategory}/>}</p>
				
			</section>)}



					{/* Wind Direction Section */}
						{variablePresence["wind_from_direction"] && (
							Object.keys(windSpeedData).map((key, index) => {
								const label = key.replace(/^wind speed(?=\s+\S)/i, '').trim();
								return(
								<section key={`windbin-tab-${key}`} className="station_dashboard_small_screen_section">
								<Box className="section-header"
								sx= {{
									fontSize: { xs: '14px', sm: '16px', md: '18px', lg: '18px' }
								}}>{`WINDROSE-${label}`}</Box>
								<RenderPlotlyRose 
									windData={windSpeedData[key]}
									directionData={directionData}
										timeData={stationTimes}/>
							</section>

							)})
							
						)}
						
						
						
						
						{
					Object.entries(alignedMergedData).map(([key, value], index) => {
					
					return(<>
													{variablePresence[key] && (
														<section className="station_dashboard_small_screen_section">
															<Box
																sx= {{
																	fontSize: { xs: '14px', sm: '16px'}
																}}
																className="section-header"
															>{key}</Box>
															{generateGraph(key)}
													</section>)}
												</>
					)
					})
			}
				
				
				
				
			</Box>

			
}




	