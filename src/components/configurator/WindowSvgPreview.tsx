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

  const safeW =
    Number.isFinite(widthCm) && widthCm > 0 ? widthCm : rule.defaultWidth;
  const safeH =
    Number.isFinite(heightCm) && heightCm > 0 ? heightCm : rule.defaultHeight;

  // Scale drawing proportionally inside a clean architectural CAD viewport
  const maxBoxW = 264;
  const maxBoxH = 180;
  const ratio = safeW / safeH;

  let drawW = maxBoxW;
  let drawH = drawW / ratio;
  if (drawH > maxBoxH) {
    drawH = maxBoxH;
    drawW = drawH * ratio;
  }

  // Clamp minimum visible proportions for extreme aspect ratios
  drawW = Math.max(96, Math.min(maxBoxW, drawW));
  drawH = Math.max(76, Math.min(maxBoxH, drawH));

  const startX = 242 - drawW / 2;
  const startY = 158 - drawH / 2;
  const frameThickness =
    system === "balcony-glass" ? 6 : system === "pleated-mesh" ? 7 : 10;
  const innerX = startX + frameThickness;
  const innerY = startY + frameThickness;
  const innerW = drawW - frameThickness * 2;
  const innerH = drawH - frameThickness * 2;
  const panelW = innerW / Math.max(panelCount, 1);

  const strokeColor = swatch.isDark ? "#141413" : "#4A4640";
  const innerLineStroke = swatch.isDark ? "#9E978B" : "#6A655D";
  const bevelStroke = swatch.isDark ? "#45423E" : "#D6D1C7";
  const handleFill = swatch.isDark ? "#D6C2A5" : "#262523";
  const handleStroke = swatch.isDark ? "#141413" : "#141413";

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
    <div className="w-full">
      <svg
        viewBox="0 0 430 296"
        role="img"
        aria-label={ariaLabel}
        className="mx-auto h-auto w-full max-w-[430px] select-none"
      >
        <defs>
          <linearGradient id="sepanta-sky-glass" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#E6EFEF" stopOpacity="0.94" />
            <stop offset="50%" stopColor="#F9FBFA" stopOpacity="0.86" />
            <stop offset="100%" stopColor="#DCE6E4" stopOpacity="0.92" />
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
        </defs>

        {/* Top Width Architectural Dimension Line with 45-deg Ticks */}
        <g stroke="#78716C" strokeWidth="1">
          <line
            x1={startX}
            y1={startY - 6}
            x2={startX}
            y2={startY - 30}
            strokeOpacity="0.55"
          />
          <line
            x1={startX + drawW}
            y1={startY - 6}
            x2={startX + drawW}
            y2={startY - 30}
            strokeOpacity="0.55"
          />
          <line
            x1={startX - 5}
            y1={startY - 22}
            x2={startX + drawW + 5}
            y2={startY - 22}
            stroke="#5C5852"
            strokeWidth="1.2"
          />
          {/* Architectural slash tick marks */}
          <line
            x1={startX - 4}
            y1={startY - 18}
            x2={startX + 4}
            y2={startY - 26}
            stroke="#141413"
            strokeWidth="1.3"
          />
          <line
            x1={startX + drawW - 4}
            y1={startY - 18}
            x2={startX + drawW + 4}
            y2={startY - 26}
            stroke="#141413"
            strokeWidth="1.3"
          />
        </g>

        <rect
          x={startX + drawW / 2 - 52}
          y={startY - 34}
          width="104"
          height="22"
          rx="2"
          fill="#FFFFFF"
          stroke="#CEC8BA"
          strokeWidth="0.9"
        />
        <text
          x={startX + drawW / 2}
          y={startY - 19}
          textAnchor="middle"
          fill="#141413"
          fontSize="11"
          fontWeight="700"
          style={{ fontFamily: "var(--font-display), var(--font-body), sans-serif" }}
        >
          {toPersianDigits(safeW)} سانتی‌متر
        </text>

        {/* Side Height Architectural Dimension Line with 45-deg Ticks */}
        <g stroke="#78716C" strokeWidth="1">
          <line
            x1={startX - 6}
            y1={startY}
            x2={startX - 32}
            y2={startY}
            strokeOpacity="0.55"
          />
          <line
            x1={startX - 6}
            y1={startY + drawH}
            x2={startX - 32}
            y2={startY + drawH}
            strokeOpacity="0.55"
          />
          <line
            x1={startX - 24}
            y1={startY - 5}
            x2={startX - 24}
            y2={startY + drawH + 5}
            stroke="#5C5852"
            strokeWidth="1.2"
          />
          <line
            x1={startX - 28}
            y1={startY + 4}
            x2={startX - 20}
            y2={startY - 4}
            stroke="#141413"
            strokeWidth="1.3"
          />
          <line
            x1={startX - 28}
            y1={startY + drawH + 4}
            x2={startX - 20}
            y2={startY + drawH - 4}
            stroke="#141413"
            strokeWidth="1.3"
          />
        </g>

        <g transform={`translate(${startX - 42}, ${startY + drawH / 2}) rotate(-90)`}>
          <rect
            x="-52"
            y="-11"
            width="104"
            height="22"
            rx="2"
            fill="#FFFFFF"
            stroke="#CEC8BA"
            strokeWidth="0.9"
          />
          <text
            x="0"
            y="4"
            textAnchor="middle"
            fill="#141413"
            fontSize="11"
            fontWeight="700"
            style={{ fontFamily: "var(--font-display), var(--font-body), sans-serif" }}
          >
            {toPersianDigits(safeH)} سانتی‌متر
          </text>
        </g>

        {/* Subtle Architectural Elevation Drop Shadow */}
        <rect
          x={startX + 4}
          y={startY + 5}
          width={drawW}
          height={drawH}
          rx="1"
          fill="#141413"
          fillOpacity="0.06"
        />

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

        {/* Outer Frame Depth Bevel & Mitered Corner Joints */}
        {system !== "balcony-glass" && (
          <g stroke={bevelStroke} strokeWidth="0.8" fill="none">
            <rect
              x={startX + 2.5}
              y={startY + 2.5}
              width={Math.max(drawW - 5, 4)}
              height={Math.max(drawH - 5, 4)}
              strokeOpacity="0.85"
            />
            <line
              x1={startX}
              y1={startY}
              x2={innerX}
              y2={innerY}
              stroke={innerLineStroke}
              strokeWidth="0.7"
              strokeOpacity="0.65"
            />
            <line
              x1={startX + drawW}
              y1={startY}
              x2={innerX + innerW}
              y2={innerY}
              stroke={innerLineStroke}
              strokeWidth="0.7"
              strokeOpacity="0.65"
            />
            <line
              x1={startX}
              y1={startY + drawH}
              x2={innerX}
              y2={innerY + innerH}
              stroke={innerLineStroke}
              strokeWidth="0.7"
              strokeOpacity="0.65"
            />
            <line
              x1={startX + drawW}
              y1={startY + drawH}
              x2={innerX + innerW}
              y2={innerY + innerH}
              stroke={innerLineStroke}
              strokeWidth="0.7"
              strokeOpacity="0.65"
            />
          </g>
        )}

        {/* Panels */}
        {Array.from({ length: panelCount }).map((_, idx) => {
          const px = innerX + idx * panelW;
          const py = innerY;
          const pw = panelW;
          const ph = innerH;
          const opening = openings[idx] ?? rule.defaultOpening;

          const pad = system === "balcony-glass" ? 2 : 4.5;
          const gx = px + pad;
          const gy = py + pad;
          const gw = Math.max(pw - pad * 2, 10);
          const gh = Math.max(ph - pad * 2, 10);

          const isHinged = opening === "casement" || opening === "tilt-turn";
          const isSliding = opening === "sliding";
          const handleY = gy + gh * 0.5;
          const handleX = px + pw - Math.max(pad * 0.65, 2.5);

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
                    : "url(#sepanta-sky-glass)"
                }
                stroke="#78716C"
                strokeWidth="0.85"
              />

              {/* Subtle Daylight Glass Reflection Lines */}
              {system !== "pleated-mesh" && gw > 22 && gh > 24 && (
                <g stroke="#FFFFFF" strokeOpacity="0.65" strokeLinecap="round">
                  <line
                    x1={gx + gw * 0.16}
                    y1={gy + gh * 0.34}
                    x2={gx + gw * 0.36}
                    y2={gy + gh * 0.14}
                    strokeWidth="2"
                  />
                  <line
                    x1={gx + gw * 0.22}
                    y1={gy + gh * 0.42}
                    x2={gx + gw * 0.34}
                    y2={gy + gh * 0.3}
                    strokeWidth="1.2"
                  />
                </g>
              )}

              {/* Pleated Mesh Vertical Folds */}
              {system === "pleated-mesh" &&
                Array.from({ length: Math.max(4, Math.floor(gw / 14)) }).map(
                  (__, lineIdx) => {
                    const lx =
                      gx +
                      ((lineIdx + 1) * gw) /
                        (Math.max(4, Math.floor(gw / 14)) + 1);
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
                <g stroke="#5C5852" strokeWidth="1" strokeOpacity="0.65">
                  <line
                    x1={gx + gw / 2 - 5}
                    y1={gy + gh / 2 - 5}
                    x2={gx + gw / 2 + 5}
                    y2={gy + gh / 2 + 5}
                  />
                  <line
                    x1={gx + gw / 2 + 5}
                    y1={gy + gh / 2 - 5}
                    x2={gx + gw / 2 - 5}
                    y2={gy + gh / 2 + 5}
                  />
                </g>
              )}

              {isHinged && (
                <path
                  d={`M ${gx} ${gy} L ${gx + gw} ${gy + gh / 2} L ${gx} ${gy + gh}`}
                  fill="none"
                  stroke="#141413"
                  strokeWidth="1.1"
                  strokeDasharray="5 4"
                  strokeOpacity="0.68"
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

              {isSliding && (
                <g stroke="#141413" strokeWidth="1.3" strokeOpacity="0.78">
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

              {/* Slim Realistic Architectural Handle / Lever Indicator on Operable Sashes */}
              {isHinged && system !== "balcony-glass" && (
                <g>
                  <rect
                    x={handleX - 1.6}
                    y={handleY - 5}
                    width="3.2"
                    height="10"
                    rx="1"
                    fill={handleFill}
                    stroke={handleStroke}
                    strokeWidth="0.45"
                  />
                  <rect
                    x={handleX - 1.1}
                    y={handleY + 1}
                    width="2.2"
                    height="11"
                    rx="1"
                    fill={handleFill}
                    stroke={handleStroke}
                    strokeWidth="0.4"
                  />
                </g>
              )}

              {isSliding && system !== "pleated-mesh" && system !== "balcony-glass" && (
                <rect
                  x={handleX - 1.5}
                  y={handleY - 8}
                  width="3"
                  height="16"
                  rx="1"
                  fill={handleFill}
                  stroke={handleStroke}
                  strokeWidth="0.45"
                />
              )}
            </g>
          );
        })}
      </svg>

      <p className="mt-1 text-center text-xs font-medium text-[#5C5852]">
        {rule.label} · {toPersianDigits(panelCount)} لنگه · {swatch.label}
      </p>
    </div>
  );
}
