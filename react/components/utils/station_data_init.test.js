import station_data_init from './station_data_init'

function feature(station, maxTime) {
  return { properties: { station, max_time: maxTime } }
}

describe('station_data_init', () => {
  it('keys the result by station name', () => {
    const features = [feature('Station A', '2024-01-01'), feature('Station B', '2024-01-02')]

    const result = station_data_init(features)

    expect(Object.keys(result)).toEqual(['Station A', 'Station B'])
    expect(result['Station A']).toEqual(features[0])
  })

  it('dedupes repeated stations, keeping the latest max_time seen', () => {
    const features = [
      feature('Station A', '2024-01-01'),
      feature('Station A', '2024-03-01'),
    ]

    const result = station_data_init(features)

    expect(Object.keys(result)).toEqual(['Station A'])
    expect(result['Station A'].properties.max_time).toBe('2024-03-01')
  })

  it('only includes the requested station when filter_station is given', () => {
    const features = [feature('Station A', '2024-01-01'), feature('Station B', '2024-01-02')]

    const result = station_data_init(features, 'Station B')

    expect(Object.keys(result)).toEqual(['Station B'])
  })

  it('returns an empty object for an empty features list', () => {
    expect(station_data_init([])).toEqual({})
  })
})
