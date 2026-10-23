import { Forward, forwardMetadata } from "@/components/forward";

/* Babul was called Trunk until 2026-10-23, and its page lived here; the old
   address was public, so it forwards. */
export const metadata = forwardMetadata("/products/babul/");

export default function Renamed() {
  return <Forward to="/products/babul/" />;
}
