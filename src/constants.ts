import type { Curriculum, PublicationOption } from './types'

export interface Option {
  label: string
  value: string
}

/** The four examination families the portal searches under. */
export const EXAMINATIONS: Option[] = [
  { value: 'ssc_voc', label: 'SSC/Dakhil (VOC)' },
  { value: 'hsc_voc', label: 'HSC/Equivalent (VOC)' },
  { value: 'diploma', label: 'Diploma' },
  { value: 'short_course', label: 'Short Course' },
]

/** Which curriculum codes belong to each examination family. */
export const CURRICULUMS_BY_EXAM: Record<string, string[]> = {
  ssc_voc: ['27', '77'],
  hsc_voc: ['24', '44', '26'],
  diploma: ['14', '15', '16', '19', '20', '23', '72', '74', '76'],
  short_course: [],
}

const ORDINALS = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th']

export function ordinal(n: number): string {
  return ORDINALS[n - 1] ?? `${n}th`
}

const EIGHT_SEMESTERS: Option[] = Array.from({ length: 8 }, (_, i) => ({
  label: `${ordinal(i + 1)} Semester`,
  value: String(i + 1),
}))

/**
 * Curricula that are counted in classes or in fewer than eight semesters.
 * Anything not listed here runs the standard eight-semester ladder.
 */
const SEMESTERS_BY_CURRICULUM: Record<string, Option[]> = {
  27: [
    { label: 'Class 9', value: '1' },
    { label: 'Class 10', value: '2' },
  ],
  77: [
    { label: 'Class 9', value: '1' },
    { label: 'Class 10', value: '2' },
  ],
  24: [
    { label: 'Class XI', value: '1' },
    { label: 'Class XII', value: '2' },
  ],
  44: [
    { label: 'Class XI', value: '1' },
    { label: 'Class XII', value: '2' },
  ],
  26: [
    { label: 'Class XI', value: '1' },
    { label: 'Class XII', value: '2' },
  ],
  76: Array.from({ length: 4 }, (_, i) => ({
    label: `${ordinal(i + 1)} Semester`,
    value: String(i + 1),
  })),
}

export function semesterOptions(curriculumCode: string): Option[] {
  return SEMESTERS_BY_CURRICULUM[curriculumCode] ?? EIGHT_SEMESTERS
}

export function semesterLabel(curriculumCode: string, semester: number): string {
  const match = semesterOptions(curriculumCode).find(
    (o) => o.value === String(semester),
  )
  return match ? match.label : `${ordinal(semester)} Semester`
}

/**
 * The final semester of each multi-semester curriculum. Reaching it is what
 * makes a transcript cumulative: only then does the sheet carry the per
 * semester GPA ladder and a CGPA.
 */
export const FINAL_SEMESTER: Record<string, number> = {
  14: 8,
  15: 8,
  16: 8,
  19: 8,
  20: 8,
  23: 8,
  72: 8,
  74: 8,
  76: 4,
}

/** Credit hours and grade points are only meaningful for the diploma ladder. */
export function isCreditBased(curriculumCode: string): boolean {
  return FINAL_SEMESTER[curriculumCode] != null
}

/**
 * Examination names the board prints on the transcript. Falls back to the
 * curriculum's own name, which is what the API returns for the rest.
 */
const EXAM_TITLES: Record<string, string> = {
  19: 'Diploma in Textile Engineering',
  20: 'Diploma in Forestry',
  23: 'Diploma in Agriculture',
  72: 'Diploma in Livestock',
  74: 'Diploma in Fisheries',
  27: 'Secondary School Certificate (Vocational)',
  77: 'Dakhil (Vocational)',
  24: 'HSC (Business Management)',
  25: 'Diploma in Commerce',
  26: 'HSC (Vocational)',
  44: 'HSC (Business Management and Technology)',
}

export function examTitle(
  curriculumCode: string,
  examYear: number | string,
  curriculumName?: string,
): string {
  const name = EXAM_TITLES[curriculumCode] ?? curriculumName?.trim() ?? ''
  return name ? `${name} Examination, ${examYear}` : `Examination, ${examYear}`
}

export const FIRST_EXAM_YEAR = 2005

export function examYears(now: Date = new Date()): string[] {
  const latest = now.getFullYear()
  return Array.from({ length: latest - FIRST_EXAM_YEAR + 1 }, (_, i) =>
    String(FIRST_EXAM_YEAR + i),
  ).reverse()
}

/**
 * On result day the form is driven by what was actually published rather than
 * by the full historical catalogue: only those curricula, semesters and years
 * can be searched.
 */
export function publishedCurriculums(
  all: Curriculum[],
  published: PublicationOption[],
): Curriculum[] {
  return all.filter((c) =>
    published.some((p) => p.curriculumCode === c.curriculumCode),
  )
}

export function publishedSemesters(
  published: PublicationOption[],
  curriculumCode: string,
): Option[] {
  const semesters = Array.from(
    new Set(
      published
        .filter((p) => !curriculumCode || p.curriculumCode === curriculumCode)
        .map((p) => p.semester),
    ),
  ).sort((a, b) => a - b)

  return semesters.map((s) => {
    const value = String(s)
    const known = curriculumCode
      ? semesterOptions(curriculumCode).find((o) => o.value === value)
      : undefined
    return known ?? { value, label: `Semester ${s}` }
  })
}

export function publishedYears(
  published: PublicationOption[],
  curriculumCode: string,
  semester: string,
): string[] {
  return Array.from(
    new Set(
      published
        .filter(
          (p) =>
            (!curriculumCode || p.curriculumCode === curriculumCode) &&
            (!semester || String(p.semester) === semester),
        )
        .map((p) => p.examYear),
    ),
  )
    .sort((a, b) => b - a)
    .map(String)
}
