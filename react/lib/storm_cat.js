// hurricane is in km/hr
import { basePath } from '@/next.config.js';


export const storm_cat = {
  "TD": {
    "min": 0,
    "max": 62,
    "name": { "en": "Tropical Depression", "fr": "Dépression tropicale" },
    "img":  `${basePath}/storm_types/test/TD.svg`,
    "sub_info":"sustained winds of below 63 km/h (34–63 knots)",
    "img_height": 20,
    "img_width": 20,
    "info": "This is when tropical disturbance acquires a spin, the maximum sustained wind speed is less than 34 knots (63 km/h).",
    "source": "https://wmo.int/content/classification-of-tropical-cyclones",
    "more_info_link": "https://www.canada.ca/en/environment-climate-change/services/archive/hurricanes/extratropical-transition/classification.html", 
    "chart_color":'#33e0ff'

  },
  "TS": {
    "min": 63,
    "max": 117,
    "name": { "en": "Tropical Storm", "fr": "Tempête tropicale" },
    "img":  `${basePath}/storm_types/test/TS.svg`,
    "img_height": 38,
    "img_width": 20,
    "info": "This is when tropical depression winds increase to at least 34 knots (63 km/h)",
    "sub_info":"sustained winds of 63-117 km/h (34–63 knots)",
    "source": "https://wmo.int/content/classification-of-tropical-cyclones",
    "more_info_link": "https://www.canada.ca/en/environment-climate-change/services/archive/hurricanes/extratropical-transition/classification.html",
    "chart_color":'#7e7bb0'
  },
  "C1": {
    "min": 118,
    "max": 153,
    "img_height": 38,
    "img_width": 20,
    "name": { "en": "Category 1", "fr": "catégorie 1" },
    "img":  `${basePath}/storm_types/test/CAT_1.svg`,
    "info": "A hurricane with sustained winds of a minimum of 64 knots (118 km/h)",
    "sub_info":"sustained winds of 118-153 km/h (64–82 knots)",
    "more_info_link": "https://www.canada.ca/en/environment-climate-change/services/archive/hurricanes/extratropical-transition/classification.html",
    "source": "https://wmo.int/content/classification-of-tropical-cyclones",
    "chart_color":'#a25d5e'
  }
  ,
  "C2": {
    "min": 154,
    "max": 177,
    "img_height": 38,
    "img_width": 20,
    "name": { "en": "Category 2", "fr": "catégorie 2" },
    "img":  `${basePath}/storm_types/test/CAT_2.svg`,
    "info": "A hurricane with sustained winds of a minimum of 83 knots (153 km/h)",
    "sub_info":"sustained winds of 153-176 km/h (83–95 knots)",
    "more_info_link": "https://www.canada.ca/en/environment-climate-change/services/archive/hurricanes/extratropical-transition/classification.html",
    "source": "https://wmo.int/content/classification-of-tropical-cyclones",
    "chart_color":'#a25d5e'
  }
  ,
  "C3": {
    "min": 178,
    "max": 208,
    "img_height": 38,
    "img_width": 20,
    "name": { "en": "Category 3", "fr": "catégorie 3" },
    "img":  `${basePath}/storm_types/test/CAT_3.svg`,
    "info": "A hurricane with sustained winds of a minimum of 96 knots (177 km/h)",
    "sub_info":"sustained winds of 177-207 km/h (96–112 knots)",
    "more_info_link": "https://www.canada.ca/en/environment-climate-change/services/archive/hurricanes/extratropical-transition/classification.html",
    "source": "https://wmo.int/content/classification-of-tropical-cyclones",
    "chart_color":'#a25d5e'
  }
  ,
  "C4": {
    "min": 209,
    "max": 250,
    "img_height": 38,
    "img_width": 20,
    "name": { "en": "Category 4", "fr": "catégorie 4" },
    "img":  `${basePath}/storm_types/test/CAT_4.svg`,
    "info": "A hurricane with sustained winds of a range of 113 knots (210 km/h) to 136 knots (252 km/h)",
    "sub_info":"sustained winds of 210-252 km/h (113–136 knots)",
    "more_info_link": "https://www.canada.ca/en/environment-climate-change/services/archive/hurricanes/extratropical-transition/classification.html",
    "source": "https://wmo.int/content/classification-of-tropical-cyclones",
    "chart_color":'#a25d5e'
  }
  ,
  "C5": {
    "min": 251,
    "max": Infinity,
    "img_height": 38,
    "img_width": 20,
    "name": { "en": "Category 5", "fr": "catégorie 5" },
    "img":  `${basePath}/storm_types/test/CAT_5.svg`,
    "info": "A hurricane with sustained winds of a minimum of 137 knots (254 km/h)",
    "sub_info":"sustained winds starting at 137 knots (254 km/h)",
    "more_info_link": "https://www.canada.ca/en/environment-climate-change/services/archive/hurricanes/extratropical-transition/classification.html",
    "source": "https://wmo.int/content/classification-of-tropical-cyclones",
    "chart_color":'#a25d5e'
  },

  
  "NR": {
    "name": { "en": "Not Reported", "fr": "Non signalé" },
    "img":  `${basePath}/storm_types/test/NR.svg`,
    "img_height": 20,
    "img_width": 20,
    "info": "Storm type not yet reported",
    "chart_color":'#3371ff'
  },
}
