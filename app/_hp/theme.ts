// app/_hp/theme.ts
//
// MOVED. The Instrument System's tokens and type helpers now live in
// app/_ui/theme.ts, because they govern the whole site rather than the
// homepage, and the other 31 public pages are being migrated onto them.
// Importing site-wide tokens from a folder named "homepage" made no sense.
//
// This file is a re-export so every existing `from "./theme"` keeps working.
// New code should import from "@/app/_ui/theme" directly.

export * from "@/app/_ui/theme";
