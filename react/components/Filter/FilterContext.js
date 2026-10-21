// FilterContext.js
// Provides the historical filter state (filterReducer) to the components that need it,
// without passing it through Map -> Drawer -> HistoricalStormList -> RenderFilter as props.
//
// State and dispatch are separate contexts on purpose: components that only change filters
// (e.g. RenderSpatialFilter on the map) read useFilterDispatch() and never re-render when a
// filter value changes. Because FilterProvider receives the rest of the page as `children`,
// a filter change only re-renders the components that call useFilters(), not the map or dashboards.
import React, { createContext, useContext, useReducer } from "react";
import { filterReducer, initialFilterState } from "./filterReducer";

const FilterStateContext = createContext(null);
const FilterDispatchContext = createContext(null);

export function FilterProvider({ children }) {
  const [filters, filterDispatch] = useReducer(filterReducer, initialFilterState);

  return (
    <FilterDispatchContext.Provider value={filterDispatch}>
      <FilterStateContext.Provider value={filters}>
        {children}
      </FilterStateContext.Provider>
    </FilterDispatchContext.Provider>
  );
}

export function useFilters() {
  const filters = useContext(FilterStateContext);
  if (filters === null) throw new Error("useFilters must be used inside <FilterProvider>");
  return filters;
}

export function useFilterDispatch() {
  const filterDispatch = useContext(FilterDispatchContext);
  if (filterDispatch === null) throw new Error("useFilterDispatch must be used inside <FilterProvider>");
  return filterDispatch;
}
