import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function EnvelopeLanding({ onOpen, guestName }) {
  const [sealBroken, setSealBroken] = useState(false);
  const [envelopeOpen, setEnvelopeOpen] = useState(false);
  const openingRef = useRef(false);

  const handleEnvelopeOpen = () => {
    if (openingRef.current) return;
    openingRef.current = true;
    setSealBroken(true);
    setTimeout(() => {
      setEnvelopeOpen(true);
      setTimeout(onOpen, 1600);
    }, 600);
  };

  return (
    <div className="envelope-landing">
      {/* Background */}
      <div className="landing-bg" />

      {/* Ambient glow orbs */}
      <div className="glow-orb glow-orb--1" />
      <div className="glow-orb glow-orb--2" />
      <div className="glow-orb glow-orb--3" />

      <div className="landing-content">
        {/* Subtle top tagline */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          <p className="landing-subtitle">You have received a wedding invitation</p>
          {guestName && (
            <motion.p
              className="guest-greeting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 1 }}
            >
              Dear {guestName},
            </motion.p>
          )}
        </motion.div>

        {/* Envelope */}
        <motion.div
          className="envelope-wrapper"
          role="button"
          tabIndex={0}
          onClick={handleEnvelopeOpen}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              handleEnvelopeOpen();
            }
          }}
          initial={{ opacity: 0, scale: 0.8, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className={`envelope ${envelopeOpen ? "envelope--open" : ""}`}>
            {/* Envelope body */}
            <div className="envelope__body">
              {/* Bottom triangle fold lines */}
              <div className="envelope__fold envelope__fold--left" />
              <div className="envelope__fold envelope__fold--right" />
              <div className="envelope__fold envelope__fold--bottom" />

              {/* Envelope liner pattern */}
              <div className="envelope__liner">
                <svg width="100%" height="100%" opacity="0.08">
                  <defs>
                    <pattern id="diamondPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                      <polygon points="10,2 18,10 10,18 2,10" fill="#c9a84c" stroke="#c9a84c" strokeWidth="0.5"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#diamondPattern)"/>
                </svg>
              </div>

              {/* Inner card peek */}
              <AnimatePresence>
                {envelopeOpen && (
                  <motion.div
                    className="envelope__card"
                    initial={{ y: 0 }}
                    animate={{ y: "-65%" }}
                    transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div className="envelope__card-inner">
                      <p className="font-playfair text-center text-champagne text-sm italic">Save the Date</p>
                      <p className="font-playfair text-center text-gold text-lg font-semibold mt-1">C&amp;Sh</p>
                      <p className="text-center text-champagne/60 text-xs mt-1">17.10.2026</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Envelope flap */}
            <motion.div
              className="envelope__flap"
              animate={envelopeOpen ? { rotateX: -180 } : { rotateX: 0 }}
              transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              style={{ transformOrigin: "top center" }}
            >
              <div className="envelope__flap-inner" />
            </motion.div>

            {/* Wax seal */}
            <motion.div
              className={`wax-seal ${sealBroken ? "wax-seal--broken" : ""}`}
              whileHover={!sealBroken ? { scale: 1.08 } : {}}
              whileTap={!sealBroken ? { scale: 0.95 } : {}}
              animate={
                sealBroken
                  ? { scale: [1, 0.88, 1.04, 1] }
                  : {}
              }
              transition={sealBroken ? { duration: 0.35, ease: "easeInOut" } : {}}
            >
              {/* Seal outer ring */}
              <div className="wax-seal__ring" />
              {/* Seal monogram */}
              <div className="wax-seal__monogram">
                <span>C</span>
                <span className="seal-amp">&amp;</span>
                <span>Sh</span>
              </div>
              {/* Seal texture overlay */}
              <div className="wax-seal__texture" />
              {/* Seal crack lines */}
              {sealBroken && (
                <>
                  <div className="seal-crack seal-crack--1" />
                  <div className="seal-crack seal-crack--2" />
                  <div className="seal-crack seal-crack--3" />
                </>
              )}
            </motion.div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          className="landing-cta"
          initial={{ opacity: 0 }}
          animate={{ opacity: sealBroken ? 0 : 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
          >
            Click the envelope to open your invitation
          </motion.p>
          <motion.div
            className="cta-arrow"
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
          >
            ↓
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom date strip */}
      <motion.div
        className="landing-date-strip"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 1 }}
      >
        <span className="date-line" />
        <span className="date-text">October 17, 2026 · Jos, Nigeria</span>
        <span className="date-line" />
      </motion.div>
    </div>
  );
}
