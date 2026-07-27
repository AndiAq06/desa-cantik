// eslint-env node
import { defineConfig, loadEnv } from "vite";
import process from "process";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  // Accept either a comma-separated list of hosts or a single frontend URL
  const rawHosts = (
    env.VITE_PREVIEW_ALLOWED_HOSTS ||
    env.VITE_FRONTEND_BASE_URL ||
    ""
  )
    .split(",")
    .map((h) => h.trim())
    .filter(Boolean);

  const normalizeHost = (value) => {
    const v = value.replace(/^\s*["']|["']\s*$/g, "");
    try {
      const u = new URL(v);
      return u.hostname;
    } catch {
      return v.replace(/^https?:\/\//, "").replace(/\/$/, "");
    }
  };

  const parsedHosts = rawHosts.map(normalizeHost).filter(Boolean);
  const allowedHosts = Array.from(
    new Set(["localhost", "127.0.0.1", ...parsedHosts])
  );

  return {
    plugins: [react(), tsconfigPaths()],

    server: {
      proxy: (() => {
        // Allow overriding the dev proxy target via env var
        // Example: VITE_API_PROXY_TARGET=https://costally-guidebookish-germaine.ngrok-free.dev
        const proxyTarget =
          env.VITE_API_PROXY_TARGET || "http://localhost:8000";
        return {
          "/api": {
            target: proxyTarget,
            changeOrigin: true,
            ws: true,
            // If proxy target is https, and you get self-signed or invalid certs during dev,
            // you can override with VITE_API_PROXY_SECURE=false in your .env to set secure=false.
            secure:
              typeof env.VITE_API_PROXY_SECURE !== "undefined"
                ? String(env.VITE_API_PROXY_SECURE).toLowerCase() !== "false"
                : proxyTarget.startsWith("https://"),
            rewrite: (path) => path.replace(/^\/api/, ""),
          },
        };
      })(),
    },

    preview: {
      allowedHosts,
    },

    resolve: {
      alias: {
        "@": path.resolve(process.cwd(), "./src"),
      },
    },

    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) return "vendor";
          },
        },
      },
    },
  };
});
