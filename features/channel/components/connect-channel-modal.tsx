"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import Image from "next/image";
import { useCallback } from "react";

const channels = [
  {
    id: "linkedin",
    name: "LinkedIn",
    desc: "Page or Profile",
    icon: "/linkedin.png",
    color: "hover:border-blue-700",
  },
  {
    id: "instagram",
    name: "Instagram",
    desc: "Business, Creator, or Personal",
    icon: "/instagram.png",
    color: "hover:border-pink-500",
  },
];

export default function ConnectChannelModal({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (o: boolean) => void;
}) {
  const handleConnect = useCallback((channelId: string) => {
    window.location.href = `/api/connections/${channelId}/connect`;
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-4xl! p-12 bg-white overflow-y-auto max-h-[90vh]">
        <DialogTitle className="text-center text-2xl font-bold mb-8 text-gray-800">
          Connect a New Channel
        </DialogTitle>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {channels.map((channel) => (
            <div
              key={channel.id}
              onClick={() => handleConnect(channel.id)}
              className={`bg-white p-8 rounded-2xl border-2 border-transparent shadow-sm flex flex-col items-center text-center cursor-pointer transition-all ${channel.color} hover:shadow-md group`}
            >
              <div className="mb-4 relative w-12 h-12 flex items-center justify-center">
                <Image
                  src={channel.icon}
                  width={40}
                  height={40}
                  alt={`${channel.name} logo`}
                  className="object-contain transition-transform group-hover:scale-110"
                />
              </div>
              <h3 className="font-bold text-gray-900">{channel.name}</h3>
              <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                {channel.desc}
              </p>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
