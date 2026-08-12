"use client";

// app/_hp/Film.tsx
//
// SEVEN BEATS AND AN HOUR LIST. One day, 04:00 to the Sunday review.
//
// WHY THIS IS NOT THE PROTOTYPE'S DRUM. The design turns these seven on a 3D
// carousel: `perspective: 1500px`, each face at `rotateY(51.43deg)
// translateZ(370px)`, auto-advancing every six seconds. Three problems, and they
// compound. Perspective on a rotating carousel is the `v2Deal` device
// the review deleted. A six-second auto-advance moves the content out
// from under a reader who is still reading it. And backface-hidden faces mean
// six of the seven beats are in the DOM but invisible, which is a bad trade for
// a section whose whole job is that the kitchen is real.
//
// So the frame swaps and the list is the control. Same seven stops, same copy,
// same photographs, one moving part, and every beat reachable by keyboard.
//
// PHOTOGRAPHS ARE RESOLVED, NOT ASSIGNED. slot() returns null for the four beats
// with no honest stand-in in public/images, and those render as a plate: the
// hour at headline scale over a hairline. That is the rule from
// lib/site-images.ts, and it is why 08:00 is not illustrated with a bowl of
// vegetables and the Sunday review is not illustrated with supplement jars.
//
// CLIENT COMPONENT: it is a control. Every frame's text is in the DOM for
// assistive tech via the list, which carries the hour and the line for all seven.

import { useState } from "react";
import Image from "next/image";

import v from "./v2.module.css";
import { INK, MUTE, DIM, LIME, RULE, BG, PANEL_2, MONO, sub, body, figure } from "./theme";

export type Beat = {
  time: string;
  line: string;
  copy: string;
  tag: string;
  /** Resolved server-side by slot(); null means render the plate. */
  src: string | null;
  ai: boolean;
  alt: string;
  duo: boolean;
};

export default function Film({ beats }: { beats: Beat[] }) {
  const [i, setI] = useState(0);
  const b = beats[i]!;

  return (
    <div className={v.film}>
      <figure className={v.frame}>
        {b.src ? (
          <>
            <Image
              src={b.src}
              alt={b.alt}
              fill
              sizes="(max-width: 980px) 100vw, 50vw"
              quality={75}
            />
            {b.duo && <span className={v.frameDuo} aria-hidden="true" />}
            <span className={v.frameScrim} aria-hidden="true" />
            <span className={v.frameHour}>{b.time}</span>
            {b.ai && (
              <figcaption className="sr-only">
                Illustrative AI-generated image. Not a photograph of our kitchen.
              </figcaption>
            )}
          </>
        ) : (
          /* The plate. Not aria-hidden: with no photograph, this IS the hour for
             a screen reader too. */
          <div className={v.framePlate}>
            <span style={{ ...figure("clamp(3.4rem,7vw,5.6rem)"), display: "block" }}>{b.time}</span>
          </div>
        )}

        <figcaption className={v.frameBody}>
          <b style={{ ...sub("clamp(1.4rem,2.6vw,2rem)"), display: "block" }}>{b.line}</b>
          <p style={{ ...body(14), color: b.src ? "#c6c6c0" : MUTE, marginTop: 10, maxWidth: "46ch" }}>
            {b.copy}
          </p>
        </figcaption>
      </figure>

      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            paddingBottom: 12,
            borderBottom: `1px solid ${RULE}`,
            fontFamily: MONO,
            fontSize: 12,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: DIM,
          }}
        >
          <span>Seven stops, one day</span>
          <span style={{ color: LIME }}>{b.time}</span>
        </div>

        <ol className={v.hourList}>
          {beats.map((x, n) => {
            const on = n === i;
            return (
              <li key={x.time}>
                <button
                  type="button"
                  onClick={() => setI(n)}
                  aria-current={on ? "step" : undefined}
                  className={`${v.row} ${v.rowBtn} ${v.hour}`}
                  style={{
                    background: on ? PANEL_2 : BG,
                    borderLeftColor: on ? LIME : "transparent",
                  }}
                >
                  <span style={{ fontFamily: MONO, fontSize: 12.5, letterSpacing: "0.1em", color: on ? LIME : DIM }}>
                    {x.time}
                  </span>
                  <span style={{ ...sub("19px"), color: on ? INK : MUTE }}>{x.line}</span>
                  <span style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.14em", color: DIM }}>
                    {x.tag}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
