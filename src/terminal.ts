import { profile, resumeExperience, terminal } from './data';

export type TerminalCommand = {
  name: string;
  description: string;
  run: () => string[];
};

export type TerminalResult = {
  command: string;
  lines: string[];
};

export const commands: TerminalCommand[] = [
  {
    name: 'about',
    description: `Learn about ${profile.firstName}`,
    run: () => terminal.about,
  },
  {
    name: 'experience',
    description: 'Work history & roles',
    run: () =>
      resumeExperience.map((item) =>
        `${item.period.padEnd(15, ' ')} ${item.company.padEnd(30, ' ')} ${item.role}`,
      ),
  },
  {
    name: 'resume',
    description: 'Download resume',
    run: () => terminal.resume,
  },
  {
    name: 'contact',
    description: 'Get in touch',
    run: () => [
      `email     ${profile.email}`,
      `phone     ${profile.phone}`,
      `web       ${profile.website}`,
      `github    ${profile.github}`,
      `linkedin  ${profile.linkedin}`,
    ],
  },
  {
    name: 'status',
    description: 'System status',
    run: () => terminal.status,
  },
  {
    name: 'help',
    description: 'Show command tips',
    run: () => [
      'COMMAND TIPS',
      'Type a command and press Enter.',
      'Try: about, experience, status, contact.',
      'The full command list stays pinned below.',
    ],
  },
];

const hiddenCommands: Record<string, string[]> = {
  ls: [
    'about.md   experience/   contact.json   resume.pdf',
    'No node_modules in sight. Enjoy this rare moment of peace.',
  ],
  'ls -la': [
    'drwxr-xr-x  portfolio',
    '-rw-r--r--  taste.txt',
    '-rw-r--r--  restraint.css',
    '-rw-r--r--  ship-it.sh',
  ],
  pwd: ['/home/visitor/portfolio', 'Reasonably close to production. Emotionally closer.'],
  whoami: ['visitor', 'Unix says you are you. CSS says you have opinions.'],
  date: ['Tue May 5 00:00:00 PORTFOLIO 2026', 'Time is fake. Deadlines, somehow, are not.'],
  uptime: ['up 47 days, 22 hours, 11 minutes', 'Load average: calm, focused, slightly caffeinated.'],
  sudo: ['Permission denied.', 'This portfolio trusts you, but not that much.'],
  'sudo !!': ['Re-running confidence with elevated privileges...', 'Still no. Admirable enthusiasm, though.'],
  'rm -rf /': [
    'Refusing to turn a portfolio into a cautionary conference talk.',
    'Try deleting a meeting invite instead. Better ROI.',
  ],
  'cd ..': ['You step back one directory.', 'The glow is quieter out here.'],
  'cd /': ['At root.', 'It is mostly responsibilities and folders named like tax paperwork.'],
  vim: ['Vim opened successfully.', 'Exit strategy status: still under review.'],
  ':q': ['Nice. Clean exit. No ceremony.'],
  ':wq': ['Saved and quit.', 'A tiny productivity parade passes by silently.'],
  nano: ['Nano opens, makes eye contact, and politely explains the shortcuts at the bottom.'],
  emacs: ['Starting operating system...', 'Just kidding. Mostly.'],
  'git status': [
    'On branch main',
    'Your working tree is clean enough for a portfolio and honest enough for a human.',
  ],
  'git blame': [
    'That line was written by Past You.',
    'Past You had context. Current You has questions.',
  ],
  'git push --force': ['Lease required.', 'Also maybe a deep breath.'],
  'npm test': ['No failing tests found.', 'A few opinions remain snapshot-unstable.'],
  'npm run build': ['Build completed in the imaginary CI of this terminal.', 'Bundle size: tasteful.'],
  'ssh prod': ['ssh: connect to host prod port 22: Connection refused', 'Production is practicing boundaries.'],
  'cat readme.md': [
    '# Portfolio',
    'A terminal-flavored website for someone who likes the details to work.',
  ],
  'cat package.json': ['{ "scripts": { "vibe": "checked", "ship": "carefully" } }'],
  env: ['NODE_ENV=curious', 'EDITOR=depends_who_is_asking', 'COFFEE_LEVEL=adequate'],
  history: [
    '1  help',
    '2  about',
    '3  experience',
    '4  git status',
    '5  wonder if this terminal has secrets',
  ],
  clear: ['Screen cleared spiritually. The DOM remains attached.'],
  exit: ['Logout refused.', 'You can close the drawer, but the terminal will remember you fondly.'],
  logout: ['Session preserved. Dramatic exits are disabled.'],
  reboot: ['Reboot scheduled for after one more tiny CSS tweak.'],
  top: [
    'PID   COMMAND        %CPU',
    '101   layout         12.0',
    '202   terminal       8.7',
    '303   overthinking   0.1',
  ],
  ps: ['PID TTY      TIME     CMD', '42  tty-web  00:00:01 portfolio'],
  ping: ['usage: ping <host>', 'The terminal is friendly, but it still appreciates a destination.'],
  'ping google.com': ['64 bytes from google.com: time=14ms', 'Internet still there. Suspiciously reliable.'],
  fortune: ['Good code is often just boring code that survived contact with Monday.'],
  coffee: ['Brewing...', 'Result: ideas +12, hand steadiness -2.'],
  ship: ['Checking restraint...', 'Checking polish...', 'Ship it, but keep the diff readable.'],
  yolo: ['Alias not found.', 'Try: git commit with a message you can defend tomorrow.'],
};

export function runCommand(input: string) {
  const cleanInput = input.trim().toLowerCase().replace(/\s+/g, ' ');
  const command = commands.find((item) => item.name === cleanInput);

  if (hiddenCommands[cleanInput]) {
    return {
      command: 'hidden',
      lines: hiddenCommands[cleanInput],
    };
  }

  if (!command) {
    return {
      command: 'error',
      lines: [
        `command not found: ${input}`,
        "Type 'help' to see what the terminal understands.",
      ],
    };
  }

  return {
    command: command.name,
    lines: command.run(),
  };
}
