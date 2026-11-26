import { PRODUCTS } from "@/data/products";
import type { FaqItem } from "@/data/types";
import { buildCanonicalUrl, toLatinDigits } from "./persian-seo";
import { SITE_CONFIG } from "./site-config";

export const ORGANIZATION_ID = `${SITE_CONFIG.siteUrl}/#organization`;
export const WEBSITE_ID = `${SITE_CONFIG.siteUrl}/#website`;

export function buildOrganizationSchema(): Record<string, unknown> {
  return {
    "@type": ["Organization", "Manufacturer"],
    "@id": ORGANIZATION_ID,
    name: SITE_CONFIG.name,
    url: buildCanonicalUrl("/"),
    description: SITE_CONFIG.tagline,
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE_CONFIG.contact.factoryAddress,
      addressLocality: "زنجان",
      addressRegion: "زنجان",
      addressCountry: "IR",
    },
    areaServed: {
      "@type": "Country",
      name: "Iran",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: toLatinDigits(SITE_CONFIG.contact.phoneHref.replace("tel:", "")),
      contactType: "sales",
      areaServed: "IR",
      availableLanguage: "Persian",
    },
    knowsAbout: PRODUCTS.map((product) => product.name),
  };
}

export function buildWebSiteSchema(): Record<string, unknown> {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: buildCanonicalUrl("/"),
    name: SITE_CONFIG.name,
    inLanguage: "fa-IR",
    publisher: {
      "@id": ORGANIZATION_ID,
    },
  };
}

export interface SchemaBreadcrumbItem {
  name: string;
  pathname: string;
}

export function buildBreadcrumbSchema(
  items: SchemaBreadcrumbItem[]
): Record<string, unknown> {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: buildCanonicalUrl(item.pathname),
    })),
  };
}

export function buildFaqSchema(faqs: FaqItem[]): Record<string, unknown> {
  return {
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function persianYearToIsoDate(yearStr: string): string {
  const latinYear = Number(toLatinDigits(yearStr));
  if (Number.isFinite(latinYear) && latinYear >= 1390 && latinYear <= 1450) {
    const gregorianYear = latinYear + 621;
    return `${gregorianYear}-06-01`;
  }
  return "2025-06-01";
}
