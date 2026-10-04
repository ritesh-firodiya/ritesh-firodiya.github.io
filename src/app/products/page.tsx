import { Forward, forwardMetadata } from "@/components/forward";

/* /products was a second list of the same thirteen things. There is one list
   now. Store listings and old links still arrive here, so it forwards. */
export const metadata = forwardMetadata("/work/");

export default function ProductsIndex() {
  return <Forward to="/work/" why="Every project is on the Work page now." />;
}
