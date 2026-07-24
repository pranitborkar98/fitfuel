"use client";

// app/_home/HeroCanvas.tsx
//
// THE WEBGL HERO.
//
// Raw three.js, not react-three-fiber: R3F plus drei is a much larger
// dependency for a scene this specific, and here we only need one Points
// object, one shader and a render loop.
//
// WHAT IT IS, and why this and not a generic blob of noise:
// eight thousand particles, each one a gram. They drift in a slow field,
// they are pulled toward the cursor, and they settle. The brand line is
// "we weigh it, we track it", so the hero is thousands of individually
// tracked points behaving as one system. The metaphor is the product.
//
// COST CONTROL, because these customers are on mid-range Android over
// mobile data:
//   · loaded via next/dynamic with ssr:false, so it is never in the server
//     HTML and never blocks first paint
//   · the parent only mounts it above 900px, so no phone ever downloads it
//   · bails out entirely on prefers-reduced-motion
//   · bails out if the GPU will not give us a context
//   · pauses the RAF whenever the hero scrolls out of view, so it costs
//     nothing while you read the rest of the page
//   · capped at devicePixelRatio 2
// If any of those bail, the CSS 3D diorama underneath is what you see, and
// it is a complete hero on its own.

import { useEffect, useRef } from "react";
import * as THREE from "three";

const COUNT = 8000;

export default function HeroCanvas() {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: "high-performance" });
    } catch {
      return; // no GPU context, CSS hero stands on its own
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
    camera.position.z = 15;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);

    // ── the grams ──────────────────────────────────────────────────────
    const positions = new Float32Array(COUNT * 3);
    const seeds = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      // A wide, shallow slab so it reads as a field behind the type rather
      // than a ball floating in the middle of the frame.
      positions[i * 3] = (Math.random() - 0.5) * 46;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 24;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 14;
      seeds[i] = Math.random();
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));

    const uniforms = {
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uLime: { value: new THREE.Color("#84cc16") },
      uInk: { value: new THREE.Color("#f7f7f5") },
    };

    const mat = new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        uniform float uTime;
        uniform vec2  uPointer;
        attribute float aSeed;
        varying float vGlow;

        void main() {
          vec3 p = position;

          // Slow organic drift. Each particle keeps its own phase so the
          // field breathes instead of pulsing in lockstep.
          float t = uTime * 0.12 + aSeed * 6.2831;
          p.x += sin(t + p.y * 0.12) * 0.85;
          p.y += cos(t * 0.9 + p.x * 0.10) * 0.65;
          p.z += sin(t * 0.7 + aSeed * 3.0) * 0.55;

          // Pull toward the cursor, strongest close in. This is what makes
          // it feel alive rather than looped.
          vec2 toPointer = uPointer * vec2(23.0, 12.0) - p.xy;
          float d = length(toPointer);
          float pull = smoothstep(11.0, 0.0, d);
          p.xy += normalize(toPointer + 0.0001) * pull * 2.6;

          vGlow = pull;

          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          // Perspective-correct size, nudged up for particles near the
          // cursor so the interaction reads.
          gl_PointSize = (14.0 + pull * 26.0) / -mv.z;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uLime;
        uniform vec3 uInk;
        varying float vGlow;

        void main() {
          // Round, soft-edged point.
          vec2 c = gl_PointCoord - 0.5;
          float r = length(c);
          if (r > 0.5) discard;
          float alpha = smoothstep(0.5, 0.0, r);

          vec3 col = mix(uLime, uInk, vGlow * 0.75);
          gl_FragColor = vec4(col, alpha * (0.30 + vGlow * 0.7));
        }
      `,
    });

    const points = new THREE.Points(geo, mat);
    scene.add(points);

    // ── sizing ─────────────────────────────────────────────────────────
    const resize = () => {
      const { clientWidth: w, clientHeight: h } = el;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    // ── pointer ────────────────────────────────────────────────────────
    const target = new THREE.Vector2(0, 0);
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      target.set(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1));
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    // ── run only while visible ─────────────────────────────────────────
    let raf = 0;
    let visible = true;
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(tick);
    });
    io.observe(el);

    const clock = new THREE.Clock();
    function tick() {
      raf = 0;
      if (!visible) return; // stop burning frames off-screen
      uniforms.uTime.value = clock.getElapsedTime();
      // Ease the pointer so the field glides rather than snapping.
      uniforms.uPointer.value.lerp(target, 0.055);
      points.rotation.y = Math.sin(clock.getElapsedTime() * 0.05) * 0.09;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      geo.dispose();
      mat.dispose();
      renderer.dispose();
      el.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={host} className="ff-hero-canvas" aria-hidden />;
}
