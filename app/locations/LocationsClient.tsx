"use client";

// app/locations/LocationsClient.tsx
//
// Delivery zones, on the Instrument System.
//
// THE BUG, for the third page running. A trailing <style> block declared
// `.loc-main-grid`, `.loc-stats-grid`, `.loc-info-strip` and `.loc-zones-grid`,
// each with a mobile breakpoint, and not one of the four class names was ever
// applied to an element. On a phone this rendered a three-column stats strip,
// a two-column main split, a two-column zone grid nested inside that, and a
// three-column info strip, all at desktop track widths. Four dead media
// queries on the page a customer opens to answer one question: do you deliver
// to me.
//
// Everything responsive is in locations.module.css now, on attached classes.
//
// Rejected patterns removed: gradient text on the headline, the fading lime
// "glow divider", a 400px radial-gradient glow orb behind the CTA, three
// lime-to-transparent gradient rules, radius 10/12/16/20/24, fifteen
// border-radius:50% zone dots each carrying an 8px lime box-shadow glow, lime
// glows under two buttons, translateY lifts, a dashed-border note box, and
// framer-motion fading every block in from blur(4px).
//
// The zone dot was also doing real work with colour alone: #84cc16 for the
// base kitchen against #3a3a3a (1.5:1) for everything else. "Base" was already
// printed in words beside it, so the dot is gone and the word does the job.

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";

import { WHATSAPP_NUMBER } from "@/lib/site";
import { TRIAL_TOTAL_GLYPH } from "@/lib/trial-price";
import { Head, Idx, k } from "@/app/_ui/Kit";
import { Band, Masthead, Shell, Stack, Wrap } from "@/app/_ui/Page";
import { SECTION, body, figure, label, sub } from "@/app/_ui/theme";
import s from "./locations.module.css";

const WA_NUMBER = WHATSAPP_NUMBER;

/* Source: fitfuel.in/delivery-locations */
const ZONES = [
  { name: "Kharadi", pincode: "411014", base: true },
  { name: "Viman Nagar", pincode: "411014", base: false },
  { name: "Kalyani Nagar", pincode: "411014", base: false },
  { name: "Vadgaon Sheri", pincode: "411014", base: false },
  { name: "Wagholi", pincode: "412207", base: false },
  { name: "Yerwada", pincode: "411006", base: false },
  { name: "Koregaon Park", pincode: "411001", base: false },
  { name: "Sangamwadi", pincode: "411003", base: false },
  { name: "Magarpatta City", pincode: "411028", base: false },
  { name: "Amanora", pincode: "411028", base: false },
  { name: "Mundhwa", pincode: "411036", base: false },
  { name: "Tingre Nagar", pincode: "411032", base: false },
  { name: "Hadapsar", pincode: "411028", base: false },
  { name: "Dhanori", pincode: "411015", base: false },
  { name: "Lohegaon", pincode: "411047", base: false },
];

const SERVICEABLE_PINCODES = [...new Set(ZONES.map((z) => z.pincode))];

const INFO = [
  {
    title: "Free delivery",
    desc: "No delivery charges on any plan. What you see on the pricing page is what you pay, plus 5% GST.",
  },
  {
    title: "07:00 to 10:00 window",
    desc: "All meals dispatched fresh from Kharadi every morning, arriving hot and ready to eat.",
  },
  {
    title: "Eco-conscious packaging",
    desc: "Meals packed in clean, food-safe containers. No plastic where we can avoid it.",
  },
];

type CheckState = "idle" | "yes" | "no";

function PincodeChecker() {
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<CheckState>("idle");

  function check() {
    const trimmed = input.trim();
    if (trimmed.length !== 6 || !/^\d{6}$/.test(trimmed)) return;
    setStatus(SERVICEABLE_PINCODES.includes(trimmed) ? "yes" : "no");
  }

  return (
    <div className={s.checker}>
      <span style={label()}>Check your pincode</span>
      <p style={{ ...body(14), margin: "12px 0 18px" }}>
        Enter your 6-digit Pune pincode to see whether we deliver to you.
      </p>

      <div className={s.checkRow}>
        <label htmlFor="loc-pin" className="sr-only">
          Your 6-digit pincode
        </label>
        <input
          id="loc-pin"
          className={s.checkInput}
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setStatus("idle");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") check();
          }}
          placeholder="411014"
        />
        <button type="button" className={s.checkBtn} onClick={check}>
          Check
        </button>
      </div>

      {/* aria-live so the answer is announced, not just drawn. */}
      <div aria-live="polite">
        {status === "yes" && (
          <div className={s.result}>
            <p className={s.resultTitle}>Yes, we deliver to {input}</p>
            <p className={s.resultBody}>
              Fresh meals arrive at your door between 07:00 and 10:00 daily.{" "}
              <Link href="/plans" className={k.link}>
                View plans
              </Link>
            </p>
          </div>
        )}
        {status === "no" && (
          <div className={`${s.result} ${s.resultNo}`}>
            <p className={s.resultTitle}>Not in our zone yet</p>
            <p className={s.resultBody}>
              We are expanding, so it is worth asking. Sometimes we can accommodate.{" "}
              <a
                href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
                  `Hi FitFuel! I'm at pincode ${input}. Do you deliver here?`,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className={k.link}
              >
                Ask us on WhatsApp
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LocationsPage() {
  return (
    <Shell>
      <Masthead
        label="Delivery zones"
        title="Fresh meals across Pune"
        deck="We deliver to 15 areas across East and Central Pune, every day, between 7 and 10 in the morning. Kharadi is our home base."
      />

      <div className={k.readout} style={{ ["--cells" as string]: 3 }}>
        {[
          { v: "15", l: "Delivery zones" },
          { v: "7", l: "Days a week" },
          { v: "07-10", l: "Delivery window" },
        ].map((x) => (
          <div key={x.l} className={k.cell}>
            <span style={label()}>{x.l}</span>
            <span style={figure("clamp(2.2rem,4.8vw,3.6rem)")}>{x.v}</span>
          </div>
        ))}
      </div>

      <Stack>
        <section style={SECTION}>
          <Wrap>
            <div className={s.main}>
              {/* ── zones ─────────────────────────────────────────────── */}
              <div>
                <Idx label="Serviceable areas" />
                <h2 style={{ ...sub("clamp(1.8rem,3.4vw,2.6rem)"), marginBottom: 22 }}>
                  Where we deliver
                </h2>

                <div className={s.zones}>
                  {ZONES.map((z) => (
                    <div
                      key={z.name}
                      className={z.base ? `${s.zone} ${s.zoneBase}` : s.zone}
                    >
                      <span className={s.zoneName}>
                        {z.name}
                        {z.base && <span className={s.zoneTag}>Base</span>}
                      </span>
                      <span className={s.zonePin}>{z.pincode}</span>
                    </div>
                  ))}
                </div>

                <p className={s.note}>
                  Do not see your area?{" "}
                  <a
                    href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
                      "Hi FitFuel! I want to check if you deliver to my area: ",
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={k.link}
                  >
                    WhatsApp us, we are expanding
                  </a>
                </p>
              </div>

              {/* ── checker and map ───────────────────────────────────── */}
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <PincodeChecker />

                <div className={s.map}>
                  <div className={s.mapHead}>
                    <span style={label()}>Our kitchen, Kharadi</span>
                    <p style={{ ...body(13.5), marginTop: 8 }}>
                      All deliveries are dispatched from here daily at 07:00.
                    </p>
                  </div>
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d30258.20!2d73.9440!3d18.5508!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2c3e7b1f0d6b7%3A0x6a8e3e4b2c1d5e6f!2sKharadi%2C%20Pune%2C%20Maharashtra%20411014!5e0!3m2!1sen!2sin!4v1700000000000"
                    className={s.mapFrame}
                    height="280"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="FitFuel kitchen location, Kharadi, Pune"
                  />
                  <div className={s.mapFoot}>
                    <a
                      href="https://maps.google.com/?q=Kharadi,Pune,Maharashtra,411014"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={k.link}
                      style={{ display: "inline-flex", alignItems: "center", gap: 7 }}
                    >
                      <MapPin size={12} aria-hidden="true" /> Open in Google Maps
                      <ArrowRight size={11} aria-hidden="true" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </Wrap>
        </section>

        {/* ── delivery info ────────────────────────────────────────────── */}
        <section style={SECTION}>
          <Wrap>
            <Head
              label="What delivery includes"
              title="Three things, all of them free"
              size="clamp(1.9rem,4.6vw,3.2rem)"
              max="18ch"
            />
            <div className={s.info} style={{ marginTop: "clamp(26px,3.6vw,42px)" }}>
              {INFO.map((x) => (
                <div key={x.title} className={s.infoCell}>
                  <span style={label()}>{x.title}</span>
                  <p style={{ ...body(14.5) }}>{x.desc}</p>
                </div>
              ))}
            </div>
          </Wrap>
        </section>
      </Stack>

      <Band
        title={`We deliver to you. Start for ${TRIAL_TOTAL_GLYPH}`}
        body="Trial day, no commitment, no subscription. Fresh food at your door tomorrow morning."
        href="/plans?trial=true"
        cta="Start trial day"
        secondary={{ href: "/menu", label: "See the menu" }}
      />
    </Shell>
  );
}
