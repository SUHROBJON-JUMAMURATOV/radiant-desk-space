import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Render kabi tashqi hosting'da env vars o'rnatilmagan bo'lsa ham ishlashi uchun fallback.
// Anon (publishable) kalit ommaviy — RLS tomonidan himoyalangan, xavfsiz.
const SUPABASE_URL_FALLBACK = "https://eyttbyuxyznakvixxcyq.supabase.co";
const SUPABASE_KEY_FALLBACK =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5dHRieXV4eXpuYWt2aXh4Y3lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1Njc1MjEsImV4cCI6MjA5MzE0MzUyMX0.zZBAAKWVQ649CDIimmdh883sb9tcHXJ-BiNEjJpUkAA";
const SUPABASE_PROJECT_ID_FALLBACK = "eyttbyuxyznakvixxcyq";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
  define: {
    "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(
      process.env.VITE_SUPABASE_URL || SUPABASE_URL_FALLBACK
    ),
    "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(
      process.env.VITE_SUPABASE_PUBLISHABLE_KEY || SUPABASE_KEY_FALLBACK
    ),
    "import.meta.env.VITE_SUPABASE_PROJECT_ID": JSON.stringify(
      process.env.VITE_SUPABASE_PROJECT_ID || SUPABASE_PROJECT_ID_FALLBACK
    ),
  },
}));
