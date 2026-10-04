import type { Metadata } from "next";
import { Forward, forwardMetadata } from "@/components/forward";

/* A case study used to live at /work/<slug>, apart from its product page. They
   are one page now. Only the address that was ever published is kept. */
const PUBLISHED = ["chitragupt"];

export function generateStaticParams() {
  return PUBLISHED.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return forwardMetadata(`/products/${slug}/`);
}

export default async function OldCaseStudy({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <Forward to={`/products/${slug}/`} />;
}
