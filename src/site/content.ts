/* ---------------------------------------------------------------------------
   THE ONE FILE TO EDIT.

   Every word, link, phone number and person on the public website comes from
   here. Nothing else in `src/site/` hard-codes copy, so re-pointing the site at
   a different business is an edit to this file and nothing more.

   Deliberately free of React and of `import.meta.env`: `vite.config.ts` imports
   this module in Node to build `sitemap.xml`, and the prerenderer imports it to
   write one HTML file per page. Keep it plain data.
   --------------------------------------------------------------------------- */

export interface Social {
  label: string
  url: string
}

export interface SiteConfig {
  /** Trading name, used in the wordmark, page titles and structured data. */
  name: string
  /** Short line under the wordmark and in the footer. */
  tagline: string
  /** One sentence. Becomes the home page meta description. */
  description: string
  /**
   * The public origin, no trailing slash — e.g. `https://www.yourdomain.com`.
   *
   * SET THIS BEFORE LAUNCH. While it is empty the pages still work and still
   * carry a canonical link, but a relative one, and the build cannot write a
   * `sitemap.xml`, because sitemaps must list absolute URLs. `npm run build`
   * prints a warning naming this line while it is unset.
   */
  url: string
  email: string
  /** Leave any of these empty and the row simply does not render. */
  phone: string
  /** Digits only, with country code — `8801XXXXXXXXX`. Empty hides the button. */
  whatsapp: string
  address: string
  hours: string
  /**
   * Path or absolute URL of the image social networks show when a page is
   * shared, e.g. `/og-image.png`. 1200x630 is the size every platform crops
   * from. Empty simply omits the tag, which is better than pointing at a file
   * that is not there.
   */
  ogImage: string
  social: Social[]
}

export const SITE: SiteConfig = {
  name: 'Education Service 40',
  tagline: 'Academic document and admission support',
  description:
    'Help with university certificates, transcripts, recommendation letters and Medium of Instruction certificates — prepared correctly, tracked to issue, and ready for the institution that asked for them.',
  url: '',
  email: 'educationservice40@gmail.com',
  phone: '',
  whatsapp: '',
  address: '',
  hours: 'Saturday to Thursday, 10:00–19:00 (Dhaka time)',
  ogImage: '',
  social: [],
}

/* Services ----------------------------------------------------------------- */

export interface Service {
  /** URL segment. Changing it changes the page's address. */
  slug: string
  name: string
  /** One line, shown on cards and in the navigation. */
  tagline: string
  /** One or two sentences. Becomes the page's meta description. */
  summary: string
  /** Body copy for the service page, one string per paragraph. */
  body: string[]
  /** "What's included" — the concrete deliverables. */
  includes: string[]
  /** Realistic, not promised: shown as a plain line, not a guarantee. */
  turnaround: string
  /** What the client has to bring. */
  requirements: string[]
  /**
   * A Google Drive folder or file, opened in a new tab from the service page.
   *
   * Paste the *share* URL — `https://drive.google.com/drive/folders/<id>` for a
   * folder, `https://drive.google.com/file/d/<id>/view` for a single file — and
   * set that item's sharing to "Anyone with the link · Viewer", or visitors
   * will land on a Google sign-in wall.
   *
   * Left empty, the page shows a quiet "not published yet" note instead of a
   * link that goes nowhere.
   */
  driveUrl: string
  /** Label for the Drive link, e.g. "Sample formats and checklist". */
  driveLabel: string
  /** Free-text keywords folded into the page's meta keywords. */
  keywords: string[]
  /** One of the keys in `src/site/icons.tsx`. */
  icon: 'certificate' | 'transcript' | 'letter' | 'language' | 'stamp' | 'folder'
}

export const SERVICES: Service[] = [
  {
    slug: 'university-certificates',
    name: 'University Certificates',
    tagline: 'Provisional, original and duplicate certificates, requested and followed up.',
    summary:
      'Support for requesting provisional, original and duplicate certificates from your university or board, from the first application form to collection.',
    body: [
      'Certificates are issued by your university or board — never by us. What we do is make the request clean the first time: the right form, the right fee route, the right supporting papers, and the right person to hand it to. Most delays are not queues; they are a form that came back for a missing signature.',
      'We check your name, roll, registration and session against your existing documents before anything is submitted, because a spelling that disagrees with your passport is the single most common reason a certificate has to be re-issued later.',
      'Once the application is in, you get a written note of where it stands and what happens next, so you are not guessing between visits.',
    ],
    includes: [
      'Eligibility and document check before you apply',
      'Application forms completed and reviewed with you',
      'Guidance on fees, payment slips and where they are paid',
      'Follow-up until the certificate is issued',
      'A scanned copy for your own records on collection',
    ],
    turnaround:
      'Depends entirely on the issuing institution — typically a few weeks. We tell you what the office is quoting rather than a number of our own.',
    requirements: [
      'A photo or scan of your admit card, registration card or previous certificate',
      'National ID or birth certificate',
      'Your passport, if the document is for use abroad',
    ],
    driveUrl: '',
    driveLabel: 'Application forms and document checklist',
    keywords: ['university certificate', 'provisional certificate', 'duplicate certificate', 'Bangladesh'],
    icon: 'certificate',
  },
  {
    slug: 'academic-transcripts',
    name: 'Academic Transcripts & Mark Sheets',
    tagline: 'Semester-wise transcripts and consolidated mark sheets, sealed where required.',
    summary:
      'Requesting semester-wise transcripts, consolidated mark sheets and sealed envelopes from your institution, in the format the receiving university expects.',
    body: [
      'Universities abroad rarely want "a transcript" — they want a specific thing: consolidated or semester-wise, attested or not, in a sealed and signed envelope, sometimes sent directly by the issuing office. Asking for the wrong one costs a full cycle.',
      'Tell us who is receiving it and we work backwards from their published requirement to the request your institution actually needs to see.',
      'Where a sealed envelope is required, we make sure it stays sealed and that the flap carries the signature and stamp the receiving side will look for.',
    ],
    includes: [
      'Reading the receiving institution’s stated format before applying',
      'Semester-wise or consolidated request, as required',
      'Sealed and signed envelopes where the receiver demands them',
      'Extra sets ordered in the same visit, which is cheaper than a second application',
      'Digital copies for your application portal',
    ],
    turnaround:
      'Usually shorter than a certificate — often one to three weeks, set by the examination office.',
    requirements: [
      'Roll, registration number and session',
      'The receiving institution’s transcript requirement, if you have it in writing',
      'Number of sets you need',
    ],
    driveUrl: '',
    driveLabel: 'Transcript request formats and samples',
    keywords: ['academic transcript', 'mark sheet', 'sealed transcript', 'consolidated transcript'],
    icon: 'transcript',
  },
  {
    slug: 'recommendation-letters',
    name: 'Recommendation Letters',
    tagline: 'Helping your referees write letters that actually say something.',
    summary:
      'Guidance and drafting support for academic and professional recommendation letters — structure, evidence and tone, written with your referee, not instead of them.',
    body: [
      'A recommendation letter has to come from your referee. Ours is the work around it: helping you approach the right teacher or manager, giving them a brief they can actually use, and making sure the finished letter is on letterhead, signed, dated and verifiable.',
      'We will not write a letter in someone else’s name or sign for them. What we will do is turn "can you write me a recommendation" into a one-page brief listing the courses you took with them, the marks, the projects, and the two or three specific things worth saying — which is what busy referees are short of, and why generic letters happen.',
      'We also check the letter against the receiving university’s requirements: how many are needed, whether they must be uploaded by the referee, and what the portal expects.',
    ],
    includes: [
      'A referee brief tailored to each recommender',
      'Structure and content review of the draft they write',
      'Letterhead, signature, date and contact-detail check',
      'Portal submission guidance, including referee-uploaded letters',
      'Tracking of which referee has submitted where',
    ],
    turnaround:
      'Two to seven days for the brief and review. The letter itself moves at your referee’s pace.',
    requirements: [
      'Your CV or academic record',
      'The names and positions of your intended referees',
      'The programme and university you are applying to',
    ],
    driveUrl: '',
    driveLabel: 'Referee brief template and letter structure guide',
    keywords: ['recommendation letter', 'letter of recommendation', 'LOR', 'referee'],
    icon: 'letter',
  },
  {
    slug: 'medium-of-instruction',
    name: 'Medium of Instruction (MOI)',
    tagline: 'The English-medium certificate that can replace an IELTS requirement.',
    summary:
      'Applying for a Medium of Instruction certificate from your university, in the wording that satisfies universities accepting MOI in place of an English test.',
    body: [
      'An MOI certificate states that your degree was taught and examined in English. A number of universities accept it instead of IELTS or TOEFL — but only when the wording is right, and a surprising number of MOI letters are rejected for saying too little.',
      'A letter that will pass names the programme, the years, and states plainly that the medium of instruction and the medium of examination were both English. It sits on university letterhead with a signature, a stamp and a verifiable contact. We make sure the request your registrar receives asks for exactly that.',
      'Before you apply, we check whether your target university actually accepts MOI, and under what conditions — some accept it only above a certain grade, some only for specific countries, and some not at all.',
    ],
    includes: [
      'Confirming your target university accepts MOI, in writing where published',
      'A model wording for your registrar to work from',
      'Application submitted and followed up',
      'Check of letterhead, stamp, signature and verification contact',
      'A scanned copy formatted for application portals',
    ],
    turnaround: 'Often one to three weeks, depending on the registrar’s office.',
    requirements: [
      'Your degree certificate or transcript',
      'The university and programme you are applying to',
      'Their English-language requirement page, if you have the link',
    ],
    driveUrl: '',
    driveLabel: 'MOI wording samples and accepting-university notes',
    keywords: ['medium of instruction', 'MOI certificate', 'English medium certificate', 'IELTS waiver'],
    icon: 'language',
  },
  {
    slug: 'document-attestation',
    name: 'Document Attestation & Verification',
    tagline: 'Board, ministry and embassy attestation, in the right order.',
    summary:
      'Getting academic documents attested by the board or university, the Ministry of Education and Foreign Affairs, and the relevant embassy — in the sequence each step requires.',
    body: [
      'Attestation is a chain, and the order is not negotiable: the issuing board or university first, then the Ministry of Education, then Foreign Affairs, then the embassy. Arriving at step three without step two is the most common wasted trip there is.',
      'We map the chain your specific destination requires — it differs by country — tell you what each step costs and how long it takes, and prepare the set of copies each desk keeps.',
      'Originals stay with you unless a step physically requires them, and when it does you know in advance which day you will be without them.',
    ],
    includes: [
      'The exact attestation chain for your destination country',
      'Correctly prepared photocopy sets for each desk',
      'Fees and payment method for every stage',
      'Submission and collection, with status updates',
      'Final check that every required stamp is present before you travel',
    ],
    turnaround:
      'A full chain commonly runs two to six weeks, and is set by the offices involved rather than by us.',
    requirements: [
      'Original certificates and transcripts',
      'Passport copy',
      'The destination country and the purpose — study, work or migration',
    ],
    driveUrl: '',
    driveLabel: 'Attestation chain checklists by country',
    keywords: ['attestation', 'document verification', 'ministry attestation', 'embassy attestation'],
    icon: 'stamp',
  },
  {
    slug: 'application-documents',
    name: 'Application Document Pack',
    tagline: 'Every other paper an application asks for, assembled once and correctly.',
    summary:
      'The rest of the file: statement of purpose review, CV, experience letters, bank and sponsorship papers, and a single organised pack ready for upload.',
    body: [
      'Most applications fail on the supporting file rather than on the grades. A statement that reads like a template, an experience letter with no company details, a bank statement in the wrong name — each is enough to stall a decision.',
      'We go through the receiving institution’s checklist line by line, tell you which of your documents will not pass and why, and help you fix them before submission rather than after a rejection.',
      'The result is one folder, named consistently, with every file in the format the portal accepts.',
    ],
    includes: [
      'Line-by-line check against the institution’s own checklist',
      'Statement of purpose and CV structure review',
      'Experience and employment letter formats',
      'Financial and sponsorship document guidance',
      'A single, consistently named upload-ready folder',
    ],
    turnaround: 'Three to ten days, depending on how much of the pack already exists.',
    requirements: [
      'The application checklist from the institution',
      'Whatever documents you already hold, in any quality',
      'Your deadline',
    ],
    driveUrl: '',
    driveLabel: 'Document pack checklist and naming convention',
    keywords: ['statement of purpose', 'application documents', 'CV', 'experience letter'],
    icon: 'folder',
  },
]

export function serviceBySlug(slug: string): Service | undefined {
  return SERVICES.find((s) => s.slug === slug)
}

/* How it works ------------------------------------------------------------- */

export interface Step {
  title: string
  detail: string
}

export const STEPS: Step[] = [
  {
    title: 'Tell us what is being asked for',
    detail:
      'Send the requirement in whatever form you have it — a screenshot of the portal, an email, a checklist. The requirement decides everything downstream.',
  },
  {
    title: 'We check what you already hold',
    detail:
      'Names, dates, roll and registration numbers are compared across your documents and your passport. Mismatches are fixed before they become re-issues.',
  },
  {
    title: 'The request goes in, correctly',
    detail:
      'Forms completed, fees routed, supporting papers attached. One submission rather than three attempts.',
  },
  {
    title: 'You are told where it stands',
    detail:
      'A written update at each stage, and the finished document handed over with a scan kept for your records.',
  },
]

/* Team --------------------------------------------------------------------- */

export interface TeamMember {
  name: string
  role: string
  bio: string
  /** Shown as a small list of specialities under the bio. */
  focus: string[]
  /** Optional image in `public/`, e.g. `/team/asha.jpg`. Empty draws initials. */
  photo: string
  email: string
}

/**
 * PLACEHOLDER PEOPLE — replace before launch.
 *
 * These entries are written so that nobody could mistake them for real staff.
 * Publishing invented colleagues on a real business site is a lie that is very
 * easy to tell by accident, so the defaults refuse to be plausible.
 */
export const TEAM: TeamMember[] = [
  {
    name: 'Your name here',
    role: 'Founder and lead consultant',
    bio: 'Replace this with two or three sentences: how long you have been doing this, which institutions you deal with most often, and what you are personally responsible for in a case.',
    focus: ['University certificates', 'Attestation'],
    photo: '',
    email: '',
  },
  {
    name: 'Team member name',
    role: 'Documents and follow-up',
    bio: 'Replace this with a short description of what this person handles day to day. Delete the whole entry if you work alone — the page lays out correctly with a single card.',
    focus: ['Transcripts', 'MOI'],
    photo: '',
    email: '',
  },
]

/* Testimonials ------------------------------------------------------------- */

export interface Testimonial {
  quote: string
  name: string
  /** Programme, destination or city — whatever identifies them safely. */
  role: string
  /** Slug of the related service, or '' for none. */
  service: string
}

/**
 * PLACEHOLDER TESTIMONIALS — replace before launch, with permission.
 *
 * Same reasoning as TEAM, and it matters more here: an invented review is a
 * fabricated record, and in several jurisdictions an illegal one. For that
 * reason the site deliberately emits no `Review` or `AggregateRating`
 * structured data — see `seo.ts`. Delete this array entirely and the
 * testimonials page renders a clean empty state rather than breaking.
 */
export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      'Replace this with a real quote from a client who has agreed in writing to be quoted. Keep it specific — what they needed, what was hard about it, and what actually happened.',
    name: 'Client name',
    role: 'Programme, destination',
    service: 'university-certificates',
  },
  {
    quote:
      'A second sample slot. Two or three genuine quotes read better than a wall of them, and a page with three real testimonials is worth more than one with twelve invented ones.',
    name: 'Client name',
    role: 'Programme, destination',
    service: 'medium-of-instruction',
  },
  {
    quote:
      'Delete any slot you do not fill. The grid reflows for one, two or many, and the page shows a short note instead if the list is empty.',
    name: 'Client name',
    role: 'Programme, destination',
    service: '',
  },
]

/* FAQ ---------------------------------------------------------------------- */

export interface Faq {
  question: string
  answer: string
}

/** Rendered on the contact page and published as FAQPage structured data. */
export const FAQS: Faq[] = [
  {
    question: 'Do you issue certificates yourselves?',
    answer:
      'No. Every document is issued by your university, board, ministry or embassy. We prepare and submit the request, follow it up, and check the result before you rely on it.',
  },
  {
    question: 'How much does it cost?',
    answer:
      'It depends on the service and on the institution’s own fees, which we pass on unchanged. Send us the requirement and you will get a written quote separating our fee from the office fees before anything starts.',
  },
  {
    question: 'Do I have to be in Dhaka?',
    answer:
      'No. Most cases run over email and messaging. Where a step needs an original document or your physical presence, we tell you at the start rather than halfway through.',
  },
  {
    question: 'Will an MOI certificate really replace IELTS?',
    answer:
      'Sometimes. It depends on the receiving university, and it is the first thing we check — in their published requirements — before you spend anything on an MOI application.',
  },
  {
    question: 'How quickly do you reply?',
    answer:
      'Within one working day. If a message has not been answered in two, it did not arrive; send it again.',
  },
]
