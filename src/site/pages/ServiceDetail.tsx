import { SERVICES, type Service } from '../content'
import { ContactForm } from '../ContactForm'
import { Link } from '../nav'
import { Breadcrumbs, CheckList, DriveLink, ServiceGrid } from '../pieces'
import { servicePath } from '../routes'

export function ServiceDetailPage({ service }: { service: Service }) {
  const others = SERVICES.filter((s) => s.slug !== service.slug).slice(0, 3)

  return (
    <>
      <header className="page-header">
        <div className="shell">
          <Breadcrumbs
            trail={[
              { name: 'Home', path: '/' },
              { name: 'Services', path: '/services' },
              { name: service.name },
            ]}
          />
          <p className="eyebrow">Service</p>
          <h1 className="page-title">{service.name}</h1>
          <p className="page-lede">{service.summary}</p>
          <p className="hero-actions">
            <a href="#enquiry" className="button button--primary">
              Ask about this service
            </a>
            <Link to="/services" className="button button--outline">
              All services
            </Link>
          </p>
        </div>
      </header>

      <section className="section section--tight">
        <div className="shell detail-grid">
          <div className="detail-body">
            {service.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}

            <h2 className="detail-heading">What is included</h2>
            <CheckList items={service.includes} />

            <h2 className="detail-heading">What you need to bring</h2>
            <CheckList items={service.requirements} />
          </div>

          <aside className="detail-aside" aria-label="At a glance">
            <div className="panel">
              <h2 className="panel-title">Documents</h2>
              <DriveLink service={service} />
            </div>

            <div className="panel">
              <h2 className="panel-title">How long it takes</h2>
              <p className="panel-body">{service.turnaround}</p>
            </div>

            <div className="panel panel--quiet">
              <h2 className="panel-title">Who issues it</h2>
              <p className="panel-body">
                Your university, board, ministry or embassy. We prepare and
                submit the request and follow it up — we do not produce or sign
                the document itself.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <section className="section section--wash" id="enquiry">
        <div className="shell shell--narrow">
          <ContactForm
            service={service.slug}
            title={`Enquire about ${service.name}`}
            intro="Tell us who has asked you for this and by when. You will get a written answer, with a quote, within one working day."
          />
        </div>
      </section>

      {others.length > 0 ? (
        <section className="section section--tight">
          <div className="shell">
            <header className="section-head">
              <h2 className="section-title">Other services</h2>
            </header>
            <ServiceGrid services={others} />
            <p className="section-more">
              <Link to={servicePath(SERVICES[0].slug)}>Start from the top</Link>
            </p>
          </div>
        </section>
      ) : null}
    </>
  )
}
