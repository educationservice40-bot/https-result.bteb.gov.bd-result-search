import type { Service } from './content'

/* ---------------------------------------------------------------------------
   Six line icons, drawn inline rather than fetched.

   They are decorative — every one sits beside a heading that already says the
   same thing — so each is hidden from assistive technology rather than given a
   label that would be read out twice.
   --------------------------------------------------------------------------- */

const PATHS: Record<Service['icon'], string> = {
  certificate:
    'M4 4h16v11H4z M8 19l4-2 4 2v-4H8z M8 8h8 M8 11h5',
  transcript: 'M6 3h9l4 4v14H6z M15 3v4h4 M9 12h7 M9 15h7 M9 18h4',
  letter: 'M3 6h18v13H3z M3 6l9 7 9-7',
  language: 'M4 6h9 M8 4v2 M8 6c0 4-2 7-5 9 M6 11c1 3 3 5 6 6 M13 20l4-10 4 10 M14.6 17h4.8',
  stamp: 'M8 4h8v5a4 4 0 0 1-8 0z M5 15h14v4H5z M12 13v2',
  folder: 'M3 6h6l2 2h10v11H3z M3 11h18',
}

export function ServiceIcon({ name, className }: { name: Service['icon']; className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name].split(' M').map((segment, i) => (
        <path key={i} d={i === 0 ? segment : `M${segment}`} />
      ))}
    </svg>
  )
}

export function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  )
}

export function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M4 12.5l5 5L20 6.5" />
    </svg>
  )
}

/** The little outbound arrow on links that leave the site. */
export function ExternalIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M14 4h6v6" />
      <path d="M20 4l-9 9" />
      <path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
    </svg>
  )
}
