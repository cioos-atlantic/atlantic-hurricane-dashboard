import { Button, Box,  Paper,  OutlinedInput,  FormControl, InputLabel, Autocomplete, TextField, Checkbox, Stack, Select, MenuItem, ListItemText, Popper  } from "@mui/material"
import {  useState } from 'react';
import { smallScreenIconButton } from "./filter_utils";
import { CloseOptions, ShowOptions } from "./filter";
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import React, { forwardRef } from 'react';
import CircularProgress from '@mui/material/CircularProgress';

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

function sleep(duration) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, duration);
  });
}


export function InputFilter({input_filter, showFilterOptions, setShowFilterOptions, dispatch, filterStormName, setFilterStormName, startDate, endDate, polyCoords, startCategory, endCategory}){
  //console.log(startDate, endDate, polyCoords, startCategory, endCategory)
  const [inputValue, setInputValue] = useState(""); // Controlled input field
  const [stormNameList, setStormNameList] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  

  const validStormList = filterStormName;
  
  const buttonStyle = {
    backgroundColor: validStormList?.length > 0 ? '#e55162' : 'white',
    color: validStormList?.length > 0 ? 'white' : '#e55162',
    '&:hover': {
      backgroundColor: validStormList?.length > 0 ? '#ffd1dc' : '#82ccdd', 
      color: validStormList?.length > 0 ? 'black' : 'black',
    },
  };
  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuProps = {
    PaperProps: {
      sx: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        //overflow: 'hidden',
        
        
      },
    },
  };
  



  
  const handleSelectAll = () => {
    if (filterStormName.length === stormNameList.length) {
      setFilterStormName([]); // Unselect all
    } else {
      setFilterStormName(stormNameList); // Select all
    }
  };
  
    const handleClearAll = () => {
      setFilterStormName([]);
    };
    const toggleStorm = (name) => {
    setFilterStormName(prev =>
      prev.includes(name) ? prev.filter(s => s !== name) : [...prev, name]
    );
    };
    const getDisplayValue = () => {
    if (filterStormName.length === 0) return '';
    if (filterStormName.length <= 2) return filterStormName.join(', ');
    return `${filterStormName.length} selected`;
  };


 function handleIconClick(){
    console.log(showFilterOptions);
    dispatch({ type: "SHOW_FILTER_SELECTED", payload: true })
    dispatch({ type: "SET_CAT_SELECTION", payload: false});
    dispatch({ type: "SET_DATE_SELECTION", payload: false});
    setShowFilterOptions((prev) => ({
      ...prev,
      [input_filter.name]: !prev[input_filter.name],
    }));
  }
  const handleOpen = () => {
    setOpen(true);
    (async () => {
      setLoading(true);
      //console.log(startDate, endDate, polyCoords, startCategory, endCategory)
      const stormNames = await input_filter.query(startDate, endDate, polyCoords, startCategory, endCategory); 
      console.log(stormNames);
      if (!stormNames || !Array.isArray(stormNames))
        { alert("No storm name data available...")
          setLoading(false);
          setStormNameList(["No storm name data available... "]);
        }
      else{
        setLoading(false);
        setStormNameList([...stormNames]);
      }
      
    })();
  };

  const handleClose = () => {
    setOpen(false);
    //setStormNameList([]);
  };

  console.log(stormNameList);
  return(
    <>
    <Button
      className="filter-badge"
      onClick= {handleIconClick}
      startIcon={input_filter.Icon ? <input_filter.Icon /> : null}
      endIcon={ !showFilterOptions[input_filter.name] ? (<ShowOptions/>):(<CloseOptions/>)}
      sx={{...buttonStyle,
        display: { xs: "none", md: "inline-flex" }}
      }
    >{input_filter.display_name}

    </Button>

    {smallScreenIconButton(input_filter.display_name, handleIconClick, buttonStyle, input_filter.Icon)}

    
    
    {/* Filter Input Popup */}
    {showFilterOptions[input_filter.name] && (
      <Paper elevation={3} 
        key={input_filter.name}
        className="input-filter"
        sx={{top:{xs: '6px', md: '1px',},
        right:{xs: '100%', md: '0px',},
        
        
        }}>
          <Stack direction="row"  spacing={4} sx={{ mt: {xs: 0.2, md: 0.5 }, mb:{xs: 0.8, md: 1 }, justifyContent: 'center' }}>
                      
        
           
            <Button size="small" className="filter-submit-button" onClick={handleClearAll}>Clear</Button>
            <Button size="small" className="filter-submit-button" onClick={() => setShowFilterOptions({ ...showFilterOptions, [input_filter.name]: false })}>
              Close
            </Button>
    
      </Stack>


      <Autocomplete
        multiple
        //limitTags={1}
        fullWidth
        disableCloseOnSelect
        autoComplete
        //disablePortal
        options={stormNameList}
        value={filterStormName}
        disabled={false}
        size='small'
        onChange={(event, newValue) => setFilterStormName(newValue)}
        open={open}
        onOpen={handleOpen}
        onClose={handleClose}
        loading={loading}
        
        //getLimitTagsText={(more) => `+${more} names`}
        getOptionLabel={(option) => option}
        renderTags={(value, getTagProps) => {
    if (value.length === 0) return null;

    

      return [
        <span key={`tag-${value[0]}`} {...getTagProps({ index: 0 })}>
          {value[0]}
        </span>,
        value.length > 1 ? (
          <span key="tag-more" style={{ marginLeft: 4 }}>
            +{value.length - 1}
          </span>
        ) : null
      ];
  }}
        renderOption={(props, option, { selected }) => {
          const { key, ...rest } = props; // extract key

          return(
          <li key={key} {...rest}>
            <Checkbox
              icon={icon}
              checkedIcon={checkedIcon}
              sx={{ 
                  marginRight: 1.5,
                  color: '#e55162', 
                  padding: {sm:'0px', md:'6px'}, 
                  alignSelf: 'center' }}
              checked={selected}
            />
            {option}
          </li>)
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            //label={input_filter.display_name}
            placeholder="Search storms"
            slotProps={{
              input: {
                ...params.InputProps,
                endAdornment: (
                  <React.Fragment>
                    {loading ? <CircularProgress color="inherit" size={20} /> : null}
                    {params.InputProps.endAdornment}
                  </React.Fragment>
                ),
              },
            }}
            
            
          />
        )}
        
        
        slotProps={{
          paper: {
            sx: {
              borderRadius: "0px",
              boxShadow: "0px 6px 16px #00000026",
            },
          },
          listbox: {
            sx:{maxHeight:  {xs: '180px', md: '250px',},
            overflowY: "auto", padding:  0, // remove UL padding
            }
          },
          
        }}
         
    
        
      />
      {/* Action buttons OUTSIDE popper */}
      
    </Paper>

    
)}
    </>
  )
}


 



