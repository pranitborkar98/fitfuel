"use client";

// app/_home/HeroCanvasMount.tsx
//
// The gate in front of the WebGL hero. Its whole job is to make sure the
// three.js bundle is downloaded by the people who benefit from it and
// nobody else.
//
//   · next/dynamic with ssr:false, so it is never in the server HTML and
//     never delays first paint or LCP
//   · only mounts above 900px, so a phone on mobile data never fetches it
//   · never mounts under prefers-reduced-motion
//   · re-evaluates on resize, so a desktop window dragged narrow unmounts
//     the canvas instead of leaving it running
//
// When it does not mount, the CSS 3D diorama in Hero.tsx is the hero. That
// is a complete design on its own, not a placeholder.

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const HeroCanvas = dynamic(() => import("./HeroCanvas"), { ssr: false });

export default function HeroCanvasMount() {
  const [ok, setOk] = useState(false);

  useEffect(() => {
    const wide = window.matchMedia("(min-width: 900px)");
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)");
    const evaluate = () => setOk(wide.matches && !calm.matches);
    evaluate();
    wide.addEventListener("change", evaluate);
    calm.addEventListener("change", evaluate);
    return () => {
      wide.removeEventListener("change", evaluate);
      calm.removeEventListener("change", evaluate);
    };
  }, []);

  if (!ok) return null;
  return <HeroCanvas />;
}
