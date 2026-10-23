import type { ElementType } from "react";

export interface Channel {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  platform: string;
  color: string;
}

export interface DisconnectTarget {
  id: string;
  name: string;
  handle: string;
}

export interface SidebarProps {
  onConnectChannel: () => void;
  channels: Channel[];
  isAdmin: boolean;
}

export interface NavItemConfig {
  label: string;
  href: string;
  icon: ElementType;
  badge?: number;
}
