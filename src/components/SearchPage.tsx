import { useEffect, useRef, useState } from 'react'
import { api } from '../api'
import {
  CURRICULUMS_BY_EXAM,
  EXAMINATIONS,
  examYears,
  publishedCurriculums,
  publishedSemesters,
  publishedYears,
  semesterOptions,
} from '../constants'
import type { Curriculum, PublicationOption } from '../types'
import { RESULT_PATH, SEARCH_PATH } from '../router'
import { captchaInput, digitsOnly, validateSearch } from '../validate'
import { Masthead } from './Masthead'
import { Select } from './Select'

/** Where the found result is handed to the result page. */
export const RESULT_STORAGE_KEY = 'bteb_result_data'

/** How often the form re-checks whether results have been published. */
const PUBLICATION_POLL_MS = 60_000

interface Props {
  navigate: (path: string, replace?: boolean) => void
}

export function SearchPage({ navigate }: Props) {
  const [curriculums, setCurriculums] = useState<Curriculum[]>([])
  const [published, setPublished] = useState<PublicationOption[]>([])
  const resultDayActive = published.length > 0

  const [examination, setExamination] = useState('')
  const [curriculumCode, setCurriculumCode] = useState('')
  const [semester, setSemester] = useState('')
  const [examYear, setExamYear] = useState('')
  const [rollNo, setRollNo] = useState('')
  const [regNo, setRegNo] = useState('')

  const [captchaImage, setCaptchaImage] = useState('')
  const [captchaQuestion, setCaptchaQuestion] = useState('')
  const [captchaToken, setCaptchaToken] = useState('')
  const [captchaAnswer, setCaptchaAnswer] = useState('')

  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState<string | null>(null)
  const [searching, setSearching] = useState(false)

  const [yearListOpen, setYearListOpen] = useState(false)
  const refreshButton = useRef<HTMLButtonElement>(null)

  const loadCaptcha = async () => {
    setCaptchaAnswer('')
    try {
      const challenge = await api.captcha()
      setCaptchaImage(challenge?.image ?? '')
      setCaptchaQuestion(challenge?.question ?? '')
      setCaptchaToken(challenge?.token ?? '')
    } catch {
      setCaptchaImage('')
      setCaptchaQuestion('')
      setCaptchaToken('')
    }
  }

  const refreshCaptcha = () => {
    refreshButton.current?.classList.add('spin')
    setTimeout(() => refreshButton.current?.classList.remove('spin'), 450)
    void loadCaptcha()
  }

  useEffect(() => {
    api.curriculums().then(setCurriculums).catch(() => {})
    void loadCaptcha()

    const poll = () => {
      api
        .activePublications()
        .then((res) => {
          const next = res?.resultDayActive ? res.options ?? [] : []
          // Replacing an identical list would re-render the whole form and
          // close whichever menu the student had open.
          setPublished((prev) =>
            JSON.stringify(prev) === JSON.stringify(next) ? prev : next,
          )
        })
        .catch(() => {})
    }

    poll()
    const timer = setInterval(poll, PUBLICATION_POLL_MS)
    return () => clearInterval(timer)
  }, [])

  // Each selection invalidates the ones that depend on it.
  const chooseExamination = (value: string) => {
    setExamination(value)
    setCurriculumCode('')
    setSemester('')
    setExamYear('')
  }
  const chooseCurriculum = (value: string) => {
    setCurriculumCode(value)
    setSemester('')
    if (resultDayActive) setExamYear('')
  }
  const chooseSemester = (value: string) => {
    setSemester(value)
    if (resultDayActive) setExamYear('')
  }

  const curriculumChoices = resultDayActive
    ? publishedCurriculums(curriculums, published)
    : examination
      ? curriculums.filter((c) =>
          CURRICULUMS_BY_EXAM[examination]?.includes(c.curriculumCode),
        )
      : []

  const semesterChoices = resultDayActive
    ? publishedSemesters(published, curriculumCode)
    : curriculumCode
      ? semesterOptions(curriculumCode)
      : []

  const yearChoices = resultDayActive
    ? publishedYears(published, curriculumCode, semester)
    : examYears().filter((y) => y.includes(examYear))

  const search = async () => {
    setError(null)

    const message = validateSearch(
      { examination, curriculumCode, semester, examYear, rollNo, regNo, captchaAnswer },
      resultDayActive,
    )
    if (message) {
      setError(message)
      return
    }
    if (!captchaToken) {
      setError('The security check did not load. Please use the refresh button.')
      refreshCaptcha()
      return
    }

    setSearching(true)
    try {
      const response = await api.result({
        curriculumCode,
        rollNo: rollNo.trim(),
        regNo: regNo.trim(),
        semester,
        examYear,
        captchaToken,
        captchaAnswer: captchaAnswer.trim(),
      })
      const payload = response?.data

      if (payload?.semesters?.length) {
        sessionStorage.setItem(RESULT_STORAGE_KEY, JSON.stringify(payload))
        navigate(RESULT_PATH)
        return
      }
      if (response?.code === 'CAPTCHA_INVALID') {
        setError(response.message || 'The security check answer is incorrect.')
        refreshCaptcha()
        return
      }
      setNotFound(response?.message || 'Result is not found.')
    } catch {
      setNotFound('The result could not be retrieved. Please try again.')
    } finally {
      setSearching(false)
    }
  }

  const onEnter = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') void search()
  }

  return (
    <div className="page">
      {notFound && (
        <div
          className="modal-veil"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="modal">
            <h2 className="modal-title" id="modal-title">
              Search Result
            </h2>
            <p className="modal-text">{notFound}</p>
            <div className="modal-foot">
              <button
                type="button"
                className="modal-button"
                autoFocus
                onClick={() => {
                  setNotFound(null)
                  refreshCaptcha()
                  navigate(SEARCH_PATH)
                }}
              >
                Search Again
              </button>
            </div>
          </div>
        </div>
      )}

      <Masthead />

      <main className="sheet sheet--form">
        <div className="sheet-head">
          <h2 className="sheet-title">Official Result Search Portal</h2>
        </div>

        <div className="sheet-body">
          {error && (
            <div className="error-banner" role="alert">
              {error}
            </div>
          )}

          {resultDayActive && (
            <div className="day-notice">
              <strong>Results have been published today.</strong> Only the
              examinations published today can be searched below.
            </div>
          )}

          <div className="field-grid">
            {!resultDayActive && (
              <div className="field">
                <span className="field-label" id="lbl-exam">
                  Examination <span className="field-required" aria-hidden="true">*</span>
                </span>
                <Select
                  labelledBy="lbl-exam"
                  value={examination}
                  placeholder="Select examination"
                  options={EXAMINATIONS}
                  onChange={chooseExamination}
                />
              </div>
            )}

            <div className={resultDayActive ? 'field field--full' : 'field'}>
              <span className="field-label" id="lbl-curriculum">
                Curriculum <span className="field-required" aria-hidden="true">*</span>
              </span>
              <Select
                labelledBy="lbl-curriculum"
                value={curriculumCode}
                placeholder="Select curriculum"
                disabled={
                  curriculumChoices.length === 0 ||
                  (!resultDayActive && !examination)
                }
                options={curriculumChoices.map((c) => ({
                  label: `${c.curriculumCode} — ${c.curriculumName}`,
                  value: c.curriculumCode,
                }))}
                onChange={chooseCurriculum}
              />
            </div>

            <div className="field">
              <span className="field-label" id="lbl-semester">
                Semester / Class <span className="field-required" aria-hidden="true">*</span>
              </span>
              <Select
                labelledBy="lbl-semester"
                value={semester}
                placeholder="Select semester"
                disabled={!curriculumCode}
                options={semesterChoices}
                onChange={chooseSemester}
              />
            </div>

            <div className="field">
              <span className="field-label" id="lbl-year">
                Exam Year <span className="field-required" aria-hidden="true">*</span>
              </span>
              {resultDayActive ? (
                <Select
                  labelledBy="lbl-year"
                  value={examYear}
                  placeholder="Select year"
                  disabled={yearChoices.length === 0}
                  options={yearChoices.map((y) => ({ label: y, value: y }))}
                  onChange={setExamYear}
                />
              ) : (
                <div className="dropdown">
                  <input
                    className="field-control field-control--mono field-control--caret"
                    aria-labelledby="lbl-year"
                    value={examYear}
                    onChange={(e) => {
                      setExamYear(digitsOnly(e.target.value, 4))
                      setYearListOpen(true)
                    }}
                    onFocus={() => setYearListOpen(true)}
                    onBlur={() => setTimeout(() => setYearListOpen(false), 150)}
                    placeholder="Select year"
                    inputMode="numeric"
                    autoComplete="off"
                    onKeyDown={onEnter}
                  />
                  {yearListOpen && yearChoices.length > 0 && (
                    <div className="dropdown-menu">
                      {yearChoices.map((y) => (
                        <div
                          key={y}
                          className="dropdown-option"
                          onMouseDown={() => {
                            setExamYear(y)
                            setYearListOpen(false)
                          }}
                        >
                          {y}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="field">
              <label className="field-label" htmlFor="roll">
                Roll No <span className="field-required" aria-hidden="true">*</span>
              </label>
              <input
                id="roll"
                className="field-control field-control--mono"
                type="text"
                inputMode="numeric"
                value={rollNo}
                onChange={(e) => setRollNo(digitsOnly(e.target.value, 6))}
                placeholder="123456"
                maxLength={6}
                autoComplete="off"
                onKeyDown={onEnter}
              />
            </div>

            <div className="field">
              <label className="field-label" htmlFor="reg">
                Registration No <span className="field-required" aria-hidden="true">*</span>
              </label>
              <input
                id="reg"
                className="field-control field-control--mono"
                type="text"
                inputMode="numeric"
                value={regNo}
                onChange={(e) => setRegNo(digitsOnly(e.target.value, 10))}
                placeholder="123456 or 1234567890"
                maxLength={10}
                autoComplete="off"
                onKeyDown={onEnter}
              />
            </div>

            <div className="field field--full">
              <label className="field-label" htmlFor="captcha">
                Security Check <span className="field-required" aria-hidden="true">*</span>
              </label>
              <div className="captcha-row">
                <div className="captcha-challenge" aria-hidden="true">
                  {captchaImage ? (
                    <img src={captchaImage} alt="" width={150} height={48} />
                  ) : captchaQuestion ? (
                    <span>{captchaQuestion}</span>
                  ) : (
                    <span className="captcha-loading">loading…</span>
                  )}
                </div>

                <input
                  id="captcha"
                  className="field-control field-control--mono captcha-answer"
                  type="text"
                  value={captchaAnswer}
                  onChange={(e) => setCaptchaAnswer(captchaInput(e.target.value))}
                  placeholder="Code"
                  autoComplete="off"
                  spellCheck={false}
                  autoCapitalize="off"
                  autoCorrect="off"
                  maxLength={5}
                  onKeyDown={onEnter}
                />

                <button
                  type="button"
                  ref={refreshButton}
                  className="icon-button"
                  onClick={refreshCaptcha}
                  aria-label="Get a new security check"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    aria-hidden="true"
                  >
                    <path d="M16.5 10a6.5 6.5 0 1 1-1.9-4.6" strokeLinecap="round" />
                    <path d="M16.5 3v3.5H13" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                <button
                  type="button"
                  className="primary-button"
                  onClick={() => void search()}
                  disabled={searching}
                >
                  {searching ? (
                    <svg
                      className="spinner"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <path
                        d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
                        strokeLinecap="round"
                      />
                    </svg>
                  ) : (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 20 20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <circle cx="9" cy="9" r="6" />
                      <path d="M13.5 13.5L17 17" strokeLinecap="round" />
                    </svg>
                  )}
                  <span>{searching ? 'Searching…' : 'Search'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="page-foot">
        <div className="page-foot-rule" />© Bangladesh Technical Education Board
      </footer>
    </div>
  )
}
