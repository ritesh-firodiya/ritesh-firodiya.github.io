import { Forward, forwardMetadata } from "@/components/forward";

export const metadata = forwardMetadata("/products/canon/#lifecycle");

export default function Moved() {
  return <Forward to="/products/canon/#lifecycle" />;
}
