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
  skills: Record<string, string[]>;
  experiences: Experience[]; projects: Project[];
  education: { institution: string; degree: string; from: string; to: string }[];
};


export const STATUS_TOKEN = (s: string) => {
  const v = s.toLowerCase();
  if (v.startsWith("live")) return { fg: "text-live", bg: "bg-live-wash" };
  if (v.includes("testing") || v.includes("review") || v.includes("beta")) return { fg: "text-beta", bg: "bg-beta-wash" };
  if (v.includes("build")) return { fg: "text-build", bg: "bg-build-wash" };
  return { fg: "text-design", bg: "bg-design-wash" };
};
