import { Sparkles, Clock } from "lucide-react"; // Menggunakan Clock sebagai pengganti ikon di kanan

const ResearchRecommendationBanner = () => (
  <div className="rounded-2xl bg-linear-to-r from-[#E6F2ED] via-[#EFF7F3] to-[#E6F2ED] border border-[#B7D9CB] p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-3">
    <div className="w-9 h-9 rounded-xl bg-[#065f46] flex items-center justify-center shrink-0">
      <Sparkles className="text-white w-4 h-4" strokeWidth={2.2} />
    </div>

    <div className="flex-1 min-w-0">
      <p className="text-sm font-bold text-[#053b2c]">
        Rekomendasi Berbasis Riset
      </p>
      <p className="text-xs text-[#0d6b4f] mt-0.5">
        Panduan awal jam posting optimal berdasarkan riset data industri untuk
        memaksimalkan visibilitas.
      </p>
    </div>

    <div className="flex items-center gap-2 shrink-0">
      {/* Status badge diganti menjadi Standard/Verified */}
      <div className="flex items-center gap-1.5 bg-white border border-[#B7D9CB] rounded-xl px-3 py-1.5">
        <Clock size={12} className="text-[#065f46]" />
        <span className="text-xs font-bold text-[#053b2c]">Standard</span>
      </div>
    </div>
  </div>
);

export default ResearchRecommendationBanner;
