# Sepanta Industrial Group — Phase 1 Architecture Rules

These constraints are permanently locked for **Phase 1** (target production environment: 1 vCPU, 2GB RAM Linux VPS in Iran, zero backend API, zero GitHub dependency, zero runtime Node.js).

## 1. Root Domain Deployment
- Deploy strictly at the domain root (`/`).
- **NO** `basePath` and **NO** `assetPrefix` in `next.config.ts`.

## 2. Static Export Only
- `output: "export"`
- `trailingSlash: true`
- `images: { unoptimized: true }`
- No Server Actions, no Route Handlers requiring a Node.js runtime, and no dynamic SSR routes without `generateStaticParams`.

## 3. Zero External CDN Requests at Runtime
- **NO** Google Fonts CDN (`next/font/google` is forbidden).
- **NO** external script, stylesheet, font, or media CDNs at build or runtime.
- All fonts, icons, and media assets must be stored locally under `public/` or bundled statically.

## 4. Strict Persian RTL & Logical CSS
- Root document must enforce `<html lang="fa" dir="rtl">`.
- Use Tailwind CSS logical directional utilities exclusively (`ms-`, `me-`, `ps-`, `pe-`, `text-start`, `text-end`) instead of physical `ml-`, `mr-`, `pl-`, `pr-`, `text-left`, `text-right`.

## 5. Runtime Server Resource Budget
- Served exclusively by a minimal `nginx:1.27-alpine` static container.
- Container image size budget: **< 50MB**.
- Runtime RAM budget: **< 30MB** active memory usage.
- Concurrency: **`worker_processes 1;`** with pre-compressed `.gz` static assets (`gzip_static on;`).
