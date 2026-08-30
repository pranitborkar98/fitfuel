"use client";

// app/supplements/SupplementsLanding.tsx
//
// The public supplements catalogue, on the Instrument System.
//
// THIS PAGE WAS THE ARCHETYPE. The reject list names, as a single
// item, "centered hero with a chip, a headline and two pill buttons". This
// page had exactly that, over a 700x500 radial-gradient ellipse glow, with
// gradient text on the headline and a `pulse-glow` keyframe animating a lime
// box-shadow from 20px to 40px on the primary CTA on a 3s loop, forever.
//
// It also failed AA badly on its own subject matter: body copy ran at
// rgba(255,255,255,0.45) (~3.4:1) and the trust row at rgba(255,255,255,0.3)
// (~2.2:1), on a page making dosage and contraindication claims.
//
// THE ACCENT FIELD IS GONE. `supp.accent` was threaded through eighteen call
// sites here: a top border, a background tint, a chip, two buttons, a price, a
// tick, two panels. It had already been flattened to a single constant in the
// data layer, so all eighteen were painting the same colour through a field
// that no longer varied. The field is removed from the type; lime is applied
// directly where it means something, which is one thing per section.
//
// Evidence strength is filled segments on a hairline scale now, rather than a
// five-hue green-to-slate ramp, and the label is printed beside it so the
// meaning never rests on the segments alone.
//
// The modal also gained the three things an overlay requires and
// it had none of: body scroll lock, focus moved in, focus restored on close.

import { useState, useMemo, useEffect, useId, useRef } from "react";
import Link from "next/link";
import { CheckCircle2, X, Shield, Truck, Star } from "lucide-react";

import {
  STACKS,
  GOAL_META,
  CATEGORY_META,
  EVIDENCE_META,
  RANK_MAX,
  type Supplement,
  type SupplementGoal,
  type SupplementCategory,
} from "@/lib/supplements-data";
import { NETWORK_LABEL, type SupplementBuyLink } from "@/lib/supplements-types";
import type { SupplementRecommendation } from "@/lib/supplement-recommender";
import { Head, Idx, Tile, Tiles, k } from "@/app/_ui/Kit";
import { Band, Masthead, Shell, Wrap } from "@/app/_ui/Page";
import { DIM, INK, SECTION, body, figure, label, num, sub } from "@/app/_ui/theme";
import s from "./supplements.module.css";

type SupplementWithLinks = Supplement & {
  links?: SupplementBuyLink[];
  imageUrl?: string | null;
  brandName?: string | null;
  isFeatured?: boolean;
};

const GOALS: SupplementGoal[] = ["muscle_gain", "weight_loss", "balanced", "performance"];

const CATEGORIES: Array<"all" | SupplementCategory> = [
  "all", "protein", "performance", "recovery", "vitamins", "minerals",
  "adaptogens", "joints", "gut", "weight", "hormones", "cognitive", "sleep",
];

/**
 * Shown when a supplement has no product photo. This was the raw emoji from
 * the data file rendered at 44px and 64px as the primary product visual;
 * emoji are rejected on sight, and a pill glyph standing in for a product
 * shot reads as a missing asset either way.
 */
function Monogram({ name, size }: { name: string; size: number }) {
  const initials = name
    .replace(/[^A-Za-z0-9 ]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
  return (
    <span aria-hidden="true" style={{ ...figure(`${size}px`, "var(--fk-line-2)"), userSelect: "none" }}>
      {initials || "FF"}
    </span>
  );
}

/** Ordinal strength as segments. The label is always printed alongside. */
function Scale({ rank, max = RANK_MAX }: { rank: number; max?: number }) {
  return (
    <span className={s.scale} aria-hidden="true">
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={i < rank ? `${s.seg} ${s.segOn}` : s.seg} />
      ))}
    </span>
  );
}

function Thumb({ supp, size }: { supp: SupplementWithLinks; size: number }) {
  return (
    <span className={s.thumb} style={{ width: size, height: size }}>
      {supp.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={supp.imageUrl} alt="" />
      ) : (
        <Monogram name={supp.name} size={Math.round(size * 0.42)} />
      )}
    </span>
  );
}

// ── detail modal ─────────────────────────────────────────────────────────────

function SupplementModal({ supp, onClose }: { supp: SupplementWithLinks; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const evidence = EVIDENCE_META[supp.evidenceLevel];

  useEffect(() => {
    const prev = document.body.style.overflow;
    const opener = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key !== "Tab") return;
      const focusable = Array.from(
        modalRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((node) => node.offsetParent !== null);
      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
      opener?.focus?.();
    };
  }, [onClose]);

  const facts = [
    { k: "Dosage", v: supp.dosage },
    { k: "Timing", v: supp.timing },
    { k: "Onset", v: supp.onsetTime },
    { k: "Typical price", v: supp.priceRange },
  ].filter((f) => f.v);

  return (
    <div
      className={s.backdrop}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={s.modal} ref={modalRef}>
        <div className={s.modalHead}>
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start", minWidth: 0 }}>
            <Thumb supp={supp} size={64} />
            <div style={{ minWidth: 0 }}>
              <span style={label()}>{CATEGORY_META[supp.category].label}</span>
              <h2 id={titleId} style={{ ...sub("clamp(1.6rem,3.4vw,2.4rem)"), margin: "10px 0 8px" }}>
                {supp.name}
              </h2>
              <p style={body(14.5)}>{supp.tagline}</p>
            </div>
          </div>
          <button ref={closeRef} type="button" className={s.close} onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className={s.modalBody}>
          <p style={body(15.5)}>{supp.description}</p>

          {facts.length > 0 && (
            <div>
              <span style={{ ...label(), marginBottom: 12 }}>How to take it</span>
              <div className={s.facts}>
                {facts.map((f) => (
                  <div key={f.k} className={s.fact}>
                    <span style={label()}>{f.k}</span>
                    <span className={s.factVal}>{f.v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <span style={{ ...label(), marginBottom: 12 }}>Evidence</span>
            <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
              <Scale rank={evidence.rank} />
              <span style={num("14px", INK)}>{evidence.label}</span>
              {supp.studyCount && <span style={num("13px", DIM)}>{supp.studyCount}</span>}
            </div>
            {supp.keyStudyFindings.length > 0 && (
              <ul style={{ listStyle: "none", padding: 0, margin: "16px 0 0" }}>
                {supp.keyStudyFindings.map((f) => (
                  <li key={f} style={{ display: "flex", gap: 10, marginBottom: 9 }}>
                    <CheckCircle2 size={13} color="var(--fk-green)" style={{ flexShrink: 0, marginTop: 3 }} />
                    <span style={body(14)}>{f}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {supp.benefits.length > 0 && (
            <div>
              <span style={{ ...label(), marginBottom: 12 }}>Benefits</span>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {supp.benefits.map((b) => (
                  <li key={b} style={{ display: "flex", gap: 10, marginBottom: 9 }}>
                    <CheckCircle2 size={13} color="var(--fk-green)" style={{ flexShrink: 0, marginTop: 3 }} />
                    <span style={body(14)}>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {supp.indiaNote && (
            <div>
              <span style={{ ...label(), marginBottom: 10 }}>In India</span>
              <p style={body(14.5)}>{supp.indiaNote}</p>
            </div>
          )}

          {/* `warnings` is a single string on the type, not a list. */}
          {supp.warnings && (
            <div className={s.warn}>
              <span style={{ ...label("#f87171"), marginBottom: 10 }}>Before you take this</span>
              <p style={{ ...body(14), color: INK }}>{supp.warnings}</p>
            </div>
          )}

          {supp.links && supp.links.length > 0 && (
            <div>
              <span style={{ ...label(), marginBottom: 12 }}>Where to buy</span>
              <div className={s.buys}>
                {supp.links.map((l) => (
                  <a
                    key={l.id}
                    href={l.clickUrl}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className={s.buy}
                  >
                    <span>
                      <span style={{ ...sub("1.1rem"), display: "block" }}>
                        {l.merchantLabel || NETWORK_LABEL[l.network] || l.network}
                      </span>
                      {l.notes && <span style={{ ...body(13), marginTop: 4 }}>{l.notes}</span>}
                    </span>
                    <span style={num("15px", INK)}>
                      {l.priceRs ? `Rs ${l.priceRs.toLocaleString("en-IN")}` : "See price"}
                    </span>
                  </a>
                ))}
              </div>
              <p style={{ ...body(13), color: DIM, marginTop: 12 }}>
                We may earn a commission on these links. It does not change what you pay, and it
                does not decide what is listed here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── card ─────────────────────────────────────────────────────────────────────

function SupplementCard({ supp, onClick }: { supp: SupplementWithLinks; onClick: () => void }) {
  return (
    /* THE ANCHOR 46 LINKS HAVE BEEN AIMING AT. `/supplements#creatine` is
       generated by the homepage's supplement cards AND by this page's own
       stack list two hundred lines up — and until now NOTHING on this page
       carried an id, so all of them landed at the top of the marketing header
       and the reader had to find their supplement by eye.

       `supp.id` IS the slug: lib/supplements-db.ts maps `id: r.slug`, which is
       the same string both link generators interpolate. */
    <button type="button" id={supp.id} className={s.card} onClick={onClick}>
      <span className={s.cardTop}>
        <span style={{ minWidth: 0 }}>
          <span style={label()}>{CATEGORY_META[supp.category].label}</span>
          <h3 className={s.name} style={{ marginTop: 10 }}>
            {supp.name}
          </h3>
        </span>
        <Thumb supp={supp} size={52} />
      </span>

      <p style={{ ...body(14), maxWidth: "36ch" }}>{supp.tagline}</p>

      <span className={s.flags}>
        {supp.priceRange && <span className={s.price}>{supp.priceRange}</span>}
        {supp.popular && <span className={s.flagOn}>Popular</span>}
        {supp.veganFriendly && <span>Vegan</span>}
      </span>
    </button>
  );
}

// ── page ─────────────────────────────────────────────────────────────────────

export default function SupplementsLanding({
  isLoggedIn,
  supplements,
  recommended = null,
}: {
  isLoggedIn: boolean;
  supplements: SupplementWithLinks[];
  /** Signed-in shortlist. Rendered inside the flow, under the readout. */
  recommended?: SupplementRecommendation | null;
}) {
  const [activeGoal, setActiveGoal] = useState<SupplementGoal>("muscle_gain");
  const [catFilter, setCatFilter] = useState<"all" | SupplementCategory>("all");
  const [selected, setSelected] = useState<SupplementWithLinks | null>(null);

  const previewStack = STACKS[activeGoal]
    .map((id) => supplements.find((x) => x.id === id)!)
    .filter(Boolean);

  const filtered = useMemo(
    () => (catFilter === "all" ? supplements : supplements.filter((x) => x.category === catFilter)),
    [catFilter, supplements],
  );

  const goalMeta = GOAL_META[activeGoal];

  return (
    <Shell>
      <Masthead
        label="Supplements"
        title="Built for your goal, not for a shelf"
        deck="An evidence-labelled supplement directory with study context, common label amounts and India-specific price ranges. It is guidance, not a prescription or a FitFuel product sale."
        meta={[
          { k: "Catalogued", v: String(supplements.length) },
          { k: "Categories", v: String(CATEGORIES.length - 1) },
          { k: "Paywalled", v: "None" },
        ]}
      />

      <div className={k.readout} style={{ ["--cells" as string]: 3 }}>
        {[
          { Icon: Shield, l: "Evidence", v: "Tier shown" },
          { Icon: Truck, l: "Purchase", v: "External sellers" },
          { Icon: Star, l: "Pricing", v: "India context" },
        ].map(({ Icon, l, v }) => (
          <div key={l} className={k.cell}>
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Icon size={13} color="var(--fk-ink-3)" aria-hidden="true" />
              <span style={label()}>{l}</span>
            </span>
            <span style={sub("clamp(1.3rem,2.6vw,1.9rem)")}>{v}</span>
          </div>
        ))}
      </div>

      {/* ── picked for you ─────────────────────────────────────────────────
          Only for a signed-in visitor with a goal on file. Directory rows, so
          it reads as a shortlist rather than a second hero. */}
      {recommended && (
        <section style={{ ...SECTION, paddingBottom: 0 }}>
          <Wrap>
            <Idx label={`Picked for you, built for ${recommended.goalLabel}`} />
            <div className={k.rows}>
              {recommended.items.map((it) => (
                <a
                  key={it.slug}
                  className={k.row}
                  href={it.buyUrl ?? `/supplements#${it.slug}`}
                  style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,1.4fr) 28px" }}
                  {...(it.buyUrl
                    ? { target: "_blank", rel: "noopener noreferrer sponsored" }
                    : {})}
                >
                  <span style={sub("clamp(1.15rem,2vw,1.5rem)")}>{it.name}</span>
                  <span style={{ ...body(14), maxWidth: "48ch" }}>{it.tagline ?? ""}</span>
                  <span className={k.rowGo} aria-hidden="true">
                    &rarr;
                  </span>
                </a>
              ))}
            </div>
          </Wrap>
        </section>
      )}

      {/* ── the stack preview ──────────────────────────────────────────── */}
      <section style={SECTION}>
        <Wrap>
          <Head
            label="Goal shortlist"
            title="Start with what you are working toward"
            deck={goalMeta.description}
            size="clamp(2rem,5vw,3.6rem)"
          />

          <div className={k.seg} style={{ margin: "clamp(24px,3.4vw,38px) 0" }}>
            {GOALS.map((g) => (
              <button
                key={g}
                type="button"
                className={activeGoal === g ? k.segOn : undefined}
                aria-pressed={activeGoal === g}
                onClick={() => setActiveGoal(g)}
              >
                {GOAL_META[g].label}
              </button>
            ))}
          </div>

          <div className={s.stack}>
            {previewStack.map((x) => (
              <SupplementCard key={x.id} supp={x} onClick={() => setSelected(x)} />
            ))}
          </div>

          <div className={k.actions} style={{ marginTop: "clamp(24px,3vw,34px)" }}>
            <Link
              href={
                isLoggedIn ? "/dashboard/supplements" : "/auth/signin?callbackUrl=/dashboard/supplements"
              }
              className={k.btn}
            >
              <span>See my account shortlist</span>
            </Link>
            <a href="#catalogue" className={k.ghost}>
              Browse all {supplements.length}
            </a>
          </div>
        </Wrap>
      </section>

      {/* ── the catalogue ──────────────────────────────────────────────── */}
      <section style={SECTION} id="catalogue">
        <Wrap>
          <Head
            label="Full catalogue"
            title="Everything, nothing locked"
            deck="No premium gate and no sign-in wall. Every entry lists its dosage, timing, evidence and typical India price."
            size="clamp(2rem,5vw,3.6rem)"
          />

          <div style={{ margin: "clamp(24px,3.4vw,38px) 0" }}>
            <Idx label="Filter by category" />
            <div className={k.chips}>
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={catFilter === c ? `${k.chip} ${k.chipOn}` : k.chip}
                  aria-pressed={catFilter === c}
                  onClick={() => setCatFilter(c)}
                >
                  {c === "all" ? "All" : CATEGORY_META[c].label}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <p style={body(15.5)}>Nothing in this category yet.</p>
          ) : (
            <div className={s.grid}>
              {filtered.map((x) => (
                <SupplementCard key={x.id} supp={x} onClick={() => setSelected(x)} />
              ))}
            </div>
          )}
        </Wrap>
      </section>

      {/* ── how we pick ────────────────────────────────────────────────── */}
      <section style={SECTION}>
        <Wrap>
          <Head
            label="How we pick"
            title="Three rules for this list"
            size="clamp(1.9rem,4.6vw,3.2rem)"
            max="16ch"
          />
          <Tiles cols={3} style={{ marginTop: "clamp(26px,3.6vw,42px)" }}>
            {[
              {
                t: "Evidence first",
                d: "Every entry carries its evidence tier and study count. Where the research is thin, the page says so rather than leaving it out.",
              },
              {
                t: "Study-linked amounts",
                d: "We separate amounts used in cited research from product marketing. Your clinician still decides what is appropriate for you.",
              },
              {
                t: "India pricing",
                d: "Rupee ranges and local availability, because a US price beside an import-only note is not a recommendation.",
              },
            ].map((x) => (
              <Tile key={x.t}>
                <span style={label()}>{x.t}</span>
                <p style={{ ...body(14.5), marginTop: 2 }}>{x.d}</p>
              </Tile>
            ))}
          </Tiles>
        </Wrap>
      </section>

      <Band
        title="Food first, supplements second"
        body="Supplements fill gaps. The plan closes them. Start with meals cooked to your macros, then add only what your intake is actually missing."
        href="/plans"
        cta="See the plans"
        secondary={{ href: "/medical-disclaimer", label: "Medical disclaimer" }}
      />

      {selected && <SupplementModal supp={selected} onClose={() => setSelected(null)} />}
    </Shell>
  );
}
