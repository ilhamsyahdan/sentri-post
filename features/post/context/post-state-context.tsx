"use client";

import { createContext, useContext } from "react";
import { usePostModal } from "../hooks/use-post-modal";

type PostModalState = ReturnType<typeof usePostModal>;

const PostStateContext = createContext<PostModalState | null>(null);

export function usePostState() {
  const ctx = useContext(PostStateContext);
  if (!ctx) throw new Error("usePostState harus dipakai di dalam PostModal");
  return ctx;
}

export { PostStateContext };
