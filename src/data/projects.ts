/**
 * رکوردهای پروژه‌های معماری و مهندسی گروه صنعتی سپنتا
 * ترکیبی واقعی از پروژه‌های زنجان، تهران و دیگر شهرهای ایران.
 * فیلد image به گونه‌ای طراحی شده که با یک مسیر ساده یا فراخوانی assetPath() عکس‌های واقعی کارفرما جایگزین شوند.
 */

export type ProjectCategory = "residential" | "villa" | "renovation" | "mass-housing";

export interface ArchitecturalProject {
  id: string;
  slug: string;
  title: string;
  city: string;
  locationArea: string;
  year: number;
  yearFa: string;
  category: ProjectCategory;
  categoryLabel: string;
  systemUsed: string;
  estimatedUnits: number;
  estimatedUnitsFa: string;
  architecturalChallenge: string;
  technicalSolution: string;
  specHighlights: string[];
  image: string;
  isFeatured: boolean;
}

export const PROJECTS: ArchitecturalProject[] = [
  // پروژه ۱: زنجان - بازسازی بدون تخریب
  {
    id: "project-zanjan-enghelab",
    slug: "residential-renovation-zanjan-enghelab",
    title: "تعویض پنجره‌های مجتمع مسکونی زیتون",
    city: "زنجان",
    locationArea: "بلوار انقلاب، خیابان صفا",
    year: 1403,
    yearFa: "۱۴۰۳",
    category: "renovation",
    categoryLabel: "بازسازی بدون تخریب",
    systemUsed: "پنجره دوجداره uPVC سری ۷۰ لبه‌دار بازسازی + توری‌های پلیسه مگنتی",
    estimatedUnits: 36,
    estimatedUnitsFa: "۳۶ دهانه بازشوی پنجره",
    architecturalChallenge:
      "کاهش شدید نفوذ باد و آلودگی صوتی ۶۰ دسی‌بل بلوار در ساختمانی مسکونی با ساکنان مستقر، بدون کوچک‌ترین تخریب گچ‌بری داخلی و سنگ نمای بیرونی.",
    technicalSolution:
      "برش تیغه‌ای فریم‌های قدیمی آهنی و حفظ اسکلت زیرین؛ نصب فریم‌های بازسازی لبه‌دار اختصاصی با لاستیک‌های سه‌لایه EPDM و شیشه دوجداره آکوستیک لمینت گازدار در کمتر از ۳ روز کاری برای کل مجموعه.",
    specHighlights: [
      "پروفیل پنج‌کاناله کلاس A سری بازسازی",
      "کاهش صوت محسوس تا ۳۸ دسی‌بل",
      "بدون آسیب به کاغذدیواری و گچ داخلی",
      "شیشه‌های دوجداره کنترل حرارتی Low-E",
    ],
    image: "/images/projects/project-zanjan-renovation.webp",
    isFeatured: true,
  },

  // پروژه ۲: زنجان - ویلای مدرن
  {
    id: "project-zanjan-gavazang",
    slug: "modern-villa-gavazang-zanjan",
    title: "ویلای خصوصی مهر، کوهسار گاوازنگ",
    city: "زنجان",
    locationArea: "منطقه کوهستانی گاوازنگ",
    year: 1402,
    yearFa: "۱۴۰۲",
    category: "villa",
    categoryLabel: "ویلایی لوکس",
    systemUsed: "سیستم ترمال بریک آلومینیومی لیفت‌اند‌اسلاید (Lift & Slide) سری ۸۵ + شیشه بالکنی ریلی",
    estimatedUnits: 14,
    estimatedUnitsFa: "۱۴ دهانه بزرگ شیشه‌ای",
    architecturalChallenge:
      "تأمین دهانه‌های شیشه‌ای عریض به ارتفاع ۳.۲۰ متر رو به دره و کوهستان با مقاومت در برابر بار باد شدید و افت دمای زیر منفی ۱۵ درجه در زمستان.",
    technicalSolution:
      "بهره‌گیری از مقاطع سنگین آلومینیوم ترمال بریک با پلی‌آمید ۳۴ میلی‌متری دوخت‌شده و شیشه‌های سه‌جداره سکوریت سان‌انرژی با یراق‌آلات لیفت‌اند‌اسلاید ۴۰۰ کیلوگرمی ساخت آلمان.",
    specHighlights: [
      "دهانه‌های سرتاسری شیشه بدون ستون میانی",
      "ضریب انتقال حرارت Uw ≤ 1.1 W/m²K",
      "پوشش آنادایز نقرهای مات ۲۰ میکرون",
      "ادغام تراس با شیشه بالکنی تاشو چهارفصل",
    ],
    image: "/images/projects/project-villa-gavazang.webp",
    isFeatured: true,
  },

  // پروژه ۳: تهران - مسکونی مدرن سعادت‌آباد
  {
    id: "project-tehran-saadatabad",
    slug: "luxury-residence-tehran-saadatabad",
    title: "برج‌باغ مسکونی افرا",
    city: "تهران",
    locationArea: "سعادت‌آباد، میدان کاج",
    year: 1403,
    yearFa: "۱۴۰۳",
    category: "residential",
    categoryLabel: "مسکونی مدرن",
    systemUsed: "پنجره‌های ترمال بریک لولایی دوحالته مخفی + درب‌های ضد سرقت لابی سفارشی",
    estimatedUnits: 72,
    estimatedUnitsFa: "۷۲ واحد بازشو و ورودی",
    architecturalChallenge:
      "الزام طراح به نمای فریم‌لس بدون مشاهده بازشوهای بیرونی به همراه کنترل آلودگی صوتی بزرگراه یادگار امام.",
    technicalSolution:
      "استفاده از سیستم لنگه مخفی (Hidden Sash) ترمال بریک با لاستیک هوابندی مرکزی اسفنجی، یراق‌آلات توکار مخفی روتو آلمان و شیشه لمینت دوجداره آکوستیک PVB.",
    specHighlights: [
      "فریم لنگه کاملاً مخفی از نمای بیرونی",
      "روکش چوب گردوی طبیعی روی درب ضد سرقت ورودی",
      "عایق صوتی تاییدشده تا ۴۳ دسی‌بل در آزمون رازی",
      "دستگیره‌های مینیمال مدرن با پوشش PVD تیتانیوم",
    ],
    image: "/images/projects/project-tehran-residence.webp",
    isFeatured: true,
  },

  // پروژه ۴: قزوین - انبوه‌سازی مسکونی
  {
    id: "project-qazvin-housing",
    slug: "mass-housing-qazvin-minoodar",
    title: "مجتمع ۱۲۰ واحدی پردیس مینودر",
    city: "قزوین",
    locationArea: "شهرک مینودر",
    year: 1401,
    yearFa: "۱۴۰۱",
    category: "mass-housing",
    categoryLabel: "انبوه‌سازی مسکونی",
    systemUsed: "درب و پنجره uPVC سری ۶۰ سفید + چهارچوب‌های فلزی نورد سرد طبقات",
    estimatedUnits: 240,
    estimatedUnitsFa: "۲۴۰ پنجره و ۱۲۰ چهارچوب",
    architecturalChallenge:
      "تولید و تحویل منسجم حجم بالای پنجره‌ها و چهارچوب‌ها در موعدهای فازبندی‌شده سخت‌گیرانه پروژه بدون افت کیفیت ابعادی.",
    technicalSolution:
      "تخصیص یک خط مستقل از ظرفیت ماهانه ۱٬۰۰۰ واحدی کارخانه سپنتا، تحویل پالت‌بندی‌شده منظم با برچسب‌گذاری مهندسی بارکددار برای هر طبقه و نظارت تیم مهندسی نصب مقیم.",
    specHighlights: [
      "تحویل کامل طبق جدول زمان‌بندی ۴ ماهه",
      "صرفه‌جویی ۱۸ درصدی در بودجه تمام‌شده پروژه",
      "انطباق کامل با استاندارد مبحث ۱۹ نظام مهندسی",
      "گواهینامه ۱۰ سال خدمات و ضمانت کتبی کارخانه‌ای",
    ],
    image: "/images/projects/project-qazvin-mass-housing.webp",
    isFeatured: false,
  },

  // پروژه ۵: تبریز - ویلایی شاهگلی
  {
    id: "project-tabriz-elgoli",
    slug: "villa-tabriz-elgoli",
    title: "ویلای دوبلکس کوهستان ائل‌گلی",
    city: "تبریز",
    locationArea: "محدوده تفرجگاهی ائل‌گلی",
    year: 1402,
    yearFa: "۱۴۰۲",
    category: "villa",
    categoryLabel: "ویلایی لوکس",
    systemUsed: "درب و پنجره uPVC طرح چوب بلوطی لمینت دورو + شیشه بالکنی ریلی دودی",
    estimatedUnits: 22,
    estimatedUnitsFa: "۲۲ دهانه پنجره و شیشه ریلی",
    architecturalChallenge:
      "هماهنگی با بافت سنگ و چوب نمای ویلا در کنار مقاومت در برابر سرمای استخوان‌سوز و بادهای تند زمستانی تبریز.",
    technicalSolution:
      "پروفیل‌های ۵ کاناله لمینت دورو فویل Renolit آلمان با بافت رگه‌چوب برجسته، شیشه‌های دوجداره با ضخامت گاز آرگون ۱۶ میلی‌متر و نصب شیشه بالکنی دودی در بالکن طبقه بالا.",
    specHighlights: [
      "فویل‌های لمینت ضد خش و مقاوم در برابر اشعه خورشید",
      "رنگ هماهنگ با نمای ترمووود ساختمان",
      "بهره‌مندی از بالکن در سرمای زیر صفر زمستان",
      "توری‌های کشویی مگنتی همرنگ فریم",
    ],
    image: "/images/projects/project-tabriz-villa.webp",
    isFeatured: false,
  },

  // پروژه ۶: کرج - مجتمع تجاری اداری عظیمیه
  {
    id: "project-karaj-azimieh",
    slug: "commercial-center-karaj-azimieh",
    title: "ساختمان اداری مهندسی البرز",
    city: "کرج",
    locationArea: "عظیمیه، بلوار طالقانی شمالی",
    year: 1403,
    yearFa: "۱۴۰۳",
    category: "residential",
    categoryLabel: "اداری و تجاری",
    systemUsed: "سیستم ترکیبی ترمال بریک آلومینیومی + درب‌های ضد سرقت مدیریتی سفارشی",
    estimatedUnits: 45,
    estimatedUnitsFa: "۴۵ دهانه و درب ساختمانی",
    architecturalChallenge:
      "ایجاد چهره اداری لوکس، عایق‌سازی شدید صوتی در خیابان اصلی و کنترل تابش شدید غرب ساختمان.",
    technicalSolution:
      "اجرای کرتین‌وال آلومینیومی لامل ترمال بریک با شیشه‌های کنترل خورشیدی رفلکس ملایم و استفاده از درب‌های لابی با قفل‌های امنیتی برقی کنترل دسترسی.",
    specHighlights: [
      "شیشه‌های با پوشش نانومتالیک کنترل حرارت",
      "پوشش آنادایز نقرهای مات ۲۰ میکرون",
      "درب‌های ورودی مجهز به هسته فولادی ۲ میلی‌متری",
      "بهبود رده انرژی ساختمان به گرید A",
    ],
    image: "/images/projects/project-karaj-commercial.webp",
    isFeatured: true,
  },
];

/**
 * Filter projects by category or return all.
 */
export function getProjectsByCategory(category?: ProjectCategory | "all"): ArchitecturalProject[] {
  if (!category || category === "all") return PROJECTS;
  return PROJECTS.filter((p) => p.category === category);
}

/**
 * Filter projects by city.
 */
export function getProjectsByCity(city: string): ArchitecturalProject[] {
  return PROJECTS.filter((p) => p.city.includes(city));
}

/**
 * Returns featured projects for landing page.
 */
export function getFeaturedProjects(): ArchitecturalProject[] {
  return PROJECTS.filter((p) => p.isFeatured);
}
