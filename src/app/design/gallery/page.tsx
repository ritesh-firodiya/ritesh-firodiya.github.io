import { Forward, forwardMetadata } from "@/components/forward";

/* The gallery of design sets became the table on How I build. */
export const metadata = forwardMetadata("/process/");

export default function DesignGallery() {
  return <Forward to="/process/" why="Every design set is listed on How I build now." />;
}
