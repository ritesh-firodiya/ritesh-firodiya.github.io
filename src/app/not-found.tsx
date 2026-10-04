import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader, SiteFooter } from "@/components/site-chrome";

export const metadata: Metadata = { title: "Not found" };

/* The header and footer stay: a bare 404 strands the reader, and the nav is
   the recovery. */
export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="wrap grid flex-1 place-items-center py-16 text-center">
        <div>
          <p className="eyebrow">Error 404</p>
          <h1 className="page-title mt-4">This page does not exist.</h1>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/" className="btn btn-primary">Home</Link>
            <Link href="/#work" className="btn btn-quiet">See the work</Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
