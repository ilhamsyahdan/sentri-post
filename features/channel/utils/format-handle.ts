interface FormatHandleInput {
  platform: string;
  platform_user_name: string; // Menggunakan properti asli dari Supabase
}

export function formatHandle(row: FormatHandleInput) {
  if (row.platform === "linkedin") return "LinkedIn Account";
  if (row.platform === "instagram") return `@${row.platform_user_name}`;
  return row.platform;
}
