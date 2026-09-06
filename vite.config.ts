// The @lovable.dev/vite-tanstack-config package is a convenience wrapper that bundles all
// required Vite plugins in the correct order — do NOT add them manually or duplicates will break:
//   - TanStack devtools (dev-only), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only, cloudflare-module preset by default), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, and SSR error logger plugins.
// Additional Vite config can be passed via defineConfig({ vite: { ... }, etc... }).
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
