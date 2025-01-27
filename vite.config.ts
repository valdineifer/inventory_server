import { sentryVitePlugin } from '@sentry/vite-plugin';
import { vitePlugin as remix } from '@remix-run/dev';
import { installGlobals } from '@remix-run/node';
import { defineConfig, loadEnv } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { flatRoutes } from 'remix-flat-routes';

installGlobals();

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      remix({
        routes: async (defineRoutes) => flatRoutes('routes', defineRoutes),
      }),
      tsconfigPaths({}),
      sentryVitePlugin({
        org: 'personal-fpr',
        project: 'javascript-remix',
        sourcemaps: {
          filesToDeleteAfterUpload: ['*.map']
        },
        authToken: env.SENTRY_AUTH_TOKEN || process.env.SENTRY_AUTH_TOKEN,
      })
    ],

    ssr: {
      noExternal: ['json-diff-kit']
    },

    build: {
      sourcemap: true
    },
  };
});