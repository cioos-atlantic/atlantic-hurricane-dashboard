// filterReducer.js
// State for the historical storm filters (left drawer) and their results.
// Map / storm / dashboard state lives in mapReducer.js.

export const initialFilterState = {
  // Filter values
  startDate: null,
  endDate: null,
  startCategory: null,
  endCategory: null,
  polyFilterCoords: '',
  filterStormName: [],

  // Filter UI
  openPanel: null, // 'stormName' | 'date' | 'category' | null; only one panel is open at a time
  showFilterSelected: true,

  // Submitted query and its results
  filterQuery: {},
  filterResult: [],
  returnFilterResult: false,
};

// Action helpers: build the action objects for filterReducer.
// Usage: filterDispatch(filterActions.setStartDate(date))
export const filterActions = {
  // Filter values
  setStartDate: (date) => ({ type: 'SET_START_DATE', payload: date }),
  setEndDate: (date) => ({ type: 'SET_END_DATE', payload: date }),
  setStartCategory: (category) => ({ type: 'SET_START_CATEGORY', payload: category }),
  setEndCategory: (category) => ({ type: 'SET_END_CATEGORY', payload: category }),
  setPolyFilterCoords: (coords) => ({ type: 'SET_POLY_FILTER_COORDS', payload: coords }),
  setFilterStormName: (names) => ({ type: 'SET_FILTER_STORM_NAME', payload: names }),
  // Clears everything: filter values, open panel, submitted query and results
  clearAll: () => ({ type: 'CLEAR_ALL' }),

  // Filter UI
  togglePanel: (panel) => ({ type: 'TOGGLE_PANEL', payload: panel }),
  closePanel: () => ({ type: 'CLOSE_PANEL' }),
  setShowFilterSelected: (show) => ({ type: 'SHOW_FILTER_SELECTED', payload: show }),

  // Filter results
  setFilterQuery: (query) => ({ type: 'SET_FILTER_QUERY', payload: query }),
  setFilterResult: (result) => ({ type: 'SET_FILTER_RESULT', payload: result }),
  setReturnFilterResult: (show) => ({ type: 'TOGGLE_FILTER_RESULT', payload: show }),
};

export function filterReducer(state, action) {
  switch (action.type) {
    case 'SET_START_DATE':
      return { ...state, startDate: action.payload };
    case 'SET_END_DATE':
      return { ...state, endDate: action.payload };
    case 'SET_START_CATEGORY':
      return { ...state, startCategory: action.payload };
    case 'SET_END_CATEGORY':
      return { ...state, endCategory: action.payload };
    case 'SET_POLY_FILTER_COORDS':
      return { ...state, polyFilterCoords: action.payload };
    case 'SET_FILTER_STORM_NAME':
      return { ...state, filterStormName: action.payload };
    case 'TOGGLE_PANEL':
      return { ...state, openPanel: state.openPanel === action.payload ? null : action.payload };
    case 'CLOSE_PANEL':
      return { ...state, openPanel: null };
    case 'SHOW_FILTER_SELECTED':
      return { ...state, showFilterSelected: action.payload };
    case 'SET_FILTER_QUERY':
      return { ...state, filterQuery: action.payload };
    case 'SET_FILTER_RESULT':
      return { ...state, filterResult: action.payload };
    case 'TOGGLE_FILTER_RESULT':
      return { ...state, returnFilterResult: action.payload };
    case 'CLEAR_ALL':
      return initialFilterState;
    default:
      return state;
  }
}
