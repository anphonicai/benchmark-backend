import { ImageWithFallback } from "./figma/ImageWithFallback";
import logoBlack from "../../imports/Anphonic-logo_with_bg_-_black.png";
import logoWhite from "../../imports/Anphonic-logo_with_bg_-_white.svg";

interface LogoProps {
  variant?: "light" | "dark";
}

// variant="light" (default) → dark logo for cream/light backgrounds
// variant="dark"            → white logo for dark backgrounds (e.g. report page navy header)
export default function Logo({ variant = "light" }: LogoProps) {
  return (
    <ImageWithFallback
      src={variant === "dark" ? logoWhite : logoBlack}
      alt="anphonic.ai"
      className="h-8 w-auto"
    />
  );
}
