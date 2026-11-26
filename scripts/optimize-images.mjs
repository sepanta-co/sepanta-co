import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT_DIR = process.cwd();
const RAW_DIR = path.join(ROOT_DIR, "assets-raw");
const OUT_DIR = path.join(ROOT_DIR, "public", "images", "optimized");
const MANIFEST_PATH = path.join(ROOT_DIR, "src", "data", "image-manifest.ts");

const VALID_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

/** @type {readonly { key: string; label: string; code: string }[]} */
const IMAGE_REGISTRY = [
  // Hero & factory / renovation
  { key: "hero-architecture", label: "ARCHITECTURAL FACADE", code: "SP-01" },
  { key: "factory-line", label: "ZANJAN PRODUCTION LINE", code: "SP-02" },
  { key: "renovation-before", label: "PRE-RETROFIT OPENING", code: "SP-03" },
  { key: "renovation-after", label: "POST-RETROFIT UPVC", code: "SP-04" },

  // 7 product lines
  { key: "product-upvc-window", label: "UPVC MULTI-CHAMBER", code: "PR-01" },
  { key: "product-thermal-break-window", label: "ALUMINUM THERMAL BREAK", code: "PR-02" },
  { key: "product-balcony-glass", label: "FOLDING BALCONY GLASS", code: "PR-03" },
  { key: "product-pleated-mesh", label: "PLEATED INSECT SCREEN", code: "PR-04" },
  { key: "product-security-door", label: "REINFORCED SECURITY DOOR", code: "PR-05" },
  { key: "product-wooden-door", label: "INTERIOR WOODEN DOOR", code: "PR-06" },
  { key: "product-metal-frame", label: "STEEL DOOR FRAME", code: "PR-07" },

  // 6 projects
  { key: "project-zanjan-enghelab", label: "ZANJAN ENGHELAB", code: "PJ-01" },
  { key: "project-zanjan-golshahr", label: "ZANJAN GOLSHAHR", code: "PJ-02" },
  { key: "project-tehran-saadatabad", label: "TEHRAN SAADATABAD", code: "PJ-03" },
  { key: "project-karaj-mehrshahr", label: "KARAJ MEHRSHAHR", code: "PJ-04" },
  { key: "project-qazvin-minoodar", label: "QAZVIN MINOODAR", code: "PJ-05" },
  { key: "project-tabriz-elgoli", label: "TABRIZ ELGOLI", code: "PJ-06" },
];

/**
 * Recursively collects all valid raw image files inside assets-raw/.
 * @param {string} dir
 * @returns {Map<string, string>}
 */
function indexRawAssets(dir) {
  const map = new Map();
  if (!fs.existsSync(dir)) return map;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      for (const [k, v] of indexRawAssets(fullPath)) {
        if (!map.has(k)) map.set(k, v);
      }
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (VALID_EXTENSIONS.has(ext)) {
        const stem = path.basename(entry.name, ext).toLowerCase();
        if (!map.has(stem)) {
          map.set(stem, fullPath);
        }
      }
    }
  }
  return map;
}

/**
 * Generates a clean monochrome architectural blueprint SVG (1280x800) with no external fonts.
 * @param {string} key
 * @param {string} label
 * @param {string} code
 */
function buildBlueprintSvg(key, label, code) {
  const gridLines = [];
  for (let x = 80; x < 1280; x += 80) {
    gridLines.push(
      `<line x1="${x}" y1="0" x2="${x}" y2="800" stroke="#CBD5E1" stroke-width="${
        x % 320 === 0 ? "1.2" : "0.6"
      }" stroke-opacity="${x % 320 === 0 ? "0.9" : "0.55"}" />`
    );
  }
  for (let y = 80; y < 800; y += 80) {
    gridLines.push(
      `<line x1="0" y1="${y}" x2="1280" y2="${y}" stroke="#CBD5E1" stroke-width="${
        y % 320 === 0 ? "1.2" : "0.6"
      }" stroke-opacity="${y % 320 === 0 ? "0.9" : "0.55"}" />`
    );
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="800" viewBox="0 0 1280 800">
  <rect width="1280" height="800" fill="#F1F5F9" />
  ${gridLines.join("\n  ")}

  <!-- Outer architectural drafting border -->
  <rect x="48" y="48" width="1184" height="704" fill="none" stroke="#0F172A" stroke-width="1.5" stroke-opacity="0.3" />
  <rect x="64" y="64" width="1152" height="672" fill="none" stroke="#0F172A" stroke-width="0.75" stroke-opacity="0.18" />

  <!-- Architectural elevation frame diagram -->
  <rect x="340" y="170" width="600" height="440" fill="#FFFFFF" fill-opacity="0.55" stroke="#0F172A" stroke-width="2.5" stroke-opacity="0.75" />
  <rect x="364" y="194" width="552" height="392" fill="none" stroke="#0F172A" stroke-width="1.25" stroke-opacity="0.55" />
  <line x1="640" y1="194" x2="640" y2="586" stroke="#0F172A" stroke-width="1.75" stroke-opacity="0.65" />
  <line x1="364" y1="390" x2="916" y2="390" stroke="#0F172A" stroke-width="1.25" stroke-opacity="0.45" />
  <line x1="364" y1="194" x2="640" y2="390" stroke="#0F172A" stroke-width="0.9" stroke-dasharray="6 6" stroke-opacity="0.35" />
  <line x1="640" y1="194" x2="364" y2="390" stroke="#0F172A" stroke-width="0.9" stroke-dasharray="6 6" stroke-opacity="0.35" />

  <!-- Dimension lines -->
  <line x1="340" y1="138" x2="940" y2="138" stroke="#B45309" stroke-width="1.5" />
  <line x1="340" y1="126" x2="340" y2="150" stroke="#B45309" stroke-width="1.5" />
  <line x1="940" y1="126" x2="940" y2="150" stroke="#B45309" stroke-width="1.5" />

  <line x1="304" y1="170" x2="304" y2="610" stroke="#B45309" stroke-width="1.5" />
  <line x1="292" y1="170" x2="316" y2="170" stroke="#B45309" stroke-width="1.5" />
  <line x1="292" y1="610" x2="316" y2="610" stroke="#B45309" stroke-width="1.5" />

  <!-- Precision corner crosshairs & bronze marker -->
  <rect x="64" y="64" width="12" height="12" fill="#B45309" />
  <rect x="1204" y="724" width="12" height="12" fill="#0F172A" fill-opacity="0.65" />

  <!-- Minimal technical metadata block (sans-serif fallback safe) -->
  <rect x="84" y="660" width="380" height="54" fill="#FFFFFF" fill-opacity="0.88" stroke="#0F172A" stroke-width="1" stroke-opacity="0.25" />
  <text x="102" y="684" font-family="DejaVu Sans, Arial, sans-serif" font-size="14" font-weight="700" fill="#0F172A" letter-spacing="1">${code} // ${label}</text>
  <text x="102" y="703" font-family="DejaVu Sans, Arial, sans-serif" font-size="11" fill="#475569">${key} • SEPANTA ARCHITECTURAL BLUEPRINT</text>
</svg>`;
}

async function processEntry(entry, rawMap) {
  const rawPath = rawMap.get(entry.key.toLowerCase());
  const isPlaceholder = !rawPath;

  const baseImage = isPlaceholder
    ? sharp(Buffer.from(buildBlueprintSvg(entry.key, entry.label, entry.code)))
    : sharp(rawPath).rotate();

  const widths = [640, 1280];
  let intrinsicWidth = 1280;
  let intrinsicHeight = 800;

  for (const targetWidth of widths) {
    const pipeline = baseImage
      .clone()
      .resize({
        width: targetWidth,
        withoutEnlargement: true,
        fit: "inside",
      });

    const avifOut = path.join(OUT_DIR, `${entry.key}-${targetWidth}.avif`);
    const webpOut = path.join(OUT_DIR, `${entry.key}-${targetWidth}.webp`);

    const webpInfo = await pipeline
      .clone()
      .webp({ quality: 78 })
      .toFile(webpOut);

    await pipeline
      .clone()
      .avif({ quality: 52, effort: 4 })
      .toFile(avifOut);

    if (targetWidth === 1280) {
      intrinsicWidth = webpInfo.width;
      intrinsicHeight = webpInfo.height;
    }
  }

  return {
    key: entry.key,
    src: `/images/optimized/${entry.key}-1280.webp`,
    avifSrcSet: `/images/optimized/${entry.key}-640.avif 640w, /images/optimized/${entry.key}-1280.avif 1280w`,
    webpSrcSet: `/images/optimized/${entry.key}-640.webp 640w, /images/optimized/${entry.key}-1280.webp 1280w`,
    width: intrinsicWidth,
    height: intrinsicHeight,
    isPlaceholder,
  };
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.mkdirSync(path.dirname(MANIFEST_PATH), { recursive: true });

  const rawMap = indexRawAssets(RAW_DIR);
  const results = [];

  for (const entry of IMAGE_REGISTRY) {
    const item = await processEntry(entry, rawMap);
    results.push(item);
  }

  const manifestEntries = results
    .map(
      (item) => `  "${item.key}": {
    src: "${item.src}",
    avifSrcSet: "${item.avifSrcSet}",
    webpSrcSet: "${item.webpSrcSet}",
    width: ${item.width},
    height: ${item.height},
    isPlaceholder: ${item.isPlaceholder},
  }`
    )
    .join(",\n");

  const fileContent = `// Auto-generated by scripts/optimize-images.mjs — DO NOT EDIT MANUALLY
import type { ImageKey } from "./types";

export interface ImageManifestEntry {
  src: string;
  avifSrcSet: string;
  webpSrcSet: string;
  width: number;
  height: number;
  isPlaceholder: boolean;
}

export const IMAGE_MANIFEST: Record<ImageKey, ImageManifestEntry> = {
${manifestEntries}
};
`;

  fs.writeFileSync(MANIFEST_PATH, fileContent, "utf8");

  const realCount = results.filter((r) => !r.isPlaceholder).length;
  const placeholderCount = results.length - realCount;
  console.log(
    `Optimized ${results.length} image keys (${realCount} raw photos, ${placeholderCount} architectural placeholders) -> public/images/optimized/ & src/data/image-manifest.ts`
  );
}

main().catch((err) => {
  console.error("Image optimization failed:", err);
  process.exit(1);
});
