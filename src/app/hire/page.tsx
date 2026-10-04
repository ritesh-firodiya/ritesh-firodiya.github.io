import { Forward, forwardMetadata } from "@/components/forward";

/* The consulting page competed with the résumé for the same reader. What I am
   open to is three lines on Contact now. */
export const metadata = forwardMetadata("/contact/");

export default function Hire() {
  return <Forward to="/contact/" why="What I am open to is on the Contact page now." />;
}
