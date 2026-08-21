/** Formats a GPA-like value to two decimals, leaving non-numeric text alone. */
export function gpa(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return '—'
  const n = typeof value === 'number' ? value : parseFloat(value)
  return Number.isNaN(n) ? String(value) : n.toFixed(2)
}

/** Renders a missing cell as an em dash rather than as blank space. */
export function cell(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return '—'
  return String(value)
}

const PASSING = new Set(['PASS', 'PASSED', 'P'])

export function isPass(status: string | null | undefined): boolean {
  return PASSING.has((status ?? '').trim().toUpperCase())
}

/** Dhaka time, because that is the clock the result was published on. */
export function generatedOn(now: Date = new Date()): string {
  const date = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Dhaka',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(now)
  const time = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Dhaka',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(now)
  return `Generated on ${date} at ${time.toUpperCase()}`
}
