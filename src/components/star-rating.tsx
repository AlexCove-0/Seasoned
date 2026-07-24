"use client";

import { useState } from "react";

/** Click the left/right half of a star to set a half-star rating (0.5-5). */
export function StarRating({
  value,
  onChange,
  size = "text-xl",
}: {
  value: number;
  onChange: (rating: number) => void;
  size?: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const shown = hover ?? value;

  function handleClick(star: number, e: React.MouseEvent<HTMLButtonElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const half = e.clientX - rect.left < rect.width / 2;
    onChange(half ? star - 0.5 : star);
  }

  function handleMove(star: number, e: React.MouseEvent<HTMLButtonElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const half = e.clientX - rect.left < rect.width / 2;
    setHover(half ? star - 0.5 : star);
  }

  return (
    <span className={`inline-flex ${size} text-amber-500`} onMouseLeave={() => setHover(null)}>
      {[1, 2, 3, 4, 5].map((star) => {
        const fill = Math.min(1, Math.max(0, shown - (star - 1)));
        return (
          <button
            key={star}
            type="button"
            onMouseMove={(e) => handleMove(star, e)}
            onClick={(e) => handleClick(star, e)}
            aria-label={`Rate ${star} stars`}
            className="relative leading-none"
          >
            <span className="text-neutral-300 dark:text-neutral-700">★</span>
            <span
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${fill * 100}%` }}
            >
              ★
            </span>
          </button>
        );
      })}
    </span>
  );
}

export function StarDisplay({ value, size = "text-base" }: { value: number; size?: string }) {
  return (
    <span className={`inline-flex ${size} text-amber-500`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const fill = Math.min(1, Math.max(0, value - (star - 1)));
        return (
          <span key={star} className="relative leading-none">
            <span className="text-neutral-300 dark:text-neutral-700">★</span>
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              ★
            </span>
          </span>
        );
      })}
    </span>
  );
}
