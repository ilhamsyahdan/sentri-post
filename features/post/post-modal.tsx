"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { usePostModal } from "./hooks/use-post-modal";
import { LeftPanel } from "./components/left-panel";
import { RightPanel } from "./components/right-panel";
import { ModalFooter } from "./components/modal-footer";
import { usePostModalContext } from "./context/post-modal-context";
import { PostStateContext } from "./context/post-state-context";
import { ModalHeader } from "./components/modal-header";

export default function PostModal() {
  const { isOpen, closeModal } = usePostModalContext();
  const modal = usePostModal(isOpen, closeModal);

  const hasAnySlot = modal.confirmedCount > 0;
  const allSlotsConfirmed =
    modal.selectedIds.length > 0 &&
    modal.confirmedCount === modal.selectedIds.length;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) closeModal();
      }}
    >
      <DialogContent className="max-w-5xl! w-full p-0 overflow-hidden bg-white border-none rounded-2xl h-[92vh] flex flex-col text-black shadow-2xl">
        <PostStateContext.Provider value={modal}>
          <ModalHeader step={modal.step} />

          <div className="flex flex-1 overflow-hidden">
            <LeftPanel />
            <RightPanel />
          </div>

          <ModalFooter
            step={modal.step}
            isDirty={modal.isDirty}
            isSavingDraft={modal.isSavingDraft}
            isSubmitting={modal.isSubmitting}
            canProceed={modal.canProceed}
            canSubmit={modal.canSubmit}
            hasAnySlot={hasAnySlot}
            allSlotsConfirmed={allSlotsConfirmed}
            confirmedCount={modal.confirmedCount}
            selectedCount={modal.selectedIds.length}
            onSaveDraft={modal.saveDraft}
            onPrev={modal.prevStep}
            onNext={modal.nextStep}
            onSubmit={modal.handleSubmit}
            onShowMobileAi={() => modal.setShowMobileRight(true)}
          />
        </PostStateContext.Provider>
      </DialogContent>
    </Dialog>
  );
}
