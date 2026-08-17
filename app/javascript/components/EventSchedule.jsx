import React from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

const events = [
  {
    time: "9:00 AM",
    title: "Guest Arrival",
    description: "Guests arrive and are warmly welcomed into ECWA Headquarters Church.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    time: "10:00 AM",
    title: "Wedding Ceremony",
    description: "The exchange of vows — a sacred moment of union witnessed by all who love Comfort and Shammah.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    ),
    featured: true,
  },
  {
    time: "11:30 AM",
    title: "Photo Session",
    description: "The newly married couple steps out for formal portraits. Family and bridal party photos to follow.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
        <circle cx="12" cy="13" r="4"/>
      </svg>
    ),
  },
  {
    time: "1:00 PM",
    title: "Reception Programme",
    description: "Join Comfort and Shammah for a joyful reception filled with celebration, heartfelt moments, and shared fellowship.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M7 3v8a5 5 0 0 0 10 0V3"/>
        <path d="M7 7h10"/>
        <path d="M12 16v5"/>
        <path d="M9 21h6"/>
      </svg>
    ),
  },
  {
    time: "3:00 PM",
    title: "Departure Blessings",
    description: "Guests gather to shower the couple with prayers and blessings as they begin their journey together.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
  },
];

function ScheduleItem({ event, index }) {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });

  return (
    <motion.div
      ref={ref}
      className={`schedule-item ${event.featured ? "schedule-item--featured" : ""}`}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.1 }}
    >
      <div className="schedule-time">{event.time}</div>
      <div className="schedule-connector">
        <div className="schedule-dot">
          <div className="schedule-icon">{event.icon}</div>
        </div>
        {index < events.length - 1 && <div className="schedule-line" />}
      </div>
      <div className="schedule-content">
        <h3 className="schedule-title">{event.title}</h3>
        <p className="schedule-desc">{event.description}</p>
      </div>
    </motion.div>
  );
}

export default function EventSchedule() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section className="schedule-section" ref={ref}>
      <div className="section-container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <p className="section-eyebrow">Saturday, October 17, 2026</p>
          <h2 className="section-heading">Day Schedule</h2>
          <p className="section-subheading">A day planned with love, every moment crafted to be cherished.</p>
          <div className="ornament-rule">
            <div className="rule-line" />
            <svg className="rule-diamond" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="12,2 22,12 12,22 2,12" />
            </svg>
            <div className="rule-line" />
          </div>
        </motion.div>

        <div className="schedule-list">
          {events.map((event, i) => (
            <ScheduleItem key={i} event={event} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
