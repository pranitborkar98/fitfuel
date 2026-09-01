// lib/partner-network.ts
//
// The public partner layer: one source of truth for /partners, the homepage
// partner section, and anything else that has to name who FitFuel works with.
//
// Two kinds of data live here and they are deliberately separated:
//
//   PROGRAMS      the eight PartnerType values in prisma/schema.prisma, each
//                 with its PartnerRewardType. These are FACTS. Every row is
//                 selectable on /partners/apply and payable through
//                 admin/partners/payouts. Nothing here is aspirational.
//
//   NETWORK       the roster of organisations. Every seeded row is
//                 status "ONBOARDING" and `placeholder: true`, which is the
//                 honest state: the slots are built, the names are reserved
//                 examples, and the page labels them as such. Going live is
//                 one field per row, not a rebuild:
//                   placeholder: false, status: "LIVE", href: "https://..."
//                 When Partner rows in the database carry a public flag, this
//                 array is what a prisma.partner.findMany() replaces.
//
//   INTEGRATIONS  third parties actually wired into the product today, plus
//                 reserved slots for the ones that are not. Same status rule:
//                 LIVE means there is code behind it. ONBOARDING means there
//                 is not, and the UI says so.
//
// The status field exists so the site can be fully composed before the network
// is. A placeholder that renders as a live partner would be a false claim to a
// customer, so status is never decorative: it is the difference between a
// reserved slot and a signed one, and the UI must print it.

export type NetworkStatus = "LIVE" | "ONBOARDING";

/* ── The eight programmes ─────────────────────────────────────────────────
   type/reward mirror the PartnerType and PartnerRewardType enums exactly.
   If someone adds a ninth enum value, this array is the thing that has to
   grow with it. */

export type Program = {
  /** PartnerType value in prisma/schema.prisma */
  type: "GYM" | "TRAINER" | "INFLUENCER" | "DIETICIAN" | "DOCTOR" | "CORPORATE" | "RESIDENCE" | "CUSTOMER";
  label: string;
  /** PartnerRewardType value in prisma/schema.prisma */
  reward: "CREDIT" | "CASH" | "MEAL_VOUCHER" | "DISCOUNT_ONLY" | "HYBRID";
  /** Human name for the reward model, matching the homepage tiles verbatim. */
  rewardLine: string;
  who: string;
  gets: string;
};

export const PROGRAMS: Program[] = [
  {
    type: "GYM",
    label: "Gyms and studios",
    reward: "MEAL_VOUCHER",
    rewardLine: "Voucher per member",
    who: "Strength gyms, CrossFit boxes, yoga and pilates studios.",
    gets: "A tracked code and QR, a conversion list, and the voucher reward configured for each first paid customer.",
  },
  {
    type: "TRAINER",
    label: "Personal trainers",
    reward: "CASH",
    rewardLine: "Cash commission",
    who: "Independent coaches running clients in person or online.",
    gets: "Your own code, a visible conversion record, and the configured cash reward after a referred client's first paid order.",
  },
  {
    type: "INFLUENCER",
    label: "Creators",
    reward: "CASH",
    rewardLine: "Cash commission",
    who: "Fitness and food creators with a Pune audience.",
    gets: "A landing page on your code, first-touch attribution and monthly payout records for paid conversions.",
  },
  {
    type: "DIETICIAN",
    label: "Dieticians",
    reward: "CASH",
    rewardLine: "Cash commission",
    who: "Practising nutritionists who write plans but cannot cook them.",
    gets: "A tracked referral route into goal-aware cooked plans. FitFuel does not expose a client's private health diary to the partner.",
  },
  {
    type: "DOCTOR",
    label: "Doctors and clinics",
    reward: "CASH",
    rewardLine: "Cash commission",
    who: "Endocrinology, cardiology, gynaecology, general practice.",
    gets: "A tracked referral route into the plans FitFuel has actually made kitchen-ready, with medical boundaries stated before purchase.",
  },
  {
    type: "CORPORATE",
    label: "Companies",
    reward: "DISCOUNT_ONLY",
    rewardLine: "Employee discount",
    who: "Offices running a wellness budget or a subsidised lunch programme.",
    gets: "An employee code, a configured discount and a visible count of converted orders. Invoicing terms are agreed manually.",
  },
  {
    type: "RESIDENCE",
    label: "Societies",
    reward: "HYBRID",
    rewardLine: "Hybrid, per building",
    who: "Residential societies and gated communities in our delivery zones.",
    gets: "A resident code, a configured discount and a hybrid reward record. Drop-point operations are agreed for each building.",
  },
  {
    type: "CUSTOMER",
    label: "Customers",
    reward: "CREDIT",
    rewardLine: "Credit per referral",
    who: "Anyone already eating with us.",
    gets: "Rs 500 in credit after a friend's first order, and Rs 200 off for them. No application needed.",
  },
];

/* ── How attribution runs ─────────────────────────────────────────────────
   Each step names the code that performs it, because the whole pitch is that
   this is running software rather than a spreadsheet and a promise. */

export const ATTRIBUTION: { n: string; title: string; body: string; backed: string }[] = [
  {
    n: "01",
    title: "You get a code and a QR",
    body: "Approved partners get a unique code, a landing page at fitfuel.in/p/code and a QR that can be printed for a desk, profile or counter.",
    backed: "Partner.code, Partner.customLandingSlug, /p/[code]",
  },
  {
    n: "02",
    title: "First touch survives checkout",
    body: "Opening the partner page stores a 30-day first-touch cookie. When the person signs in or checks out, the verified code is attached to the account and order.",
    backed: "ff_ref cookie, User.referredByPartnerCode, Order.referralAttribution",
  },
  {
    n: "03",
    title: "You watch it from a dashboard",
    body: "Paid conversions, the configured reward, what is pending and what has been paid are visible on the partner login.",
    backed: "/dashboard/partners",
  },
  {
    n: "04",
    title: "Payouts run monthly",
    body: "Earnings are reconciled and paid on a monthly cycle, against a payout record with a status you can see from your side.",
    backed: "PartnerPayout: PENDING, PROCESSING, PAID",
  },
];

/* ── The network roster ───────────────────────────────────────────────────
   RESERVED SLOTS. Read the header of this file before changing status. */

export type NetworkOrg = {
  name: string;
  area: string;
  detail: string;
  status: NetworkStatus;
  /** true while the name is a reserved example rather than a signed partner. */
  placeholder: boolean;
  /** Set when the partner is LIVE and has a public page worth linking. */
  href?: string;
};

export type NetworkGroup = {
  key: string;
  label: string;
  blurb: string;
  rows: NetworkOrg[];
};

const slot = (name: string, area: string, detail: string): NetworkOrg => ({
  name,
  area,
  detail,
  status: "ONBOARDING",
  placeholder: true,
});

export const NETWORK_GROUPS: NetworkGroup[] = [
  {
    key: "gyms",
    label: "Gyms and studios",
    blurb: "Member vouchers, desk QR, macro tracking that follows the member out of the building.",
    rows: [
      slot("Ironline Strength", "Kharadi", "Strength floor, 400 members"),
      slot("Eastside Barbell", "Viman Nagar", "Powerlifting and CrossFit"),
      slot("Studio Nine Yoga", "Kalyani Nagar", "Yoga and pilates"),
      slot("Magarpatta Fitness Club", "Magarpatta City", "Society gym, resident only"),
      slot("Runline Athletics", "Koregaon Park", "Endurance and run coaching"),
    ],
  },
  {
    key: "clinics",
    label: "Clinics and practitioners",
    blurb: "Condition-specific plans cooked to a prescription, with intake the clinic can audit.",
    rows: [
      slot("Eastwind Diabetes Care", "Kharadi", "Endocrinology, diabetic plans"),
      slot("Aster Womens Clinic", "Viman Nagar", "PCOS and prenatal nutrition"),
      slot("Nagar Road Cardiology", "Yerwada", "Cardiac and low sodium plans"),
      slot("Practice of R. Kulkarni", "Wagholi", "Independent dietician"),
    ],
  },
  {
    key: "corporate",
    label: "Companies",
    blurb: "Subsidised staff meals on one invoice, with participation reporting for HR.",
    rows: [
      slot("Northgate Systems", "Kharadi IT park", "Subsidised lunch, 250 seats"),
      slot("Vertex Analytics", "Magarpatta City", "Wellness budget pilot"),
      slot("Harbour Financial Services", "Kalyani Nagar", "Executive health programme"),
    ],
  },
  {
    key: "societies",
    label: "Residential societies",
    blurb: "One drop point per tower, a resident rate, and a share back to the association.",
    rows: [
      slot("Riverstone Residences", "Mundhwa", "3 towers, single drop point"),
      slot("Amanora Park Towers", "Amanora", "Resident rate, gate delivery"),
      slot("Lohegaon Greens", "Lohegaon", "Association led pilot"),
    ],
  },
];

/* ── Integration partners ─────────────────────────────────────────────────
   LIVE here means there is code in this repository calling it today. */

export type Integration = {
  name: string;
  role: string;
  detail: string;
  status: NetworkStatus;
  placeholder: boolean;
};

export const INTEGRATIONS: Integration[] = [
  {
    name: "Nutrabay",
    role: "Supplement fulfilment",
    detail: "Evidence entries with a verified product match link to Nutrabay. We do not hold stock, and each retailer visit is affiliate tracked.",
    status: "LIVE",
    placeholder: false,
  },
  {
    name: "PayU",
    role: "Payments",
    detail: "Cards, UPI and net banking on both physical subscriptions and digital plans, with cash on delivery handled separately.",
    status: "LIVE",
    placeholder: false,
  },
  {
    name: "MSG91",
    role: "WhatsApp delivery",
    detail: "Morning preview, evening recap and delivery notifications go out over WhatsApp rather than an app notification nobody opens.",
    status: "LIVE",
    placeholder: false,
  },
  {
    name: "Logistics partner",
    role: "Third party dispatch",
    detail: "Delivery runs on our own drivers and a tokenised driver portal today. A third party fleet slots in behind the same dispatch layer when volume needs it.",
    status: "ONBOARDING",
    placeholder: true,
  },
  {
    name: "Lab diagnostics partner",
    role: "Bloodwork",
    detail: "Reserved for at home panels that feed the coach directly, so a recalibration can respond to a marker rather than a scale reading.",
    status: "ONBOARDING",
    placeholder: true,
  },
];

/* ── Commercials ─────────────────────────────────────────────────────────
   Terms stated once, on the page, rather than in a PDF nobody is sent. */

export const PAYOUT_TERMS: [string, string][] = [
  ["Approval", "Manual. Every application is reviewed before a code goes live, so a code that exists is a partner we have spoken to."],
  ["Attribution window", "First touch is held for 30 days in the browser and then copied to the account and order after the code is verified."],
  ["Payout cycle", "Cash reward records roll into monthly payout rows. A paid conversion earns once per referred customer."],
  ["Reward models", "Five: credit, cash, meal voucher, discount only, or a hybrid. Set per partner, not per programme."],
  ["Customer discount", "Referred customers get their own discount at checkout. The partner reward is not taken out of it."],
  ["Exclusivity", "None. Partnering with FitFuel does not stop you working with anyone else."],
];

/* ── Delivery coverage ────────────────────────────────────────────────────
   The fifteen areas the kitchen actually reaches, in delivery order out from
   Kharadi. Unlike NETWORK_GROUPS above, NOTHING here is a reserved slot: every
   name is a zone we deliver to six days a week, and each one is a real place a
   customer can check themselves.

   app/locations/LocationsClient.tsx holds the same fifteen with their
   pincodes for the serviceability check. This copy is the public,
   name-only list. If a zone opens or closes, both change. */
export const DELIVERY_AREAS: { name: string; base?: true }[] = [
  { name: "Kharadi", base: true },
  { name: "Viman Nagar" },
  { name: "Kalyani Nagar" },
  { name: "Vadgaon Sheri" },
  { name: "Wagholi" },
  { name: "Yerwada" },
  { name: "Koregaon Park" },
  { name: "Sangamwadi" },
  { name: "Magarpatta City" },
  { name: "Amanora" },
  { name: "Mundhwa" },
  { name: "Tingre Nagar" },
  { name: "Hadpsar" },
  { name: "Dhanori" },
  { name: "Lohegaon" },
];

/** Counts used in the readout bar, computed rather than typed by hand. */
export const NETWORK_STATS = {
  programmes: PROGRAMS.length,
  rewardModels: new Set(PROGRAMS.map((p) => p.reward)).size,
  liveIntegrations: INTEGRATIONS.filter((i) => i.status === "LIVE").length,
  /* Was the literal 15, sitting three lines under a comment promising these
     were computed. It is computed now, so opening a zone updates the stat. */
  areasServed: DELIVERY_AREAS.length,
};
