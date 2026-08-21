/**
 * The fixed head of the document. It is the same on the search page and on the
 * result sheet at the same width, which is what makes the result read as the
 * next page of one document rather than a different site.
 */
export function Masthead() {
  return (
    <header className="masthead">
      <div className="masthead-mark" aria-hidden="true">
        <svg viewBox="0 0 48 48" width="46" height="46" role="img">
          <circle
            cx="24"
            cy="24"
            r="21"
            fill="none"
            stroke="#1B5E38"
            strokeWidth="2"
          />
          <path
            d="M14 30V18l10-6 10 6v12"
            fill="none"
            stroke="#1B5E38"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path d="M19 30v-7h10v7" fill="none" stroke="#1B5E38" strokeWidth="2" />
        </svg>
      </div>

      <div className="masthead-titles">
        <p className="masthead-country">Government of the People&rsquo;s Republic of Bangladesh</p>
        <h1 className="masthead-board">Bangladesh Technical Education Board</h1>
        <p className="masthead-address">Agargaon, Sher-e-Bangla Nagar, Dhaka&nbsp;1207</p>
        <p className="masthead-service">Result Search</p>
      </div>

      <div className="masthead-mark" aria-hidden="true">
        <svg viewBox="0 0 48 48" width="46" height="46" role="img">
          <circle cx="24" cy="24" r="21" fill="none" stroke="#1B5E38" strokeWidth="2" />
          <circle cx="24" cy="22" r="8" fill="#B22234" />
          <path
            d="M12 38c4-5 8-7 12-7s8 2 12 7"
            fill="none"
            stroke="#1B5E38"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </header>
  )
}
