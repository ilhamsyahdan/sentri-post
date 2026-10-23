import { useState } from "react";

export function useSidebarState() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const toggle = () => setIsCollapsed((prev) => !prev);
  return { isCollapsed, setIsCollapsed, toggle };
}
