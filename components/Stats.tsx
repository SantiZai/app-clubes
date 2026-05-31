"use client";

import { useEffect, useRef } from "react";

export default function Stats() {
  const items = [
    { emoji: "🏆", value: 124, label: "Torneos jugados" },
    { emoji: "👥", value: 3200, label: "Jugadores" },
    { emoji: "📍", value: 28, label: "Clubes" },
  ];

  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const nodes = Array.from(el.querySelectorAll<HTMLElement>("[data-target]"));

    const animate = (node: HTMLElement, target: number) => {
      const duration = 900;
      let start: number | null = null;

      const step = (ts: number) => {
        if (!start) start = ts;
        const progress = Math.min((ts - start) / duration, 1);
        const current = Math.floor(progress * target);
        node.textContent = new Intl.NumberFormat("es-AR").format(current);
        if (progress < 1) requestAnimationFrame(step);
        else node.textContent = new Intl.NumberFormat("es-AR").format(target);
      };

      requestAnimationFrame(step);
    };

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            nodes.forEach((n) => {
              const t = Number(n.getAttribute("data-target") || "0");
              animate(n, t);
            });
            obs.disconnect();
          }
        });
      },
      { threshold: 0.3 }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={rootRef} className="mt-6 flex flex-wrap gap-6 items-center">
      {items.map((it) => (
        <div key={it.label} className="metric reveal">
          <div className="value text-white">
            <span data-target={it.value}>0</span>
          </div>
          <div className="label">{it.label}</div>
        </div>
      ))}
    </div>
  );
}
