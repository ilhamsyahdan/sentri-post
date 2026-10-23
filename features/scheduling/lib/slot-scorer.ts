// Referensi waktu terbaik publikasi per platform (sumber: laporan riset industri)

export const RESEARCH_BASE: Record<string, Record<number, string[]>> = {
  instagram: {
    0: [], // Sunday
    1: ["14:00", "15:00", "16:00"], // Monday
    2: ["13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"], // Tuesday
    3: [
      "12:00",
      "13:00",
      "14:00",
      "15:00",
      "16:00",
      "17:00",
      "18:00",
      "19:00",
      "20:00",
      "21:00",
      "23:00",
    ], // Wednesday
    4: ["12:00", "13:00", "14:00"], // Thursday
    5: [], // Friday
    6: [], // Saturday
  },

  linkedin: {
    0: [], // Sunday
    1: ["13:00", "14:00"], // Monday
    2: ["11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"], // Tuesday
    3: ["11:00", "12:00", "13:00", "14:00", "15:00", "16:00"], // Wednesday
    4: ["11:00", "13:00", "14:00", "15:00", "16:00", "17:00"], // Thursday
    5: ["11:00", "13:00", "14:00"], // Friday
    6: [], // Saturday
  },
};
