"use client";

import { CheckCircle2 } from "lucide-react";
import { DialogTitle } from "@/components/ui/dialog";
import StepBar from "./step-bar";
import { Step } from "../../types";

interface ModalHeaderProps {
  step: Step;
}

export function ModalHeader({ step }: ModalHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b shrink-0 bg-white gap-3">
      <DialogTitle className="text-base font-bold text-gray-900 shrink-0">
        Create Post
      </DialogTitle>
      <StepBar current={step} />
      <span className="hidden sm:flex items-center gap-1 text-[11px] text-gray-400 shrink-0 mx-4">
        <CheckCircle2 size={12} className="text-green-500" />
        Auto-save
      </span>
    </div>
  );
}
