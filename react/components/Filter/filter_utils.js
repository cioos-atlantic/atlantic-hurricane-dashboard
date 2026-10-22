import dayjs from "dayjs";
import { basePath } from "@/next.config";
import { storm_cat } from "@/lib/storm_cat";

// Earliest and latest dates the date filter allows (pickers and year slider)
export const MIN_DATE = dayjs('1860-01-01');
export const MAX_DATE = dayjs().endOf('day');

export function titleCase(str) {
    if ((str === null) || (str === ''))
        return false;
    else
        str = str.toString();

    return str.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() +
            txt.substr(1).toLowerCase();
    });
}


export function makeStormNameList(storm_data){
  // Create a set to track unique IDs and add objects to the result list
  const uniqueList = [];
  const stormIdentifiers = new Set();
  const stormData = storm_data?.ib_data?.features

  

  stormData?.forEach(feature => {
    let name = feature.properties.NAME;


    // check if name and year exists and if storm identifier does not have the identifier

    if (name && !stormIdentifiers.has(name)) {
      stormIdentifiers.add(name);
      uniqueList.push(name);
    }
  
  
  })

  uniqueList.sort(); // sort storm in alphabetical order 
  const editedStormList = uniqueList.map((stormName)=> stormName = titleCase(stormName));


  return editedStormList;
}

// Converts the category labels kept in filterReducer ('TD' ... 'C5') to the wind-speed range
// the filter API expects. TD's min is 0, so check for null instead of truthiness.
export function formatCategoryRange(startCategory, endCategory) {
  const startRange = startCategory != null ? storm_cat[startCategory] : null;
  const endRange = endCategory != null ? storm_cat[endCategory] : null;

  if (!startRange || !endRange) {
    return { start_category: '', end_category: '' };
  }
  return { start_category: String(startRange.min), end_category: String(endRange.max) };
}

export async function queryStormName(startDate = null, endDate = null, polyCoords= '', startCategory = null, endCategory= null) {

  const updatedParams = {
      startDate: startDate, // Ensure start and end dates are included
      endDate: endDate,
      polyCoords: polyCoords,
      startCategory: startCategory,
      endCategory:endCategory,
      

    };

  
  const start_date = formatFilterDate(updatedParams['startDate']);
  const end_date = formatFilterDate(updatedParams['endDate']);
  
  const storm_poly = updatedParams['polyCoords'];                       
  const { start_category, end_category } = formatCategoryRange(updatedParams['startCategory'], updatedParams['endCategory']);

  const query = new URLSearchParams({
    start_date: start_date,
    end_date: end_date,
    polygon: storm_poly,
    start_category: start_category,
    end_category: end_category,

  }).toString();
  let uniqueList;
  try {
    const resource = await fetch(`${basePath}/api/filter_storms?${query}`);
    const storm_data = await resource.json();
    
    uniqueList = makeStormNameList(storm_data)
    // Create a set to track unique IDs and add objects to the result list
    
    if (uniqueList.length === 0) {
      alert("No result found for this search, please try again...")
    }

    


  } catch (error) {
    
    console.error('Error fetching storm or station data:', error);
    
  }

  return uniqueList
  

}


export function formatFilterDate(date) {
  if (!date) {
    return ""; // Return an empty string if no date is provided
  }
  const formattedDate = date.format("YYYY-MM-DD").trim();
  return formattedDate;
}

export function formatStormCategory(category_list = []) {
  const formattedCategoryList = category_list.join("_");
  return formattedCategoryList;
}

export function formatStormName(storm_list = []) {
  const formattedStormList = [];
  if (storm_list.length > 0) {
    formattedStormList.push(storm_list.join("_"));
  }
  return formattedStormList;
}
