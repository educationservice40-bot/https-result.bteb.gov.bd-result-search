import { serviceBySlug, TESTIMONIALS } from '../content'
import { Link } from '../nav'
import { CallToAction, PageHeader } from '../pieces'
import { servicePath } from '../routes'

export function TestimonialsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Testimonials"
        title="What clients say"
        lede="Quotes are published only with the sender’s permission, and only from cases we actually handled."
      />

      <section className="section section--tight">
        <div className="shell">
          {TESTIMONIALS.length === 0 ? (
            <p className="empty-note">
              No testimonials have been published yet. Ask us for references and
              we will put you in touch with clients who have agreed to speak.
            </p>
          ) : (
            <ul className="quote-grid">
              {TESTIMONIALS.map((t) => {
                const service = t.service ? serviceBySlug(t.service) : undefined
                return (
                  <li key={t.quote}>
                    <figure className="quote">
                      <blockquote>
                        <p>{t.quote}</p>
                      </blockquote>
                      <figcaption>
                        <span className="quote-name">{t.name}</span>
                        <span className="quote-role">{t.role}</span>
                        {service ? (
                          <Link className="quote-service" to={servicePath(service.slug)}>
                            {service.name}
                          </Link>
                        ) : null}
                      </figcaption>
                    </figure>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </section>

      <CallToAction
        title="Your case next"
        body="Send us the requirement and we will tell you plainly whether we can help and what it will cost."
      />
    </>
  )
}
