"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { FaqItem } from "@/data/types";
import { toPersianDigits } from "@/lib/persian-seo";

export interface FaqAccordionProps {
  items: FaqItem[];
}

export function FaqAccordion({ items }: FaqAccordionProps) {
  const baseId = useId();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="divide-y divide-border border border-border bg-surface">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        const buttonId = `${baseId}-btn-${index}`;
        const panelId = `${baseId}-panel-${index}`;

        return (
          <div key={item.question}>
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-start text-sm font-bold text-charcoal transition-colors hover:bg-surface-warm/45 sm:px-6 sm:py-5 sm:text-base"
              >
                <span className="flex items-start gap-3">
                  <span className="font-display tabular-nums mt-0.5 text-xs font-bold text-bronze">
                    {toPersianDigits(index + 1).padStart(2, "۰")}
                  </span>
                  <span>{item.question}</span>
                </span>
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-ink-muted transition-transform duration-200 ${
                    isOpen ? "rotate-180 text-charcoal" : ""
                  }`}
                  strokeWidth={1.6}
                  aria-hidden="true"
                />
              </button>
            </h3>

            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              hidden={!isOpen}
              className="border-t border-border/70 bg-canvas/70 px-5 py-4 text-sm leading-7 text-ink-muted sm:px-6 sm:py-5"
            >
              {item.answer}
            </div>
          </div>
        );
      })}
    </div>
  );
}
