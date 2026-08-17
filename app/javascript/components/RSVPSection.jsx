import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";

function Confetti({ active }) {
  if (!active) return null;
  const petals = Array.from({ length: 30 });
  return (
    <div className="confetti-container" aria-hidden="true">
      {petals.map((_, i) => (
        <motion.div
          key={i}
          className="confetti-petal"
          style={{
            left: `${Math.random() * 100}%`,
            backgroundColor: ["#c9a84c", "#6b7c3a", "#f5f0e8", "#8a9a4a", "#d4a853"][i % 5],
            width: `${6 + Math.random() * 8}px`,
            height: `${6 + Math.random() * 8}px`,
            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
          }}
          initial={{ y: -20, opacity: 1, rotate: 0 }}
          animate={{
            y: window.innerHeight,
            opacity: [1, 1, 0],
            rotate: Math.random() * 720 - 360,
            x: (Math.random() - 0.5) * 200,
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            delay: Math.random() * 0.8,
            ease: "easeIn",
          }}
        />
      ))}
    </div>
  );
}

export default function RSVPSection() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [form, setForm] = useState({ name: "", email: "", attendance: "", guest_count: 1, message: "" });
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error
  const [errorMsg, setErrorMsg] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");
    try {
      const res = await fetch("/api/rsvps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rsvp: form }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus("success");
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 4000);
      } else {
        setStatus("error");
        setErrorMsg(data.errors?.join(", ") || "Something went wrong.");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Unable to reach the server. Please try again.");
    }
  };

  return (
    <section className="rsvp-section" ref={ref}>
      <Confetti active={showConfetti} />
      <div className="section-container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <p className="section-eyebrow">Will you join us?</p>
          <h2 className="section-heading">RSVP</h2>
          <p className="section-subheading">
            Please respond by October 3, 2026. We'd love to celebrate with you.
          </p>
          <div className="ornament-rule">
            <div className="rule-line" />
            <svg className="rule-diamond" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="12,2 22,12 12,22 2,12" />
            </svg>
            <div className="rule-line" />
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {status === "success" ? (
            <motion.div
              key="success"
              className="rsvp-success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
              <div className="success-icon">💌</div>
              <h3 className="success-title">With gratitude &amp; joy</h3>
              <p className="success-text">
                Your RSVP has been received. We cannot wait to celebrate with you.
              </p>
              <p className="success-date">See you on October 17, 2026</p>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              className="rsvp-form"
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.9, delay: 0.3 }}
            >
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="rsvp-name">Full Name *</label>
                  <input
                    id="rsvp-name"
                    className="form-input"
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Your full name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="rsvp-email">Email Address</label>
                  <input
                    id="rsvp-email"
                    className="form-input"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Attendance *</label>
                  <div className="attendance-options">
                    {["yes", "no"].map((val) => (
                      <label key={val} className={`attendance-option ${form.attendance === val ? "attendance-option--selected" : ""}`}>
                        <input
                          type="radio"
                          name="attendance"
                          value={val}
                          checked={form.attendance === val}
                          onChange={handleChange}
                          className="sr-only"
                          required
                        />
                        {val === "yes" ? "✓ Joyfully accepts" : "✗ Regretfully declines"}
                      </label>
                    ))}
                  </div>
                </div>

                {form.attendance === "yes" && (
                  <motion.div
                    className="form-group"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <label className="form-label" htmlFor="rsvp-guests">Number of Guests</label>
                    <select
                      id="rsvp-guests"
                      className="form-input"
                      name="guest_count"
                      value={form.guest_count}
                      onChange={handleChange}
                    >
                      {[1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>{n} {n === 1 ? "guest" : "guests"}</option>
                      ))}
                    </select>
                  </motion.div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="rsvp-message">A Note for the Couple</label>
                <textarea
                  id="rsvp-message"
                  className="form-input form-textarea"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Share your wishes, a memory, or a kind word..."
                  rows={4}
                />
              </div>

              {status === "error" && (
                <motion.p
                  className="form-error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {errorMsg}
                </motion.p>
              )}

              <motion.button
                className="rsvp-submit"
                type="submit"
                disabled={status === "submitting"}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                {status === "submitting" ? (
                  <span className="submit-loading">
                    <span className="loading-dot" />
                    <span className="loading-dot" />
                    <span className="loading-dot" />
                  </span>
                ) : (
                  "Send My RSVP →"
                )}
              </motion.button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
