import { TiltedGridHero } from "@/components/ui/tilted-grid-hero";
import { HERO_IMAGES } from "@/src/hero-images";

export default function TiltedGridHeroDemo() {
  return (
    <TiltedGridHero images={HERO_IMAGES}
      className="h-[560px] w-full rounded-lg border border-border bg-background">
      <div className="relative z-10 flex h-full flex-col items-center justify-between py-12 text-center">
        <div className="px-6">
          <h1 className="text-balance text-4xl font-medium tracking-tight text-foreground sm:text-5xl">
            Every frame,<br />brought into focus.
          </h1>
        </div>
        <p className="max-w-md text-balance px-6 text-sm text-muted-foreground">
          Images curve in from one edge, flatten out at the centre, then fade away round the other.
        </p>
      </div>
    </TiltedGridHero>
  );
}
