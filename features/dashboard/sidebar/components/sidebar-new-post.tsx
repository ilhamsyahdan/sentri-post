import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, PlusIcon, CreditCardIcon } from "lucide-react";

interface SidebarNewPostProps {
  isCollapsed: boolean;
  onNewPost: () => void;
}

export const SidebarNewPost = ({
  isCollapsed,
  onNewPost,
}: SidebarNewPostProps) => {
  const router = useRouter();

  return (
    <div
      className={cn(
        "flex flex-col px-3 mb-5 shrink-0",
        isCollapsed && "px-2 items-center"
      )}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            className={cn(
              "bg-[#065f46] hover:bg-[#053b2c] text-white shadow-none border-none transition-all duration-300 overflow-hidden font-bold",
              isCollapsed
                ? "w-10 h-10 p-0 rounded-xl justify-center border"
                : "w-full h-10 rounded-xl gap-2 justify-start"
            )}
          >
            <div className="flex items-center justify-center w-full">
              <PlusIcon className="w-4 h-4 shrink-0" strokeWidth={2.5} />
              {!isCollapsed && <span>New Post</span>}
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          side={isCollapsed ? "right" : "bottom"}
          className="w-52 p-1.5 rounded-xl shadow-xl border-gray-100 ml-1"
        >
          <DropdownMenuItem
            onClick={onNewPost}
            className="cursor-pointer py-2.5 px-3 rounded-lg text-sm gap-2.5"
          >
            <Plus className="h-4 w-4 text-[#065f46]" />
            <div>
              <p className="font-semibold text-gray-800">Create Post</p>
              <p className="text-[11px] text-gray-400 font-normal">
                Schedule for any channel
              </p>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer py-2.5 px-3 rounded-lg text-sm gap-2.5"
            onClick={() => router.push(`/dashboard/publish?tab=drafts`)}
          >
            <CreditCardIcon className="h-4 w-4 text-purple-500" />
            <div>
              <p className="font-semibold text-gray-800">Idea / Draft</p>
              <p className="text-[11px] text-gray-400 font-normal">
                Save for later
              </p>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
