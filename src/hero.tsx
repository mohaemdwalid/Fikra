import { createRoot } from "react-dom/client";
import { TiltedGridHero } from "@/components/ui/tilted-grid-hero";
import { HERO_IMAGES } from "./hero-images";

const host = document.getElementById("fikra-tilted-grid");
if (host) {
  createRoot(host).render(
    <TiltedGridHero images={HERO_IMAGES} className="fikra-curved-band"
      tileHeight={62} axis={50} curve={65} gap={8} speed={4} fade={12} />,
  );
}
