import { Forward, forwardMetadata } from "@/components/forward";

export const metadata = forwardMetadata("/products/zeno/#lifecycle");

export default function Moved() {
  return <Forward to="/products/zeno/#lifecycle" />;
}
