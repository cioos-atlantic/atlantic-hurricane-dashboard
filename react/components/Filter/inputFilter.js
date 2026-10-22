import { Paper, Autocomplete, TextField, Checkbox } from "@mui/material"
import { useState } from 'react';
import { FilterPanel } from "./FilterPanel";
import { formatStormNamesSummary } from "./filter_utils";
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;


export function InputFilter({input_filter, filterStormName, setFilterStormName, startDate, endDate, polyCoords, startCategory, endCategory}){
  const [stormNameList, setStormNameList] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleClearAll = () => {
    setFilterStormName([]);
  };

  const handleOpen = () => {
    setOpen(true);
    (async () => {
      setLoading(true);
  
      const stormNames = await input_filter.query(startDate, endDate, polyCoords, startCategory, endCategory); 
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
  };

  return(
    <FilterPanel
      name={input_filter.name}
      label={input_filter.display_name}
      Icon={input_filter.Icon}
      isActive={filterStormName?.length > 0}
      summary={formatStormNamesSummary(filterStormName)}
      placeholder="Any storm"
      onClear={handleClearAll}>
      <Paper elevation={3}
        key={input_filter.name}
        className="input-filter"
        sx={{top:'1px',
        right:'0px',
        
        
        }}>
      <Autocomplete
        multiple
        fullWidth
        disableCloseOnSelect
        autoComplete
        options={stormNameList}
        value={filterStormName}
        disabled={false}
        size='small'
        onChange={(event, newValue) => setFilterStormName(newValue)}
        open={open}
        onOpen={handleOpen}
        onClose={handleClose}
        loading={loading}

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
                  padding: '6px', 
                  alignSelf: 'center' }}
              checked={selected}
            />
            {option}
          </li>)
        }}
        renderInput={(params) => (
          <TextField
            {...params}
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
    </Paper>
    </FilterPanel>
  )
}


 



