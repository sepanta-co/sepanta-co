import {
  FRAME_FINISHES,
  OPENING_LABELS,
  SYSTEM_RULES,
  type ConfiguratorSystemKey,
  type FrameFinishKey,
  type OpeningType,
} from "@/lib/configurator-rules";
import { toPersianDigits } from "@/lib/persian-seo";

export interface WindowSvgPreviewProps {
  system: ConfiguratorSystemKey;
  widthCm: number;
  heightCm: number;
  panelCount: number;
  openings: OpeningType[];
  finish: FrameFinishKey;
}

export function WindowSvgPreview({
  system,
  widthCm,
  heightCm,
  panelCount,
  openings,
  finish,
}: WindowSvgPreviewProps) {
  const rule = SYSTEM_RULES[system];
  const swatch = FRAME_FINISHES[finish];

  const safeW = Number.isFinite(widthCm) && widthCm > 0 ? widthCm : rule.defaultWidth;
  const safeH = Number.isFinite(heightCm) && heightCm > 0 ? heightCm : rule.defaultHeight;

  // Scale drawing proportionally inside a clean 280x190 CAD viewport box
  const maxBoxW = 280;
  const maxBoxH = 190;
  const ratio = safeW / safeH;

  let drawW = maxBoxW;
  let drawH = drawW / ratio;
  if (drawH > maxBoxH) {
    drawH = maxBoxH;
    drawW = drawH * ratio;
  }

  // Clamp minimum visible proportions for extreme aspect ratios
  drawW = Math.max(96, Math.min(maxBoxW, drawW));
  drawH = Math.max(74, Math.min(maxBoxH, drawH));

  const startX = 225 - drawW / 2;
  const startY = 165 - drawH / 2;
  const frameThickness = system === "balcony-glass" ? 6 : system === "pleated-mesh" ? 7 : 10;
  const innerX = startX + frameThickness;
  const innerY = startY + frameThickness;
  const innerW = drawW - frameThickness * 2;
  const innerH = drawH - frameThickness * 2;
  const panelW = innerW / Math.max(panelCount, 1);

  const strokeColor = swatch.isDark ? "#141413" : "#5C5852";
  const innerLineStroke = swatch.isDark ? "#9E978B" : "#5C5852";

  const activeOpeningSummary = openings
    .slice(0, panelCount)
    .map((op) => OPENING_LABELS[op])
    .join("، ");

  const ariaLabel = `پیش‌نمایش مهندسی ${rule.label} به ابعاد ${toPersianDigits(
    safeW
  )} در ${toPersianDigits(safeH)} سانتی‌متر با ${toPersianDigits(
    panelCount
  )} لنگه (${activeOpeningSummary}) و رنگ ${swatch.label}`;

  return (
    <div className="border border-border-strong bg-surface-warm p-4">
      <svg
        viewBox="0 0 420 320"
        role="img"
        aria-label={ariaLabel}
        className="mx-auto h-auto w-full max-w-[420px]"
      >
        <defs>
          <linearGradient id="sepanta-glass-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#EFECE6" stopOpacity="0.92" />
            <stop offset="55%" stopColor="#FAF9F6" stopOpacity="0.72" />
            <stop offset="100%" stopColor="#E4DFD4" stopOpacity="0.88" />
          </linearGradient>

          <pattern
            id="sepanta-mesh-pattern"
            width="6"
            height="6"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 6 0 L 0 0 0 6"
              fill="none"
              stroke="#5C5852"
              strokeWidth="0.65"
              strokeOpacity="0.45"
            />
          </pattern>

          <pattern
            id="sepanta-cad-grid"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 20 0 L 0 0 0 20"
              fill="none"
              stroke="#E6E2D8"
              strokeWidth="0.6"
              strokeOpacity="0.65"
            />
          </pattern>
        </defs>

        {/* Crisp Architectural CAD Background */}
        <rect x="0" y="0" width="420" height="320" fill="#FAF9F6" />
        <rect x="0" y="0" width="420" height="320" fill="url(#sepanta-cad-grid)" />

        {/* Top Width Dimension Line */}
        <g stroke="#5C5852" strokeWidth="1.25">
          <line x1={startX} y1={startY - 22} x2={startX + drawW} y2={startY - 22} />
          <line x1={startX} y1={startY - 28} x2={startX} y2={startY - 16} />
          <line x1={startX + drawW} y1={startY - 28} x2={startX + drawW} y2={startY - 16} />
        </g>
        <rect
          x={startX + drawW / 2 - 36}
          y={startY - 33}
          width="72"
          height="20"
          fill="#FFFFFF"
          stroke="#CEC8BA"
          strokeWidth="0.8"
        />
        <text
          x={startX + drawW / 2}
          y={startY - 19}
          textAnchor="middle"
          fill="#141413"
          fontSize="11"
          fontWeight="700"
        >
          {toPersianDigits(safeW)} cm
        </text>

        {/* Side Height Dimension Line */}
        <g stroke="#5C5852" strokeWidth="1.25">
          <line x1={startX - 24} y1={startY} x2={startX - 24} y2={startY + drawH} />
          <line x1={startX - 30} y1={startY} x2={startX - 18} y2={startY} />
          <line x1={startX - 30} y1={startY + drawH} x2={startX - 18} y2={startY + drawH} />
        </g>
        <g transform={`translate(${startX - 38}, ${startY + drawH / 2}) rotate(-90)`}>
          <rect
            x="-36"
            y="-10"
            width="72"
            height="20"
            fill="#FFFFFF"
            stroke="#CEC8BA"
            strokeWidth="0.8"
          />
          <text
            x="0"
            y="4"
            textAnchor="middle"
            fill="#141413"
            fontSize="11"
            fontWeight="700"
          >
            {toPersianDigits(safeH)} cm
          </text>
        </g>

        {/* Outer Frame */}
        <rect
          x={startX}
          y={startY}
          width={drawW}
          height={drawH}
          fill={swatch.hex}
          stroke={strokeColor}
          strokeWidth="1.75"
        />

        {/* Panels */}
        {Array.from({ length: panelCount }).map((_, idx) => {
          const px = innerX + idx * panelW;
          const py = innerY;
          const pw = panelW;
          const ph = innerH;
          const opening = openings[idx] ?? rule.defaultOpening;

          const pad = system === "balcony-glass" ? 2 : 4;
          const gx = px + pad;
          const gy = py + pad;
          const gw = Math.max(pw - pad * 2, 10);
          const gh = Math.max(ph - pad * 2, 10);

          return (
            <g key={idx}>
              {/* Sash Frame / Mullion */}
              <rect
                x={px}
                y={py}
                width={pw}
                height={ph}
                fill={system === "balcony-glass" ? "transparent" : swatch.hex}
                stroke={innerLineStroke}
                strokeWidth={system === "balcony-glass" ? "1" : "1.2"}
              />

              {/* Glazing or Mesh Fill */}
              <rect
                x={gx}
                y={gy}
                width={gw}
                height={gh}
                fill={
                  system === "pleated-mesh"
                    ? "url(#sepanta-mesh-pattern)"
                    : "url(#sepanta-glass-grad)"
                }
                stroke="#78716C"
                strokeWidth="0.85"
              />

              {/* Pleated Mesh Vertical Folds */}
              {system === "pleated-mesh" &&
                Array.from({ length: Math.max(4, Math.floor(gw / 14)) }).map(
                  (__, lineIdx) => {
                    const lx = gx + ((lineIdx + 1) * gw) / (Math.max(4, Math.floor(gw / 14)) + 1);
                    return (
                      <line
                        key={lineIdx}
                        x1={lx}
                        y1={gy}
                        x2={lx}
                        y2={gy + gh}
                        stroke="#5C5852"
                        strokeWidth="0.6"
                        strokeOpacity="0.45"
                      />
                    );
                  }
                )}

              {/* Architectural Opening Direction Symbols */}
              {opening === "fixed" && (
                <g stroke="#5C5852" strokeWidth="1" strokeOpacity="0.7">
                  <line
                    x1={gx + gw / 2 - 6}
                    y1={gy + gh / 2 - 6}
                    x2={gx + gw / 2 + 6}
                    y2={gy + gh / 2 + 6}
                  />
                  <line
                    x1={gx + gw / 2 + 6}
                    y1={gy + gh / 2 - 6}
                    x2={gx + gw / 2 - 6}
                    y2={gy + gh / 2 + 6}
                  />
                </g>
              )}

              {(opening === "casement" || opening === "tilt-turn") && (
                <path
                  d={`M ${gx} ${gy} L ${gx + gw} ${gy + gh / 2} L ${gx} ${gy + gh}`}
                  fill="none"
                  stroke="#141413"
                  strokeWidth="1.15"
                  strokeDasharray="5 4"
                  strokeOpacity="0.72"
                />
              )}

              {opening === "tilt-turn" && (
                <path
                  d={`M ${gx} ${gy + gh} L ${gx + gw / 2} ${gy} L ${gx + gw} ${gy + gh}`}
                  fill="none"
                  stroke="#9A6B3F"
                  strokeWidth="1.15"
                  strokeDasharray="4 4"
                  strokeOpacity="0.9"
                />
              )}

              {opening === "sliding" && (
                <g stroke="#141413" strokeWidth="1.4" strokeOpacity="0.8">
                  <line
                    x1={gx + gw * 0.25}
                    y1={gy + gh / 2}
                    x2={gx + gw * 0.75}
                    y2={gy + gh / 2}
                  />
                  <polyline
                    points={`${gx + gw * 0.62},${gy + gh / 2 - 5} ${gx + gw * 0.75},${gy + gh / 2} ${gx + gw * 0.62},${gy + gh / 2 + 5}`}
                    fill="none"
                  />
                </g>
              )}

              {opening === "folding" && (
                <g stroke="#141413" strokeWidth="1.1" strokeOpacity="0.72">
                  <polyline
                    points={`${gx + 4},${gy + gh * 0.35} ${gx + gw / 2},${gy + gh * 0.5} ${gx + gw - 4},${gy + gh * 0.35}`}
                    fill="none"
                    strokeDasharray="4 3"
                  />
                  <polyline
                    points={`${gx + 4},${gy + gh * 0.65} ${gx + gw / 2},${gy + gh * 0.5} ${gx + gw - 4},${gy + gh * 0.65}`}
                    fill="none"
                    strokeDasharray="4 3"
                  />
                </g>
              )}
            </g>
          );
        })}

        {/* Bottom Caption */}
        <text
          x="210"
          y="302"
          textAnchor="middle"
          fill="#5C5852"
          fontSize="10"
          fontWeight="600"
        >
          {rule.label} • {toPersianDigits(panelCount)} لنگه • {swatch.label}
        </text>
      </svg>
    </div>
  );
}
