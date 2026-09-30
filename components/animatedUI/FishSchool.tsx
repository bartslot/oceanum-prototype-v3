import { useEffect, useRef } from "react";
import { gsap } from "gsap";

// White fish from the correct-answer Lottie, extracted as a looping tail wiggle (drawn facing left).
const FISH_PATH = "/static/whiteFish.json";
const FISH_COUNT = 9;
const FISH_WIDTH = 36;

type Props = {
  isSwimming: boolean;
  originSelector: string;
  onDone: () => void;
};

const FishSchool = ({ isSwimming, originSelector, onDone }: Props) => {
  const fishRefs = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    let animations = [];
    let isCancelled = false;
    import("lottie-web").then(({ default: lottie }) => {
      if (isCancelled) return;
      animations = fishRefs.current.map((container) =>
        lottie.loadAnimation({ container, renderer: "svg", loop: true, autoplay: true, path: FISH_PATH })
      );
    });
    return () => {
      isCancelled = true;
      animations.forEach((animation) => animation.destroy());
    };
  }, []);

  useEffect(() => {
    if (!isSwimming) return;
    const ring = document.querySelector(originSelector);
    if (!ring) {
      onDone();
      return;
    }
    const r = ring.getBoundingClientRect();
    const radius = r.width / 2;
    const centerX = r.left + radius;
    const centerY = r.top + radius;

    // Flock heading: a gathering point on the ring's right side, then one shared wave to the right edge.
    const gatherX = centerX + radius * 0.5;
    const flockY = centerY + gsap.utils.random(-60, 60);

    const tl = gsap.timeline({ onComplete: onDone });
    fishRefs.current.forEach((el, i) => {
      const angle = gsap.utils.random(0, Math.PI * 2);
      const distance = radius * gsap.utils.random(0.1, 0.55);
      const startX = centerX + Math.cos(angle) * distance;
      const startY = centerY + Math.sin(angle) * distance;
      const gatherY = centerY + gsap.utils.random(-radius * 0.35, radius * 0.35);
      const appearAt = i * 0.06;
      const flockAt = 1.05 + i * 0.06;

      // scaleX -1 turns the left-facing fish to the right.
      gsap.set(el, { x: startX, y: startY, xPercent: -50, yPercent: -50, scaleX: -0.2, scaleY: 0.2, autoAlpha: 0 });
      tl.to(el, { autoAlpha: 1, scaleX: -1, scaleY: 1, duration: 0.35, ease: "back.out(2)" }, appearAt)
        .to(el, { x: gatherX + gsap.utils.random(-radius * 0.2, radius * 0.2), y: gatherY, duration: 0.5, ease: "power2.inOut" }, appearAt + 0.3)
        // Anticipation: ease back and squash before the dash.
        .to(el, { x: "-=10", scaleX: -0.86, scaleY: 1.1, duration: 0.25, ease: "power2.out" }, flockAt - 0.25)
        .to(el, { x: window.innerWidth + FISH_WIDTH * 2, scaleX: -1, scaleY: 1, duration: 1.4, ease: "power2.in" }, flockAt)
        // Shared wave with small offsets so they move as one school.
        .to(el, { y: flockY + (gatherY - centerY) * 0.6, duration: 0.7, ease: "sine.inOut", yoyo: true, repeat: 1 }, flockAt);
    });
    return () => {
      tl.kill();
    };
  }, [isSwimming, originSelector, onDone]);

  return (
    <div className="fixed inset-0 pointer-events-none z-10" aria-hidden="true">
      {Array.from({ length: FISH_COUNT }, (_, i) => (
        <div
          key={i}
          ref={(el) => { fishRefs.current[i] = el; }}
          className="absolute left-0 top-0 invisible"
          style={{ width: FISH_WIDTH }}
        />
      ))}
    </div>
  );
};

export default FishSchool;
