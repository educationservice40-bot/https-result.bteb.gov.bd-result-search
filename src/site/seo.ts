import { FAQS, SERVICES, SITE, TEAM } from './content'
import { normalizePath, routePath, servicePath, type SiteRoute } from './routes'

/* ---------------------------------------------------------------------------
   One description of a page's head, produced once and consumed twice: written
   into the file by the build-time prerenderer, and applied to the live document
   when the same page is reached by client-side navigation. Both go through the
   functions below, so a crawler and a visitor never see different metadata.
   --------------------------------------------------------------------------- */

export interface PageHead {
  title: string
  description: string
  /** Canonical path, already normalized. */
  path: string
  keywords: string[]
  /** Absent on indexable pages; `noindex` on the 404. */
  robots?: string
  /** Emitted as one `application/ld+json` block per entry. */
  jsonLd: object[]
}

/**
 * Absolute where we can, relative where we cannot. A relative canonical is
 * valid and resolves against the document's own address, so the site is correct
 * before `SITE.url` is filled in — it just cannot have a sitemap until then.
 */
export function absoluteUrl(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`
  return SITE.url ? `${SITE.url.replace(/\/+$/, '')}${p === '/' ? '/' : p}` : p
}

function titleFor(pageTitle: string | null): string {
  return pageTitle ? `${pageTitle} — ${SITE.name}` : `${SITE.name} — ${SITE.tagline}`
}

/* Structured data ---------------------------------------------------------- */

/**
 * The business itself, referenced by `@id` from every other node so that a
 * crawler reading two pages understands it is reading about one organisation
 * rather than two.
 */
const ORG_ID = `${absoluteUrl('/')}#organization`

function organization(): object {
  const contactPoint: Record<string, unknown> = {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    email: SITE.email,
    availableLanguage: ['en', 'bn'],
  }
  if (SITE.phone) contactPoint.telephone = SITE.phone

  const node: Record<string, unknown> = {
    '@type': 'ProfessionalService',
    '@id': ORG_ID,
    name: SITE.name,
    description: SITE.description,
    url: absoluteUrl('/'),
    email: SITE.email,
    slogan: SITE.tagline,
    contactPoint: [contactPoint],
  }
  if (SITE.phone) node.telephone = SITE.phone
  if (SITE.address) node.address = { '@type': 'PostalAddress', streetAddress: SITE.address }
  if (SITE.ogImage) node.image = absoluteUrl(SITE.ogImage)
  if (SITE.social.length) node.sameAs = SITE.social.map((s) => s.url)
  return node
}

function breadcrumbs(trail: Array<{ name: string; path: string }>): object {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}

function graph(nodes: object[]): object {
  return { '@context': 'https://schema.org', '@graph': [organization(), ...nodes] }
}

/* Per-page heads ----------------------------------------------------------- */

export function headForRoute(route: SiteRoute): PageHead {
  const path = normalizePath(routePath(route))

  switch (route.kind) {
    case 'home':
      return {
        title: titleFor(null),
        description: SITE.description,
        path,
        keywords: ['academic documents', 'university certificate', 'MOI certificate', 'transcript', SITE.name],
        jsonLd: [
          graph([
            {
              '@type': 'WebSite',
              '@id': `${absoluteUrl('/')}#website`,
              name: SITE.name,
              url: absoluteUrl('/'),
              publisher: { '@id': ORG_ID },
            },
            {
              '@type': 'ItemList',
              name: 'Services',
              itemListElement: SERVICES.map((s, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                name: s.name,
                url: absoluteUrl(servicePath(s.slug)),
              })),
            },
          ]),
        ],
      }

    case 'services':
      return {
        title: titleFor('Services'),
        description: `Document and application services from ${SITE.name}: ${SERVICES.map((s) => s.name).join(', ')}.`,
        path,
        keywords: SERVICES.flatMap((s) => s.keywords),
        jsonLd: [
          graph([
            breadcrumbs([
              { name: 'Home', path: '/' },
              { name: 'Services', path },
            ]),
            {
              '@type': 'ItemList',
              name: 'Services',
              itemListElement: SERVICES.map((s, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                name: s.name,
                description: s.summary,
                url: absoluteUrl(servicePath(s.slug)),
              })),
            },
          ]),
        ],
      }

    case 'service': {
      const s = route.service
      return {
        title: titleFor(s.name),
        description: s.summary,
        path,
        keywords: s.keywords,
        jsonLd: [
          graph([
            breadcrumbs([
              { name: 'Home', path: '/' },
              { name: 'Services', path: '/services' },
              { name: s.name, path },
            ]),
            {
              '@type': 'Service',
              '@id': `${absoluteUrl(path)}#service`,
              name: s.name,
              description: s.summary,
              url: absoluteUrl(path),
              serviceType: s.name,
              provider: { '@id': ORG_ID },
              hasOfferCatalog: {
                '@type': 'OfferCatalog',
                name: `What ${s.name} includes`,
                itemListElement: s.includes.map((item) => ({
                  '@type': 'Offer',
                  itemOffered: { '@type': 'Service', name: item },
                })),
              },
            },
          ]),
        ],
      }
    }

    case 'team':
      return {
        title: titleFor('Team'),
        description: `The people behind ${SITE.name} and what each of them handles.`,
        path,
        keywords: ['team', 'consultants', SITE.name],
        jsonLd: [
          graph([
            breadcrumbs([
              { name: 'Home', path: '/' },
              { name: 'Team', path },
            ]),
            {
              '@type': 'ItemList',
              name: 'Team',
              itemListElement: TEAM.map((m, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                item: {
                  '@type': 'Person',
                  name: m.name,
                  jobTitle: m.role,
                  worksFor: { '@id': ORG_ID },
                },
              })),
            },
          ]),
        ],
      }

    case 'testimonials':
      return {
        title: titleFor('Testimonials'),
        description: `What clients say about working with ${SITE.name}.`,
        path,
        keywords: ['testimonials', 'client feedback', SITE.name],
        // No `Review` or `AggregateRating` node, on purpose. Rich-result stars
        // are only honest once the quotes on the page are real and consented
        // to, and structured data is exactly the wrong place to discover that
        // the sample content shipped to production. Add them yourself, from
        // real reviews, if you want the stars.
        jsonLd: [
          graph([
            breadcrumbs([
              { name: 'Home', path: '/' },
              { name: 'Testimonials', path },
            ]),
          ]),
        ],
      }

    case 'contact':
      return {
        title: titleFor('Contact'),
        description: `Send ${SITE.name} the requirement you are working to and get a written answer within one working day.`,
        path,
        keywords: ['contact', 'enquiry', SITE.name],
        jsonLd: [
          graph([
            breadcrumbs([
              { name: 'Home', path: '/' },
              { name: 'Contact', path },
            ]),
            {
              '@type': 'ContactPage',
              name: `Contact ${SITE.name}`,
              url: absoluteUrl(path),
            },
            {
              '@type': 'FAQPage',
              mainEntity: FAQS.map((f) => ({
                '@type': 'Question',
                name: f.question,
                acceptedAnswer: { '@type': 'Answer', text: f.answer },
              })),
            },
          ]),
        ],
      }

    case 'not-found':
      return {
        title: titleFor('Page not found'),
        description: 'That page does not exist.',
        path,
        keywords: [],
        robots: 'noindex, follow',
        jsonLd: [],
      }
  }
}

/* Serialising -------------------------------------------------------------- */

function escapeAttribute(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * `</script>` inside a JSON string would close the block that contains it, so
 * every `<` is escaped as `\u003c` — still valid JSON, and no longer able to
 * end the element early.
 */
function escapeJsonLd(value: object): string {
  return JSON.stringify(value).replace(/</g, '\\u003c')
}

/** The head of a prerendered page, as HTML. */
export function renderHeadTags(head: PageHead): string {
  const url = absoluteUrl(head.path)
  const image = SITE.ogImage ? absoluteUrl(SITE.ogImage) : ''

  const tags = [
    `<title>${escapeAttribute(head.title)}</title>`,
    `<meta name="description" content="${escapeAttribute(head.description)}" />`,
    head.keywords.length
      ? `<meta name="keywords" content="${escapeAttribute([...new Set(head.keywords)].join(', '))}" />`
      : '',
    head.robots ? `<meta name="robots" content="${escapeAttribute(head.robots)}" />` : '',
    // A canonical on the 404 would nominate it as the preferred version of
    // whatever address it was served for, which is the opposite of the truth.
    head.robots ? '' : `<link rel="canonical" href="${escapeAttribute(url)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${escapeAttribute(SITE.name)}" />`,
    `<meta property="og:title" content="${escapeAttribute(head.title)}" />`,
    `<meta property="og:description" content="${escapeAttribute(head.description)}" />`,
    // Open Graph requires an absolute URL, so this waits for `SITE.url`.
    // A relative one is not a lenient version of the tag; it is an invalid tag.
    SITE.url ? `<meta property="og:url" content="${escapeAttribute(url)}" />` : '',
    image ? `<meta property="og:image" content="${escapeAttribute(image)}" />` : '',
    `<meta name="twitter:card" content="${image ? 'summary_large_image' : 'summary'}" />`,
    `<meta name="twitter:title" content="${escapeAttribute(head.title)}" />`,
    `<meta name="twitter:description" content="${escapeAttribute(head.description)}" />`,
    image ? `<meta name="twitter:image" content="${escapeAttribute(image)}" />` : '',
    ...head.jsonLd.map(
      (node) => `<script type="application/ld+json">${escapeJsonLd(node)}</script>`,
    ),
  ]

  return tags.filter(Boolean).join('\n    ')
}

/* Applying to the live document -------------------------------------------- */

/**
 * Everything this module writes is marked, so that a client-side navigation can
 * clear the previous page's head without touching the tags that were in
 * `index.html` to begin with.
 */
const OWNED = 'data-head'

function upsertMeta(selector: string, attrs: Record<string, string>): void {
  let el = document.head.querySelector<HTMLElement>(selector)
  if (!el) {
    el = document.createElement(selector.startsWith('link') ? 'link' : 'meta')
    el.setAttribute(OWNED, '')
    document.head.appendChild(el)
  }
  for (const [name, value] of Object.entries(attrs)) el.setAttribute(name, value)
}

export function applyHead(head: PageHead): void {
  const url = absoluteUrl(head.path)
  const image = SITE.ogImage ? absoluteUrl(SITE.ogImage) : ''

  document.title = head.title
  upsertMeta('meta[name="description"]', { name: 'description', content: head.description })
  if (head.robots) document.head.querySelector('link[rel="canonical"]')?.remove()
  else upsertMeta('link[rel="canonical"]', { rel: 'canonical', href: url })
  upsertMeta('meta[property="og:type"]', { property: 'og:type', content: 'website' })
  upsertMeta('meta[property="og:site_name"]', { property: 'og:site_name', content: SITE.name })
  upsertMeta('meta[property="og:title"]', { property: 'og:title', content: head.title })
  upsertMeta('meta[property="og:description"]', {
    property: 'og:description',
    content: head.description,
  })
  if (SITE.url) upsertMeta('meta[property="og:url"]', { property: 'og:url', content: url })
  else document.head.querySelector('meta[property="og:url"]')?.remove()
  upsertMeta('meta[name="twitter:card"]', {
    name: 'twitter:card',
    content: image ? 'summary_large_image' : 'summary',
  })
  upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: head.title })
  upsertMeta('meta[name="twitter:description"]', {
    name: 'twitter:description',
    content: head.description,
  })

  const keywords = [...new Set(head.keywords)].join(', ')
  if (keywords) upsertMeta('meta[name="keywords"]', { name: 'keywords', content: keywords })
  else document.head.querySelector('meta[name="keywords"]')?.remove()

  if (head.robots) upsertMeta('meta[name="robots"]', { name: 'robots', content: head.robots })
  else document.head.querySelector('meta[name="robots"]')?.remove()

  if (image) {
    upsertMeta('meta[property="og:image"]', { property: 'og:image', content: image })
    upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: image })
  }

  // Structured data is replaced wholesale rather than patched: the graph on a
  // service page and the graph on the contact page share no nodes beyond the
  // organisation, so merging them would describe a page that does not exist.
  document.head.querySelectorAll('script[type="application/ld+json"]').forEach((el) => el.remove())
  for (const node of head.jsonLd) {
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.setAttribute(OWNED, '')
    script.textContent = JSON.stringify(node)
    document.head.appendChild(script)
  }
}
