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
  showCatSelection: false,
  showDateSelection: false,
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
    case 'TOGGLE_CAT_SELECTION':
      return { ...state, showCatSelection: !state.showCatSelection };
    case 'SET_CAT_SELECTION':
      return { ...state, showCatSelection: action.payload };
    case 'TOGGLE_DATE_SELECTION':
      return { ...state, showDateSelection: !state.showDateSelection };
    case 'SET_DATE_SELECTION':
      return { ...state, showDateSelection: action.payload };
    case 'SHOW_FILTER_SELECTED':
      return { ...state, showFilterSelected: action.payload };
    case 'SET_FILTER_QUERY':
      return { ...state, filterQuery: action.payload };
    case 'SET_FILTER_RESULT':
      return { ...state, filterResult: action.payload };
    case 'TOGGLE_FILTER_RESULT':
      return { ...state, returnFilterResult: action.payload };
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
        filterStormName: [],
      };
    default:
      return state;
  }
}
