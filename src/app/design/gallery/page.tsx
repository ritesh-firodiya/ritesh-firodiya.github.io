import { Forward, forwardMetadata } from "@/components/forward";

export const metadata = forwardMetadata("/#process");

export default function Moved() {
  return <Forward to="/#process" />;
}
