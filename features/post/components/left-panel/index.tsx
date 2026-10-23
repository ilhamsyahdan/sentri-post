"use client";

import { cn } from "@/lib/utils";
import { Loader2, UploadCloud } from "lucide-react";
import ChannelAvatar from "./channel-avatar";
import ComposeCard from "../compose-card";
import ScheduleStep from "../schedule-step";
import ReviewStep from "../review-step";
import { DraftBanner } from "./draft-banner";
import type {
  Step,
  Channel,
  PostsMap,
  ConfirmedSlotsMap,
  DraftRecord,
} from "../../types";
import { usePostState } from "../../context/post-state-context";

interface LeftPanelProps {
  step: Step;
  channels: Channel[];
  isLoadingChannels: boolean;
  selectedIds: string[];
  activePreviewId: string | null;
  posts: PostsMap;
  confirmedSlots: ConfirmedSlotsMap;
  drafts: DraftRecord[];
  isLoadingDrafts: boolean;
  isVisible: boolean;
  onToggleChannel: (channelId: string) => void;
  onSetActivePreview: (channelId: string) => void;
  onUpdateText: (channelId: string, text: string) => void;
  onUpdateFile: (channelId: string, file: File) => void;
  onRemoveFile: (channelId: string) => void;
  onConfirmSlot: (
    channelId: string,
    slot: import("../../types").ConfirmedSlot
  ) => void;
  onResumeDraft: (draft: DraftRecord) => void;
  onDeleteDraft: (draftId: string) => void;
}

export function LeftPanel() {
  const {
    step,
    channels,
    isLoadingChannels,
    selectedIds,
    activePreviewId,
    drafts,
    isLoadingDrafts,
    showMobileRight,
    toggleChannel,
    resumeDraft,
    handleDeleteDraft,
  } = usePostState();
  return (
    <div
      className={cn(
        "flex-1 flex flex-col overflow-hidden",
        !showMobileRight ? "flex" : "hidden sm:flex"
      )}
    >
      {/* Draft banner — hanya tampil di awal sebelum channel dipilih */}
      {step === "compose" && selectedIds.length === 0 && drafts.length > 0 && (
        <DraftBanner
          drafts={drafts}
          isLoading={isLoadingDrafts}
          onResume={resumeDraft}
          onDelete={handleDeleteDraft}
        />
      )}

      {/* Channel selector */}
      <div className="px-4 sm:px-5 pt-4 pb-3 border-b border-gray-50 shrink-0">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">
          Pilih Channel
        </p>
        <div className="flex items-center gap-3 flex-wrap">
          {isLoadingChannels ? (
            <div className="flex items-center gap-2 text-[11px] text-gray-400">
              <Loader2 size={12} className="animate-spin" />
              Memuat channel...
            </div>
          ) : (
            channels.map((channel) => (
              <ChannelAvatar
                key={channel.id}
                channel={channel}
                selected={selectedIds.includes(channel.id)}
                active={activePreviewId === channel.id}
                onClick={() => toggleChannel(channel.id)}
              />
            ))
          )}
          {selectedIds.length > 0 && (
            <span className="text-[11px] text-gray-400">
              {selectedIds.length} dipilih
            </span>
          )}
        </div>
      </div>

      {/* Ini Step Content */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 space-y-4">
        {step === "compose" && <ComposeStepContent />}

        {step === "schedule" && <ScheduleStep />}

        {step === "review" && <ReviewStep />}
      </div>
    </div>
  );
}

function ComposeStepContent() {
  const {
    selectedIds,
    channels,
    posts,
    activePreviewId,
    setActivePreviewId,
    updateText,
    updateFile,
    removeFile,
    syncPlatforms,
    toggleSyncPlatform,
    platformSyncGroups,
  } = usePostState();

  if (selectedIds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-gray-100 rounded-3xl text-center">
        <UploadCloud size={36} className="text-gray-200 mb-3" />
        <p className="text-gray-400 text-sm">
          Pilih channel di atas untuk mulai menulis
        </p>
      </div>
    );
  }

  // 1. Dapatkan daftar channel yang dipilih secara utuh
  const selectedChannels = channels.filter((ch) => selectedIds.includes(ch.id));

  // 2. Filter channel mana saja yang perlu dirender ComposeCard-nya
  const processedPlatforms = new Set<string>();

  const channelsToRender = selectedChannels.filter((channel) => {
    const isSynced = syncPlatforms[channel.platform];

    if (isSynced) {
      // Jika mode sync aktif untuk platform ini, hanya ambil channel PERTAMA yang ditemukan
      if (processedPlatforms.has(channel.platform)) {
        return false; // Saluran berikutnya pada platform yang sama di-skip
      }
      processedPlatforms.add(channel.platform);
    }
    return true;
  });

  const shownToggleFor = new Set<string>();

  return (
    <>
      {channelsToRender.map((channel) => {
        const channelId = channel.id;
        const group = platformSyncGroups.find(
          (g) => g.platform === channel.platform
        );

        // Tampilkan toggle sync jika akun pada platform tersebut lebih dari 1
        const showToggle =
          group &&
          group.ids.length > 1 &&
          !shownToggleFor.has(channel.platform);
        if (showToggle) shownToggleFor.add(channel.platform);

        return (
          <div key={channelId} className="space-y-2">
            {showToggle && (
              <label className="flex items-center justify-between px-1 cursor-pointer select-none">
                <span className="text-[11px] text-gray-400">
                  Gunakan konten yang sama untuk semua akun{" "}
                  {channel.platform === "instagram" ? "Instagram" : "LinkedIn"}
                </span>
                <input
                  type="checkbox"
                  checked={!!syncPlatforms[channel.platform]}
                  onChange={() => toggleSyncPlatform(channel.platform)}
                  className="h-3.5 w-3.5 accent-[#3D6B4F]"
                />
              </label>
            )}

            <ComposeCard
              channel={channel}
              post={
                posts[channelId] ?? { text: "", file: null, previewUrl: null }
              }
              active={activePreviewId === channelId}
              syncedChannelsCount={
                syncPlatforms[channel.platform]
                  ? platformSyncGroups.find(
                      (g) => g.platform === channel.platform
                    )?.ids.length
                  : 1
              }
              onFocus={() => setActivePreviewId(channelId)}
              onTextChange={(text) => updateText(channelId, text)}
              onFileChange={(file) => updateFile(channelId, file)}
              onRemoveFile={() => removeFile(channelId)}
            />
          </div>
        );
      })}
    </>
  );
}
