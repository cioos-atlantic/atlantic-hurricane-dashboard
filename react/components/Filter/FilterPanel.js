// FilterPanel.js
// Header shared by the filters in the historical drawer, styled like a select field: a small
// label on top and the filter's current value (or a grey placeholder) below. Clicking it toggles
// this panel in filterReducer's `openPanel`; `children` (the panel body) render only while it is open.
import { Button } from "@mui/material";
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';
import { filterActions } from "@/components/Filter/filterReducer";
import { useFilters, useFilterDispatch } from "@/components/Filter/FilterContext";


export function FilterPanel({ name, label, Icon, isActive, ariaLabel, summary, placeholder, children }) {
  const { openPanel } = useFilters();
  const filterDispatch = useFilterDispatch();
  const isOpen = openPanel === name;

  function handleClick() {
    filterDispatch(filterActions.setShowFilterSelected(true));
    filterDispatch(filterActions.togglePanel(name));
  }

  return (
    <>
      <Button
        className={`filter-field${isActive ? ' filter-field--active' : ''}`}
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        onClick={handleClick}>
        <span className="filter-field-label">
          {Icon && <Icon fontSize="inherit" />}
          {label}
        </span>
        <span className="filter-field-row">
          <span
            className={`filter-field-value${summary ? '' : ' filter-field-placeholder'}`}
            title={summary || undefined}>
            {summary || placeholder}
          </span>
          {isOpen ? <KeyboardArrowUpRoundedIcon /> : <KeyboardArrowDownRoundedIcon />}
        </span>
      </Button>

      {isOpen && children}
    </>
  );
}
