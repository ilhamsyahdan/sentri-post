import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6 p-6">
      {/* Judul Halaman */}
      <Skeleton className="h-8 w-32" />

      {/* Card Utama Pembungkus Kalender */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-6">
        {/* Header atas: Legend & "Drag to reschedule" */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-4 w-14" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-4 w-14" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-4 w-12" />
            </div>
          </div>
          <Skeleton className="h-4 w-28" />
        </div>

        {/* Toolbar Kalender (Navigasi & Tombol Week/Month) */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <Skeleton className="h-10 w-10 rounded-lg" />
            <Skeleton className="h-10 w-20 rounded-lg" />
          </div>
          <Skeleton className="h-6 w-36" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-20 rounded-lg" />
            <Skeleton className="h-10 w-20 rounded-lg" />
          </div>
        </div>

        {/* Grid Tabel Kalender (Waktu & Kolom Hari) */}
        <div className="rounded-xl border border-gray-100 overflow-hidden">
          {/* Header Hari (Sun - Sat) */}
          <div className="grid grid-cols-8 border-b border-gray-100 p-3 bg-gray-50/50">
            <Skeleton className="h-4 w-8" />
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="flex justify-center">
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>

          {/* Baris Jam (6am, 7am, 8am, dst) */}
          {[6, 7, 8, 9].map((hour) => (
            <div
              key={hour}
              className="grid grid-cols-8 border-b border-gray-100 last:border-none p-4 items-center"
            >
              <Skeleton className="h-4 w-10" />
              {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                <div
                  key={day}
                  className="h-16 border-r border-gray-50 last:border-none px-2"
                >
                  {/* Simulasi kotak event acak di beberapa slot */}
                  {(hour === 7 && day === 3) || (hour === 8 && day === 5) ? (
                    <Skeleton className="h-full w-full rounded-md" />
                  ) : null}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
