// Both marks live in public/ and are referenced by URL rather than imported:
// they are fixed, root-level assets of the portal, served at the same paths the
// board serves them from.
const BTEB_MARK = '/bteb_mark.png'
const GOVT_SEAL = '/govt_seal.png'

/**
 * The fixed head of the document. It is the same on the search page and on the
 * result sheet at the same width, which is what makes the result read as the
 * next page of one document rather than a different site.
 *
 * The two marks are the board's own on the left and the national emblem on the
 * right. Both carry width and height attributes so the letterhead reserves
 * their space before they load and the four lines between them do not jump,
 * and both hide their own box if the file fails to arrive — a broken-image
 * icon in a letterhead looks worse than the gap it would leave.
 */
const hideOnError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  const box = e.currentTarget.parentElement
  if (box) box.style.visibility = 'hidden'
}

export function Masthead() {
  return (
    <header className="masthead">
      <div className="masthead-mark">
        <img
          src={BTEB_MARK}
          width={125}
          height={144}
          alt="Bangladesh Technical Education Board"
          onError={hideOnError}
        />
      </div>

      <div className="masthead-titles">
        <p className="masthead-country">Government of the People’s Republic of Bangladesh</p>
        <h1 className="masthead-board">Bangladesh Technical Education Board</h1>
        <p className="masthead-address">Agargaon, Sher-e-Bangla Nagar, Dhaka&nbsp;1207</p>
        <p className="masthead-service">Result Search</p>
      </div>

      <div className="masthead-mark">
        <img
          src={GOVT_SEAL}
          width={144}
          height={143}
          alt="Government of the People’s Republic of Bangladesh"
          onError={hideOnError}
        />
      </div>
    </header>
  )
}
