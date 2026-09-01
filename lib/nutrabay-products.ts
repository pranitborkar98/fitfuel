/**
 * Curated Nutrabay products that map cleanly to FitFuel's evidence catalogue.
 *
 * The source scraper also collected food, mass gainers, arginine and fibre
 * blends. Those rows are deliberately absent because FitFuel has no matching
 * educational entry for them yet. A retailer product only belongs here when a
 * customer can read the ingredient evidence, dosage and warnings before
 * leaving for checkout.
 */
export type NutrabayProduct = {
  supplementSlug: string;
  productName: string;
  priceRs: number;
  affiliateUrl: string;
  /** One representative local product image per evidence entry. */
  imageUrl?: string;
};

export const NUTRABAY_PRODUCTS: NutrabayProduct[] = [
  {
    supplementSlug: "beta-alanine",
    productName: "Nutrabay Pure Beta-Alanine",
    priceRs: 249,
    imageUrl: "/images/supplements/nutrabay/beta-alanine.webp",
    affiliateUrl: "https://nutrabay.com/product/nutrabay-beta-alanine/?pId=8486513&vId=6440277&ref=pranit1944&utm_campaign=NB&utm_medium=GoAffPro&utm_source=affiliate&utm_term=CPS",
  },
  {
    supplementSlug: "whey-protein",
    productName: "Nutrabay Gold Whey Protein Concentrate",
    priceRs: 3429,
    imageUrl: "/images/supplements/nutrabay/whey-protein.webp",
    affiliateUrl: "https://nutrabay.com/product/nutrabay-gold-100-whey-protein-concentrate/?pId=6589930&vId=5553131&ref=pranit1944&utm_campaign=NB&utm_medium=GoAffPro&utm_source=affiliate&utm_term=CPS",
  },
  {
    supplementSlug: "whey-protein",
    productName: "Nutrabay BioAbsorb Whey Protein",
    priceRs: 3899,
    affiliateUrl: "https://nutrabay.com/product/nutrabay-bioabsorb-whey-protein/?pId=8042444&vId=6919061&ref=pranit1944&utm_campaign=NB&utm_medium=GoAffPro&utm_source=affiliate&utm_term=CPS",
  },
  {
    supplementSlug: "whey-protein",
    productName: "Nutrabay Vital Whey Protein",
    priceRs: 1199,
    affiliateUrl: "https://nutrabay.com/product/nutrabay-gold-vital-whey-protein-for-beginners/?pId=1048875&vId=9960505&ref=pranit1944&utm_campaign=NB&utm_medium=GoAffPro&utm_source=affiliate&utm_term=CPS",
  },
  {
    supplementSlug: "whey-protein",
    productName: "Nutrabay Pure Whey Protein Concentrate",
    priceRs: 4859,
    affiliateUrl: "https://nutrabay.com/product/nutrabay-whey-protein-concentrate/?pId=7275894&vId=8289363&ref=pranit1944&utm_campaign=NB&utm_medium=GoAffPro&utm_source=affiliate&utm_term=CPS",
  },
  {
    supplementSlug: "whey-isolate",
    productName: "Nutrabay Gold Whey Protein Isolate",
    priceRs: 5499,
    imageUrl: "/images/supplements/nutrabay/whey-isolate.webp",
    affiliateUrl: "https://nutrabay.com/product/nutrabay-gold-100-whey-protein-isolate/?pId=3275798&vId=1688885&ref=pranit1944&utm_campaign=NB&utm_medium=GoAffPro&utm_source=affiliate&utm_term=CPS",
  },
  {
    supplementSlug: "citrulline",
    productName: "Nutrabay Pure Citrulline Malate",
    priceRs: 349,
    imageUrl: "/images/supplements/nutrabay/citrulline.webp",
    affiliateUrl: "https://nutrabay.com/product/nutrabay-citrulline-malate/?pId=3132942&vId=5272259&ref=pranit1944&utm_campaign=NB&utm_medium=GoAffPro&utm_source=affiliate&utm_term=CPS",
  },
  {
    supplementSlug: "citrulline",
    productName: "Nutrabay Gold L-Citrulline DL-Malate",
    priceRs: 329,
    affiliateUrl: "https://nutrabay.com/product/nutrabay-gold-citrulline-malate/?pId=6520180&vId=8483540&ref=pranit1944&utm_campaign=NB&utm_medium=GoAffPro&utm_source=affiliate&utm_term=CPS",
  },
  {
    supplementSlug: "creatine",
    productName: "Nutrabay Gold Micronized Creatine Monohydrate",
    priceRs: 379,
    imageUrl: "/images/supplements/nutrabay/creatine.webp",
    affiliateUrl: "https://nutrabay.com/product/nutrabay-gold-micronized-creatine-monohydrate/?pId=4112332&vId=4130759&ref=pranit1944&utm_campaign=NB&utm_medium=GoAffPro&utm_source=affiliate&utm_term=CPS",
  },
  {
    supplementSlug: "creatine",
    productName: "Nutrabay Creafizz Creatine Sachets",
    priceRs: 399,
    affiliateUrl: "https://nutrabay.com/product/nutrabay-creafizz/?pId=1829340&vId=1465313&ref=pranit1944&utm_campaign=NB&utm_medium=GoAffPro&utm_source=affiliate&utm_term=CPS",
  },
  {
    supplementSlug: "creatine",
    productName: "Nutrabay Pure Creatine Monohydrate",
    priceRs: 399,
    affiliateUrl: "https://nutrabay.com/product/nutrabay-micronised-creatine-monohydrate/?pId=1903618&vId=6910942&ref=pranit1944&utm_campaign=NB&utm_medium=GoAffPro&utm_source=affiliate&utm_term=CPS",
  },
  {
    supplementSlug: "bcaa",
    productName: "Nutrabay Gold BCAA 2:1:1 with Electrolytes",
    priceRs: 699,
    imageUrl: "/images/supplements/nutrabay/bcaa.webp",
    affiliateUrl: "https://nutrabay.com/product/nutrabay-gold-bcaa-211-with-electrolytes/?pId=1006457&vId=5299082&ref=pranit1944&utm_campaign=NB&utm_medium=GoAffPro&utm_source=affiliate&utm_term=CPS",
  },
  {
    supplementSlug: "plant-protein",
    productName: "Nutrabay Pure Pea Protein Isolate",
    priceRs: 1749,
    imageUrl: "/images/supplements/nutrabay/plant-protein.webp",
    affiliateUrl: "https://nutrabay.com/product/nutrabay-pure-100-pea-protein-isolate/?pId=4537768&vId=8445682&ref=pranit1944&utm_campaign=NB&utm_medium=GoAffPro&utm_source=affiliate&utm_term=CPS",
  },
  {
    supplementSlug: "plant-protein",
    productName: "Nutrabay Gold Pea Protein",
    priceRs: 69,
    affiliateUrl: "https://nutrabay.com/product/nutrabay-gold-hydrolyzed-pea-protein/?pId=3302532&vId=9350742&ref=pranit1944&utm_campaign=NB&utm_medium=GoAffPro&utm_source=affiliate&utm_term=CPS",
  },
  {
    supplementSlug: "plant-protein",
    productName: "Nutrabay Pure Soy Protein Isolate",
    priceRs: 899,
    affiliateUrl: "https://nutrabay.com/product/nutrabay-pure-100-soy-protein-isolate/?pId=4186049&vId=1886437&ref=pranit1944&utm_campaign=NB&utm_medium=GoAffPro&utm_source=affiliate&utm_term=CPS",
  },
  {
    supplementSlug: "plant-protein",
    productName: "Nutrabay Wellness Vegan Plant Protein",
    priceRs: 1699,
    affiliateUrl: "https://nutrabay.com/product/nutrabay-wellness-vegan-plant-protein-powder-superfoods/?pId=4698878&vId=9794905&ref=pranit1944&utm_campaign=NB&utm_medium=GoAffPro&utm_source=affiliate&utm_term=CPS",
  },
  {
    supplementSlug: "pre-workout",
    productName: "Nutrabay RageX Pre-Workout",
    priceRs: 999,
    imageUrl: "/images/supplements/nutrabay/pre-workout.webp",
    affiliateUrl: "https://nutrabay.com/product/nutrabay-ragex-pre-workout-l-citrulline-beta-alanine-caffeine-black-pepper-extract-energy-focus-pump/?pId=5543479&vId=1701211&ref=pranit1944&utm_campaign=NB&utm_medium=GoAffPro&utm_source=affiliate&utm_term=CPS",
  },
  {
    supplementSlug: "pre-workout",
    productName: "Nutrabay Spark Pre-Workout",
    priceRs: 749,
    affiliateUrl: "https://nutrabay.com/product/nutrabay-gold-series-spark-pre-workout/?pId=6594373&vId=1560762&ref=pranit1944&utm_campaign=NB&utm_medium=GoAffPro&utm_source=affiliate&utm_term=CPS",
  },
  {
    supplementSlug: "collagen",
    productName: "Nutrabay Korean Marine Glow Collagen",
    priceRs: 649,
    imageUrl: "/images/supplements/nutrabay/collagen.jpg",
    affiliateUrl: "https://nutrabay.com/product/nutrabay-korean-marine-glow-collagen/?pId=9824744&vId=8264622&ref=pranit1944&utm_campaign=NB&utm_medium=GoAffPro&utm_source=affiliate&utm_term=CPS",
  },
  {
    supplementSlug: "glutamine",
    productName: "Nutrabay Pure L-Glutamine",
    priceRs: 649,
    imageUrl: "/images/supplements/nutrabay/glutamine.webp",
    affiliateUrl: "https://nutrabay.com/product/nutrabay-l-glutamine/?pId=5843503&vId=7536718&ref=pranit1944&utm_campaign=NB&utm_medium=GoAffPro&utm_source=affiliate&utm_term=CPS",
  },
  {
    supplementSlug: "magnesium",
    productName: "Nutrabay Magnesium Glycinate 2000mg",
    priceRs: 349,
    imageUrl: "/images/supplements/nutrabay/magnesium.webp",
    affiliateUrl: "https://nutrabay.com/product/nutrabay-magnesium-glycinate-2000mg/?pId=9935686&vId=5652712&ref=pranit1944&utm_campaign=NB&utm_medium=GoAffPro&utm_source=affiliate&utm_term=CPS",
  },
  {
    supplementSlug: "multivitamin",
    productName: "Nutrabay Multivitamin for Men",
    priceRs: 299,
    imageUrl: "/images/supplements/nutrabay/multivitamin.webp",
    affiliateUrl: "https://nutrabay.com/product/nutrabay-pro-multivitamin-for-men/?pId=9397469&vId=4725286&ref=pranit1944&utm_campaign=NB&utm_medium=GoAffPro&utm_source=affiliate&utm_term=CPS",
  },
  {
    supplementSlug: "multivitamin",
    productName: "Nutrabay Multivitamin for Women",
    priceRs: 299,
    affiliateUrl: "https://nutrabay.com/product/nutrabay-pro-active-multivitamin-for-women/?pId=5454226&vId=9043509&ref=pranit1944&utm_campaign=NB&utm_medium=GoAffPro&utm_source=affiliate&utm_term=CPS",
  },
  {
    supplementSlug: "caffeine",
    productName: "Nutrabay Potent Caffeine 200mg",
    priceRs: 249,
    imageUrl: "/images/supplements/nutrabay/caffeine.webp",
    affiliateUrl: "https://nutrabay.com/product/nutrabay-pro-caffeine-200mg/?pId=8614469&vId=6035726&ref=pranit1944&utm_campaign=NB&utm_medium=GoAffPro&utm_source=affiliate&utm_term=CPS",
  },
  {
    supplementSlug: "eaa",
    productName: "Nutrabay EAAs with Electrolytes",
    priceRs: 939,
    imageUrl: "/images/supplements/nutrabay/eaa.webp",
    affiliateUrl: "https://nutrabay.com/product/nutrabay-pro-eaas-with-electrolytes-essential-amino-acids/?pId=7318007&vId=4588333&ref=pranit1944&utm_campaign=NB&utm_medium=GoAffPro&utm_source=affiliate&utm_term=CPS",
  },
  {
    supplementSlug: "omega3",
    productName: "Nutrabay Fish Oil Omega 3 Triple Strength",
    priceRs: 799,
    imageUrl: "/images/supplements/nutrabay/omega3.webp",
    affiliateUrl: "https://nutrabay.com/product/nutrabay-pro-fish-oil-triple-strength-1000mg/?pId=8472748&vId=6255885&ref=pranit1944&utm_campaign=NB&utm_medium=GoAffPro&utm_source=affiliate&utm_term=CPS",
  },
  {
    supplementSlug: "omega3",
    productName: "Nutrabay Fish Oil Omega 3 1000mg",
    priceRs: 319,
    affiliateUrl: "https://nutrabay.com/product/nutrabay-wellness-fish-oil-1000mg/?pId=5856792&vId=5733502&ref=pranit1944&utm_campaign=NB&utm_medium=GoAffPro&utm_source=affiliate&utm_term=CPS",
  },
  {
    supplementSlug: "l-carnitine",
    productName: "Nutrabay L-Carnitine 1000mg",
    priceRs: 449,
    imageUrl: "/images/supplements/nutrabay/l-carnitine.webp",
    affiliateUrl: "https://nutrabay.com/product/nutrabay-pro-l-carnitine-1000mg/?pId=2356588&vId=6398653&ref=pranit1944&utm_campaign=NB&utm_medium=GoAffPro&utm_source=affiliate&utm_term=CPS",
  },
  {
    supplementSlug: "l-carnitine",
    productName: "Nutrabay Liquid L-Carnitine with Vitamin B5",
    priceRs: 799,
    affiliateUrl: "https://nutrabay.com/product/nutrabay-pro-liquid-l-carnitine-vitamin-b5-3000-mg/?pId=5908000&vId=7128262&ref=pranit1944&utm_campaign=NB&utm_medium=GoAffPro&utm_source=affiliate&utm_term=CPS",
  },
  {
    supplementSlug: "zma",
    productName: "Nutrabay Zinc, Magnesium and B6",
    priceRs: 299,
    imageUrl: "/images/supplements/nutrabay/zma.webp",
    affiliateUrl: "https://nutrabay.com/product/nutrabay-pro-zma-500mg/?pId=3889255&vId=2456663&ref=pranit1944&utm_campaign=NB&utm_medium=GoAffPro&utm_source=affiliate&utm_term=CPS",
  },
  {
    supplementSlug: "ashwagandha",
    productName: "Nutrabay Ashwagandha Extract 1000mg",
    priceRs: 199,
    imageUrl: "/images/supplements/nutrabay/ashwagandha.webp",
    affiliateUrl: "https://nutrabay.com/product/nutrabay-wellness-ashwagandha-extract-withania-somnifera-1000mg/?pId=4623336&vId=9923251&ref=pranit1944&utm_campaign=NB&utm_medium=GoAffPro&utm_source=affiliate&utm_term=CPS",
  },
];
