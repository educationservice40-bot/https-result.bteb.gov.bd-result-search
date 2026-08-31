import { FAQS, SITE } from '../content'
import { ContactForm } from '../ContactForm'
import { ExternalLink } from '../nav'
import { PageHeader } from '../pieces'

export function ContactPage() {
  const whatsapp = SITE.whatsapp.replace(/\D/g, '')

  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Tell us what has been asked of you"
        lede="Send the requirement in whatever form you have it — a screenshot, an email, a checklist. That is enough for us to tell you what it needs and what it costs."
      />

      <section className="section section--tight">
        <div className="shell contact-grid">
          <ContactForm />

          <aside className="contact-aside" aria-label="Contact details">
            <div className="panel">
              <h2 className="panel-title">Direct</h2>
              <ul className="contact-list">
                <li>
                  <span className="contact-label">Email</span>
                  <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
                </li>
                {SITE.phone ? (
                  <li>
                    <span className="contact-label">Phone</span>
                    <a href={`tel:${SITE.phone.replace(/\s+/g, '')}`}>{SITE.phone}</a>
                  </li>
                ) : null}
                {whatsapp ? (
                  <li>
                    <span className="contact-label">WhatsApp</span>
                    <ExternalLink href={`https://wa.me/${whatsapp}`}>
                      Message on WhatsApp
                    </ExternalLink>
                  </li>
                ) : null}
                {SITE.address ? (
                  <li>
                    <span className="contact-label">Office</span>
                    <span>{SITE.address}</span>
                  </li>
                ) : null}
                {SITE.hours ? (
                  <li>
                    <span className="contact-label">Hours</span>
                    <span>{SITE.hours}</span>
                  </li>
                ) : null}
              </ul>
            </div>

            <div className="panel panel--quiet">
              <h2 className="panel-title">Before you write</h2>
              <p className="panel-body">
                Two things make an answer useful straight away: which document
                you need, and who has asked for it. A link to the requirement
                page is better than a description of it.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <section className="section section--wash">
        <div className="shell">
          <h2 className="section-title">Common questions</h2>
          <dl className="faq">
            {FAQS.map((faq) => (
              <div className="faq-item" key={faq.question}>
                <dt>{faq.question}</dt>
                <dd>{faq.answer}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </>
  )
}
