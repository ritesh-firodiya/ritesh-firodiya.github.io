import { Forward, forwardMetadata } from "@/components/forward";

/* The property app was listed as "DwarSeva Property" until 2026-10-04. It is
   Seedha Ghar now; the old address was public, so it forwards. */
export const metadata = forwardMetadata("/products/seedha-ghar/");

export default function Renamed() {
  return <Forward to="/products/seedha-ghar/" />;
}
