import { Skeleton } from "@/components/ui/skeleton";

const Loading = () => {
  return (
    <div className="space-y-6 p-6">
      {/* Header: Judul & Tombol Refresh */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-full" /> {/* Icon Instagram */}
            <Skeleton className="h-8 w-56" /> {/* Teks "Instagram Analytics" */}
          </div>
          <Skeleton className="h-4 w-36" />{" "}
          {/* Teks "0 post · 0 dengan data" */}
        </div>
        <Skeleton className="h-10 w-24 rounded-lg" /> {/* Tombol Refresh */}
      </div>

      {/* Tombol Tab (Overview & Semua Post) */}
      <div className="flex gap-2">
        <Skeleton className="h-10 w-28 rounded-full" />
        <Skeleton className="h-10 w-32 rounded-full" />
      </div>

      {/* Kotak Area Konten Utama */}
      <div className="rounded-2xl border border-gray-100 bg-white p-12 shadow-sm flex flex-col items-center justify-center space-y-4">
        <div className="flex items-end gap-1.5 h-10">
          <Skeleton className="h-6 w-2" />
          <Skeleton className="h-10 w-2" />
          <Skeleton className="h-8 w-2" />
        </div>
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
    </div>
  );
};

export default Loading;
