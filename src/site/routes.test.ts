import { describe, expect, it } from 'vitest'
import { SERVICES } from './content'
import { isCurrent, indexablePaths, normalizePath, resolveRoute, routePath } from './routes'
import { headForRoute, renderHeadTags } from './seo'

describe('normalizePath', () => {
  it('collapses the variants that would otherwise be separate URLs', () => {
    expect(normalizePath('/services/')).toBe('/services')
    expect(normalizePath('//services//')).toBe('/services')
    expect(normalizePath('/Services')).toBe('/services')
    expect(normalizePath('/services?utm_source=x')).toBe('/services')
    expect(normalizePath('/services#top')).toBe('/services')
  })

  it('leaves the root as a single slash rather than an empty string', () => {
    expect(normalizePath('/')).toBe('/')
    expect(normalizePath('')).toBe('/')
    expect(normalizePath('///')).toBe('/')
  })
})

describe('resolveRoute', () => {
  it('resolves the five pages in the navigation', () => {
    expect(resolveRoute('/').kind).toBe('home')
    expect(resolveRoute('/services').kind).toBe('services')
    expect(resolveRoute('/team').kind).toBe('team')
    expect(resolveRoute('/testimonials').kind).toBe('testimonials')
    expect(resolveRoute('/contact').kind).toBe('contact')
  })

  it('resolves every service to its own page', () => {
    for (const service of SERVICES) {
      const route = resolveRoute(`/services/${service.slug}`)
      expect(route).toEqual({ kind: 'service', service })
    }
  })

  it('does not invent a service page for an unknown slug', () => {
    expect(resolveRoute('/services/nope').kind).toBe('not-found')
  })

  it('does not treat a deeper path as a service', () => {
    expect(resolveRoute('/services/university-certificates/extra').kind).toBe('not-found')
  })

  it('resolves through the same normalisation the canonical link uses', () => {
    expect(resolveRoute('/Services/Medium-Of-Instruction/').kind).toBe('service')
  })
})

describe('indexablePaths', () => {
  it('lists every route that resolves to a real page, and nothing else', () => {
    const paths = indexablePaths()
    expect(paths).toHaveLength(5 + SERVICES.length)
    for (const path of paths) {
      expect(resolveRoute(path).kind).not.toBe('not-found')
    }
  })

  it('agrees with each route about its own canonical address', () => {
    for (const path of indexablePaths()) {
      expect(routePath(resolveRoute(path))).toBe(path)
    }
  })

  it('has no duplicates, which would put a page in the sitemap twice', () => {
    const paths = indexablePaths()
    expect(new Set(paths).size).toBe(paths.length)
  })
})

describe('isCurrent', () => {
  const services = { label: 'Services', path: '/services' }

  it('keeps the section lit on the pages beneath it', () => {
    expect(isCurrent(services, '/services')).toBe(true)
    expect(isCurrent(services, '/services/medium-of-instruction')).toBe(true)
  })

  it('does not light a section from an unrelated page', () => {
    expect(isCurrent(services, '/team')).toBe(false)
  })

  it('matches home only at the root, not everywhere below it', () => {
    const home = { label: 'Home', path: '/' }
    expect(isCurrent(home, '/')).toBe(true)
    expect(isCurrent(home, '/services')).toBe(false)
  })
})

describe('page heads', () => {
  it('gives every indexable page a title and a description', () => {
    for (const path of indexablePaths()) {
      const head = headForRoute(resolveRoute(path))
      expect(head.title.length).toBeGreaterThan(10)
      // Under about 160 characters, which is roughly what a result snippet
      // shows before it is cut.
      expect(head.description.length).toBeGreaterThan(40)
      expect(head.robots).toBeUndefined()
    }
  })

  it('gives no two pages the same title', () => {
    const titles = indexablePaths().map((p) => headForRoute(resolveRoute(p)).title)
    expect(new Set(titles).size).toBe(titles.length)
  })

  it('keeps the 404 out of the index', () => {
    const head = headForRoute(resolveRoute('/nope'))
    expect(head.robots).toBe('noindex, follow')
    expect(renderHeadTags(head)).not.toContain('rel="canonical"')
  })

  it('publishes no review or rating structured data', () => {
    // Stars in a search result have to be earned from real, consented reviews.
    // The testimonials page ships with sample quotes, and marking those up
    // would be publishing fabricated ones.
    for (const path of indexablePaths()) {
      const tags = renderHeadTags(headForRoute(resolveRoute(path)))
      expect(tags).not.toContain('AggregateRating')
      expect(tags).not.toContain('"Review"')
    }
  })

  it('cannot be broken out of by content containing a closing script tag', () => {
    const tags = renderHeadTags({
      title: 'x',
      description: '</script><script>alert(1)</script>',
      path: '/',
      keywords: [],
      jsonLd: [{ name: '</script><script>alert(1)</script>' }],
    })
    expect(tags).not.toContain('<script>alert(1)</script>')
    expect(tags).toContain('\\u003c/script')
  })
})
