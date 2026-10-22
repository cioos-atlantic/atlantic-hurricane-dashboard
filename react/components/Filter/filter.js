import { Box, Button, IconButton, Tooltip } from "@mui/material";
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import { useState } from 'react';
import Stack from '@mui/material/Stack';
import PublishRoundedIcon from '@mui/icons-material/PublishRounded';
import { useRouter } from 'next/router';
import { RenderDateFilter } from "./dateFilter";
import { makeStormList } from "../historical_storm/historical_storm_utils";
import { input_filters } from "@/components/Filter/filters_list";
import { InputFilter } from "./inputFilter";
import { basePath } from "@/next.config";
import LoadingScreen from "../loading_screen";
import { RenderCategoryFilter } from "./categorySlider";
import { empty_station_obj } from "../point_defaults";
import { formatFilterDate, formatStormCategory, formatStormName, formatCategoryRange, hasActiveFilters } from "./filter_utils";
import { FiltersSubmitted } from "./viewFilters";
import { mapActions } from "@/components/mapReducer";
import { filterActions } from "@/components/Filter/filterReducer";
import { useFilters, useFilterDispatch } from "@/components/Filter/FilterContext";


export function RenderFilter({ clearShapesRef, dispatch, setStationPoints }) {
  const { startDate, endDate, startCategory, endCategory, polyFilterCoords, filterStormName,
    filterQuery, returnFilterResult } = useFilters();
  const filterDispatch = useFilterDispatch();
  const [loading, setLoading] = useState(false);

  const setFilterStormName = (state) => filterDispatch(filterActions.setFilterStormName(state));
  // Submit needs a filter value; Clear also has work to do while a submitted query or its results are shown
  const filtersSelected = hasActiveFilters({ filterStormName, startDate, endDate, startCategory, endCategory, polyFilterCoords });
  const hasSubmittedQuery = returnFilterResult || Object.keys(filterQuery).length > 0;
  const canClear = filtersSelected || hasSubmittedQuery;

  const router = useRouter(); // Next.js useRouter


  function handleClearAllFilters() {
    filterDispatch(filterActions.clearAll())

    // Clear shapes via reference
    if (clearShapesRef && clearShapesRef.current) {
      clearShapesRef.current.clearShapes();
    }
  }


  function handleRemoveArea() {
    clearShapesRef?.current?.clearShapes();
    filterDispatch(filterActions.setPolyFilterCoords(''));
  }


  async function handleFilterSubmit() {
    filterDispatch(filterActions.setShowFilterSelected(false));
    dispatch(mapActions.setDrawerButtonClicked(''));
    filterDispatch(filterActions.closePanel());

    const updatedParams = {
      startDate: startDate, // Ensure start and end dates are included
      endDate: endDate,
      polyCoords: polyFilterCoords,
      startCategory: startCategory,
      endCategory: endCategory,
      stormName: filterStormName
    };

    filterDispatch(filterActions.setFilterQuery(updatedParams));

    const stormResult = await processFilterRequest(updatedParams, setLoading);

    filterDispatch(filterActions.setFilterResult(stormResult));
    router.push(`/?page=historical`);

    dispatch(mapActions.setDrawerOpen(true));
    filterDispatch(filterActions.setReturnFilterResult(true));
    dispatch(mapActions.closeStormTracks())
    setStationPoints(empty_station_obj)
    // Filter values are kept after submitting so they can be adjusted and resubmitted;
    // "Clear filter query" resets them
  }


  return (
    <>
      {loading ? (
        <LoadingScreen />
      ) : (
        <Stack
          direction="column"
          spacing={0.4}
          sx={{ display: 'flex' }}
          className='filter-icons-list'>

          <Box className='historical_page_drawer_subheader'
            sx={{ fontSize: '14px' }}
          >Filter Storms</Box>

          {
            input_filters.map((input_filter, index) => {
              return (
                <div className="filter-group" key={index}>
                  <InputFilter
                    input_filter={input_filter}
                    filterStormName={filterStormName}
                    setFilterStormName={setFilterStormName}
                    startDate={startDate}
                    endDate={endDate}
                    polyCoords={polyFilterCoords}
                    startCategory={startCategory}
                    endCategory={endCategory}
                  />
                </div>
              )
            })
          }

          <div className="filter-group">
            <RenderDateFilter
              filterDispatch={filterDispatch}
              startDate={startDate}
              endDate={endDate}
            />
          </div>
          <div className="filter-group">
            <RenderCategoryFilter
              filterDispatch={filterDispatch}
              startCategory={startCategory}
              endCategory={endCategory}
            />
          </div>

          {/* The drawn polygon has no filter panel; show it styled like an active filter field,
              with a way to remove it */}
          {polyFilterCoords && (
            <Box className="filter-field-wrap filter-field-wrap--active">
              <Box className="filter-field">
                <span className="filter-field-text">
                  <span className="filter-field-label">
                    <MapOutlinedIcon fontSize="inherit" />
                    Map area
                  </span>
                  <span className="filter-field-value">Drawn on map</span>
                </span>
              </Box>
              <IconButton
                className="filter-field-clear"
                aria-label="Remove drawn area"
                onClick={handleRemoveArea}>
                <CloseRoundedIcon fontSize="small" />
              </IconButton>
            </Box>
          )}

          {/* Disabled (not hidden) when nothing is selected, so the tour can still point at Submit.
              The span lets the tooltip work on a disabled button. */}
          <Tooltip title={filtersSelected ? "" : "Select a filter first"}>
            <span className="filter-group">
              <Button
                id="filter-submit-button"
                className="filter-badge"
                disabled={!filtersSelected}
                onClick={handleFilterSubmit}
                startIcon={<PublishRoundedIcon />}>
                Submit FILTER QUERY
              </Button>
            </span>
          </Tooltip>
          <Tooltip title={canClear ? "" : "Nothing to clear"}>
            <span className="filter-group">
              <Button
                className="filter-badge"
                disabled={!canClear}
                onClick={handleClearAllFilters}>
                CLEAR FILTER QUERY
              </Button>
            </span>
          </Tooltip>

          {hasSubmittedQuery && (
            <div className="filter-group">
              <FiltersSubmitted filterQuery={filterQuery} />
            </div>
          )}

        </Stack>
      )}
    </>
  )
}


export async function processFilterRequest(filterParameters, setLoading) {

  let uniqueList = [];
  const stormCategory = formatStormCategory(filterParameters['stormCategory']);
  const stormNames = formatStormName(filterParameters['stormName']);
  const startDate = formatFilterDate(filterParameters['startDate']);
  const endDate = formatFilterDate(filterParameters['endDate']);

  const stormPoly = filterParameters['polyCoords'];
  const { start_category: startCategory, end_category: endCategory } =
    formatCategoryRange(filterParameters['startCategory'], filterParameters['endCategory']);

  const query = new URLSearchParams({
    storm_category: stormCategory,
    name: stormNames,
    start_date: startDate,
    end_date: endDate,
    polygon: stormPoly,
    start_category: startCategory,
    end_category: endCategory,
  }).toString();

  setLoading(true);
  try {
    const resource = await fetch(`${basePath}/api/filter_storms?${query}`);
    const storm_data = await resource.json();

    console.debug(`historical Storm Data for ${stormCategory} Between  ${startDate} and ${endDate}: `, storm_data);
    // Create a set to track unique IDs and add objects to the result list
    uniqueList = makeStormList(storm_data)
    setLoading(false);

    if (uniqueList.length === 0) {
      alert("No result found for this search, please try again...")
    }

  } catch (error) {
    setLoading(false);
    console.error('Error fetching storm or station data:', error);
  }
  return uniqueList
}
