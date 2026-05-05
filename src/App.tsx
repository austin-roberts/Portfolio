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
  education,
  homeExperience,
  Page,
  profile,
  resumeExperience,
  skills,
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
        <TerminalPanel open={terminalOpen} onClose={() => setTerminalOpen(false)} />
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
      <a className="resume-button" href="/resume.pdf" aria-label="Download resume">
        Resume <span>⇩</span>
      </a>
    </header>
  );
}

function TerminalPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [entries, setEntries] = useState<TerminalEntry[]>([]);
  const [typedCommand, setTypedCommand] = useState('');
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

    if (!cleanInput || busy) {
      return;
    }

    setEntries((current) => [...current, { kind: 'prompt', text: cleanInput }]);
    setInput('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    void printResult(runCommand(cleanInput));
  }

  function catchEnter(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Enter') {
      return;
    }

    event.preventDefault();
    commitCommand(event.currentTarget.value);
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
            <p className="terminal-path">austinroberts.net ~</p>
            <p className="terminal-line">
              <span className="prompt-mark">&gt;</span> {typedCommand}
              <span className="cursor" />
            </p>
          </>
        )}
        {entries.map((entry, index) =>
          entry.kind === 'prompt' ? (
            <div className="terminal-block" key={`${entry.text}-${index}`}>
              <p className="terminal-path">austinroberts.net ~</p>
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
            austinroberts.net ~
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
              onChange={(event) => setInput(event.target.value)}
              onInput={(event) => setInput(event.currentTarget.value)}
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

function TerminalOutput({
  result,
  lines,
}: {
  result: TerminalResult;
  lines: string[];
}) {
  if (result.command === 'help') {
    return (
      <div className="terminal-output terminal-help">
        {lines[0] && <p className="terminal-output-title">{lines[0]}</p>}
        {lines.slice(1).map((line, index) => {
          const [, name = line, description = ''] = line.match(/^(\S+)\s*(.*)$/) ?? [];

          return (
            <div className="terminal-help-row" key={`${name}-${index}`}>
              <span>{name}</span>
              <small>{description}</small>
            </div>
          );
        })}
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
            I build digital experiences that <span>make an impact.</span>
          </h1>
          <p>
            Full-stack developer with 4+ years of experience building fast,
            scalable, and accessible applications with modern technologies.
          </p>
          <div className="hero-actions">
            <button onClick={() => setPage('experience')}>View Experience →</button>
            <a href={`mailto:${profile.email}`}>Get in Touch</a>
          </div>
          <div className="availability">
            <span />
            Available for new opportunities
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
  return (
    <>
      <section className="resume-hero">
        <div>
          <p className="eyebrow">Resume</p>
          <h1>Experience built across product, platform, and polished front ends.</h1>
        </div>
        <button onClick={() => setPage('home')}>Back Home →</button>
      </section>
      <section className="resume-grid">
        <div className="resume-column">
          <SectionTitle>Work Experience</SectionTitle>
          <div className="experience-list vertical">
            {resumeExperience.map((item) => (
              <ExperienceCard item={item} key={item.company} />
            ))}
          </div>
        </div>
        <div className="resume-column">
          <SectionTitle>Core Skills</SectionTitle>
          <div className="skill-cloud">
            {skills.map((skill) => (
              <span key={skill}>{skill}</span>
            ))}
          </div>
          <SectionTitle>Education</SectionTitle>
          <div className="detail-panel">
            {education.map((item) => (
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
    <div className="logo-stage" aria-label="AR monogram placeholder">
      <div className="grid-glow" />
      <div className="ar-mark">AR</div>
      <div className="portal" />
    </div>
  );
}

function DeveloperCard() {
  const json = useMemo(
    () => [
      '{',
      '  "name": "Austin Roberts",',
      '  "role": "Full-Stack Developer",',
      '  "location": "Remote Worldwide",',
      '  "experience": "4+ Years",',
      '  "stack": {',
      '    "frontend": ["React", "TypeScript", "CSS"],',
      '    "backend": ["Node.js", "Express", "PostgreSQL"],',
      '    "tools": ["Docker", "Git", "Vercel"]',
      '  },',
      '  "currently": "Building cool things"',
      '}',
    ],
    [],
  );

  return (
    <div className="code-card">
      <div className="code-card-header">
        <span />
        developer.json
      </div>
      <pre>{json.join('\n')}</pre>
      <div className="code-footer">$ coffee --strength strong --focus ship</div>
    </div>
  );
}

function ExperiencePreview({ setPage }: { setPage: (page: Page) => void }) {
  return (
    <section className="content-section">
      <div className="section-heading">
        <SectionTitle>Experience</SectionTitle>
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

function ExperienceCard({ item }: { item: ExperienceItem }) {
  return (
    <article className="experience-card">
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
      <small>⌖ {item.location}</small>
    </article>
  );
}

function BioAndContact() {
  return (
    <section className="lower-grid">
      <article className="bio-card">
        <SectionTitle>Meet Austin</SectionTitle>
        <div className="bio-content">
          <div className="portrait-placeholder">Photo</div>
          <div>
            <p>
              I'm a full-stack developer who loves turning complex problems into
              clean, intuitive solutions. With 4+ years of experience building web
              applications, APIs, and developer tools, I focus on performance,
              scalability, and great user experience.
            </p>
            <p>
              When I'm not coding, you'll find me brewing pour-over coffee,
              exploring new tech, or contributing to open source.
            </p>
            <div className="mini-tags">
              <span>Remote worldwide</span>
              <span>4+ Years Experience</span>
              <span>Available for hire</span>
            </div>
          </div>
        </div>
      </article>
      <article className="contact-card">
        <SectionTitle>Let's Connect</SectionTitle>
        <div className="contact-grid">
          <div className="contact-links">
            <a href={`mailto:${profile.email}`}>{profile.email}</a>
            <a href={`https://${profile.website}`}>{profile.website}</a>
            <a href={`https://${profile.github}`}>{profile.github}</a>
            <a href={`https://${profile.linkedin}`}>{profile.linkedin}</a>
          </div>
          <div className="message-card">
            <p>&gt; send_message --to austin</p>
            <p>&gt; message: let's build something great</p>
            <p>&gt; status: delivered</p>
          </div>
        </div>
      </article>
    </section>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="section-title">{children}</h2>;
}

function Footer() {
  return (
    <footer>
      <span>© 2026 Austin Roberts</span>
      <span>Built with React & TypeScript</span>
    </footer>
  );
}
