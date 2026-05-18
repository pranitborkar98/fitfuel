# ============================================================
# FitFuel — Phase 7 Schema Migration
# Run from your project root (where package.json lives)
# ============================================================

# 1. Backup current schema
Copy-Item "prisma\schema.prisma" "prisma\schema.prisma.phase6.bak"
Write-Host "✅ Backup saved → prisma\schema.prisma.phase6.bak" -ForegroundColor Green

# 2. Copy new schema in (download schema.prisma from Claude output first)
#    Assumes you saved the new file to your Downloads folder — adjust path if needed
Copy-Item "$env:USERPROFILE\Downloads\schema.prisma" "prisma\schema.prisma" -Force
Write-Host "✅ New schema copied to prisma\schema.prisma" -ForegroundColor Green

# 3. Run the migration
Write-Host "⏳ Running migration..." -ForegroundColor Yellow
npx prisma migrate dev --name add-exercise-library

# 4. Regenerate Prisma client
Write-Host "⏳ Generating Prisma client..." -ForegroundColor Yellow
npx prisma generate

Write-Host ""
Write-Host "✅ Phase 7 schema migration complete!" -ForegroundColor Green
Write-Host "   Next: run the exercise seed → npx tsx prisma/seed-exercises.ts" -ForegroundColor Cyan
