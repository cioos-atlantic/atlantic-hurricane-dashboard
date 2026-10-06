import {
  convert_unit_data,
  toKmh,
  toKnots,
  toDegreeF,
  toDegreeC,
  toKPa,
  toInHg,
  toFt,
  toM,
} from './unit_conversion'

describe('toKmh', () => {
  it('converts m/s to km/h', () => {
    expect(toKmh(10, 'm/s')).toEqual({ value: '36.00', unit: 'km/h' })
  })

  it('converts knots to km/h', () => {
    expect(toKmh(10, 'knots')).toEqual({ value: '18.52', unit: 'km/h' })
  })

  it('passes km/h through unchanged', () => {
    expect(toKmh(50, 'km/h')).toEqual({ value: '50.00', unit: 'km/h' })
  })

  it('returns NaN for an unrecognized input unit', () => {
    expect(toKmh(10, 'furlongs')).toEqual({ value: NaN, unit: 'km/h' })
  })
})

describe('toKnots', () => {
  it('converts m/s to knots', () => {
    expect(toKnots(10, 'm/s')).toEqual({ value: '19.4', unit: 'knots' })
  })

  it('converts km/h to knots', () => {
    expect(toKnots(10, 'km/h')).toEqual({ value: '5.4', unit: 'knots' })
  })
})

describe('toDegreeF / toDegreeC', () => {
  it('converts Celsius to Fahrenheit', () => {
    expect(toDegreeF(0, '°C')).toEqual({ value: '32.0', unit: '°F' })
    expect(toDegreeF(100, '°C')).toEqual({ value: '212.0', unit: '°F' })
  })

  it('converts Fahrenheit to Celsius', () => {
    expect(toDegreeC(32, '°F')).toEqual({ value: '0.0', unit: '°C' })
  })

  it('round-trips a same-unit value without altering it', () => {
    expect(toDegreeC(21.5, '°C')).toEqual({ value: '21.5', unit: '°C' })
  })
})

describe('toKPa / toInHg', () => {
  it('converts hPa/mbar to kPa', () => {
    expect(toKPa(1013, 'hPa')).toEqual({ value: '101.3', unit: 'kPa' })
    expect(toKPa(1013, 'mbar')).toEqual({ value: '101.3', unit: 'kPa' })
  })

  it('converts kPa to inHg', () => {
    expect(toInHg(101.3, 'kPa')).toEqual({ value: '29.9', unit: 'inHg' })
  })
})

describe('toFt / toM', () => {
  it('converts metres to feet', () => {
    expect(toFt(1, 'm')).toEqual({ value: '3.3', unit: 'ft' })
  })

  it('converts feet to metres', () => {
    expect(toM(1, 'ft')).toEqual({ value: '0.3', unit: 'm' })
  })
})

describe('convert_unit_data', () => {
  it('returns NaN with the original unit when value is null', () => {
    expect(convert_unit_data(null, 'm/s')).toEqual({ value: NaN, unit: 'm/s' })
  })

  it('dispatches to toKnots when unit_to is knots', () => {
    expect(convert_unit_data(10, 'm/s', 'knots')).toEqual(toKnots(10, 'm/s'))
  })

  it('falls back to unit_from-based assumption when unit_to is not given', () => {
    expect(convert_unit_data(10, 'm/s')).toEqual(toKmh(10, 'm/s'))
  })

  it('passes the value through unchanged when no rule matches either unit', () => {
    expect(convert_unit_data(42, 'furlongs')).toEqual({ value: 42, unit: 'furlongs' })
  })
})
