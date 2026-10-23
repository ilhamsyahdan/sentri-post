"use client";

import React, { useState } from "react";
import Sidebar from "./sidebar/sidebar";
import PostModal from "@/features/post/post-modal";
import ConnectChannelModal from "@/features/channel/components/connect-channel-modal";
import { Channel } from "./sidebar/types";

interface DashboardShellProps {
  children: React.ReactNode;
  channels: Channel[];
  isAdmin: boolean;
}

const DashboardShell = ({
  children,
  channels,
  isAdmin,
}: DashboardShellProps) => {
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        onConnectChannel={() => setIsConnectModalOpen(true)}
        channels={channels}
        isAdmin={isAdmin}
      />

      <main className="flex-1 overflow-y-auto p-4 m-2 text-black rounded-md">
        {children}
      </main>

      <PostModal />

      <ConnectChannelModal
        isOpen={isConnectModalOpen}
        setIsOpen={setIsConnectModalOpen}
      />
    </div>
  );
};

export default DashboardShell;
