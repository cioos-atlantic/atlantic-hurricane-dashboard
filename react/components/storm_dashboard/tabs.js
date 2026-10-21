import * as React from 'react';
import PropTypes from 'prop-types';
import Tab from '@mui/material/Tab';
import TabList from '@mui/lab/TabList';
import TabContext from '@mui/lab/TabContext';
import Box from '@mui/material/Box';
import RenderStormChart from "./storm_graph";
import StormTypeChart from './storm_type_chart';
import StormCategoryChart from './storm_cat_chart';
import { RenderPlotlyRose } from '../station_dashboard/plotly_rose';
import { convert_unit_data } from '../utils/unit_conversion';

/**
 * The CustomTabPanel function renders children based on the value and index props.
 
 * @returns A `div` element representing a custom tab panel is being returned. The `hidden` attribute
 * is used to conditionally show or hide the panel based on the `value` and `index` props. The panel
 * content is rendered inside a `Box` component if the `value` matches the `index`.
 */
function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 1 }}>{children}</Box>}
    </div>
  );
}

/* The code snippet `CustomTabPanel.propTypes` is defining the prop types for the `CustomTabPanel`
component. It specifies that the component expects three props: */
CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

/**
 * The function `a11yProps` returns an object with id and aria-controls properties based on the given
 * index.
 
 * @returns The function `a11yProps` returns an object with two properties: `id` and `aria-controls`.
 * The `id` property is set to a string value of `simple-tab-`, where `index` is the input
 * parameter of the function. The `aria-controls` property is set to a string value of
 * `simple-tabpanel-`, where `index` is also the
 */
function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}



/**
 * The `BasicTabs` function generates a tabbed interface displaying different data visualizations and
 * information for a specific weather station.
 * @returns A JSX element is being returned. It consists of a Box component with tabs for different
 * data categories related to a weather station. The tabs include Summary, Wind Speed, Wind Direction,
 * Temperature, Waves, and Pressure. Each tab displays relevant information or charts based on the
 * selected category. The Summary tab includes station summary text and a link to view full data. The
 * Wind Speed, Temperature, Waves, and
 */
export default function BasicTabs({stormName, stormData, stormSummaryText, variablePresence, selectedStormTab, setSelectedStormTab, stormTime, hoverPointTime, stormType, stormCategory}) {
  /**
   * The function `generateGraph` returns a JSX element containing a chart component with specified
   * data and styling.
   * @returns A JSX element is being returned. It contains a `div` element with the class name
   * "station_chart" and some inline styles for height, width, and padding. Inside the `div`, there is
   * a `RenderChart` component with props `sourceData`, `stationName`, and `varCategory`.
   */
  
  //console.log(stationName, stationData, stationSummaryText, variablePresence, selectedTab, setSelectedTab)
  const stormWindSpeed=stormData['Wind Speed']?.find(obj => "stormWindSpeed" in obj)?.stormWindSpeed;//[stormWindSpeed]?.data

  const windData = stormWindSpeed?.data;
  const stormDir=stormData?.direction?.find(obj => "stormDir" in obj)?.stormDir;
  const directionData = stormDir?.data;
  console.log(stormData, windData, directionData );

  function generateGraph(selectedVar){
    console.log('plotting charts');
    return (
     <div className="station_chart" key='chart01' >
     <RenderStormChart   
         sourceData={stormData[selectedVar]}
         varCategory={selectedVar}
          timeData={stormTime}
          hoverPointTime={hoverPointTime}
       />
   </div>
    )
   }

  //const [value, setValue] = React.useState(0);
  //const [hasData, setHasData] = React.useState(true); // State to track if data is available

  
  const handleChange = (event, newValue) => {
    console.log(newValue)
    setSelectedStormTab(newValue);
  };

  return (
    <Box sx={{ width: '100%'}} key='tabs 01'>
      <TabContext value={(selectedStormTab)}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <TabList 
          value={selectedStormTab} 
          onChange={handleChange} 
          aria-label="storm data tabs"
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile // Ensures scroll buttons appear on mobile devices
          sx={{
            '.MuiTabs-flexContainer': {
              justifyContent: 'space-between',},
            '.MuiTabScrollButton-root': {
              display: 'block', // Ensure scroll buttons are visible
              },
          }}>
            <Tab label="Summary" sx={{
              fontSize: { xs: '12px', sm: '14px', md: '14px', lg: '14px' }
            }} {...a11yProps(0)} />
           
            <Tab label={stormCategory['name']}
             sx={{
              fontSize: { xs: '12px', sm: '14px', md: '14px', lg: '14px' }
            }} {...a11yProps(2)} />
            <Tab label='WINDROSE'
             sx={{
              fontSize: { xs: '12px', sm: '14px', md: '14px', lg: '14px' }
            }} {...a11yProps(3)} />
            
  
            {
            Object.entries(stormData)
            .filter(([key]) => (key !== "direction" && key !== "seaHeight")) // Exclude "Direction" (also storm height until it gets fixed)
            .map(([key, value], index) => {
              
              return(
                <Tab 
                key={key}
                label={key}
                sx={{
                    fontSize: { xs: '12px', sm: '14px', md: '14px', lg: '14px' }
                  }}
               {...a11yProps(index + 4)}
                disabled={!variablePresence?.[key]}/>
              )
              
            })
            }
        </TabList>
      </Box>
      <CustomTabPanel value={selectedStormTab} index={0}>
        {stormSummaryText}
      </CustomTabPanel>
      <CustomTabPanel value={selectedStormTab} index={1}>
        {<StormCategoryChart chartData={stormCategory}/>}
      </CustomTabPanel>
      <CustomTabPanel value={selectedStormTab} index={2}>
      {<RenderPlotlyRose 
          windData={windData}
          directionData={directionData}
          timeData={stormTime}
          />}
      </CustomTabPanel>
      {
            Object.entries(stormData)
            .filter(([key]) => (key !== "direction"&& key !== "seaHeight")) // Exclude "Direction"
            .map(([key, value], index) => {
              
              return(
                <CustomTabPanel key={key} value={selectedStormTab} index={index + 3}>
                  {generateGraph(key)}
                </CustomTabPanel>
              )
            })
      }
      </TabContext>
    </Box>
  );
}




