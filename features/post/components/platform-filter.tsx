import { Globe } from "lucide-react";
import Image from "next/image";
import { PlatformFilter } from "../types";
import { PLATFORM_ACTIVE_STYLES, PLATFORM_FILTER_OPTIONS } from "../constants";
import { cn } from "@/lib/utils";

const PlatformFilters = ({
  active,
  onChange,
}: {
  active: PlatformFilter;
  onChange: (v: PlatformFilter) => void;
}) => (
  <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
    {PLATFORM_FILTER_OPTIONS.map(({ value, label, iconSrc }) => (
      <button
        key={value}
        onClick={() => onChange(value)}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border",
          active === value
            ? PLATFORM_ACTIVE_STYLES[value]
            : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-700"
        )}
      >
        {iconSrc ? (
          <Image
            src={iconSrc}
            alt={label}
            width={12}
            height={12}
            className={cn(
              "object-contain",
              active === value // make white on colored bg
            )}
          />
        ) : (
          <Globe size={12} strokeWidth={2} />
        )}
        {label}
      </button>
    ))}
  </div>
);

export default PlatformFilters;
