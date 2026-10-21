// mapReducer.js
// State for the map: selected storm / station, hover point, dashboards and the drawer.
// Historical filter state lives in Filter/filterReducer.js.
import { empty_point_obj, empty_station_obj, empty_storm_obj } from "./point_defaults";


export const initialMapState = {
  hover_marker: empty_point_obj,
  selected_station: empty_station_obj,
  // Which dashboard panels are visible. "Any dashboard open" is derived: storm || station
  dashboards: { storm: false, station: false },
  drawerButtonClicked: '',
  isDrawerOpen: true,
  storm_points: empty_storm_obj,
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
  openDashboard: (panel) => ({ type: 'OPEN_DASHBOARD', payload: panel }),    // panel: 'storm' | 'station'
  closeDashboard: (panel) => ({ type: 'CLOSE_DASHBOARD', payload: panel }),  // panel: 'storm' | 'station'
  closeAllDashboards: () => ({ type: 'CLOSE_ALL_DASHBOARDS' }),

  // Drawer
  setDrawerOpen: (isOpen) => ({ type: 'TOGGLE_DRAWER', payload: isOpen }),
};

export function mapReducer(state, action) {
  switch (action.type) {
    case 'SET_HOVER_MARKER':
      return { ...state, hover_marker: action.payload };
    case 'SET_STORM_POINT':
      return { ...state, storm_points: action.payload };
    case 'SET_SELECTED_STATION':
      return { ...state, selected_station: action.payload };
    case 'OPEN_DASHBOARD':
      return { ...state, dashboards: { ...state.dashboards, [action.payload]: true } };
    // Closing a panel also clears the selection that belongs to it:
    // storm panel -> hovered storm point, station panel -> selected station
    case 'CLOSE_DASHBOARD':
      return {
        ...state,
        dashboards: { ...state.dashboards, [action.payload]: false },
        ...(action.payload === 'storm' && { hover_marker: empty_point_obj }),
        ...(action.payload === 'station' && { selected_station: empty_station_obj }),
      };
    case 'CLOSE_ALL_DASHBOARDS':
      return {
        ...state,
        dashboards: { storm: false, station: false },
        hover_marker: empty_point_obj,
        selected_station: empty_station_obj,
      };
    case 'SET_DRAWER_BUTTON_CLICKED':
      return { ...state, drawerButtonClicked: action.payload };
    case 'TOGGLE_DRAWER':
      return { ...state, isDrawerOpen: action.payload };
      case 'SET_SELECTED_STATION_AND_OPEN_DASHBOARD':
        return {
          ...state,
          selected_station: action.payload,
          dashboards: { ...state.dashboards, station: true },
        };
      case 'CLOSE_STORM_TRACKS':
        return {
          ...state,
          storm_points: empty_storm_obj,
          hover_marker: empty_point_obj,
          dashboards: { storm: false, station: false },
          drawerButtonClicked: ''


        };

    default:
      return state;
  }
}
