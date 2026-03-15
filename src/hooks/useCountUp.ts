"use client";

import { useEffect, useRef, useState } from "react";

type UseCountUpOptions = {
  target: number;
  duration?: number;
};

export function useCountUp({ target, duration = 1500 }: UseCountUpOptions) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const hasAnimatedRef = useRef(false);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const element = ref.current;

    if (!element || hasAnimatedRef.current) {
      return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      hasAnimatedRef.current = true;
      setValue(target);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || hasAnimatedRef.current) {
          return;
        }

        hasAnimatedRef.current = true;
        const start = performance.now();

        const tick = (timestamp: number) => {
          const progress = Math.min((timestamp - start) / duration, 1);
          setValue(target * progress);

          if (progress < 1) {
            animationFrameRef.current = window.requestAnimationFrame(tick);
            return;
          }

          setValue(target);
        };

        animationFrameRef.current = window.requestAnimationFrame(tick);
        observer.disconnect();
      },
      { threshold: 0.35 }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();

      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [duration, target]);

  return {
    ref,
    value,
  };
}
