import { ImageWithFallback } from "./figma/ImageWithFallback";
import logoImage from "../../imports/Anphonic-logo_with_bg_-_black.png";

export default function Logo() {
  return (
    <ImageWithFallback
      src={logoImage}
      alt="anphonic.ai"
      className="h-8 w-auto"
    />
  );
}
