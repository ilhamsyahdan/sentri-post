import Navbar from "@/components/shared/navbar";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Mengunci skema warna ke Light Mode secara total
    <div className="light relative min-h-screen w-full bg-white text-zinc-900 [color-scheme:light]">
      <Navbar />

      <div className="relative z-10">{children}</div>
    </div>
  );
}
