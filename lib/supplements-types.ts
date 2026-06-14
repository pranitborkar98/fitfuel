// lib/supplements-types.ts
// Phase 18-1 — Client-safe types and constants for supplements.
// NO Prisma imports here — this file is safe to import from "use client" files.

import type { Supplement as StaticSupplement } from "@/lib/supplements-data";

// Buy link shape — what the UI renders as multiple buttons per product.
export interface SupplementBuyLink {
  id: string;
  network: string; // AffiliateNetwork enum string
  merchantLabel: string | null;
  priceRs: number | null;
  mrpRs: number | null;
  notes: string | null;
  /** URL the UI hits — routes through our click tracker, not the raw affiliate URL. */
  clickUrl: string;
}

// Runtime supplement = static fields + a `links` array.
export type DbSupplement = StaticSupplement & { links: SupplementBuyLink[] };

// Pretty network label for UI buttons.
export const NETWORK_LABEL: Record<string, string> = {
  NUTRABAY:         "Nutrabay",
  HEALTHKART:       "HealthKart",
  MUSCLEBLAZE:      "MuscleBlaze",
  AMAZON_IN:        "Amazon",
  FLIPKART:         "Flipkart",
  TATA_1MG:         "Tata 1mg",
  WELLNESS_FOREVER: "Wellness Forever",
  OTHER:            "Buy now",
};
