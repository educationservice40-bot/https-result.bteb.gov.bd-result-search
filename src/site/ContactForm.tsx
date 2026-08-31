import { useId, useState } from 'react'
import { SERVICES, SITE } from './content'
import {
  EMPTY_ENQUIRY,
  submitEnquiry,
  validateEnquiry,
  type Enquiry,
  type EnquiryErrors,
  type EnquiryField,
} from './enquiry'

/* ---------------------------------------------------------------------------
   One form, used on the contact page and again at the foot of every service
   page with that service already chosen — which is the whole point of putting
   it there. A visitor reading about MOI certificates should not have to say
   "MOI certificates" a second time.
   --------------------------------------------------------------------------- */

type Status =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'sent' }
  | { kind: 'mailto' }
  | { kind: 'error'; message: string }

interface Props {
  /** Slug of the service to preselect. '' leaves it on "general enquiry". */
  service?: string
  /** Heading rendered above the form. */
  title?: string
  intro?: string
}

export function ContactForm({
  service = '',
  title = 'Send an enquiry',
  intro,
}: Props) {
  const id = useId()
  const [enquiry, setEnquiry] = useState<Enquiry>({ ...EMPTY_ENQUIRY, service })
  const [errors, setErrors] = useState<EnquiryErrors>({})
  // Errors are only shown once the visitor has tried to send. Marking a field
  // red before it has been filled in is scolding someone for not having
  // finished typing.
  const [submitted, setSubmitted] = useState(false)
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  // A field no human sees and no human fills in. A bot that fills every input
  // on the page fills this one too, and the message is dropped without a word,
  // because telling a spammer why they failed only helps them.
  const [trap, setTrap] = useState('')

  const set = (field: EnquiryField) => (value: string) => {
    const next = { ...enquiry, [field]: value }
    setEnquiry(next)
    if (submitted) setErrors(validateEnquiry(next))
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)

    const found = validateEnquiry(enquiry)
    setErrors(found)
    if (Object.keys(found).length > 0) {
      // Move the visitor to the first thing that needs fixing rather than
      // leaving them to hunt for the red text.
      const first = Object.keys(found)[0] as EnquiryField
      document.getElementById(`${id}-${first}`)?.focus()
      return
    }

    if (trap) {
      setStatus({ kind: 'sent' })
      return
    }

    setStatus({ kind: 'sending' })
    const outcome = await submitEnquiry(enquiry)

    if (outcome.kind === 'mailto') {
      setStatus({ kind: 'mailto' })
      window.location.href = outcome.href
      return
    }
    if (outcome.kind === 'error') {
      setStatus({ kind: 'error', message: outcome.message })
      return
    }

    setStatus({ kind: 'sent' })
    setEnquiry({ ...EMPTY_ENQUIRY, service })
    setSubmitted(false)
  }

  const invalid = (field: EnquiryField) => (submitted && errors[field] ? true : undefined)
  const describedBy = (field: EnquiryField) =>
    submitted && errors[field] ? `${id}-${field}-error` : undefined

  return (
    <section className="form-card" aria-labelledby={`${id}-title`}>
      <h2 className="form-card-title" id={`${id}-title`}>
        {title}
      </h2>
      <p className="form-card-intro">
        {intro ??
          'Tell us what has been asked of you and by whom. You will get a written answer, with a quote, within one working day.'}
      </p>

      <form className="form" onSubmit={onSubmit} noValidate>
        <div className="form-row">
          <Field
            id={`${id}-name`}
            label="Your name"
            required
            value={enquiry.name}
            onChange={set('name')}
            autoComplete="name"
            error={submitted ? errors.name : undefined}
            errorId={`${id}-name-error`}
            invalid={invalid('name')}
            describedBy={describedBy('name')}
          />
          <Field
            id={`${id}-email`}
            label="Email"
            type="email"
            required
            value={enquiry.email}
            onChange={set('email')}
            autoComplete="email"
            error={submitted ? errors.email : undefined}
            errorId={`${id}-email-error`}
            invalid={invalid('email')}
            describedBy={describedBy('email')}
          />
        </div>

        <div className="form-row">
          <Field
            id={`${id}-phone`}
            label="Phone or WhatsApp"
            type="tel"
            value={enquiry.phone}
            onChange={set('phone')}
            autoComplete="tel"
            hint="Optional"
          />

          <div className="form-field">
            <label className="form-label" htmlFor={`${id}-service`}>
              Service
            </label>
            <select
              id={`${id}-service`}
              className="field-control"
              value={enquiry.service}
              onChange={(e) => set('service')(e.target.value)}
            >
              <option value="">General enquiry</option>
              {SERVICES.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor={`${id}-message`}>
            What do you need? <span className="form-required">*</span>
          </label>
          <textarea
            id={`${id}-message`}
            className="field-control form-textarea"
            rows={6}
            value={enquiry.message}
            onChange={(e) => set('message')(e.target.value)}
            aria-invalid={invalid('message')}
            aria-describedby={describedBy('message')}
            placeholder="Which document, which institution is asking for it, and by when."
          />
          {submitted && errors.message ? (
            <p className="form-error" id={`${id}-message-error`}>
              {errors.message}
            </p>
          ) : null}
        </div>

        {/* Off-screen rather than display:none — some bots skip hidden inputs. */}
        <div className="form-trap" aria-hidden="true">
          <label htmlFor={`${id}-company`}>Company (leave blank)</label>
          <input
            id={`${id}-company`}
            name="company"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={trap}
            onChange={(e) => setTrap(e.target.value)}
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="button button--primary" disabled={status.kind === 'sending'}>
            {status.kind === 'sending' ? 'Sending…' : 'Send enquiry'}
          </button>
          <p className="form-note">
            Or email <a href={`mailto:${SITE.email}`}>{SITE.email}</a> directly.
          </p>
        </div>

        <p className="form-status" role="status" aria-live="polite">
          {status.kind === 'sent'
            ? 'Thank you — your message has been sent. We reply within one working day.'
            : status.kind === 'mailto'
              ? 'Your email app should have opened with the message ready to send. If nothing happened, copy the details into an email to ' +
                SITE.email +
                '.'
              : status.kind === 'error'
                ? status.message
                : ''}
        </p>
      </form>
    </section>
  )
}

/* A single labelled text input, with its error message tied to it by id. */
function Field({
  id,
  label,
  value,
  onChange,
  type = 'text',
  required = false,
  autoComplete,
  hint,
  error,
  errorId,
  invalid,
  describedBy,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  required?: boolean
  autoComplete?: string
  hint?: string
  error?: string
  errorId?: string
  invalid?: true
  describedBy?: string
}) {
  return (
    <div className="form-field">
      <label className="form-label" htmlFor={id}>
        {label}{' '}
        {required ? (
          <span className="form-required">*</span>
        ) : hint ? (
          <span className="form-hint">{hint}</span>
        ) : null}
      </label>
      <input
        id={id}
        type={type}
        className="field-control"
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={invalid}
        aria-describedby={describedBy}
      />
      {error ? (
        <p className="form-error" id={errorId}>
          {error}
        </p>
      ) : null}
    </div>
  )
}
