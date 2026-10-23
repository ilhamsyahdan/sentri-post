import * as Sentry from "@sentry/nextjs";

type LogContext = Record<string, unknown>;

const isDev = process.env.NODE_ENV !== "production";

/**
 * Logger terpusat untuk seluruh project.
 *
 * - Di development: tetap tampil di console (supaya alur debug tidak berubah).
 * - Di production: dikirim ke Sentry, TIDAK dicetak ke console browser user
 *   (supaya tidak bocor detail internal ke user).
 *
 * Aman dipakai di file "use client" maupun server (Server Actions, Route Handlers) —
 * Sentry SDK otomatis mengarah ke config client/server/edge yang sesuai
 * tergantung dari environment mana fungsi ini dipanggil.
 */
export const logger = {
  /**
   * Untuk error yang benar-benar gagal (upload gagal, request gagal, dsb).
   * Selalu sertakan `error` asli (dari catch) supaya stack trace ikut terkirim.
   */
  error(message: string, error: unknown, context?: LogContext) {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.error(`[error] ${message}`, error, context);
    }

    Sentry.captureException(error, {
      extra: { message, ...context },
    });
  },

  /**
   * Untuk kondisi yang mencurigakan tapi bukan crash
   * (misal: cleanup draft gagal tapi flow utama tetap sukses).
   */
  warn(message: string, context?: LogContext) {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.warn(`[warn] ${message}`, context);
    }

    Sentry.captureMessage(message, {
      level: "warning",
      extra: context,
    });
  },

  /**
   * Untuk info biasa saat development saja.
   * TIDAK dikirim ke Sentry (supaya kuota Sentry tidak habis oleh log yang bukan masalah).
   */
  info(message: string, context?: LogContext) {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.info(`[info] ${message}`, context);
    }
  },
};
