// Reach di bawah ambang ini dianggap belum cukup buat dipercaya sebagai
// sinyal performa — 1-2 reach gampang banget nge-jebol jadi "100%" cuma
// dari 1 komentar doang, padahal itu bukan performa bagus, cuma noise.
export const MIN_RELIABLE_REACH = 10;

// Trend hanya dihitung dari post yang BENERAN sudah published (punya data
// analytics asli), supaya nggak kebandingin sama post terjadwal yang
// metriknya masih 0. Kalau post published-nya masih sedikit/timpang,
// badge disembunyikan daripada nampilin angka yang menyesatkan.
export const MIN_PUBLISHED_FOR_TREND = 6;
