import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import { useEffect, useState } from 'react';
import { Box, Button, Card, CardContent, CardActions, Slider } from "@mui/material";
//import { storm_categories } from "@/lib/storm_class";
import {storm_cat} from "@/lib/storm_cat"
import { ShowOptions, CloseOptions } from './filter';
import { smallScreenIconButton } from './filter_utils';
export const storm_category_list = [
  { label: "C5", value: 5 },
  { label: "C4", value: 4 },
  { label: "C3", value: 3 },
  { label: "C2", value: 2 },
  { label: "C1", value: 1 },
  { label: "TS", value: 0 },
  { label: "TD", value: -1 },

]

export function CategoryRangeSlider({ setStartCategory, setEndCategory, setShowCatSelection, startCategory, endCategory }) {
  const stormCategoryLink = "https://www.canada.ca/en/environment-climate-change/services/archive/hurricanes/extratropical-transition/classification.html";
  const defaultText = <>
  Adjust the slider to filter storms by category, from Tropical Depression (TD)  to Category 5. <br />
  Learn more about {" "}
  <a href={stormCategoryLink}
     target="_blank"
     rel="noopener noreferrer">
    storm categories
  </a>.
</>;

  const [sliderText, setSliderText] = useState(defaultText);
  
  const values = storm_category_list.map(item => item.value);
  const minCategory = Math.min(...values);
  const maxCategory = Math.max(...values);
 
  
  // Independent state for the slider's range
  const [value, setValue] = useState([minCategory, maxCategory]);
  const [startLabel, setStartLabel] = useState("");
  const [endLabel, setEndLabel] = useState("");

  const handleChange = (_, newValue) => {
    if (!Array.isArray(newValue)) return;

    const [start, end] = newValue;

    setValue(newValue);

    
    setStartLabel(storm_category_list.find(v => v.value === start)?.label);
    setEndLabel(storm_category_list.find(v => v.value === end)?.label);

    const startRange = startLabel ? storm_cat[startLabel] : null;
    const endRange = endLabel ? storm_cat[endLabel] : null;

    if (!startRange || !endRange) return;

    setStartCategory(startRange.min);
    setEndCategory(endRange.max);
  };

  useEffect(() => {
    if (startLabel != "" && endLabel != "") {
      
  
      setSliderText(
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
    } else {
      setSliderText(defaultText
      );
    }
  }, [startLabel, endLabel]);

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
                //valueLabelDisplay="auto"
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
                        setValue([minCategory, maxCategory]); // Reset slider range
                        setSliderText(defaultText); 
                        setStartCategory(""); 
                        setEndCategory("");   
                      }}>Clear</Button>
                    <Button 
                      size="small" 
                      className='shortcut-button' 
                      onClick={()=> {setShowCatSelection(false)}}>Close</Button>
        
        
                </Box>
                
                
        
              </CardActions>

    </Card>
    
  );
}

export function RenderCategoryFilter({ dispatch, setShowFilterOptions, startCategory, endCategory, showCatSelection }){
  
  //const [showCatSelection, setShowCatSelection] = useState(false); 
  const hasValidCategory = startCategory && endCategory;
  const buttonStyle = {
    backgroundColor: hasValidCategory  ? '#e55162' : 'white',
    color: hasValidCategory ? 'white' : '#e55162',
    
    '&:hover': {
      backgroundColor: hasValidCategory ? '#ffd1dc' : '#82ccdd',
      color: hasValidCategory ? 'black' : 'black',
    },
  };

  function handleIconClick(){
    //setShowCatSelection(prev => !prev);
    dispatch({ type: "SHOW_FILTER_SELECTED", payload: true })
    dispatch({ type: "TOGGLE_CAT_SELECTION"});
    dispatch({ type: "SET_DATE_SELECTION", payload: false});
    setShowFilterOptions(prev => ({
      ...prev,
      stormName: false, // stormName must be defined here
    }));
  }
  



  return (
    <>
    <Button
    className="filter-badge"
    onClick= {handleIconClick}
    startIcon={<CategoryOutlinedIcon />}
    endIcon={ !showCatSelection ? (<ShowOptions/>):(<CloseOptions/>)}
    sx={{...buttonStyle,
      display: "inline-flex",
       }
    }>
      
      Storm Category
      
      

    </Button>
    
    

    {showCatSelection && 
      (<CategoryRangeSlider 
        setStartCategory = {(category) => dispatch({ type: "SET_START_CATEGORY", payload: category })}
        setEndCategory = {(category) => dispatch({ type: "SET_END_CATEGORY", payload: category })}
        setShowCatSelection={(status) => dispatch({ type: "SET_CAT_SELECTION", payload: status })}
        startCategory={startCategory}
        endCategory={endCategory}/>)}

    {console.log(startCategory, endCategory)}
    </>


    
  );
};




