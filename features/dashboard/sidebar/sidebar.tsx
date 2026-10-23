"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  BarChart2,
  CalendarDays,
  Shield,
} from "lucide-react";

import { useSidebarState } from "./hooks/use-sidebar-state";
import { useDisconnectChannel } from "./hooks/use-disconnect-channel";

import { NavItem } from "./components/nav-item";
import { SidebarBranding } from "./components/sidebar-branding";
import { SidebarNewPost } from "./components/sidebar-new-post";
import { SidebarChannels } from "./components/sidebar-channels";
import { SidebarFooter } from "./components/sidebar-footer";
import { DisconnectDialog } from "./components/disconnect-dialog";

import { SidebarProps, NavItemConfig } from "./types";
import { usePostModalContext } from "@/features/post/context/post-modal-context";
import { SidebarContextProvider } from "./context/sidebar-context";

const Sidebar = ({ onConnectChannel, channels, isAdmin }: SidebarProps) => {
  const { openModal } = usePostModalContext();
  const { isCollapsed, setIsCollapsed } = useSidebarState();
  const {
    disconnectTarget,
    isDisconnecting,
    setDisconnectTarget,
    handleDisconnectConfirm,
    clearDisconnectTarget,
  } = useDisconnectChannel();

  const navItems: NavItemConfig[] = [
    { label: "Publish", href: "/dashboard/publish", icon: LayoutDashboard },
    { label: "Calendar", href: "/dashboard/calendar", icon: CalendarDays },
    { label: "Analytics", href: "/dashboard/analytics", icon: BarChart2 },
    ...(isAdmin
      ? [
          {
            label: "Admin",
            href: "/admin",
            icon: Shield,
          },
        ]
      : []),
  ];

  return (
    <SidebarContextProvider
      channels={channels}
      onConnectChannel={onConnectChannel}
      onDisconnect={setDisconnectTarget}
    >
      <TooltipProvider delayDuration={200}>
        <aside
          className={cn(
            "relative bg-white border-r border-gray-100 flex flex-col h-screen transition-all duration-300 ease-in-out z-40 select-none",
            isCollapsed ? "w-18" : "w-64"
          )}
        >
          <SidebarBranding isCollapsed={isCollapsed} />

          <SidebarNewPost isCollapsed={isCollapsed} onNewPost={openModal} />

          <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 space-y-6 pb-4 scrollbar-thin scrollbar-thumb-gray-200">
            <nav
              className={cn(
                "space-y-0.5",
                isCollapsed && "justify-center flex flex-col items-center"
              )}
            >
              {navItems.map((item) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                  isCollapsed={isCollapsed}
                  badge={item.badge}
                />
              ))}
            </nav>

            <SidebarChannels isCollapsed={isCollapsed} />

            {/* {!isCollapsed && <SidebarUsage />} */}
          </div>

          <SidebarFooter isCollapsed={isCollapsed} />

          <Button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-14 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all z-50 text-gray-400 hover:text-gray-700"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight size={11} />
            ) : (
              <ChevronLeft size={11} />
            )}
          </Button>
        </aside>

        <DisconnectDialog
          target={disconnectTarget}
          isDisconnecting={isDisconnecting}
          onConfirm={handleDisconnectConfirm}
          onClose={clearDisconnectTarget}
        />
      </TooltipProvider>
    </SidebarContextProvider>
  );
};

export default Sidebar;
