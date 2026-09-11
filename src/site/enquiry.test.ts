import { describe, expect, it } from 'vitest'
import { SITE } from './content'
import {
  EMPTY_ENQUIRY,
  enquiryBody,
  enquirySubject,
  mailtoHref,
  serviceName,
  validateEnquiry,
  type Enquiry,
} from './enquiry'

const filled: Enquiry = {
  name: 'Rahim Uddin',
  email: 'rahim@example.com',
  phone: '01700000000',
  service: 'medium-of-instruction',
  message: 'I need an MOI certificate for a masters application in Germany.',
}

describe('validateEnquiry', () => {
  it('accepts a complete enquiry', () => {
    expect(validateEnquiry(filled)).toEqual({})
  })

  it('asks for the three things a reply actually needs', () => {
    expect(Object.keys(validateEnquiry(EMPTY_ENQUIRY)).sort()).toEqual([
      'email',
      'message',
      'name',
    ])
  })

  it('does not accept whitespace as an answer', () => {
    expect(validateEnquiry({ ...filled, name: '   ' }).name).toBeDefined()
  })

  it('rejects an address with no domain but accepts an ordinary one', () => {
    expect(validateEnquiry({ ...filled, email: 'rahim@example' }).email).toBeDefined()
    expect(validateEnquiry({ ...filled, email: 'rahim.uddin+moi@sub.example.co' }).email)
      .toBeUndefined()
  })

  it('asks for more than a one-word message', () => {
    expect(validateEnquiry({ ...filled, message: 'help' }).message).toBeDefined()
  })

  it('treats the phone number as optional', () => {
    expect(validateEnquiry({ ...filled, phone: '' })).toEqual({})
  })
})

describe('the message that is sent', () => {
  it('names the chosen service in the subject', () => {
    expect(enquirySubject(filled)).toContain('Medium of Instruction (MOI)')
    expect(enquirySubject(filled)).toContain('Rahim Uddin')
  })

  it('falls back to a general enquiry when no service was chosen', () => {
    expect(serviceName('')).toBe('General enquiry')
    expect(serviceName('not-a-service')).toBe('General enquiry')
  })

  it('carries every field the reply needs', () => {
    const body = enquiryBody(filled)
    expect(body).toContain('rahim@example.com')
    expect(body).toContain('01700000000')
    expect(body).toContain('Germany')
  })

  it('leaves the phone line out entirely when there is no phone number', () => {
    expect(enquiryBody({ ...filled, phone: '' })).not.toContain('Phone:')
  })
})

describe('mailtoHref', () => {
  it('addresses the site owner', () => {
    expect(mailtoHref(filled).startsWith(`mailto:${SITE.email}?`)).toBe(true)
  })

  it('percent-encodes spaces rather than turning them into plus signs', () => {
    // `URLSearchParams` would produce `+` here, which mail clients paste into
    // the subject line literally.
    const href = mailtoHref(filled)
    expect(href).toContain('%20')
    expect(href.split('subject=')[1].split('&')[0]).not.toContain('+')
  })

  it('encodes the line breaks that separate the fields', () => {
    expect(mailtoHref(filled)).toContain('%0A')
  })
})
