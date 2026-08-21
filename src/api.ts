import type {
  ActivePublications,
  CaptchaChallenge,
  Curriculum,
  ResultQuery,
  ResultResponse,
} from './types'

/**
 * Same-origin by default: in development Vite proxies `/api/public` to the
 * board, in production a reverse proxy does. Set `VITE_API_BASE` to point at
 * the upstream directly when the app is served without one.
 */
const API_BASE = import.meta.env.VITE_API_BASE ?? '/api/public'

async function parse<T>(response: Response): Promise<T> {
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const text = await response.text()
  return (text ? JSON.parse(text) : null) as T
}

function get<T>(path: string): Promise<T> {
  return fetch(API_BASE + path, {
    headers: { Accept: 'application/json' },
  }).then((r) => parse<T>(r))
}

function post<T>(path: string, body: unknown): Promise<T> {
  return fetch(API_BASE + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  }).then((r) => parse<T>(r))
}

export const api = {
  curriculums: () => get<Curriculum[]>('/curriculums'),
  captcha: () => get<CaptchaChallenge>('/captcha'),
  activePublications: () => get<ActivePublications>('/active-publications'),
  result: (query: ResultQuery) => post<ResultResponse>('/result', query),
}
