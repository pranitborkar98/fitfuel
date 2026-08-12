// app/_ui/Kit.tsx
//
// The homepage's devices, as components any page can use.
//
// These are deliberately thin. The system is a set of decisions about rules,
// spacing and type, not a component library with variants and props for every
// case: a page that needs something these do not cover should compose from
// theme.ts and kit.module.css directly rather than growing a prop here.
//
// Everything is a server component. Nothing takes a handler, so a page that
// needs interaction wraps its own client island around these, exactly as the
// homepage does.

import type { CSSProperties, ReactNode } from "react";

import k from "./kit.module.css";
import { DIM, display, body } from "./theme";

export { k };

/** The section marker: one mono label, one hairline. Nothing else. */
export function Idx({ label }: { label: string }) {
  return (
    <div className={k.idx}>
      <span className={k.idxLabel}>{label}</span>
      <span className={k.idxRule} aria-hidden="true" />
    </div>
  );
}

/**
 * A section opening: the marker, then a heading and its deck side by side.
 * `size` is expected to be a clamp() with a vw middle term, because type on
 * this site scales with the viewport rather than stepping at breakpoints.
 */
export function Head({
  label,
  id,
  title,
  deck,
  size = "clamp(2.1rem,5.6vw,4.2rem)",
  max = "14ch",
}: {
  label?: string;
  id?: string;
  title: ReactNode;
  deck?: ReactNode;
  size?: string;
  max?: string;
}) {
  return (
    <>
      {label && <Idx label={label} />}
      <div className={k.head}>
        <div className={k.rise}>
          <h2 id={id} style={{ ...display(size), maxWidth: max }}>
            {title}
          </h2>
        </div>
        {deck && (
          <div className={k.rise}>
            {typeof deck === "string" ? <p style={{ ...body(16.5), maxWidth: "48ch" }}>{deck}</p> : deck}
          </div>
        )}
      </div>
    </>
  );
}

/** A labelled rule for a block inside a section. */
export function SubHead({ children }: { children: ReactNode }) {
  return <div className={k.subHead}>{children}</div>;
}

/**
 * A directory row. Signature device 3, and what replaces a card grid for an
 * index: hairline-separated, shifts right and takes a lime edge on hover.
 * `cols` is a grid-template-columns string so each caller sets its own shape.
 */
export function Row({
  cols,
  href,
  children,
  style,
}: {
  cols: string;
  href?: string;
  children: ReactNode;
  style?: CSSProperties;
}) {
  const props = { className: k.row, style: { gridTemplateColumns: cols, ...style } };
  return href ? (
    <a href={href} {...props}>
      {children}
    </a>
  ) : (
    <div {...props}>{children}</div>
  );
}

/** The arrow that leans out as a row is hovered. */
export function Go() {
  return (
    <span className={k.rowGo} aria-hidden="true">
      &rarr;
    </span>
  );
}

/** A hairline grid. `cols` sets the track count; the 1px gap is the rule. */
export function Tiles({
  cols = 3,
  children,
  style,
}: {
  cols?: number;
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div className={k.tiles} style={{ ["--cols" as string]: cols, ...style }}>
      {children}
    </div>
  );
}

export function Tile({ href, children }: { href?: string; children: ReactNode }) {
  return href ? (
    <a href={href} className={k.tile}>
      {children}
    </a>
  ) : (
    <div className={k.tile}>{children}</div>
  );
}

/**
 * A real <table>. If it is tabular data it goes in one of these: a grid of
 * divs cannot be parsed by assistive tech, and this is the device the system
 * names for exactly that reason. `caption` is required and screen-reader only.
 */
export function Spec({
  caption,
  head,
  children,
  minWidth,
}: {
  caption: string;
  head: string[];
  children: ReactNode;
  minWidth?: number;
}) {
  return (
    <div className={k.specWrap}>
      <table className={k.spec} style={minWidth ? { minWidth } : undefined}>
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            {head.map((h) => (
              <th key={h} scope="col">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

/**
 * A macro split as one stacked bar. Every share must also be printed as text
 * beside it: colour is never the only channel that carries a figure.
 */
export function Split({ parts }: { parts: { pct: number; colour: string; name: string }[] }) {
  return (
    <span className={k.split} aria-hidden="true">
      {parts.map((p) => (
        <span key={p.name} title={p.name} style={{ width: `${p.pct}%`, background: p.colour }} />
      ))}
    </span>
  );
}

/** Fine print, at the one grey that clears AA for it. */
export function Fine({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return <p style={{ ...body(13.5), color: DIM, ...style }}>{children}</p>;
}
