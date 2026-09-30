import styles from "./Cursor.module.scss";
import { MutableRefObject, useEffect, useRef } from "react";
import { gsap } from "gsap";

const Cursor = ({ isDesktop }) => {
  const cursor: MutableRefObject<HTMLDivElement> = useRef(null);
  const follower: MutableRefObject<HTMLDivElement> = useRef(null);

  useEffect(() => {
    if (!isDesktop || document.body.clientWidth <= 767) return;

    follower.current.classList.remove("hidden");
    cursor.current.classList.remove("hidden");

    // quickTo reuses one tween per axis instead of spawning two new tweens on every mousemove.
    const cursorX = gsap.quickTo(cursor.current, "x", { duration: 0.1, ease: "power3" });
    const cursorY = gsap.quickTo(cursor.current, "y", { duration: 0.1, ease: "power3" });
    const followerX = gsap.quickTo(follower.current, "x", { duration: 0.35, ease: "power3" });
    const followerY = gsap.quickTo(follower.current, "y", { duration: 0.35, ease: "power3" });

    const moveCircle = (e: MouseEvent) => {
      cursorX(e.clientX);
      cursorY(e.clientY);
      followerX(e.clientX);
      followerY(e.clientY);
    };

    const setHover = (isHovering: boolean) => {
      gsap.to(cursor.current, { scale: isHovering ? 0.5 : 1, duration: 0.3, ease: "power2.out", overwrite: "auto" });
      gsap.to(follower.current, { scale: isHovering ? 3 : 1, duration: 0.3, ease: "power2.out", overwrite: "auto" });
    };

    // Delegated so links rendered later (quiz answers) also get the hover state.
    const handleOver = (e: MouseEvent) => {
      const link = (e.target as Element).closest?.(".link");
      if (link && !link.contains(e.relatedTarget as Node)) setHover(true);
    };
    const handleOut = (e: MouseEvent) => {
      const link = (e.target as Element).closest?.(".link");
      if (link && !link.contains(e.relatedTarget as Node)) setHover(false);
    };

    document.addEventListener("mousemove", moveCircle, { passive: true });
    document.addEventListener("mouseover", handleOver);
    document.addEventListener("mouseout", handleOut);
    return () => {
      document.removeEventListener("mousemove", moveCircle);
      document.removeEventListener("mouseover", handleOver);
      document.removeEventListener("mouseout", handleOut);
    };
  }, [isDesktop]);

  return (
    <>
      <div
        ref={cursor}
        className={`
          ${styles.cursor}
           fixed hidden bg-white w-2 h-2 select-none pointer-events-none z-50
        `}
      ></div>
      <div
        ref={follower}
        className={`
          ${styles.cursorFollower} 
           fixed hidden h-6 w-6 select-none pointer-events-none z-50
        `}
      ></div>
    </>
  );
};

export default Cursor;
