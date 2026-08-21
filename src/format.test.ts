import { describe, expect, it } from 'vitest'
import { cell, generatedOn, gpa, isPass } from './format'

describe('gpa', () => {
  it('renders numbers and numeric strings to two decimals', () => {
    expect(gpa(3.5)).toBe('3.50')
    expect(gpa('3.456')).toBe('3.46')
    expect(gpa('4')).toBe('4.00')
  })

  it('dashes an absent value', () => {
    expect(gpa(null)).toBe('—')
    expect(gpa(undefined)).toBe('—')
    expect(gpa('')).toBe('—')
  })

  it('leaves non-numeric text alone', () => {
    expect(gpa('REF')).toBe('REF')
  })
})

describe('cell', () => {
  it('dashes an absent value and stringifies the rest', () => {
    expect(cell(null)).toBe('—')
    expect(cell('')).toBe('—')
    expect(cell(0)).toBe('0')
    expect(cell('A+')).toBe('A+')
  })
})

describe('isPass', () => {
  it('recognises the forms the board returns', () => {
    for (const status of ['PASS', 'passed', ' p ', 'Pass']) {
      expect(isPass(status)).toBe(true)
    }
    for (const status of ['FAIL', 'REF', '', null, undefined]) {
      expect(isPass(status)).toBe(false)
    }
  })
})

describe('generatedOn', () => {
  it('stamps the sheet in Dhaka time', () => {
    // 2026-08-10T00:30:00Z is 06:30 the same morning in Dhaka (UTC+6).
    expect(generatedOn(new Date('2026-08-10T00:30:00Z'))).toBe(
      'Generated on 10 Aug 2026 at 06:30 AM',
    )
  })
})
