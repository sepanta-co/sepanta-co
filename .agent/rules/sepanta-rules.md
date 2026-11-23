# Antigravity Workspace Rules — Sepanta Industrial Group

1. **Source of Truth:** Before writing or modifying any component, read `docs/BRAND_BRIEF.md`, `docs/DESIGN_SYSTEM.md`, and `docs/ARCHITECTURE.md`. Never contradict them.
2. **Persian RTL Excellence:**
  - All user-facing copy must be natural, technical Persian with proper half-spaces (ZWNJ, e.g., «دوجداره»، «می‌شود»، «پنجره‌های»، «عایق‌بندی»).
  - Always normalize Arabic `ي`/`ك` to Persian `ی`/`ک`.
  - Use Tailwind logical properties (`ms-`, `me-`, `ps-`, `pe-`, `text-start`, `start-`, `end-`) instead of `ml-`/`mr-`/`pl-`/`pr-`/`text-left`/`text-right`.
  - Format UI numbers in Persian digits with `tabular-nums`, while keeping code, URLs, and math calculations in ASCII digits.
3. **Anti-AI-Slop Visual Standard:**
  - Follow the exact architectural palette in `docs/DESIGN_SYSTEM.md` (`#FBF9F5`, `#1E3A5F`, `#0F172A`, `#D97706`, `#0F766E`).
  - Strictly forbidden: purple/violet gradients, neon glows, cluttered badges, fake 5-star reviews, or placeholder "Lorem Ipsum" text.
4. **GitHub Pages Static Export Compatibility (`sepanta-co`):**
  - Never use Next.js server-only features (`cookies()`, `headers()`, API routes, or SSR dynamic routes without `generateStaticParams`).
  - Always route local public assets through `assetPath()` from `@/lib/assets`.
  - Use standard `next/link` for internal routing so `basePath` is handled automatically.
5. **Mobile-First Verification:**
  - Every section must render cleanly at `375px` width with zero horizontal overflow (`overflow-x-clip`).
  - Keep interactive touch targets at least `44px` high.
6. **Code Hygiene:**
  - Strict TypeScript (`no any`). Keep data modular in `src/data/` so client photos and real project records can be swapped in minutes.
  - Always verify `npm run build` succeeds cleanly with static export before marking a sprint complete.
