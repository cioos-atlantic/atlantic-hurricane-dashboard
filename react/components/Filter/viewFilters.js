import { Box } from "@mui/material";
import { formatDateRangeSummary, formatCategorySummary } from "./filter_utils";

// The last submitted filter query, shown under the results header as one line
// ("Storm names: Katrina · Date: From 01/01/2020 · Category: …"). Nothing when no filter was set.
export function FiltersSubmitted({filterQuery}){
  const parts = [];
  if (filterQuery?.stormName?.length) parts.push(`Storm names: ${filterQuery.stormName.join(", ")}`);
  const dateSummary = formatDateRangeSummary(filterQuery?.startDate, filterQuery?.endDate);
  if (dateSummary) parts.push(`Date: ${dateSummary}`);
  const categorySummary = formatCategorySummary(filterQuery?.startCategory, filterQuery?.endCategory);
  if (categorySummary) parts.push(`Category: ${categorySummary}`);
  if (filterQuery?.polyCoords) parts.push("Area: drawn on map");

  if (parts.length === 0) return null;

  return(
    <Box className='filter-result-query'>
      {parts.join(" · ")}
    </Box>
  )
}
