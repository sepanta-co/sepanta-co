import React from "react";
import { toPersianDigits } from "@/lib/format";

export type SystemType = "upvc" | "thermal-break" | "balcony-glass" | "pleated-mesh";
export type OpeningType = "fixed" | "turn" | "tilt-turn" | "sliding" | "folding";
export type FrameColor = "white" | "anthracite" | "champagne" | "wood";

export interface WindowStudioProps {
  widthCm: number;
  heightCm: number;
  panes: number; // 1 to 6
  hasTransom: boolean;
  transomHeightCm: number;
  system: SystemType;
  openingType: OpeningType;
  frameColor: FrameColor;
}

const COLOR_MAP: Record<FrameColor, { fill: string; stroke: string; label: string }> = {
  white: { fill: "#F8FAFC", stroke: "#CBD5E1", label: "سفید استاندارد" },
  anthracite: { fill: "#1E242B", stroke: "#0F1216", label: "آنتراسیت مات" },
  champagne: { fill: "#B8A58D", stroke: "#8E7B65", label: "شامپاینی متالیک" },
  wood: { fill: "#6A3F1F", stroke: "#452610", label: "طرح چوب بلوطی" },
};

export function WindowStudioSVG({
  widthCm,
  heightCm,
  panes,
  hasTransom,
  transomHeightCm,
  system,
  openingType,
  frameColor,
}: WindowStudioProps) {
  // SVG Canvas dimensions with margins for architectural dimension lines
  const paddingX = 85;
  const paddingY = 60;
  const maxViewWidth = 800;
  const maxViewHeight = 520;

  const innerAreaWidth = maxViewWidth - paddingX * 2;
  const innerAreaHeight = maxViewHeight - paddingY * 2;

  const ratio = Math.max(0.4, Math.min(2.5, widthCm / heightCm));
  let frameWidth = innerAreaWidth;
  let frameHeight = frameWidth / ratio;

  if (frameHeight > innerAreaHeight) {
    frameHeight = innerAreaHeight;
    frameWidth = frameHeight * ratio;
  }

  const frameX = paddingX + (innerAreaWidth - frameWidth) / 2;
  const frameY = paddingY + (innerAreaHeight - frameHeight) / 2;

  const colorData = COLOR_MAP[frameColor] || COLOR_MAP.white;
  const isDarkFrame = frameColor === "anthracite" || frameColor === "wood";

  // Transom calculation
  const transomRatio = hasTransom ? Math.min(0.4, Math.max(0.15, transomHeightCm / heightCm)) : 0;
  const transomHeight = frameHeight * transomRatio;
  const mainHeight = frameHeight - transomHeight;
  const mainY = frameY + transomHeight;

  // Active panes calculation (clamped per system)
  const safePanes = Math.max(1, Math.min(6, panes));
  const paneWidth = frameWidth / safePanes;

  // Profile-specific styling
  const outerBorderWidth = system === "thermal-break" ? 14 : system === "balcony-glass" ? 10 : 16;
  const sashBorderWidth = 10;

  return (
    <div className="w-full flex flex-col items-center justify-center select-none">
      <svg
        viewBox={`0 0 ${maxViewWidth} ${maxViewHeight}`}
        className="w-full h-auto max-h-[460px]"
        aria-label="پیش‌نمایش ابعادی دهانه پنجره"
      >
        <defs>
          {/* 24px subtle CAD draft grid */}
          <pattern id="draftGrid" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#E4E4E7" strokeWidth="0.6" />
          </pattern>

          {/* Glass sheen gradient */}
          <linearGradient id="glassGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.45" />
            <stop offset="40%" stopColor="#bae6fd" stopOpacity="0.18" />
            <stop offset="42%" stopColor="#ffffff" stopOpacity="0.55" />
            <stop offset="48%" stopColor="#bae6fd" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#7dd3fc" stopOpacity="0.35" />
          </linearGradient>

          {/* Pleated mesh texture pattern */}
          <pattern id="meshGrid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 0 5 L 5 0 L 10 5 L 5 10 Z" fill="none" stroke="#64748B" strokeWidth="0.8" />
          </pattern>
        </defs>

        {/* CAD Drafting Grid Background */}
        <rect
          x="10"
          y="10"
          width={maxViewWidth - 20}
          height={maxViewHeight - 20}
          fill="url(#draftGrid)"
          opacity="0.75"
        />

        {/* Outer Frame Wall Niche Shadow */}
        <rect
          x={frameX - 4}
          y={frameY - 4}
          width={frameWidth + 8}
          height={frameHeight + 8}
          fill="#0B0E11"
          opacity="0.08"
        />

        {/* Main Outer Profile Frame */}
        <rect
          x={frameX}
          y={frameY}
          width={frameWidth}
          height={frameHeight}
          fill={colorData.fill}
          stroke={colorData.stroke}
          strokeWidth="2"
        />

        {/* System Accent: Thermal Break Polyamide Strip */}
        {system === "thermal-break" && (
          <rect
            x={frameX + 4}
            y={frameY + 4}
            width={frameWidth - 8}
            height={frameHeight - 8}
            fill="none"
            stroke="#0B0E11"
            strokeWidth="1.5"
            strokeDasharray="4 2"
            opacity="0.4"
          />
        )}

        {/* Transom if enabled */}
        {hasTransom && (
          <g id="transom-section">
            <rect
              x={frameX + outerBorderWidth}
              y={frameY + outerBorderWidth}
              width={frameWidth - outerBorderWidth * 2}
              height={transomHeight - outerBorderWidth}
              fill="url(#glassGradient)"
              stroke={colorData.stroke}
              strokeWidth="1.5"
            />
            {/* Horizontal transom divider bar */}
            <rect
              x={frameX}
              y={frameY + transomHeight - 4}
              width={frameWidth}
              height={outerBorderWidth}
              fill={colorData.fill}
              stroke={colorData.stroke}
              strokeWidth="1.5"
            />
          </g>
        )}

        {/* Sashes & Glass Panes */}
        {Array.from({ length: safePanes }).map((_, i) => {
          const pX = frameX + i * paneWidth;
          const pY = mainY;
          const pW = paneWidth;
          const pH = mainHeight;

          const isOperable =
            system === "balcony-glass" ||
            system === "pleated-mesh" ||
            (safePanes === 1
              ? openingType !== "fixed"
              : safePanes === 2
              ? i === 1 && openingType !== "fixed"
              : safePanes === 4
              ? (i === 1 || i === 2) && openingType !== "fixed"
              : i % 2 === 1 && openingType !== "fixed");

          const innerGlassX = pX + outerBorderWidth;
          const innerGlassY = pY + outerBorderWidth;
          const innerGlassW = Math.max(10, pW - outerBorderWidth * 2);
          const innerGlassH = Math.max(10, pH - outerBorderWidth * 2);

          return (
            <g key={i} id={`pane-${i}`}>
              {/* Vertical Mullion Divider between panes */}
              {i > 0 && system !== "balcony-glass" && (
                <rect
                  x={pX - outerBorderWidth / 2}
                  y={mainY}
                  width={outerBorderWidth}
                  height={pH}
                  fill={colorData.fill}
                  stroke={colorData.stroke}
                  strokeWidth="1.5"
                />
              )}

              {/* Balcony Glass Sleek Vertical Hairline Gap */}
              {i > 0 && system === "balcony-glass" && (
                <line
                  x1={pX}
                  y1={mainY + 8}
                  x2={pX}
                  y2={mainY + pH - 8}
                  stroke="#94A3B8"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />
              )}

              {/* Sash Profile if operable */}
              {isOperable && system !== "balcony-glass" && system !== "pleated-mesh" && (
                <rect
                  x={innerGlassX}
                  y={innerGlassY}
                  width={innerGlassW}
                  height={innerGlassH}
                  fill={colorData.fill}
                  stroke={colorData.stroke}
                  strokeWidth="1"
                />
              )}

              {/* Glass Area or Pleated Mesh */}
              <rect
                x={innerGlassX + (isOperable && system !== "balcony-glass" && system !== "pleated-mesh" ? sashBorderWidth : 0)}
                y={innerGlassY + (isOperable && system !== "balcony-glass" && system !== "pleated-mesh" ? sashBorderWidth : 0)}
                width={Math.max(4, innerGlassW - (isOperable && system !== "balcony-glass" && system !== "pleated-mesh" ? sashBorderWidth * 2 : 0))}
                height={Math.max(4, innerGlassH - (isOperable && system !== "balcony-glass" && system !== "pleated-mesh" ? sashBorderWidth * 2 : 0))}
                fill={system === "pleated-mesh" ? "url(#meshGrid)" : "url(#glassGradient)"}
                stroke="#94A3B8"
                strokeWidth="0.75"
              />

              {/* Balcony Glass Top/Bottom Aluminum Clamps */}
              {system === "balcony-glass" && (
                <>
                  <rect
                    x={pX + 2}
                    y={mainY}
                    width={pW - 4}
                    height={8}
                    fill="#334155"
                  />
                  <rect
                    x={pX + 2}
                    y={mainY + pH - 8}
                    width={pW - 4}
                    height={8}
                    fill="#334155"
                  />
                </>
              )}

              {/* Pleated Mesh Pull Bar */}
              {system === "pleated-mesh" && (
                <rect
                  x={pX + pW - 8}
                  y={mainY + 2}
                  width={6}
                  height={pH - 4}
                  fill="#0B0E11"
                />
              )}

              {/* DIN 1356 Dashed Opening Direction Symbols */}
              {isOperable && system !== "balcony-glass" && system !== "pleated-mesh" && (
                <g id={`opening-symbol-${i}`}>
                  {/* Single Turn (Side Hung) */}
                  {openingType === "turn" && (
                    <path
                      d={`M ${innerGlassX + 8} ${innerGlassY + 8} L ${innerGlassX + innerGlassW - 8} ${innerGlassY + innerGlassH / 2} L ${innerGlassX + 8} ${innerGlassY + innerGlassH - 8}`}
                      fill="none"
                      stroke="#C27803"
                      strokeWidth="1.75"
                      strokeDasharray="4 3"
                    />
                  )}

                  {/* Tilt & Turn (Dual action DIN 1356 lines) */}
                  {openingType === "tilt-turn" && (
                    <>
                      <path
                        d={`M ${innerGlassX + 8} ${innerGlassY + 8} L ${innerGlassX + innerGlassW - 8} ${innerGlassY + innerGlassH / 2} L ${innerGlassX + 8} ${innerGlassY + innerGlassH - 8}`}
                        fill="none"
                        stroke="#C27803"
                        strokeWidth="1.75"
                        strokeDasharray="4 3"
                      />
                      <path
                        d={`M ${innerGlassX + 8} ${innerGlassY + innerGlassH - 8} L ${innerGlassX + innerGlassW / 2} ${innerGlassY + 8} L ${innerGlassX + innerGlassW - 8} ${innerGlassY + innerGlassH - 8}`}
                        fill="none"
                        stroke="#0D9488"
                        strokeWidth="1.75"
                        strokeDasharray="3 3"
                      />
                    </>
                  )}

                  {/* Sliding Horizontal Double Arrows */}
                  {openingType === "sliding" && (
                    <g transform={`translate(${innerGlassX + innerGlassW / 2 - 18}, ${innerGlassY + innerGlassH / 2 - 7})`}>
                      <rect width="36" height="14" fill="#0B0E11" rx="2" opacity="0.85" />
                      <path d="M 6 7 L 30 7 M 11 4 L 6 7 L 11 10 M 25 4 L 30 7 L 25 10" stroke="#FFFFFF" strokeWidth="1.5" fill="none" />
                    </g>
                  )}

                  {/* Folding Accordion Symbol */}
                  {openingType === "folding" && (
                    <g transform={`translate(${innerGlassX + innerGlassW / 2 - 20}, ${innerGlassY + innerGlassH / 2 - 8})`}>
                      <rect width="40" height="16" fill="#0B0E11" rx="2" opacity="0.85" />
                      <path d="M 6 12 L 13 4 L 20 12 L 27 4 L 34 12" stroke="#C27803" strokeWidth="1.75" fill="none" />
                    </g>
                  )}

                  {/* Symmetric Handles for 2 or 4 Panes */}
                  {openingType !== "sliding" && openingType !== "folding" && (
                    <g
                      transform={`translate(${
                        (safePanes === 2 && i === 1) || (safePanes === 4 && i === 2)
                          ? innerGlassX + sashBorderWidth - 6
                          : innerGlassX + innerGlassW - sashBorderWidth + 2
                      }, ${innerGlassY + innerGlassH / 2 - 14})`}
                    >
                      <rect
                        width="4"
                        height="28"
                        fill={isDarkFrame ? "#E2E8F0" : "#1E293B"}
                        rx="1"
                      />
                      <rect
                        x="-6"
                        y="7"
                        width="8"
                        height="4"
                        fill={isDarkFrame ? "#E2E8F0" : "#1E293B"}
                        rx="1"
                      />
                    </g>
                  )}
                </g>
              )}
            </g>
          );
        })}

        {/* Architectural Dimension Lines: Width (Bottom) */}
        <g id="dimension-width">
          <line
            x1={frameX}
            y1={frameY + frameHeight + 22}
            x2={frameX + frameWidth}
            y2={frameY + frameHeight + 22}
            stroke="#52525B"
            strokeWidth="1.2"
          />
          <line
            x1={frameX}
            y1={frameY + frameHeight + 16}
            x2={frameX}
            y2={frameY + frameHeight + 28}
            stroke="#52525B"
            strokeWidth="1.5"
          />
          <line
            x1={frameX + frameWidth}
            y1={frameY + frameHeight + 16}
            x2={frameX + frameWidth}
            y2={frameY + frameHeight + 28}
            stroke="#52525B"
            strokeWidth="1.5"
          />
          {/* Width Label Backing & Text */}
          <rect
            x={frameX + frameWidth / 2 - 45}
            y={frameY + frameHeight + 13}
            width="90"
            height="18"
            fill="#FAFAFA"
            stroke="#E4E4E7"
            strokeWidth="0.5"
          />
          <text
            x={frameX + frameWidth / 2}
            y={frameY + frameHeight + 26}
            fill="#09090B"
            fontSize="11"
            fontWeight="bold"
            textAnchor="middle"
            fontFamily="var(--font-estedad), sans-serif"
          >
            {toPersianDigits(widthCm)} سانتیمتر
          </text>
        </g>

        {/* Architectural Dimension Lines: Height (Left) */}
        <g id="dimension-height">
          <line
            x1={frameX - 25}
            y1={frameY}
            x2={frameX - 25}
            y2={frameY + frameHeight}
            stroke="#52525B"
            strokeWidth="1.2"
          />
          <line
            x1={frameX - 31}
            y1={frameY}
            x2={frameX - 19}
            y2={frameY}
            stroke="#52525B"
            strokeWidth="1.5"
          />
          <line
            x1={frameX - 31}
            y1={frameY + frameHeight}
            x2={frameX - 19}
            y2={frameY + frameHeight}
            stroke="#52525B"
            strokeWidth="1.5"
          />
          {/* Height Label Backing & Text */}
          <rect
            x={frameX - 70}
            y={frameY + frameHeight / 2 - 9}
            width="90"
            height="18"
            fill="#FAFAFA"
            stroke="#E4E4E7"
            strokeWidth="0.5"
          />
          <text
            x={frameX - 25}
            y={frameY + frameHeight / 2 + 4}
            fill="#09090B"
            fontSize="11"
            fontWeight="bold"
            textAnchor="middle"
            fontFamily="var(--font-estedad), sans-serif"
          >
            {toPersianDigits(heightCm)} سانتیمتر
          </text>
        </g>
      </svg>
    </div>
  );
}
