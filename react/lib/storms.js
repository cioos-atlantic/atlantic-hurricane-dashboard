import path from 'path'
import fs from 'fs'

export const forecastDataDir = path.join(process.cwd(), 'data/forecasts');

export function getStormData(name, source) {
    // let fs = require('fs')
    const storm_root = path.join(forecastDataDir, source, name);
    return fs.readdirSync(storm_root);
}

export function getStormForecasts(source) {
    const forcecast_sources = path.join(forecastDataDir, source);
    return fs.readdirSync(forcecast_sources);
}

export function getForecastSources() {
    const source_path = path.join(forecastDataDir);

    // Only return list of directories
    const source_list = fs.readdirSync(
        source_path, 
        { withFileTypes: true }
    ).filter(directory => { return directory.isDirectory() });

    const dir_list = source_list.map(directory => {
        const dir_name = directory.name
        return {
            dir_name
        }
    });

    return dir_list;
}

export function getAllStormData(){
    
}