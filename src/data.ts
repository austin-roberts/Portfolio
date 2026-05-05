import siteData from './content/profile.json';

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

export type SkillGroup = {
  title: string;
  items: string[];
};

type Profile = {
  name: string;
  firstName: string;
  initials: string;
  role: string;
  tagline: string;
  location: string;
  availability: string;
  years: string;
  email: string;
  phone: string;
  website: string;
  github: string;
  linkedin: string;
};

type Hero = {
  title: string;
  highlight: string;
  summary: string;
};

type Bio = {
  title: string;
  paragraphs: string[];
  tags: string[];
};

type TerminalContent = {
  about: string[];
  status: string[];
  resume: string[];
};

type SiteContent = {
  profile: Profile;
  hero: Hero;
  bio: Bio;
  developerJson: string[];
  codeFooter: string;
  homeExperience: ExperienceItem[];
  resumeExperience: ExperienceItem[];
  skillGroups: SkillGroup[];
  projects: string[];
  terminal: TerminalContent;
};

const content = siteData as SiteContent;

export const profile = content.profile;
export const hero = content.hero;
export const bio = content.bio;
export const developerJson = content.developerJson;
export const codeFooter = content.codeFooter;
export const homeExperience = content.homeExperience;
export const resumeExperience = content.resumeExperience;
export const skillGroups = content.skillGroups;
export const projects = content.projects;
export const terminal = content.terminal;
