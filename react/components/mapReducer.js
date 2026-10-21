// mapReducer.js
import { empty_point_obj, empty_station_obj, empty_storm_obj } from "./point_defaults";


export const initialMapState = {
  hover_marker: empty_point_obj,
  selectedTab: 0,
  selected_station: empty_station_obj,
  filterResult: [],
  returnFilterResult: false,
  polyFilterCoords: '',
  isDashOpen: false,
  isStormDashOpen: false,
  isStationDashOpen: false,
  drawerButtonClicked: '',
  startDate: null,
  endDate: null,
  startCategory: null,
  endCategory: null,
  showCatSelection: false,
  showDateSelection: false,
  isDrawerOpen: true,
  storm_points: empty_storm_obj,
  filterQuery:{},
  filterStormName:[],
  showFilterSelected:true
};

// Action helpers: build the action objects for mapReducer so call sites don't
// repeat type strings. Usage: dispatch(mapActions.setHoverMarker(point))
export const mapActions = {
  // Storm / station selection
  setHoverMarker: (point) => ({ type: 'SET_HOVER_MARKER', payload: point }),
  setStormPoints: (stormPoints) => ({ type: 'SET_STORM_POINT', payload: stormPoints }),
  setSelectedStation: (station) => ({ type: 'SET_SELECTED_STATION', payload: station }),
  selectStationAndOpenDashboard: (station) => ({ type: 'SET_SELECTED_STATION_AND_OPEN_DASHBOARD', payload: station }),
  setDrawerButtonClicked: (stormId) => ({ type: 'SET_DRAWER_BUTTON_CLICKED', payload: stormId }),
  closeStormTracks: () => ({ type: 'CLOSE_STORM_TRACKS' }),

  // Dashboards
  setDashOpen: (isOpen) => ({ type: 'TOGGLE_DASH', payload: isOpen }),
  setStormDashOpen: (isOpen) => ({ type: 'TOGGLE_STORM_DASH', payload: isOpen }),
  setStationDashOpen: (isOpen) => ({ type: 'TOGGLE_STATION_DASH', payload: isOpen }),
  setSelectedTab: (tab) => ({ type: 'SET_SELECTED_TAB', payload: tab }),
  closeStationDashboard: () => ({ type: 'CLOSE_STATION_DASHBOARD' }),

  // Drawer
  setDrawerOpen: (isOpen) => ({ type: 'TOGGLE_DRAWER', payload: isOpen }),

  // Filter values
  setStartDate: (date) => ({ type: 'SET_START_DATE', payload: date }),
  setEndDate: (date) => ({ type: 'SET_END_DATE', payload: date }),
  setStartCategory: (category) => ({ type: 'SET_START_CATEGORY', payload: category }),
  setEndCategory: (category) => ({ type: 'SET_END_CATEGORY', payload: category }),
  setPolyFilterCoords: (coords) => ({ type: 'SET_POLY_FILTER_COORDS', payload: coords }),
  setFilterStormName: (names) => ({ type: 'SET_FILTER_STORM_NAME', payload: names }),
  resetFilters: () => ({ type: 'RESET_FILTERS' }),
  cancelFilters: () => ({ type: 'CANCEL_FILTERS' }),

  // Filter UI
  setCatSelection: (isOpen) => ({ type: 'SET_CAT_SELECTION', payload: isOpen }),
  toggleCatSelection: () => ({ type: 'TOGGLE_CAT_SELECTION' }),
  setDateSelection: (isOpen) => ({ type: 'SET_DATE_SELECTION', payload: isOpen }),
  toggleDateSelection: () => ({ type: 'TOGGLE_DATE_SELECTION' }),
  setShowFilterSelected: (show) => ({ type: 'SHOW_FILTER_SELECTED', payload: show }),

  // Filter results
  setFilterQuery: (query) => ({ type: 'SET_FILTER_QUERY', payload: query }),
  setFilterResult: (result) => ({ type: 'SET_FILTER_RESULT', payload: result }),
  setReturnFilterResult: (show) => ({ type: 'TOGGLE_FILTER_RESULT', payload: show }),
};

export function mapReducer(state, action) {
  switch (action.type) {
    case 'SET_HOVER_MARKER':
      return { ...state, hover_marker: action.payload };
    case 'SET_STORM_POINT':
      return { ...state, storm_points: action.payload };
    case 'SET_SELECTED_TAB':
      return { ...state, selectedTab: action.payload };
    case 'SET_SELECTED_STATION':
      return { ...state, selected_station: action.payload };
    case 'SET_FILTER_RESULT':
      return { ...state, filterResult: action.payload };
    case 'TOGGLE_FILTER_RESULT':
      return { ...state, returnFilterResult: action.payload };
    case 'SET_POLY_FILTER_COORDS':
      return { ...state, polyFilterCoords: action.payload };
      case 'TOGGLE_DASH':
      return { ...state, isDashOpen: action.payload };
    case 'TOGGLE_STORM_DASH':
      return { ...state, isStormDashOpen: action.payload };
    case 'TOGGLE_STATION_DASH':
      return { ...state, isStationDashOpen: action.payload };
    case 'SET_DRAWER_BUTTON_CLICKED':
      return { ...state, drawerButtonClicked: action.payload };
    case 'SET_START_DATE':
      return { ...state, startDate: action.payload };
    case 'SET_END_DATE':
      return { ...state, endDate: action.payload };
    case 'SET_START_CATEGORY':
      return { ...state, startCategory: action.payload };
    case 'SET_END_CATEGORY':
      return { ...state, endCategory: action.payload };
      case 'SET_FILTER_STORM_NAME':
        return { ...state, filterStormName: action.payload };
    case 'SET_FILTER_QUERY':
      return { ...state, filterQuery: action.payload };
    case 'TOGGLE_CAT_SELECTION':
      return { ...state, showCatSelection: !state.showCatSelection };
    case 'SET_CAT_SELECTION':
      return { ...state, showCatSelection: action.payload };
    case 'SET_DATE_SELECTION':
      return { ...state, showDateSelection: action.payload };
      case "TOGGLE_DATE_SELECTION":
      return {...state, showDateSelection: !state.showDateSelection};
    case 'TOGGLE_DRAWER':
      return { ...state, isDrawerOpen: action.payload };
    case 'SHOW_FILTER_SELECTED':
      return { ...state, showFilterSelected: action.payload };
    case 'CANCEL_FILTERS':
      return {
        ...state,
        filterResult: [],
        returnFilterResult: false,
        polyFilterCoords: '',
        startDate: null,
        endDate: null,
        startCategory: null,
        endCategory: null,
      };
      case 'RESET_FILTERS':
        return {
          ...state,
          polyFilterCoords: '',
          startDate: null,
          endDate: null,
          startCategory: null,
          endCategory: null,
          filterStormName:[]
        };
      case 'SET_SELECTED_STATION_AND_OPEN_DASHBOARD':
        return {
          ...state,
          selected_station: action.payload,
          selectedTab: 0,
          isDashOpen: true,
          isStationDashOpen: true,
        };
      case 'CLOSE_STATION_DASHBOARD':
        return {
          ...state,
          selected_station: empty_station_obj,
          selectedTab: 0,
        };

      case 'CLOSE_STORM_TRACKS':
        return {
          ...state,
          storm_points: empty_storm_obj,
          hover_marker: empty_point_obj,
          isStormDashOpen: false,
          isStationDashOpen: false,
          isDashOpen: false,
          drawerButtonClicked: ''
          

        };
      
    default:
      return state;
  }
}