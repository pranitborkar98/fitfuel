// app/_ui/Page.tsx
//
// PAGE-LEVEL CHROME, as components.
//
// Kit.tsx gives a page the devices that go inside a section. This gives it the
// frame: the shell and its grain, the masthead, the note, the closing band and
// the clause list the legal pages are set in.
//
// The split matters. A page composes Kit devices freely and differently every
// time — that is the point, the structure of every block is supposed to vary.
// The frame is the opposite: it should be identical on all twenty interior
// pages, because that repetition is what makes them read as one site. So the
// frame is components with almost no props, and the middle is left open.
//
// Everything here is a server component.

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

import { Idx } from "./Kit";
import k from "./kit.module.css";
import p from "./page.module.css";
import { WRAP } from "./theme";

export { p };

/** The generated grain. One declaration, rather than the six hand-copied data
 *  URIs this replaced. */
export function Grain() {
  return <div className={p.grain} aria-hidden="true" />;
}

/**
 * The page frame: `<main>`, the grain, and a stacking context that keeps
 * content above it. A page's own sections go straight inside.
 */
export function Shell({ children }: { children: ReactNode }) {
  return (
    <main className={p.shell}>
      <Grain />
      <div className={p.body}>{children}</div>
    </main>
  );
}

/** The 1180 measure. Re-exported as a component so pages stop spreading WRAP
 *  into a div by hand. */
export function Wrap({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return <div style={{ ...WRAP, ...style }}>{children}</div>;
}

/**
 * The masthead every interior page opens with: mono label on a hairline, the
 * headline at display scale, the deck offset into the narrow column.
 *
 * `title` takes a string. The closing full stop is added here and coloured
 * lime, so that no page has to decide whether to punctuate its own headline:
 * they all do, identically, and it is the accent's one job up there.
 */
export function Masthead({
  label,
  title,
  deck,
  meta,
  stop = true,
}: {
  label: string;
  title: ReactNode;
  deck?: ReactNode;
  meta?: { k: string; v: string }[];
  stop?: boolean;
}) {
  return (
    <header className={p.masthead}>
      <Wrap>
        <Idx label={label} />
        <div className={p.mastGrid}>
          <h1 className={p.h1}>
            {title}
            {stop && <span className={p.stop}>.</span>}
          </h1>
          {deck && (typeof deck === "string" ? <p className={p.deck}>{deck}</p> : deck)}
        </div>
        {meta && meta.length > 0 && (
          <div className={p.meta}>
            {meta.map((m) => (
              <span key={m.k}>
                {m.k} <span className={p.metaVal}>{m.v}</span>
              </span>
            ))}
          </div>
        )}
      </Wrap>
    </header>
  );
}

/**
 * A callout. Replaces the rounded lime-tinted box that had propagated onto
 * most interior pages: recessed, square, one 2px lime edge.
 */
export function Note({
  children,
  style,
  tone = "accent",
}: {
  children: ReactNode;
  style?: CSSProperties;
  /** `warn` is for safety copy only: allergens, medical scope. Not emphasis. */
  tone?: "accent" | "warn";
}) {
  return (
    <div className={tone === "warn" ? `${p.note} ${p.noteWarn}` : p.note} style={style}>
      {children}
    </div>
  );
}

/**
 * The closing band. Full-bleed, hairline-welded, flush left with the action in
 * the right column.
 *
 * This is the piece that replaces, on every page at once, the centred
 * `linear-gradient(145deg,#111,#0e0e0e)` card with a radius-10 pill button in
 * the middle of it.
 */
export function Band({
  title,
  body,
  href,
  cta,
  secondary,
}: {
  title: string;
  body: string;
  href: string;
  cta: string;
  secondary?: { href: string; label: string };
}) {
  return (
    <section className={p.band}>
      <Wrap>
        <div className={p.bandGrid}>
          <h2 className={p.bandTitle}>{title}</h2>
          <div>
            <p className={p.bandBody}>{body}</p>
            {/* The band's buttons are Kit's, not new ones. */}
            <div className={k.actions}>
              <Link href={href} className={k.btn}>
                <span>{cta}</span>
              </Link>
              {secondary && (
                <Link href={secondary.href} className={k.ghost}>
                  {secondary.label}
                </Link>
              )}
            </div>
          </div>
        </div>
      </Wrap>
    </section>
  );
}

/** The numbered clause list the legal pages are set in. */
export function Clauses({ children }: { children: ReactNode }) {
  return <div className={p.clauses}>{children}</div>;
}

export function Clause({
  no,
  title,
  id,
  children,
}: {
  no: string;
  title: string;
  id?: string;
  children: ReactNode;
}) {
  return (
    <section className={p.clause} id={id}>
      <div className={p.clauseNo}>{no}</div>
      <div>
        <h2 className={p.clauseTitle}>{title}</h2>
        <div className={p.prose}>{children}</div>
      </div>
    </section>
  );
}

/** A measured prose column, for body copy outside a clause. */
export function Prose({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div className={p.prose} style={style}>
      {children}
    </div>
  );
}

/** An inline link inside running prose. */
export function A({ href, children }: { href: string; children: ReactNode }) {
  const ext = href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:");
  return ext ? (
    <a href={href} className={p.a}>
      {children}
    </a>
  ) : (
    <Link href={href} className={p.a}>
      {children}
    </Link>
  );
}

/** Vertical rhythm between the blocks of a page body. */
export function Stack({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div className={p.stack} style={style}>
      {children}
    </div>
  );
}
