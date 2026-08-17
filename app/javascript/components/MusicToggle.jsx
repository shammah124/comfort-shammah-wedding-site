import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function MusicToggle() {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);

  const AUDIO_URL = "/audio/beautiful-things.mp3";

  useEffect(() => {
    const audio = new Audio(AUDIO_URL);
    audio.loop = true;
    audio.volume = 0.35;
    audio.preload = "none"; // don't load until user clicks play

    // Sync React state with actual audio state
    audio.addEventListener("play",  () => setPlaying(true));
    audio.addEventListener("pause", () => setPlaying(false));
    audio.addEventListener("ended", () => setPlaying(false));

    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, []);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!audio.paused) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
  };

  return (
    <motion.button
      className="music-toggle"
      onClick={toggle}
      title={playing ? "Pause music" : "Play music"}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1.5, duration: 0.5 }}
      whileHover={{ scale: 1.12 }}
      whileTap={{ scale: 0.93 }}
      aria-label={playing ? "Pause background music" : "Play background music"}
      style={{ overflow: "visible" }}
    >
      <AnimatePresence mode="wait">
        {playing ? (
          <motion.span
            key="playing"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.2 }}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}
          >
            {/* Ripple ring */}
            <motion.span
              style={{
                position: "absolute",
                inset: -8,
                borderRadius: "50%",
                border: "1.5px solid rgba(201,168,76,0.45)",
              }}
              animate={{ scale: [1, 1.45, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
            />
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 18V5l12-2v13" stroke="#c9a84c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="6" cy="18" r="3" stroke="#c9a84c" strokeWidth="2"/>
              <circle cx="18" cy="16" r="3" stroke="#c9a84c" strokeWidth="2"/>
            </svg>
          </motion.span>
        ) : (
          <motion.span
            key="paused"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.2 }}
            style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 18V5l12-2v13" stroke="#c9a84c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.45"/>
              <circle cx="6" cy="18" r="3" stroke="#c9a84c" strokeWidth="2" strokeOpacity="0.45"/>
              <circle cx="18" cy="16" r="3" stroke="#c9a84c" strokeWidth="2" strokeOpacity="0.45"/>
              <line x1="3" y1="3" x2="21" y2="21" stroke="#c9a84c" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.7"/>
            </svg>
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
