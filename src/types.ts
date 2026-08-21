/** Shapes returned by the board's public result API (`/api/public/*`). */

export interface Curriculum {
  id: number
  curriculumCode: string
  curriculumName: string
  totalSemesters: number
  isActive: boolean
}

export interface CaptchaChallenge {
  /** A `data:image/png;base64,...` URI. Null when the challenge is textual. */
  image: string | null
  /** A textual challenge, used when no image is issued. */
  question: string | null
  /** Opaque token echoed back with the answer on submit. */
  token: string
  /** Seconds until the token stops being accepted. */
  expiresIn: number
}

/** One examination published today, as offered by `/active-publications`. */
export interface PublicationOption {
  curriculumCode: string
  semester: number
  examYear: number
}

export interface ActivePublications {
  resultDayActive: boolean
  options: PublicationOption[]
}

export interface ResultQuery {
  curriculumCode: string
  rollNo: string
  regNo: string
  semester: string
  examYear: string
  captchaToken: string
  captchaAnswer: string
}

export interface SubjectResult {
  subjectCode: string
  subjectName: string
  fullMark: string | number | null
  totalMark: string | number | null
  creditHour: string | number | null
  gradeLetter: string | null
  gradePoint: string | number | null
}

export interface GpaSummary {
  status: string | null
  gpa: string | number | null
  gpaWithOptional: string | number | null
  cgpa: string | number | null
  gpa1?: string | number | null
  gpa2?: string | number | null
  gpa3?: string | number | null
  gpa4?: string | number | null
  gpa5?: string | number | null
  gpa6?: string | number | null
  gpa7?: string | number | null
}

export interface CodedName {
  code: string
  name: string
}

export interface SemesterResult {
  semester: number
  institute: CodedName
  meta: { examYear: number | string }
  resultRow?: { student_type?: string | null } | null
  subjects: SubjectResult[]
  optionalSubjects?: SubjectResult[] | null
  gpa: GpaSummary
}

export interface Student {
  studentRoll: string
  studentName: string
  regNo: string
  fatherName: string
  motherName: string
  dateOfBirth?: { numeric?: string | null } | null
  studySession: string
  curriculum: CodedName
  technology: CodedName
}

export interface ResultPayload {
  /** Marks columns are only released for some publications. */
  marksVisible?: boolean
  student: Student
  semesters: SemesterResult[]
}

/** Envelope the API wraps every result lookup in. */
export interface ResultResponse {
  code?: string
  message?: string
  data?: ResultPayload | null
}
