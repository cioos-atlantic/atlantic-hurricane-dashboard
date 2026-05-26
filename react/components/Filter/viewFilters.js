import { Box, Stack } from "@mui/material";
import dayjs from "dayjs";
import { storm_cat } from "@/lib/storm_cat";

export function FiltersSelected({startDate, endDate, startCategory, endCategory, polyFilterCoords, filterStormName}){
  console.log("Selected Filters: ", {startDate, endDate, startCategory, endCategory, polyFilterCoords, filterStormName});

  const isFiltered = startDate || endDate || startCategory || endCategory || polyFilterCoords || filterStormName.length;
  
  return( 
    
      <Stack>
        <Box className='view-filters-content'>
           { isFiltered > 0 &&(<Box>
            Filter(s) Selected:
          </Box>)}
          { !isFiltered &&(<Box>
                No Filters Selected!
              </Box>)}
          {filterStormName.length > 0 && (<Box>
            Storm Name(s): {filterStormName.join(", ")}
          </Box>)}
          {startDate && endDate && (<Box>
            Date Range: {dayjs(startDate).format('DD/MM/YYYY') } - {dayjs(endDate).format('DD/MM/YYYY') }
          </Box>)}
          {startCategory != null && endCategory != null ? (<Box>
            Category Range: ({getByField(startCategory, storm_cat, 'min')[1]?.name?.en} -{" "} {getByField(endCategory, storm_cat, 'max')[1]?.name?.en}) 
          </Box>): null}
          {polyFilterCoords && (<Box>
            Spatial Range: Range selected
          </Box>)}

        </Box>
        

      </Stack>
   
    
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
          {filterQuery?.startDate && filterQuery?.endDate && (<Box>
            Date Range: {dayjs(filterQuery.startDate).format('DD/MM/YYYY') } - {dayjs(filterQuery.endDate).format('DD/MM/YYYY') }
          </Box>)}
          {filterQuery?.startCategory != null && filterQuery?.endCategory != null ? (<Box>
            Category Range: ({getByField(filterQuery?.startCategory, storm_cat, 'min')?.[1]?.name?.en} -{" "} {getByField(filterQuery?.endCategory, storm_cat, 'max')?.[1]?.name?.en}) 
          </Box>): null}
          {filterQuery?.polyCoords && (<Box>
            Spatial Range: Range selected
          </Box>)}

        </Box>
        

      </Stack>
    
    
  )
}



function getByField(value, categories, field) {
  return Object.entries(categories).find(([_, cat]) =>
    cat[field] === value
  );
}