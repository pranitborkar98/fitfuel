CREATE TABLE "affiliate_products" (
    "id" TEXT NOT NULL,
    "retailer" "AffiliateNetwork" NOT NULL DEFAULT 'NUTRABAY',
    "retailerProductId" TEXT NOT NULL,
    "variantId" TEXT,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "priceRs" INTEGER NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "affiliateUrl" TEXT NOT NULL,
    "dataQuality" TEXT NOT NULL DEFAULT 'DERIVED',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastCheckedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "evidenceSupplementId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "affiliate_products_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "affiliate_product_clicks" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "userId" TEXT,
    "retailer" "AffiliateNetwork" NOT NULL,
    "referrer" TEXT,
    "ipHash" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "affiliate_product_clicks_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "affiliate_products_retailer_retailerProductId_key"
ON "affiliate_products"("retailer", "retailerProductId");

CREATE UNIQUE INDEX "affiliate_products_retailer_slug_key"
ON "affiliate_products"("retailer", "slug");

CREATE INDEX "affiliate_products_retailer_category_isActive_idx"
ON "affiliate_products"("retailer", "category", "isActive");

CREATE INDEX "affiliate_products_evidenceSupplementId_isActive_idx"
ON "affiliate_products"("evidenceSupplementId", "isActive");

CREATE INDEX "affiliate_product_clicks_productId_createdAt_idx"
ON "affiliate_product_clicks"("productId", "createdAt");

CREATE INDEX "affiliate_product_clicks_userId_createdAt_idx"
ON "affiliate_product_clicks"("userId", "createdAt");

ALTER TABLE "affiliate_products"
ADD CONSTRAINT "affiliate_products_evidenceSupplementId_fkey"
FOREIGN KEY ("evidenceSupplementId") REFERENCES "supplements"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "affiliate_product_clicks"
ADD CONSTRAINT "affiliate_product_clicks_productId_fkey"
FOREIGN KEY ("productId") REFERENCES "affiliate_products"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "affiliate_product_clicks"
ADD CONSTRAINT "affiliate_product_clicks_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "users"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
