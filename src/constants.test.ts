import { describe, expect, it } from 'vitest'
import {
  CURRICULUMS_BY_EXAM,
  examTitle,
  examYears,
  FIRST_EXAM_YEAR,
  isCreditBased,
  ordinal,
  publishedCurriculums,
  publishedSemesters,
  publishedYears,
  semesterLabel,
  semesterOptions,
} from './constants'
import type { Curriculum, PublicationOption } from './types'

describe('semesters', () => {
  it('counts the vocational curricula in classes', () => {
    expect(semesterOptions('27').map((o) => o.label)).toEqual(['Class 9', 'Class 10'])
    expect(semesterLabel('24', 2)).toBe('Class XII')
  })

  it('gives the short diploma four semesters and everything else eight', () => {
    expect(semesterOptions('76')).toHaveLength(4)
    expect(semesterOptions('15')).toHaveLength(8)
    expect(semesterLabel('15', 8)).toBe('8th Semester')
  })

  it('falls back to an ordinal for a semester the curriculum does not list', () => {
    expect(semesterLabel('27', 5)).toBe('5th Semester')
  })
})

describe('ordinal', () => {
  it('names the first eight and defaults past them', () => {
    expect(ordinal(1)).toBe('1st')
    expect(ordinal(3)).toBe('3rd')
    expect(ordinal(8)).toBe('8th')
    expect(ordinal(9)).toBe('9th')
  })
})

describe('isCreditBased', () => {
  it('is true only for the curricula that carry credit hours', () => {
    expect(isCreditBased('15')).toBe(true)
    expect(isCreditBased('76')).toBe(true)
    expect(isCreditBased('27')).toBe(false)
  })
})

describe('examTitle', () => {
  it('prefers the board’s printed name', () => {
    expect(examTitle('19', 2026, 'Diploma-in-Engineering')).toBe(
      'Diploma in Textile Engineering Examination, 2026',
    )
  })

  it('falls back to the curriculum name, then to a bare year', () => {
    expect(examTitle('15', 2026, 'Diploma-in-Engineering')).toBe(
      'Diploma-in-Engineering Examination, 2026',
    )
    expect(examTitle('99', 2026)).toBe('Examination, 2026')
  })
})

describe('examYears', () => {
  it('runs from the current year back to the first searchable one', () => {
    const years = examYears(new Date('2026-08-10T00:00:00Z'))
    expect(years[0]).toBe('2026')
    expect(years.at(-1)).toBe(String(FIRST_EXAM_YEAR))
    expect(years).toHaveLength(2026 - FIRST_EXAM_YEAR + 1)
  })
})

describe('examination families', () => {
  it('assigns every curriculum code to at most one family', () => {
    const seen = new Set<string>()
    for (const codes of Object.values(CURRICULUMS_BY_EXAM)) {
      for (const code of codes) {
        expect(seen.has(code)).toBe(false)
        seen.add(code)
      }
    }
  })
})

describe('result day narrowing', () => {
  const curriculums = [
    { curriculumCode: '15', curriculumName: 'Diploma-in-Engineering' },
    { curriculumCode: '27', curriculumName: 'SSC (Vocational)' },
  ] as Curriculum[]

  const published: PublicationOption[] = [
    { curriculumCode: '15', semester: 8, examYear: 2026 },
    { curriculumCode: '15', semester: 8, examYear: 2025 },
    { curriculumCode: '15', semester: 1, examYear: 2026 },
  ]

  it('offers only the curricula published today', () => {
    expect(publishedCurriculums(curriculums, published).map((c) => c.curriculumCode)).toEqual([
      '15',
    ])
  })

  it('offers the published semesters in order, under their proper labels', () => {
    expect(publishedSemesters(published, '15')).toEqual([
      { value: '1', label: '1st Semester' },
      { value: '8', label: '8th Semester' },
    ])
  })

  it('offers the published years newest first, narrowed by semester', () => {
    expect(publishedYears(published, '15', '8')).toEqual(['2026', '2025'])
    expect(publishedYears(published, '15', '1')).toEqual(['2026'])
    expect(publishedYears(published, '27', '')).toEqual([])
  })
})
