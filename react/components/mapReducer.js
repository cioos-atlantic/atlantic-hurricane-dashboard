// mapReducer.js
import { empty_point_obj, empty_station_obj, empty_storm_obj } from "./point_defaults";


export const initialMapState = {
  hover_marker: empty_point_obj,
  selectedTab: 0,
  selected_station: empty_station_obj,
  filterResult: {},
  returnFilterResult: false,
  polyFilterCoords: '',
  isDashOpen: false,
  isStormDashOpen: false,
  isStationDashOpen: false,
  drawerButtonClicked: '',
  startDate: null,
  endDate: null,
  startCategory: '',
  endCategory: '',
  showCatSelection: false,
  showDateSelection: false,
  isDrawerOpen: true,
  storm_points: empty_storm_obj,
  filterQuery:{},
  filterStormName:[],
  selectedStormNames:[],
  info:true,
  showFilterSelected:true
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
    case 'SET_SELECTED_STORM_NAMES':
      return { ...state, selectedStormNames: action.payload };
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
    case 'SET_INFO_GUIDE':
      return { ...state, info: action.payload };
    case 'SHOW_FILTER_SELECTED':
      return { ...state, showFilterSelected: action.payload };
    case 'CANCEL_FILTERS':
      return {
        ...state,
        filterResult: {},
        returnFilterResult: false,
        polyFilterCoords: '',
        startDate: null,
        endDate: null,
        startCategory: "",
        endCategory: "",
      };
      case 'RESET_FILTERS':
        return {
          ...state,
          polyFilterCoords: '',
          startDate: null,
          endDate: null,
          startCategory: "",
          endCategory: "",
          filterStormName:"",
          selectedStormNames:[]
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