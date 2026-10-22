import { Box, Stack } from "@mui/material";
import dayjs from "dayjs";
import { storm_cat } from "@/lib/storm_cat";

// One summary line for the date filter; either date can be missing (open-ended range)
function DateRangeLine({ startDate, endDate }) {
  const format = (date) => dayjs(date).format('DD/MM/YYYY');

  if (startDate && endDate) return <Box>Date Range: {format(startDate)} - {format(endDate)}</Box>;
  if (startDate) return <Box>Date Range: From {format(startDate)}</Box>;
  if (endDate) return <Box>Date Range: Until {format(endDate)}</Box>;
  return null;
}

export function FiltersSelected({startDate, endDate, startCategory, endCategory, polyFilterCoords, filterStormName}){

  const isFiltered = Boolean(startDate || endDate || startCategory || endCategory || polyFilterCoords || filterStormName.length);

  return(

      <Stack>
        <Box className='view-filters-content'>
           { isFiltered &&(<Box>
            Filter(s) Selected:
          </Box>)}
          { !isFiltered &&(<Box>
                No Filters Selected!
              </Box>)}
          {filterStormName.length > 0 && (<Box>
            Storm Name(s): {filterStormName.join(", ")}
          </Box>)}
          <DateRangeLine startDate={startDate} endDate={endDate} />
          {startCategory != null && endCategory != null ? (<Box>
            Category Range: ({storm_cat[startCategory]?.name?.en} -{" "} {storm_cat[endCategory]?.name?.en})
          </Box>): null}
          {polyFilterCoords && (<Box>
            Spatial Range: Range selected
          </Box>)}

        </Box>
        

      </Stack>
   
    
  )
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
