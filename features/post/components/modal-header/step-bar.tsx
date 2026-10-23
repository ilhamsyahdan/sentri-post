import { memo } from "react";
import { Step } from "../../types";
import { STEP_LIST } from "../../constants";
import { cn } from "@/lib/utils";
import { CheckCircle2, ChevronRight } from "lucide-react";

const StepBar = memo(({ current }: { current: Step }) => {
  const idx = STEP_LIST.findIndex((s) => s.key === current);
  return (
    <div className="flex items-center gap-0 select-none">
      {STEP_LIST.map((step, i) => {
        const done = i < idx;
        const active = i === idx;
        const Icon = step.icon;
        return (
          <div key={step.key} className="flex items-center">
            <div
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all",
                active
                  ? "bg-emerald-100 border border-emerald-300 text-emerald-900"
                  : done
                  ? "text-emerald-800"
                  : "text-gray-300"
              )}
            >
              {done ? (
                <CheckCircle2 size={12} className="text-emerald-800" />
              ) : (
                <Icon size={12} />
              )}
              <span className="hidden sm:inline">{step.label}</span>
            </div>
            {i < STEP_LIST.length - 1 && (
              <ChevronRight
                size={11}
                className={cn(
                  "mx-0.5",
                  i < idx ? "text-emerald-800" : "text-gray-200"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
});
StepBar.displayName = "StepBar";
export default StepBar;
