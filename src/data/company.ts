/**
 * شناسنامه و اطلاعات رسمی گروه صنعتی سپنتا (تأسیس ۱۳۸۰)
 * تمام مقادیر تماس و آدرس‌ها به عنوان کانفیگ قابل ویرایش در یک نقطه متمرکز شده‌اند.
 */

export interface CompanyCredential {
  title: string;
  issuer: string;
  description: string;
}

export interface CompanyStats {
  foundedYear: number;
  foundedYearFa: string;
  experienceYears: number;
  experienceYearsFa: string;
  monthlyCapacityUnits: number;
  monthlyCapacityFa: string;
  minWarrantyYears: number;
  maxWarrantyYears: number;
  warrantyPeriodFa: string;
  provincesCovered: number;
  provincesCoveredFa: string;
  completedProjectsCount: string;
}

export interface CompanyContactConfig {
  phone: string;
  phoneDisplay: string;
  mobileSales: string;
  mobileSalesDisplay: string;
  whatsappNumber: string;
  email: string;
  factoryAddress: string;
  salesOfficeAddress: string;
  postalCode: string;
  workingHours: {
    weekdays: string;
    thursday: string;
    friday: string;
  };
  geoCoordinates: {
    factory: { lat: number; lng: number };
    office: { lat: number; lng: number };
  };
}

export interface CompanyData {
  brandName: string;
  brandNameEn: string;
  tagline: string;
  shortBio: string;
  fullBio: string;
  stats: CompanyStats;
  contact: CompanyContactConfig;
  coreStrengths: Array<{
    title: string;
    subtitle: string;
    description: string;
    iconName: string;
  }>;
  standardsAndCertificates: CompanyCredential[];
}

export const COMPANY_DATA: CompanyData = {
  brandName: "گروه صنعتی سپنتا",
  brandNameEn: "Sepanta Industrial Group",
  tagline: "تولید صنعتی درب و پنجره دوجداره، آلومینیوم ترمال بریک و دربهای ساختمانی از ۱۳۸۰",
  shortBio:
    "تولیدکننده تخصصی درب و پنجره‌های دوجداره uPVC، آلومینیوم ترمال بریک و شیشه‌های بالکنی از سال ۱۳۸۰ با ظرفیت ماهانه ۱٬۰۰۰ واحد و پوشش پروژه‌ها در زنجان و سراسر ایران.",
  fullBio:
    "گروه صنعتی سپنتا از سال ۱۳۸۰ خورشیدی با هدف تولید صنعتی و استاندارد سیستم‌های بازشو و نما در زنجان پایه‌گذاری شد. سپنتا با بهره‌گیری از خطوط ماشین‌آلات پیشرفته CNC، پروفیل‌های دارای بالاترین رده استاندارد کیفی بین‌المللی و یراق‌آلات درجه‌یک اروپایی، سالانه توان تجهیز صدها پروژه مسکونی، اداری، ویلایی و انبوه‌سازی را در استان زنجان و اقصی‌نقاط کشور داراست.",
  stats: {
    foundedYear: 1380,
    foundedYearFa: "۱۳۸۰",
    experienceYears: 25,
    experienceYearsFa: "۲۵+",
    monthlyCapacityUnits: 1000,
    monthlyCapacityFa: "۱٬۰۰۰ واحد",
    minWarrantyYears: 10,
    maxWarrantyYears: 25,
    warrantyPeriodFa: "۱۰ تا ۲۵ سال",
    provincesCovered: 31,
    provincesCoveredFa: "سراسر ایران",
    completedProjectsCount: "۲٬۵۰۰+ پروژه موفق",
  },
  contact: {
    phone: "02433445566",
    phoneDisplay: "۰۲۴-۳۳۴۴۵۵۶۶",
    mobileSales: "09121415500",
    mobileSalesDisplay: "۰۹۱۲-۱۴۱-۵۵۰۰",
    whatsappNumber: "989121415500",
    email: "info@sepantaco.ir",
    factoryAddress: "زنجان، شهرک صنعتی شماره ۱ (اشراق)، فاز توسعه، بلوار صنعت، پلاک ۴۲",
    salesOfficeAddress: "زنجان، میدان ارتش، بلوار کارگر، مجتمع تجاری سپنتا، طبقه ۲، واحد ۴",
    postalCode: "۴۵۱۵۸-۹۳۱۱۱",
    workingHours: {
      weekdays: "شنبه تا چهارشنبه ۸:۰۰ الی ۱۷:۰۰",
      thursday: "پنجشنبه‌ها ۸:۰۰ الی ۱۳:۰۰",
      friday: "جمعه‌ها و ایام تعطیل رسمی: پاسخگویی برخط",
    },
    geoCoordinates: {
      factory: { lat: 36.6582, lng: 48.4876 },
      office: { lat: 36.6749, lng: 48.4842 },
    },
  },
  coreStrengths: [
    {
      title: "اصالت و سابقه از ۱۳۸۰",
      subtitle: "بیش از دو دهه تعهد کارگاهی و صنعتی",
      description:
        "پایداری تولید در بیش از دو دهه گذشته، پشتوانه اعتماد کارفرمایان و تضمین دسترسی دائمی به قطعات، شیشه‌ها و یراق‌آلات جانشین است.",
      iconName: "History",
    },
    {
      title: "ظرفیت ماهانه ۱٬۰۰۰ واحد",
      subtitle: "دقت مقیاس‌پذیر برای ویلا تا انبوه‌سازی",
      description:
        "خط تولید هم‌زمان چندایستگاهی CNC پاسخ‌گوی نیاز انبوه‌سازان به تحویل منظم طبق برنامه زمان‌بندی دقیق کارگاهی است.",
      iconName: "Factory",
    },
    {
      title: "پوشش سراسری زنجان و کل کشور",
      subtitle: "تأمین، بسته‌بندی پالتایز و نصب مهندسی",
      description:
        "سپنتا از مرکز صنعتی زنجان به سراسر استان‌های کشور محصولات را با بسته‌بندی ایمن کارخانه‌ای و اعزام تیم‌های نصب تخصصی ارسال می‌نماید.",
      iconName: "Truck",
    },
    {
      title: "۱۰ تا ۲۵ سال خدمات پس از فروش",
      subtitle: "گارانتی کتبی مقاومت، تغییر رنگ و هوابندی",
      description:
        "پروفیل‌های uPVC و آلومینیوم ترمال بریک سپنتا در برابر اشعه UV، تاب‌برداشتن و نفوذ صدا و گردوغبار دارای گارانتی رسمی بلندمدت هستند.",
      iconName: "ShieldCheck",
    },
    {
      title: "تعویض پنجره بدون تخریب",
      subtitle: "تجهیز سریع ابنیه موجود در کمتر از یک روز",
      description:
        "بهره‌گیری از پروفیل‌های اختصاصی لبه‌دار بازسازی (Renovation Frame) به منظور پوشش فریم‌های قدیمی فلزی یا چوبی بدون ریزش گچ و رنگ داخلی.",
      iconName: "Wrench",
    },
  ],
  standardsAndCertificates: [
    {
      title: "استاندارد ملی ایران (ISIRI 12291)",
      issuer: "سازمان ملی استاندارد ایران",
      description: "انطباق کامل فرایند تولید مقاطع و هوابندی در و پنجره‌های یو‌پی‌وی‌سی.",
    },
    {
      title: "گواهی کیفیت RAL آلمان (RAL-GZ 716/1)",
      issuer: "مؤسسه کیفیت RAL آلمان",
      description: "تأییدیه ضخامت دیواره کلاس A و مقاومت فیزیکی و هوازدگی پروفیل‌ها.",
    },
    {
      title: "سیستم مدیریت کیفیت ISO 9001:2015",
      issuer: "نهاد بین‌المللی صدور گواهینامه",
      description: "استقرار سیستم کنترل کیفی چندمرحله‌ای از ورود متریال تا تحویل در پروژه.",
    },
    {
      title: "تأییدیه مرکز تحقیقات راه، مسکن و شهرسازی",
      issuer: "وزارت راه و شهرسازی",
      description: "انطباق با مبحث ۱۹ مقررات ملی ساختمان جهت کاهش اتلاف انرژی حرارتی.",
    },
  ],
};
