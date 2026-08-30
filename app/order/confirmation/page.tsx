"use client";

// app/order/confirmation/page.tsx
//
// Order confirmation, on the Instrument System.
//
// Removed: an 88px border-radius:50% badge, four more 50% step bullets, radius
// 8/12/16/20, a lime-to-transparent gradient bar, a lime box-shadow glow under
// the WhatsApp button, a framer-motion spring that popped the badge in from
// scale 0.5, and five staggered fade-ins.
//
// Emoji removed from three places, including the WhatsApp message body, which
// is the one that mattered: the pre-filled text ended with a folded-hands
// emoji, so every customer who tapped through sent it to us.
//
// COD used to be marked amber (#fbbf24) against lime for paid, a two-hue
// status code. Both are plain facts and both are printed in words, so neither
// gets a colour.
//
// The layout was centred. It is flush left in a measured column, and the order
// facts are a spec-style readout rather than a card, because a confirmation is
// a receipt: the numbers are the point.

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { CheckCircle, MessageCircle, Truck, ChefHat, Clock, Banknote, LogIn } from "lucide-react";

import { WHATSAPP_NUMBER } from "@/lib/site";
import { DELIVERY_WINDOWS, normalizeDeliveryWindow } from "@/lib/delivery-windows";
import { Idx, k } from "@/app/_ui/Kit";
import { Note, Shell, Wrap } from "@/app/_ui/Page";
import { DIM, INK, body, display, label, num } from "@/app/_ui/theme";

const WA_NUMBER = WHATSAPP_NUMBER;

function fmt(n: number) {
  return "Rs " + n.toLocaleString("en-IN");
}

function ConfirmationInner() {
  const params = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();

  const txnid = params.get("txnid") || "";
  const amount = Number(params.get("amount") || 0);
  const isCOD = params.get("cod") === "1";
  const orderNo = params.get("order") || txnid;
  const deliveryWindow = normalizeDeliveryWindow(params.get("window"));
  const delivery = DELIVERY_WINDOWS[deliveryWindow];

  const waText = encodeURIComponent(
    `Hi FitFuel! My order is confirmed.\nOrder: ${orderNo}\nAmount: ${
      isCOD ? fmt(amount) + " (COD)" : fmt(amount)
    }\nPlease share delivery details.`,
  );

  const steps = [
    { Icon: CheckCircle, title: "Order confirmed", sub: "We have received your order." },
    { Icon: ChefHat, title: "Fresh preparation", sub: "Your meals are cooked fresh daily in our kitchen." },
    { Icon: Clock, title: `${delivery.label} delivery`, sub: `${delivery.time}, to your door on delivery days.` },
    {
      Icon: Truck,
      title: isCOD ? "Pay cash at the door" : "Payment received",
      sub: isCOD ? `Keep ${fmt(amount)} ready, GST included.` : "Paid online via PayU.",
    },
  ];

  const isGuest = !session;

  return (
    <Shell>
      <Wrap style={{ paddingTop: "clamp(110px,15vw,180px)", paddingBottom: "clamp(60px,9vw,110px)" }}>
        <div style={{ maxWidth: 720 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {isCOD ? (
              <Banknote size={16} color="var(--fk-green)" aria-hidden="true" />
            ) : (
              <CheckCircle size={16} color="var(--fk-green)" aria-hidden="true" />
            )}
            <span style={label("var(--fk-green)")}>{isCOD ? "Order placed" : "Payment confirmed"}</span>
          </span>

          <h1 style={{ ...display("clamp(2.4rem,8vw,5rem)"), margin: "18px 0 18px" }}>
            {isCOD ? "Order confirmed" : "You are all set"}
          </h1>

          <p style={{ ...body(16.5), marginBottom: "clamp(30px,4vw,44px)" }}>
            {isCOD ? (
              <>
                Keep <strong style={{ color: INK }}>{fmt(amount)}</strong> ready at delivery, GST
                included. Fresh meals arrive <strong style={{ color: INK }}>{delivery.sentence}</strong> on delivery days.
              </>
            ) : (
              <>
                Your FitFuel order is confirmed. Fresh meals arrive at your door{" "}
                <strong style={{ color: INK }}>{delivery.sentence}</strong> on delivery days.
              </>
            )}
          </p>

          {/* The receipt. Mono, tabular, flush rows on hairlines. */}
          <Idx label="Order details" />
          <div style={{ borderTop: "1px solid var(--fk-line)", marginBottom: "clamp(30px,4vw,44px)" }}>
            {orderNo && (
              <div style={ROW}>
                <span style={label()}>Order ID</span>
                <span style={num("14px", INK)}>{orderNo}</span>
              </div>
            )}
            {amount > 0 && (
              <div style={ROW}>
                <span style={label()}>{isCOD ? "Pay at door" : "Amount paid"}</span>
                <span style={num("20px", INK)}>{fmt(amount)}</span>
              </div>
            )}
            <div style={ROW}>
              <span style={label()}>Payment</span>
              <span style={num("14px", INK)}>{isCOD ? "Cash on delivery" : "Paid via PayU"}</span>
            </div>
          </div>

          {isGuest && (
            <Note style={{ marginBottom: "clamp(30px,4vw,44px)" }}>
              <p>
                <strong>Save your order history.</strong> Sign in with Google to track this order
                and future deliveries on your dashboard.
              </p>
              <button
                type="button"
                onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                className={k.ghost}
                style={{ marginTop: 16, gap: 8 }}
              >
                <LogIn size={14} aria-hidden="true" /> Sign in with Google
              </button>
            </Note>
          )}

          <Idx label="What happens next" />
          <div style={{ borderTop: "1px solid var(--fk-line)", marginBottom: "clamp(30px,4vw,44px)" }}>
            {steps.map(({ Icon, title, sub }) => (
              <div key={title} style={{ ...ROW, alignItems: "flex-start", gap: 16 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                  <Icon size={15} color="var(--fk-ink-3)" aria-hidden="true" style={{ flexShrink: 0 }} />
                  <span>
                    <span
                      style={{
                        display: "block",
                        fontFamily: "var(--fk-display), Georgia, serif",
                        fontWeight: 800,
                        fontSize: 17,
                        letterSpacing: "-0.01em",
                        textTransform: "uppercase",
                        color: INK,
                      }}
                    >
                      {title}
                    </span>
                    <span style={{ ...body(13.5), color: DIM, marginTop: 3, display: "block" }}>
                      {sub}
                    </span>
                  </span>
                </span>
              </div>
            ))}
          </div>

          <div className={k.actions}>
            <a
              href={`https://wa.me/${WA_NUMBER}?text=${waText}`}
              target="_blank"
              rel="noopener noreferrer"
              className={k.btn}
            >
              <span>
                <MessageCircle size={15} aria-hidden="true" style={{ marginRight: 8 }} />
                WhatsApp us
              </span>
            </a>
            <button type="button" onClick={() => router.push("/plans")} className={k.ghost}>
              View plans
            </button>
          </div>
        </div>
      </Wrap>
    </Shell>
  );
}

const ROW = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 16,
  padding: "15px 0",
  borderBottom: "1px solid var(--fk-line)",
} as const;

export default function ConfirmationPage() {
  return (
    <Suspense
      fallback={
        <Shell>
          <Wrap style={{ paddingTop: 180 }}>
            <span style={label()}>Loading</span>
          </Wrap>
        </Shell>
      }
    >
      <ConfirmationInner />
    </Suspense>
  );
}
