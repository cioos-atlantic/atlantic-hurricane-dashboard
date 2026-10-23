import { Autocomplete, TextField, Checkbox, InputAdornment } from "@mui/material"
import { useEffect, useState } from 'react';
import { FilterPanel } from "./FilterPanel";
import { formatStormNamesSummary } from "./filter_utils";
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;


export function InputFilter({input_filter, filterStormName, setFilterStormName, startDate, endDate, polyCoords, startCategory, endCategory}){
  const handleClearAll = () => {
    setFilterStormName([]);
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
      <StormNamePicker
        input_filter={input_filter}
        filterStormName={filterStormName}
        setFilterStormName={setFilterStormName}
        startDate={startDate}
        endDate={endDate}
        polyCoords={polyCoords}
        startCategory={startCategory}
        endCategory={endCategory}
      />
    </FilterPanel>
  )
}


// Renders the Autocomplete's option list in the panel, under the text box, instead of a floating popup
function InlineOptionList(props) {
  const { disablePortal, anchorEl, open, ...other } = props;
  return <div {...other} />;
}


// Panel body for the Storm Name filter. Mounted only while the panel is open, so the names are
// loaded each time it opens (for the current date, category and area filters).
function StormNamePicker({input_filter, filterStormName, setFilterStormName, startDate, endDate, polyCoords, startCategory, endCategory}){
  const [stormNameList, setStormNameList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let ignore = false; // a response that arrives after the panel closed or the filters changed is dropped

    async function loadStormNames() {
      setLoading(true);
      const stormNames = await input_filter.query(startDate, endDate, polyCoords, startCategory, endCategory);
      if (ignore) return;

      if (!stormNames || !Array.isArray(stormNames)) {
        alert("No storm name data available...")
        setStormNameList(["No storm name data available... "]);
      } else {
        setStormNameList([...stormNames]);
      }
      setLoading(false);
    }

    loadStormNames();
    return () => { ignore = true; };
  }, [input_filter, startDate, endDate, polyCoords, startCategory, endCategory]);

  return(
    <div className="storm-name-panel">
      <Autocomplete
        multiple
        fullWidth
        open // the list is always shown in the panel (see InlineOptionList)
        PopperComponent={InlineOptionList}
        disableCloseOnSelect
        disableClearable // the field's own ✕ clears the names; no second ✕ in the text box
        forcePopupIcon={false} // no ▲/▼ in the text box: the list is always open
        autoComplete
        options={stormNameList}
        value={filterStormName}
        size='small'
        onChange={(event, newValue) => setFilterStormName(newValue)}
        loading={loading}
        loadingText="Loading storm names…"
        noOptionsText="No storms match"
        getOptionLabel={(option) => option}
        // Picked names are shown on the Storm Name field above, so the search box only holds the search text
        renderTags={() => null}
        renderOption={(props, option, { selected }) => {
          const { key, className, ...rest } = props; // extract key

          return(
          <li key={key} className={`${className} storm-name-option${selected ? ' storm-name-option--selected' : ''}`} {...rest}>
            <Checkbox
              icon={icon}
              checkedIcon={checkedIcon}
              size="small"
              className="storm-name-checkbox"
              checked={selected}
            />
            {option}
          </li>)
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            className="storm-name-search"
            placeholder="Search storm names"
            slotProps={{
              input: {
                ...params.InputProps,
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <React.Fragment>
                    {loading ? <CircularProgress color="inherit" size={18} /> : null}
                    {params.InputProps.endAdornment}
                  </React.Fragment>
                ),
              },
            }}
          />
        )}

        slotProps={{
          paper: {
            // Part of the panel, not a floating popup: no shadow or border of its own
            sx: { borderRadius: 0, boxShadow: "none", backgroundColor: "transparent", marginTop: "6px" },
          },
          listbox: {
            // About 5 names visible; the rest scroll
            sx: { maxHeight: { xs: '160px', md: '180px' }, overflowY: "auto", padding: 0 },
          },
        }}
      />
    </div>
  )
}
