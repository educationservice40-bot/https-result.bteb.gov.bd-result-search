import { describe, expect, it } from 'vitest'
import { captchaInput, digitsOnly, validateSearch, type SearchForm } from './validate'

const complete: SearchForm = {
  examination: 'diploma',
  curriculumCode: '15',
  semester: '8',
  examYear: '2026',
  rollNo: '123456',
  regNo: '1234567890',
  captchaAnswer: 'A1B2',
}

describe('validateSearch', () => {
  it('accepts a complete form', () => {
    expect(validateSearch(complete)).toBeNull()
  })

  it('reports the first missing field, reading down the form', () => {
    expect(validateSearch({ ...complete, examination: '', curriculumCode: '' })).toBe(
      'Please select the name of the examination.',
    )
    expect(validateSearch({ ...complete, curriculumCode: '', semester: '' })).toBe(
      'Please select the curriculum.',
    )
    expect(validateSearch({ ...complete, semester: '' })).toBe(
      'Please select the semester or class.',
    )
    expect(validateSearch({ ...complete, examYear: '' })).toBe(
      'Please select the examination year.',
    )
  })

  it('does not ask for the examination on result day', () => {
    expect(validateSearch({ ...complete, examination: '' }, true)).toBeNull()
  })

  it('rejects years outside the searchable range', () => {
    expect(validateSearch({ ...complete, examYear: '1999' })).toBe(
      'Please enter a valid examination year.',
    )
    expect(validateSearch({ ...complete, examYear: '2036' })).toBe(
      'Please enter a valid examination year.',
    )
    expect(validateSearch({ ...complete, examYear: '202' })).toBe(
      'Please enter a valid examination year.',
    )
    expect(validateSearch({ ...complete, examYear: '2000' })).toBeNull()
    expect(validateSearch({ ...complete, examYear: '2035' })).toBeNull()
  })

  it('requires a six digit roll number', () => {
    expect(validateSearch({ ...complete, rollNo: '' })).toBe(
      'Please enter the roll number.',
    )
    expect(validateSearch({ ...complete, rollNo: '12345' })).toBe(
      'The roll number must be six digits.',
    )
  })

  it('accepts a six or ten digit registration number and nothing between', () => {
    expect(validateSearch({ ...complete, regNo: '123456' })).toBeNull()
    expect(validateSearch({ ...complete, regNo: '1234567890' })).toBeNull()
    expect(validateSearch({ ...complete, regNo: '1234567' })).toBe(
      'The registration number must be six or ten digits.',
    )
    expect(validateSearch({ ...complete, regNo: '' })).toBe(
      'Please enter the registration number.',
    )
  })

  it('treats a whitespace-only entry as empty', () => {
    expect(validateSearch({ ...complete, rollNo: '   ' })).toBe(
      'Please enter the roll number.',
    )
    expect(validateSearch({ ...complete, captchaAnswer: ' ' })).toBe(
      'Please answer the security check.',
    )
  })
})

describe('input sanitisers', () => {
  it('keeps digits only, up to the field length', () => {
    expect(digitsOnly('12a34-5678', 6)).toBe('123456')
    expect(digitsOnly('abc', 6)).toBe('')
  })

  it('keeps the captcha alphanumeric and short', () => {
    expect(captchaInput('a1-b2 c3d')).toBe('a1b2c')
  })
})
