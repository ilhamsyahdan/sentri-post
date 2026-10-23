import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://344b445b47ab660597c2c9c3469c9689@o4512128563085312.ingest.us.sentry.io/4512128573440000",

  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1,

  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  dataCollection: {},
});

// Muat Replay setelah halaman selesai dimuat, di luar bundle awal
if (typeof window !== "undefined") {
  window.addEventListener("load", () => {
    setTimeout(async () => {
      try {
        const replay = await Sentry.lazyLoadIntegration("replayIntegration");
        Sentry.addIntegration(replay());
      } catch {
        // abaikan jika gagal dimuat
      }
    }, 2000);
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
