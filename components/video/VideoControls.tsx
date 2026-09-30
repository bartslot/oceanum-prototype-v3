import { MouseEvent, useEffect, useRef, useState } from "react";

const HIDE_AFTER_MS = 2500;

type Props = {
  isPlaying: boolean;
  getVideo: () => HTMLVideoElement | null;
  onTogglePlay: () => void;
  onSeek: (fraction: number) => void;
};

// Minimal white overlay: appears while the pointer moves over the video, fades out when it rests.
const VideoControls = ({ isPlaying, getVideo, onTogglePlay, onSeek }: Props) => {
  const [isVisible, setIsVisible] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let hideTimer: ReturnType<typeof setTimeout>;
    const reveal = () => {
      setIsVisible(true);
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => setIsVisible(false), HIDE_AFTER_MS);
    };
    window.addEventListener("mousemove", reveal, { passive: true });
    window.addEventListener("touchstart", reveal, { passive: true });
    return () => {
      clearTimeout(hideTimer);
      window.removeEventListener("mousemove", reveal);
      window.removeEventListener("touchstart", reveal);
    };
  }, []);

  // Read the video's time every frame so the bar moves smoothly without re-rendering React.
  useEffect(() => {
    let frame: number;
    const tick = () => {
      const video = getVideo();
      if (video && video.duration && barRef.current) {
        barRef.current.style.transform = `scaleX(${video.currentTime / video.duration})`;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [getVideo]);

  const handleSeek = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    onSeek(Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1));
  };

  return (
    <div
      className={`fixed left-0 right-0 bottom-0 z-30 flex items-center gap-4 px-6 pb-6 pt-10 transition-opacity duration-500 ${isVisible ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      style={{ background: "linear-gradient(to top, rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0))" }}
    >
      <button
        type="button"
        onClick={onTogglePlay}
        className="link flex items-center justify-center w-6 h-6 text-white"
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
            <rect x="2" y="1" width="3" height="12" rx="1" />
            <rect x="9" y="1" width="3" height="12" rx="1" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
            <path d="M3 1.5v11a.5.5 0 0 0 .77.42l8.5-5.5a.5.5 0 0 0 0-.84l-8.5-5.5A.5.5 0 0 0 3 1.5z" />
          </svg>
        )}
      </button>
      <div
        className="link group flex-1 h-4 flex items-center cursor-pointer"
        onClick={handleSeek}
        role="slider"
        aria-label="Video progress"
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="relative w-full h-0.5 group-hover:h-1 transition-all duration-200 rounded-full overflow-hidden" style={{ background: "rgba(255, 255, 255, 0.3)" }}>
          <div ref={barRef} className="absolute inset-0 bg-white origin-left" style={{ transform: "scaleX(0)" }} />
        </div>
      </div>
    </div>
  );
};

export default VideoControls;
