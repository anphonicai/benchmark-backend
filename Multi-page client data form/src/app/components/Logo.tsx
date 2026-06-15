/// <reference path="../../vite-env.d.ts" />
import { ImageWithFallback } from "./figma/ImageWithFallback";
import logoMark from "../../imports/Anphonic-logo-07.png";

const sizeClass = { sm: "h-7", md: "h-10", lg: "h-12" };

export default function Logo({ size = "md" }: { variant?: "light" | "dark"; size?: "sm" | "md" | "lg" }) {
  return (
    <ImageWithFallback
      src={logoMark}
      alt="Anphonic"
      className={`${sizeClass[size]} w-auto`}
    />
  );
}
