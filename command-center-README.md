# FitFuel Command Center â€” Phase 10 (delivery ops side)

The driver-facing app already existed. This adds the **manager/owner side**: create
drivers, assign today's deliveries, dispatch them, watch status live, see COD per driver.

**No schema changes.** Everything uses fields you already have.

## Where each file goes (drop into your repo, same paths)

```
lib/admin-auth.ts                          â†’ lib/admin-auth.ts
app/admin/layout.tsx                       â†’ app/admin/layout.tsx
app/admin/page.tsx                         â†’ app/admin/page.tsx          (dispatch board)
app/admin/DispatchClient.tsx               â†’ app/admin/DispatchClient.tsx
app/admin/drivers/page.tsx                 â†’ app/admin/drivers/page.tsx
app/admin/drivers/DriversClient.tsx        â†’ app/admin/drivers/DriversClient.tsx
app/api/admin/drivers/route.ts             â†’ app/api/admin/drivers/route.ts
app/api/admin/drivers/[id]/route.ts        â†’ app/api/admin/drivers/[id]/route.ts
app/api/admin/deliveries/route.ts          â†’ app/api/admin/deliveries/route.ts
prisma/make-admin.ts                       â†’ prisma/make-admin.ts
```

## Setup (3 steps)

1. Copy the files in.
2. Make yourself OWNER (log in with Google once first so your User row exists):
   ```
   npx tsx prisma/make-admin.ts your@email.com
   ```
3. Open `/admin`. Add a driver under **Drivers** â†’ copy their link â†’ send on WhatsApp.
   Assign today's stops on **Dispatch** â†’ hit Dispatch. Done.

## One thing to check
`lib/admin-auth.ts` reads the NextAuth **database** session cookie (you have a `Session`
table, so you're on database sessions â€” this works). If you ever move NextAuth to JWT
strategy, swap that helper for `getServerSession(authOptions)`.

## Deliberately deferred (Phase 11 / franchise)
- Outlet assignment (Driver.franchiseId is already reserved for it)
- Roles beyond ADMIN/OWNER, franchise/partner scoping
- COD **settle** tracking (currently shows expected cash per driver; marking cash
  as collected/settled needs one new field â€” small add when you want it)
```