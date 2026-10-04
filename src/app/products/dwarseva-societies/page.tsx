import { Forward, forwardMetadata } from "@/components/forward";

/* Listed as "DwarSeva Societies" until 2026-10-05, when the property app
   stopped sharing the name. The old address was public, so it forwards. */
export const metadata = forwardMetadata("/products/dwarseva/");

export default function Renamed() {
  return <Forward to="/products/dwarseva/" />;
}
