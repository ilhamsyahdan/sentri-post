// app/admin/layout.tsx
import { Sidebar } from "@/features/admin/components/sidebar";
import { ThemeToggle } from "@/features/admin/components/theme-toggle";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={[
        "relative flex h-screen overflow-hidden font-sans",
        // Light mode background
        "bg-gray-50",
        // Dark mode background: Diganti dari #0c0e14 ke Zinc-950 pekat (Netral)
        "dark:bg-zinc-950 dark:text-zinc-100",
      ].join(" ")}
    >
      {/* Mesh Gradient DIHAPUS agar tidak muncul pantulan warna biru/ungu */}

      {/* Layout shell */}
      <div className="relative flex h-full w-full">
        <Sidebar />

        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Topbar */}
          <header
            className={[
              "flex h-12 shrink-0 items-center justify-end border-b px-6",
              "border-slate-200 bg-white",
              "dark:border-zinc-800 dark:bg-zinc-950/50 dark:backdrop-blur",
            ].join(" ")}
          >
            <ThemeToggle />
          </header>

          {/* Main scroll area */}
          <main className="relative flex-1 overflow-y-auto bg-gray-50 dark:bg-zinc-950">
            <div className="relative px-8 py-8">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
