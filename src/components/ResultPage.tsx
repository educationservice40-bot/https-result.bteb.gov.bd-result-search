import { useEffect, useState } from 'react'
import {
  examTitle,
  FINAL_SEMESTER,
  isCreditBased,
  ordinal,
  semesterLabel,
} from '../constants'
import { cell, generatedOn, gpa, isPass } from '../format'
import { SEARCH_PATH } from '../router'
import type { ResultPayload } from '../types'
import { RESULT_STORAGE_KEY } from './SearchPage'
import { Masthead } from './Masthead'

interface Props {
  navigate: (path: string, replace?: boolean) => void
}

export function ResultPage({ navigate }: Props) {
  // The handoff is read here and cleared in the effect below, never in this
  // initializer: an initializer must stay a pure read, because React invokes
  // it more than once. Clearing inside it threw the transcript away before the
  // second read could see it, and the page came up blank.
  const [payload] = useState<ResultPayload | null>(() => {
    const raw = sessionStorage.getItem(RESULT_STORAGE_KEY)
    if (!raw) return null
    try {
      return JSON.parse(raw) as ResultPayload
    } catch {
      return null
    }
  })
  const [printedOn] = useState(generatedOn)

  useEffect(() => {
    // Consumed once. A transcript should not reappear for whoever opens the
    // tab next on a shared computer.
    if (payload) sessionStorage.removeItem(RESULT_STORAGE_KEY)
    else navigate(SEARCH_PATH, true)
  }, [payload, navigate])

  if (!payload) return null

  const student = payload.student
  const term = payload.semesters[0]
  const curriculumCode = student.curriculum.code

  const passed = isPass(term.gpa.status)
  const credited = isCreditBased(curriculumCode)
  const finalSemester = FINAL_SEMESTER[curriculumCode]
  const isFinalTerm = finalSemester != null && term.semester === finalSemester

  const optional = term.optionalSubjects ?? []
  const marksVisible = payload.marksVisible === true

  // On the final transcript the board prints the GPA of every earlier
  // semester alongside the CGPA.
  const ladder = isFinalTerm
    ? [
        term.gpa.gpa1,
        term.gpa.gpa2,
        term.gpa.gpa3,
        term.gpa.gpa4,
        term.gpa.gpa5,
        term.gpa.gpa6,
        term.gpa.gpa7,
      ].slice(0, finalSemester - 1)
    : []

  const rowClass = [
    'grade-row',
    marksVisible ? 'grade-row--marks' : '',
    credited ? 'grade-row--credit' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const subjectRows = (rows: typeof term.subjects) =>
    rows.map((subject, i) => (
      <div className={rowClass} key={`${subject.subjectCode}-${i}`} role="row">
        <div className="grade-code">{subject.subjectCode}</div>
        <div className="grade-subject">{subject.subjectName}</div>
        {/* Each cell carries its own column name. The head row cannot survive a
            phone, and without these the marks read as an unlabelled run of
            numbers — 200 172 6 — that no one can tell apart. */}
        {marksVisible && (
          <div className="grade-num" data-label="Full Marks">{cell(subject.fullMark)}</div>
        )}
        {marksVisible && (
          <div className="grade-num" data-label="Obtained">{cell(subject.totalMark)}</div>
        )}
        {credited && (
          <div className="grade-num" data-label="Credit Hour">{cell(subject.creditHour)}</div>
        )}
        <div className="grade-letter" data-label="Grade">{cell(subject.gradeLetter)}</div>
        {credited && (
          <div className="grade-num" data-label="Grade Point">{cell(subject.gradePoint)}</div>
        )}
      </div>
    ))

  return (
    <div className="page">
      <Masthead />

      <article className="sheet sheet--doc" id="result-sheet">
        <div className="doc-head">
          <p className="doc-eyebrow">
            Academic Transcript · {semesterLabel(curriculumCode, term.semester)}
          </p>
          <p className="doc-exam">
            {examTitle(curriculumCode, term.meta.examYear, student.curriculum.name)}
          </p>
        </div>

        <section className="doc-section">
          <h3 className="doc-section-title">Student</h3>
          <dl className="identity">
            <dt>Roll</dt>
            <dd className="mono strong">{student.studentRoll}</dd>

            <dt>Name</dt>
            <dd>{student.studentName}</dd>

            <dt>Reg No</dt>
            <dd className="mono">{student.regNo}</dd>

            <dt>Father&rsquo;s Name</dt>
            <dd>{student.fatherName}</dd>

            <dt>Trade / Technology / Specialization</dt>
            <dd>
              {student.technology.code} — {student.technology.name}
            </dd>

            <dt>Mother&rsquo;s Name</dt>
            <dd>{student.motherName}</dd>

            {!credited && (
              <>
                <dt>Student Type</dt>
                <dd>{cell(term.resultRow?.student_type)}</dd>

                <dt>Date of Birth</dt>
                <dd className="mono">{cell(student.dateOfBirth?.numeric)}</dd>
              </>
            )}

            <dt>Session</dt>
            <dd className="mono">{student.studySession}</dd>

            <dt>Result</dt>
            <dd className={passed ? 'status-pass' : 'status-fail'}>
              {cell(term.gpa.status)}
            </dd>

            <dt>Institute</dt>
            <dd className="identity-wide">
              {term.institute.code} — {term.institute.name}
            </dd>
          </dl>
        </section>

        <section className="doc-section">
          <h3 className="doc-section-title">Grade Sheet</h3>

          <div className="grades" role="table">
            <div className={`${rowClass} grade-head`} role="row">
              <div>Subject Code</div>
              <div>Subject Name</div>
              {marksVisible && <div>Full Marks</div>}
              {marksVisible && <div>Obtained Marks</div>}
              {credited && <div>Credit Hour</div>}
              <div>Grade Letter</div>
              {credited && <div>Grade Point</div>}
            </div>

            <div className="grade-body">
              {term.subjects.length > 0 ? (
                subjectRows(term.subjects)
              ) : (
                <div className="grade-row">
                  <div className="grade-empty">No subjects found</div>
                </div>
              )}
            </div>

            <div className="grade-gpa">
              <span className="grade-gpa-label">GPA</span>
              <span className="grade-gpa-value">{gpa(term.gpa.gpa)}</span>
            </div>

            {optional.length > 0 && (
              <>
                <div className="grade-divider">Optional Subject</div>
                <div className="grade-body">{subjectRows(optional)}</div>
                <div className="grade-gpa grade-gpa--final">
                  <span className="grade-gpa-label">GPA with optional subject</span>
                  <span className="grade-gpa-value">{gpa(term.gpa.gpaWithOptional)}</span>
                </div>
              </>
            )}
          </div>
        </section>

        {isFinalTerm && (
          <section className="doc-section">
            <h3 className="doc-section-title">GPA by semester</h3>
            <div className="summary">
              <div
                className="ladder"
                style={{ '--rungs': String(ladder.length) } as React.CSSProperties}
              >
                <div className="ladder-row ladder-head">
                  {ladder.map((_, i) => (
                    <div key={i}>{ordinal(i + 1)}</div>
                  ))}
                </div>
                <div className="ladder-row ladder-values">
                  {ladder.map((value, i) => (
                    <div key={i}>{value ? gpa(value) : ''}</div>
                  ))}
                </div>
              </div>

              <div className="cgpa">
                <div className="cgpa-label">CGPA</div>
                <div className="cgpa-value">
                  {gpa(term.gpa.cgpa)}
                  <small>/ 4.00</small>
                </div>
              </div>
            </div>
          </section>
        )}

        <footer className="doc-foot">
          <p className="doc-printed">{printedOn}</p>
          <p className="doc-copyright">© Bangladesh Technical Education Board</p>
        </footer>
      </article>

      <nav className="toolbar no-print" aria-label="Result actions">
        <button
          type="button"
          className="toolbar-button"
          onClick={() => window.print()}
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
          >
            <path d="M6 8V3h8v5" strokeLinejoin="round" />
            <path d="M4 8h12v6h-2v3H6v-3H4V8z" strokeLinejoin="round" />
          </svg>
          Print
        </button>

        <button
          type="button"
          className="toolbar-button toolbar-button--ghost"
          onClick={() => navigate(SEARCH_PATH)}
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <circle cx="9" cy="9" r="6" />
            <path d="M13.5 13.5L17 17" strokeLinecap="round" />
          </svg>
          Search again
        </button>
      </nav>
    </div>
  )
}
