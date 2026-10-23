export async function CurrentTime() {
  const formatted = new Date().toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return <p className="mt-0.5 font-mono text-xs text-gray-400">{formatted}</p>;
}
