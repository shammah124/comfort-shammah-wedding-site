import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

function CountdownTimer({ targetDate }) {
  const [timeLeft, setTimeLeft] = useState({});

  useEffect(() => {
    const calculate = () => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft(null);
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };
    calculate();
    const timer = setInterval(calculate, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (!timeLeft) {
    return (
      <div className="countdown-arrived">
        <span>✦</span>
        <p>Today is the day — celebrate with us!</p>
        <span>✦</span>
      </div>
    );
  }

  const units = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Minutes", value: timeLeft.minutes },
    { label: "Seconds", value: timeLeft.seconds },
  ];

  return (
    <div className="countdown-grid">
      {units.map(({ label, value }) => (
        <div key={label} className="countdown-unit">
          <motion.span
            key={value}
            className="countdown-number"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {String(value ?? 0).padStart(2, "0")}
          </motion.span>
          <span className="countdown-label">{label}</span>
        </div>
      ))}
    </div>
  );
}

export default function WeddingDetails({ guestName }) {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });

  return (
    <section className="wedding-details-section" ref={ref}>
      {/* Background ornament */}
      <div className="section-bg-ornament" />

      <motion.div
        className="section-container"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.8 }}
      >
        {/* Decorative top rule */}
        <motion.div
          className="ornament-rule"
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <div className="rule-line" />
          <svg className="rule-diamond" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="12,2 22,12 12,22 2,12" />
          </svg>
          <div className="rule-line" />
        </motion.div>

        {/* Eyebrow */}
        <motion.p
          className="section-eyebrow"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          Together with their families
        </motion.p>

        {/* Couple names */}
        <motion.div
          className="couple-names-block"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="couple-name">Comfort</h1>
          <div className="couple-divider">
            <span className="divider-line" />
            <span className="divider-amp">&amp;</span>
            <span className="divider-line" />
          </div>
          <h1 className="couple-name">Shammah</h1>
        </motion.div>

        {/* Invitation text */}
        <motion.p
          className="invitation-text"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5, duration: 1 }}
        >
          {guestName
            ? `Dear ${guestName}, we joyfully request your presence as we exchange vows and celebrate the beginning of our forever.`
            : "Joyfully request your presence as we exchange vows and celebrate the beginning of our forever."}
        </motion.p>

        {/* Details cards */}
        <motion.div
          className="details-cards"
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6, duration: 0.9 }}
        >
          <div className="detail-card">
            <div className="detail-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M8 2v4M16 2v4M3 10h18M3 6h18a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"/>
              </svg>
            </div>
            <p className="detail-label">Date</p>
            <p className="detail-value">Saturday, October 17</p>
            <p className="detail-sub">2026</p>
          </div>

          <div className="detail-card detail-card--featured">
            <div className="detail-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
              </svg>
            </div>
            <p className="detail-label">Time</p>
            <p className="detail-value">10:00 AM</p>
            <p className="detail-sub">Ceremony</p>
          </div>

          <div className="detail-card">
            <div className="detail-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <p className="detail-label">Venue</p>
            <p className="detail-value">ECWA Headquarters</p>
            <p className="detail-sub">Church, Jos</p>
          </div>
        </motion.div>

        {/* Countdown */}
        <motion.div
          className="countdown-container"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8, duration: 0.9 }}
        >
          <p className="countdown-title">Counting down to forever</p>
          <CountdownTimer targetDate="2026-10-17T10:00:00" />
        </motion.div>

        {/* Bottom ornament */}
        <motion.div
          className="ornament-rule ornament-rule--bottom"
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ delay: 0.9, duration: 1, ease: "easeOut" }}
        >
          <div className="rule-line" />
          <svg className="rule-diamond" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="12,2 22,12 12,22 2,12" />
          </svg>
          <div className="rule-line" />
        </motion.div>
      </motion.div>
    </section>
  );
}
