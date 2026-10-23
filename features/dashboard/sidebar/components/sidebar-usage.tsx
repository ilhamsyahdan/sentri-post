export const SidebarUsage = () => (
  <div className="px-3">
    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          Usage
        </span>
        <span className="text-[10px] font-bold text-[#4F7A28]">Free Plan</span>
      </div>
      <p className="text-xs text-gray-600 mb-1.5 font-medium">
        24 / 50 posts this month
      </p>
      <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#4F7A28] rounded-full transition-all"
          style={{ width: "48%" }}
        />
      </div>
      <button className="mt-2.5 w-full text-center text-[11px] font-bold text-[#4F7A28] hover:underline">
        Upgrade for unlimited →
      </button>
    </div>
  </div>
);
