import { SERVICES, SITE, STEPS, TESTIMONIALS } from '../content'
import { Link } from '../nav'
import { CallToAction, ServiceGrid } from '../pieces'
import { servicePath } from '../routes'

export function HomePage() {
  const featured = TESTIMONIALS.slice(0, 2)

  return (
    <>
      <section className="hero">
        <div className="shell hero-inner">
          <div className="hero-copy">
            <p className="eyebrow">{SITE.tagline}</p>
            <h1 className="hero-title">
              The paperwork behind your application, done properly the first time.
            </h1>
            <p className="hero-lede">{SITE.description}</p>
            <p className="hero-actions">
              <Link to="/services" className="button button--primary">
                See what we do
              </Link>
              <Link to="/contact" className="button button--outline">
                Ask about your case
              </Link>
            </p>
            <ul className="hero-points">
              <li>Written quote before anything starts</li>
              <li>Institution fees passed on unchanged</li>
              <li>A reply within one working day</li>
            </ul>
          </div>

          <aside className="hero-panel" aria-label="Services at a glance">
            <h2 className="hero-panel-title">What we handle</h2>
            <ul className="hero-panel-list">
              {SERVICES.map((s) => (
                <li key={s.slug}>
                  <Link to={servicePath(s.slug)}>{s.name}</Link>
                </li>
              ))}
            </ul>
            <p className="hero-panel-note">
              Every document is issued by your university, board or ministry. We
              prepare the request, submit it and follow it to the end.
            </p>
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <header className="section-head">
            <h2 className="section-title">Services</h2>
            <p className="section-lede">
              What people come to us for. Each page says what is included, what
              you need to bring, and how long the issuing office usually takes.
            </p>
          </header>
          <ServiceGrid services={SERVICES} />
          <p className="section-more">
            <Link to="/services">All services in detail</Link>
          </p>
        </div>
      </section>

      <section className="section section--wash">
        <div className="shell">
          <header className="section-head">
            <h2 className="section-title">How it works</h2>
            <p className="section-lede">
              Four steps, and you are told where things stand at each one.
            </p>
          </header>
          <ol className="steps">
            {STEPS.map((step, i) => (
              <li key={step.title} className="step">
                <span className="step-number" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-detail">{step.detail}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {featured.length > 0 ? (
        <section className="section">
          <div className="shell">
            <header className="section-head">
              <h2 className="section-title">In their words</h2>
            </header>
            <ul className="quote-grid quote-grid--pair">
              {featured.map((t) => (
                <li key={t.quote}>
                  <figure className="quote">
                    <blockquote>
                      <p>{t.quote}</p>
                    </blockquote>
                    <figcaption>
                      <span className="quote-name">{t.name}</span>
                      <span className="quote-role">{t.role}</span>
                    </figcaption>
                  </figure>
                </li>
              ))}
            </ul>
            <p className="section-more">
              <Link to="/testimonials">Read more</Link>
            </p>
          </div>
        </section>
      ) : null}

      <CallToAction
        title="Not sure which of these you need?"
        body="Send us the requirement exactly as you received it. We will tell you what it actually asks for, and what it will cost."
        primary={{ label: 'Contact us', path: '/contact' }}
        secondary={{ label: 'Browse services', path: '/services' }}
      />
    </>
  )
}
