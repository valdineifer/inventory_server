import * as Sentry from "@sentry/remix";

Sentry.init({
  integrations: [
    Sentry.captureConsoleIntegration({ handled: true }),
  ],
  tracesSampleRate: 1,
  autoInstrumentRemix: true,
})