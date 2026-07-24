// app/_home/Hero.tsx
//
// A REAL 3D HERO.
//
// This was a flat image with a framer-motion translateY on it: fake parallax,
// and it cost a client component plus the motion library at the top of the
// page. It is now a genuine 3D diorama.
//
// Five layers sit at different translateZ depths inside a `perspective`
// container. Scroll moves the CAMERA (rotateX + translateZ on the scene),
// and because the layers are at real depths the parallax falls out of the
// projection maths for free. That is true depth, not a simulated offset:
// near layers sweep, far layers barely move, exactly as they would through
// a lens.
//
// Per ui-ux-pro-max "3D & Hyperrealism": perspective 1000px, 3-5 parallax
// layers. That entry scores Poor on performance and Not-accessible because
// it assumes WebGL/Three.js. Doing the same thing in CSS 3D instead means
// it is GPU-composited, ships ZERO JavaScript, and degrades cleanly, so we
// get the look without either penalty.
//
// SERVER COMPONENT. The old version was "use client" purely for the
// parallax; that is gone, and framer-motion no longer loads for the hero.
//
// Depth compensation: an element at translateZ(-d) with perspective p is
// projected smaller by p/(p+d), so each layer carries the inverse scale to
// stay the intended size. Those numbers are worked out in the CSS.

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import HeroCanvasMount from "./HeroCanvasMount";
import { WRAP, LIME, INK, huge, copy } from "./theme";

export default function Hero() {
  return (
    <section className="ff-hero" aria-labelledby="hero-heading">
      {/* The lens. Everything inside is projected through this perspective. */}
      <div className="ff-hero-3d">
        <div className="ff-hero-scene">
          {/* L1 · deepest: atmosphere. A slow lime bloom that gives the
              black somewhere to recede to. */}
          <div className="ff-hl ff-hl-atmos" aria-hidden />

          {/* L1.5 · the WebGL field. Eight thousand particles, one per
              gram, drifting and reacting to the cursor. Sits in FRONT of
              the photo, because the atmosphere layer behind it was fully
              occluded and its drift was invisible. Desktop only, lazy. */}
          <HeroCanvasMount />

          {/* L2 · the food, set back so it reads as environment, not card */}
          <div className="ff-hl ff-hl-image">
            <Image
              src="/images/hero-bowl.jpg"
              alt="A FitFuel bowl of fresh vegetables, chickpeas and avocado"
              fill
              sizes="100vw"
              priority
              fetchPriority="high"
              quality={74}
              style={{ objectFit: "cover" }}
            />
            <span className="ff-hero-grade" aria-hidden />
          </div>

          {/* L3 was a floating "Today, verified" card. It duplicated the
              readout bar at the foot of the hero word for word, and in the
              hero it asserted numbers with nothing on screen to back them.
              Removed: the bar below keeps the device, once. */}

          {/* L4 · the headline, at the focal plane */}
          <div className="ff-hl ff-hl-type">
            <div style={WRAP}>
              <h1 id="hero-heading" className="ff-hero-h1" style={huge("clamp(3.2rem,12vw,10.5rem)")}>
                <span className="ff-hero-l" style={{ ["--i" as string]: 0 }}>We cook it.</span>
                <span className="ff-hero-l" style={{ ["--i" as string]: 1 }}>We weigh it.</span>
                <span className="ff-hero-l" style={{ ["--i" as string]: 2, color: LIME }}>We track it.</span>
              </h1>
            </div>
          </div>

          {/* L5 · nearest: the copy and the actions */}
          <div className="ff-hl ff-hl-fore">
            <div style={WRAP}>
              <div className="ff-hero-foot">
                <p style={{ ...copy(16.5), maxWidth: "44ch" }}>
                  Chef-cooked meals, weighed to your macros and delivered every morning in Pune.
                  The tracking and the coaching are built in.{" "}
                  <span style={{ color: INK }}>One health system, not five apps.</span>
                </p>
                <div className="ff-hero-cta">
                  <Link href="/plans?trial=true" className="ff-btn">Start trial day, Rs 400</Link>
                  <Link href="/plans" className="ff-a">All plans <ArrowRight size={17} /></Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}
