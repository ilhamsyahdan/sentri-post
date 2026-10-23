// features/admin/components/sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, ListChecks, ArrowLeft } from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
  indicator?: "danger" | "warning";
};

type NavSection = {
  title: string;
  items: NavItem[];
};

const NAV: NavSection[] = [
  {
    title: "General",
    items: [
      { label: "Overview", href: "/admin", icon: LayoutDashboard },
      { label: "User Management", href: "/admin/users", icon: Users },
    ],
  },
  {
    title: "Monitoring",
    items: [
      {
        label: "Publish Monitor",
        href: "/admin/queue",
        icon: ListChecks,
      },
    ],
  },
];

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={cn(
        "group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
        // light active
        active
          ? "bg-[#E6F2ED] text-[#1F3829] dark:bg-[#2A4B38]/25 dark:text-[#DCE8E0]"
          : [
              // light idle
              "text-zinc-500 hover:bg-[#E6F2ED] hover:text-[#2A4B38]",
              // dark idle (Netral, bebas dari tint biru)
              "dark:text-zinc-400 dark:hover:bg-[#2A4B38]/15 dark:hover:text-[#B7D9CB]",
            ].join(" ")
      )}
    >
      <Icon
        size={15}
        className={cn(
          "shrink-0 transition-colors",
          active
            ? "text-[#3D6B4F] dark:text-[#8FA894]"
            : "text-zinc-400 group-hover:text-[#3D6B4F] dark:text-zinc-500 dark:group-hover:text-[#8FA894]"
        )}
      />
      <span
        className={cn(
          "flex-1 text-[13px]",
          active ? "font-medium" : "font-normal"
        )}
      >
        {item.label}
      </span>
      {item.indicator && (
        <span
          className={cn(
            "h-1.5 w-1.5 shrink-0 rounded-full",
            item.indicator === "danger" ? "bg-red-500" : "bg-amber-400"
          )}
        />
      )}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex w-[220px] shrink-0 flex-col border-r",
        // light
        "border-zinc-200 bg-white",
        // dark: Menggunakan zinc-950 netral & border-zinc-800
        "dark:border-zinc-800 dark:bg-zinc-950"
      )}
    >
      {/* Brand */}
      <div
        className={cn(
          "flex items-center gap-2.5 border-b px-4 py-[18px]",
          "border-zinc-200 dark:border-zinc-800"
        )}
      >
        <div className="flex items-center gap-3 shrink-0">
          {/* Icon Logo */}
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#2A4B38] text-xl font-black text-white select-none shadow-sm">
            S
          </div>

          {/* Brand Text & Role */}
          <div className="flex flex-col justify-center">
            <span className="font-black text-[17px] tracking-tighter text-zinc-900 dark:text-white italic leading-none">
              SENTRIPOSTS
            </span>

            <p className="mt-1 text-[10px] uppercase tracking-widest text-zinc-400 dark:text-zinc-500 font-medium">
              Admin
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-2">
        {NAV.map((section) => (
          <div key={section.title} className="mb-1">
            <p
              className={cn(
                "px-4 pb-1.5 pt-4 text-[10px] font-medium uppercase tracking-[0.08em]",
                "text-zinc-400 dark:text-zinc-500"
              )}
            >
              {section.title}
            </p>
            <div className="space-y-[1px] px-2">
              {section.items.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  active={pathname === item.href}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        className={cn("border-t p-3", "border-zinc-200 dark:border-zinc-800")}
      >
        <Link
          href="/"
          className={cn(
            "flex items-center gap-2 rounded-lg px-2.5 py-2 text-[11.5px] transition-colors",
            "text-zinc-400 hover:bg-[#E6F2ED] hover:text-[#2A4B38]",
            "dark:text-zinc-500 dark:hover:bg-[#2A4B38]/15 dark:hover:text-[#B7D9CB]"
          )}
        >
          <ArrowLeft size={13} />
          Back to app
        </Link>
      </div>
    </aside>
  );
}
