import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT_DIR = process.cwd();
const RAW_DIR = path.join(ROOT_DIR, "assets-raw");
const OUT_DIR = path.join(ROOT_DIR, "public", "images", "optimized");
const MANIFEST_PATH = path.join(ROOT_DIR, "src", "data", "image-manifest.ts");

const VALID_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

/** @type {readonly { key: string }[]} */
const IMAGE_REGISTRY = [
  // Hero & factory / renovation
  { key: "hero-architecture" },
  { key: "factory-line" },
  { key: "renovation-before" },
  { key: "renovation-after" },

  // 7 product lines
  { key: "product-upvc-window" },
  { key: "product-thermal-break-window" },
  { key: "product-balcony-glass" },
  { key: "product-pleated-mesh" },
  { key: "product-security-door" },
  { key: "product-wooden-door" },
  { key: "product-metal-frame" },

  // 6 projects
  { key: "project-zanjan-enghelab" },
  { key: "project-zanjan-golshahr" },
  { key: "project-tehran-saadatabad" },
  { key: "project-karaj-mehrshahr" },
  { key: "project-qazvin-minoodar" },
  { key: "project-tabriz-elgoli" },
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

const SHARED_DEFS = `
  <defs>
    <linearGradient id="bg-charcoal" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#141413" />
      <stop offset="55%" stop-color="#1E1D1B" />
      <stop offset="100%" stop-color="#292622" />
    </linearGradient>
    <linearGradient id="bg-limestone" x1="0" y1="0" x2="0.8" y2="1">
      <stop offset="0%" stop-color="#EAE5DC" />
      <stop offset="60%" stop-color="#DDD6C9" />
      <stop offset="100%" stop-color="#CEC6B6" />
    </linearGradient>
    <linearGradient id="bg-stone-dark" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#262421" />
      <stop offset="100%" stop-color="#171614" />
    </linearGradient>
    <linearGradient id="glass-warm" x1="0.1" y1="0" x2="0.9" y2="1">
      <stop offset="0%" stop-color="#FAF6EE" stop-opacity="0.88" />
      <stop offset="45%" stop-color="#E7DFD1" stop-opacity="0.65" />
      <stop offset="100%" stop-color="#A89F91" stop-opacity="0.72" />
    </linearGradient>
    <linearGradient id="glass-bronze" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#F2E4D0" stop-opacity="0.55" />
      <stop offset="50%" stop-color="#9A6B3F" stop-opacity="0.32" />
      <stop offset="100%" stop-color="#1C1B19" stop-opacity="0.78" />
    </linearGradient>
    <linearGradient id="glass-twilight" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#3E3A34" />
      <stop offset="55%" stop-color="#8C7B65" />
      <stop offset="100%" stop-color="#DFC9A8" />
    </linearGradient>
    <linearGradient id="sunlight-shaft" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FAF9F6" stop-opacity="0.32" />
      <stop offset="60%" stop-color="#E6D5BE" stop-opacity="0.12" />
      <stop offset="100%" stop-color="#FAF9F6" stop-opacity="0" />
    </linearGradient>
    <linearGradient id="walnut-grain" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#4A3222" />
      <stop offset="50%" stop-color="#5E402C" />
      <stop offset="100%" stop-color="#3B271A" />
    </linearGradient>
    <linearGradient id="floor-warm" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#2E2B26" />
      <stop offset="100%" stop-color="#141413" />
    </linearGradient>
    <pattern id="pleat-grid" width="12" height="800" patternUnits="userSpaceOnUse">
      <rect width="6" height="800" fill="#2A2825" fill-opacity="0.45" />
      <rect x="6" width="6" height="800" fill="#181715" fill-opacity="0.65" />
    </pattern>
  </defs>
`;

/**
 * Generates an atmospheric, text-free architectural elevation SVG (1280x800).
 * @param {string} key
 */
function buildArchitecturalSvg(key) {
  let scene = "";

  switch (key) {
    case "hero-architecture":
      scene = `
        <rect width="1280" height="800" fill="url(#bg-charcoal)" />
        <!-- Architectural interior limestone side reveals -->
        <rect x="0" y="0" width="130" height="800" fill="#2A2723" />
        <rect x="1150" y="0" width="130" height="800" fill="#23211E" />
        <rect x="0" y="660" width="1280" height="140" fill="url(#floor-warm)" />
        <!-- Panoramic glazing bay -->
        <rect x="130" y="60" width="1020" height="600" fill="url(#glass-twilight)" />
        <!-- Warm sunlit horizon & daylight shafts -->
        <polygon points="160,60 680,60 980,660 320,660" fill="url(#sunlight-shaft)" />
        <polygon points="480,660 880,660 1120,800 180,800" fill="#FAF9F6" fill-opacity="0.06" />
        <!-- Slimline anodized charcoal mullions -->
        <rect x="130" y="60" width="1020" height="16" fill="#141413" />
        <rect x="130" y="644" width="1020" height="16" fill="#141413" />
        <rect x="130" y="60" width="18" height="600" fill="#141413" />
        <rect x="462" y="60" width="16" height="600" fill="#141413" />
        <rect x="802" y="60" width="16" height="600" fill="#141413" />
        <rect x="1132" y="60" width="18" height="600" fill="#141413" />
        <!-- Horizontal transom & brushed bronze architectural inlay -->
        <rect x="130" y="210" width="1020" height="10" fill="#141413" />
        <rect x="148" y="642" width="984" height="3" fill="#9A6B3F" fill-opacity="0.85" />
        <rect x="478" y="220" width="2" height="424" fill="#9A6B3F" fill-opacity="0.6" />
        <rect x="800" y="220" width="2" height="424" fill="#9A6B3F" fill-opacity="0.6" />
      `;
      break;

    case "factory-line":
      scene = `
        <rect width="1280" height="800" fill="url(#bg-charcoal)" />
        <!-- Perspective industrial bays -->
        <polygon points="0,0 320,160 320,640 0,800" fill="#201E1C" />
        <polygon points="1280,0 960,160 960,640 1280,800" fill="#201E1C" />
        <rect x="320" y="160" width="640" height="480" fill="#181715" />
        <!-- Overhead warm linear lighting -->
        <rect x="260" y="72" width="760" height="6" fill="#FAF9F6" fill-opacity="0.7" />
        <rect x="360" y="132" width="560" height="4" fill="#E6D5BE" fill-opacity="0.55" />
        <rect x="440" y="180" width="400" height="3" fill="#9A6B3F" fill-opacity="0.8" />
        <!-- Precision CNC worktable & stacked anodized profiles -->
        <polygon points="180,680 390,500 890,500 1100,680" fill="#2B2824" />
        <polygon points="180,680 1100,680 1100,715 180,715" fill="#141413" />
        <rect x="410" y="340" width="460" height="160" fill="url(#glass-bronze)" stroke="#9A6B3F" stroke-width="2" />
        <line x1="640" y1="340" x2="640" y2="500" stroke="#141413" stroke-width="10" />
        <line x1="210" y1="545" x2="1070" y2="545" stroke="#9A6B3F" stroke-width="2" stroke-opacity="0.7" />
      `;
      break;

    case "renovation-before":
      scene = `
        <rect width="1280" height="800" fill="#C7C1B6" />
        <!-- Weathered masonry reveal -->
        <rect x="200" y="90" width="880" height="620" fill="#9C9589" />
        <rect x="230" y="120" width="820" height="560" fill="#6B6760" />
        <!-- Older thick steel casement grid -->
        <rect x="255" y="145" width="770" height="510" fill="#464542" />
        <rect x="275" y="165" width="230" height="225" fill="#8E8B82" />
        <rect x="525" y="165" width="230" height="225" fill="#827F77" />
        <rect x="775" y="165" width="230" height="225" fill="#8B8880" />
        <rect x="275" y="410" width="230" height="225" fill="#7D7A72" />
        <rect x="525" y="410" width="230" height="225" fill="#89867E" />
        <rect x="775" y="410" width="230" height="225" fill="#78756E" />
        <!-- Aged hairline marks -->
        <line x1="255" y1="400" x2="1025" y2="400" stroke="#363431" stroke-width="6" />
      `;
      break;

    case "renovation-after":
      scene = `
        <rect width="1280" height="800" fill="url(#bg-limestone)" />
        <!-- Crisp sunlit interior wall & deep shadow reveal -->
        <rect x="200" y="90" width="880" height="620" fill="#FAF9F6" />
        <rect x="218" y="108" width="844" height="584" fill="#E6E2D8" />
        <!-- Sleek modern dual-sash uPVC frame -->
        <rect x="234" y="124" width="812" height="552" fill="#FFFFFF" stroke="#CEC8BA" stroke-width="2" />
        <rect x="266" y="156" width="362" height="488" fill="url(#glass-warm)" stroke="#D6D1C6" stroke-width="2" />
        <rect x="652" y="156" width="362" height="488" fill="url(#glass-warm)" stroke="#D6D1C6" stroke-width="2" />
        <polygon points="266,156 540,156 410,644 266,644" fill="url(#sunlight-shaft)" />
        <!-- Bronze tilt-turn handle accents -->
        <rect x="614" y="370" width="8" height="46" rx="2" fill="#9A6B3F" />
        <rect x="658" y="370" width="8" height="46" rx="2" fill="#9A6B3F" />
      `;
      break;

    case "product-upvc-window":
      scene = `
        <rect width="1280" height="800" fill="url(#bg-limestone)" />
        <!-- Deep plaster reveal -->
        <polygon points="220,80 1060,80 1020,120 260,120" fill="#CFC8B9" />
        <polygon points="220,80 260,120 260,680 220,720" fill="#BEB7A7" />
        <rect x="260" y="120" width="760" height="560" fill="#FAF9F6" stroke="#CEC8BA" stroke-width="2" />
        <!-- Dual-sash multi-chamber elevation -->
        <rect x="292" y="152" width="336" height="496" fill="#FFFFFF" stroke="#E0DBD0" stroke-width="2" />
        <rect x="652" y="152" width="336" height="496" fill="#FFFFFF" stroke="#E0DBD0" stroke-width="2" />
        <rect x="314" y="174" width="292" height="452" fill="url(#glass-twilight)" />
        <rect x="674" y="174" width="292" height="452" fill="url(#glass-twilight)" />
        <polygon points="314,174 520,174 390,626 314,626" fill="url(#sunlight-shaft)" />
        <polygon points="674,174 880,174 750,626 674,626" fill="url(#sunlight-shaft)" />
        <!-- Brushed bronze handle -->
        <rect x="636" y="375" width="8" height="52" rx="2" fill="#9A6B3F" />
      `;
      break;

    case "product-thermal-break-window":
      scene = `
        <rect width="1280" height="800" fill="url(#bg-stone-dark)" />
        <!-- Architectural dark anodized aluminum elevation -->
        <rect x="180" y="70" width="920" height="660" fill="#141413" />
        <rect x="200" y="90" width="280" height="620" fill="url(#glass-bronze)" />
        <rect x="494" y="90" width="292" height="620" fill="url(#glass-bronze)" />
        <rect x="800" y="90" width="280" height="620" fill="url(#glass-bronze)" />
        <!-- Horizontal architectural transom -->
        <rect x="180" y="260" width="920" height="12" fill="#141413" />
        <polygon points="200,90 640,90 380,710 200,710" fill="url(#sunlight-shaft)" />
        <!-- Subtle bronze thermal-break line -->
        <rect x="200" y="258" width="880" height="2" fill="#9A6B3F" fill-opacity="0.75" />
        <rect x="486" y="272" width="2" height="438" fill="#9A6B3F" fill-opacity="0.5" />
      `;
      break;

    case "product-balcony-glass":
      scene = `
        <rect width="1280" height="800" fill="url(#bg-limestone)" />
        <!-- Horizon sky & terrace floor -->
        <rect x="90" y="70" width="1100" height="520" fill="url(#glass-twilight)" />
        <rect x="0" y="590" width="1280" height="210" fill="#D5CEC0" />
        <!-- Top & bottom slim anodized tracks -->
        <rect x="90" y="70" width="1100" height="18" fill="#141413" />
        <rect x="90" y="574" width="1100" height="18" fill="#141413" />
        <!-- Frameless folding glass panels -->
        <rect x="100" y="88" width="210" height="486" fill="url(#glass-warm)" fill-opacity="0.55" stroke="#FAF9F6" stroke-opacity="0.5" stroke-width="1.5" />
        <rect x="316" y="88" width="210" height="486" fill="url(#glass-warm)" fill-opacity="0.45" stroke="#FAF9F6" stroke-opacity="0.5" stroke-width="1.5" />
        <rect x="532" y="88" width="210" height="486" fill="url(#glass-warm)" fill-opacity="0.55" stroke="#FAF9F6" stroke-opacity="0.5" stroke-width="1.5" />
        <rect x="748" y="88" width="210" height="486" fill="url(#glass-warm)" fill-opacity="0.4" stroke="#FAF9F6" stroke-opacity="0.5" stroke-width="1.5" />
        <rect x="964" y="88" width="216" height="486" fill="url(#glass-warm)" fill-opacity="0.5" stroke="#FAF9F6" stroke-opacity="0.5" stroke-width="1.5" />
        <rect x="90" y="572" width="1100" height="3" fill="#9A6B3F" />
      `;
      break;

    case "product-pleated-mesh":
      scene = `
        <rect width="1280" height="800" fill="url(#bg-limestone)" />
        <rect x="240" y="100" width="800" height="600" fill="#141413" />
        <!-- Daylight backing -->
        <rect x="268" y="128" width="744" height="544" fill="url(#glass-warm)" />
        <!-- Half-retracted pleated screen -->
        <rect x="268" y="128" width="520" height="544" fill="url(#pleat-grid)" />
        <rect x="782" y="128" width="14" height="544" fill="#262523" />
        <rect x="787" y="360" width="4" height="80" fill="#9A6B3F" />
      `;
      break;

    case "product-security-door":
      scene = `
        <rect width="1280" height="800" fill="url(#bg-stone-dark)" />
        <!-- Limestone architectural portal -->
        <rect x="340" y="50" width="600" height="750" fill="#2E2B26" />
        <!-- Matte charcoal steel outer frame -->
        <rect x="380" y="80" width="520" height="720" fill="#141413" />
        <!-- Walnut vertical architectural door leaf -->
        <rect x="408" y="108" width="464" height="692" fill="url(#walnut-grain)" />
        <!-- Vertical architectural grooves -->
        <line x1="485" y1="108" x2="485" y2="800" stroke="#2B1B10" stroke-width="3" />
        <line x1="562" y1="108" x2="562" y2="800" stroke="#2B1B10" stroke-width="3" />
        <line x1="640" y1="108" x2="640" y2="800" stroke="#2B1B10" stroke-width="3" />
        <line x1="718" y1="108" x2="718" y2="800" stroke="#2B1B10" stroke-width="3" />
        <line x1="795" y1="108" x2="795" y2="800" stroke="#2B1B10" stroke-width="3" />
        <!-- Brushed bronze tall pull handle -->
        <rect x="442" y="210" width="12" height="420" rx="2" fill="#9A6B3F" />
      `;
      break;

    case "product-wooden-door":
      scene = `
        <rect width="1280" height="800" fill="url(#bg-limestone)" />
        <rect x="0" y="690" width="1280" height="110" fill="#CEC6B6" />
        <!-- Flush architectural doorway with shadow gap -->
        <rect x="420" y="80" width="440" height="610" fill="#1C1B19" />
        <rect x="430" y="90" width="420" height="600" fill="url(#walnut-grain)" />
        <!-- Subtle horizontal inlay lines -->
        <line x1="430" y1="250" x2="850" y2="250" stroke="#9A6B3F" stroke-width="1.5" stroke-opacity="0.65" />
        <line x1="430" y1="530" x2="850" y2="530" stroke="#9A6B3F" stroke-width="1.5" stroke-opacity="0.65" />
        <!-- Minimalist bronze lever -->
        <rect x="462" y="385" width="44" height="8" rx="2" fill="#9A6B3F" />
      `;
      break;

    case "product-metal-frame":
      scene = `
        <rect width="1280" height="800" fill="url(#bg-limestone)" />
        <rect x="0" y="690" width="1280" height="110" fill="#D5CEC0" />
        <!-- Heavy-gauge folded steel doorway frame -->
        <rect x="380" y="90" width="520" height="600" fill="#141413" />
        <rect x="412" y="122" width="456" height="568" fill="#262523" />
        <rect x="432" y="142" width="416" height="548" fill="url(#glass-warm)" fill-opacity="0.25" />
        <!-- Precision mitered steel frame profile lines -->
        <line x1="380" y1="90" x2="432" y2="142" stroke="#5C5852" stroke-width="1.5" />
        <line x1="900" y1="90" x2="848" y2="142" stroke="#5C5852" stroke-width="1.5" />
        <!-- Bronze strike plate detail -->
        <rect x="418" y="370" width="10" height="44" fill="#9A6B3F" />
      `;
      break;

    case "project-zanjan-enghelab":
      scene = `
        <rect width="1280" height="800" fill="url(#bg-stone-dark)" />
        <rect x="140" y="0" width="1000" height="800" fill="#D8D1C4" />
        <!-- Rhythmic limestone residential facade bays -->
        <rect x="200" y="60" width="240" height="310" fill="#141413" />
        <rect x="520" y="60" width="240" height="310" fill="#141413" />
        <rect x="840" y="60" width="240" height="310" fill="#141413" />
        <rect x="200" y="430" width="240" height="310" fill="#141413" />
        <rect x="520" y="430" width="240" height="310" fill="#141413" />
        <rect x="840" y="430" width="240" height="310" fill="#141413" />
        ${[200, 520, 840]
          .map(
            (x) => `
          <rect x="${x + 14}" y="74" width="212" height="282" fill="url(#glass-twilight)" />
          <rect x="${x + 14}" y="444" width="212" height="282" fill="url(#glass-twilight)" />
          <line x1="${x + 120}" y1="74" x2="${x + 120}" y2="356" stroke="#141413" stroke-width="8" />
          <line x1="${x + 120}" y1="444" x2="${x + 120}" y2="726" stroke="#141413" stroke-width="8" />
        `
          )
          .join("")}
        <rect x="140" y="396" width="1000" height="4" fill="#9A6B3F" fill-opacity="0.7" />
      `;
      break;

    case "project-zanjan-golshahr":
      scene = `
        <rect width="1280" height="800" fill="url(#bg-charcoal)" />
        <!-- Cantilevered modern villa volume -->
        <rect x="120" y="130" width="1040" height="30" fill="#DFD9CD" />
        <rect x="140" y="160" width="1000" height="440" fill="url(#glass-bronze)" />
        <rect x="120" y="600" width="1040" height="42" fill="#CEC6B6" />
        <rect x="0" y="642" width="1280" height="158" fill="#1E1C1A" />
        <!-- Minimal vertical mullions -->
        <rect x="140" y="160" width="16" height="440" fill="#141413" />
        <rect x="470" y="160" width="12" height="440" fill="#141413" />
        <rect x="800" y="160" width="12" height="440" fill="#141413" />
        <rect x="1124" y="160" width="16" height="440" fill="#141413" />
        <polygon points="156,160 660,160 440,600 156,600" fill="url(#sunlight-shaft)" />
        <rect x="140" y="596" width="1000" height="4" fill="#9A6B3F" />
      `;
      break;

    case "project-tehran-saadatabad":
      scene = `
        <rect width="1280" height="800" fill="url(#bg-limestone)" />
        <!-- Urban apartment facade -->
        <rect x="180" y="80" width="920" height="640" fill="#F4F1EA" stroke="#CEC6B6" stroke-width="2" />
        <rect x="240" y="140" width="370" height="520" fill="#1C1B19" />
        <rect x="670" y="140" width="370" height="520" fill="#1C1B19" />
        <rect x="256" y="156" width="338" height="488" fill="url(#glass-twilight)" />
        <rect x="686" y="156" width="338" height="488" fill="url(#glass-twilight)" />
        <line x1="256" y1="320" x2="594" y2="320" stroke="#1C1B19" stroke-width="10" />
        <line x1="686" y1="320" x2="1024" y2="320" stroke="#1C1B19" stroke-width="10" />
        <rect x="240" y="660" width="800" height="4" fill="#9A6B3F" />
      `;
      break;

    case "project-karaj-mehrshahr":
      scene = `
        <rect width="1280" height="800" fill="url(#bg-charcoal)" />
        <!-- Garden terrace sliding glass pavilion -->
        <rect x="80" y="110" width="1120" height="500" fill="url(#glass-twilight)" />
        <rect x="0" y="610" width="1280" height="190" fill="#CEC6B6" />
        <rect x="80" y="110" width="1120" height="22" fill="#141413" />
        <rect x="80" y="592" width="1120" height="18" fill="#141413" />
        <rect x="355" y="132" width="14" height="460" fill="#141413" />
        <rect x="633" y="132" width="14" height="460" fill="#141413" />
        <rect x="911" y="132" width="14" height="460" fill="#141413" />
        <polygon points="369,132 760,132 580,592 369,592" fill="url(#sunlight-shaft)" />
        <rect x="80" y="590" width="1120" height="3" fill="#9A6B3F" />
      `;
      break;

    case "project-qazvin-minoodar":
      scene = `
        <rect width="1280" height="800" fill="url(#bg-stone-dark)" />
        <!-- Commercial office curtain wall -->
        <rect x="100" y="60" width="1080" height="680" fill="#141413" />
        ${[0, 1, 2, 3, 4]
          .map((col) => {
            const x = 120 + col * 212;
            return `
              <rect x="${x}" y="80" width="192" height="290" fill="url(#glass-bronze)" />
              <rect x="${x}" y="390" width="192" height="330" fill="url(#glass-bronze)" />
            `;
          })
          .join("")}
        <rect x="100" y="376" width="1080" height="6" fill="#9A6B3F" fill-opacity="0.85" />
      `;
      break;

    case "project-tabriz-elgoli":
    default:
      scene = `
        <rect width="1280" height="800" fill="url(#bg-limestone)" />
        <!-- Hillside complex stepped facade -->
        <rect x="80" y="120" width="540" height="680" fill="#D5CEC0" />
        <rect x="620" y="60" width="580" height="740" fill="#C7BFA9" />
        <rect x="140" y="180" width="190" height="480" fill="#141413" />
        <rect x="370" y="180" width="190" height="480" fill="#141413" />
        <rect x="690" y="120" width="210" height="540" fill="#141413" />
        <rect x="940" y="120" width="210" height="540" fill="#141413" />
        <rect x="154" y="194" width="162" height="452" fill="url(#glass-twilight)" />
        <rect x="384" y="194" width="162" height="452" fill="url(#glass-twilight)" />
        <rect x="704" y="134" width="182" height="512" fill="url(#glass-twilight)" />
        <rect x="954" y="134" width="182" height="512" fill="url(#glass-twilight)" />
        <rect x="80" y="658" width="1120" height="4" fill="#9A6B3F" fill-opacity="0.8" />
      `;
      break;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="800" viewBox="0 0 1280 800">
  ${SHARED_DEFS}
  ${scene}
</svg>`;
}

async function processEntry(entry, rawMap) {
  const rawPath = rawMap.get(entry.key.toLowerCase());
  const isPlaceholder = !rawPath;

  const baseImage = isPlaceholder
    ? sharp(Buffer.from(buildArchitecturalSvg(entry.key)))
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
      .webp({ quality: 82 })
      .toFile(webpOut);

    await pipeline
      .clone()
      .avif({ quality: 56, effort: 4 })
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
    `Optimized ${results.length} image keys (${realCount} raw photos, ${placeholderCount} architectural studio placeholders) -> public/images/optimized/ & src/data/image-manifest.ts`
  );
}

main().catch((err) => {
  console.error("Image optimization failed:", err);
  process.exit(1);
});
