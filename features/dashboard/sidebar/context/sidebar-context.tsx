"use client";

import React, { createContext, useContext } from "react";
import { Channel, DisconnectTarget } from "../types";

interface SidebarContextValue {
  channels: Channel[];
  onConnectChannel: () => void;
  onDisconnect: (target: DisconnectTarget) => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

export const SidebarContextProvider = ({
  children,
  channels,
  onConnectChannel,
  onDisconnect,
}: {
  children: React.ReactNode;
  channels: Channel[];
  onConnectChannel: () => void;
  onDisconnect: (target: DisconnectTarget) => void;
}) => {
  return (
    <SidebarContext.Provider
      value={{
        channels,
        onConnectChannel,
        onDisconnect,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const ctx = useContext(SidebarContext);
  if (!ctx)
    throw new Error("useSidebar harus dipakai di dalam SidebarProvider");
  return ctx;
};
