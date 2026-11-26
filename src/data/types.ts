export type ImageKey =
  | "hero-architecture"
  | "factory-line"
  | "renovation-before"
  | "renovation-after"
  | "product-upvc-window"
  | "product-thermal-break-window"
  | "product-balcony-glass"
  | "product-pleated-mesh"
  | "product-security-door"
  | "product-wooden-door"
  | "product-metal-frame"
  | "project-zanjan-enghelab"
  | "project-zanjan-golshahr"
  | "project-tehran-saadatabad"
  | "project-karaj-mehrshahr"
  | "project-qazvin-minoodar"
  | "project-tabriz-elgoli";

export interface ProductSpec {
  label: string;
  value: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export type ConfiguratorKey =
  | "upvc"
  | "thermal-break"
  | "balcony-glass"
  | "pleated-mesh"
  | null;

export interface ProductLine {
  slug: string;
  name: string;
  shortName: string;
  category: "پنجره و نما" | "درب ساختمانی" | "جانبی و بازشو";
  tagline: string;
  summary: string;
  imageKey: ImageKey;
  seoTitle: string;
  seoDescription: string;
  highlights: string[];
  specs: ProductSpec[];
  pros: string[];
  cons: string[];
  idealFor: string[];
  configuratorEligible: boolean;
  configuratorKey: ConfiguratorKey;
  faqs: FaqItem[];
}

export type ProjectUsageType =
  | "مسکونی"
  | "ویلایی"
  | "اداری و تجاری"
  | "بازسازی و تعویض";

export interface ProjectCase {
  slug: string;
  title: string;
  city: string;
  province: string;
  year: string;
  usageType: ProjectUsageType;
  areaSqm: number;
  systemsUsed: string[];
  challenge: string;
  solution: string;
  highlights: string[];
  imageKey: ImageKey;
  seoTitle: string;
  seoDescription: string;
}

export interface ComparisonCriterion {
  metric: string;
  upvc: string;
  thermalBreak: string;
  winnerNote: string;
}
