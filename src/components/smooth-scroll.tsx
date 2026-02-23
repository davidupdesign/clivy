"use client";

import { useEffect } from "react";
import Lenis from "lenis";

export default function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      prevent: (node: Element) => {
        // Let native scroll work inside textareas and any scrollable container
        if (node.hasAttribute?.("data-lenis-prevent")) return true;
        if (node.closest?.("[data-lenis-prevent]")) return true;
        return false;
      },
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // expose lenis instance globally so other components can use it (e.g. scroll-to-top)
    (window as any).__lenis = lenis;

    return () => {
      lenis.destroy();
      delete (window as any).__lenis;
    };
  }, []);

  return null;
}
