import React, { useEffect, useRef } from "react";

const PETAL_COUNT = 18;

function randomBetween(a, b) {
  return a + Math.random() * (b - a);
}

export default function FloatingPetals() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const petals = [];
    for (let i = 0; i < PETAL_COUNT; i++) {
      const el = document.createElement("div");
      el.className = "petal";
      const size = randomBetween(8, 18);
      const startX = randomBetween(0, 100);
      const delay = randomBetween(0, 15);
      const duration = randomBetween(10, 22);
      const drift = randomBetween(-120, 120);
      const rotate = randomBetween(0, 360);
      const colors = ["#c9a84c", "#8b0000", "#e8d5b0", "#d4a853", "#f0e6d0", "#b8860b"];
      const color = colors[Math.floor(Math.random() * colors.length)];

      el.style.cssText = `
        position: fixed;
        width: ${size}px;
        height: ${size * 0.6}px;
        left: ${startX}%;
        top: -20px;
        background: ${color};
        border-radius: 50% 0 50% 0;
        opacity: ${randomBetween(0.3, 0.7)};
        animation: petalFall ${duration}s ${delay}s infinite linear;
        --drift: ${drift}px;
        --rotate: ${rotate}deg;
        pointer-events: none;
        z-index: 1;
        transform-origin: center;
      `;
      container.appendChild(el);
      petals.push(el);
    }

    return () => {
      petals.forEach((p) => p.remove());
    };
  }, []);

  return <div ref={containerRef} className="petals-container" aria-hidden="true" />;
}
