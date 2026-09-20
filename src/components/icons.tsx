/**
 * Semantic aliases over lucide-react — the same icon set every design file in
 * the tree already uses, so a glyph on this site matches the glyph in the
 * wireframe it describes.
 *
 * This module exists so the choice of glyph lives in one place. lucide v1
 * removed its brand icons (there is no Github, no Google Play), so a few of
 * these are deliberate semantic stand-ins rather than logos, and swapping one
 * later is a single line here instead of a find-and-replace across pages.
 */
export {
  GitBranch as IconGit, // lucide v1 dropped the GitHub mark; a branch reads the same
  LayoutTemplate as IconDesign,
  Globe as IconLive,
  Play as IconAndroid, // the Play store's own glyph is a play triangle
  Apple as IconApple,
  ArrowLeft as IconBack,
  ArrowRight as IconNext,
  ExternalLink as IconExternal,
} from "lucide-react";
