import { TEAM } from '../content'
import { initials } from '../Layout'
import { CallToAction, PageHeader } from '../pieces'

export function TeamPage() {
  return (
    <>
      <PageHeader
        eyebrow="Team"
        title="Who you will be dealing with"
        lede="A small team, which is the point: the person who takes your case is the person who submits it and the person who answers when you ask where it has got to."
      />

      <section className="section section--tight">
        <div className="shell">
          {TEAM.length === 0 ? (
            <p className="empty-note">Team profiles are on their way.</p>
          ) : (
            <ul className="team-grid">
              {TEAM.map((member) => (
                <li key={member.name}>
                  <article className="team-card">
                    {member.photo ? (
                      <img
                        className="team-photo"
                        src={member.photo}
                        alt={member.name}
                        width={96}
                        height={96}
                        loading="lazy"
                      />
                    ) : (
                      <span className="team-initials" aria-hidden="true">
                        {initials(member.name)}
                      </span>
                    )}
                    <h2 className="team-name">{member.name}</h2>
                    <p className="team-role">{member.role}</p>
                    <p className="team-bio">{member.bio}</p>
                    {member.focus.length > 0 ? (
                      <ul className="team-focus">
                        {member.focus.map((f) => (
                          <li key={f}>{f}</li>
                        ))}
                      </ul>
                    ) : null}
                    {member.email ? (
                      <p className="team-email">
                        <a href={`mailto:${member.email}`}>{member.email}</a>
                      </p>
                    ) : null}
                  </article>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <CallToAction
        title="Talk to us directly"
        body="No call centre and no ticket number. Send a message and one of the people above answers it."
      />
    </>
  )
}
