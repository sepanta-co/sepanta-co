import fs from "node:fs";
import path from "node:path";

const ROOT_DIR = process.cwd();
const OUT_DIR = path.join(ROOT_DIR, "out");

const EXPECTED_CANONICAL_URLS = [
  "https://sepanta-co.ir/",
  "https://sepanta-co.ir/products/",
  "https://sepanta-co.ir/configurator/",
  "https://sepanta-co.ir/projects/",
  "https://sepanta-co.ir/about/",
  "https://sepanta-co.ir/products/upvc-window/",
  "https://sepanta-co.ir/products/thermal-break-window/",
  "https://sepanta-co.ir/products/balcony-glass/",
  "https://sepanta-co.ir/products/pleated-mesh/",
  "https://sepanta-co.ir/products/security-door/",
  "https://sepanta-co.ir/products/wooden-door/",
  "https://sepanta-co.ir/products/metal-frame/",
  "https://sepanta-co.ir/projects/zanjan-enghelab-residential/",
  "https://sepanta-co.ir/projects/zanjan-golshahr-villa/",
  "https://sepanta-co.ir/projects/tehran-saadatabad-retrofit/",
  "https://sepanta-co.ir/projects/karaj-mehrshahr-garden/",
  "https://sepanta-co.ir/projects/qazvin-minoodar-office/",
  "https://sepanta-co.ir/projects/tabriz-elgoli-complex/",
];

const EXTERNAL_CDN_PATTERNS = [
  "fonts.googleapis.com",
  "fonts.gstatic.com",
  "cdn.jsdelivr",
];

function walkHtmlFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkHtmlFiles(full));
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      results.push(full);
    }
  }
  return results.sort();
}

function isErrorTemplate(relPath) {
  return (
    relPath === "404.html" ||
    relPath === path.join("404", "index.html") ||
    relPath === path.join("_not-found", "index.html")
  );
}

function resolveInternalHref(href) {
  const stripped = href.split("#")[0].split("?")[0];
  if (!stripped || stripped === "/") {
    return path.join(OUT_DIR, "index.html");
  }
  const cleanRel = stripped.replace(/^\/+/, "");
  const asDirectFile = path.join(OUT_DIR, cleanRel);
  if (fs.existsSync(asDirectFile) && fs.statSync(asDirectFile).isFile()) {
    return asDirectFile;
  }
  return path.join(OUT_DIR, cleanRel, "index.html");
}

function main() {
  const errors = [];

  if (!fs.existsSync(OUT_DIR)) {
    console.error("Missing out/ directory. Run npm run build first.");
    process.exit(1);
  }

  // 1. Verify sitemap.xml and robots.txt
  const sitemapPath = path.join(OUT_DIR, "sitemap.xml");
  const robotsPath = path.join(OUT_DIR, "robots.txt");

  if (!fs.existsSync(sitemapPath)) {
    errors.push("Missing out/sitemap.xml");
  } else {
    const sitemapXml = fs.readFileSync(sitemapPath, "utf8");
    for (const url of EXPECTED_CANONICAL_URLS) {
      if (!sitemapXml.includes(`<loc>${url}</loc>`)) {
        errors.push(`sitemap.xml missing canonical URL: ${url}`);
      }
    }
    if (sitemapXml.includes("/404")) {
      errors.push("sitemap.xml must NOT contain /404");
    }
  }

  if (!fs.existsSync(robotsPath)) {
    errors.push("Missing out/robots.txt");
  }

  // 2. Audit every HTML file in out/
  const htmlFiles = walkHtmlFiles(OUT_DIR);
  if (htmlFiles.length === 0) {
    errors.push("No HTML files found in out/");
  }

  let jsonLdBlocksChecked = 0;
  let internalLinksChecked = 0;

  for (const filePath of htmlFiles) {
    const relPath = path.relative(OUT_DIR, filePath);
    const html = fs.readFileSync(filePath, "utf8");

    // Check <html lang="fa" dir="rtl">
    const htmlTagMatch = html.match(/<html\b[^>]*>/i);
    if (
      !htmlTagMatch ||
      !/\blang="fa"/i.test(htmlTagMatch[0]) ||
      !/\bdir="rtl"/i.test(htmlTagMatch[0])
    ) {
      errors.push(`${relPath}: missing <html lang="fa" dir="rtl">`);
    }

    // Check non-empty <title>
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (!titleMatch || !titleMatch[1].trim()) {
      errors.push(`${relPath}: missing or empty <title>`);
    }

    // Check <meta name="description">
    const descMatch = html.match(
      /<meta\b[^>]*name="description"[^>]*content="([^"]+)"/i
    );
    if (!descMatch || !descMatch[1].trim()) {
      errors.push(`${relPath}: missing or empty <meta name="description">`);
    }

    // Check canonical on indexable pages
    if (!isErrorTemplate(relPath)) {
      if (!/<link\b[^>]*rel="canonical"[^>]*href="https:\/\/sepanta-co\.ir\/[^"]*"/i.test(html)) {
        errors.push(`${relPath}: missing <link rel="canonical">`);
      }
    }

    // Check <h1> count === 1
    const h1Matches = html.match(/<h1\b/gi) || [];
    if (h1Matches.length !== 1) {
      errors.push(`${relPath}: expected exactly 1 <h1>, found ${h1Matches.length}`);
    }

    // Parse all JSON-LD blocks
    const jsonLdRegex =
      /<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
    let jsonMatch;
    while ((jsonMatch = jsonLdRegex.exec(html)) !== null) {
      jsonLdBlocksChecked += 1;
      try {
        JSON.parse(jsonMatch[1]);
      } catch (err) {
        errors.push(`${relPath}: invalid JSON-LD block (${err.message})`);
      }
    }

    // Check zero external CDNs
    for (const cdn of EXTERNAL_CDN_PATTERNS) {
      if (html.includes(cdn)) {
        errors.push(`${relPath}: contains external CDN reference (${cdn})`);
      }
    }

    // Check zero Arabic characters (ي \u064A, ك \u0643, ة \u0629)
    if (/[\u064A\u0643\u0629]/.test(html)) {
      errors.push(`${relPath}: contains Arabic character (ي / ك / ة)`);
    }

    // Verify all internal <a href="/..."> links resolve on disk
    const hrefRegex = /<a\b[^>]*\bhref="(\/[^"]*)"/gi;
    let hrefMatch;
    while ((hrefMatch = hrefRegex.exec(html)) !== null) {
      const href = hrefMatch[1];
      if (href.startsWith("//")) continue;
      internalLinksChecked += 1;
      const targetFile = resolveInternalHref(href);
      if (!fs.existsSync(targetFile)) {
        errors.push(
          `${relPath}: broken internal link "${href}" (expected ${path.relative(
            ROOT_DIR,
            targetFile
          )})`
        );
      }
    }
  }

  if (errors.length > 0) {
    console.error("PHASE_1_AUDIT_FAILED:");
    for (const err of errors) {
      console.error(` - ${err}`);
    }
    process.exit(1);
  }

  console.log("PHASE_1_AUDIT_PASSED", {
    htmlFilesAudited: htmlFiles.length,
    canonicalSitemapUrls: EXPECTED_CANONICAL_URLS.length,
    jsonLdBlocksParsed: jsonLdBlocksChecked,
    internalLinksVerified: internalLinksChecked,
  });
}

main();
