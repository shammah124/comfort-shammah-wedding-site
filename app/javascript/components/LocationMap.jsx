import React from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

export default function LocationMap() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  const venues = [
    {
      name: "Wedding Ceremony",
      location: "ECWA Headquarters Church",
      address: "Jos, Plateau State, Nigeria",
      time: "10:00 AM",
      mapSrc: "https://www.openstreetmap.org/export/embed.html?bbox=8.8696%2C9.9083%2C8.9096%2C9.9483&layer=mapnik&marker=9.9283%2C8.8896",
    },
    {
      name: "Reception",
      location: "ECWA Headquarters International Conference Hall",
      address: "Jos, Plateau State, Nigeria",
      time: "Immediately after the ceremony",
      mapSrc: "https://www.openstreetmap.org/export/embed.html?bbox=8.8696%2C9.9083%2C8.9096%2C9.9483&layer=mapnik&marker=9.9283%2C8.8896",
    },
  ];

  return (
    <section className="map-section" ref={ref}>
      <div className="section-container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <p className="section-eyebrow">Find your way to us</p>
          <h2 className="section-heading">Location</h2>
          <p className="section-subheading">Join us in Jos, Plateau State, Nigeria.</p>
          <div className="ornament-rule">
            <div className="rule-line" />
            <svg className="rule-diamond" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="12,2 22,12 12,22 2,12" />
            </svg>
            <div className="rule-line" />
          </div>
        </motion.div>

        <div className="venues-grid">
          {venues.map((venue, i) => (
            <motion.div
              key={i}
              className="venue-card"
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: i * 0.2 }}
            >
              <div className="venue-info">
                <span className="venue-tag">{venue.name}</span>
                <h3 className="venue-name">{venue.location}</h3>
                <div className="venue-details">
                  <p className="venue-address">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="venue-icon">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    {venue.address}
                  </p>
                  <p className="venue-time">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="venue-icon">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M12 6v6l4 2"/>
                    </svg>
                    {venue.time}
                  </p>
                </div>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(venue.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="venue-directions-btn"
                >
                  Get Directions →
                </a>
              </div>
              <div className="venue-map">
                <iframe
                  src={venue.mapSrc}
                  className="map-iframe"
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  title={venue.name}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <motion.footer
          className="wedding-footer"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.8, duration: 1 }}
        >
          <div className="ornament-rule">
            <div className="rule-line" />
            <svg className="rule-diamond" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="12,2 22,12 12,22 2,12" />
            </svg>
            <div className="rule-line" />
          </div>
          <p className="footer-couple">Comfort &amp; Shammah</p>
          <p className="footer-date">17 · 10 · 2026</p>
          <p className="footer-quote">"And I am my beloved's, and my beloved is mine."</p>
          <p className="footer-book">— Song of Solomon 6:3</p>
          <p className="footer-credit">Designed with love by Tolu ♥</p>
        </motion.footer>
      </div>
    </section>
  );
}
