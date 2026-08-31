import { SERVICES, SITE } from './content'

/* ---------------------------------------------------------------------------
   The enquiry a visitor sends, and the two ways it can leave the browser.

   This is a static site with no server of its own, so there are exactly two
   honest options:

   1. `VITE_CONTACT_ENDPOINT` is set to a form endpoint — Formspree, Web3Forms,
      Getform, Basin, a Google Apps Script, your own handler. The form POSTs
      JSON there and the visitor never leaves the page.
   2. It is not set. The form opens the visitor's mail client with everything
      already filled in, and says so plainly.

   The second is the default because it works the moment the site is deployed,
   with nothing to sign up for. Set the endpoint when you want messages to
   arrive without the visitor having a mail client configured — which, on a
   phone, is most of them.
   --------------------------------------------------------------------------- */

export interface Enquiry {
  name: string
  email: string
  phone: string
  /** A service slug, or '' for a general enquiry. */
  service: string
  message: string
}

export const EMPTY_ENQUIRY: Enquiry = {
  name: '',
  email: '',
  phone: '',
  service: '',
  message: '',
}

export const CONTACT_ENDPOINT: string = import.meta.env.VITE_CONTACT_ENDPOINT ?? ''

export type EnquiryField = keyof Enquiry

export type EnquiryErrors = Partial<Record<EnquiryField, string>>

/**
 * Deliberately forgiving. The only address check is that there is something,
 * an `@`, and something with a dot after it: every stricter rule anyone writes
 * eventually rejects a real address, and the message bounces back to the sender
 * anyway if it is wrong.
 */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateEnquiry(enquiry: Enquiry): EnquiryErrors {
  const errors: EnquiryErrors = {}

  if (!enquiry.name.trim()) errors.name = 'Please tell us your name.'

  const email = enquiry.email.trim()
  if (!email) errors.email = 'We need an email address to reply to.'
  else if (!EMAIL.test(email)) errors.email = 'That does not look like an email address.'

  const message = enquiry.message.trim()
  if (!message) errors.message = 'Please describe what you need.'
  else if (message.length < 20)
    errors.message = 'A little more detail helps — what document, and who is asking for it?'

  return errors
}

export function serviceName(slug: string): string {
  return SERVICES.find((s) => s.slug === slug)?.name ?? 'General enquiry'
}

export function enquirySubject(enquiry: Enquiry): string {
  return `${serviceName(enquiry.service)} — enquiry from ${enquiry.name.trim() || 'website'}`
}

export function enquiryBody(enquiry: Enquiry): string {
  const lines = [
    `Name: ${enquiry.name.trim()}`,
    `Email: ${enquiry.email.trim()}`,
    enquiry.phone.trim() ? `Phone: ${enquiry.phone.trim()}` : '',
    `Service: ${serviceName(enquiry.service)}`,
    '',
    enquiry.message.trim(),
  ]
  return lines.filter((line) => line !== '').join('\n')
}

/**
 * `encodeURIComponent` and not `URLSearchParams`: the latter encodes a space as
 * `+`, which mail clients paste into the subject line literally.
 */
export function mailtoHref(enquiry: Enquiry): string {
  const subject = encodeURIComponent(enquirySubject(enquiry))
  const body = encodeURIComponent(enquiryBody(enquiry))
  return `mailto:${SITE.email}?subject=${subject}&body=${body}`
}

export type SubmitOutcome =
  | { kind: 'sent' }
  | { kind: 'mailto'; href: string }
  | { kind: 'error'; message: string }

/**
 * Posted as JSON with an `Accept: application/json` header, which is what the
 * hosted form services need in order to answer with JSON instead of redirecting
 * the page to their own thank-you screen.
 */
export async function submitEnquiry(enquiry: Enquiry): Promise<SubmitOutcome> {
  if (!CONTACT_ENDPOINT) return { kind: 'mailto', href: mailtoHref(enquiry) }

  try {
    const response = await fetch(CONTACT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        name: enquiry.name.trim(),
        email: enquiry.email.trim(),
        phone: enquiry.phone.trim(),
        service: serviceName(enquiry.service),
        message: enquiry.message.trim(),
        subject: enquirySubject(enquiry),
      }),
    })

    if (!response.ok) {
      return {
        kind: 'error',
        message: `The form service refused the message (${response.status}). Please email ${SITE.email} instead.`,
      }
    }
    return { kind: 'sent' }
  } catch {
    return {
      kind: 'error',
      message: `The message could not be sent — you may be offline. Please email ${SITE.email} instead.`,
    }
  }
}
