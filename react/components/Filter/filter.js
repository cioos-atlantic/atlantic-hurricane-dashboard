import { Alert, Box, Button, IconButton, Tooltip } from "@mui/material";
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
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
import { formatFilterDate, formatStormCategory, formatStormName, formatCategoryRange, countActiveFilters, getDateRangeError } from "./filter_utils";
import { mapActions } from "@/components/mapReducer";
import { filterActions } from "@/components/Filter/filterReducer";
import { useFilters, useFilterDispatch } from "@/components/Filter/FilterContext";


export function RenderFilter({ clearShapesRef, dispatch, setStationPoints }) {
  const { startDate, endDate, startCategory, endCategory, polyFilterCoords, filterStormName,
    filterQuery, returnFilterResult } = useFilters();
  const filterDispatch = useFilterDispatch();
  const [loading, setLoading] = useState(false);
  const [applyFailed, setApplyFailed] = useState(false);

  const setFilterStormName = (state) => filterDispatch(filterActions.setFilterStormName(state));
  // Apply needs a filter value; "Clear all" also has work to do while a submitted query or its results are shown
  const activeFilterCount = countActiveFilters({ filterStormName, startDate, endDate, startCategory, endCategory, polyFilterCoords });
  const filtersSelected = activeFilterCount > 0;
  const dateError = getDateRangeError(startDate, endDate); // a mistyped date blocks Apply
  const applyBlockedReason = !filtersSelected ? "Select a filter first" : dateError;
  const hasSubmittedQuery = returnFilterResult || Object.keys(filterQuery).length > 0;
  const canClear = filtersSelected || hasSubmittedQuery;

  const router = useRouter(); // Next.js useRouter


  function handleClearAllFilters() {
    filterDispatch(filterActions.clearAll())
    setApplyFailed(false);

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
    filterDispatch(filterActions.closePanel());

    const updatedParams = {
      startDate: startDate, // Ensure start and end dates are included
      endDate: endDate,
      polyCoords: polyFilterCoords,
      startCategory: startCategory,
      endCategory: endCategory,
      stormName: filterStormName
    };

    setApplyFailed(false);
    const { storms, error } = await processFilterRequest(updatedParams, setLoading);

    // On a failed request keep whatever was showing (including the highlighted storm) and report it under Apply
    if (error) {
      setApplyFailed(true);
      return;
    }

    // An empty result still shows the results view ("Filter Result: 0 storms" + the query)
    dispatch(mapActions.setDrawerButtonClicked(''));
    filterDispatch(filterActions.setFilterQuery(updatedParams));
    filterDispatch(filterActions.setFilterResult(storms));
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

          <Box className="filter-header">
            <span className="filter-header-title">
              <FilterAltOutlinedIcon fontSize="small" />
              Filter storms
              {activeFilterCount > 0 && (
                <span className="filter-header-count" aria-label={`${activeFilterCount} active`}>
                  {activeFilterCount}
                </span>
              )}
            </span>
            {canClear && (
              <button type="button" className="filter-header-clear" onClick={handleClearAllFilters}>
                Clear all
              </button>
            )}
          </Box>

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

          {/* Disabled (not hidden) when nothing is selected or a date is invalid, so the tour can
              still point at Submit. The span lets the tooltip work on a disabled button. */}
          <Tooltip title={applyBlockedReason}>
            <span className="filter-group">
              <Button
                id="filter-submit-button"
                className="filter-badge"
                disabled={Boolean(applyBlockedReason)}
                onClick={handleFilterSubmit}
                startIcon={<PublishRoundedIcon />}>
                Apply filters
              </Button>
            </span>
          </Tooltip>

          {applyFailed && (
            <Alert severity="error" className="filter-group" onClose={() => setApplyFailed(false)}>
              Couldn&apos;t load storms. Please try again.
            </Alert>
          )}

        </Stack>
      )}
    </>
  )
}


// Returns { storms, error }: `error` is set when the request fails; an empty `storms` just means no matches
export async function processFilterRequest(filterParameters, setLoading) {

  let uniqueList = [];
  let error = null;
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
    if (!resource.ok) throw new Error(`filter_storms returned ${resource.status}`);
    const storm_data = await resource.json();

    console.debug(`historical Storm Data for ${stormCategory} Between  ${startDate} and ${endDate}: `, storm_data);
    // Create a set to track unique IDs and add objects to the result list
    uniqueList = makeStormList(storm_data)

  } catch (fetchError) {
    error = fetchError;
    console.error('Error fetching storm or station data:', fetchError);
  } finally {
    setLoading(false);
  }
  return { storms: uniqueList, error }
}
