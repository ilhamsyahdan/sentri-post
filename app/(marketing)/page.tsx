"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  BrainCircuit,
  BarChart3,
  Clock,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function Logo({ className }: { className?: string }) {
  return (
    <Link href="/">
      <div className={`flex items-center gap-3 shrink-0 ${className || ""}`}>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#065f46] text-xl font-black text-white select-none shadow-sm">
          S
        </div>
        <span className="font-black text-[17px] tracking-tighter text-gray-900 truncate italic">
          SENTRIPOSTS
        </span>
      </div>
    </Link>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      {/* ─── HERO ─── */}
      <section className="px-6 py-16">
        <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
          {/* Left Copy */}
          <div className="flex flex-col gap-6">
            <Badge className="w-fit gap-1.5 rounded-full border-0 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
              <Sparkles className="h-3.5 w-3.5" />
              Sudah Tersedia
            </Badge>

            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Posting lebih cerdas.{" "}
              <span className="text-emerald-800">Tumbuh lebih cepat.</span>{" "}
              Kerja lebih sedikit.
            </h1>

            <p className="max-w-md text-base font-medium leading-relaxed text-gray-500 sm:text-lg">
              SentriPost mengotomatiskan konten Instagram & LinkedIn kamu —
              mulai dari pembuatan caption dengan AI, hingga penjadwalan posting
              otomatis di jam-jam terbaik. Atur sekali. Lupakan. Berkembang.
            </p>

            {/* login pada cta */}
            <div className="mt-4 flex flex-col sm:flex-row items-center gap-4">
              <Link href="/sign-in">
                <Button className="flex h-12 items-center gap-2 whitespace-nowrap rounded-full bg-emerald-800 px-8 font-semibold text-white shadow-sm hover:bg-emerald-900">
                  Mulai Sekarang — Gratis <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              {/* Atau langsung tombol Google OAuth jika ditaruh di landing page */}
            </div>

            <p className="text-xs font-medium text-gray-400">
              Tanpa kartu kredit · Gratis selamanya · Bisa batalkan kapan saja
            </p>
          </div>

          {/* Right — App Preview (mirrors dashboard chrome) */}
          <div className="relative">
            <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-6 shadow-md">
              {/* Mock Header */}
              <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                <span className="text-sm font-bold text-gray-800">
                  Dashboard SentriPosts
                </span>
                <div className="flex gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-gray-300"></div>
                  <div className="h-2.5 w-2.5 rounded-full bg-gray-300"></div>
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-700"></div>
                </div>
              </div>
              {/* Mock Content Blocks */}
              <div className="flex flex-1 gap-3">
                <div className="flex flex-1 flex-col gap-2 rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
                  <div className="h-2 w-2/3 rounded-full bg-gray-800"></div>
                  <div className="h-2 w-full rounded-full bg-gray-200"></div>
                  <div className="h-2 w-4/5 rounded-full bg-gray-200"></div>
                  <div className="mt-auto w-fit rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-800">
                    Terjadwal ✓
                  </div>
                </div>
                <div className="flex flex-1 flex-col gap-2 rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
                  <div className="h-2 w-1/2 rounded-full bg-gray-800"></div>
                  <div className="h-2 w-full rounded-full bg-gray-200"></div>
                  <div className="h-2 w-3/4 rounded-full bg-gray-200"></div>
                  <div className="mt-auto text-[10px] font-semibold text-gray-500">
                    Draft Post
                  </div>
                </div>
              </div>
              {/* Mock Analytics bar */}
              <div className="flex h-14 items-end gap-1 rounded-xl border border-gray-100 bg-white p-2 shadow-sm">
                {[40, 60, 50, 80, 70, 90, 75].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-sm bg-emerald-700/80"
                    style={{ height: `${h}%` }}
                  ></div>
                ))}
              </div>
            </div>
            {/* Floating soft badge */}
            <div className="absolute -right-3 -top-3 rounded-full border border-gray-100 bg-white px-3 py-1.5 shadow-md">
              <span className="text-xs font-semibold text-gray-700">
                Auto-Publish
              </span>
            </div>
          </div>
        </div>
      </section>

      <section id="platforms" className="bg-gray-50/50 px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Dibuat untuk tempat para pro posting
            </h2>
            <p className="mx-auto mt-3 max-w-md font-medium text-gray-600">
              Integrasi mendalam dan native dengan dua platform yang benar-benar
              menggerakkan jarum untuk personal brand dan bisnis.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Instagram Card */}
            <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm">
              <CardHeader className="border-b border-gray-100 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100">
                    <InstagramIcon className="h-6 w-6 text-gray-700" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">
                    Instagram
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 px-6 py-5">
                {[
                  "Auto-posting Feed, Reels & Carousel",
                  "Caption AI & pembuatan hashtag otomatis",
                  "Jadwal waktu terbaik berdasarkan data engagement",
                  "Analitik pertumbuhan followers & jangkauan",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                    <span className="text-sm font-medium text-gray-700">
                      {item}
                    </span>
                  </div>
                ))}
                <Badge className="mt-2 w-fit rounded-full border-0 bg-gray-100 px-3 text-xs font-semibold text-gray-700 hover:bg-gray-100">
                  Terhubung
                </Badge>
              </CardContent>
            </Card>

            {/* LinkedIn Card */}
            <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm">
              <CardHeader className="border-b border-gray-100 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100">
                    <LinkedinIcon className="h-6 w-6 text-gray-700" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">
                    LinkedIn
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 px-6 py-5">
                {[
                  "Auto-jadwal postingan & artikel profesional",
                  "Publikasi otomatis di latar belakang (background job)",
                  "Rekomendasi jam posting optimal berdasarkan riset industri",
                  "Pelacakan impresi, klik & engagement Instagram",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                    <span className="text-sm font-medium text-gray-700">
                      {item}
                    </span>
                  </div>
                ))}
                <Badge className="mt-2 w-fit rounded-full border-0 bg-gray-100 px-3 text-xs font-semibold text-gray-700 hover:bg-gray-100">
                  Terhubung
                </Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ─── FEATURES GRID ─── */}
      <section id="features" className="bg-white px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Semua yang kamu butuhkan. Tanpa yang tidak perlu.
            </h2>
            <p className="mx-auto mt-3 max-w-md font-medium text-gray-600">
              Tiga alat terfokus yang menangani seluruh alur kerja media
              sosialmu secara otomatis.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Smart Schedule */}
            <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
              <CardHeader className="px-6 py-5">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100">
                  <Clock className="h-5 w-5 text-gray-700" />
                </div>
                <CardTitle className="text-lg font-bold text-gray-900">
                  Jadwal Berbasis Riset
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 py-5 pt-0">
                <p className="text-sm leading-relaxed text-gray-600">
                  Postingan dikirim otomatis via background job pada jam-jam
                  optimal berdasarkan riset data industri — memastikan kontenmu
                  terkirim tanpa perlu tebak-tebakan waktu.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {["Jam riset industri", "Background job", "Zona waktu"].map(
                    (t) => (
                      <span
                        key={t}
                        className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700"
                      >
                        {t}
                      </span>
                    )
                  )}
                </div>
              </CardContent>
            </Card>

            {/* AI Generator */}
            <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
              <CardHeader className="px-6 py-5">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100">
                  <BrainCircuit className="h-5 w-5 text-gray-700" />
                </div>
                <CardTitle className="text-lg font-bold text-gray-900">
                  Generator AI
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 py-5 pt-0">
                <p className="text-sm leading-relaxed text-gray-600">
                  Deskripsikan topikmu dan biarkan AI SentriPost menulis caption
                  menarik, hashtag, dan hook yang disesuaikan dengan suara
                  brandmu untuk Instagram dan LinkedIn.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {["Suara brand", "Hashtag", "Hook"].map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Analytics */}
            <Card className="rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
              <CardHeader className="px-6 py-5">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
                  <BarChart3 className="h-5 w-5 text-emerald-700" />
                </div>
                <CardTitle className="text-lg font-bold text-gray-900">
                  Analitik
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 py-5 pt-0">
                <p className="text-sm leading-relaxed text-gray-600">
                  Lacak jangkauan, impresi, tingkat engagement, dan pertumbuhan
                  followers di Instagram dan LinkedIn dari satu dashboard
                  terpadu — secara real time.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {["Real-time", "Tampilan terpadu", "Ekspor CSV"].map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ─── */}
      <section className="bg-gray-50 px-6 py-14 sm:py-16">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 text-center">
          <Badge className="rounded-full border-0 bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
            100% Gratis — Tanpa Kartu Kredit
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Berhenti buang waktu untuk{" "}
            <span className="text-emerald-800">posting manual.</span>
          </h2>
          <p className="max-w-md font-medium text-gray-500">
            SentriPost mengurus Instagram & LinkedIn kamu sementara kamu fokus
            membangun bisnis yang sesungguhnya.
          </p>
          <Button className="flex h-12 items-center gap-2 rounded-full bg-emerald-800 px-8 text-base font-semibold text-white shadow-sm hover:bg-emerald-900">
            Mulai Gratis <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section id="faq" className="px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ada pertanyaan? Kami siap jawab.
            </h2>
          </div>

          <Accordion type="single" collapsible className="flex flex-col gap-3">
            {[
              {
                q: "Apakah SentriPost benar-benar gratis?",
                a: "Ya — sepenuhnya gratis. SentriPost dapat digunakan dengan akses penuh ke semua fitur termasuk penjadwalan otomatis dan analitik Instagram. Tanpa biaya tersembunyi, tanpa masa percobaan, tanpa kartu kredit.",
              },
              {
                q: "Platform apa saja yang didukung SentriPost?",
                a: "SentriPost dirancang khusus untuk Instagram dan LinkedIn. Kami fokus mendalam pada kedua platform ini untuk memberikan integrasi setingkat native dan penjadwalan pos otomatis — daripada menyebar tipis ke semua jaringan.",
              },
              {
                q: "Bagaimana cara kerja jadwal posting optimal?",
                a: "Kami menggunakan acuan jendela waktu terbaik berdasarkan riset data industri (seperti standar platform terpercaya). Sistem background job kami akan otomatis mempublikasikan postingan pada jam-jam tersebut untuk jangkauan maksimal.",
              },
              {
                q: "Bisakah saya meninjau draf sebelum diposting otomatis?",
                a: "Tentu saja. Setiap draf pos masuk ke antrean kamu terlebih dahulu. Kamu bisa mengedit, menyetujui, menjadwal ulang, atau membuangnya sebelum proses background job mengeksekusinya. Kamu selalu tetap memegang kendali.",
              },
              {
                q: "Apakah data akun saya aman?",
                a: "Ya. Kami menggunakan OAuth 2.0 untuk menghubungkan akun Instagram dan LinkedIn kamu — kami tidak pernah menyimpan kata sandimu. Semua data dienkripsi saat transit dan saat disimpan, dan kamu bisa memutuskan koneksi akunmu kapan saja.",
              },
            ].map((item, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="rounded-2xl border border-gray-100 px-0 shadow-sm"
              >
                <AccordionTrigger className="px-5 py-4 text-left text-sm font-semibold hover:no-underline">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="border-t border-gray-100 px-5 pb-4 pt-3 text-sm leading-relaxed text-gray-500">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-gray-100 px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 md:flex-row">
          <Logo />

          <div className="flex flex-wrap justify-center gap-6 text-sm font-medium text-gray-500">
            <a href="#features" className="hover:text-gray-900">
              Fitur
            </a>
            <a href="#platforms" className="hover:text-gray-900">
              Platform
            </a>
            <a href="#faq" className="hover:text-gray-900">
              FAQ
            </a>
          </div>

          <p className="text-xs text-gray-400">
            © 2026 SentriPost. Hak cipta dilindungi.
          </p>
        </div>
      </footer>
    </div>
  );
}
