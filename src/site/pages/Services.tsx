import { SERVICES } from '../content'
import { CallToAction, PageHeader, ServiceGrid } from '../pieces'

export function ServicesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Services"
        title="What we do"
        lede="Every service below ends in a document issued by an institution, not by us. Our part is making sure the request is right, the supporting papers are complete, and somebody keeps asking until it is done."
      />

      <section className="section section--tight">
        <div className="shell">
          <ServiceGrid services={SERVICES} />
        </div>
      </section>

      <CallToAction
        title="Something not on this list?"
        body="Most enquiries turn out to be one of these wearing a different name. Describe what you have been asked for and we will tell you."
      />
    </>
  )
}
