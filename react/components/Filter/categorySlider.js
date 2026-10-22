import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import { Box, Button, Card, CardContent, CardActions, Slider } from "@mui/material";
import {storm_cat} from "@/lib/storm_cat"
import { FilterPanel } from './FilterPanel';
import { filterActions } from "@/components/Filter/filterReducer";
export const storm_category_list = [
  { label: "C5", value: 6 },
  { label: "C4", value: 5 },
  { label: "C3", value: 4 },
  { label: "C2", value: 3 },
  { label: "C1", value: 2 },
  { label: "TS", value: 1 },
  { label: "TD", value: 0},

]

const values = storm_category_list.map(item => item.value);
const minCategory = Math.min(...values);
const maxCategory = Math.max(...values);

const labelToValue = (label) => storm_category_list.find(item => item.label === label)?.value;
const valueToLabel = (value) => storm_category_list.find(item => item.value === value)?.label;

// startCategory / endCategory are category labels ('TD' ... 'C5'), or null when not set
export function CategoryRangeSlider({ setStartCategory, setEndCategory, onClose, startCategory, endCategory }) {
  const stormCategoryLink = "https://www.canada.ca/en/environment-climate-change/services/archive/hurricanes/extratropical-transition/classification.html";
  const startLabel = startCategory;
  const endLabel = endCategory;
  const hasSelection = startLabel != null && endLabel != null;

  // Slider position comes from the reducer, so it is restored when the panel reopens
  const value = hasSelection
    ? [labelToValue(startLabel), labelToValue(endLabel)]
    : [minCategory, maxCategory];

  const handleChange = (_, newValue) => {
    if (!Array.isArray(newValue)) return;

    const [start, end] = newValue;
    const newStartLabel = valueToLabel(start);
    const newEndLabel = valueToLabel(end);

    if (!newStartLabel || !newEndLabel) return;

    setStartCategory(newStartLabel);
    setEndCategory(newEndLabel);
  };

  const sliderText = !hasSelection ? (
    <>
      Adjust the slider to filter storms by category, from Tropical Depression (TD)  to Category 5. <br />
      Learn more about {" "}
      <a href={stormCategoryLink}
         target="_blank"
         rel="noopener noreferrer">
        storm categories
      </a>.
    </>
  ) : (
        <>
          You&apos;ve selected storms from <strong>{storm_cat[startLabel]?.name.en}</strong> to <strong>{storm_cat[endLabel]?.name.en}</strong>. <br />
          {' '}

          <a href={storm_cat[startLabel]?.more_info_link}
             target="_blank"
             rel="noopener noreferrer">
            <strong>{storm_cat[startLabel]?.name.en}</strong>
          </a>
            - {storm_cat[startLabel]?.sub_info}. 
            {' '}

          <a href={storm_cat[endLabel]?.more_info_link}
            target="_blank"
            rel="noopener noreferrer">
            <strong>{storm_cat[endLabel]?.name.en}</strong>
          </a> - {storm_cat[endLabel]?.sub_info}. <br />
          [See more details{' '}
          <a href={stormCategoryLink}
             target="_blank"
             rel="noopener noreferrer">
            here
          </a>.]
        </>
  );

  return (
    <Card
      className='input-filter'>
        <CardContent className='date-card-content' sx={{fontSize: '13px'}}>
          {sliderText}
        </CardContent>
        <CardContent
          className='date-card-content'>
            <Box sx={{ width: '100%' }}>
              <Slider
              sx={{
                width: '80%',
                color: '#e55162',
                
              }}
                getAriaLabel={() => 'Category range'}
                value={value}
                onChange={handleChange}
                min={minCategory}
                max={maxCategory}
                marks={ [...storm_category_list].sort((a, b) => a.value - b.value) }
              />
            </Box>

        </CardContent>
        <CardActions
              className='date-card-content'>
                <Box 
                  sx={{ display: 'flex', justifyContent: 'center', gap: '2px', width: '100%' }}>
                    <Button 
                      size="small"
                      className='shortcut-button'
                      onClick={() => {
                        setStartCategory(null);
                        setEndCategory(null);
                      }}>Clear</Button>
                    <Button 
                      size="small" 
                      className='shortcut-button' 
                      onClick={onClose}>Close</Button>
        
        
                </Box>
                
                
        
              </CardActions>

    </Card>
    
  );
}

export function RenderCategoryFilter({ filterDispatch, startCategory, endCategory }){
  const hasValidCategory = startCategory != null && endCategory != null;

  return (
    <FilterPanel
      name="category"
      label="Storm Category"
      Icon={CategoryOutlinedIcon}
      isActive={hasValidCategory}>
      <CategoryRangeSlider
        setStartCategory={(category) => filterDispatch(filterActions.setStartCategory(category))}
        setEndCategory={(category) => filterDispatch(filterActions.setEndCategory(category))}
        onClose={() => filterDispatch(filterActions.closePanel())}
        startCategory={startCategory}
        endCategory={endCategory} />
    </FilterPanel>
  );
};




