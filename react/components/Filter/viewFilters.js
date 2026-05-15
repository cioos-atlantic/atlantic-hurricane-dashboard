import { Box, Stack } from "@mui/material";
import dayjs from "dayjs";

export function FiltersSelected({startDate, endDate, startCategory, endCategory, polyFilterCoords, filterStormName}){
  console.log(filterStormName);
  const isFiltered = startDate || endDate || startCategory || endCategory || polyFilterCoords || filterStormName.length;
  console.log(filterStormName)
  return( 
    <Box className='view-filter-space'>
      <Stack>
        <Box className='historical_page_drawer_subheader'
          sx={{
            fontSize: '14px',
            
          }}
          >Filter(s) Selected: </Box>
        <Box className='view-filters-content'>
       { !isFiltered &&(<Box>
            No Filters Selected!
          </Box>)}
          {filterStormName.length > 0 && (<Box>
            Storm Name(s): {filterStormName.join(", ")}
          </Box>)}
          {startDate && endDate && (<Box>
            Date Range: {dayjs(startDate).format('DD/MM/YYYY') } - {dayjs(endDate).format('DD/MM/YYYY') }
          </Box>)}
          {startCategory && endCategory && (<Box>
            Category Range: ({startCategory} to {endCategory}) 
          </Box>)}
          {polyFilterCoords && (<Box>
            Spatial Range: Range selected
          </Box>)}

        </Box>
        

      </Stack>
    </Box>
    
  )
}


export function FiltersSubmitted({filterQuery}){
  console.log(filterQuery);
  const isEmpty =
  (filterQuery.endCategory === "" || filterQuery.endCategory === null || filterQuery.endCategory === undefined) &&
  !filterQuery.endDate &&
  (filterQuery.polyCoords === "" || filterQuery.polyCoords === null || filterQuery.polyCoords === undefined) &&
  (filterQuery.startCategory === "" || filterQuery.startCategory === null || filterQuery.startCategory === undefined) &&
  !filterQuery.startDate &&
  Array.isArray(filterQuery.stormName) &&
  filterQuery.stormName.length === 0;
 
  return(
    <Box >
      <Stack>
        <Box className='historical_page_drawer_subheader'
          sx={{
            fontSize: '14px',
            
          }}
          >Filter Query: </Box>
        
        <Box className='view-filters-content'>
          {filterQuery?.stormName != "" && (<Box>
            Storm Name(s): {filterQuery.stormName.join(", ")}
          </Box>)}
          {isEmpty && (<Box>
            No Filters Applied!
          </Box>)}
          {filterQuery?.startDate && filterQuery?.endDate && (<Box>
            Date Range: {dayjs(filterQuery.startDate).format('DD/MM/YYYY') } - {dayjs(filterQuery.endDate).format('DD/MM/YYYY') }
          </Box>)}
          {filterQuery?.startCategory && filterQuery?.endCategory && (<Box>
            Category Range: ({filterQuery?.startCategory} to {filterQuery?.endCategory}) 
          </Box>)}
          {filterQuery?.polyCoords && (<Box>
            Spatial Range: Range selected
          </Box>)}

        </Box>
        

      </Stack>
    </Box>
    
  )
}