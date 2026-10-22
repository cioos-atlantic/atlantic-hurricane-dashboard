// FilterPanel.js
// Header button shared by the filters in the historical drawer. Clicking it toggles this
// panel in filterReducer's `openPanel`; `children` (the panel body) render only while it is open.
import { Button } from "@mui/material";
import KeyboardDoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown';
import KeyboardDoubleArrowUpIcon from '@mui/icons-material/KeyboardDoubleArrowUp';
import { filterActions } from "@/components/Filter/filterReducer";
import { useFilters, useFilterDispatch } from "@/components/Filter/FilterContext";


export function FilterPanel({ name, label, Icon, isActive, ariaLabel, children }) {
  const { openPanel } = useFilters();
  const filterDispatch = useFilterDispatch();
  const isOpen = openPanel === name;

  // Red when the filter has a value, white otherwise
  const buttonStyle = {
    backgroundColor: isActive ? '#e55162' : 'white',
    color: isActive ? 'white' : '#e55162',
    '&:hover': {
      backgroundColor: isActive ? '#ffd1dc' : '#82ccdd',
      color: 'black',
    },
  };

  function handleClick() {
    filterDispatch(filterActions.setShowFilterSelected(true));
    filterDispatch(filterActions.togglePanel(name));
  }

  return (
    <>
      <Button
        className="filter-badge"
        aria-label={ariaLabel}
        onClick={handleClick}
        startIcon={Icon ? <Icon /> : null}
        endIcon={isOpen ? <KeyboardDoubleArrowUpIcon /> : <KeyboardDoubleArrowDownIcon />}
        sx={{ ...buttonStyle, display: "inline-flex" }}>
        {label}
      </Button>

      {isOpen && children}
    </>
  );
}
