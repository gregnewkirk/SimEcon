"use client";

import { useEffect, useState } from "react";
import { useSpring, useMotionValueEvent } from "framer-motion";

/**
 * Spring-physics number: the value rolls and settles with a slight bounce, like an iOS
 * widget. Respects prefers-reduced-motion by snapping.
 */
export function AnimatedNumber({
  value,
  format,
  className,
}: {
  value: number;
  format: (n: number) => string;
  className?: string;
}) {
  const reduce =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const spring = useSpring(value, { stiffness: 140, damping: 20 });
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    if (reduce) setDisplay(value);
    else spring.set(value);
  }, [value, spring, reduce]);

  useMotionValueEvent(spring, "change", (v) => {
    if (!reduce) setDisplay(v);
  });

  return <span className={className}>{format(display)}</span>;
}
