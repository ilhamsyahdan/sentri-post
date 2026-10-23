import Image from "next/image";
import { PLATFORM_CONFIG, Post } from "../../types";
import { fromPost, LinkedinPreview } from "../previews";
import { useState } from "react";
import Modal from "@/components/ui/modal";
import { cn } from "@/lib/utils";
import InstagramPreview from "../previews/instagram-preview";
import { X } from "lucide-react";

const PreviewModal = ({
  post,
  open,
  onClose,
}: {
  post: Post;
  open: boolean;
  onClose: () => void;
}) => {
  const [active, setActive] = useState<Post["platform"]>(post.platform);
  const data = fromPost(post);

  return (
    <Modal open={open} onClose={onClose} maxWidth="max-w-md">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h2 className="text-base font-bold text-gray-900">Preview Post</h2>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-all"
        >
          <X size={16} />
        </button>
      </div>

      {/* Platform Switcher */}
      <div className="flex gap-1.5 px-5 pt-4 flex-wrap">
        {(Object.keys(PLATFORM_CONFIG) as Post["platform"][]).map((p) => {
          const c = PLATFORM_CONFIG[p];
          return (
            <button
              key={p}
              onClick={() => setActive(p)}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all",
                active === p
                  ? cn("border-transparent text-white", c.bg)
                  : "border-gray-200 text-gray-400 hover:border-gray-300"
              )}
            >
              <Image
                src={c.iconSrc}
                alt={c.label}
                width={10}
                height={10}
                className={cn("object-contain")}
              />
              {c.label}
            </button>
          );
        })}
      </div>

      <div className="p-5">
        {/* {active === "twitter" && <TwitterPreview data={data} />} */}
        {active === "instagram" && <InstagramPreview data={data} />}
        {active === "linkedin" && <LinkedinPreview data={data} />}
        {/* {active === "tiktok" && <TiktokPreview post={post} />} */}
        <p className="text-center text-[11px] text-gray-400 mt-3">
          Preview ini estimasi tampilan — bisa sedikit berbeda di app aslinya
        </p>
      </div>
    </Modal>
  );
};

export default PreviewModal;
