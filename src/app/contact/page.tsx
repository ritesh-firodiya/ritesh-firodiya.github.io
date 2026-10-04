import { Forward, forwardMetadata } from "@/components/forward";

export const metadata = forwardMetadata("/resume/");

export default function Moved() {
  return <Forward to="/resume/" />;
}
