# Adds DeliveryWindow enum + deliveryWindow fields to schema.prisma.
# Safe + idempotent: checks before editing, running twice does nothing.

$schema = "C:\Users\VCOM\fitfuel\prisma\schema.prisma"
if (-not (Test-Path -LiteralPath $schema)) {
  Write-Host "ERROR: schema not found at $schema" -ForegroundColor Red; exit 1
}
$s = Get-Content -Raw -LiteralPath $schema

if ($s -notmatch "enum DeliveryWindow") {
  $s = $s.TrimEnd() + "`r`n`r`nenum DeliveryWindow {`r`n  MORNING`r`n  EVENING`r`n}`r`n"
  Write-Host "  + added enum DeliveryWindow" -ForegroundColor Green
} else { Write-Host "  = enum DeliveryWindow already present" -ForegroundColor Yellow }

if (($s -match "model UserActivePlan \{") -and ($s -notmatch "deliveryWindow DeliveryWindow @default")) {
  $s = $s -replace "model UserActivePlan \{", "model UserActivePlan {`r`n  deliveryWindow DeliveryWindow @default(MORNING)"
  Write-Host "  + added UserActivePlan.deliveryWindow" -ForegroundColor Green
} else { Write-Host "  = UserActivePlan.deliveryWindow already present (or model missing)" -ForegroundColor Yellow }

if (($s -match "model Delivery \{") -and ($s -notmatch "deliveryWindow DeliveryWindow\?")) {
  $s = $s -replace "model Delivery \{", "model Delivery {`r`n  deliveryWindow DeliveryWindow?"
  Write-Host "  + added Delivery.deliveryWindow" -ForegroundColor Green
} else { Write-Host "  = Delivery.deliveryWindow already present (or model missing)" -ForegroundColor Yellow }

[System.IO.File]::WriteAllText($schema, $s, (New-Object System.Text.UTF8Encoding($false)))
Write-Host ""
Write-Host "Schema patched. Now run:  npx prisma db push" -ForegroundColor Cyan
