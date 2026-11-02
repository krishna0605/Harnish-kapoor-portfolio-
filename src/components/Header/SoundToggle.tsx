"use client";

import { useEffect, useSyncExternalStore } from "react";
import { isMuted, setMuted, subscribeMuted, unlockAudio } from "@/lib/sound";
import styles from "./Header.module.css";

/** Speaker button in the header: sound effects on / off (remembered). */
export function SoundToggle() {
  const muted = useSyncExternalStore(subscribeMuted, isMuted, () => false);

  // audio may only start after a user gesture: unlock on the first one
  useEffect(() => {
    const unlock = () => unlockAudio();
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  return (
    <button
      type="button"
      className={styles.soundToggle}
      aria-pressed={!muted}
      aria-label={muted ? "Sound off" : "Sound on"}
      title={muted ? "Sound off" : "Sound on"}
      onClick={() => {
        unlockAudio();
        setMuted(!muted);
      }}
      data-reveal="header"
      data-sketch-allow // muting still works in sketch mode
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 9.5 H8 L13 5 V19 L8 14.5 H4 Z" fill="#2A2733" />
        {muted ? (
          <path d="M16.5 9.5 L21 14 M21 9.5 L16.5 14" stroke="#2A2733" strokeWidth="2" strokeLinecap="round" />
        ) : (
          <path d="M16 9 Q18.5 12 16 15 M18.5 6.5 Q23 12 18.5 17.5" fill="none" stroke="#2A2733" strokeWidth="2" strokeLinecap="round" />
        )}
      </svg>
    </button>
  );
}
