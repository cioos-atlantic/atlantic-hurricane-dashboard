// FilterPanel.js
// Header shared by the filters in the historical drawer, styled like a select field: a small
// label on top and the filter's current value (or a grey placeholder) below. Clicking it toggles
// this panel in filterReducer's `openPanel`; `children` (the panel body) render only while it is open.
// When the filter has a value and `onClear` is given, an ✕ clears just this filter.
import { Button, IconButton } from "@mui/material";
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { filterActions } from "@/components/Filter/filterReducer";
import { useFilters, useFilterDispatch } from "@/components/Filter/FilterContext";


export function FilterPanel({ name, label, Icon, isActive, ariaLabel, summary, placeholder, onClear, children }) {
  const { openPanel } = useFilters();
  const filterDispatch = useFilterDispatch();
  const isOpen = openPanel === name;
  const canClear = Boolean(isActive && onClear);

  return (
    <>
      {/* The wrapper draws the box. The ✕ section is a sibling of the toggle button, not inside it
          (a button can't contain a button) */}
      <div className={`filter-field-wrap${isActive ? ' filter-field-wrap--active' : ''}`}>
        <Button
          className="filter-field"
          aria-label={ariaLabel}
          aria-expanded={isOpen}
          onClick={() => filterDispatch(filterActions.togglePanel(name))}>
          <span className="filter-field-text">
            <span className="filter-field-label">
              {Icon && <Icon fontSize="inherit" />}
              {label}
            </span>
            <span
              className={`filter-field-value${summary ? '' : ' filter-field-placeholder'}`}
              title={summary || undefined}>
              {summary || placeholder}
            </span>
          </span>
          {isOpen ? <KeyboardArrowUpRoundedIcon /> : <KeyboardArrowDownRoundedIcon />}
        </Button>

        {canClear && (
          <IconButton
            className="filter-field-clear"
            aria-label={`Clear: ${label}`}
            onClick={onClear}>
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        )}
      </div>

      {isOpen && children}
    </>
  );
}
