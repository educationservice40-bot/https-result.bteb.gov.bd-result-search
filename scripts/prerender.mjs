/* ---------------------------------------------------------------------------
   Writes one static HTML file per public page.

   The website is a React app, but a React app that ships an empty `<div>` and
   fills it in later is a bad thing to hand a crawler, a link preview, or a
   visitor on a slow connection. So after the normal build, every address the
   site answers on is rendered to markup here and written to its own file, with
   its own `<title>`, description, canonical link and structured data. The same
   bundle then hydrates that markup in the browser, and navigation stays
   instant.

   Run by `npm run build`, after `vite build` and `vite build --ssr`.
   --------------------------------------------------------------------------- */

import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const DIST = join(root, 'dist')
const SSR_DIST = join(root, 'dist-ssr')

/** Addresses served by the result portal, which is not prerendered. */
const PORTAL_SHELLS = ['/result-search', '/result-search/result']

async function ssrEntry() {
  const files = await readdir(SSR_DIST)
  const entry = files.find((f) => f.startsWith('entry-server') && f.endsWith('.js'))
  if (!entry) {
    throw new Error(
      `No entry-server bundle in ${SSR_DIST}. Did "vite build --ssr" run?`,
    )
  }
  return import(pathToFileURL(join(SSR_DIST, entry)).href)
}

/**
 * `/services/team` becomes `dist/services/team/index.html`, so a static host
 * serves it at the address it was rendered for without any rewrite rules.
 */
function fileFor(path) {
  const clean = path.replace(/^\/+|\/+$/g, '')
  return clean ? join(DIST, clean, 'index.html') : join(DIST, 'index.html')
}

function withHead(template, headTags) {
  const start = template.indexOf('<!--seo-->')
  const end = template.indexOf('<!--/seo-->')
  if (start === -1 || end === -1) {
    throw new Error('index.html is missing its <!--seo--> markers.')
  }
  return (
    template.slice(0, start) +
    headTags +
    template.slice(end + '<!--/seo-->'.length)
  )
}

/**
 * The path is stamped onto the root element so the browser can tell whether the
 * markup it received belongs to the address it is on. A static host that falls
 * back to `index.html` for an unknown path would otherwise hand the home page's
 * markup to a page that is not the home page, and React would hydrate one tree
 * onto another.
 */
function withBody(template, html, path) {
  const anchor = '<div id="root"></div>'
  if (!template.includes(anchor)) {
    throw new Error('index.html no longer contains <div id="root"></div>.')
  }
  return template.replace(
    anchor,
    `<div id="root" data-prerendered="${path}">${html}</div>`,
  )
}

async function write(path, contents) {
  await mkdir(dirname(path), { recursive: true })
  await writeFile(path, contents, 'utf8')
}

function sitemap(paths, origin) {
  const today = new Date().toISOString().slice(0, 10)
  const urls = paths
    .map((path) => {
      const loc = `${origin}${path === '/' ? '/' : path}`
      // Home first, then services, then the rest — priority is only a hint, but
      // an honest one costs nothing.
      const priority = path === '/' ? '1.0' : path.startsWith('/services') ? '0.8' : '0.6'
      return [
        '  <url>',
        `    <loc>${loc}</loc>`,
        `    <lastmod>${today}</lastmod>`,
        `    <priority>${priority}</priority>`,
        '  </url>',
      ].join('\n')
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`
}

function robots(origin) {
  const lines = ['User-agent: *', 'Allow: /', '']
  if (origin) lines.push(`Sitemap: ${origin}/sitemap.xml`, '')
  return lines.join('\n')
}

async function main() {
  const { renderPage, indexablePaths, SITE } = await ssrEntry()
  const template = await readFile(join(DIST, 'index.html'), 'utf8')

  const paths = indexablePaths()
  for (const path of paths) {
    const { head, html } = renderPage(path)
    await write(fileFor(path), withBody(withHead(template, head), html, path))
  }

  // The 404 is rendered too, so a host that serves `404.html` for unknown
  // addresses shows the site rather than its own grey error page. It carries
  // `noindex`, which is why it is not in the sitemap.
  const notFound = renderPage('/404')
  await write(
    join(DIST, '404.html'),
    withBody(withHead(template, notFound.head), notFound.html, '/404'),
  )

  // The result portal ships as the untouched shell: it is a form over a live
  // API with nothing to say until it has asked, so there is no markup worth
  // rendering ahead of time.
  for (const path of PORTAL_SHELLS) await write(fileFor(path), template)

  const origin = SITE.url ? SITE.url.replace(/\/+$/, '') : ''
  await write(join(DIST, 'robots.txt'), robots(origin))

  if (origin) {
    await write(join(DIST, 'sitemap.xml'), sitemap(paths, origin))
  } else {
    console.warn(
      '\n  ! No sitemap.xml was written: SITE.url is empty in src/site/content.ts.\n' +
        '    Sitemaps must list absolute URLs, so set it to your public origin\n' +
        '    (e.g. https://www.yourdomain.com) and build again.\n',
    )
  }

  await rm(SSR_DIST, { recursive: true, force: true })

  console.log(
    `  prerendered ${paths.length} pages + 404${origin ? ', sitemap.xml' : ''}, robots.txt`,
  )
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
