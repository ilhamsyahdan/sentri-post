"use client";

import React, { createContext, useCallback, useContext, useState } from "react";

interface PostModalContextValue {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const PostModalContext = createContext<PostModalContextValue | null>(null);

export function PostModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = useCallback(() => setIsOpen(true), []);
  const closeModal = useCallback(() => setIsOpen(false), []);

  return (
    <PostModalContext.Provider value={{ isOpen, openModal, closeModal }}>
      {children}
    </PostModalContext.Provider>
  );
}

export function usePostModalContext() {
  const ctx = useContext(PostModalContext);
  if (!ctx)
    throw new Error(
      "usePostModalContext harus dipakai di dalam PostModalProvider"
    );
  return ctx;
}
