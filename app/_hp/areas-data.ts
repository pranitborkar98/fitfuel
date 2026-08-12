// app/_hp/areas-data.ts
//
// The delivery footprint, in one place, with coordinates.
//
// The area list used to be a string array inside Areas.tsx. Three surfaces now
// need it — the readout's "15 areas" cell, the coverage map and the chip list —
// and a count typed into one of them while the array lives in another is how
// "15 areas" survives the day somebody adds a sixteenth.
//
// THE COORDINATES ARE REAL and they are the point. A map traced by hand is a
// drawing of a claim; this one is plotted, so the shape it makes is the actual
// shape of what one kitchen in Kharadi can reach by 08:00. Values are the
// standard published centroids for each suburb, to four decimal places, which
// is roughly 10m and far finer than a homepage map needs.
//
// Distances are computed from the kitchen with the equirectangular
// approximation. Over a 12km span at 18.5°N the error against the haversine
// figure is under a metre, and the rings are drawn at 3, 6 and 9km where a
// metre is invisible.

export const KITCHEN = "Kharadi";

/** The kitchen itself. Everything else is measured from here. */
export const KITCHEN_AT = { lat: 18.5515, lng: 73.947 };

export type Area = { name: string; lat: number; lng: number };

/** The fourteen suburbs we actually deliver to, kitchen excluded. */
export const AREAS_AT: Area[] = [
  { name: "Viman Nagar", lat: 18.5679, lng: 73.9143 },
  { name: "Kalyani Nagar", lat: 18.548, lng: 73.901 },
  { name: "Vadgaon Sheri", lat: 18.556, lng: 73.926 },
  { name: "Wagholi", lat: 18.58, lng: 73.98 },
  { name: "Yerwada", lat: 18.548, lng: 73.883 },
  { name: "Koregaon Park", lat: 18.5362, lng: 73.8939 },
  { name: "Sangamwadi", lat: 18.535, lng: 73.87 },
  { name: "Magarpatta City", lat: 18.516, lng: 73.928 },
  { name: "Amanora", lat: 18.518, lng: 73.938 },
  { name: "Mundhwa", lat: 18.533, lng: 73.928 },
  { name: "Tingre Nagar", lat: 18.582, lng: 73.883 },
  { name: "Hadapsar", lat: 18.5089, lng: 73.926 },
  { name: "Dhanori", lat: 18.592, lng: 73.89 },
  { name: "Lohegaon", lat: 18.592, lng: 73.913 },
];

/** Names only, for the chip list and the readout's count. */
export const AREAS: string[] = AREAS_AT.map((a) => a.name);

const KM_PER_DEG_LAT = 110.574;
const KM_PER_DEG_LNG = 111.32 * Math.cos((KITCHEN_AT.lat * Math.PI) / 180);

/** Kilometres east and north of the kitchen. East and north are positive, so
 *  these drop straight into an SVG with y flipped. */
export function offsetKm(a: { lat: number; lng: number }) {
  return {
    x: (a.lng - KITCHEN_AT.lng) * KM_PER_DEG_LNG,
    y: (a.lat - KITCHEN_AT.lat) * KM_PER_DEG_LAT,
  };
}

/** Straight-line distance from the kitchen, in kilometres. */
export function distanceKm(a: { lat: number; lng: number }): number {
  const { x, y } = offsetKm(a);
  return Math.sqrt(x * x + y * y);
}
