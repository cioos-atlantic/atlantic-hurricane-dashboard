/**
 * @jest-environment node
 */
import httpMocks from 'node-mocks-http'

jest.mock('../../pages/api/wfs_query', () => ({
  wfs_query: jest.fn(),
}))

import { wfs_query } from '../../pages/api/wfs_query'
import handler from '../../pages/api/query_stations'

function feature(station, maxTime) {
  return { properties: { station, max_time: maxTime } }
}

beforeEach(() => {
  wfs_query.mockReset()
})

describe('GET /api/query_stations', () => {
  it('returns the deduped station data from the ERDDAP WFS response', async () => {
    wfs_query.mockResolvedValue({
      erddap_data: {
        features: [
          feature('Station A', '2024-01-01'),
          feature('Station A', '2024-03-01'),
          feature('Station B', '2024-01-02'),
        ],
      },
    })

    const req = httpMocks.createRequest({ method: 'GET', query: {} })
    const res = httpMocks.createResponse()

    await handler(req, res)

    expect(res._getStatusCode()).toBe(200)
    const body = res._getJSONData()
    expect(Object.keys(body)).toEqual(['Station A', 'Station B'])
    expect(body['Station A'].properties.max_time).toBe('2024-03-01')
  })

  it('filters to a single station when a station query param is given', async () => {
    wfs_query.mockResolvedValue({
      erddap_data: {
        features: [feature('Station A', '2024-01-01'), feature('Station B', '2024-01-02')],
      },
    })

    const req = httpMocks.createRequest({ method: 'GET', query: { station: 'Station B' } })
    const res = httpMocks.createResponse()

    await handler(req, res)

    expect(res._getStatusCode()).toBe(200)
    expect(Object.keys(res._getJSONData())).toEqual(['Station B'])
  })

  it('responds with a 500 and the error when the WFS query fails', async () => {
    wfs_query.mockRejectedValue(new Error('geoserver unreachable'))

    const req = httpMocks.createRequest({ method: 'GET', query: {} })
    const res = httpMocks.createResponse()

    await handler(req, res)

    expect(res._getStatusCode()).toBe(500)
    // The handler responds with `{ err }` where `err` is the raw Error object;
    // Error's own properties aren't enumerable, so it serializes to `{}` over JSON.
    expect(res._getJSONData()).toHaveProperty('err')
  })
})
