/// <reference path="../../vite-env.d.ts" />
import { ImageWithFallback } from "./figma/ImageWithFallback";
import logoWhite from "../../imports/Anphonic-logo_with_bg_-_white.svg";
import logoTransparent from "../../imports/Anphonic-logo_transparent.svg";

const sizeClass = { sm: "h-7", md: "h-10", lg: "h-12" };

// variant="light" (default) → transparent bg, dark text — for cream/light backgrounds
// variant="dark"            → white bg badge — for dark navy backgrounds
export default function Logo({ variant = "light", size = "md" }: { variant?: "light" | "dark"; size?: "sm" | "md" | "lg" }) {
  return (
    <ImageWithFallback
      src={variant === "dark" ? logoWhite : logoTransparent}
      alt="anphonic.ai"
      className={`${sizeClass[size]} w-auto`}
    />
  );
}
