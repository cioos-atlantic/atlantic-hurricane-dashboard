
import * as geolib from 'geolib';
import { show_all_storms } from '../components/active_storm_list';
import { empty_station_obj } from '@/components/point_defaults';
import { basePath } from '@/next.config.js';
import { empty_storm_obj } from '@/components/point_defaults';

export const nmi_to_m = 1852.216;
export const ft_to_m = 0.3048;

const hurricane_categories = {
    "5": {
        "min": 157,
        "max": null,
        "name": { "en": "Category 5", "fr": "catégorie 5" },
        "img": `${basePath}/data/img/storm_categories/Category_5_hurricane_icon.svg`
    },
    "4": {
        "min": 113,
        "max": 136,
        "name": { "en": "Category 4", "fr": "catégorie 4" },
        "img": `${basePath}/data/img/storm_categories/Category_4_hurricane_icon.svg`
    },
    "3": {
        "min": 96,
        "max": 112,
        "name": { "en": "Category 3", "fr": "catégorie 3" },
        "img": `${basePath}/data/img/storm_categories/Category_3_hurricane_icon.svg`
    },
    "2": {
        "min": 83,
        "max": 95,
        "name": { "en": "Category 2", "fr": "catégorie 2" },
        "img": `${basePath}/data/img/storm_categories/Category_2_hurricane_icon.svg`
    },
    "1": {
        "min": 64,
        "max": 82,
        "name": { "en": "Category 1", "fr": "catégorie 1" },
        "img": `${basePath}/data/img/storm_categories/Category_1_hurricane_icon.svg`
    },
    "TS": {
        "min": 34,
        "max": 63,
        "name": { "en": "Tropical Storm", "fr": "Tempête tropicale" },
        "img": `${basePath}/data/img/storm_categories/Category_TS_hurricane_icon.svg`
    },
    "TD": {
        "min": 33,
        "max": null,
        "name": { "en": "Tropical Depression", "fr": "Dépression tropicale" },
        "img": `${basePath}/data/img/storm_categories/Category_TD_hurricane_icon.svg`

    },
}




/**
 * Flips an array of coordinate arrays, simply flips the order of each 
 * element of the larger list of coordinates
 * @param {array} coordinates an array of coordinate arrays
 * @returns 
 */
export function remap_coord_array(coordinates) {
    return (coordinates.map(coord => { return (flip_coords(coord)) }));
}

/**
 * Flips the order of a pair of coordinates from lat/lon to lon/lat and vice-
 * versa, Leaflet sometimes requires coordinates in a different order than 
 * other geospatial softwares.
 * 
 * @param {array} coordinates [lon,lat] or [lat,lon]
 * @returns {array}
 */
export function flip_coords(coordinates) {
    //console.log("Flipping coordinates: ", coordinates);
     try {
        return [coordinates[1], coordinates[0]];
    } catch (e) {
        return null;
    }
    
}

/**
 * Because multiple sources are in play with different names for different 
 * values a list of candidates need to be supplied to be iterated through to 
 * return the one with an actual, usable value in it.
 * 
 * @param {object} point the storm point object
 * @param {array} property_list list of properties that may have the appropriate value
 */
export function fetch_value(point, property_list) {
    let return_value = null;

    property_list.every(value => {
        try {
            if (point.properties[value] !== undefined && point.properties[value] !== null) {
                return_value = point.properties[value];
                return false;
            }
        }
        catch (e) {
            console.error(e, property_list);
            return false;
        }

        return true;
    });

    return return_value;
}


/**
 * Generates a polygon of wind speed radius based on supplied values;
 * 
 * @param {int} speed Number representing the speed of the wind radius to generate the polygon for
 * @param {Array} storm_center The [lon, lat] position of the centre of the storm in decimal degrees
 * @param {float} ne_rad North-East Quadrant, radius of wind speed in nautical miles
 * @param {float} se_rad South-East Quadrant, radius of wind speed in nautical miles
 * @param {float} sw_rad South-West Quadrant, radius of wind speed in nautical miles
 * @param {float} nw_rad North-West Quadrant, radius of wind speed in nautical miles
 */
export function build_wind_radii(storm_data_pt, speed, storm_center, ne_rad, se_rad, sw_rad, nw_rad) {
    let final_polygon = {
        "type": "Feature",
        "id": "".concat(storm_data_pt.id, "-R", speed),
        "geometry": {
            "type": "Polygon",
            "coordinates": [
            ]
        },
        "geometry_name": "geom",
        "properties": {
            "WINDFORCE": parseInt(speed),
            "TIMESTAMP": storm_data_pt.id.match(/\d+-\d+-\d+[\sT]\d+:\d+:\d+/)[0].replace(" ", "T"),
            "STORMNAME": storm_data_pt.properties.NAME,
        },
        "bbox": [
        ]
    };

    let rad_coords = generate_radii_coords(final_polygon, storm_center, ne_rad, se_rad, sw_rad, nw_rad);

    // getBounds() requires a flat list of coordinates in order to generate a 
    // bounding box, each quadrant is separated into it's own polygon array of
    // coordinates so it must be reduced in order to generate the bounding box
    const flat_coords = flatten_nested_array(rad_coords);
    const final_bbox = geolib.getBounds(flat_coords);

    final_polygon.geometry.coordinates = [coords_to_array(rad_coords)];

    final_polygon.bbox = bounds_to_array(final_bbox);

    return final_polygon;
}

/**
 * Generates a polygon of sea height radius based on supplied values;
 * 
 * @param {int} height Number representing the height (in feet) of the wave radius to generate the polygon for
 * @param {Array} storm_center The [lon, lat] position of the centre of the storm in decimal degrees
 * @param {float} ne_rad North-East Quadrant, radius of wave height in nautical miles
 * @param {float} se_rad South-East Quadrant, radius of wave height in nautical miles
 * @param {float} sw_rad South-West Quadrant, radius of wave height in nautical miles
 * @param {float} nw_rad North-West Quadrant, radius of wave height in nautical miles
 */
export function build_sea_height_radii(storm_data_pt, height, storm_center, ne_rad, se_rad, sw_rad, nw_rad) {
    let final_polygon = {
        "type": "Feature",
        "id": "".concat(storm_data_pt.id, "-SH", height),
        "geometry": {
            "type": "Polygon",
            "coordinates": [
            ]
        },
        "geometry_name": "geom",
        "properties": {
            "SEA_HEIGHT": parseInt(height) * ft_to_m,
            "TIMESTAMP": storm_data_pt.id.match(/\d+-\d+-\d+[\sT]\d+:\d+:\d+/)[0].replace(" ", "T"),
            "STORMNAME": storm_data_pt.properties.NAME,
        },
        "bbox": [
        ]
    };

    let rad_coords = generate_radii_coords(final_polygon, storm_center, ne_rad, se_rad, sw_rad, nw_rad);

    // getBounds() requires a flat list of coordinates in order to generate a 
    // bounding box, each quadrant is separated into it's own polygon array of
    // coordinates so it must be reduced in order to generate the bounding box
    const flat_coords = flatten_nested_array(rad_coords);
    const final_bbox = geolib.getBounds(flat_coords);

    final_polygon.geometry.coordinates = [coords_to_array(rad_coords)];

    final_polygon.bbox = bounds_to_array(final_bbox);

    return final_polygon;
}

export function generate_radii_coords(final_polygon, storm_center, ne_rad, se_rad, sw_rad, nw_rad) {

    // Calculate arc per quadrant
    const quadrants = ['NE', 'SE', 'SW', 'NW'];

    // Radii lengths are typically given in Nautical miles, convert to metres, 
    // null values will be returned as NaN and skipped when calculating 
    // quadrant arcs
    const ne_rad_m = ne_rad * nmi_to_m;
    const se_rad_m = se_rad * nmi_to_m;
    const sw_rad_m = sw_rad * nmi_to_m;
    const nw_rad_m = nw_rad * nmi_to_m;

    // console.debug(`NE: ${ne_rad_m}m SE: ${se_rad_m}m SW: ${sw_rad_m}m NW: ${nw_rad_m}m`);

    let radius = NaN;
    let rad_coords = [];
    let quad_count = 0;
    let empty_quads = [];

    const storm_center_point = { longitude: storm_center[0], latitude: storm_center[1] };

    quadrants.forEach((direction) => {
        switch (direction) {
            case "NE":
                radius = ne_rad_m;
                break;

            case "SE":
                radius = se_rad_m;
                break;

            case "SW":
                radius = sw_rad_m;
                break;

            case "NW":
                radius = nw_rad_m;
                break;
        }

        if (radius) {
            let quad = build_quadrant(storm_center, radius, direction);
            rad_coords = rad_coords.concat(quad);
            final_polygon.properties.RADIUS = (radius / nmi_to_m) + " nmi";
            quad_count++;
        }
        else {
            empty_quads.push(direction);
            rad_coords = rad_coords.concat(storm_center_point);
        }
    });

    return rad_coords;
}

export function flatten_nested_array(source_array) {
    return [].concat.apply([], source_array);
}

/**
 * Builds an array of points for an arc of the storm based on starting position, quadrant and radius
 * 
 * @param {Array} storm_center the position of the centre of the storm in decimal degrees as [lon, lat]
 * @param {float} radius the radius for the given quadrant in metres
 * @param {string} quadrant the name of the quadrant to be calculated
 * @returns Array of GeoLibPoints
 */
export function build_quadrant(storm_center, radius, quadrant) {
    const angle_increment = 5.625;

    let rad_start = undefined,
        rad_end = undefined,
        // quadrant_points = [{ "longitude": storm_center[0], "latitude": storm_center[1] }];
        quadrant_points = [];

    switch (quadrant) {
        case "NE":
            rad_start = 0.0;
            rad_end = 90.0;
            break;

        case "SE":
            rad_start = 90.0;
            rad_end = 180.0;
            break;
        case "SW":
            rad_start = 180.0;
            rad_end = 270.0;
            break;
        case "NW":
            rad_start = 270.0;
            rad_end = 360.0;
            break;
    }

    // Generate points in an arc 
    for (let angle = rad_start; angle <= rad_end; angle += angle_increment) {
        quadrant_points.push(geolib.computeDestinationPoint(storm_center, radius, angle));
    }

    // First and last point in a polygon need to be the same, so push a copy 
    // of the last point to the end of the coordinate list
    // quadrant_points.push(quadrant_points[0]);

    return quadrant_points;
}

export function build_line_of_travel(storm_data) {
    let line_of_travel = {
        "type": "Feature",
        "id": "line-of-travel-".concat(storm_data.data[0].properties.NAME, '-', storm_data.data[0].properties.SID),
        "geometry": {
            "type": "LineString",
            "coordinates": [
            ]
        },
        "properties": {
            "SEASON": storm_data.data[0].properties.SEASON,
            "STORMNAME": storm_data.data[0].properties.NAME,
        }
    };

    storm_data.data.forEach((storm_pt, idx) => {
        line_of_travel.geometry.coordinates.push([storm_pt.geometry.coordinates[0], storm_pt.geometry.coordinates[1]]);
    });

    console.debug("Generated Line of Travel: ", line_of_travel);

    return line_of_travel;
}

export function build_storm_points(storm_data) {
    let storm_points = [];

    for (let i in storm_data.data) {
        switch (storm_data.data[i].geometry.type) {
            case "Point":
                storm_data.data[i].properties.TIMESTAMP = storm_data.data[i].id.match(/\d+-\d+-\d+[\sT]\d+:\d+:\d+/)[0].replace(" ", "T");
                storm_points.push(storm_data.data[i])
                break;
        }
    }

    return storm_points;
}

/**
 * Converts an array of GeoLibCoordinates objects to a multi-dimensional array of lon/lat coordinates suitable for GeoJSON
 * 
 * @param {Array} coord_array Array of GeoLibCoordinates objects with latitude & longitude properties that need to be rewritten as an array in the form of [lon, lat] per point
 * @returns Array
 */
export function coords_to_array(coord_array) {
    return coord_array.map((shape) => {
        if (Array.isArray(shape)) {
            return [shape.map((coord_obj) => {
                return [coord_obj.longitude, coord_obj.latitude];
            })];
        }
        else if (typeof shape === 'object') {
            return [shape.longitude, shape.latitude];
        }
    });
}

/**
 * 
 * @param {Object} bounds_obj a GeoLibBounds object to be converted to an array version
 * @returns Array
 */
export function bounds_to_array(bounds_obj) {
    return [bounds_obj.maxLng, bounds_obj.maxLat, bounds_obj.minLng, bounds_obj.minLat];
}

function build_wind_radii_polygons(storm_data) {
    let wind_rad_polys = [],
        wind_spd_rad_dir = null,
        wind_rad_parts = {};

    storm_data.data.forEach((storm_pt, idx) => {
        wind_rad_parts = {};
        for (let field in storm_pt.properties) {
            // Dropping null fields 
            if (!storm_pt.properties[field]) {
                delete storm_data.data[idx].properties[field];
            }
            // Calculating wind radius points based on wind speed radii quadrant distances
            else {
                wind_spd_rad_dir = field.match(/^\w+R(?<speed>\d+)\w+(?<direction>NE|SE|NW|SW)$/);

                if (wind_spd_rad_dir) {
                    if (!wind_rad_parts[wind_spd_rad_dir.groups["speed"]]) {
                        wind_rad_parts[wind_spd_rad_dir.groups["speed"]] = {};
                    }

                    wind_rad_parts[wind_spd_rad_dir.groups["speed"]][wind_spd_rad_dir.groups["direction"]] = storm_pt.properties[field];
                }
            }
        }

        for (let wind_speed in wind_rad_parts) {
            wind_rad_polys.push(build_wind_radii(
                storm_pt,
                parseInt(wind_speed),
                storm_pt.geometry.coordinates,
                wind_rad_parts[wind_speed]['NE'],
                wind_rad_parts[wind_speed]['SE'],
                wind_rad_parts[wind_speed]['SW'],
                wind_rad_parts[wind_speed]['NW']
            ));
        }
    });

    return wind_rad_polys;
}

function build_sea_height_radii_polygons(storm_data) {
    let sea_height_rad_polys = [],
        sea_height_rad_parts = {},
        sea_height = NaN;

    storm_data.data.forEach((storm_pt, idx) => {
        sea_height_rad_parts = {};
        for (let field in storm_pt.properties) {
            // Dropping null fields 
            if (!storm_pt.properties[field]) {
                delete storm_data.data[idx].properties[field];
            }
        }

        sea_height_rad_parts["NE"] = storm_pt.properties["USA_SEARAD_NE"];
        sea_height_rad_parts["SE"] = storm_pt.properties["USA_SEARAD_SE"];
        sea_height_rad_parts["NW"] = storm_pt.properties["USA_SEARAD_NW"];
        sea_height_rad_parts["SW"] = storm_pt.properties["USA_SEARAD_SW"];
        sea_height = storm_pt.properties["USA_SEAHGT"];

        // If sea height is defined then at least one quadrant has a defined radius
        if (sea_height) {
            sea_height_rad_polys.push(build_sea_height_radii(
                storm_pt,
                parseInt(sea_height),
                storm_pt.geometry.coordinates,
                sea_height_rad_parts['NE'],
                sea_height_rad_parts['SE'],
                sea_height_rad_parts['SW'],
                sea_height_rad_parts['NW']
            ));
        }
    });

    return sea_height_rad_polys;
}

export function build_storm_features(storm_data) {
    // Cannot set this directly from empty_storm_obj because it is a constant
    // however, cloning its properties into a new variable will work as expected
    let storm_features = structuredClone(empty_storm_obj);

    console.debug("build_storm_features -> storm_data: ", storm_data);

    // Build wind radii polygons
    let sea_height_rad_polys = build_sea_height_radii_polygons(storm_data);
    let wind_rad_polys = build_wind_radii_polygons(storm_data);
    let line_of_travel = build_line_of_travel(storm_data);
    let storm_points = build_storm_points(storm_data);

    // const filtered = forecasts.map(source => {
    //    return source.storm.filter(storm_part => storm_part.storm == storm_obj.name && storm_part.file_type == "pts") 
    // })[0];

    if (storm_points) {
        console.debug("Adding points to storm features");
        storm_features.pts.features = storm_points;
    }

    if (wind_rad_polys) {
        console.debug("Adding polygons to storm features");
        storm_features.rad.features = wind_rad_polys;
    }

    if (line_of_travel) {
        console.debug("Adding line of travel to storm features");
        storm_features.lin.features = [line_of_travel];
    }

    if (sea_height_rad_polys) {
        console.debug("Adding sea height to storm features");
        storm_features.sea.features = sea_height_rad_polys;
    }

    return storm_features;
}

export function build_ib_active_storm_features(active_storm_data){
    let final_storm_features = structuredClone(empty_storm_obj);

    // Build features from IBTRACS data
    console.debug("Build Features from IBTRACS data...")
    for (let ib_storm in active_storm_data) {
        const storm_features = build_storm_features(active_storm_data[ib_storm]);

        // final_storm_features.err.features = final_storm_features.err.features.concat(storm_features.err.features);
        final_storm_features.lin.features = final_storm_features.lin.features.concat(storm_features.lin.features);
        
        final_storm_features.pts.features = final_storm_features.pts.features.concat(storm_features.pts.features);
        
        final_storm_features.rad.features = final_storm_features.rad.features.concat(storm_features.rad.features);
        final_storm_features.sea.features = final_storm_features.sea.features.concat(storm_features.sea.features);
    }

    // Return storm details along with storm features
    final_storm_features.list = active_storm_data;
    

    return final_storm_features;
}

export function populateStormDetails(event, storm_data, setSelectedStorm, setStormPoints, setSelectedStation) {
    setStormPoints(empty_storm_obj);
    setSelectedStation(empty_station_obj);

    console.log("Set Selected storm to: " + storm_data.data[0].properties.NAME);
    setSelectedStorm(storm_data.data[0].properties.NAME);

    let storm_features = build_storm_features(storm_data);

    setStormPoints(storm_features);
}

export function populateAllStormDetails(event, all_storm_data, setSelectedStorm, setStormPoints) {
    console.debug("ALL STORM DATA: ", all_storm_data);

    console.debug("Setting selected storm to ALL STORMS");
    setSelectedStorm(show_all_storms);

    console.debug("Clearing ALL storm data from map!");
    setStormPoints(empty_storm_obj);

    let final_storm_features = structuredClone(empty_storm_obj);

    for (let storm in all_storm_data) {
        let storm_features = build_storm_features(all_storm_data[storm]);

        final_storm_features.err.features = final_storm_features.err.features.concat(storm_features.err.features);
        final_storm_features.lin.features = final_storm_features.lin.features.concat(storm_features.lin.features);
        final_storm_features.pts.features = final_storm_features.pts.features.concat(storm_features.pts.features);
        final_storm_features.rad.features = final_storm_features.rad.features.concat(storm_features.rad.features);
        final_storm_features.sea.features = final_storm_features.sea.features.concat(storm_features.sea.features);
    }

    console.debug("Setting final storm features")
    setStormPoints(final_storm_features);
}

export function get_storm_basin(storm_point) {
    const basins = {
        "NA": "North Atlantic",
        "EP": "Eastern North Pacific",
        "WP": "Western North Pacific",
        "NI": "North Indian",
        "SI": "South Indian",
        "SP": "Southern Pacific",
        "SA": "South Atlantic",
        "MM": "Missing"
    };

    const sub_basins = {
        "CS": "Caribbean Sea",
        "GM": "Gulf of Mexico",
        "CP": "Central Pacific",
        "BB": "Bay of Bengal",
        "AS": "Arabian Sea",
        "WA": "Western Australia",
        "EA": "Eastern Australia",
        "MM": ""
    }

    return {
        "BASIN": basins[storm_point.properties.BASIN],
        "SUBBASIN": sub_basins[storm_point.properties.SUBBASIN]
    };
}

export function get_storm_class(storm_point) {

}

