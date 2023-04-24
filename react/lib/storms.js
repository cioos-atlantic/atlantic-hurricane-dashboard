import path from 'path'
import fs from 'fs'
import { globSync } from 'glob';

export const forecastDataDir = path.join(process.cwd(), 'data/forecasts');

export function getStormData(name, source) {
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

export function getAllStormData() {
    const sources = getForecastSources();

    // const file_parts = /\/?(?<source>\w+)\/(?<date>\d+)\/(?<time>\d+)\/(?<type>\w+)\.json/g;

    const forecast_data = sources.map(source_dir => {
        const search_path = path.join(forecastDataDir, source_dir.dir_name, '**/*.json');
        const json_files = globSync(search_path, { ignore: '**/index.json' });

        const json_file_index = json_files.map(file_name => {
            // Example: /eccc/20220910/0600/err.json
            const short_path = file_name.replace(forecastDataDir, '');

            const [_dump, _source, storm_name, file_date, file_time, file_type] = short_path.replace('.json', '').split('/');
            // const file_data = fs.readFileSync(file_name, { encoding: 'utf8', flag: 'r' });

            return {
                "path": short_path,
                "storm": storm_name,
                "storm_date": file_date,
                "storm_time": file_time,
                "file_type": file_type,
                // "data": file_data
            };
        });

        return {
            "source": source_dir.dir_name,
            "storm": json_file_index
        };
    });

    return forecast_data;
}

