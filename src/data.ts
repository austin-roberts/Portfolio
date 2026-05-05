export type Page = 'home' | 'experience';

export type ExperienceItem = {
  company: string;
  role: string;
  period: string;
  location: string;
  summary: string;
  tags: string[];
  accent: 'blue' | 'purple' | 'cyan';
};

export const profile = {
  name: 'Austin Roberts',
  role: 'Full-Stack Developer',
  location: 'Remote Worldwide',
  years: '4+ Years',
  email: 'hello@austinroberts.net',
  website: 'austinroberts.net',
  github: 'github.com/austinroberts',
  linkedin: 'linkedin.com/in/austinroberts',
};

export const homeExperience: ExperienceItem[] = [
  {
    company: 'Acme Inc.',
    role: 'Senior Software Engineer',
    period: '2022 - Present',
    location: 'Remote',
    summary:
      'Leading platform initiatives and architecture efforts delivering scalable systems used by millions worldwide.',
    tags: ['TypeScript', 'React', 'Node.js', 'AWS', 'PostgreSQL'],
    accent: 'purple',
  },
  {
    company: 'DataFlow Systems',
    role: 'Software Engineer',
    period: '2019 - 2022',
    location: 'Austin, TX',
    summary:
      'Built real-time data pipelines and internal tools to improve reliability and developer productivity.',
    tags: ['JavaScript', 'Node.js', 'React', 'Docker', 'Kubernetes'],
    accent: 'blue',
  },
  {
    company: 'Pixel Studio',
    role: 'Frontend Developer',
    period: '2017 - 2019',
    location: 'Austin, TX',
    summary:
      'Crafted responsive web experiences and design systems for marketing sites and SaaS products.',
    tags: ['HTML', 'CSS', 'JavaScript', 'Sass', 'Gulp'],
    accent: 'cyan',
  },
];

export const resumeExperience: ExperienceItem[] = [
  {
    company: 'Acme Inc.',
    role: 'Senior Software Engineer',
    period: '2022 - Present',
    location: 'Remote',
    summary:
      'Owned front-end architecture, API integration patterns, and performance work across customer-facing product surfaces.',
    tags: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'AWS'],
    accent: 'purple',
  },
  {
    company: 'DataFlow Systems',
    role: 'Software Engineer',
    period: '2019 - 2022',
    location: 'Austin, TX',
    summary:
      'Built dashboards, event-driven services, and deployment tooling that helped product teams ship with fewer production issues.',
    tags: ['JavaScript', 'Express', 'React', 'Docker', 'CI/CD'],
    accent: 'blue',
  },
  {
    company: 'Pixel Studio',
    role: 'Frontend Developer',
    period: '2017 - 2019',
    location: 'Austin, TX',
    summary:
      'Translated brand systems into fast, accessible interfaces for startups, agencies, and SaaS teams.',
    tags: ['HTML', 'CSS', 'Sass', 'Accessibility', 'Design Systems'],
    accent: 'cyan',
  },
];

export const skills = [
  'TypeScript',
  'React',
  'Next.js',
  'Node.js',
  'Express',
  'PostgreSQL',
  'Docker',
  'AWS',
  'Vercel',
  'Accessibility',
  'Performance',
  'Design Systems',
];

export const education = [
  'B.S. Computer Science',
  'Frontend architecture, platform engineering, and developer experience',
  'Open source contributor and lifelong tinkerer',
];
