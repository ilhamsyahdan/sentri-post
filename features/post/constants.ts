import {
  Calendar,
  Eye,
  Hash,
  MessageSquare,
  Pencil,
  Sparkles,
  Wand2,
} from "lucide-react";
import {
  AiMode,
  Channel,
  Platform,
  PlatformFilter,
  PlatformFilterOption,
  Step,
} from "./types";

// =============================================================================
// BRAND
// =============================================================================

export const BRAND = {
  green: {
    DEFAULT: "#4F7A28",
    dark: "#3A6B14",
    light: "#EBF5E1",
    border: "#C8E6A0",
    text: "#3A6B14",
  },
  amber: {
    light: "amber-50",
    border: "amber-100",
    text: "amber-700",
  },
} as const;

// =============================================================================
// PLATFORM
// FIX: Sebelumnya warna tersebar di dua tempat (constants.ts lama &
// post-modal.tsx). Sekarang satu source of truth.
// =============================================================================

export const PLATFORM_COLOR: Record<Platform, string> = {
  linkedin: "bg-[#0A66C2]",
  twitter: "bg-black",
  youtube: "bg-red-600",
  instagram: "bg-[#E1306C]",
  tiktok: "bg-black",
  facebook: "bg-blue-700",
} as const;

export const PLATFORM_CHAR_LIMIT: Record<Platform, number> = {
  linkedin: 3000,
  twitter: 280,
  youtube: 5000,
  instagram: 2200,
  tiktok: 2200,
  facebook: 63206,
} as const;

// Filter platform untuk calendar / analytics view
export const PLATFORM_FILTER_OPTIONS: PlatformFilterOption[] = [
  { value: "all", label: "All" },
  // { value: "twitter", label: "Twitter", iconSrc: "/twitter.png" },
  { value: "instagram", label: "Instagram", iconSrc: "/instagram.png" },
  { value: "linkedin", label: "LinkedIn", iconSrc: "/linkedin.png" },
];

export const PLATFORM_ACTIVE_STYLES: Record<PlatformFilter, string> = {
  all: "bg-gray-800 text-white border-transparent",
  // twitter: "bg-black text-white border-transparent",
  instagram: "bg-pink-500 text-white border-transparent",
  linkedin: "bg-[#0A66C2] text-white border-transparent",
};

// =============================================================================
// CHANNELS (mock / dummy)
// NOTE: Untuk production, gunakan __fixtures__/mock-data.ts.
// Di sini tetap ada agar tidak breaking import yang sudah ada.
// =============================================================================

export const DUMMY_CHANNELS: Channel[] = [
  {
    id: "acc_1",
    name: "Ilham Syahdan",
    platform: "linkedin",
    avatar: "/pp-adan.png",
    icon: "/linked-in.png",
  },
  // {
  //   id: "acc_2",
  //   name: "SentriPosts",
  //   platform: "youtube",
  //   avatar: "/youtube-profile.png",
  //   icon: "/youtube.png",
  // },
  // {
  //   id: "acc_3",
  //   name: "SentriPosts",
  //   platform: "twitter",
  //   avatar: "/twitter-profile.png",
  //   icon: "/twitter.png",
  // },
  {
    id: "acc_4",
    name: "SentriPosts",
    platform: "instagram",
    avatar: "/twitter-profile.png",
    icon: "/instagram.png",
  },
];

// =============================================================================
// STEPS
// =============================================================================

export const STEP_LIST: {
  key: Step;
  label: string;
  icon: React.ElementType;
}[] = [
  { key: "compose", label: "Compose", icon: Pencil },
  { key: "schedule", label: "Schedule", icon: Calendar },
  { key: "review", label: "Review", icon: Eye },
];

// =============================================================================
// DRAFTS & RETRY
// =============================================================================

export const DRAFT_PREVIEW_LENGTH = 60;
export const DEFAULT_MAX_RETRIES = 3;

// =============================================================================
// SCHEDULING
// =============================================================================

export const SUGGESTED_TIMES = [
  { label: "Hari ini 12.00", offset: 0, hour: 12 },
  { label: "Hari ini 19.00", offset: 0, hour: 19 },
  { label: "Besok 08.00", offset: 1, hour: 8 },
  { label: "Besok 20.00", offset: 1, hour: 20 },
] as const;

// =============================================================================
// AI ASSISTANT
// =============================================================================

export const TONE_OPTIONS = [
  { value: "profesional", emoji: "👔" },
  { value: "santai", emoji: "😊" },
  { value: "inspiratif", emoji: "✨" },
  { value: "humoris", emoji: "😄" },
  { value: "persuasif", emoji: "🎯" },
  { value: "informatif", emoji: "📚" },
] as const;

export const QUICK_PROMPTS = [
  "Produk launch baru",
  "Behind the scenes",
  "Tips & tricks",
  "Milestone perusahaan",
  "Promosi diskon",
  "Kutipan inspiratif",
] as const;

export const MODE_CONFIG: Record<
  AiMode,
  { label: string; icon: React.ElementType; desc: string }
> = {
  generate: {
    label: "Generate",
    icon: Sparkles,
    desc: "Buat caption dari awal",
  },
  improve: { label: "Improve", icon: Wand2, desc: "Perbaiki teks yang ada" },
  hashtags: { label: "Hashtags", icon: Hash, desc: "Sarankan hashtag relevan" },
  hooks: {
    label: "Hook Ideas",
    icon: MessageSquare,
    desc: "3 pilihan kalimat pembuka",
  },
};

// =============================================================================
// AI PROMPT BUILDER
// FIX: Template literal yang panjang dan sulit dibaca dipecah jadi array join.
// Jika logic makin kompleks, pindahkan ke lib/ai/prompt-builder.ts
// =============================================================================

export function buildPrompt(
  mode: AiMode,
  platform: Channel["platform"] | null,
  tone: string,
  topic: string,
  currentText: string
): string {
  const p = platform ?? "social media";
  // const twitterLimit = platform === "twitter" ? "Maksimal 280 karakter." : "";
  const linkedinStyle =
    platform === "linkedin"
      ? "Tulis dengan gaya profesional, bisa pakai line break untuk readability."
      : "";

  switch (mode) {
    case "generate":
      return [
        `Kamu adalah copywriter ahli media sosial.`,
        `Buat caption untuk platform ${p} dengan tone ${tone}.`,
        topic ? `Topik: ${topic}` : "",
        `Berikan caption yang engaging, natural, dan sesuai karakter platform.`,
        `Tulis HANYA caption-nya saja, tanpa penjelasan tambahan.`,
        // twitterLimit,
        linkedinStyle,
      ]
        .filter(Boolean)
        .join("\n");

    case "improve":
      return [
        `Kamu adalah copywriter ahli.`,
        `Perbaiki caption ini untuk platform ${p} dengan tone ${tone}:`,
        `\n"${currentText}"\n`,
        `Buat lebih engaging, jelas, dan sesuai platform.`,
        `Tulis HANYA caption yang sudah diperbaiki, tanpa penjelasan.`,
        // twitterLimit,
      ]
        .filter(Boolean)
        .join("\n");

    case "hashtags":
      return [
        `Berikan 10-15 hashtag relevan untuk konten ini di platform ${p}:`,
        `\n"${currentText || topic}"\n`,
        `Format: satu baris, dipisah spasi, mulai dengan #.`,
        `Tulis HANYA hashtag-nya saja.`,
      ]
        .filter(Boolean)
        .join("\n");

    case "hooks":
      return [
        `Buat 3 pilihan kalimat pembuka (hook) yang powerful untuk caption ini di ${p} dengan tone ${tone}:`,
        `\nKonteks: ${currentText || topic}\n`,
        `Format: nomor 1, 2, 3. Setiap hook 1-2 kalimat saja.`,
        `Langsung ke hook-nya, tanpa intro.`,
      ]
        .filter(Boolean)
        .join("\n");
  }
}
