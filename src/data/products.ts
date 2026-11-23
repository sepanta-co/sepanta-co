/**
 * کاتالوگ جامع محصولات گروه صنعتی سپنتا
 * سازمان‌دهی در ۲ خوشه اصلی و ۷ خط تولید کارخانه‌ای به همراه مشخصات مهندسی دقیق.
 */

export type ProductClusterId = "windows-facade" | "doors-frames";
export type BudgetTier = "اقتصادی" | "مهندسی" | "لوکس";

export interface ProductProfileSpec {
  label: string;
  value: string;
}

export interface ProductItem {
  id: string;
  slug: string;
  name: string;
  persianTitle: string;
  cluster: ProductClusterId;
  clusterName: string;
  tag: string;
  shortDescription: string;
  fullDescription: string;
  image: string;
  priceUnit: "هر مترمربع" | "هر عدد";
  configuratorSystem?: "upvc" | "thermal-break" | "balcony-glass" | "pleated-mesh";
  acousticRating?: string;
  thermalRating?: string;
  profileSpecs: ProductProfileSpec[];
  glassSpecs?: string[];
  hardwareSpecs?: string;
  warrantyYears: number;
  budgetTier: BudgetTier;
  idealUseCases: string[];
  technicalDiagramId: string;
  configuratorAvailable: boolean;
  basePricePerSqmEstimated?: {
    min: number;
    max: number;
  };
  features: string[];
}

export interface ProductCluster {
  id: ProductClusterId;
  title: string;
  subtitle: string;
  description: string;
  productCount: number;
}

export const PRODUCT_CLUSTERS: ProductCluster[] = [
  {
    id: "windows-facade",
    title: "سیستم‌های پنجره، نما و حفاظتی",
    subtitle: "پنجره‌های دوجداره پیشرفته و شیشه‌های مدولار",
    description:
      "شامل پنجره‌های uPVC، آلومینیوم ترمال بریک، سیستم‌های ریلی جام بالکنی و توری‌های کشویی آنتی‌داست با تمرکز بر بالاترین بازدهی حرارتی و آکوستیک.",
    productCount: 4,
  },
  {
    id: "doors-frames",
    title: "سیستم‌های درب ساختمانی و چهارچوب",
    subtitle: "حفاظت پیرامونی و تکمیل معماری داخلی",
    description:
      "شامل درب‌های ضد سرقت با هسته فولادی تقویتی، درب‌های چوبی اتاقی و چهارچوب‌های فلزی نورد سرد با دقت ساخت کارخانه‌ای.",
    productCount: 3,
  },
];

export const PRODUCTS: ProductItem[] = [
  // 1. درب و پنجره دوجداره uPVC
  {
    id: "upvc-window",
    slug: "upvc-window",
    name: "uPVC Double Glazed Windows & Doors",
    persianTitle: "درب و پنجره دوجداره uPVC",
    cluster: "windows-facade",
    clusterName: "سیستم‌های پنجره، نما و حفاظتی",
    tag: "بالاترین بازدهی انرژی و اقتصادی",
    shortDescription:
      "عایق کامل حرارتی و صوتی با پروفیل‌های ۵ کاناله کلاس A، گالوانیزه ۱.۵ میلی‌متری سرتاسری و امکان تعویض پنجره قدیمی بدون تخریب.",
    fullDescription:
      "پنجره‌های دوجداره uPVC سپنتا با بهره‌گیری از پروفیل‌های دارای تاییدیه RAL آلمان و لاستیک‌های آب‌بندی EPDM تولید می‌شوند. استفاده از تقویت‌کننده گالوانیزه ضخیم در تمامی اضلاع فریم و لنگه، مقاومت ایستایی سیستم را در برابر تندبادها و تغییرات شدید دمایی تضمین می‌نماید. این سیستم مناسب‌ترین گزینه برای کاهش محسوس قبوض انرژی و حذف آلودگی صوتی تا ۴۰ دسی‌بل در محیط‌های شهری است.",
    image: "/images/product-upvc.jpg",
    priceUnit: "هر مترمربع",
    configuratorSystem: "upvc",
    acousticRating: "تا ۴۰ دسی‌بل (dB)",
    thermalRating: "Uw ≈ 1.3 - 1.5 W/m²K",
    profileSpecs: [
      { label: "رده ضخامت دیواره", value: "کلاس A (۳.۰ میلی‌متر استاندارد)" },
      { label: "تعداد کانال‌های داخلی", value: "۵ کاناله (عایق‌بندی حداکثری)" },
      { label: "تسمه تقویتی", value: "فولاد گالوانیزه ۱.۵ میلی‌متر یکپارچه" },
      { label: "نوع درزبندی", value: "لاستیک EPDM دوتایی مقاوم در برابر UV" },
      { label: "عمق مقطع فریم", value: "۶۰ تا ۷۰ میلی‌متر" },
    ],
    glassSpecs: [
      "شیشه دوجداره ۴+۱۲+۴ میلی‌متر فلوت سوپر کلیر",
      "تزریق استاندارد گاز آرگون با اسپیسر آلومینیومی بوتیل‌زده",
      "امکان سفارشی‌سازی شیشه Low-E، لمینت ضد ضربه یا سکوریت",
    ],
    hardwareSpecs: "یراق‌آلات دوحالته و تک‌حالته ساخت آلمان و ترکیه (Roto / Vorne / Romb)",
    warrantyYears: 15,
    budgetTier: "اقتصادی",
    idealUseCases: [
      "تعویض پنجره‌های قدیمی آهنی یا آلومینیومی سنتی بدون تخریب گچ و نما",
      "ساختمان‌های مسکونی در اقلیم‌های سردسیر و متغیر",
      "پروژه‌های انبوه‌سازی با الزام به رعایت مبحث ۱۹ مقررات ملی ساختمان",
    ],
    technicalDiagramId: "diagram-upvc-70mm",
    configuratorAvailable: true,
    basePricePerSqmEstimated: {
      min: 3200000,
      max: 4800000,
    },
    features: [
      "بدون تغییر رنگ و زردشدگی در تابش مستقیم آفتاب",
      "هوابندی کامل در برابر ریزگردها و بادهای کویری",
      "عدم نیاز به رنگ‌آمیزی و سرویس دوره‌ای پیچیده",
      "سازگاری با انواع بازشوهای کشویی، لولایی و فولکس‌واگنی",
    ],
  },

  // 2. درب و پنجره آلومینیوم ترمال بریک
  {
    id: "thermal-break-window",
    slug: "thermal-break-window",
    name: "Thermal Break Aluminum Systems",
    persianTitle: "درب و پنجره آلومینیوم ترمال بریک",
    cluster: "windows-facade",
    clusterName: "سیستم‌های پنجره، نما و حفاظتی",
    tag: "مقاومت ساختاری و معماری مدرن",
    shortDescription:
      "سیستم آلومینیومی اختصاصی مجهز به تیغه پلی‌آمید عایق حرارتی، امکان اجرای دهانه‌های بسیار بزرگ و لنگه‌های سنگین لیفت‌اند‌اسلاید.",
    fullDescription:
      "پنجره‌های ترمال بریک سپنتا با دوخت مکانیزه تیغه‌های پلی‌آمید تقویت‌شده با الیاف شیشه میان مقاطع آلومینیومی آلیاژ 6063 فابریک تولید می‌شوند. این پیوند مهندسی، پل حرارتی فلز را کاملاً قطع کرده و هم‌زمان صلبیت و مقاومت خمشی فوق‌العاده‌ای به فریم می‌بخشد. امکان پوشش‌های رنگی آنودایزینگ مات، براق و رنگ‌های پودری الکترواستاتیک سمباده‌ای این سیستم را به انتخاب اول پروژه‌های لوکس و معمارانه بدل کرده است.",
    image: "/images/product-thermal.jpg",
    priceUnit: "هر مترمربع",
    configuratorSystem: "thermal-break",
    acousticRating: "تا ۴۴ دسی‌بل (dB)",
    thermalRating: "Uw ≈ 1.1 - 1.4 W/m²K",
    profileSpecs: [
      { label: "آلیاژ شمش آلومینیوم", value: "Alloy 6063-T6 فابریک درجه‌یک" },
      { label: "جنس تیغه ترمال", value: "پلی‌آمید PA66 GF25 آلمانی با ۲۵٪ الیاف شیشه" },
      { label: "عمق مقطع فریم", value: "۶۰ تا ۸۵ میلی‌متر (سری اختصاصی)" },
      { label: "پوشش سطحی", value: "آنودایزینگ ۱۵ تا ۲۰ میکرون یا رنگ پودری AkzoNobel" },
      { label: "تحمل وزن لنگه", value: "تا ۴۰۰ کیلوگرم در مکانیزم Lift & Slide" },
    ],
    glassSpecs: [
      "دوجداره یا سه‌جداره تا ضخامت ۳۸ میلی‌متر",
      "شیشه‌های سولار کنترل و رفلکس دودی",
      "اسپیسر وارم‌ایج (Warm Edge) با تزریق گاز آرگون ۹۵٪",
    ],
    hardwareSpecs: "سیستم‌های یراق‌آلات پیشرفته G-U آلمان یا Savio ایتالیا",
    warrantyYears: 25,
    budgetTier: "لوکس",
    idealUseCases: [
      "نماهای مدرن با دهانه‌های شیشه‌ای عریض (Floor-to-Ceiling)",
      "ویلاهای مدرن با سیستم‌های کشویی لیفت‌اند‌اسلاید ابعاد بزرگ",
      "برج‌های مسکونی مرتفع با بار باد شدید و فشار هیدرواستاتیک بالا",
    ],
    technicalDiagramId: "diagram-thermal-break-65",
    configuratorAvailable: true,
    basePricePerSqmEstimated: {
      min: 6800000,
      max: 12500000,
    },
    features: [
      "صلبیت استثنایی و امکان طراحی لنگه‌های ۳ متری بدون اعوجاج",
      "تنوع نامحدود در پوشش‌های متالیک، شامپاینی و مشکی مات",
      "دوام بی‌رقیب در اقلیم‌های مرطوب، کوهستانی و بادخیز",
      "هوابندی درجه ۴ اروپا بر اساس استاندارد EN 12207",
    ],
  },

  // 3. شیشه بالکنی تاشو
  {
    id: "balcony-glass",
    slug: "balcony-glass",
    name: "Folding Balcony Glass System",
    persianTitle: "شیشه بالکنی تاشو (جام بالکنی)",
    cluster: "windows-facade",
    clusterName: "سیستم‌های پنجره، نما و حفاظتی",
    tag: "فضای چهارفصل و نمای پانوراما",
    shortDescription:
      "سیستم ریلی شیشه‌های سکوریت تاشو جمع‌شونده در یک سمت؛ تبدیل تراس به فضای قابل سکونت چهارفصل بدون تغییر هویت بصری نما.",
    fullDescription:
      "شیشه بالکنی تاشو سپنتا از پانل‌های شیشه سکوریت ۸ تا ۱۰ میلی‌متری ایمن به همراه ریل‌های آلومینیومی ضخیم بالایی و پایینی تشکیل یافته است. تمامی چرخ‌ها و بلبرینگ‌ها با روکش تفلون ضدسایش و اتصالات استنلس استیل ۳۰۴ طراحی شده‌اند تا در برابر باران، یخ‌زدگی و گردوغبار نرمی حرکت خود را برای سال‌ها حفظ کنند. در فصول سرد مانع ورود سرما و باران شده و در بهار و تابستان با جمع شدن لنگه‌ها در کنج، دید کامل و تهویه آزاد را فراهم می‌سازد.",
    image: "/images/product-balcony.jpg",
    priceUnit: "هر مترمربع",
    configuratorSystem: "balcony-glass",
    acousticRating: "کاهش صدا تا ۲۸ دسی‌بل (dB)",
    profileSpecs: [
      { label: "جنس ریل‌های هدایت‌کننده", value: "آلومینیوم سنگین اکسترود ۶۰۶۳ نورد گرم" },
      { label: "بلبرینگ و چرخ‌ها", value: "بلبرینگ فولادی آب‌بندی‌شده با روکش پلی‌آمید ضدسایش" },
      { label: "اتصالات فلزی", value: "استیل ضدزنگ ۳۰۴ ضد زنگ‌زدگی" },
      { label: "درزبندی بین پانل‌ها", value: "فتیله‌های شفاف پلی‌کربنات UV دار و مگنتی" },
    ],
    glassSpecs: [
      "شیشه سکوریت نشکن ۸ یا ۱۰ میلی‌متر استاندارد ملی",
      "امکان تولید در رنگ‌های شفاف، دودی، برنزی و سندبلاست مات",
    ],
    hardwareSpecs: "قفل کودک، دستگیره‌های مغزی برنجی و خروجی آب‌چکان تعبیه‌شده در ریل کف",
    warrantyYears: 10,
    budgetTier: "مهندسی",
    idealUseCases: [
      "تراس‌ها و بالکن‌های آپارتمانی برای عایق‌سازی بدون مسدود شدن دائمی نما",
      "پوشش استخر، آلاچیق، روف‌گاردن و گلخانه‌های خانگی",
      "جداسازی فضاهای باز در کافه‌ها، رستوران‌ها و تالارها",
    ],
    technicalDiagramId: "diagram-balcony-rail",
    configuratorAvailable: true,
    basePricePerSqmEstimated: {
      min: 3600000,
      max: 5200000,
    },
    features: [
      "جمع شدن ۱۰۰ درصدی شیشه‌ها در یک گوشه بالکن",
      "نظافت فوق‌العاده آسان هر دو سمت شیشه از داخل بالکن بدون خطر سقوط",
      "مقاومت شیشه سکوریت در برابر ضربات سنگین و بادهای فصلی",
      "تجهیز به درزگیرهای مگنتی برای جلوگیری از ورود باران و دود",
    ],
  },

  // 4. توری کشویی (پلیسه)
  {
    id: "pleated-mesh",
    slug: "pleated-mesh",
    name: "Pleated Sliding Insect Screen",
    persianTitle: "توری کشویی (پلیسه)",
    cluster: "windows-facade",
    clusterName: "سیستم‌های پنجره، نما و حفاظتی",
    tag: "حفاظت ضد حشرات و گردوغبار",
    shortDescription:
      "توری پلی‌استر آکاردئونی با فریم آلومینیومی باریک هماهنگ با رنگ پنجره، باز و بست نرم ریلی بدون آسیب به دید بیرونی.",
    fullDescription:
      "توری‌های پلیسه سپنتا پاسخی تمیز و بدون دردسر به ورود حشرات موذی، ذرات معلق و گردوغبار در هنگام باز بودن لنگه‌های پنجره هستند. بافت توری از الیاف فایبرگلاس و پلی‌استر استاتیک تهیه شده که مانع نشستن گردوغبار گردیده و در برابر نور شدید خورشید پوسیده نمی‌شود. زنجیرهای راهنمای پلیمری در بالا و پایین حرکت توری را کاملاً مستقیم و بادوام نگاه می‌دارند.",
    image: "/images/product-screen.jpg",
    priceUnit: "هر مترمربع",
    configuratorSystem: "pleated-mesh",
    profileSpecs: [
      { label: "فریم محیطی", value: "آلومینیوم اکسترود با رنگ الکترواستاتیک پودری" },
      { label: "جنس توری", value: "الیاف فایبرگلاس پلی‌استری ضد اشتعال و ضد UV" },
      { label: "مکانیزم هدایت", value: "زنجیر تسمه‌ای پلی‌آمیدی ضد گیرپاژ" },
      { label: "حالت جمع‌شدن", value: "آکاردئونی افقی (تک‌جهته یا دوطرفه مگنتی)" },
    ],
    warrantyYears: 10,
    budgetTier: "اقتصادی",
    idealUseCases: [
      "نصب مکمل روی انواع پنجره‌های دوجداره uPVC و آلومینیومی",
      "درب‌های بالکنی پرتردد با بازشوی عریض",
      "خانه‌های ویلایی و مناطق با رطوبت و حشرات فصلی",
    ],
    technicalDiagramId: "diagram-mesh-profile",
    configuratorAvailable: true,
    basePricePerSqmEstimated: {
      min: 1100000,
      max: 1800000,
    },
    features: [
      "دید کامل به فضای بیرون بدون اعوجاج نوری",
      "قابلیت شست‌وشو با بخارشوی یا آب بدون از بین رفتن خاصیت پلیسه",
      "امکان بازشدن از راست یا چپ یا بازشوی دوبل وسط برای دهانه‌های بزرگ",
      "فریم ظریف و هماهنگ با کد رنگی پنجره‌های اصلی",
    ],
  },

  // 5. درب ضد سرقت
  {
    id: "security-door",
    slug: "security-door",
    name: "Heavy Security Entrance Doors",
    persianTitle: "درب ضد سرقت",
    cluster: "doors-frames",
    clusterName: "سیستم‌های درب ساختمانی و چهارچوب",
    tag: "ایمنی نفوذناپذیر و روکش‌های نفیس",
    shortDescription:
      "هسته فولادی سرتاسری ۱.۵ میلی‌متری با قفل‌های مولتی‌پوینت کاله ترکیه، عایق صوتی پشم سنگ و روکش‌های طبیعی چوب راش و بلوط.",
    fullDescription:
      "درب‌های ضد سرقت تولیدی سپنتا با استراکچر تمام‌فولادی مقاوم شامل شبکه لچکی‌های مورب و ورق فولادی سرتاسری نورد گرم ساخته می‌شوند. قفل‌های مرکزی زبانه فولادی ضد مته و برش کاله (Kale Kilit) به همراه روزت‌های ضددریل، امنیت حداکثری ورودی واحد را تضمین می‌نمایند. استفاده از پشم سنگ با دانسیته بالا درون لنگه علاوه بر مقاومت حریق، انتقال صدای راه‌پله و راهرو را به صفر نزدیک می‌کند.",
    image: "/images/product-security-door.jpg",
    priceUnit: "هر عدد",
    acousticRating: "کاهش صدا تا ۳۸ دسی‌بل (dB)",
    profileSpecs: [
      { label: "ورق داخلی فولادی", value: "ورق فرم‌داده فولاد ۱.۵ میلی‌متر یکپارچه" },
      { label: "قوطی‌کشی داخلی", value: "پروفیل‌های شبکه تقویتی ۴۰×۲۰ فولادی" },
      { label: "عایق داخلی لنگه", value: "پشم سنگ دانسیته ۸۰ کیلوگرم بر مترمکعب (ضد حریق)" },
      { label: "ضخامت لنگه", value: "۷ تا ۹ سانتی‌متر" },
      { label: "پاشنه و آستانه", value: "چهارچوب فولادی فرم‌دار با پاشنه استنلس استیل" },
    ],
    hardwareSpecs: "قفل مرکزی یا مونو کاله ترکیه با ۵ کلید کامپیوتری و گارانتی ۵ ساله تعویض",
    warrantyYears: 15,
    budgetTier: "مهندسی",
    idealUseCases: [
      "درب ورودی واحدهای آپارتمانی مسکونی و اداری",
      "درب ورودی اصلی ویلاها با مقاومت در برابر رطوبت و باران",
      "پروژه‌های بازسازی و ارتقای امنیت واحدهای فرسوده",
    ],
    technicalDiagramId: "diagram-security-door",
    configuratorAvailable: false,
    basePricePerSqmEstimated: {
      min: 14000000,
      max: 28000000,
    },
    features: [
      "روکش‌های طبیعی چوب راش گرجستان، گردو و بلوط با رنگ پلی‌اورتان ضدخش",
      "نوار درزگیر فشاری دورتادور لنگه جهت جلوگیری کامل از نفوذ بو و دود",
      "لولاهای فولادی بلبرینگی با قابلیت تنظیم دقیق ریگلاژ",
      "قابلیت نصب چشمی هوشمند دیجیتال و قفل‌های تشخیص چهره/اثر انگشت",
    ],
  },

  // 6. درب چوبی ساختمانی
  {
    id: "interior-wooden-door",
    slug: "interior-wooden-door",
    name: "Interior Architectural Wooden Doors",
    persianTitle: "درب چوبی ساختمانی",
    cluster: "doors-frames",
    clusterName: "سیستم‌های درب ساختمانی و چهارچوب",
    tag: "تنوع متریال اتاقی، ضدآب و اداری",
    shortDescription:
      "تولید صنعتی درب‌های اتاقی، سرویسی ضدآب (ABS/پلی‌وود) و ورودی با کلاف چوب روس خشک‌کن‌رفته و ساختار شبکه‌ای تقویت‌شده.",
    fullDescription:
      "درب‌های داخلی سپنتا برای کاربردهای اتاق خواب، دفاتر کار و فضاهای خیس سرویس بهداشتی و حمام طراحی شده‌اند. کلاف چوبی تمامی درب‌ها از چوب روس یولکا فرآوری‌شده در کوره ساخته شده تا در طول زمان دچار پیچیدگی و افتادگی لنگه نشود. برای فضاهای مرطوب، لایه‌های پلیمری ABS یا هسته‌های ۱۰۰٪ پلی‌وود (Wood-Plastic Composite) بدون امکان نفوذ آب به ساختار داخلی استفاده می‌گردد.",
    image: "/images/product-wood-door.jpg",
    priceUnit: "هر عدد",
    profileSpecs: [
      { label: "کلاف داخلی", value: "چوب روسی خشک‌کن‌رفته ۶×۴ سانتی‌متر بدون گره" },
      { label: "هسته مرکزی", value: "شبکه هانیکام فشرده (لانهزنبوری) یا لایه‌های عایق صوتی MDF" },
      { label: "پوشش رویه", value: "MDF خارجی ۸ میلی‌متر با روکش پی‌وی‌سی وکیوم یا روکش طبیعی چوب" },
      { label: "درب‌های سرویسی", value: "روکش رزین ضدآب ABS با لبه‌های پلی‌پروپیلن جوش‌خورده" },
    ],
    hardwareSpecs: "قفل و دستگیره‌های مدرن سوئیچی و اتاقی روزت‌دار با آبکاری PVD",
    warrantyYears: 10,
    budgetTier: "اقتصادی",
    idealUseCases: [
      "درب‌های اتاق خواب و فضاهای داخلی مسکونی",
      "درب‌های سرویس بهداشتی و حمام با تماس مداوم رطوبت",
      "واحدهای اداری، هتل‌ها و فضاهای کلینیکی نیازمند شست‌وشو",
    ],
    technicalDiagramId: "diagram-wooden-door",
    configuratorAvailable: false,
    basePricePerSqmEstimated: {
      min: 2400000,
      max: 6500000,
    },
    features: [
      "مقاومت بالا در برابر ضربه و خط‌وخش روزمره",
      "عایق‌بندی نسبی صوت به لطف شبکه داخلی متراکم",
      "تنوع گسترده در طرح‌های CNC مینیمال، خطی و کلاسیک",
      "امکان تولید در ابعاد غیراستاندارد با ارتفاع تا ۲۴۰ سانتی‌متر",
    ],
  },

  // 7. چهارچوب فلزی
  {
    id: "steel-frame",
    slug: "steel-frame",
    name: "Cold-Rolled Steel Door Frames",
    persianTitle: "چهارچوب فلزی",
    cluster: "doors-frames",
    clusterName: "سیستم‌های درب ساختمانی و چهارچوب",
    tag: "دقت هندسی و مقاومت سازه‌ای",
    shortDescription:
      "تولید صنعتی انواع چهارچوب فرانسوی، مکزیکی و ساده از ورق نورد سرد ۲ میلی‌متری مبارکه با فارسی‌بر لیزری و جوش CO2 یکپارچه.",
    fullDescription:
      "چهارچوب‌های فلزی سپنتا بر اساس الگوهای مهندسی دقیق فرانسوی و مکزیکی با بهره‌گیری از ورق‌های روغنی نورد سرد فولاد مبارکه برش و فرم‌دهی می‌شوند. گوشه‌ها توسط سیستم‌های فارسی‌بر دقیق برش خورده و با جوش محافظ گاز CO2 بدون پلیسه متصل می‌گردند. تعبیه جا لولاهای استاندارد تقویتی و جای زبانه قفل با پانچ CNC، سرعت و کیفیت نصب درب‌ها را در مراحل نازک‌کاری به حداکثر می‌رساند.",
    image: "/images/product-metal-frame.jpg",
    priceUnit: "هر عدد",
    profileSpecs: [
      { label: "جنس ورق فولادی", value: "ورق نورد سرد St12 فولاد مبارکه اصفهان" },
      { label: "ضخامت ورق", value: "۲.۰ میلی‌متر استاندارد واقعی" },
      { label: "الگوی مقطع", value: "مقطع فرانسوی، رومی و مکزیکی کف ۱۲ تا ۱۶ سانتی‌متر" },
      { label: "نوع جوشکاری", value: "جوش پیوسته محافظ CO2 پرداخت‌شده با سمباده بادی" },
      { label: "پوشش اولیه", value: "ضدزنگ صنعتی کادمیومی ضد رطوبت" },
    ],
    warrantyYears: 25,
    budgetTier: "اقتصادی",
    idealUseCases: [
      "مرحله سفت‌کاری ساختمان‌های مسکونی، اداری و بیمارستانی",
      "پروژه‌های انبوه‌سازی نیازمند چهارچوب‌های کاملاً گونیا و تراز",
      "فضاهای نیازمند چهارچوب مقاوم در برابر ضربات سنگین تردد",
    ],
    technicalDiagramId: "diagram-steel-frame",
    configuratorAvailable: false,
    basePricePerSqmEstimated: {
      min: 1600000,
      max: 2900000,
    },
    features: [
      "گونیا و تراز بودن کامل اضلاع با دقت کمتر از ۱ میلی‌متر",
      "تجهیز به نوار ضربه‌گیر لاستیکی در محل نشست لنگه درب",
      "شاخک‌های نصب تقویتی جهت درگیری محکم با ملات ماسه‌سیمان و آجر",
      "مقاومت مطلق در برابر پوسیدگی و افت لولا در طول عمر ساختمان",
    ],
  },
];

/**
 * Returns a product by its slug or id.
 */
export function getProductBySlug(slug: string): ProductItem | undefined {
  return PRODUCTS.find((p) => p.slug === slug || p.id === slug);
}

/**
 * Returns all products belonging to a given cluster.
 */
export function getProductsByCluster(cluster: ProductClusterId): ProductItem[] {
  return PRODUCTS.filter((p) => p.cluster === cluster);
}

/**
 * Returns all products that support the live interactive configurator.
 */
export function getConfigurableProducts(): ProductItem[] {
  return PRODUCTS.filter((p) => p.configuratorAvailable);
}
