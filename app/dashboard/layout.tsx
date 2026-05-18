// app/dashboard/layout.tsx
// Offsets content below the fixed 68px navbar, no footer on dashboard pages

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="pt-[68px] min-h-screen bg-[#080808]">
      {children}
    </div>
  );
}