import { ImageWithFallback } from "./figma/ImageWithFallback";
import logoBlack from "../../imports/Anphonic-logo_with_bg_-_black.png";
import logoWhite from "../../imports/Anphonic-logo_with_bg_-_white.svg";

interface LogoProps {
  variant?: "light" | "dark";
}

// variant="light" (default) → black-bg logo for light/cream page backgrounds
// variant="dark"            → white-bg logo for dark page backgrounds (e.g. NAVY header)
export default function Logo({ variant = "light" }: LogoProps) {
  return (
    <ImageWithFallback
      src={variant === "dark" ? logoWhite : logoBlack}
      alt="anphonic.ai"
      className="h-8 w-auto"
    />
  );
}
