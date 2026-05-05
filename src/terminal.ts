import { profile } from './data';

export type TerminalCommand = {
  name: string;
  description: string;
  run: () => string[];
};

export type TerminalResult = {
  command: string;
  lines: string[];
};

const jsonLines = [
  '{',
  '  "name": "Austin Roberts",',
  '  "role": "Full-Stack Developer",',
  '  "location": "Remote",',
  '  "focus": ["Web", "APIs", "DevEx"],',
  '  "passion": "Building performant, accessible digital experiences",',
  '  "stack": ["TypeScript", "Next.js", "Node.js", "React"],',
  '  "currently": "Building cool things"',
  '}',
];

export const commands: TerminalCommand[] = [
  {
    name: 'about',
    description: 'Learn about Austin',
    run: () => jsonLines,
  },
  {
    name: 'experience',
    description: 'Work history & roles',
    run: () => [
      '2022 - Present  Acme Inc.           Senior Software Engineer',
      '2019 - 2022     DataFlow Systems    Software Engineer',
      '2017 - 2019     Pixel Studio        Frontend Developer',
    ],
  },
  {
    name: 'resume',
    description: 'Download resume',
    run: () => ['resume.pdf is wired as a placeholder for now.'],
  },
  {
    name: 'contact',
    description: 'Get in touch',
    run: () => [
      `email     ${profile.email}`,
      `web       ${profile.website}`,
      `github    ${profile.github}`,
      `linkedin  ${profile.linkedin}`,
    ],
  },
  {
    name: 'status',
    description: 'System status',
    run: () => [
      'SYSTEM UPTIME       47d 22h 11m',
      'CODE COMMITS        1,284',
      'YEARS EXPERIENCE    4+',
      'TECHNOLOGIES        20+',
      'CURRENT STATUS      Available for hire',
    ],
  },
  {
    name: 'help',
    description: 'Show all commands',
    run: () => [
      'AVAILABLE COMMANDS',
      ...commands.map((command) =>
        `${command.name.padEnd(12, ' ')} ${command.description}`,
      ),
    ],
  },
];

export function runCommand(input: string) {
  const cleanInput = input.trim().toLowerCase();
  const command = commands.find((item) => item.name === cleanInput);

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
