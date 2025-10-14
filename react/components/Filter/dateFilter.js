import * as React from 'react';
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import { useState } from 'react';
import { Box, Button, CardContent, Card, CardActions } from "@mui/material";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Slider } from '@mui/material';
import { smallScreenIconButton } from './filter_utils';
import { ShowOptions, CloseOptions } from './filter';
import { useMap } from 'react-leaflet';

const currentYear = new Date().getFullYear();
const defaultStartYear = 1860;

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

const reset = { label: 'Reset', getValue: () => [null, null] };




export function RenderDateFilter({state, dispatch, setShowFilterOptions}){
  //const [showDateSelection, setShowDateSelection] = useState(false); 
  let hasValidDates = false;

  try {
    hasValidDates = state.startDate?.isValid?.() && state.endDate?.isValid?.();
  }
  catch (err) {
    console.error("State does not have valid start & end dates")
  }

  const buttonStyle = {
    backgroundColor: hasValidDates ? '#e55162' : 'white',
    color: hasValidDates ? 'white' : '#e55162',
    '&:hover': {
      backgroundColor: hasValidDates ? '#ffd1dc' : '#82ccdd',
      color: hasValidDates ? 'black' : 'black',
    },
  };

  function handleIconClick(){
    dispatch({ type: "SHOW_FILTER_SELECTED", payload: true })
    dispatch({ type: "TOGGLE_DATE_SELECTION"});
    dispatch({ type: "SET_CAT_SELECTION", payload: false});
    setShowFilterOptions(prev => ({
      ...prev,
      stormName: false, // stormName must be defined here
    }));
  }




  return (
    <>
      <Button
        className="filter-badge"
        onClick={handleIconClick}
        startIcon={<CalendarMonthOutlinedIcon />}
        endIcon={!state.showDateSelection ? (<ShowOptions />) : (<CloseOptions />)}
        sx={{
          ...buttonStyle,
          display: { xs: "none", md: "inline-flex" },
        }
        }>

        Filter by Date



      </Button>
      {smallScreenIconButton('Filter by Date', handleIconClick, buttonStyle, CalendarMonthOutlinedIcon)}


      {state.showDateSelection &&
        (<DateDisplay
          startDate={state.startDate}
          endDate={state.endDate}
          setStartDate={(date) => dispatch({ type: "SET_START_DATE", payload: date })}
          setEndDate={(date) => dispatch({ type: "SET_END_DATE", payload: date })}
          setShowDateSelection={(date) => dispatch({ type: "SET_DATE_SELECTION", payload: date })}
        />)}


    </>



  );
};




export function DateDisplay({ setStartDate, setEndDate, setShowDateSelection, startDate, endDate }) {
  const slotProps = {
    popper: { sx: { zIndex: 9999 }, },

    textField: {
      sx: {
        color: '#e55162', // Change text color
        '& label': { color: '#e55162' }, // Change label color
        //'& input': { color: '#e55162' }, // Change input text color
        '& .MuiOutlinedInput-root': {
          height: { sm: '40px !important', md: '50px !important' },
          fontSize: { sm: '12px !important', md: '14px !important' },
          '& fieldset': { borderColor: '#e55162' }, // Default border color
          '&:hover fieldset': { borderColor: '#d43b50' }, // Hover effect
          '&.Mui-focused fieldset': { borderColor: 'red' }, // Focused border color
        },
        '& .MuiOutlinedInput-notchedOutline': {
          height: 'inherit !important',
        },
        '& .MuiInputLabel-root': {
          fontSize: { sm: '14px !important', md: '16px !important' },
          left: { sm: '-2px !important', md: '-3px !important' },


        }
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
    setEndDate(newEndDate);
  }
  return (
    <Card
      sx={{
        position: 'absolute',
        top: { xs: '6px', md: '100%', },
        right: { xs: '100%', md: '0px', },
        width: { xs: '270px', md: '320px', },
        height: { xs: '250px', md: 'inherit', },
        overflow: { xs: 'scroll', md: 'hidden', },
        padding: '6px',
        backgroundColor: "#f4f4f4",
        alignContent: 'center',
        border: '2px solid #e55162',
        borderRadius: '10px',
        zIndex: '9001',
      }}
    >
      <CardContent
        className='date-card-content'
        sx={{ display: { xs: "none", md: "block" }, }}>
        <Box >
          {shortcutsItems.map((shortcut, indx) => {
            return (
              <Button
                key={indx}
                className='shortcut-button'
                onClick={() => { handleShortcutClick(shortcut.getValue) }}>
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
            flexDirection={{ xs: "row", md: "row" }}
            gap={2}
            justifyContent="center" // Centers horizontally
            alignItems="center" // Centers vertically
          >

            <DatePicker
              defaultValue={dayjs()}
              label='Start Date'
              className='filter-time-input'
              value={startDate}
              onChange={setStartDate}
              slotProps={slotProps}

            />
            <DatePicker
              defaultValue={dayjs()}
              label='End Date'
              className='filter-time-input'
              value={endDate}
              onChange={setEndDate}
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
          setEndDate={setEndDate} />
      </CardContent>

      <CardActions
        className='date-card-content'>
        <Box
          sx={{ display: 'flex', justifyContent: 'center', gap: '2px', width: '100%' }}>
          <Button
            size="small"
            className='filter-submit-button'
            onClick={() => {
              setStartDate(null); // Reset to empty string
              setEndDate(null);   // Reset to empty string
            }}>Clear</Button>
          <Button
            size="small"
            className='filter-submit-button'
            onClick={() => { setShowDateSelection(false) }}>Close</Button>


        </Box>



      </CardActions>







    </Card>

  )
}



export function RangeSlider({ startDate, endDate, setStartDate, setEndDate }) {
  if (!startDate) {
    startDate = defaultStartYear;
  }

  if (!endDate) {
    endDate = currentYear;
  }

  // Independent state for the slider's range
  const [value, setValue] = useState([startDate, endDate]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
    setStartDate(dayjs().year(newValue[0]));
    setEndDate(dayjs().year(newValue[1]));
  };

  return (
    <Box sx={{ width: { sx: 130, md: 300 } }}>
      <Slider
        sx={{
          width: '85%',
          color: '#e55162',

        }}
        getAriaLabel={() => 'Year range'}
        value={value}
        onChange={handleChange}
        //valueLabelDisplay="auto"
        min={1860}
        max={currentYear}
        marks={[
          { value: 1860, label: '1860' },
          { value: 1900, label: '1900' },
          { value: 1980, label: '1980' },
          { value: 2020, label: '2020' },

        ]}
      />
    </Box>
  );
}

export function VerticalSlider({ startDate, endDate, setStartDate, setEndDate }) {
  const currentYear = dayjs().year();

  // Independent state for the slider's range
  const [value, setValue] = useState([1860, currentYear]);

  const handleChange = (event, newValue) => {
    event.propagation;
    setValue(newValue);
    setStartDate(dayjs().year(newValue[0]));
    setEndDate(dayjs().year(newValue[1]));
  };
  function getAriaValueText(value) {
    return `${value}°C`;
  }

  return (
    <Box >

      <Slider
        sx={{
          height: '200px',
          color: '#e55162',
        }}
        orientation='vertical'
        getAriaLabel={() => 'Year range'}
        value={value}
        onChange={handleChange}
        valueLabelDisplay="auto"
        min={1860}
        max={currentYear}
        marks={[
          { value: 1860, label: '1860' },
          { value: 1900, label: '1900' },
          { value: 1980, label: '1980' },
          { value: 2020, label: '2020' },

        ]}
      />
    </Box>
  );
}