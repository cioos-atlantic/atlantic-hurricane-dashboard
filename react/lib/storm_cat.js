// hurricane is in km/hr
import { basePath } from '@/next.config.js';


export const storm_cat = {
  "TD": {
    "min": 0,
    "max": 33,
    "name": { "en": "Tropical Depression", "fr": "Dépression tropicale" },
    "img":  `${basePath}/storm_types/test/TD.svg`,
    "sub_info":"sustained winds of below 62 km/h (33 knots)",
    "img_height": 20,
    "img_width": 20,
    "info": "This is when tropical disturbance acquires a spin, the maximum sustained wind speed is less than 34 knots (63 km/h).",
    "source": "https://wmo.int/content/classification-of-tropical-cyclones",
    "more_info_link": "https://www.canada.ca/en/environment-climate-change/services/archive/hurricanes/extratropical-transition/classification.html", 
    "chart_color":'#B2EBF2'

  },
  "TS": {
    "min": 34,
    "max": 63,
    "name": { "en": "Tropical Storm", "fr": "Tempête tropicale" },
    "img":  `${basePath}/storm_types/test/TS.svg`,
    "img_height": 38,
    "img_width": 20,
    "info": "This is when tropical depression winds increase to at least 34 knots (63 km/h)",
    "sub_info":"sustained winds of 63-117 km/h (34–63 knots)",
    "source": "https://wmo.int/content/classification-of-tropical-cyclones",
    "more_info_link": "https://www.canada.ca/en/environment-climate-change/services/archive/hurricanes/extratropical-transition/classification.html",
    "chart_color":'#2A9D8F'
  },
  "C1": {
    "min": 64,
    "max": 82,
    "img_height": 38,
    "img_width": 20,
    "name": { "en": "Category 1", "fr": "catégorie 1" },
    "img":  `${basePath}/storm_types/test/CAT_1.svg`,
    "info": "A hurricane with sustained winds of a minimum of 64 knots (118 km/h)",
    "sub_info":"sustained winds of 118-153 km/h (64–82 knots)",
    "more_info_link": "https://www.canada.ca/en/environment-climate-change/services/archive/hurricanes/extratropical-transition/classification.html",
    "source": "https://wmo.int/content/classification-of-tropical-cyclones",
    "chart_color":'#277DA1'
  }
  ,
  "C2": {
    "min": 83,
    "max": 95,
    "img_height": 38,
    "img_width": 20,
    "name": { "en": "Category 2", "fr": "catégorie 2" },
    "img":  `${basePath}/storm_types/test/CAT_2.svg`,
    "info": "A hurricane with sustained winds of a minimum of 83 knots (153 km/h)",
    "sub_info":"sustained winds of 153-176 km/h (83–95 knots)",
    "more_info_link": "https://www.canada.ca/en/environment-climate-change/services/archive/hurricanes/extratropical-transition/classification.html",
    "source": "https://wmo.int/content/classification-of-tropical-cyclones",
    "chart_color":'#FFD54F'
  }
  ,
  "C3": {
    "min": 96,
    "max": 112,
    "img_height": 38,
    "img_width": 20,
    "name": { "en": "Category 3", "fr": "catégorie 3" },
    "img":  `${basePath}/storm_types/test/CAT_3.svg`,
    "info": "A hurricane with sustained winds of a minimum of 96 knots (177 km/h)",
    "sub_info":"sustained winds of 177-207 km/h (96–112 knots)",
    "more_info_link": "https://www.canada.ca/en/environment-climate-change/services/archive/hurricanes/extratropical-transition/classification.html",
    "source": "https://wmo.int/content/classification-of-tropical-cyclones",
    "chart_color":'#F3722C'
  }
  ,
  "C4": {
    "min": 113,
    "max": 136,
    "img_height": 38,
    "img_width": 20,
    "name": { "en": "Category 4", "fr": "catégorie 4" },
    "img":  `${basePath}/storm_types/test/CAT_4.svg`,
    "info": "A hurricane with sustained winds of a range of 113 knots (210 km/h) to 136 knots (252 km/h)",
    "sub_info":"sustained winds of 210-252 km/h (113–136 knots)",
    "more_info_link": "https://www.canada.ca/en/environment-climate-change/services/archive/hurricanes/extratropical-transition/classification.html",
    "source": "https://wmo.int/content/classification-of-tropical-cyclones",
    "chart_color":'#D62828'
  }
  ,
  "C5": {
    "min": 137,
    "max": 9999,
    "img_height": 38,
    "img_width": 20,
    "name": { "en": "Category 5", "fr": "catégorie 5" },
    "img":  `${basePath}/storm_types/test/CAT_5.svg`,
    "info": "A hurricane with sustained winds of a minimum of 137 knots (254 km/h)",
    "sub_info":"sustained winds starting at 137 knots (254 km/h)",
    "more_info_link": "https://www.canada.ca/en/environment-climate-change/services/archive/hurricanes/extratropical-transition/classification.html",
    "source": "https://wmo.int/content/classification-of-tropical-cyclones",
    "chart_color":'#7B1FA2'
  },

  
  "NR": {
    "name": { "en": "Not Reported", "fr": "Non signalé" },
    "img":  `${basePath}/storm_types/test/NR.svg`,
    "img_height": 20,
    "img_width": 20,
    "info": "Storm type not yet reported",
    "chart_color":'grey'
  },
}
