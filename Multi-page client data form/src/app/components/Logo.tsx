/// <reference path="../../vite-env.d.ts" />
import { ImageWithFallback } from "./figma/ImageWithFallback";
import logoWhite from "../../imports/Anphonic-logo_with_bg_-_white.svg";

const sizeClass = { sm: "h-7", md: "h-10", lg: "h-12" };

export default function Logo({ variant: _variant, size = "md" }: { variant?: "light" | "dark"; size?: "sm" | "md" | "lg" }) {
  return (
    <ImageWithFallback
      src={logoWhite}
      alt="anphonic.ai"
      className={`${sizeClass[size]} w-auto`}
    />
  );
}
