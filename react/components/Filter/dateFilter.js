import * as React from 'react';
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import {  Box,  Button,  CardContent, Card } from "@mui/material";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import {Slider} from '@mui/material';
import { FilterPanel } from './FilterPanel';
import { MIN_DATE, MAX_DATE, formatDateRangeSummary } from './filter_utils';
import { filterActions } from "@/components/Filter/filterReducer";



export const shortcutsItems = [
  {
    label: 'This Week',
    getValue: () => {
      const today = dayjs();
      return [today.startOf('week'), today.endOf('week')];
    },
  },
  
  {
    label: 'Last 7 Days',
    getValue: () => {
      const today = dayjs();
      return [today.subtract(7, 'day'), today];
    },
  },
  {
    label: 'Current Month',
    getValue: () => {
      const today = dayjs();
      return [today.startOf('month'), today.endOf('month')];
    },
  },
  {
    label: 'Last 30 Days',
    getValue: () => {
      const today = dayjs();
      return [today.subtract(30, 'day'), today];
    },
  },
  {
    label: 'Last 1 year',
    getValue: () => {
      const today = dayjs();
      return [today.subtract(1, 'year'), today];
    },
  },
  {
    label: 'Last Decade',
    getValue: () => {
      const today = dayjs();
      return [today.subtract(10, 'year'), today];
    },
  },
  
  
  
];

export function RenderDateFilter({ filterDispatch, startDate, endDate }) {
  // Either date on its own is a filter (open-ended range)
  const hasValidDates = Boolean(startDate?.isValid?.() || endDate?.isValid?.());

  return (
    <FilterPanel
      name="date"
      label="Filter by Date"
      Icon={CalendarMonthOutlinedIcon}
      isActive={hasValidDates}
      summary={formatDateRangeSummary(startDate, endDate)}
      placeholder="Any date"
      ariaLabel="filter button for date selection"
      onClear={() => {
        filterDispatch(filterActions.setStartDate(null));
        filterDispatch(filterActions.setEndDate(null));
      }}>
      <DateDisplay
        startDate={startDate}
        endDate={endDate}
        setStartDate={(date) => filterDispatch(filterActions.setStartDate(date))}
        setEndDate={(date) => filterDispatch(filterActions.setEndDate(date))}
      />
    </FilterPanel>
  );
};




export function DateDisplay({setStartDate, setEndDate, startDate, endDate}){
   

  const slotProps={
    popper:{ sx: { zIndex: 9999 },},
    
    textField: {
      // MUI's small size is 40px tall with the label and calendar icon centred
      size: 'small',
      sx: {
        color: '#e55162', // Change text color
        '& label': { color: '#e55162' }, // Change label color
        '& .MuiOutlinedInput-root': {
          fontSize:'14px !important',
          '& fieldset': { borderColor: '#e55162' }, // Default border color
          '&:hover fieldset': { borderColor: '#d43b50' }, // Hover effect
          '&.Mui-focused fieldset': { borderColor: 'red' }, // Focused border color
        },
      },
    },
    openPickerIcon: {
      sx: {
        color: '#e55162', // Change icon color
        '&:hover': { color: '#d43b50' }, // Change color on hover
      },
    },
    }
  const handleShortcutClick = (getValue) => {
    const [newStartDate, newEndDate] = getValue();
    setStartDate(newStartDate);
    // "This Week" / "Current Month" end in the future; keep them within the allowed range
    setEndDate(newEndDate.isAfter(MAX_DATE) ? MAX_DATE : newEndDate);}

  // Each picker is limited by the other date, so end can never be before start
  const isValidDate = (date) => date?.isValid?.();
  const startMaxDate = isValidDate(endDate) ? endDate : MAX_DATE;
  const endMinDate = isValidDate(startDate) ? startDate : MIN_DATE;

  // Keyboard entry can still produce an out-of-range or incomplete date: MUI shows the field as
  // invalid and we keep the last valid value instead of storing it
  const handlePickerChange = (setDate) => (date, context) => {
    if (date === null || (isValidDate(date) && !context?.validationError)) {
      setDate(date);
    }
  };

  return(
    <Card
     className='input-filter'
     >
      <CardContent
      className='date-card-content'
      sx={{display: 'block'}}>
      <Box >
            {shortcutsItems.map((shortcut, indx) => {
              return(
                <Button
                key={indx}
                className='shortcut-button'
                onClick={()=>{handleShortcutClick(shortcut.getValue)}}>
                  {shortcut.label}
                </Button>
              )
            })}
          </Box>
      </CardContent>
      <CardContent
      className='date-card-content'>
        
        <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Box 
          display="flex" 
          flexDirection="row" 
          gap={2} 
          justifyContent="center" // Centers horizontally
          alignItems="center" // Centers vertically
          sx={{ paddingTop: '6px' }} // Allows wrapping on smaller screens
          >

          <DatePicker
            label='Start Date'
            className='filter-time-input'
            value={startDate}
            onChange={handlePickerChange(setStartDate)}
            minDate={MIN_DATE}
            maxDate={startMaxDate}
            referenceDate={MIN_DATE} // an empty start picker opens at the earliest date, not today
            slotProps={slotProps}
            />
          <DatePicker
            label='End Date'
            className='filter-time-input'
            value={endDate}
            onChange={handlePickerChange(setEndDate)}
            minDate={endMinDate}
            maxDate={MAX_DATE}
            slotProps={slotProps}
             />
            </Box>
        </LocalizationProvider>
      </CardContent>
      
      <CardContent
      className='date-card-content'
      >
        <RangeSlider
          startDate={startDate}
          endDate={endDate}
          setStartDate={setStartDate}
          setEndDate={setEndDate}/>
      </CardContent>


      

      

    
  
    </Card>
    
  )
}



  
  


// Moves `date` (or `fallback` when no valid date is set) to `year`, keeping its month and day,
// and keeps the result inside MIN_DATE..MAX_DATE
function withYear(date, fallback, year) {
  const base = date?.isValid?.() ? date : fallback;
  const moved = base.year(year);
  if (moved.isBefore(MIN_DATE)) return MIN_DATE;
  if (moved.isAfter(MAX_DATE)) return MAX_DATE;
  return moved;
}

// Year range slider. Its position comes from startDate/endDate, so it follows the pickers and
// shortcuts; dragging a thumb only changes the year of that date.
export function RangeSlider({ startDate, endDate, setStartDate, setEndDate }) {
  const startYear = startDate?.isValid?.() ? startDate.year() : MIN_DATE.year();
  const endYear = endDate?.isValid?.() ? endDate.year() : MAX_DATE.year();

  const handleChange = (event, newValue) => {
    const [newStartYear, newEndYear] = newValue;
    const newStartDate = newStartYear !== startYear ? withYear(startDate, MIN_DATE, newStartYear) : startDate;
    let newEndDate = newEndYear !== endYear ? withYear(endDate, MAX_DATE, newEndYear) : endDate;

    // Both thumbs in the same year can put end before start (e.g. 10 Dec -> 5 Jan); clamp end to start
    if (newStartDate?.isValid?.() && newEndDate?.isValid?.() && newEndDate.isBefore(newStartDate)) {
      newEndDate = newStartDate;
    }

    if (newStartDate !== startDate) setStartDate(newStartDate);
    if (newEndDate !== endDate) setEndDate(newEndDate);
  };

  return (
    <Box sx={{ width: '100%'}}>
      <Slider
      size="small"
      sx={{
        width: '85%',
        color: '#e55162',
        
      }}
        getAriaLabel={() => 'Year range'}
        value={[startYear, endYear]}
        onChange={handleChange}
        min={MIN_DATE.year()}
        max={MAX_DATE.year()}
        marks={[
          { value: 1880, label: '1880' },
          { value: 1950, label: '1950' },
          { value: 2020, label: '2020' },
          
        ]}
      />
    </Box>

        
  );
}

