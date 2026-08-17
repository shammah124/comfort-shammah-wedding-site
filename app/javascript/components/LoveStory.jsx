import React from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

const milestones = [
  {
    year: "2023",
    month: "November",
    title: "First Meeting",
    description:
      "Three years of being course mates, yet somehow strangers, until November 2023. During our EE 502 practicals at ATBU, fate placed us in the same group. We were both Computer Science students, sharing the same academic journey without realizing that, among lines of code, practicals, and ordinary moments, we were about to begin writing a story far more beautiful than we could have imagined.",
    icon: "✦",
    image: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=600&q=80",
  },
  {
    year: "2024",
    month: "October",
    title: "First Date",
    description:
      "After countless attempts to persuade Comfort to go on a date, October 2024 finally became the turning point; she fell in. Funny enough, all the drama unfolded in a block of the Faculty of Engineering at ATBU. Though we were both Computer Science students from the Faculty of Sciences, perhaps Engineering was quietly engineering something beautiful in us... \"LOVE\".",
    icon: "♥",
    image: "https://images.unsplash.com/photo-1529636798458-92182e662485?w=600&q=80",
  },
  {
    year: "2025",
    month: "December",
    title: "The Proposal",
    description:
      "On a Sunday afternoon, while preparing to travel to Abuja for an outing with two others, an unforgettable moment unfolded. Before Comfort could realize what was happening, Shammah was on his knees, proposing. She thought it was another playful drama—until she realized he meant every word. Then came her YES. The atmosphere could not withstand it; it had to bow to LOVE.",
    icon: "💍",
    image: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=600&q=80",
  },
  {
    year: "2026",
    month: "October",
    title: "Forever Begins",
    description:
      "Today, two families come together, two hearts become one, and two lives begin a beautiful journey as one. From a chance encounter to a love that has grown through laughter, memories, and countless moments, their story arrives at this beautiful chapter, where love is celebrated, promises are made, and forever begins.",
    icon: "★",
    image: "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=600&q=80",
  },
];

function TimelineItem({ milestone, index }) {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });
  const isEven = index % 2 === 0;

  return (
    <motion.div
      ref={ref}
      className={`timeline-item ${isEven ? "timeline-item--left" : "timeline-item--right"}`}
      initial={{ opacity: 0, x: isEven ? -50 : 50 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Content card */}
      <div className="timeline-card">
        <div className="timeline-image-wrap">
          <img src={milestone.image} alt={milestone.title} className="timeline-image" loading="lazy" />
          <div className="timeline-image-overlay" />
        </div>
        <div className="timeline-text">
          <div className="timeline-meta">
            <span className="timeline-month">{milestone.month}</span>
            <span className="timeline-year">{milestone.year}</span>
          </div>
          <h3 className="timeline-title">{milestone.title}</h3>
          <p className="timeline-desc">{milestone.description}</p>
        </div>
      </div>

      {/* Center connector */}
      <div className="timeline-connector">
        <motion.div
          className="timeline-dot"
          initial={{ scale: 0 }}
          animate={inView ? { scale: 1 } : {}}
          transition={{ delay: 0.3, duration: 0.5, type: "spring", stiffness: 200 }}
        >
          <span className="timeline-icon">{milestone.icon}</span>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function LoveStory() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section className="love-story-section" ref={ref}>
      <div className="section-container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <p className="section-eyebrow">A journey through time</p>
          <h2 className="section-heading">Our Love Story</h2>
          <p className="section-subheading">
            Every great love story has a beginning. Here is ours.
          </p>
          <div className="ornament-rule">
            <div className="rule-line" />
            <svg className="rule-diamond" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="12,2 22,12 12,22 2,12" />
            </svg>
            <div className="rule-line" />
          </div>
        </motion.div>

        <div className="timeline">
          {/* Vertical line */}
          <motion.div
            className="timeline-line"
            initial={{ scaleY: 0 }}
            animate={inView ? { scaleY: 1 } : {}}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />

          {milestones.map((milestone, i) => (
            <TimelineItem key={i} milestone={milestone} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
