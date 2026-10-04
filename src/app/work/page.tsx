import { Forward, forwardMetadata } from "@/components/forward";

export const metadata = forwardMetadata("/#work");

export default function Moved() {
  return <Forward to="/#work" />;
}
