import { mapReducer, initialMapState } from './mapReducer'
import { empty_station_obj, empty_storm_obj, empty_point_obj } from './point_defaults'

describe('mapReducer', () => {
  it('returns the same state for an unrecognized action type', () => {
    const result = mapReducer(initialMapState, { type: 'NOT_A_REAL_ACTION' })
    expect(result).toBe(initialMapState)
  })

  it('sets a single field for a simple SET action', () => {
    const result = mapReducer(initialMapState, { type: 'SET_SELECTED_TAB', payload: 2 })
    expect(result.selectedTab).toBe(2)
    // Untouched fields are preserved
    expect(result.isDrawerOpen).toBe(initialMapState.isDrawerOpen)
  })

  it('flips a self-toggle action off of current state, ignoring any payload', () => {
    const opened = mapReducer(
      { ...initialMapState, showCatSelection: false },
      { type: 'TOGGLE_CAT_SELECTION' }
    )
    expect(opened.showCatSelection).toBe(true)

    const closed = mapReducer(opened, { type: 'TOGGLE_CAT_SELECTION' })
    expect(closed.showCatSelection).toBe(false)
  })

  it('resets multiple filter fields together on CANCEL_FILTERS', () => {
    const filteredState = {
      ...initialMapState,
      filterResult: { some: 'result' },
      returnFilterResult: true,
      polyFilterCoords: '1,2 3,4',
      startDate: '2024-01-01',
      endDate: '2024-01-31',
      startCategory: '1',
      endCategory: '3',
    }

    const result = mapReducer(filteredState, { type: 'CANCEL_FILTERS' })

    expect(result).toMatchObject({
      filterResult: {},
      returnFilterResult: false,
      polyFilterCoords: '',
      startDate: null,
      endDate: null,
      startCategory: '',
      endCategory: '',
    })
  })

  it('opens the station dashboard and resets the selected tab on SET_SELECTED_STATION_AND_OPEN_DASHBOARD', () => {
    const result = mapReducer(
      { ...initialMapState, selectedTab: 3 },
      { type: 'SET_SELECTED_STATION_AND_OPEN_DASHBOARD', payload: { id: 'station-1' } }
    )

    expect(result).toMatchObject({
      selected_station: { id: 'station-1' },
      selectedTab: 0,
      isDashOpen: true,
      isStationDashOpen: true,
    })
  })

  it('clears storm-related state on CLOSE_STORM_TRACKS', () => {
    const openState = {
      ...initialMapState,
      storm_points: { pts: { features: [{ id: 1 }] } },
      hover_marker: { properties: { foo: 'bar' }, geometry: {} },
      isStormDashOpen: true,
      isStationDashOpen: true,
      isDashOpen: true,
      drawerButtonClicked: 'storm',
    }

    const result = mapReducer(openState, { type: 'CLOSE_STORM_TRACKS' })

    expect(result.storm_points).toEqual(empty_storm_obj)
    expect(result.hover_marker).toEqual(empty_point_obj)
    expect(result.isStormDashOpen).toBe(false)
    expect(result.isStationDashOpen).toBe(false)
    expect(result.isDashOpen).toBe(false)
    expect(result.drawerButtonClicked).toBe('')
  })

  it('resets the selected station on CLOSE_STATION_DASHBOARD', () => {
    const result = mapReducer(
      { ...initialMapState, selected_station: { id: 'station-1' }, selectedTab: 2 },
      { type: 'CLOSE_STATION_DASHBOARD' }
    )

    expect(result.selected_station).toEqual(empty_station_obj)
    expect(result.selectedTab).toBe(0)
  })
})
