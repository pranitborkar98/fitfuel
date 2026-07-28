// app/_hp/Supplements.tsx
//
// SUPPLEMENTS, AND THE NUTRABAY AFFILIATION, STATED PLAINLY.
//
// We do not manufacture, warehouse or ship supplements. We research them and we
// link out, and Nutrabay pays us a commission when you buy through that link.
// Saying so in the section itself — not in a footnote, not on a separate page —
// is both the legal position and the persuasive one: the reason to trust our
// stack advice is precisely that we are not selling you our own tub.
//
// Counts come from the database (SupplementCategory, Supplement), so the
// headline number cannot drift from what /supplements actually lists.
//
// SERVER COMPONENT.

import Link from "next/link";
import Image from "next/image";

import { prisma } from "@/lib/prisma";
import s from "./hp.module.css";
import Idx from "./Idx";
import { WRAP, SECTION, PANEL, INK, DIM, LIME, display, sub, body, label, figure } from "./theme";

type Cat = { slug: string; name: string; n: number };

async function getCats(): Promise<{ cats: Cat[]; total: number }> {
  try {
    const rows = await prisma.supplementCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { slug: true, name: true, _count: { select: { supplements: true } } },
    });
    const cats: Cat[] = rows
      .map((r) => ({ slug: r.slug, name: r.name, n: r._count.supplements }))
      .filter((c) => c.n > 0);
    const total = await prisma.supplement.count({ where: { isActive: true } });
    return { cats, total };
  } catch {
    return { cats: [], total: 0 };
  }
}

/* What the recommender actually branches on (lib/supplement-recommender.ts). */
const GOALS: [string, string][] = [
  ["Muscle gain", "Protein and creatine first, then the recovery layer"],
  ["Weight loss", "Protein to hold muscle, plus the deficiency gaps a cut opens"],
  ["Balanced", "Fill what the food misses, nothing else"],
  ["Performance", "Creatine, beta-alanine, electrolytes, timed to the session"],
];

export default async function Supplements() {
  const { cats, total } = await getCats();

  return (
    <section aria-labelledby="hp-supp" style={{ ...SECTION, background: PANEL }}>
      <div style={WRAP}>
        <Idx label="Supplements" />

        <div className={s.split}>
          <div className={s.reveal}>
            <h2 id="hp-supp" style={{ ...display("clamp(2.1rem,5.6vw,4.2rem)"), maxWidth: "14ch" }}>
              We do not sell you a tub. That is the point.
            </h2>
            <p style={{ ...body(16.5), marginTop: 20 }}>
              {total || 46} supplements written up properly: mechanism, dosage, timing,
              onset, half-life, what it stacks with, what it clashes with, the side
              effects, the evidence level and the study count. Then a link to buy it at
              Nutrabay, because a food company that also manufactures the powder it
              recommends is not giving you advice, it is giving you a sales pitch.
            </p>

            <div style={{ display: "flex", gap: "clamp(22px,4vw,48px)", marginTop: 28, flexWrap: "wrap" }}>
              <div>
                <div style={figure("clamp(2rem,4vw,3rem)", LIME)}>{total || 46}</div>
                <div style={{ ...label(DIM), marginTop: 10 }}>researched</div>
              </div>
              <div>
                <div style={figure("clamp(2rem,4vw,3rem)")}>{cats.length || 12}</div>
                <div style={{ ...label(DIM), marginTop: 10 }}>categories</div>
              </div>
              <div>
                <div style={figure("clamp(2rem,4vw,3rem)")}>0</div>
                <div style={{ ...label(DIM), marginTop: 10 }}>we manufacture</div>
              </div>
            </div>
          </div>

          <div className={`${s.splitMedia} ${s.gradeFood}`}>
            <Image
              src="/images/supplements.jpg"
              alt="Supplement containers on a bench"
              fill
              sizes="(max-width: 820px) 100vw, 46vw"
              quality={75}
            />
          </div>
        </div>

        {cats.length > 0 && (
          <div className={s.chips} style={{ marginTop: "clamp(28px,3.6vw,46px)" }}>
            {cats.map((c) => (
              <span key={c.slug} className={s.chip}>
                {c.name} <b style={{ color: "#84cc16", fontWeight: 500 }}>{c.n}</b>
              </span>
            ))}
          </div>
        )}

        <div style={{ marginTop: "clamp(30px,4vw,50px)" }}>
          <h3 style={{ ...sub("clamp(1.3rem,2.2vw,1.7rem)"), maxWidth: "30ch" }}>
            Your goal and your gaps decide the stack, not our margin
          </h3>
          <div className={s.stats} style={{ marginTop: 20 }}>
            {GOALS.map(([g, d]) => (
              <div key={g} className={s.stat}>
                <div style={{ ...body(15), color: INK, fontWeight: 600 }}>{g}</div>
                <p style={{ ...body(14), marginTop: 9 }}>{d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* The disclosure, in the section, not in a footnote. */}
        <div
          style={{
            border: "1px solid #33332f",
            padding: "clamp(18px,2.4vw,26px)",
            marginTop: "clamp(26px,3.4vw,40px)",
          }}
        >
          <span style={label(LIME)}>Affiliate disclosure</span>
          <p style={{ ...body(14.5), marginTop: 12, maxWidth: "82ch" }}>
            FitFuel is a Nutrabay affiliate. When you buy a supplement through a link on
            this site, Nutrabay pays us a commission at no extra cost to you, and the price
            you pay is the same as going to Nutrabay directly. We hold no stock, ship
            nothing and own no supplement brand, so the recommendation is not a product we
            need to move. Supplements are not medicine, and nothing on our supplement pages
            replaces your doctor or pharmacist.
          </p>
        </div>

        <div className={s.actions} style={{ marginTop: 26 }}>
          <Link href="/supplements" className={s.ghost}>
            Read the research
          </Link>
          <Link href="/dashboard/supplements" className={s.link}>
            Get a stack for your goal
          </Link>
        </div>
      </div>
    </section>
  );
}
