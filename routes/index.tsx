import { Head } from "$fresh/runtime.ts";

import Sidebar from "@/components/Sidebar.tsx";
import About from "@/components/About.tsx";
import Experience from "@/components/Experience.tsx";
import Projects from "@/components/Projects.tsx";

import profile from "@/profile.json" with { type: "json" };

const PAGE_TITLE = `${profile.name} — ${profile.headline} ${profile.tagline}`;
const PAGE_DESC = profile.about[0];

export default function Page() {
  return (
    <>
      <Head>
        <title>{PAGE_TITLE}</title>
        <meta name="description" content={PAGE_DESC} />
        <meta name="author" content={profile.name} />
        <link rel="canonical" href={profile.website} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={PAGE_TITLE} />
        <meta property="og:description" content={PAGE_DESC} />
        <meta property="og:image" content={profile.avatar} />
        <meta property="og:url" content={profile.website} />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={PAGE_TITLE} />
        <meta name="twitter:description" content={PAGE_DESC} />
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <meta
          name="google-site-verification"
          content="BBtnEWW-NzqBZtR7EfTb1C5aw41RsghkZR2yeYFtT2I"
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              html { scroll-behavior: smooth; }
              body { background: #0a192f; }
              ::selection { background: rgba(100,255,218,0.3); color: #ccd6f6; }
            `,
          }}
        />
      </Head>
      <main class="min-h-screen bg-navy text-slate font-sans">
        <div class="max-w-screen-xl mx-auto px-6 sm:px-12 lg:px-16 lg:flex lg:gap-12">
          <Sidebar
            name={profile.name}
            headline={profile.headline}
            tagline={profile.tagline}
            github={profile.github}
            linkedin={profile.linkedin}
            email={profile.email}
            location={profile.location}
          />

          <div class="lg:w-3/5 lg:py-24 pt-4 pb-24">
            <About paragraphs={profile.about} currently={profile.currently} />
            <Experience experiences={profile.experiences} />
            <Projects
              projects={profile.projects}
              contactEmail={profile.email}
            />

            <footer class="mt-12 text-xs text-slate-dark font-mono">
              <p>
                Designed and built by {profile.name}. · Deno Fresh ·{" "}
                <a
                  href={`https://github.com/${profile.github}/${profile.github}.github.io`}
                  class="hover:text-accent transition-colors"
                  target="_blank"
                  rel="noreferrer"
                >
                  source
                </a>
              </p>
            </footer>
          </div>
        </div>
      </main>
    </>
  );
}
