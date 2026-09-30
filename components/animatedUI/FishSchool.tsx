import { useEffect, useRef } from "react";
import { gsap } from "gsap";

// White fish from the correct-answer Lottie, extracted as a looping tail wiggle (drawn facing left).
const FISH_PATH = "/static/whiteFish.json";
const FISH_COUNT = 7;
const FISH_WIDTH = 26;
// Arc on the ring's right side where the fish emerge, in degrees (0 = straight right).
const EMERGE_ARC_DEGREES = 70;

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

    const tl = gsap.timeline({ onComplete: onDone });
    fishRefs.current.forEach((el, i) => {
      const angle = gsap.utils.mapRange(0, FISH_COUNT - 1, -EMERGE_ARC_DEGREES / 2, EMERGE_ARC_DEGREES / 2, i) * (Math.PI / 180);
      const startX = centerX + Math.cos(angle) * radius;
      const startY = centerY + Math.sin(angle) * radius;
      const at = i * 0.09;

      // scaleX -1 turns the left-facing fish to the right.
      gsap.set(el, { x: startX, y: startY, xPercent: -50, yPercent: -50, scaleX: -0.4, scaleY: 0.4, autoAlpha: 0 });
      tl.to(el, { autoAlpha: 1, scaleX: -1, scaleY: 1, duration: 0.35, ease: "back.out(2)" }, at)
        // Anticipation: ease back toward the ring before the dash.
        .to(el, { x: startX - 10, scaleX: -0.88, scaleY: 1.08, duration: 0.3, ease: "power2.out" }, at + 0.35)
        .to(el, { x: window.innerWidth + FISH_WIDTH * 2, scaleX: -1, scaleY: 1, duration: 1.3, ease: "power2.in" }, at + 0.65)
        // Wavy path so the school swims rather than slides.
        .to(el, { y: startY + gsap.utils.random(-40, 40), duration: 0.65, ease: "sine.inOut", yoyo: true, repeat: 1 }, at + 0.65);
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
