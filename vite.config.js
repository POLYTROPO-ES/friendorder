import { defineConfig } from 'vite';

const PERMISSIONS_POLICY = 'browsing-topics=(), join-ad-interest-group=(), run-ad-auction=()';

export default defineConfig({
  server: {
    port: 5173,
    open: false,
    headers: {
      'Permissions-Policy': PERMISSIONS_POLICY,
    },
  },
  preview: {
    headers: {
      'Permissions-Policy': PERMISSIONS_POLICY,
    },
  },
});
