import raw from "@/data/profile.json";

export type Experience = {
  company: string; position: string; from: string; to: string;
  companyLink: string; description: string; tags: string[];
};
export type Project = {
  name: string; tagline: string; description: string; stack: string[];
  status: string; link?: string; links?: { label: string; url: string }[]; private?: boolean;
};

export const profile = raw as unknown as {
  name: string; headline: string; tagline: string; about: string[]; currently: string;
  summary: string; location: string; email: string; github: string; linkedin: string;
  skills: Record<string, string[]>; workedAt: string[];
  experiences: Experience[]; projects: Project[];
  education: { institution: string; degree: string; from: string; to: string }[];
};


