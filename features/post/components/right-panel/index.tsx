"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { Eye, Sparkles, X } from "lucide-react";
import { PanelTab } from "./panel-tab";
import { PLATFORM_CONFIG } from "../../types";
import LivePreview from "../live-preview";

import { usePostState } from "../../context/post-state-context";
import AiAssistantPanel from "./ai-assistant-panel";

export function RightPanel() {
  const {
    rightPanel,
    selectedIds,
    activePreviewId,
    channels,
    activeChannel,
    activePost,
    showMobileRight,
    setRightPanel,
    setActivePreviewId,
    setShowMobileRight,
    insertText,
    replaceText,
  } = usePostState();

  return (
    <div
      className={cn(
        "bg-gray-50/50 border-l border-gray-100 flex flex-col overflow-hidden",
        "w-full sm:w-[340px] lg:w-[380px]",
        showMobileRight ? "flex" : "hidden sm:flex"
      )}
    >
      {/* Tab bar */}
      <div className="flex items-center gap-1 px-3 py-2.5 border-b border-gray-100 shrink-0">
        <PanelTab
          panel="preview"
          activePanel={rightPanel}
          onClick={setRightPanel}
          icon={<Eye size={12} />}
          label="Preview"
          activeClassName="bg-white shadow-sm border border-gray-200 text-gray-700"
        />
        <PanelTab
          panel="ai"
          activePanel={rightPanel}
          onClick={setRightPanel}
          icon={<Sparkles size={12} />}
          label="AI Assistant"
          activeClassName="bg-emerald-100 border border-emerald-300 text-emerald-900"
        />
        <button
          className="sm:hidden w-7 h-7 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100 ml-1"
          onClick={() => setShowMobileRight(false)}
          aria-label="Tutup panel"
        >
          <X size={13} />
        </button>
      </div>

      {/* Preview panel */}
      {rightPanel === "preview" && (
        <>
          {selectedIds.length > 1 && (
            <div className="flex gap-1 px-3 pt-2.5 shrink-0 flex-wrap">
              {selectedIds.map((channelId) => {
                const channel = channels.find((ch) => ch.id === channelId);
                if (!channel) return null;
                const isActive = activePreviewId === channelId;
                const platform = PLATFORM_CONFIG[channel.platform];

                return (
                  <button
                    key={channelId}
                    onClick={() => setActivePreviewId(channelId)}
                    className={cn(
                      "flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all",
                      isActive
                        ? cn("border-transparent text-white", platform.bg)
                        : "border-gray-200 text-gray-400 hover:border-gray-300"
                    )}
                  >
                    <Image
                      src={platform.iconSrc}
                      width={10}
                      height={10}
                      alt={platform.label}
                      className={cn(
                        "object-contain",
                        isActive && "brightness-0 invert"
                      )}
                    />
                    {platform.label}
                  </button>
                );
              })}
            </div>
          )}

          <div className="flex flex-col flex-1 overflow-hidden min-h-0">
            <div className="flex-1 overflow-y-auto p-4">
              <LivePreview channel={activeChannel} post={activePost} />
            </div>
          </div>
        </>
      )}

      {/* AI assistant panel */}
      {rightPanel === "ai" && (
        <AiAssistantPanel
          platform={activeChannel?.platform ?? null}
          currentText={activePost?.text ?? ""}
          onInsert={(text) => {
            insertText(text);
            setRightPanel("preview");
          }}
          onReplace={(text) => {
            replaceText(text);
            setRightPanel("preview");
          }}
        />
      )}
    </div>
  );
}
