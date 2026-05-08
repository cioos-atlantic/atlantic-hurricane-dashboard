import { subYears } from "date-fns";
import {  build_storm_features } from "@/lib/storm_utils";
import { flyToPoint } from "../storm_list_item";
import { empty_station_obj } from "../point_defaults";
import { basePath } from "@/next.config";

/**
 * This JavaScript function fetches historical storm data from an API based on a specified time range
 * and returns a list of unique storm objects.
 * @returns The `getHistoricalStormList` function is returning a list of unique storm data objects that
 * have been fetched from the API endpoint `/api/historical_storms` based on the query parameters
 * constructed in the function. The function fetches historical storm data from the API, processes the
 * data to extract unique storm objects, and then returns this list of unique storm data objects.
 */
export async function getHistoricalStormList(){
  // Construct query parameters
  
  const oneYearAgo = subYears(new Date(), 1);
  const start_date = new Date(oneYearAgo).toISOString().split('T')[0] + "T00:00:00Z"; // get the current year
  const end_date = new Date().toISOString().split('T')[0] + "T00:00:00Z";
  console.log(start_date, end_date)
  


  const query = new URLSearchParams({
    start_date: start_date,
    end_date: end_date
  }).toString();

  
  try {
    const resource = await fetch(`${basePath}/api/filter_storms?${query}`);
    const storm_data = await resource.json();
    //console.log(storm_data);

    //const historical_storm_data = parseStormData(storm_data, storm.name);
    // console.log(historical_station_data);

    console.debug(`historical Storm Data for ${start_date} - ${end_date} : `, storm_data);
    const uniqueList= makeStormList(storm_data)
    // Create a set to track unique IDs and add objects to the result list
    

    console.log(uniqueList);
    return uniqueList



  } catch (error) {
    console.error('Error fetching storm or station data:', error);
  }
}

/**
 * The `parseStormData` function parses storm data, organizes it by storm name, and builds storm
 * features for visualization on a map using Leaflet.
 * @param storm_data - Storm data containing information about various storms, including their features
 * and properties.
 * @param storm_name - The `storm_name` parameter is the name of the storm for which you want to parse
 * the storm data. This function takes the storm data, storm name, a map object, and the Leaflet
 * library as input parameters to parse and process the storm data for visualization on the map.
 * @param map - The `map` parameter in the `parseStormData` function is a reference to a map
 * object used for displaying geographical data. It is commonly used in web mapping applications to
 * render interactive maps with markers, layers, and other visual elements. The `Leaflet` parameter is a reference to
 * @param Leaflet - Leaflet is a popular open-source JavaScript library for interactive maps. It
 * provides functionalities for displaying maps, adding markers, shapes, and layers, as well as handling user interactions like zooming and panning. * @returns The `parseStormData` function returns the `storm_features` variable after processing the
 * storm data.
 */
export function parseStormData(storm_data, storm_name, map, Leaflet) {

  if (storm_data?.ib_data?.features?.length === 0) {
    console.warn("No IBTRACS Data features found for ", storm_name);
    return null
  }

  console.log(storm_data)

  let storm_details = {}
  let ib_storm_list = []

  console.log(storm_data)

  storm_data.ib_data.features.map(storm_point => {
    if (!ib_storm_list.includes(storm_point.properties.NAME)) {
      ib_storm_list.push(storm_point.properties.NAME)
      storm_details[storm_point.properties.NAME] = {
        source: "ibtracs",
        year: storm_point.properties.SEASON,
        data: []
      }
    }
    storm_details[storm_point.properties.NAME].data.push(storm_point)
  });



  // console.log("parseStormData -> Storm Details: ", storm_details);
  let storm_features = build_storm_features(storm_details[storm_name]);

  parseForFlyToPoint(storm_details, storm_name, map, Leaflet)

  // console.log("parseStormData -> Final Storm Features: ", storm_features);
  return storm_features;
};

// Function to handle harvested historical storm data
/**
 * The function `handleHarvestHistoricalData` processes harvested historical storm data by setting
 * storm and station points and updating the state with the data.
 * @param data - The `data` parameter in the `handleHarvestHistoricalData` function  contains historical storm data that includes information about storms and stations. This data is used to set the storm points and station points in the application. The function logs the harvested historical
 * storm data to the console and then sets the
 * @param setStationPoints - The `setStationPoints` parameter is a function that is used to update the
 * state with the station data harvested from historical storm data. It is typically a function
 * provided by a state management library like React's `useState` hook or a similar mechanism in other
 * frameworks. When called with the `data.station
 * @param setStormPoints - The `setStormPoints` function is used to update or set the storm data in the
 * application state. It takes the `data.storm_data` as a parameter and sets this data in the
 * application state for further processing or display.
 */
function handleHarvestHistoricalData(data, setStationPoints, setStormPoints) {
  console.log("Harvested Historical Storm Data:", data);
  //console.log(data.ib_data.features)
  //if(data.ib_data.features){}
  setStormPoints(data.storm_data);  // Set the storm data
  setStationPoints(data.station_data);  // Set the station data
  // Update the state with the harvested data
  //console.log("Historical Storm Data set:", data);
};


/**
 * The `getStationData` function fetches historical station data based on specified parameters and
 * returns the data as a JSON object.
 
 * @returns The function `getStationData` is returning the historical station data fetched from the API
 * endpoint `/api/query_stations_historical` based on the provided parameters such as `min_lon`,
 * `min_lat`, `max_lon`, `max_lat`, `max_storm_time`, and `min_storm_time`. The data is fetched
 * asynchronously using `fetch` and then converted to JSON format before being returned
 */
export async function getStationData(min_lon, min_lat, max_lon, max_lat, max_storm_time, min_storm_time) {
  const query = new URLSearchParams({
    min_time: min_storm_time,
    max_time: max_storm_time,
    min_lon,
    min_lat,
    max_lon,
    max_lat
  }).toString();

  //const resource = await fetch(process.env.BASE_URL + '/api/historical_storms')

  // process.env reading empty

  //console.log(process)
  const resource = await fetch(`${basePath}/api/query_stations_historical?${query}`);

  const historical_station_data = await resource.json();

  console.log(historical_station_data);
  return historical_station_data

  // Trigger the callback to send data back to the parent


};



/**
 * The function `getStationQueryParams` extracts specific data from historical storm data and returns a
 * set of query parameters for a station.
 * @param historical_storm_data - The `getStationQueryParams` function takes in `historical_storm_data`
 * as a parameter, which seems to be an object containing historical storm data.
 * @returns The function `getStationQueryParams` returns an array containing the minimum longitude,
 * minimum latitude, maximum longitude, maximum latitude, maximum storm time, and minimum storm time.
 */
export function getStationQueryParams(historical_storm_data) {
  const [min_lon, min_lat, max_lon, max_lat] = historical_storm_data.ib_data.bbox.map(num => num.toString());

  const storm_id = historical_storm_data.ib_data.features['0'].id;
  const [_, __, storm_time] = storm_id.split('.');
  console.log(storm_time)

  const max_storm_time = lightFormat(addDays(new Date(storm_time), 15), "yyyy-MM-dd'T'00:00:00");
  const min_storm_time = lightFormat(subDays(new Date(storm_time), 15), "yyyy-MM-dd'T'00:00:00");
  console.log(min_lon, min_lat, max_lon, max_lat, max_storm_time, min_storm_time)


  return [min_lon, min_lat, max_lon, max_lat, max_storm_time, min_storm_time]

}


/**
 * The function `makeStormList` processes storm data to create a list of unique storm objects with
 * specific properties.
 * @param storm_data - The `makeStormList` function takes in `storm_data` as a parameter, which is
 * expected to be an object containing storm data with a specific structure. The function processes
 * this data to extract information about storms and creates a list of unique storm objects based on
 * certain criteria like storm name, year,
 * @returns The function `makeStormList` returns a list of unique storm objects extracted from the
 * input `storm_data`. Each storm object contains the properties `name`, `year`, `storm_id`,
 * `display_name`, and `source`, with the source set to "ibtracs".
 */
export function makeStormList(storm_data){
  // Create a set to track unique IDs and add objects to the result list
  const uniqueList = [];
  const stormIdentifiers = new Set();
  const stormData = storm_data?.ib_data?.features

  

  stormData?.forEach(feature => {
    let name = feature.properties.NAME;
    let year = feature.properties.SEASON;
    let storm_id = feature.properties.SID;
    let display_name= `${name}-${year}`;


    if (name === "UNNAMED"){display_name = `${name}-${storm_id}` }

    const identifier = `${name}-${year}-${storm_id} `;

    // check if name and year exists and if storm identifier does not have the identifier

    if (name && year && !stormIdentifiers.has(identifier)) {
      stormIdentifiers.add(identifier);
      uniqueList.push({ name, year, storm_id, display_name, source: "ibtracs" });
    }
  
  
  })
  
  return uniqueList
}

/**
 * The function `isYear` checks if the input is a valid year in the format of exactly 4 digits.
 * @param input - The `isYear` function is designed to check if the input is a valid year in the format
 * of exactly 4 digits. The function uses a regular expression pattern `^\d{4}$` to match exactly 4
 * digits.
 * @returns The function isYear returns a boolean value indicating whether the input matches the
 * pattern for a year (exactly 4 digits).
 */
export function isYear(input) {
  const yearPattern = /^\d{4}$/; // Matches exactly 4 digits
  return yearPattern.test(input);
}

/**
 * The function isName checks if the input consists only of letters (no spaces or numbers).
 * @param input - The `isName` function takes an `input` parameter, which is a string representing a
 * name. The function uses a regular expression pattern `namePattern` to check if the input contains
 * only letters (no spaces or numbers). The function returns `true` if the input matches the pattern,
 * @returns The function `isName` is returning a boolean value indicating whether the input string
 * consists only of letters (no spaces or numbers).
 */
export function isName(input) {
  const namePattern = /^[a-zA-Z]+$/; // Matches only letters (no spaces or numbers)
  return namePattern.test(input);
}



/**
 * The function isStormId checks if the input string matches a specific pattern for a storm ID.
 * @param input - The `isStormId` function is designed to check if the input matches a specific
 * pattern. The pattern is defined as a string that starts with 4 digits, followed by 3 digits, then a
 * single letter (either lowercase or uppercase), and ends with 5 digits.
 * @returns The function `isStormId` is returning a boolean value indicating whether the input matches
 * the specified pattern for a storm ID.
 */
export function isStormId(input) {
  const namePattern =  /^\d{4}\d{3}[a-zA-Z]\d{5}$/; // Matches only letters (no spaces or numbers)
  return namePattern.test(input);
}


/**
 * The function `parseForFlyToPoint` takes storm details, storm name, map, and Leaflet as parameters,
 * retrieves storm data based on the storm name, and then flies the map to that storm data using
 * Leaflet.
 * @param storm_details - The `storm_details` parameter is an object containing details about different storms. 
 * @param storm_name - The `storm_name` parameter is the name of the storm for which you want to parse the details and fly to its location on the map.
 * @param map - The `map` parameter is a reference to the Leaflet map object where you want to fly to a specific point. Leaflet is a popular open-source JavaScript library for interactive maps.
 * @param Leaflet - Leaflet is a popular JavaScript library for interactive maps. It provides functionalities to create maps, add layers, markers, and other interactive elements to the map. 
 */
export function parseForFlyToPoint(storm_details, storm_name, map, Leaflet){
  //console.log(Leaflet);
  
  const storm_data = storm_details[storm_name];
  console.log(storm_data)
  flyToPoint(storm_data, map, Leaflet) 
}

/**
 * The function `addSearchParams` updates the URL parameters with the storm name and year, then
 * navigates to the new URL using the router.
 * @param stormName - Storm Name in strings
 * @param stormYear - Storm Year in strings
 * @param router - The `router` parameter  has a `push` method that allows you to navigate to a new URL by updating the browser's history.
 */
export function addSearchParams(stormName, stormYear, router) {
  const currentUrlParams = new URLSearchParams(window.location.search);
  currentUrlParams.set('name', stormName);
  currentUrlParams.set('season', stormYear);
  router.push(`?${currentUrlParams.toString()}`);
}






/**
 * The handleClick function handles a button click event, fetches historical storm and station data
 * based on the storm details, and sets the retrieved data for display on the map.

 */
export async function handleClick( storm, setStationPoints, setStormPoints, map, Leaflet, router, setSelectedStation, setLoading, setIsDashOpen, setIsStormDashOpen,setIsStationDashOpen) {

  setIsDashOpen(false);
  setIsStationDashOpen(false);
  setIsStormDashOpen(false);

  //console.log(Leaflet);
  setSelectedStation(empty_station_obj)
  
  console.log('Button clicked for', storm.name);
  const storm_name = storm.name;
  const storm_year = storm.year;
  const storm_id = storm.storm_id;

  addSearchParams(storm_name, storm_year, router)
  let storm_source;

  // if condition because of what list.json looks like eccc instead of ECCC
  if (storm.source === 'eccc') {
    storm_source = "ECCC";
  }
  else if (storm.source === 'ibtracs') {
    storm_source = "IBTRACS"
  }
  //console.log(storm_source)


  // Construct query parameters
  const query = new URLSearchParams({
    name: storm_name,
    season: storm_year,      // Using season for storm year
    source: storm_source,
    id: storm_id
  }).toString();

  setLoading(true);
  try {
    const resource = await fetch(`${basePath}/api/historical_storms?${query}`);
    const storm_data = await resource.json();

    

    //console.log(historical_station_data)
    const station_resource = await fetch(`${basePath}/api/query_stations_historical?${query}`);
    const historical_station_data = await station_resource.json();

    //console.log(Leaflet);

    const historical_storm_data = parseStormData(storm_data, storm.name, map, Leaflet);
    //console.log(historical_storm_data);

    console.debug("Historical Storm Data: ", historical_storm_data);
    console.debug("Historical Station Data: ", historical_station_data);

    setStormPoints(historical_storm_data);  // Set the storm data
    setStationPoints(historical_station_data);  // Set the station data

    setLoading(false);
    


  } catch (error) {
    setLoading(false);
    console.error('Error fetching storm:', error);
  }


};

/**
 * The function `handleFormSubmit` processes user input from a form, extracts storm name and year,
 * performs a search, and updates the search results.
 
 * @returns The `handleFormSubmit` function is returning the unique list of search results obtained
 * from the `handleSearch` function after processing the input values for storm name and year. This
 * unique list is then set as the search result using the `setSearchResult` function.
 */
export async function handleFormSubmit(e, setSearchResult){
  //prevent default behavior
  let storm_name = "";
  let storm_year = "";
  console.log(e)
  e.preventDefault();
  
  const searchInputField = e.target.elements.historical_storm_search; // Reference to the input field
  let searchInput= searchInputField.value;
  const search_values= searchInput.split(" ")
  //if (search_values.length ===1) {}
  console.log(search_values);

  for (let value of search_values){
    if (isYear(value)){storm_year = value}
    else if (isName(value)){storm_name = value}
    else {alert("Wrong Input. If input is only year, ensure it is in 4 digits. If year  and storm name, add a space between");
      return;
    }
  };
  
  const uniqueList= await handleSearch(storm_name, storm_year)

  console.log(uniqueList)
  setSearchResult(uniqueList)

  // Clear the input field
  searchInputField.value = "";
  
}

/**
 * The function `handleSearch` fetches historical storm data based on the storm name and year, creates
 * a list of unique storm objects, and returns the list.
 
 * @returns The `handleSearch` function is returning the `uniqueList` variable, which contains the list
 * of unique storm data objects obtained from the API call.
 */
export async function handleSearch(storm_name, storm_year){
  let uniqueList;

  const query = new URLSearchParams({
    name: storm_name, 
    season: storm_year     // Using season for storm year
  }).toString();

  console.log(query)

  try {
    const resource = await fetch(`${basePath}/api/historical_storms?${query}`);
    const storm_data = await resource.json();
    //console.log(storm_data);

    //const historical_storm_data = parseStormData(storm_data, storm.name);
    // console.log(historical_station_data);

    console.log(`historical Storm Data for ${storm_name} and ${storm_year}: `, storm_data);
    // Create a set to track unique IDs and add objects to the result list
    uniqueList = makeStormList(storm_data)
    // Create a set to track unique IDs and add objects to the result list
    

    console.log(uniqueList);
    if (uniqueList.length === 0) {
      alert("No result found for this search, please try again...")
    }
    

  } catch (error) {
    console.error('Error fetching storm or station data:', error);
  }
  
  return uniqueList
}

export function handleStormButtonClick(stormName, stormYear, stormID, router){
  const url = `/?storms=historical&name=${stormName}&season=${stormYear}&sid=${stormID}`;
  console.log(url)
  router.push(url);
  
  /*router.push(url).then(() => {
    window.location.reload(); // Force a full page reload after navigation
  }); */
}


