import { getStationDataText, getMatchedStation, get_station_field_data } from "../../utils/station_data_format_util";
import { convert_unit_data } from "../../utils/unit_conversion";
import { fetch_value } from "@/lib/storm_utils";




function createWindDirVarPresence(stationValues, variablePresence){
	let WindDirIndx = ''
	const standardNames = stationValues?.properties?.station_data?.column_std_names || [];
	standardNames.forEach((std_name, indx) => {
		if (std_name === "wind_from_direction") { WindDirIndx =indx}
	})
	const rowData = stationValues?.properties?.station_data?.rows;

	variablePresence.wind_from_direction = rowData.some(
		d => d[WindDirIndx] != null && !Number.isNaN(d[WindDirIndx])
	);

	
}

export function createVarPresenceDict(mergedData, stormCategory, stormType, stationValues){
	const variablePresence={};

	console.log(mergedData)
	
  Object.keys(mergedData).forEach((key) => {
    variablePresence[key]= false;
  });

	variablePresence[stormType] = 
		Array.isArray(stormType['data']) && 
		stormType['data'].length > 0 && 
		stormType['data'].some(item => item !== undefined);


  variablePresence[stormCategory] = 
		Array.isArray(stormCategory['data']) && 
		stormCategory['data'].length > 0 && 
		stormCategory['data'].some(item => item !== undefined);

	createWindDirVarPresence(stationValues, variablePresence);


	Object.entries(mergedData).forEach(([key, value]) => {
		if (Array.isArray(value) && value.length > 0) {
			variablePresence[key] = value.some(obj => {
				const v = Object.values(obj)[0];
				return v?.data?.some(item => item != null && !Number.isNaN(item));
			});
		} else {
			variablePresence[key] = false;
		}
  });

	console.log(variablePresence);
	return variablePresence;
}

export function alignMergedData(merged_data, stormTimes, stationTimes) {
  const unifiedTimes = Array.from(new Set([...stormTimes, ...stationTimes])).sort();

  const alignedMergedData = {};

  for (const category in merged_data) {
	// Try/catch to avoid issues with merging categories that don't actually have data
	try{
		alignedMergedData[category] = merged_data[category].map(varObj => {
		const varKey = Object.keys(varObj)[0];
		const variable = varObj[varKey];
		
		// figure out whether it is storm or station data
		const times = varKey.startsWith('storm') ? stormTimes : stationTimes;
		const timeToValue = new Map(times.map((time, idx) => [time, variable.data[idx]]));
		const alignedData = unifiedTimes.map(time => timeToValue.get(time) ?? null);

		return {
			[varKey]: {
			name: variable.name,
			data: alignedData
			}
		};
		});
	}
	catch(error){
		console.log("Issue merging data with category: " + category)
		console.error(error)
	}
  }

  return { unifiedTimes, alignedMergedData };
}

export function mergeData(station_data, storm_data){
	// TODO: Can turn into a function to avoid duplication
	const merged_data = JSON.parse(JSON.stringify(storm_data)); // deepclone storm_data
	station_data.forEach((varObj)=>{
	const variable = Object.values(varObj)[0];
		// sea height
		if (variable.standardName.includes('wave') && variable.standardName.includes('height')){
			//Check if wave height exists in the storm data before pushing. If not, create empty array
			if(!('Wave Height' in merged_data)){
				merged_data['Wave Height'] = []}
			merged_data['Wave Height'].push(
				{[`station${variable.name}`]:{
					data: variable.data, 
					name: variable.displayName }}
		)}
			// wind speed and gust
		if (variable.standardName.includes('wind') && variable.standardName.includes('speed'))
			{merged_data['Wind Speed'].push(
				{[`station${variable.name}`]:{
					data: variable.data, 
					name: variable.displayName }}
			)}
			// temperature
		if (variable.standardName.includes('temperature'))
			{merged_data['Temperature'].push(
				{[`station${variable.name}`]:{
					data: variable.data, 
					name: variable.displayName }}
		)}

		//pressure
		if (variable.standardName.includes('pressure'))
			{merged_data['Pressure'].push(
				{[`station${variable.name}`]:{
					data: variable.data, 
					name: variable.displayName }}
		)}
	
	})

	return merged_data;
}

export function parseStormData(storm_points){
	const stormPoints = storm_points.pts.features;
	

	const stormNameList = [];
	const stormTime = [];
	const stormType={
	data:[], 
	name:'Storm Type'
	}

	const stormCategory={data:[], name:'Storm Category'}
	const storm_data_dict ={
		Direction: [{stormDir: { data: [], name: "Storm Direction (degree)" }}],
		Pressure: [{stormPressure: { data: [], name: "Storm Pressure (kPa)" }}],
		'Storm Speed': [{stormSpeed: { data: [], name: "Storm Speed (km/h)" }}],
		//'Wave Height': [{stormSeaHgt: { data: [], name: "Storm Sea Height (m)" }}],
		'Wind Speed': [{stormWindSpeed: { data: [], name: "Storm Wind Speed (km/h)" }},
		{stormGust: { data: [], name: "Storm Gust (km/h)" }}],
		Temperature:[],

	}



	stormPoints.forEach((storm_point)=> {
	stormNameList.push(fetch_value(storm_point, ["STORMNAME", "NAME"]));
	stormTime.push(fetch_value(storm_point, ["TIMESTAMP", "ISO_TIME"]));
	storm_data_dict.Direction[0].stormDir.data.push(storm_point.properties.STORM_DIR);
	
	stormCategory.data.push(fetch_value(storm_point, ["STORMFORCE", "USA_SSHS"]));


	// convert gust, storm speed and wind speed from knots to Kmh to synchronize with station chart
	const gust_in_Kmh = convert_unit_data(storm_point.properties.USA_GUST, 'knots', 'km/h')
	const stormWindSpeed_in_knots = fetch_value(storm_point, ["MAXWIND", "WMO_WIND", "USA_WIND"])
	const stormWindSpeed_in_Kmh = convert_unit_data(stormWindSpeed_in_knots, 'knots', 'km/h')
	const stormSpeed_in_Kmh = convert_unit_data(storm_point.properties.STORM_SPEED, 'knots', 'km/h')
	

	storm_data_dict['Storm Speed'][0].stormSpeed.data.push(stormSpeed_in_Kmh.value);
	storm_data_dict['Wind Speed'][1].stormGust.data.push(gust_in_Kmh.value);
	storm_data_dict['Wind Speed'][0].stormWindSpeed.data.push(stormWindSpeed_in_Kmh.value);
	const pressure_in_mb = fetch_value(storm_point, ["MSLP", "WMO_PRES", "USA_PRES"])|| []
	
	const pressure_in_kpa= convert_unit_data(pressure_in_mb, 'mbar', 'kPa')
								
	storm_data_dict.Pressure[0].stormPressure.data.push(pressure_in_kpa.value);
	
	stormType.data.push(fetch_value(storm_point, ["STORMTYPE", "NATURE"]));

	//const seaHeight_in_m = convert_unit_data(storm_point.properties.USA_SEAHGT, 'ft', 'm');
	//storm_data_dict['Wave Height'][0].stormSeaHgt.data.push(seaHeight_in_m.value);
	
	})
	const stormNameUniqueValues= [...new Set(stormNameList)];
	const stormName = stormNameUniqueValues[0];

	return [stormName, stormTime, stormType, storm_data_dict, stormCategory]
}


export function parseStationData(stationValues){
	const excludeVars = [
    "time",
    "latitude",
    "longitude",
    "relative_humidity",
    "sea_surface_wave_from_direction",
    "sea_surface_wave_maximum_period",
		'wind_from_direction'
  ];

	const standardNames = stationValues?.properties?.station_data?.column_std_names || [];
	const stationData = stationValues?.properties?.station_data || [];

	const dataIndx= [];
	const data_dict=[]


	standardNames.forEach((varName, index) => {
			if (!excludeVars.includes(varName)) {
				dataIndx.push(index)
				


			}})

	dataIndx.forEach((indx)=>{
		const column_name= stationData?.['column_names']?.[indx];
		const long_name = stationData?.['column_long_names']?.[indx];
		const std_name = stationData?.['column_std_names']?.[indx];
		const unit = stationData?.['column_units']?.[indx];
		

		const varData = []

		stationData.rows.forEach((row)=>{
			varData.push(row[indx])
		})

		data_dict.push({
			[column_name]:{
				name:long_name,
				standardName:std_name,
				data:varData.map((value)=>convert_unit_data(value,unit).value) || [],
				displayName:`Station ${long_name} (${convert_unit_data(varData[0], unit).unit})`
			}
		})
	})
	return data_dict;
	
}

export function getStationInfo(stationValues, station_descriptions, stationName, source_type, time ){
	// Determine if active or historic
		const isHistorical = source_type == "historical" ? true : false
		const dataText = getStationDataText(stationValues, time, isHistorical);
	
		if (!dataText) return null;
	
    const stationDescription = getMatchedStation(station_descriptions, stationName);
    const displayName = stationDescription.title || "Unknown Station";
    const institution = stationDescription.institution || "Unknown Institution";
    const institutionLink = stationDescription.institution_link || "#";


		return [dataText, displayName, institution, institutionLink];

}






