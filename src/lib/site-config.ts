export interface NavItem {
  label: string;
  href: string;
}

export interface ProductNavLink {
  slug: string;
  title: string;
  href: string;
}

export const SITE_CONFIG = {
  name: "گروه صنعتی سپنتا",
  shortTitle: "درب و پنجره دوجداره uPVC و آلومینیوم ترمال بریک",
  tagline:
    "تولیدکننده تخصصی درب و پنجره دوجداره uPVC، آلومینیوم ترمال بریک و سازه‌های معماری — کارخانه زنجان، تأمین و نصب سراسری",
  siteUrl: "https://sepanta-co.ir",
  warrantySummary:
    "ضمانت اصالت پروفیل، یراق‌آلات استاندارد و کنترل کیفیت ابعادی در خط تولید کارخانه",
  coverageNote: "کارخانه تولیدی در زنجان • ارسال و نصب تخصصی در سراسر کشور",
  contact: {
    // مقادیر تماس زیر نمونه اولیه (Placeholder) بوده و در فاز نهایی با شماره‌های رسمی جایگزین می‌شوند
    isPlaceholder: true,
    phoneDisplay: "۰۲۴-۳۲۲۸۰۰۰۰",
    phoneHref: "tel:+982432280000",
    mobileDisplay: "۰۹۱۲-۰۰۰-۰۰۰۰",
    mobileHref: "tel:+989120000000",
    whatsappHref: "https://wa.me/989120000000",
    email: "info@sepanta-co.ir",
    factoryAddress:
      "زنجان، شهرک صنعتی علی‌آباد (شماره ۱)، بلوار صنعت (نشانی کارگاهی نمونه)",
    workingHours: "شنبه تا چهارشنبه ۸:۰۰ الی ۱۷:۰۰ • پنج‌شنبه‌ها ۸:۰۰ الی ۱۳:۰۰",
  },
} as const;

export const NAV_ITEMS: readonly NavItem[] = [
  { label: "صفحه اصلی", href: "/" },
  { label: "محصولات", href: "/products/" },
  { label: "کانفیگوریتور هوشمند", href: "/configurator/" },
  { label: "پروژه‌ها", href: "/projects/" },
  { label: "کارخانه و تماس", href: "/about/" },
] as const;

export const PRODUCT_NAV_LINKS: readonly ProductNavLink[] = [
  {
    slug: "upvc-window",
    title: "پنجره دوجداره uPVC",
    href: "/products/upvc-window/",
  },
  {
    slug: "thermal-break-window",
    title: "آلومینیوم ترمال بریک",
    href: "/products/thermal-break-window/",
  },
  {
    slug: "balcony-glass",
    title: "شیشه بالکنی تاشو",
    href: "/products/balcony-glass/",
  },
  {
    slug: "pleated-mesh",
    title: "توری پلیسه کشویی",
    href: "/products/pleated-mesh/",
  },
  {
    slug: "security-door",
    title: "درب ضد سرقت",
    href: "/products/security-door/",
  },
  {
    slug: "wooden-door",
    title: "درب داخلی چوبی",
    href: "/products/wooden-door/",
  },
  {
    slug: "metal-frame",
    title: "چهارچوب فلزی صنعتی",
    href: "/products/metal-frame/",
  },
] as const;

export const FOOTER_UTILITY_LINKS: readonly NavItem[] = [
  { label: "کانفیگوریتور هوشمند ابعاد و برآورد", href: "/configurator/" },
  { label: "نمونه پروژه‌های اجرایی", href: "/projects/" },
  { label: "معرفی کارخانه زنجان", href: "/about/" },
  { label: "ارتباط با واحد فروش و فنی", href: "/about/#contact" },
] as const;
