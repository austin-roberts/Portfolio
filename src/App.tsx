import {
  type FormEvent,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  type ExperienceItem,
  type SkillGroup,
  bio,
  codeFooter,
  developerJson,
  homeExperience,
  hero,
  Page,
  profile,
  projects,
  resumeExperience,
  skillGroups,
} from './data';
import { commands, runCommand, type TerminalResult } from './terminal';

const typeSpeedMs = 42;
const outputSpeedMs = 8;

type TerminalEntry =
  | { kind: 'prompt'; text: string; typed?: boolean }
  | { kind: 'output'; result: TerminalResult; lines: string[] };

export function App() {
  const [page, setPage] = useState<Page>('home');
  const [terminalOpen, setTerminalOpen] = useState(false);

  return (
    <div className="app-shell">
      <div className="workspace">
        <button
          className="terminal-fab"
          aria-label="Open terminal"
          onClick={() => setTerminalOpen(true)}
        >
          $
        </button>
        <TerminalPanel
          open={terminalOpen}
          onClose={() => setTerminalOpen(false)}
          setPage={setPage}
        />
        <main className="site-main">
          <Header page={page} setPage={setPage} />
          {page === 'home' ? (
            <HomePage setPage={setPage} />
          ) : (
            <ExperiencePage setPage={setPage} />
          )}
        </main>
      </div>
    </div>
  );
}

function Header({
  page,
  setPage,
}: {
  page: Page;
  setPage: (page: Page) => void;
}) {
  return (
    <header className="site-header">
      <button className="logo" onClick={() => setPage('home')} aria-label="Home">
        AR
      </button>
      <nav className="nav-links" aria-label="Portfolio pages">
        <button className={page === 'home' ? 'active' : ''} onClick={() => setPage('home')}>
          Home
        </button>
        <button
          className={page === 'experience' ? 'active' : ''}
          onClick={() => setPage('experience')}
        >
          Experience
        </button>
      </nav>
      <a
        className="resume-button"
        href={profile.resumePath ?? '/resume.pdf'}
        aria-label="Download resume"
        download
      >
        Resume <Icon name="download" />
      </a>
    </header>
  );
}

function TerminalPanel({
  open,
  onClose,
  setPage,
}: {
  open: boolean;
  onClose: () => void;
  setPage: (page: Page) => void;
}) {
  const [entries, setEntries] = useState<TerminalEntry[]>([]);
  const [typedCommand, setTypedCommand] = useState('');
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputValueRef = useRef('');
  const busyRef = useRef(true);

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      await typeIntoPrompt('help', setTypedCommand, () => cancelled);

      if (cancelled) {
        return;
      }

      setEntries([{ kind: 'prompt', text: 'help' }]);
      setTypedCommand('');
      await printResult(runCommand('help'), () => cancelled);
    }

    boot();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [entries, typedCommand]);

  useEffect(() => {
    if (!busy) {
      inputRef.current?.focus();
    }
  }, [busy, open]);

  useEffect(() => {
    busyRef.current = busy;
  }, [busy]);

  useEffect(() => {
    function catchGlobalTyping(event: globalThis.KeyboardEvent) {
      if (
        event.defaultPrevented ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        busyRef.current
      ) {
        return;
      }

      if (event.target === inputRef.current) {
        return;
      }

      if (event.key.length === 1) {
        event.preventDefault();
        setTerminalInput(inputValueRef.current + event.key);
        inputRef.current?.focus();
        return;
      }

      if (event.key === 'Backspace') {
        event.preventDefault();
        setTerminalInput(inputValueRef.current.slice(0, -1));
        inputRef.current?.focus();
        return;
      }

      if (event.key === 'Enter') {
        event.preventDefault();
        commitCommand(inputValueRef.current);
        inputRef.current?.focus();
        return;
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        setTerminalInput('');
        inputRef.current?.focus();
      }
    }

    window.addEventListener('keydown', catchGlobalTyping);

    return () => window.removeEventListener('keydown', catchGlobalTyping);
  }, []);

  function focusInput(event: MouseEvent<HTMLElement>) {
    if (event.target instanceof HTMLButtonElement) {
      return;
    }

    inputRef.current?.focus();
  }

  function submitCommand(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    commitCommand(inputRef.current?.value ?? input);
  }

  function commitCommand(rawInput: string) {
    const cleanInput = rawInput.trim();

    if (!cleanInput || busyRef.current) {
      return;
    }

    setEntries((current) => [...current, { kind: 'prompt', text: cleanInput }]);
    setTerminalInput('');
    const result = runCommand(cleanInput);

    if (result.command === 'experience') {
      void printResult({
        ...result,
        lines: [...result.lines, 'Navigating to experience...'],
      }).then(() => setPage('experience'));
      return;
    }

    if (result.command === 'resume') {
      void printResult(result).then(() => downloadResume());
      return;
    }

    void printResult(result);
  }

  function catchEnter(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Enter') {
      return;
    }

    event.preventDefault();
    commitCommand(event.currentTarget.value);
  }

  function setTerminalInput(nextInput: string) {
    inputValueRef.current = nextInput;
    setInput(nextInput);

    if (inputRef.current) {
      inputRef.current.value = nextInput;
    }
  }

  return (
    <aside
      className={`terminal-panel ${open ? 'open' : ''}`}
      aria-label="Interactive terminal"
      onClick={focusInput}
    >
      <button className="terminal-close" onClick={onClose} aria-label="Close terminal">
        ×
      </button>
      <div className="terminal-scroll" ref={scrollRef}>
        {busy && entries.length === 0 && (
          <>
            <p className="terminal-path">{profile.website} ~</p>
            <p className="terminal-line">
              <span className="prompt-mark">&gt;</span> {typedCommand}
              <span className="cursor" />
            </p>
          </>
        )}
        {entries.map((entry, index) =>
          entry.kind === 'prompt' ? (
            <div className="terminal-block" key={`${entry.text}-${index}`}>
              <p className="terminal-path">{profile.website} ~</p>
              <p className="terminal-line">
                <span className="prompt-mark">&gt;</span> {entry.text}
              </p>
            </div>
          ) : (
            <TerminalOutput
              key={`${entry.result.command}-${index}`}
              result={entry.result}
              lines={entry.lines}
            />
          ),
        )}
        <form onSubmit={submitCommand} className="terminal-form">
          <label className="terminal-path" htmlFor="terminal-input">
            {profile.website} ~
          </label>
          <div className="terminal-input-row">
            <span className="prompt-mark">&gt;</span>
            <span className="terminal-typed" aria-hidden="true">
              {input}
            </span>
            <input
              ref={inputRef}
              id="terminal-input"
              value={input}
              disabled={busy}
              onChange={(event) => setTerminalInput(event.target.value)}
              onInput={(event) => setTerminalInput(event.currentTarget.value)}
              onKeyDown={catchEnter}
              spellCheck={false}
              autoComplete="off"
              aria-label="Terminal command"
            />
            <span className="cursor" />
          </div>
        </form>
      </div>
      <CommandList />
    </aside>
  );

  async function printResult(
    result: TerminalResult,
    isCancelled: () => boolean = () => false,
  ) {
    setBusy(true);
    setEntries((current) => [...current, { kind: 'output', result, lines: [] }]);

    const totalCharacters = result.lines.join('\n').length;

    for (let count = 0; count <= totalCharacters; count += 1) {
      if (isCancelled()) {
        return;
      }

      const visibleLines = revealLines(result.lines, count);

      setEntries((current) => {
        const next = [...current];

        for (let index = next.length - 1; index >= 0; index -= 1) {
          const entry = next[index];

          if (entry.kind === 'output') {
            next[index] = { ...entry, lines: visibleLines };
            break;
          }
        }

        return next;
      });

      await new Promise((resolve) => window.setTimeout(resolve, outputSpeedMs));
    }

    setBusy(false);
    window.requestAnimationFrame(() => inputRef.current?.focus());
  }
}

function downloadResume() {
  const link = document.createElement('a');
  link.href = profile.resumePath ?? '/resume.pdf';
  link.download = '';
  document.body.append(link);
  link.click();
  link.remove();
}

function TerminalOutput({
  result,
  lines,
}: {
  result: TerminalResult;
  lines: string[];
}) {
  if (result.command === 'help') {
    return (
      <div className="terminal-output terminal-help terminal-help-compact">
        {lines[0] && <p className="terminal-output-title">{lines[0]}</p>}
        {lines.slice(1).map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
    );
  }

  if (result.command === 'status') {
    return (
      <div className="terminal-output terminal-status">
        {lines.map((line) => {
          const [label, ...value] = line.split(/\s{2,}/);

          return (
            <div className="terminal-stat" key={line}>
              <span>{label}</span>
              <strong>{value.join(' ')}</strong>
            </div>
          );
        })}
      </div>
    );
  }

  if (result.command === 'contact') {
    return (
      <div className="terminal-output terminal-contact">
        {lines.map((line) => {
          const [label, value] = line.split(/\s{2,}/);

          return (
            <p key={line}>
              <span>{label}</span>
              {value}
            </p>
          );
        })}
      </div>
    );
  }

  if (result.command === 'experience') {
    return (
      <div className="terminal-output terminal-experience">
        {lines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
    );
  }

  if (result.command === 'about') {
    return (
      <div className="terminal-output terminal-json">
        {lines.map((line, index) => (
          <p key={`${line}-${index}`}>{line}</p>
        ))}
      </div>
    );
  }

  return (
    <div className={`terminal-output terminal-${result.command}`}>
      {lines.map((line, index) => (
        <p key={`${line}-${index}`}>{line}</p>
      ))}
    </div>
  );
}

function CommandList() {
  return (
    <div className="command-list">
      <h2>Available Commands</h2>
      {commands.map((command) => (
        <div className="command-row" key={command.name}>
          <span>{command.name}</span>
          <small>{command.description}</small>
        </div>
      ))}
    </div>
  );
}

async function typeIntoPrompt(
  text: string,
  setText: (text: string) => void,
  isCancelled: () => boolean,
) {
  for (let index = 0; index <= text.length; index += 1) {
    if (isCancelled()) {
      return;
    }

    setText(text.slice(0, index));
    await new Promise((resolve) => window.setTimeout(resolve, typeSpeedMs));
  }
}

function revealLines(lines: string[], characterCount: number) {
  let remaining = characterCount;
  const visible: string[] = [];

  for (const line of lines) {
    if (remaining <= 0) {
      break;
    }

    visible.push(line.slice(0, remaining));
    remaining -= line.length + 1;
  }

  return visible;
}

function HomePage({ setPage }: { setPage: (page: Page) => void }) {
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <h1>
            {hero.title} <span>{hero.highlight}</span>
          </h1>
          <p>{hero.summary}</p>
          <div className="hero-actions">
            <button onClick={() => setPage('experience')}>View Experience →</button>
            <a href={`mailto:${profile.email}`}>Get in Touch</a>
          </div>
          <div className="availability">
            <span />
            {profile.availability}
          </div>
        </div>
        <LogoStage />
        <DeveloperCard />
      </section>
      <ExperiencePreview setPage={setPage} />
      <BioAndContact />
      <Footer />
    </>
  );
}

function ExperiencePage({ setPage }: { setPage: (page: Page) => void }) {
  const [openExperience, setOpenExperience] = useState<string[]>(
    resumeExperience[0]?.company ? [resumeExperience[0].company] : [],
  );

  return (
    <>
      <section className="resume-hero">
        <div>
          <p className="eyebrow">{profile.role}</p>
          <h1>Experience across ecommerce platforms, storefronts, and web operations.</h1>
        </div>
        <button onClick={() => setPage('home')}>Back Home →</button>
      </section>
      <section className="resume-grid">
        <div className="resume-column">
          <SectionTitle icon="briefcase">Work Experience</SectionTitle>
          <div className="experience-list vertical">
            {resumeExperience.map((item) => (
              <ExperienceCard
                item={item}
                key={item.company}
                expanded={openExperience.includes(item.company)}
                onToggle={() =>
                  setOpenExperience((current) =>
                    current.includes(item.company)
                      ? current.filter((company) => company !== item.company)
                      : [...current, item.company],
                  )
                }
              />
            ))}
          </div>
        </div>
        <div className="resume-column">
          <SectionTitle icon="layers">Core Skills</SectionTitle>
          <div className="skill-groups">
            {skillGroups.map((group) => (
              <SkillGroupCard group={group} key={group.title} />
            ))}
          </div>
          <SectionTitle icon="spark">Additional Projects</SectionTitle>
          <div className="detail-panel">
            {projects.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}

function LogoStage() {
  return (
    <div className="logo-stage" aria-label={`${profile.initials} monogram placeholder`}>
      <div className="grid-glow" />
      <div className="ar-mark">{profile.initials}</div>
      <div className="portal" />
    </div>
  );
}

function DeveloperCard() {
  const json = useMemo(() => developerJson, []);

  return (
    <div className="code-card">
      <div className="code-card-header">
        <span />
        developer.json
      </div>
      <pre>{json.join('\n')}</pre>
      <div className="code-footer">{codeFooter}</div>
    </div>
  );
}

function ExperiencePreview({ setPage }: { setPage: (page: Page) => void }) {
  return (
    <section className="content-section">
      <div className="section-heading">
        <SectionTitle icon="briefcase">Experience</SectionTitle>
        <button onClick={() => setPage('experience')}>View Full Experience →</button>
      </div>
      <div className="experience-list">
        {homeExperience.map((item) => (
          <ExperienceCard item={item} key={item.company} />
        ))}
      </div>
    </section>
  );
}

function ExperienceCard({
  item,
  expanded = false,
  onToggle,
}: {
  item: ExperienceItem;
  expanded?: boolean;
  onToggle?: () => void;
}) {
  const canExpand = Boolean(onToggle && item.bullets?.length);
  const detailsId = `experience-details-${item.company.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

  return (
    <article className={`experience-card ${expanded ? 'expanded' : ''}`}>
      <div className={`card-icon ${item.accent}`} />
      <div className="card-title-row">
        <h3>{item.company}</h3>
        <span>{item.period}</span>
      </div>
      <p className="role">{item.role}</p>
      <p>{item.summary}</p>
      <div className="tag-row">
        {item.tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
      {canExpand && (
        <button
          className="experience-toggle"
          type="button"
          aria-expanded={expanded}
          aria-controls={detailsId}
          onClick={onToggle}
        >
          {expanded ? 'Hide details' : 'Show details'}
          <span>{expanded ? '−' : '+'}</span>
        </button>
      )}
      {canExpand && expanded && (
        <ul className="experience-details" id={detailsId}>
          {item.bullets?.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
      )}
      <small>⌖ {item.location}</small>
    </article>
  );
}

function BioAndContact() {
  return (
    <section className="lower-grid">
      <article className="bio-card">
        <SectionTitle icon="code">{bio.title}</SectionTitle>
        <div className="bio-content">
          <div className="portrait-placeholder">Photo</div>
          <div>
            {bio.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <div className="mini-tags">
              {bio.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </article>
      <article className="contact-card">
        <SectionTitle icon="send">Let's Connect</SectionTitle>
        <div className="contact-grid">
          <div className="contact-links">
            <ContactLink href={`mailto:${profile.email}`} icon="mail">
              {profile.email}
            </ContactLink>
            <ContactLink href={`tel:${profile.phone.replace(/\D/g, '')}`} icon="phone">
              {profile.phone}
            </ContactLink>
            <ContactLink href={`https://${profile.website}`} icon="globe">
              {profile.website}
            </ContactLink>
            <ContactLink href={`https://${profile.github}`} icon="code">
              {profile.github}
            </ContactLink>
            <ContactLink href={`https://${profile.linkedin}`} icon="briefcase">
              {profile.linkedin}
            </ContactLink>
          </div>
          <div className="message-card">
            <p>&gt; send_message --to {profile.firstName.toLowerCase()}</p>
            <p>&gt; message: let's build something great</p>
            <p>&gt; status: delivered</p>
          </div>
        </div>
      </article>
    </section>
  );
}

function SkillGroupCard({ group }: { group: SkillGroup }) {
  return (
    <article className="skill-group">
      <h3>{group.title}</h3>
      <div className="skill-cloud">
        {group.items.map((skill) => (
          <span key={skill}>{skill}</span>
        ))}
      </div>
    </article>
  );
}

function ContactLink({
  children,
  href,
  icon,
}: {
  children: ReactNode;
  href: string;
  icon: IconName;
}) {
  return (
    <a href={href}>
      <Icon name={icon} />
      <span>{children}</span>
    </a>
  );
}

function SectionTitle({
  children,
  icon,
}: {
  children: ReactNode;
  icon?: IconName;
}) {
  return (
    <h2 className="section-title">
      {icon && <Icon name={icon} />}
      <span>{children}</span>
    </h2>
  );
}

type IconName =
  | 'briefcase'
  | 'code'
  | 'download'
  | 'globe'
  | 'layers'
  | 'mail'
  | 'phone'
  | 'send'
  | 'spark';

function Icon({ name }: { name: IconName }) {
  const paths: Record<IconName, ReactNode> = {
    briefcase: (
      <>
        <path d="M9 7V5.8C9 4.8 9.8 4 10.8 4h2.4C14.2 4 15 4.8 15 5.8V7" />
        <path d="M5 7h14v10.5c0 1-.8 1.5-1.8 1.5H6.8C5.8 19 5 18.5 5 17.5V7Z" />
        <path d="M5 11h14" />
      </>
    ),
    code: (
      <>
        <path d="m9 8-4 4 4 4" />
        <path d="m15 8 4 4-4 4" />
      </>
    ),
    download: (
      <>
        <path d="M12 4v9" />
        <path d="m8 10 4 4 4-4" />
        <path d="M5 17v2h14v-2" />
      </>
    ),
    globe: (
      <>
        <circle cx="12" cy="12" r="8" />
        <path d="M4 12h16" />
        <path d="M12 4c2 2.2 3 4.8 3 8s-1 5.8-3 8" />
        <path d="M12 4c-2 2.2-3 4.8-3 8s1 5.8 3 8" />
      </>
    ),
    layers: (
      <>
        <path d="m12 4 8 4-8 4-8-4 8-4Z" />
        <path d="m4 12 8 4 8-4" />
        <path d="m4 16 8 4 8-4" />
      </>
    ),
    mail: (
      <>
        <path d="M4 6h16v12H4V6Z" />
        <path d="m4 7 8 6 8-6" />
      </>
    ),
    phone: (
      <path d="M8 5h3l1.3 4-2 1.2c.9 1.9 2.4 3.4 4.5 4.4l1.2-2.1 4 1.4v3c0 1.1-.9 2-2 2C10.8 19 5 13.2 5 7c0-1.1.9-2 2-2h1Z" />
    ),
    send: (
      <>
        <path d="m4 12 16-8-5 16-3-7-8-1Z" />
        <path d="m12 13 8-9" />
      </>
    ),
    spark: (
      <>
        <path d="M12 3v6" />
        <path d="M12 15v6" />
        <path d="M3 12h6" />
        <path d="M15 12h6" />
        <path d="m6 6 3 3" />
        <path d="m15 15 3 3" />
        <path d="m18 6-3 3" />
        <path d="m9 15-3 3" />
      </>
    ),
  };

  return (
    <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

function Footer() {
  return (
    <footer>
      <span>© 2026 {profile.name}</span>
      <span>Built with React & TypeScript</span>
    </footer>
  );
}
