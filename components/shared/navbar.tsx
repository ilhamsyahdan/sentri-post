"use client";

import { useState } from "react";
import Link from "next/link";
import { SignInButton, SignUpButton, UserButton, useAuth } from "@clerk/nextjs";
import { Menu, X } from "lucide-react";
import { logger } from "@/lib/logger";

/* Reusable soft button styles */
const btnPrimary =
  "inline-flex items-center justify-center rounded-full bg-emerald-800 text-white font-semibold text-sm px-5 py-2 shadow-sm hover:bg-emerald-900 transition-colors cursor-pointer";

const btnGhost =
  "inline-flex items-center justify-center rounded-full border border-gray-200 text-gray-700 font-semibold text-sm px-5 py-2 bg-transparent hover:bg-gray-50 transition-colors cursor-pointer";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isSignedIn } = useAuth();

  const navLinks = [
    { href: "#features", label: "Fitur" },
    { href: "#platforms", label: "Platform" },
    { href: "#faq", label: "FAQ" },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-sm px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* ── LOGO ── */}
        <Link href="/">
          <div className={`flex items-center gap-3 shrink-0`}>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#065f46] text-xl font-black text-white select-none shadow-sm">
              S
            </div>
            <span className="font-black text-[17px] tracking-tighter text-gray-900 truncate italic">
              SENTRIPOSTS
            </span>
          </div>
        </Link>

        {/* ── DESKTOP NAV ── */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
            >
              {link.label}
            </a>
          ))}

          {/* ── AUTH ── */}
          {isSignedIn ? (
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className={btnPrimary}>
                Dashboard
              </Link>
              <div className="rounded-full ring-1 ring-gray-200 overflow-hidden">
                <UserButton />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <SignInButton mode="modal" fallbackRedirectUrl="/auth-redirect">
                <button className={btnGhost}>Masuk</button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className={btnPrimary}>Daftar Gratis</button>
              </SignUpButton>
            </div>
          )}
        </div>

        {/* ── MOBILE TOGGLE ── */}
        <button
          className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-700"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Buka menu"
        >
          {mobileMenuOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* ── MOBILE MENU ── */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 mt-4 pt-4 pb-2 flex flex-col gap-1">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              {link.label}
            </a>
          ))}

          {isSignedIn ? (
            <div className="flex items-center gap-3 pt-2">
              <Link
                href="/dashboard"
                className={`${btnPrimary} flex-1 justify-center`}
              >
                Dashboard
              </Link>
              <div className="rounded-full ring-1 ring-gray-200 overflow-hidden">
                <UserButton />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2 pt-2">
              <SignInButton mode="modal" fallbackRedirectUrl="/auth-redirect">
                <button className={`${btnGhost} w-full`}>Masuk</button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className={`${btnPrimary} w-full`}>
                  Daftar Gratis
                </button>
              </SignUpButton>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
