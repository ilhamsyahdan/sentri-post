import { auth } from "@clerk/nextjs/server";
import { ShieldOff } from "lucide-react";
import { supabaseAdmin } from "@/utils/supabase/admin";
import { SignOutBtn } from "./_components/sign-out-button";
import { formatIndonesianDate } from "@/lib/timezone";

async function getBanInfo(userId: string) {
  const { data } = await supabaseAdmin
    .from("users")
    .select("ban_reason, banned_at, banned_by")
    .eq("id", userId)
    .single();
  return data;
}

export default async function BannedPage() {
  const { userId } = await auth();
  const banInfo = userId ? await getBanInfo(userId) : null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-4 space-y-6 text-center">
        {/* Icon */}
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <ShieldOff className="w-8 h-8 text-red-500" />
        </div>

        {/* Pesan utama */}
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-gray-900">
            Akun Anda Dinonaktifkan
          </h1>
          <p className="text-sm text-gray-500">
            Akun Anda telah dinonaktifkan dan tidak dapat mengakses layanan ini.
          </p>
        </div>

        {/* Detail ban */}
        {banInfo && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-4 text-left space-y-3">
            {banInfo.ban_reason && (
              <div>
                <p className="text-[10px] font-semibold text-red-500 uppercase tracking-wide mb-1">
                  Alasan
                </p>
                <p className="text-sm text-red-700">{banInfo.ban_reason}</p>
              </div>
            )}
            {banInfo.banned_at && (
              <div>
                <p className="text-[10px] font-semibold text-red-500 uppercase tracking-wide mb-1">
                  Dinonaktifkan pada
                </p>
                <p className="text-sm text-red-700 font-mono">
                  {formatIndonesianDate(banInfo.banned_at)}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Kontak */}
        <div className="bg-gray-100 rounded-lg px-4 py-3">
          <p className="text-xs text-gray-500">
            Merasa ini kesalahan? Hubungi{" "}
            <a
              href="mailto:support@sentripost.com"
              className="text-blue-600 underline"
            >
              support@sentripost.com
            </a>
          </p>
        </div>

        {/* Logout */}
        <SignOutBtn />
      </div>
    </div>
  );
}
