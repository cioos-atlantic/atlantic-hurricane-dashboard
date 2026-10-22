import { Box, Button } from "@mui/material";
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
import { formatFilterDate, formatStormCategory, formatStormName, formatCategoryRange } from "./filter_utils";
import { FiltersSelected, FiltersSubmitted } from "./viewFilters";
import { mapActions } from "@/components/mapReducer";
import { filterActions } from "@/components/Filter/filterReducer";
import { useFilters, useFilterDispatch } from "@/components/Filter/FilterContext";


export function RenderFilter({ clearShapesRef, dispatch, setStationPoints }) {
  const { startDate, endDate, startCategory, endCategory, polyFilterCoords, filterStormName,
    showFilterSelected, filterQuery } = useFilters();
  const filterDispatch = useFilterDispatch();
  const [loading, setLoading] = useState(false);

  const setFilterStormName = (state) => filterDispatch(filterActions.setFilterStormName(state));

  const router = useRouter(); // Next.js useRouter


  function handleClearAllFilters() {
    filterDispatch(filterActions.resetFilters())

    // Clear shapes via reference
    if (clearShapesRef && clearShapesRef.current) {
      clearShapesRef.current.clearShapes();
    }
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
    filterDispatch(filterActions.setStartDate(null));
    filterDispatch(filterActions.setEndDate(null));
    filterDispatch(filterActions.setPolyFilterCoords(''));
    filterDispatch(filterActions.setStartCategory(null));
    filterDispatch(filterActions.setEndCategory(null));
    filterDispatch(filterActions.setFilterStormName([]));
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
                    filterDispatch={filterDispatch}
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

          <Button
            id="filter-submit-button"
            className="filter-badge"
            onClick={handleFilterSubmit}
            startIcon={<PublishRoundedIcon />}>
            Submit FILTER QUERY
          </Button>
          <Button
            className="filter-badge"
            onClick={handleClearAllFilters}>
            CLEAR FILTER QUERY
          </Button>

          <div className="filter-group">
            {showFilterSelected ? (
              <FiltersSelected
                startDate={startDate}
                endDate={endDate}
                startCategory={startCategory}
                endCategory={endCategory}
                polyFilterCoords={polyFilterCoords}
                filterStormName={filterStormName} />
            ) : (
              <FiltersSubmitted filterQuery={filterQuery} />
            )}
          </div>

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
