import { CheckCircle2, Clock, Edit3, XCircle } from "lucide-react";
import { Post } from "../../types";

export default function StatusBadge({ status }: { status: Post["status"] }) {
  if (status === "queued")
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-100 text-blue-700 text-[11px] font-bold">
        <Clock size={11} strokeWidth={2} /> Scheduled
      </div>
    );
  if (status === "draft")
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100 text-gray-500 text-[11px] font-bold">
        <Edit3 size={11} strokeWidth={2} /> Draft
      </div>
    );
  if (status === "published")
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 text-[11px] font-bold">
        <CheckCircle2 size={11} strokeWidth={2} /> Published
      </div>
    );
  if (status === "failed")
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-50 border border-red-100 text-red-600 text-[11px] font-bold">
        <XCircle size={11} strokeWidth={2} /> Failed
      </div>
    );
  return null;
}
