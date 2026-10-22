import { Box, Stack } from "@mui/material";
import { storm_cat } from "@/lib/storm_cat";
import { formatDateRangeSummary } from "./filter_utils";

// One summary line for the date filter; either date can be missing (open-ended range)
function DateRangeLine({ startDate, endDate }) {
  const summary = formatDateRangeSummary(startDate, endDate);
  return summary ? <Box>Date Range: {summary}</Box> : null;
}


export function FiltersSubmitted({filterQuery}){
  const isEmpty =
  (filterQuery.endCategory === "" || filterQuery.endCategory === null || filterQuery.endCategory === undefined) &&
  !filterQuery.endDate &&
  (filterQuery.polyCoords === "" || filterQuery.polyCoords === null || filterQuery.polyCoords === undefined) &&
  (filterQuery.startCategory === "" || filterQuery.startCategory === null || filterQuery.startCategory === undefined) &&
  !filterQuery.startDate &&
  Array.isArray(filterQuery.stormName) &&
  filterQuery.stormName.length === 0;
 
  return(
    
      <Stack>
        
        <Box className='view-filters-content'>
          {!isEmpty && (<Box>
            Filter Query:
          </Box>)}
          {filterQuery?.stormName != "" && (<Box>
            Storm Name(s): {filterQuery.stormName.join(", ")}
          </Box>)}
          {isEmpty && (<Box>
            No Filters Applied!
          </Box>)}
          <DateRangeLine startDate={filterQuery?.startDate} endDate={filterQuery?.endDate} />
          {filterQuery?.startCategory != null && filterQuery?.endCategory != null ? (<Box>
            Category Range: ({storm_cat[filterQuery.startCategory]?.name?.en} -{" "} {storm_cat[filterQuery.endCategory]?.name?.en})
          </Box>): null}
          {filterQuery?.polyCoords && (<Box>
            Spatial Range: Range selected
          </Box>)}

        </Box>
        

      </Stack>
    
    
  )
}
