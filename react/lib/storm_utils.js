
import * as geolib from 'geolib';

export const nmi_to_m = 1852.216;

export const empty_storm_obj = {
    pts: { features: [] },
    err: { features: [] },
    lin: { features: [] },
    rad: { features: [] },
};

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
    console.debug(speed, storm_center, ne_rad, se_rad, sw_rad, nw_rad);

    let final_polygon = {
        "type": "Feature",
        "id": "".concat(storm_data_pt.id, "-R", speed),
        "geometry": {
            "type": "MultiPolygon",
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

    // Calculate arc per quadrant
    const quadrants = ['NE', 'SE', 'SW', 'NW'];

    // Radii lengths are typically given in Nautical miles, convert to metres, 
    // null values will be returned as NaN and skipped when calculating 
    // quadrant arcs
    const ne_rad_m = ne_rad * nmi_to_m;
    const se_rad_m = se_rad * nmi_to_m;
    const sw_rad_m = sw_rad * nmi_to_m;
    const nw_rad_m = nw_rad * nmi_to_m;

    console.debug(`NE: ${ne_rad_m}m SE: ${se_rad_m}m SW: ${sw_rad_m}m NW: ${nw_rad_m}m`);

    let radius = NaN;
    let rad_coords = [];

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
            rad_coords.push(build_quadrant(storm_center, radius, direction))
            final_polygon.properties.RADIUS = (radius / nmi_to_m) + " nmi";
        }
        else {
            console.warn(`No radius given for ${direction} quadrant`);
        }
    });

    // getBounds() requires a flat list of coordinates in order to generate a 
    // bounding box, each quadrant is separated into it's own polygon array of
    // coordinates so it must be reduced in order to generate the bounding box
    const flat_coords = [].concat.apply([], rad_coords);
    const final_bbox = geolib.getBounds(flat_coords);

    console.debug("Final geometry of quads: ", rad_coords);
    console.debug("Flattened coords for calculating bounding box: ", flat_coords);
    console.debug("Final Bounding Box: ", final_bbox);

    final_polygon.geometry.coordinates = coords_to_array(rad_coords);

    final_polygon.bbox = bounds_to_array(final_bbox);

    return final_polygon;
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
    const angle_increment = 11.25;

    let rad_start = undefined,
        rad_end = undefined,
        quadrant_points = [{ "longitude": storm_center[0], "latitude": storm_center[1] }];

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
    quadrant_points.push(quadrant_points[0]);

    console.debug(`Original Coordinates: ${storm_center}`)
    console.debug(`Quadrant ${quadrant} arc points:`, quadrant_points);

    return quadrant_points;
}

export function build_line_of_travel(storm_data) {

}

/**
 * Converts an array of GeoLibCoordinates objects to a multi-dimensional array of lon/lat coordinates suitable for GeoJSON
 * 
 * @param {Array} coord_array Array of GeoLibCoordinates objects with latitude & longitude properties that need to be rewritten as an array in the form of [lon, lat] per point
 * @returns Array
 */
export function coords_to_array(coord_array) {
    return coord_array.map((shape) => {
        return [shape.map((coord_obj) => {
            return [coord_obj.longitude, coord_obj.latitude];
        })];
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

export function populateStormDetails(event, storm_data, setSelectedStorm, setStormPoints) {
    console.log("Set Selected storm to: " + storm_data.data[0].properties.NAME);
    setSelectedStorm(storm_data.data[0].properties.NAME);

    console.debug("Printing out storm properties");
    console.debug(storm_data);

    let wind_rad_polys = [],
        wind_spd_rad_dir = null,
        wind_rad_parts = {},
        storm_features = {
            pts: { features: [] },
            err: { features: [] },
            lin: { features: [] },
            rad: { features: [] },
        };


    storm_data.data.forEach((storm_pt, idx) => {
        // console.debug("Storm Point: ", idx, storm_pt);
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
                    // console.debug(wind_spd_rad_dir);
                    if (!wind_rad_parts[wind_spd_rad_dir.groups["speed"]]) {
                        wind_rad_parts[wind_spd_rad_dir.groups["speed"]] = {};
                    }

                    wind_rad_parts[wind_spd_rad_dir.groups["speed"]][wind_spd_rad_dir.groups["direction"]] = storm_pt.properties[field];
                }
            }
        }

        console.debug("Wind Radius Parts:", wind_rad_parts);

        for (let wind_speed in wind_rad_parts) {
            console.debug(`Building wind speed radii for: ${wind_speed}knots`);

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

        console.debug("Final Polygons: ", wind_rad_polys);
    });


    // const filtered = forecasts.map(source => {
    //    return source.storm.filter(storm_part => storm_part.storm == storm_obj.name && storm_part.file_type == "pts") 
    // })[0];
    setStormPoints(empty_storm_obj);

    for (var i in storm_data.data) {
        switch (storm_data.data[i].geometry.type) {
            case "Point":
                storm_features.pts.features.push(storm_data.data[i])
                break;
            // case "LineString":
            //   break;
            // case "Polygon":
            //   break;
        }
    }

    if (wind_rad_polys) {
        console.debug("Adding polygons to storm features");
        storm_features.rad.features = wind_rad_polys;
    }

    setStormPoints(storm_features);
}
