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

  const handleChange = (event, newValue) => {
    setValue(newValue);
    setStartCategory(newValue[0]);
    setEndCategory(newValue[1]);
  };


  
  
  


  useEffect(() => {
    if (startCategory != "" && endCategory != "") {
      const stormMin = storm_category_list.find(item => item.value === startCategory)?.label;
      const stormMax = storm_category_list.find(item => item.value === endCategory)?.label;
  
      setSliderText(
        <>
          You&apos;ve selected storms from <strong>{storm_cat[stormMin].name.en}</strong> to <strong>{storm_cat[stormMax].name.en}</strong>. <br />
          {' '}

          <a href={storm_cat[stormMin]?.more_info_link}
             target="_blank"
             rel="noopener noreferrer">
            <strong>{storm_cat[stormMin].name.en}</strong>
          </a>
            - {storm_cat[stormMin]?.sub_info}. <br />
            {' '}

          <a href={storm_cat[stormMax]?.more_info_link}
            target="_blank"
            rel="noopener noreferrer">
            <strong>{storm_cat[stormMax].name.en}</strong>
          </a> - {storm_cat[stormMax]?.sub_info}. <br />
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
  }, [startCategory, endCategory]);

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
      display: { xs: "none", md: "inline-flex" },
       }
    }>
      
      Storm Category
      
      

    </Button>
    {smallScreenIconButton('Storm Category', handleIconClick, buttonStyle, CategoryOutlinedIcon)}
    

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




