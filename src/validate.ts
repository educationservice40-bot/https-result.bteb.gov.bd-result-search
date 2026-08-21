export interface SearchForm {
  examination: string
  curriculumCode: string
  semester: string
  examYear: string
  rollNo: string
  regNo: string
  captchaAnswer: string
}

export const MIN_EXAM_YEAR = 2000
export const MAX_EXAM_YEAR = 2035

/**
 * Validates the search form in the order the fields are read on screen, so the
 * message always points at the first thing the student still has to fill in.
 *
 * `resultDayActive` drops the examination field: when only today's
 * publications are searchable the curriculum list is already narrowed to them
 * and the examination family is implied.
 */
export function validateSearch(
  form: SearchForm,
  resultDayActive = false,
): string | null {
  if (!resultDayActive && !form.examination) {
    return 'Please select the name of the examination.'
  }
  if (!form.curriculumCode) return 'Please select the curriculum.'
  if (!form.semester) return 'Please select the semester or class.'

  if (!form.examYear) return 'Please select the examination year.'
  const year = Number(form.examYear)
  if (
    !/^\d{4}$/.test(form.examYear) ||
    year < MIN_EXAM_YEAR ||
    year > MAX_EXAM_YEAR
  ) {
    return 'Please enter a valid examination year.'
  }

  const roll = form.rollNo.trim()
  if (!roll) return 'Please enter the roll number.'
  if (!/^\d{6}$/.test(roll)) return 'The roll number must be six digits.'

  const reg = form.regNo.trim()
  if (!reg) return 'Please enter the registration number.'
  if (!/^\d{6}$/.test(reg) && !/^\d{10}$/.test(reg)) {
    return 'The registration number must be six or ten digits.'
  }

  if (!form.captchaAnswer.trim()) return 'Please answer the security check.'

  return null
}

/** Strips everything but digits and caps the length, for numeric inputs. */
export function digitsOnly(value: string, maxLength: number): string {
  return value.replace(/\D/g, '').slice(0, maxLength)
}

/** The captcha code is alphanumeric; anything else is a stray keystroke. */
export function captchaInput(value: string): string {
  return value.replace(/[^0-9A-Za-z]/g, '').slice(0, 5)
}
