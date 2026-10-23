// features/admin/users/components/BanUserDialog.tsx
"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { banUserAction } from "../actions/user-actions";
import type { AdminUser } from "../types/user-types";

type Props = {
  user: AdminUser;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function BanUserDialog({ user, open, onClose, onSuccess }: Props) {
  const [reason, setReason] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    if (reason.trim().length < 5) {
      toast.error("Reason must be at least 5 characters.");
      return;
    }
    const formData = new FormData();
    formData.set("userId", user.id);
    formData.set("reason", reason.trim());

    startTransition(async () => {
      const result = await banUserAction(formData);
      if (result.success) {
        toast.success(user.full_name ?? user.email + " has been banned.");
        setReason("");
        onSuccess();
        onClose();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md bg-white border-slate-200 dark:bg-[#1a1d24] dark:border-white/[0.08]">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Ban User
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-slate-500 dark:text-slate-400">
            You are about to ban{" "}
            <span className="font-medium text-slate-800 dark:text-slate-200">
              {user.full_name ?? user.email}
            </span>
            . They will immediately lose access to Sentripost.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-2">
          <Label
            htmlFor="ban-reason"
            className="text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Reason <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="ban-reason"
            placeholder="e.g. Violation of terms of service."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            disabled={isPending}
            className="mt-1.5 resize-none text-sm dark:bg-white/[0.04] dark:border-white/[0.08] dark:text-slate-200 dark:placeholder:text-slate-600"
          />
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            This reason will be logged for audit purposes.
          </p>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={isPending}
            className="dark:bg-white/[0.04] dark:border-white/[0.08] dark:text-slate-300 dark:hover:bg-white/[0.08]"
          >
            Cancel
          </AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={isPending || reason.trim().length < 5}
            className="min-w-[80px]"
          >
            {isPending ? "Banning..." : "Ban User"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
