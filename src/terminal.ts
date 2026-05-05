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
