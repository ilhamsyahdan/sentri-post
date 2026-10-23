"use client";

import { useClerk } from "@clerk/nextjs";

export function SignOutBtn() {
  const { signOut } = useClerk();

  const handleSignOut = async () => {
    await signOut({ redirectUrl: "/" });
  };

  return (
    <div className="space-y-3">
      <button
        onClick={handleSignOut}
        className="text-sm text-gray-400 hover:text-gray-600 underline block mx-auto"
      >
        Keluar dari akun ini
      </button>
      <p className="text-xs text-gray-400">
        Di halaman login, klik {"Gunakan akun lain"} untuk ganti akun
      </p>
    </div>
  );
}
