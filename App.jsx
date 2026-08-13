import { useState, useRef, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from './lib/supabaseClient';
import TenantAuthGate from './components/TenantAuthGate';

// Real photos & technical drawings extracted from the tenant-choices brochure
import stairsStandardImg from './assets/stairs_standard.jpg';
import stairsSawtoothImg from './assets/stairs_sawtooth.jpg';
import stairsLightweightImg from './assets/stairs_lightweight.jpg';

import railingVerticalImg from './assets/railing_vertical.jpg';
import railingBarcodeImg from './assets/railing_barcode.jpg';
import railingExpandedImg from './assets/railing_expanded.jpg';
import railingDrawingImg from './assets/railing_drawing.jpg';

import aluminumColorGreenGray from './assets/aluminum_color_greengray.jpg';
import aluminumColorOnyx from './assets/aluminum_color_onyx.jpg';
import aluminumColorGray from './assets/aluminum_color_gray.jpg';
import aluminumColorMeteorite from './assets/aluminum_color_meteorite.jpg';


import pergolaAluminumImg from './assets/pergola_aluminum.jpg';
import pergolaAlusteelImg from './assets/pergola_alusteel.jpg';
import pergolaDrawingImg from './assets/pergola_drawing.jpg';

import doorGardaImg from './assets/door_ext_garda.jpg';
import doorMinimalImg from './assets/door_ext_minimal.jpg';
import doorShacharImg from './assets/door_ext_shachar.jpg';

import doorIntAImg from './assets/door_int_a.jpg';
import doorIntBImg from './assets/door_int_b.jpg';
import doorIntCImg from './assets/door_int_c.jpg';

import pathConcreteNewImg from './assets/path_concrete_new.jpg';
import pathConcreteFinishedImg from './assets/path_concrete_finished.jpg';
import pathPaversImg from './assets/path_pavers.jpg';
import pathTravertineImg from './assets/path_travertine.jpg';


// Structured data constants for models, specifications, and prices.
// Prices and water/wind-tightness ratings (מדרג איטום רוח/מים) verified against the
// official "חוברת תוספות ומחירים" pricing sheet (July 2026 correction).
const ALUMINUM_MODELS = {
  sliding: [
    {
      id: 'model_7500',
      name: 'פרופיל 7500 (ויטרינה)',
      price: 1200,
      unit: 'מ"ר',
      rating: null,
      desc: 'נעילה רב נקודתית, ידית בלגי/אופיס, זיגוג 4–22 מ"מ.',
      fullSpec: '• פרזול: אפשרות נעילה רב נקודתית ונעילה בנקודה אחת. מבחר ידיות בסגנון בלגי, אופיס וקולקציית מעצבים.\n• זיגוג: זיגוג זכוכית עם סרגלי זיגוג ללא פרוק מסגרת הכנף.\n   - כנף הזזה: 4 עד 22 מ"מ זכוכית רגילה או בידודית.\n   - כנף מג\'יקליל: 4 עד 14 מ"מ זכוכית רגילה או בידודית.\n   - מסגרת קבועה: 4 עד 34 מ"מ זכוכית רגילה או בידודית.\n• רשת: שילוב כנף רשת הזזה השייכת לסדרה.\n• תריס: שילוב עם תריס רפפה / מערכת מונובלוק 10/30/40 / ארגז תריס סמוי "פירנצה".'
    },
    {
      id: 'model_7600',
      name: 'פרופיל 7600 (ויטרינה)',
      price: 2000,
      unit: 'מ"ר',
      rating: 'D',
      desc: 'אביזרים מקוריים, נעילה רב נקודתית, ידית באוהאוס, זיגוג 6–12 מ"מ.',
      fullSpec: '• פרזול, אביזרים וידיות: אביזרים מקוריים לסדרה. מנגנון נעילה רב נקודתי. מבחר ידיות בסגנון באוהאוס.\n• זיגוג, סוג זכוכית ועובי: 6 עד 12 מ"מ זכוכית רגילה (מונוליט) או זכוכית טריפלקס (רבודה) או רב שכבתית; 14 עד 28 מ"מ זכוכית בידודית.\n• רשת: רשת הזזה עם כנף זהה לכנף זיגוג, או רשת חדשנית עם מימד עומק קטן.\n• תריס: שילוב עם מערכת מונובלוק 30/40, או ארגז תריס סמוי "פירנצה" או רולבוקס.'
    },
    {
      id: 'model_2200',
      name: 'פרופיל 2200 (ויטרינה)',
      price: 2200,
      unit: 'מ"ר',
      rating: 'G',
      desc: 'ידיות בלגי/אופיס, גלגלים למשקל כבד, סרגל זיגוג.',
      fullSpec: '• פרזול: מבחר ידיות בסגנון בלגי אופיס וקולקציית מעצבים. גלגלים מיוחדים לנשיאת משקל כנף כבדה במיוחד. אביזרים יוקרתיים מהטובים בעולם. מנגנון נעילה נקודתי לכנף.\n• זיגוג: 6 עד 13 מ"מ זכוכית רגילה או שכבתית; 14 עד 47 מ"מ זכוכית בידודית; 37 עד 47 מ"מ זכוכית בידודית עם צלון פנימי. זיגוג זכוכית ע"י סרגל זיגוג המאפשר החלפת זכוכית ללא פירוק מסגרת הכנף.\n• רשת: ניתן לשלב רשת מקורית.\n• תריס: שילוב עם מערכת מונובלוק 10.'
    },
    {
      id: 'model_9400',
      name: 'פרופיל 9400 (ויטרינה)',
      price: 1800,
      unit: 'מ"ר',
      rating: 'H',
      desc: 'מנעול רב נקודתי, גודל כנף מקסימלי, רשת פליסה.',
      fullSpec: '• פרזול: אביזרים מקוריים לסדרה, מנגנון נעילה רב נקודתי.\n• גודל כנף מקסימלי: רוחב 180 ס"מ | גובה 280 ס"מ, או רוחב 160 ס"מ | גובה 300 ס"מ.\n• זיגוג: 6 עד 12 מ"מ זכוכית רגילה או רב שכבתית; 14 עד 24 מ"מ בידודית; 37 עד 45 מ"מ בידודית עם צלון מובנה.\n• רשת: רשת הזזה מקורית לסדרה. רשת פליסה - רשת מתקפלת הסמויה מהעין כאשר הכנף אסופה.\n• תריס: שילוב עם מערכת מונובלוק 30/40, או ארגז תריס סמוי "פירנצה" ו"רול בוקס".'
    }
  ],
  window: [
    {
      id: 'model_7000',
      name: 'פרופיל 7000 (חלון קבוע/הזזה)',
      price: 1300,
      unit: 'מ"ר',
      rating: 'G',
      desc: 'אביזרים מקוריים, זיגוג 3–11 מ"מ, מג\'קליל.',
      fullSpec: '• פרזול: אביזרים מקוריים לסדרה.\n• זיגוג: 3 עד 11 מ"מ זכוכית חד / רב שכבתית; 14 עד 18 מ"מ זכוכית בידודית.\n• מג\'יקליל: 4 עד 10 מ"מ זכוכית חד / רב שכבתית, או 14 מ"מ זכוכית בידודית.\n• רשת: רשת מקורית לסדרה או רשת בינונית.\n• תריס: שילוב עם תריס רפפה / מערכת מונובלוק 10/30/40 / ארגז תריס סמוי "פירנצה".'
    },
    {
      id: 'model_7500_window',
      name: 'פרופיל 7500 (חלון קבוע/הזזה)',
      price: 1300,
      unit: 'מ"ר',
      rating: 'E',
      desc: 'נעילה רב נקודתית, ידית בלגי/אופיס, זיגוג 4–22 מ"מ.',
      fullSpec: '• פרזול: אפשרות נעילה רב נקודתית ונעילה בנקודה אחת. מבחר ידיות בסגנון בלגי, אופיס וקולקציית מעצבים.\n• זיגוג: 4 עד 22 מ"מ זכוכית רגילה או בידודית (כנף הזזה); 4 עד 34 מ"מ במסגרת קבועה.\n• רשת: שילוב כנף רשת הזזה השייכת לסדרה.\n• תריס: שילוב עם תריס רפפה / מערכת מונובלוק 10/30/40 / ארגז תריס סמוי "פירנצה".'
    },
    {
      id: 'model_1600',
      name: 'פרופיל 1600 (חלון קבוע/הזזה)',
      price: 4800,
      unit: 'מ"ר',
      rating: 'C',
      desc: 'נעילה רב נקודתית, ידית מינימליסטית, רשת צרה.',
      fullSpec: '• פרזול: אביזרים מקוריים לסדרה. מנגנון נעילה רב נקודתי. ידית מעוצבת מינימליסטית.\n• זיגוג: 6 עד 18 מ"מ זכוכית מונוליטית / רב שכבתית או בידודית.\n• רשת: הזזה ייחודית לסדרה עם פרופילים צרים במיוחד.\n• תריס: שילוב מערכת ארגז סמוי.'
    }
  ],
  door: [
    {
      id: 'model_5500',
      name: 'פרופיל 5500 (דלת כנף)',
      price: 4200,
      unit: 'קומפלט',
      rating: 'H',
      desc: 'ידיות בלגי BASIC, צלון פנימי, שילוב תריס גלילה.',
      fullSpec: '• פרזול: אביזרים מקוריים לסדרה. מבחר ידיות בסגנון בלגי BASIC וקולקציית מעצבים.\n• זיגוג: זיגוג רגיל או רב שכבתי בעובי 4 עד 13 מ"מ; זיגוג בידודי בעובי 14 עד 32 מ"מ ו-37 עד 40 מ"מ; זיגוג בידודי עם צלון פנימי חשמלי או ידני.\n• רשת: שילוב עם רשת קבועה / נשלפת.\n• תריס: שילוב עם תריס גלילה / כפפה, מערכת מונובלוק 30/40, תריס 1300, או ארגז תריס סמוי "פירנצה".'
    },
    {
      id: 'model_4350',
      name: 'פרופיל 4350 (דלת כנף)',
      price: 4000,
      unit: 'קומפלט',
      rating: 'C',
      desc: 'דלת ציר במפרט בסיסי איכותי.',
      fullSpec: '• דלת כנף/ציר מאלומיניום מחוזק, במפרט בסיסי איכותי.\n• מתאימה ליציאה למרפסות שירות או חצרות אחוריות.\n• אביזרי נעילה סטנדרטיים ואיטום גומי כפול.'
    },
    {
      id: 'model_5600',
      name: 'פרופיל 5600 (דלת כנף)',
      price: 6000,
      unit: 'קומפלט',
      rating: '+H',
      desc: 'ידית מינימליסטית, רשת פליסה, תריס נפתח החוצה.',
      fullSpec: '• פרזול: אביזרים מקוריים לסדרה. מנגנון נעילה רב נקודתי. ידית מעוצבת מינימליסטית.\n• זיגוג: מ-4 עד 24 מ"מ זכוכית רגילה או בידודית.\n• רשת: שילוב עם רשת קבועה קלה לשליפה, רשת פליסה מתקפלת, או דלת רשת על ציר - קליל בלגי רשת 1300.\n• תריס: שילוב עם מערכת מונובלוק 30/40, או תריס בלגי קליל 1300 (תריס רפפה נפתח על ציר החוצה), או ארגז תריס סמוי "פירנצה" ו"רול בוקס".'
    }
  ]
};

const STAIRS_OPTIONS = [
  { id: 1, name: 'מדרגות סטנדרטיות (בטון, תחתית חלקה)', price: 0, desc: 'מדרגות בטון יצוקות בעלות תחתית ישרה חלקה. כלול במפרט ללא תוספת עלות.', image: stairsStandardImg },
  { id: 2, name: 'מדרגות משוננות (בטון, תחתית משוננת)', price: 15000, desc: 'מדרגות בטון מעוצבות שבהן גם החלק התחתון בנוי בצורה משוננת המלווה את שלבי המדרגות. מראה עיצובי מודרני.', image: stairsSawtoothImg },
  { id: 3, name: 'מדרגות קלות (קונסטרוקציה + עץ גושני)', price: 45000, desc: 'מדרגות קלות ומרחפות המבוססות על קונסטרוקציית פלדה כבדה ומדרכי עץ גושני יוקרתי, למראה אוורירי ופתוח.', image: stairsLightweightImg }
];

// Item 4: villas 1, 2, 4, 9, 20, 21 are single-story (קומה אחת) — the entire stairs step is
// hidden for them. A "כמות גרמים לפי מפלסים" quantity option is meant for 3 specific two-story
// villas only; those 3 numbers weren't specified, so for now the field shows for every villa
// where stairs are relevant (i.e. not single-story) — narrow this list once Ido confirms it.
const SINGLE_STORY_VILLAS = [1, 2, 4, 9, 20, 21];
const STAIRS_FLIGHT_QTY_VILLAS = null; // TODO: e.g. [6, 11, 22] once confirmed — null = show for all multi-story villas

// Prices per linear meter (מ"א), verified against הסכם עבודות קבלניות נופיה, סעיף 3.1.7 (עמ' 113):
// ברקוד +320/מ"א, אקספנדד +650/מ"א, שניהם לפני מע"מ.
const RAILINGS_OPTIONS = [
  { id: 1, name: 'מעקה אנכי (סטנדרטי)', price: 0, unit: 'מ"א', desc: 'מעקה ברזל בעל שלבים אנכיים פשוטים ונקיים. מותקן בגוון שחור. כלול בסטנדרט.', image: railingVerticalImg },
  { id: 2, name: 'מעקה ברקוד (משודרג)', price: 320, unit: 'מ"א', desc: 'מעקה ברזל מעוצב במרווחים משתנים דמויי קוד ברקוד מודרני. מראה ייחודי ומתוחכם.', image: railingBarcodeImg },
  { id: 3, name: 'מעקה אקספנדד (פרימיום)', price: 650, unit: 'מ"א', desc: 'מעקה פח רשת מתוח (Expanded Metal) יוקרתי. בידוד ויזואלי קל ומראה תעשייתי יוקרתי.', image: railingExpandedImg }
];

// Real RAL-coded color options for railings (item 5). No brochure photos exist for these
// specific codes, so each is shown as a solid color swatch (like the interior-door color dots).
const RAILING_COLORS = [
  { name: 'שחור', code: 'RAL 9005', hex: '#0a0a0a' },
  { name: 'לבן', code: 'RAL 9003', hex: '#f4f4f2' },
  { name: 'אפור בהיר', code: 'RAL 9006', hex: '#a5a5a5' },
  { name: 'אפור כהה', code: 'RAL 9007', hex: '#8f8a86' },
  { name: 'שמנת', code: 'RAL 1013', hex: '#e9e2c9' }
];

// Verified against הסכם עבודות קבלניות נופיה, סעיף 3.1.8 (עמ' 113): הפרגולה הימנית (אלומיניום)
// היא הסטנדרט הכלול; פרגולה שמאלית (פלדה עם מרישי אלומיניום) בתוספת 550 ₪/מ"ר לפני מע"מ.
const PERGOLA_OPTIONS = [
  { id: 1, name: 'פרגולת אלומיניום — ימנית (סטנדרט)', price: 0, unit: 'מ"ר', desc: 'פרגולה עשויה שלדות אלומיניום מחוזקות, עמידות מקסימלית למים ולשמש. כלולה בסטנדרט.', image: pergolaAluminumImg },
  { id: 2, name: 'פלדה עם מרישי אלומיניום — שמאלית (משודרג)', price: 550, unit: 'מ"ר', desc: 'פרגולת פלדה יוקרתית עם מרישי אלומיניום לעמידות מוגברת ומפתחים רחבים במיוחד.', image: pergolaAlusteelImg }
];

// Flat price per unit from "חוברת תוספות ומחירים.xlsx" (שדרוג דלת כניסה חוץ) — applies
// equally to all three models since the brochure doesn't price them individually.
// Verified pricing (item 8): גארדה = סטנדרט ללא עלות, מינימאל (רב-בריח) +1,250 ₪+מע"מ,
// שחר +750 ₪+מע"מ. contactName/contactPhone are placeholders for the supplier rep per door —
// fill in via the coordinator/admin panel once received.
const EXT_DOORS_OPTIONS = [
  {
    id: 1,
    name: 'דלת חוץ דגם גארדה (סטנדרטי)',
    price: 0,
    contactName: '',
    contactPhone: '',
    desc: 'דלת פלדה דגם גארדה. מוצגת בגוון אפור בטון גובה 260 ס"מ.',
    image: doorGardaImg,
    fullSpec: '• סוגר נעילה: מעניק ביטחון מוגבר ע"י נעילה נוספת.\n• SMART™: הדלת ניתנת לשדרוג לדלת חכמה הנשלטת ע"י אפליקציה, טביעת אצבע או קוד, עם מנגנון אינטגרלי חבוי ואישור הלכתי ממכון צומת.\n• דלת פלדה העשויה פלדה המצטיינת בחוזק ובהגנה על הבית.\n• עמידה בתנאי חוץ: צביעה אלקטרוסטטית המתאימה לתנאי חוץ ולבתים פרטיים.\n• מידות: ניתנת להזמנה כדלת בודדת, דלת וחצי או דלת כפולה.\n• שדרוג: ניתנת להזמנה עם משקוף בקו אפס עם הקיר וצירים סמויים.\n• דלת כניסה דגם גארדה מוצגת בגוון אפור בטון בגובה 260 ס"מ, דלת מבוצעת בסגנון תעשייתי מודרני.\n• דלת פלדה מגולוונת בגמר צבע ממנפחת הגוונים, צירי פייפ או צירי HEAVY DUTY מוסתרים (בתוספת תשלום). עובי הדלת 1.25 מ"מ עם חיזוקי פלדה ואורך ורוחב פנימיים בעלי הפחתת רעש DB30. עובי דלת 50 מ"מ, משקל הדלת כ-50 ק"ג. הדלת מסופקת עם גומי איטום היקפי, אינסרט תחתון טלסקופי לשליטה על גובה הדלת ומברשת תחתונה. משקוף בניה מפלדה מגולוונת בעובי 1.5 מ"מ המבוטן לקיר, או משקוף כיסוי המותקן על גבי משקוף קיים.\n• ניתן להזמין כמשקוף בקו הקיר (קו אפס).\n• בשילוב פסים שקועים לרוחב במעטה החיצוני.\n• דגמי חריצה: בגוונים בהירים החריץ בולט פחות מאשר בגוונים כהים.\n• לוזרפ ועזרים: לוזרפ מעוצב בגמר ניקל מדגם "קורל", מגן צילינדר מפלדה מסוחמת מוגנת פריצה, מנעול רב-בריחי וצילינדר לוקסיס תוצרת רב-בריח. בריח תחתון (מנגנון תגבור) צידי להגברת רמת הביטחון, מעצור ליפסקי בגוון טבעי (כסף), רגל ביטחון (בדלתות הנפתחות לתוך הבית בלבד), עינית הצצה טלסקופית.\n• רוחב דלת: 580–1,200 מ"מ.\n• גובה דלת: 1,890–2,400 מ"מ.'
  },
  {
    id: 2,
    name: 'דלת חוץ דגם מינימאל — רב-בריח (משודרג)',
    price: 1250,
    contactName: '',
    contactPhone: '',
    desc: 'דלת חוץ מעוצבת בקו נקי מינימליסטי ויוקרתי, מבית רב-בריח.',
    image: doorMinimalImg,
    fullSpec: '• סוגר נעילה: מעניק ביטחון מוגבר ע"י נעילה נוספת.\n• SMART™: הדלת ניתנת לשדרוג לדלת חכמה הנשלטת ע"י אפליקציה, טביעת אצבע או קוד, עם מנגנון אינטגרלי חבוי ואישור הלכתי ממכון צומת.\n• דלת פלדה המצטיינת בחוזק ובהגנה על הבית, עמידה בתנאי חוץ (צביעה אלקטרוסטטית) המתאימה לבתים פרטיים.\n• מידות: ניתנת להזמנה כדלת בודדת, דלת וחצי או דלת כפולה.\n• דלת פלדה מגולוונת בגמר צבע ממנפחת הגוונים, צירי HEAVY DUTY מוסתרים (בתוספת תשלום). עובי הדלת 1.25 מ"מ עם חיזוקי פלדה, עובי דלת 50 מ"מ DB30, משקל כ-50 ק"ג, גומי איטום היקפי ואינסרט תחתון טלסקופי.\n• לוזרפ ועזרים: לוזרפ מעוצב בגמר ניקל מדגם "קורל", מגן צילינדר מוגן פריצה, מנעול רב-בריחי וצילינדר לוקסיס, בריח תחתון (מנגנון תגבור), מעצור ליפסקי, עינית הצצה טלסקופית.\n• מראה חלק ללא חלוקות או קישוטים, מתאימה לעיצוב קירות חלקים.\n• רוחב דלת: 580–1,200 מ"מ.\n• גובה דלת: 1,890–2,400 מ"מ.'
  },
  {
    id: 3,
    name: 'דלת חוץ דגם שחר (משודרג)',
    price: 750,
    contactName: '',
    contactPhone: '',
    desc: 'דלת חוץ מעוצבת דגם שחר בעלת חלוקות רוחביות.',
    image: doorShacharImg,
    fullSpec: '• סוגר נעילה: מעניק ביטחון מוגבר ע"י נעילה נוספת.\n• SMART™: הדלת ניתנת לשדרוג לדלת חכמה הנשלטת ע"י אפליקציה, טביעת אצבע או קוד, עם מנגנון אינטגרלי חבוי ואישור הלכתי ממכון צומת.\n• דלת פלדה המצטיינת בחוזק ובהגנה על הבית, עמידה בתנאי חוץ המתאימה לבתים פרטיים.\n• מידות: ניתנת להזמנה כדלת בודדת, דלת וחצי או דלת כפולה.\n• שדרוג: ניתנת להזמנה עם משקוף בקו אפס עם הקיר וצירים סמויים.\n• דלת כניסה דגם שחר מוצגת בגוון אפור בטון בגובה 260 ס"מ.\n• דלת פלדה מגולוונת בגמר צבע ממנפחת הגוונים, צירי פייפ או HEAVY DUTY מוסתרים (בתוספת תשלום). עובי 1.25 מ"מ עם חיזוקי פלדה, עובי דלת 50 מ"מ DB30, משקל כ-50 ק"ג, גומי איטום היקפי ואינסרט תחתון טלסקופי. משקוף בניה מפלדה מגולוונת בעובי 1.5 מ"מ מבוטן לקיר, או משקוף כיסוי על גבי משקוף קיים.\n• ניתן להזמין כמשקוף בקו הקיר (קו אפס).\n• בשילוב פסים שקועים לרוחב במעטה החיצוני.\n• לוזרפ ועזרים: לוזרפ מעוצב בגמר ניקל מדגם "קורל", מגן צילינדר מוגן פריצה, מנעול רב-בריחי וצילינדר לוקסיס, בריח תחתון (מנגנון תגבור), מעצור ליפסקי, עינית הצצה טלסקופית.\n• רוחב דלת: 460–1,200 מ"מ.\n• גובה דלת: 1,890–2,310 מ"מ.'
  }
];

// Supplier for all interior doors is חמדיה (Hamadia Group). Pricing model (item 9): option A
// (אקוודור נאפולי) is the included standard; B/C/D are per-unit ADD-ONS on top of it, applied
// per door in the villa's total door count — not per dry/wet room as before.
const INT_DOORS_OPTIONS = [
  {
    id: 'A',
    name: 'אופציה א\' - סטנדרט (אקוודור נאפולי, פורמייקה)',
    price: 0,
    colors: ['לבן', 'שמנת', 'אגוז', 'אלון מולבן לאורך'],
    supplier: 'חמדיה',
    desc: 'דלת איכותית מחופה פורמייקה 2 מ"מ מבית חמדיה. כלולה בסטנדרט, ללא תוספת מחיר.',
    image: doorIntAImg,
    fullSpec: '• מילוי פנימי: פלקסבורד (Flexboard) מבודד רעשים.\n• ציפוי כנף: פורמייקה עבה 2 מ"מ עמידה בפני שריטות.\n• משקופים והלבשות: WPC עמיד מים (7 ס"מ) בתחתית.\n• אביזרים: ידית "בולוניה", מנעול מגנטי שקט, מעצור דלת מובנה.\n• חדרי שינה: כולל מנעול תפוס-פנוי והתקנה.\n• חדרים רטובים: כולל מנעול תפוס-פנוי, צוהר מעוצב והתקנה.'
  },
  {
    id: 'B',
    name: 'אופציה ב\' - דרים קולור (שלייפלק)',
    price: 480,
    colors: ['שלייפלק לבן', 'שלייפלק שמנת'],
    supplier: 'חמדיה',
    desc: 'דלת בצביעה אטומה איכותית (שלייפלק בתנור) מבית חמדיה. תוספת 480 ₪ ליחידה.',
    image: doorIntBImg,
    fullSpec: '• מילוי פנימי: פלקסבורד (Flexboard) אקוסטי.\n• גימור: צבע שלייפלק מטאלי בתנור בעל מראה חלק ומבריק.\n• משקופים והלבשות: WPC עמיד מים (7 ס"מ).\n• אביזרים: ידית "בולוניה", מנעול מגנטי שקט, מעצור דלת.\n• חדרי שינה: כולל מנעול תפוס-פנוי והתקנה.\n• חדרים רטובים: כולל מנעול תפוס-פנוי, צוהר מעל הידית והתקנה.'
  },
  {
    id: 'C',
    name: 'אופציה ג\' - אקוודור עם משקוף והלבשות קו אפס',
    price: 3250,
    colors: ['לבן', 'שמנת'],
    supplier: 'חמדיה',
    desc: 'משקוף והלבשות נסתרים בקו הקיר, צירים סמויים. תוספת 3,250 ₪ ליחידה.',
    image: doorIntCImg,
    fullSpec: '• משקוף והלבשות נסתרים המותקנים בקו אחד עם הקיר (קו אפס).\n• צירים סמויים מתכווננים.\n• כנף דלת שלייפלק (דגם נאפולי) עם מילוי פלקסבורד.\n• אביזרים: ידית "בולוניה" יוקרתית, מנעול מגנטי, מעצור דלת.\n• חדרי שינה: כולל מנעול תפוס-פנוי והתקנה.\n• חדרים רטובים: כולל מנעול תפוס-פנוי, צוהר מעל הידית והתקנה.\n\n⚠ הערת מפתחים חשובה: דלתות קו אפס מצריכות הגדלת פתחי הבנייה ב-5 ס"מ בהתאם לתקן חמדיה.'
  },
  {
    id: 'D',
    name: 'אופציה ד\' - דלת כיס',
    price: 3500,
    colors: [],
    supplier: 'חמדיה',
    desc: 'דלת הזזה שקועה בתוך הקיר (דלת כיס). תוספת 3,500 ₪ ליחידה.',
    image: null,
    fullSpec: '• דלת כיס (הזזה תוך-קירית) מבית חמדיה.\n• דורשת מחיצת גבס עם פס כיס ייעודי — יש לתאם עם מתאמת השינויים לפני ביצוע עבודות המחיצות.\n• גימור כנף ואביזרים בהתאם לדגם הבסיס שנבחר (אופציה א\'-ג\').\n• תוספת 3,500 ₪ ליחידה, מעבר למחיר הדלת הבסיסית.'
  }
];

// ממ"ד (safe room) doors use a standard steel/concrete leaf. Adding a wood leaf on top of the
// mandatory מ"ד-approved leaf costs a flat 1,000 ₪ per door (item 9).
const MAMAD_WOOD_LEAF_PRICE = 1000;

// Underfloor heating (item 10). Verified against הסכם עבודות קבלניות נופיה, סעיף 3.1.9 (עמ' 113):
// הכנה בלבד (תשתית על בסיס מים) בתוספת 250 ₪/מ"ר לפני מע"מ. הכמות במ"ר ניתנת לעדכון ע"י
// מתאמת שינויי הדיירים בלבד.
const UNDERFLOOR_HEATING_PRICE_PER_SQM = 250;

// Aircon (Tadiran) lump-sum prices per villa, verified against הסכם עבודות קבלניות נופיה,
// סעיף 3.1.10 (עמ' 113-114) — מחיר פאושל לא כולל מע"מ. וילה 1 חסרה בטבלת ההסכם המקורית ודורשת
// השלמה ע"י מתאמת השינויים.
const AIRCON_PRICING = {
  1: null,
  2: 44769, 3: 67076, 4: 38181, 5: 54059, 6: 89820, 7: 68500, 8: 44768, 9: 46430, 10: 60081,
  11: 98870, 12: 77908, 13: 101334, 14: 57748, 15: 82065, 16: 76646, 17: 79118, 18: 79339,
  19: 65318, 20: 42431, 21: 35337, 22: 107679, 23: 108822, 24: 98460
};

// Premium options (3 & 4) priced per sqm from "חוברת תוספות ומחירים.xlsx" (שבילי פיתוח
// וריצוף חוץ) — the two standard options stay included/₪0 regardless of area.
const PATH_OPTIONS = [
  { id: 1, name: 'יציקת שביל כניסה – בטון מסורק (סטנדרט)', price: 0, desc: 'יציקת בטון בגימור מסורק למניעת החלקה. כלול במפרט ללא עלות נוספת.', image: pathConcreteNewImg },
  { id: 2, name: 'ריצוף משתלבות – אבן הרובע אומבריאנו (סטנדרט)', price: 0, desc: 'ריצוף אבנים משתלבות מבית אומבריאנו. בחירה וגוון סופי ייקבעו בהמשך מול ספק הכלים הסניטריים.', image: pathPaversImg },
  { id: 3, name: 'ריצוף השביל בתיאום משטחים תחת פרגולה (משודרג)', price: 350, unit: 'מ"ר', desc: 'ריצוף שביל כניסה בהמשכיות ושלמות עיצובית עם משטח הפרגולה.', image: pathTravertineImg },
  { id: 4, name: 'יציקת שביל כניסה – בטון מוחלק (פרימיום)', price: 350, unit: 'מ"ר', desc: 'יציקת בטון פרימיום בגימור מוחלק ומלוטש למראה מודרני מבריק.', image: pathConcreteFinishedImg }
];

// Real profile colour swatches (from the brochure's colour chart, page 5).
// Note: color codes are transcribed from the printed brochure table — please double-check
// against the physical/PDF brochure before finalizing, the table layout was hard to parse.
const ALUMINUM_COLORS = [
  { name: 'ירוק אפור 281', code: 'I28', image: aluminumColorGreenGray },
  { name: 'שחור אוניקס', code: 'IRON I66', image: aluminumColorOnyx },
  { name: 'אפור', code: 'FINE IRON 602', image: aluminumColorGray },
  { name: 'Meteorite', code: 'Meteorite Haze 31F', image: aluminumColorMeteorite }
];

// Blinds/louvers (רפפות/צלונים) only offer 2 of the 4 profile colours per the brochure
const BLINDS_COLORS = [
  { name: 'אפור', code: 'Anodized Alloy 49F', image: aluminumColorGray },
  { name: 'Meteorite', code: 'Meteorite Haze 31F', image: aluminumColorMeteorite }
];

// Item 7 (updated live by Ido): the exterior-plaster color picker is removed entirely — there
// is no tenant color choice for the base plaster. The only tenant-facing item here is the
// optional Peles thermal render (שליכט תרמי) add-on.
const PLASTER_THERMAL_RENDER_PRICE = 3500;
const PLASTER_THERMAL_RENDER_VIDEO_NOTE = 'הסרטון המדגים את השליכט התרמי של פלס נמצא בתיקיית שינויי הדיירים של הפרויקט — יש לפנות למתאמת השינויים לקישור הצפייה.';

// Prices from "חוברת תוספות ומחירים.xlsx": row 15 (תוספות חשמל, נק' מאור/שקע) covers both
// light and power points at one price; row 16 (תוספות אינסטלציה, נק' מים/ניקוז) covers water.
const ELECTRICITY_POINT_TYPES = [
  { id: 'light', name: 'העתקת נקודת מאור', price: 250 },
  { id: 'water', name: 'העתקת נקודת מים', price: 450 },
  { id: 'power', name: 'הוספת נקודת חשמל', price: 250 }
];

// Local draft persistence: keeps the tenant's in-progress selections across page refreshes.
// Only selections/navigation are saved — the confirmation checkbox and signature always
// require a fresh action so a stale reload can never be mistaken for final approval.
const DRAFT_STORAGE_KEY = 'nofia_tenant_draft_v1';

function loadSavedDraft() {
  try {
    const raw = window.localStorage.getItem(DRAFT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function clearSavedDraft() {
  try {
    window.localStorage.removeItem(DRAFT_STORAGE_KEY);
  } catch {
    // ignore storage errors (e.g. private browsing)
  }
}

// Item 15: שערים וגדרות removed entirely. Item 7: טיח חוץ repurposed into a small thermal-render
// add-on step. Items 10 & 11: two new steps (חימום תת רצפתי, מיזוג אוויר) before the electric
// step, which item 12 renames. LAST_STEP_ID is used everywhere instead of a hardcoded number.
const STEPS = [
  { id: 0, label: 'ברוכים הבאים', icon: '👋' },
  { id: 1, label: 'הסבר כללי', icon: '📝' },
  { id: 2, label: 'אישור תכניות', icon: '📐' },
  { id: 3, label: 'אלומיניום', icon: '🖼️' },
  { id: 4, label: 'מדרגות', icon: '🪜' },
  { id: 5, label: 'מעקות', icon: '⛓️' },
  { id: 6, label: 'מטבח', icon: '🍳' },
  { id: 7, label: 'תוספת טיח', icon: '🎨' },
  { id: 8, label: 'פרגולה', icon: '⛱️' },
  { id: 9, label: 'דלתות חוץ', icon: '🚪' },
  { id: 10, label: 'דלתות פנים', icon: '🚪' },
  { id: 11, label: 'שביל כניסה', icon: '🛣️' },
  { id: 12, label: 'חימום תת רצפתי', icon: '🔥' },
  { id: 13, label: 'מיזוג אוויר', icon: '❄️' },
  { id: 14, label: 'שינויי חשמל אינסטלציה ובינוי', icon: '🔌' },
  { id: 15, label: 'סיכום וחתימה', icon: '✍️' }
];
const LAST_STEP_ID = STEPS[STEPS.length - 1].id;

export default function App() {
  // Restore any in-progress draft saved locally so a refresh doesn't lose selections
  const saved = loadSavedDraft();

  // Item 1 & 3: a "?coordinator=<villaNumber>" URL (opened from the admin panel's "עריכה" button
  // per villa) puts the wizard in full-edit coordinator mode for that villa, loading its saved
  // selections from Supabase. Regular tenants never see this — they log in via TenantAuthGate.
  const coordinatorVillaParam = new URLSearchParams(window.location.search).get('coordinator');
  const [isCoordinator] = useState(() => Boolean(coordinatorVillaParam));
  const [coordinatorLoadStatus, setCoordinatorLoadStatus] = useState(() => coordinatorVillaParam ? 'loading' : 'idle'); // loading | ready | error

  // Global States
  const [villaNumber, setVillaNumber] = useState(() => coordinatorVillaParam ?? saved.villaNumber ?? '14');
  const [tenantName, setTenantName] = useState(() => saved.tenantName ?? 'ישראל ישראלי');
  const [isLoggedIn, setIsLoggedIn] = useState(() => Boolean(coordinatorVillaParam) || (saved.isLoggedIn ?? false));
  const [currentStep, setCurrentStep] = useState(() => coordinatorVillaParam ? 1 : (saved.currentStep ?? 0));

  // Form selections state
  const [aluminum, setAluminum] = useState(() => saved.aluminum ?? {
    selectedSliding: 'model_7500',
    slidingQty: 10,
    selectedWindow: 'model_7000',
    windowQty: 5,
    selectedDoor: 'model_5500',
    doorQty: 1,
    profileColor: 'ירוק אפור 281',
    blindsColor: 'אפור'
  });

  const [stairs, setStairs] = useState(() => saved.stairs ?? 1); // STAIRS_OPTIONS ID
  const [stairsFlightQty, setStairsFlightQty] = useState(() => saved.stairsFlightQty ?? 1); // גרמים לפי מפלסים

  const [railings, setRailings] = useState(() => saved.railings ?? 1); // RAILINGS_OPTIONS ID
  const [railingsQty, setRailingsQty] = useState(() => saved.railingsQty ?? 12); // מ"א
  const [railingsColor, setRailingsColor] = useState(() => saved.railingsColor ?? 'שחור');

  // Item 6: kitchen — plan approval, color, and cost (no standard price list was supplied,
  // so cost is entered/edited by the coordinator once quoted with the kitchen supplier).
  const [kitchen, setKitchen] = useState(() => saved.kitchen ?? { planApproved: false, color: '', cost: 0 });

  // Item 7: plaster color picker removed; only the optional Peles thermal render add-on remains.
  const [plasterThermalRender, setPlasterThermalRender] = useState(() => saved.plasterThermalRender ?? false);

  const [pergola, setPergola] = useState(() => saved.pergola ?? 1); // PERGOLA_OPTIONS ID
  const [pergolaQty, setPergolaQty] = useState(() => saved.pergolaQty ?? 20); // sqm
  const [extDoor, setExtDoor] = useState(() => saved.extDoor ?? 1); // EXT_DOORS_OPTIONS ID

  // Item 9: flat per-unit pricing, one total door count for the villa instead of dry/wet split.
  const [intDoor, setIntDoor] = useState(() => saved.intDoor ?? {
    selectedOption: 'A', // INT_DOORS_OPTIONS ID ('A', 'B', 'C', 'D')
    doorCount: 7,
    color: 'לבן',
    mamadWoodLeaf: false,
    mamadWoodLeafQty: 1
  });

  const [path, setPath] = useState(() => saved.path ?? 1); // PATH_OPTIONS ID
  const [pathQty, setPathQty] = useState(() => saved.pathQty ?? 40); // sqm, only relevant for priced (premium) options

  // Item 10: underfloor heating (water-based infra only). sqm is editable by the coordinator only.
  const [underfloorHeating, setUnderfloorHeating] = useState(() => saved.underfloorHeating ?? { selected: false, sqm: 0 });

  // Item 11: aircon opt-out. When true the tenant declines the contractor's Tadiran package.
  const [airconOptOut, setAirconOptOut] = useState(() => saved.airconOptOut ?? false);

  // Item 14: free-text notes per step, shown grouped by section on the summary page after signing.
  const [stepNotes, setStepNotes] = useState(() => saved.stepNotes ?? {});

  // Each point type holds an array of individual points, one note field per point,
  // so a tenant adding 3 power points can describe the location of each one separately.
  // Guard against an old saved draft (from before this structure existed) that would
  // be missing the `points` object and break every point button.
  const [electricity, setElectricity] = useState(() => {
    const fallback = { hasChanges: true, points: { light: [], water: [], power: [] } };
    const s = saved.electricity;
    if (!s || !s.points || typeof s.points !== 'object') return fallback;
    return {
      hasChanges: s.hasChanges ?? true,
      points: {
        light: Array.isArray(s.points.light) ? s.points.light : [],
        water: Array.isArray(s.points.water) ? s.points.water : [],
        power: Array.isArray(s.points.power) ? s.points.power : []
      }
    };
  });

  // Verification & Sign States
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Modal State for Drill-Down technical details
  const [activeModal, setActiveModal] = useState(null); // { title, content, image }

  // Lightbox state for full-size image viewing
  const [lightboxImage, setLightboxImage] = useState(null); // { src, alt }

  const openLightbox = (e, src, alt) => {
    e.stopPropagation();
    if (!src) return;
    setLightboxImage({ src, alt });
  };

  // Canvas Drawing Pad References
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Autosave the draft (selections + navigation) on every change so a refresh never loses progress
  useEffect(() => {
    if (isSubmitted) return;
    const draft = {
      villaNumber, tenantName, isLoggedIn, currentStep,
      aluminum, stairs, stairsFlightQty, railings, railingsQty, railingsColor, kitchen, plasterThermalRender,
      pergola, pergolaQty, extDoor, intDoor, path, pathQty, underfloorHeating, airconOptOut, stepNotes, electricity
    };
    try {
      window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    } catch {
      // ignore storage errors (e.g. private browsing / quota)
    }
  }, [
    isSubmitted, villaNumber, tenantName, isLoggedIn, currentStep,
    aluminum, stairs, stairsFlightQty, railings, railingsQty, railingsColor, kitchen, plasterThermalRender,
    pergola, pergolaQty, extDoor, intDoor, path, pathQty, underfloorHeating, airconOptOut, stepNotes, electricity
  ]);

  // Item 4: villas 1,2,4,9,20,21 are single-story — stairs step (id 3) is hidden entirely.
  const isSingleStoryVilla = SINGLE_STORY_VILLAS.includes(Number(villaNumber));
  const visibleSteps = STEPS.filter(s => !(s.id === 4 && isSingleStoryVilla));
  const showStairsFlightQty = !isSingleStoryVilla && (STAIRS_FLIGHT_QTY_VILLAS === null || STAIRS_FLIGHT_QTY_VILLAS.includes(Number(villaNumber)));

  // Item 1: tenants can only look (not touch) until the final signature page. Coordinators
  // always have full edit access, on every step, for any villa.
  // currentStep >= 2 guards the login screen (0) and the intro screen (1, which only has a
  // "continue" button) from ever being locked, even if isLoggedIn is unexpectedly true there
  // (e.g. a stale localStorage draft) — otherwise a tenant could get stuck unable to click anything.
  const viewOnly = isLoggedIn && !isCoordinator && currentStep >= 2 && currentStep !== LAST_STEP_ID;

  // Coordinator mode: pull this villa's previously-saved selections (if any) from Supabase and
  // apply them to every piece of state, so the coordinator picks up exactly where the tenant
  // (or a previous coordinator session) left off.
  useEffect(() => {
    if (!coordinatorVillaParam || !isSupabaseConfigured) return;
    (async () => {
      const { data, error } = await supabase
        .from('villas')
        .select('tenant_name, selections')
        .eq('villa_number', Number(coordinatorVillaParam))
        .maybeSingle();
      if (error || !data) {
        setCoordinatorLoadStatus('error');
        return;
      }
      setTenantName(data.tenant_name ?? '');
      const s = data.selections;
      if (s && typeof s === 'object') {
        if (s.aluminum) setAluminum(s.aluminum);
        if (s.stairs !== undefined) setStairs(s.stairs);
        if (s.stairsFlightQty !== undefined) setStairsFlightQty(s.stairsFlightQty);
        if (s.railings !== undefined) setRailings(s.railings);
        if (s.railingsQty !== undefined) setRailingsQty(s.railingsQty);
        if (s.railingsColor) setRailingsColor(s.railingsColor);
        if (s.kitchen) setKitchen(s.kitchen);
        if (s.plasterThermalRender !== undefined) setPlasterThermalRender(s.plasterThermalRender);
        if (s.pergola !== undefined) setPergola(s.pergola);
        if (s.pergolaQty !== undefined) setPergolaQty(s.pergolaQty);
        if (s.extDoor !== undefined) setExtDoor(s.extDoor);
        if (s.intDoor) setIntDoor(s.intDoor);
        if (s.path !== undefined) setPath(s.path);
        if (s.pathQty !== undefined) setPathQty(s.pathQty);
        if (s.underfloorHeating) setUnderfloorHeating(s.underfloorHeating);
        if (s.airconOptOut !== undefined) setAirconOptOut(s.airconOptOut);
        if (s.stepNotes) setStepNotes(s.stepNotes);
        if (s.electricity) setElectricity(s.electricity);
      }
      setCoordinatorLoadStatus('ready');
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coordinatorVillaParam]);

  // Item 2: fetch this villa's plan share-links (external URLs managed by admin/coordinator)
  // fresh from Supabase whenever the logged-in villa changes — always live, not from the local draft.
  const [planLinks, setPlanLinks] = useState({});
  useEffect(() => {
    if (!isLoggedIn || !isSupabaseConfigured || !villaNumber) return;
    (async () => {
      const { data } = await supabase
        .from('villas')
        .select('plan_links')
        .eq('villa_number', Number(villaNumber))
        .maybeSingle();
      setPlanLinks(data?.plan_links ?? {});
    })();
  }, [isLoggedIn, villaNumber]);

  // Coordinator-only: save progress to Supabase at any point, without needing signature/submit.
  const handleCoordinatorSave = async () => {
    if (!isSupabaseConfigured) return;
    const selections = {
      aluminum, stairs, stairsFlightQty, railings, railingsQty, railingsColor, kitchen, plasterThermalRender,
      pergola, pergolaQty, extDoor, intDoor, path, pathQty, underfloorHeating, airconOptOut, stepNotes, electricity
    };
    await supabase.from('villas').update({ selections }).eq('villa_number', Number(villaNumber));
  };

  // Reset signature confirmation when step changes
  useEffect(() => {
    if (currentStep === LAST_STEP_ID) {
      const timer = setTimeout(() => {
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          ctx.strokeStyle = '#1F2A24';
          ctx.lineWidth = 3;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  // Handle interior door option change to set a default color from that option
  const handleIntDoorOptionChange = (optionId) => {
    if (viewOnly) return;
    const option = INT_DOORS_OPTIONS.find(o => o.id === optionId);
    setIntDoor({
      ...intDoor,
      selectedOption: optionId,
      color: option.colors.length > 0 ? option.colors[0] : ''
    });
  };

  const updateStepNote = (stepId, note) => {
    setStepNotes({ ...stepNotes, [stepId]: note });
  };

  const addElectricityPoint = (typeId) => {
    const newPoint = { id: `${typeId}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, note: '' };
    setElectricity({
      ...electricity,
      points: { ...electricity.points, [typeId]: [...electricity.points[typeId], newPoint] }
    });
  };

  const removeElectricityPoint = (typeId, pointId) => {
    setElectricity({
      ...electricity,
      points: { ...electricity.points, [typeId]: electricity.points[typeId].filter(p => p.id !== pointId) }
    });
  };

  const updateElectricityPointNote = (typeId, pointId, note) => {
    setElectricity({
      ...electricity,
      points: { ...electricity.points, [typeId]: electricity.points[typeId].map(p => p.id === pointId ? { ...p, note } : p) }
    });
  };

  // Canvas Drawing Handlers
  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height)
    };
  };

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const coords = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const coords = getCoordinates(e);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  // Helper to resolve specific prices and upgrades
  const getSelectionPricing = () => {
    let unpricedItemsSelected = false;
    let subtotal = 0;

    // Aluminum sliding door
    const slidingModel = ALUMINUM_MODELS.sliding.find(m => m.id === aluminum.selectedSliding);
    if (slidingModel) subtotal += slidingModel.price * aluminum.slidingQty;

    // Aluminum window
    const windowModel = ALUMINUM_MODELS.window.find(m => m.id === aluminum.selectedWindow);
    if (windowModel) subtotal += windowModel.price * aluminum.windowQty;

    // Aluminum hinged door
    const doorModel = ALUMINUM_MODELS.door.find(m => m.id === aluminum.selectedDoor);
    if (doorModel) subtotal += doorModel.price * aluminum.doorQty;

    // Stairs (only counted when the step actually applies to this villa)
    if (!isSingleStoryVilla) {
      const stairsOpt = STAIRS_OPTIONS.find(o => o.id === stairs);
      if (stairsOpt) subtotal += stairsOpt.price;
    }

    // Railings (priced per linear meter — item 5)
    const railingsOpt = RAILINGS_OPTIONS.find(o => o.id === railings);
    if (railingsOpt) subtotal += railingsOpt.price * railingsQty;

    // Kitchen (item 6) — cost entered by the coordinator once quoted
    if (kitchen.planApproved && kitchen.cost) subtotal += Number(kitchen.cost) || 0;

    // Plaster thermal render add-on (item 7)
    if (plasterThermalRender) subtotal += PLASTER_THERMAL_RENDER_PRICE;

    // Pergola (priced per sqm)
    const pergolaOpt = PERGOLA_OPTIONS.find(o => o.id === pergola);
    if (pergolaOpt) subtotal += pergolaOpt.price * pergolaQty;

    // Exterior Doors
    const extDoorOpt = EXT_DOORS_OPTIONS.find(o => o.id === extDoor);
    if (extDoorOpt) subtotal += extDoorOpt.price;

    // Interior Doors (item 9: flat per-unit delta × total door count, plus ממ"ד wood-leaf add-on)
    const intDoorOpt = INT_DOORS_OPTIONS.find(o => o.id === intDoor.selectedOption);
    if (intDoorOpt) subtotal += intDoorOpt.price * intDoor.doorCount;
    if (intDoor.mamadWoodLeaf) subtotal += MAMAD_WOOD_LEAF_PRICE * intDoor.mamadWoodLeafQty;

    // Entrance Path (premium options priced per sqm; standard options are ₪0 regardless)
    const pathOpt = PATH_OPTIONS.find(o => o.id === path);
    if (pathOpt) {
      if (pathOpt.price === null) unpricedItemsSelected = true;
      else subtotal += pathOpt.price * pathQty;
    }

    // Underfloor heating (item 10)
    if (underfloorHeating.selected) subtotal += UNDERFLOOR_HEATING_PRICE_PER_SQM * (underfloorHeating.sqm || 0);

    // Aircon (item 11) — lump sum per villa, excl. VAT, from the signed contract
    const airconPrice = AIRCON_PRICING[Number(villaNumber)];
    if (!airconOptOut) {
      if (airconPrice == null) unpricedItemsSelected = true;
      else subtotal += airconPrice;
    }

    // Electricity & Plumbing (each point type priced and quantified separately)
    if (electricity.hasChanges) {
      ELECTRICITY_POINT_TYPES.forEach(type => {
        subtotal += type.price * (electricity.points[type.id]?.length || 0);
      });
    }

    const vat = Math.round(subtotal * 0.18);
    const total = subtotal + vat;

    return { subtotal, vat, total, unpricedItemsSelected };
  };

  const pricing = getSelectionPricing();

  const handleNext = () => {
    const idx = visibleSteps.findIndex(s => s.id === currentStep);
    if (idx >= 0 && idx < visibleSteps.length - 1) setCurrentStep(visibleSteps[idx + 1].id);
  };

  const handlePrev = () => {
    const idx = visibleSteps.findIndex(s => s.id === currentStep);
    if (idx > 0) setCurrentStep(visibleSteps[idx - 1].id);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoggedIn(true);
    setCurrentStep(1);
  };

  const handleTenantAuthSuccess = ({ villaNumber: newVillaNumber, tenantName: newTenantName }) => {
    setVillaNumber(newVillaNumber);
    setTenantName(newTenantName);
    setIsLoggedIn(true);
    setCurrentStep(1);
  };

  const handleSubmit = async () => {
    if (isConfirmed && hasSignature && !pricing.unpricedItemsSelected) {
      if (isSupabaseConfigured) {
        try {
          await supabase.rpc('submit_selections', {
            payload: {
              aluminum, stairs, stairsFlightQty, railings, railingsQty, railingsColor, kitchen, plasterThermalRender,
              pergola, pergolaQty, extDoor, intDoor, path, pathQty, underfloorHeating, airconOptOut, stepNotes,
              electricity, pricing
            }
          });
        } catch {
          // Selections still count as submitted locally even if the server write fails —
          // the tenant already signed, we don't want to block them on a network hiccup.
        }
      }
      setIsSubmitted(true);
      clearSavedDraft();
    }
  };

  // Render separate step views
  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Welcome Login
        return (
          <div className="welcome-container">
            <div className="welcome-gradient-bg"></div>
            <div className="welcome-content">
              <div className="welcome-title-grp">
                <h1>ברוכים הבאים לנופיה</h1>
                <p>אלפי מנשה · 24 וילות פרטיות צמודות קרקע</p>
              </div>
              <div className="floating-card">
                {isSupabaseConfigured ? (
                  <TenantAuthGate onSuccess={handleTenantAuthSuccess} />
                ) : (
                  <>
                    <h3 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-serif)', fontSize: '1.5rem' }}>שינויי דיירים — שלב ב'</h3>
                    <form onSubmit={handleLogin}>
                      <div className="form-group">
                        <label htmlFor="villaNum">מספר וילה</label>
                        <input
                          type="text"
                          id="villaNum"
                          className="form-control"
                          placeholder="לדוגמה: 14 (טווח 1-24)"
                          value={villaNumber}
                          onChange={(e) => setVillaNumber(e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="tenantName">שם הדייר / תעודת זהות</label>
                        <input
                          type="text"
                          id="tenantName"
                          className="form-control"
                          placeholder="הכנס שם מלא או ת.ז"
                          value={tenantName}
                          onChange={(e) => setTenantName(e.target.value)}
                          required
                        />
                      </div>
                      <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                        כניסה למערכת
                      </button>
                    </form>
                  </>
                )}
              </div>
              {isSupabaseConfigured && (
                <a href="?admin" className="muted-text" style={{ marginTop: '1rem', fontSize: '0.85rem' }}>
                  כניסת צוות ניהול
                </a>
              )}
            </div>

            {/* Horizon Ridge SVG visual motif (Green over sand beige gradient) */}
            <div className="horizon-svg-container">
              <svg viewBox="0 0 1440 120" preserveAspectRatio="none" style={{ width: '100%', height: '100%', display: 'block' }}>
                <defs>
                  <linearGradient id="sand-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#EDE7DD" />
                    <stop offset="100%" stopColor="#F4F1EA" />
                  </linearGradient>
                </defs>
                <path d="M0,80 C360,110 720,50 1080,90 C1260,110 1380,100 1440,90 L1440,120 L0,120 Z" fill="url(#sand-grad)" opacity="0.6"/>
                <path d="M0,95 C400,125 800,60 1200,105 L1440,85 L1440,120 L0,120 Z" fill="#1F2A24" />
              </svg>
            </div>
          </div>
        );

      case 1: // Intro / Explanation
        return (
          <div>
            <div className="page-title-section">
              <h2>הסבר כללי</h2>
              <p className="page-intro-text">הסבר על תהליך שינויי דיירים</p>
            </div>

            <div className="highlight-box copper" style={{ marginBottom: '2rem', fontSize: '1.05rem' }}>
              <span>ℹ</span> מילוי הבחירות במערכת מתבצע יחד עם <strong>מתאמת שינויי הדיירים, נעה רומפלר</strong> בלבד. הדיירים צופים בבחירות ומאשרים אותן, אך אינם ממלאים אותן לבד — יש לתאם פגישה עם נעה לביצוע הבחירות במשותף.
            </div>

            <h3 style={{ marginBottom: '1rem' }}>הנושאים לבחירה בתהליך:</h3>
            <div className="intro-grid">
              <div className="intro-mini-card"><span>📐</span> אישור תכניות</div>
              <div className="intro-mini-card"><span>🖼️</span> אלומיניום</div>
              <div className="intro-mini-card"><span>🪜</span> מדרגות</div>
              <div className="intro-mini-card"><span>⛓️</span> מעקות</div>
              <div className="intro-mini-card"><span>🍳</span> מטבח</div>
              <div className="intro-mini-card"><span>🎨</span> תוספת טיח</div>
              <div className="intro-mini-card"><span>⛱️</span> פרגולה</div>
              <div className="intro-mini-card"><span>🚪</span> דלתות חוץ</div>
              <div className="intro-mini-card"><span>🚪</span> דלתות פנים</div>
              <div className="intro-mini-card"><span>🛣️</span> שביל כניסה</div>
              <div className="intro-mini-card"><span>🔥</span> חימום תת רצפתי</div>
              <div className="intro-mini-card"><span>❄️</span> מיזוג אוויר</div>
              <div className="intro-mini-card"><span>🔌</span> שינויי חשמל אינסטלציה ובינוי</div>
            </div>

            <div className="highlight-boxes-grid">
              <div className="highlight-box green">
                <h4 style={{ color: 'var(--olive-dark)', marginBottom: '0.5rem' }}>💰 אומדן עלות בזמן אמת</h4>
                בעת ביצוע הבחירות, המערכת תציג אומדן חי של תוספת התשלום הנדרשת (לפני מע"מ וכולל מע"מ) לפי השדרוגים שתבחרו מעבר למפרט הסטנדרט המקורי.
              </div>
              <div className="highlight-box copper">
                <h4 style={{ color: 'var(--copper-dark)', marginBottom: '0.5rem' }}>🏦 מימון וליווי בנקאי</h4>
                מומלץ לפנות לבדיקת מימון מקדימה מול הבנק המלווה כבר עכשיו, על מנת להיערך בצורה הטובה ביותר לשלבי התשלום ומימון שינויי הדיירים.
              </div>
            </div>

            <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
              <button className="btn btn-accent" onClick={handleNext}>המשך לבחירות ←</button>
            </div>
          </div>
        );

      case 2: // Plan approval (item 2) — external share links per discipline, managed by admin/coordinator
        return (
          <div>
            <div className="page-title-section">
              <h2>אישור תכניות</h2>
              <p className="page-intro-text">תכניות וילה {villaNumber} — אינסטלציה, חשמל, אדריכלות ומיזוג אוויר</p>
            </div>

            <div className="highlight-box green">
              <span>ℹ</span> הקישורים לתכניות מנוהלים ע"י מתאמת השינויים/חברת הניהול. אם קישור חסר, יש לפנות אליהם.
            </div>

            <div className="options-grid" style={{ marginTop: '1.5rem' }}>
              {[
                { key: 'architecture', label: 'אדריכלות', icon: '🏛️' },
                { key: 'electricity', label: 'חשמל', icon: '🔌' },
                { key: 'plumbing', label: 'אינסטלציה', icon: '🚰' },
                { key: 'hvac', label: 'מיזוג אוויר', icon: '❄️' }
              ].map(d => (
                <div key={d.key} className="option-card" style={{ minHeight: 'auto', cursor: 'default' }}>
                  <div className="option-card-header">
                    <span className="option-title">{d.icon} {d.label}</span>
                  </div>
                  {planLinks[d.key] ? (
                    <a href={planLinks[d.key]} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ marginTop: '0.75rem', display: 'inline-block' }}>
                      פתיחת תכנית {d.label} ↗
                    </a>
                  ) : (
                    <p className="muted-text" style={{ marginTop: '0.75rem' }}>טרם הועלה קישור לתכנית זו</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 3: // Aluminum (Visual Swatches, Popups, Exact pricing)
        return (
          <div>
            <div className="page-title-section">
              <h2>אלומיניום — ויטרינות וחלונות</h2>
              <p className="page-intro-text">בחירת דגמי פרופיל, גוונים וכמויות. לחץ על דגם לפתיחת מפרט טכני מורחב.</p>
            </div>

            <div className="warning-alert-banner">
              <span>⚠</span>
              שים לב: לא ניתן לשלב דגמים שונים באותו חלל (לדוגמה: 2 ויטרינות באותו סלון – שתיהן חייבות להיות מאותו דגם).
            </div>

            {/* 1. Sliding Window/Door model */}
            <h3 style={{ marginTop: '2rem', borderBottom: '1px solid var(--line)', paddingBottom: '0.5rem' }}>1. דגם ויטרינה (דלתות הזזה)</h3>
            <div className="options-grid">
              {ALUMINUM_MODELS.sliding.map(model => (
                <div 
                  key={model.id}
                  className={`option-card ${aluminum.selectedSliding === model.id ? 'selected' : ''}`}
                  onClick={() => setAluminum({ ...aluminum, selectedSliding: model.id })}
                >
                  <div className="option-card-header">
                    <div>
                      <span className="option-title" style={{ display: 'block' }}>{model.name}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--olive-dark)', cursor: 'pointer', textDecoration: 'underline' }} onClick={(e) => {
                        e.stopPropagation();
                        setActiveModal({ title: model.name, content: model.fullSpec });
                      }}>
                        🔍 לחץ למפרט המלא
                      </span>
                    </div>
                    <div className="select-badge">
                      {aluminum.selectedSliding === model.id && '✓'}
                    </div>
                  </div>
                  <p className="option-description" style={{ fontSize: '0.9rem' }}>{model.desc}</p>
                  <div className="option-card-footer">
                    {model.rating && <span className="price-badge standard" style={{ marginLeft: '0.5rem' }}>מדרג איטום רוח/מים: {model.rating}</span>}
                    <span className="price-badge upgrade">₪{model.price.toLocaleString()} / מ"ר</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="selection-details-panel" style={{ marginBottom: '2.5rem' }}>
              <div className="panel-row">
                <span className="panel-row-label">כמות ויטרינה מתוכננת (במ"ר):</span>
                <div className="qty-stepper">
                  <button className="qty-btn" onClick={() => setAluminum({ ...aluminum, slidingQty: Math.max(1, aluminum.slidingQty - 1) })}>-</button>
                  <input type="text" className="qty-value" readOnly value={aluminum.slidingQty} />
                  <button className="qty-btn" onClick={() => setAluminum({ ...aluminum, slidingQty: aluminum.slidingQty + 1 })}>+</button>
                </div>
              </div>
            </div>

            {/* 2. Window model */}
            <h3 style={{ marginTop: '2rem', borderBottom: '1px solid var(--line)', paddingBottom: '0.5rem' }}>2. דגם חלון קבוע/הזזה</h3>
            <div className="options-grid">
              {ALUMINUM_MODELS.window.map(model => (
                <div 
                  key={model.id}
                  className={`option-card ${aluminum.selectedWindow === model.id ? 'selected' : ''}`}
                  onClick={() => setAluminum({ ...aluminum, selectedWindow: model.id })}
                >
                  <div className="option-card-header">
                    <div>
                      <span className="option-title" style={{ display: 'block' }}>{model.name}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--olive-dark)', cursor: 'pointer', textDecoration: 'underline' }} onClick={(e) => {
                        e.stopPropagation();
                        setActiveModal({ title: model.name, content: model.fullSpec });
                      }}>
                        🔍 לחץ למפרט המלא
                      </span>
                    </div>
                    <div className="select-badge">
                      {aluminum.selectedWindow === model.id && '✓'}
                    </div>
                  </div>
                  <p className="option-description" style={{ fontSize: '0.9rem' }}>{model.desc}</p>
                  <div className="option-card-footer">
                    {model.rating && <span className="price-badge standard" style={{ marginLeft: '0.5rem' }}>מדרג איטום רוח/מים: {model.rating}</span>}
                    <span className="price-badge upgrade">₪{model.price.toLocaleString()} / מ"ר</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="selection-details-panel" style={{ marginBottom: '2.5rem' }}>
              <div className="panel-row">
                <span className="panel-row-label">כמות חלונות מתוכננת (במ"ר):</span>
                <div className="qty-stepper">
                  <button className="qty-btn" onClick={() => setAluminum({ ...aluminum, windowQty: Math.max(1, aluminum.windowQty - 1) })}>-</button>
                  <input type="text" className="qty-value" readOnly value={aluminum.windowQty} />
                  <button className="qty-btn" onClick={() => setAluminum({ ...aluminum, windowQty: aluminum.windowQty + 1 })}>+</button>
                </div>
              </div>
            </div>

            {/* 3. Hinged Door model */}
            <h3 style={{ marginTop: '2rem', borderBottom: '1px solid var(--line)', paddingBottom: '0.5rem' }}>3. דגם דלת כנף (ציר)</h3>
            <div className="options-grid">
              {ALUMINUM_MODELS.door.map(model => (
                <div 
                  key={model.id}
                  className={`option-card ${aluminum.selectedDoor === model.id ? 'selected' : ''}`}
                  onClick={() => setAluminum({ ...aluminum, selectedDoor: model.id })}
                >
                  <div className="option-card-header">
                    <div>
                      <span className="option-title" style={{ display: 'block' }}>{model.name}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--olive-dark)', cursor: 'pointer', textDecoration: 'underline' }} onClick={(e) => {
                        e.stopPropagation();
                        setActiveModal({ title: model.name, content: model.fullSpec });
                      }}>
                        🔍 לחץ למפרט המלא
                      </span>
                    </div>
                    <div className="select-badge">
                      {aluminum.selectedDoor === model.id && '✓'}
                    </div>
                  </div>
                  <p className="option-description" style={{ fontSize: '0.9rem' }}>{model.desc}</p>
                  <div className="option-card-footer">
                    {model.rating && <span className="price-badge standard" style={{ marginLeft: '0.5rem' }}>מדרג איטום רוח/מים: {model.rating}</span>}
                    <span className="price-badge upgrade">₪{model.price.toLocaleString()} / {model.unit}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="selection-details-panel" style={{ marginBottom: '2.5rem' }}>
              <div className="panel-row">
                <span className="panel-row-label">כמות דלתות כנף (קומפלט):</span>
                <div className="qty-stepper">
                  <button className="qty-btn" onClick={() => setAluminum({ ...aluminum, doorQty: Math.max(1, aluminum.doorQty - 1) })}>-</button>
                  <input type="text" className="qty-value" readOnly value={aluminum.doorQty} />
                  <button className="qty-btn" onClick={() => setAluminum({ ...aluminum, doorQty: aluminum.doorQty + 1 })}>+</button>
                </div>
              </div>
            </div>

            {/* 4. Swatch settings with visual aid color circles */}
            <h3 style={{ marginTop: '2rem', borderBottom: '1px solid var(--line)', paddingBottom: '0.5rem' }}>4. גווני אלומיניום (אחיד לכל הבית)</h3>
            <div className="selection-details-panel">
              <div className="swatch-group" style={{ marginBottom: '1.5rem' }}>
                <div className="swatch-label">גוון פרופיל אלומיניום:</div>
                <div className="color-photo-grid">
                  {ALUMINUM_COLORS.map(color => (
                    <button
                      key={color.name}
                      type="button"
                      className={`color-photo-btn ${aluminum.profileColor === color.name ? 'active' : ''}`}
                      onClick={() => setAluminum({ ...aluminum, profileColor: color.name })}
                    >
                      <img src={color.image} alt={color.name} className="color-photo-img zoomable-img" onClick={(e) => openLightbox(e, color.image, color.name)} />
                      <span className="color-photo-label">{color.name}</span>
                      <span className="muted-text" style={{ fontSize: '0.75rem' }}>מס' גוון: {color.code}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="swatch-group">
                <div className="swatch-label">גוון רפפות / צלונים:</div>
                <div className="color-photo-grid">
                  {BLINDS_COLORS.map(color => (
                    <button
                      key={color.name}
                      type="button"
                      className={`color-photo-btn ${aluminum.blindsColor === color.name ? 'active' : ''}`}
                      onClick={() => setAluminum({ ...aluminum, blindsColor: color.name })}
                    >
                      <img src={color.image} alt={color.name} className="color-photo-img zoomable-img" onClick={(e) => openLightbox(e, color.image, color.name)} />
                      <span className="color-photo-label">{color.name}</span>
                      <span className="muted-text" style={{ fontSize: '0.75rem' }}>מס' גוון: {color.code}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 4: // Stairs (with real generated images)
        return (
          <div>
            <div className="page-title-section">
              <h2>מדרגות פנים</h2>
              <p className="page-intro-text">בחירת קונסטרוקציה וצורת מדרגות</p>
            </div>

            <div className="options-grid">
              {STAIRS_OPTIONS.map(opt => (
                <div 
                  key={opt.id}
                  className={`option-card ${stairs === opt.id ? 'selected' : ''}`}
                  onClick={() => setStairs(opt.id)}
                  style={{ minHeight: '260px' }}
                >
                  <div>
                    {opt.image ? (
                      <img src={opt.image} alt={opt.name} className="card-preview-image zoomable-img" onClick={(e) => openLightbox(e, opt.image, opt.name)} />
                    ) : (
                      <div className="card-preview-image" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--dune)' }}>
                        <span style={{ fontSize: '2.5rem' }}>🪜</span>
                      </div>
                    )}
                    <div className="option-card-header" style={{ marginTop: '0.5rem' }}>
                      <span className="option-title" style={{ fontSize: '1.15rem' }}>{opt.name}</span>
                      <div className="select-badge">
                        {stairs === opt.id && '✓'}
                      </div>
                    </div>
                    <p className="option-description" style={{ fontSize: '0.9rem' }}>{opt.desc}</p>
                  </div>
                  <div className="option-card-footer">
                    {opt.price === 0 ? (
                      <span className="price-badge standard">כלול בסטנדרט (₪0)</span>
                    ) : (
                      <span className="price-badge upgrade">+ ₪{opt.price.toLocaleString()}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Item 4: כמות גרמים לפי מפלסים — for multi-story villas only */}
            {showStairsFlightQty && (
              <div className="selection-details-panel" style={{ marginTop: '2rem' }}>
                <div className="panel-row">
                  <span className="panel-row-label">כמות גרמי מדרגות לפי מפלסים:</span>
                  <div className="qty-stepper">
                    <button className="qty-btn" disabled={viewOnly} onClick={() => setStairsFlightQty(Math.max(1, stairsFlightQty - 1))}>-</button>
                    <input type="text" className="qty-value" readOnly value={stairsFlightQty} />
                    <button className="qty-btn" disabled={viewOnly} onClick={() => setStairsFlightQty(stairsFlightQty + 1)}>+</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 5: // Railings (real photos, colors, and per-linear-meter pricing)
        return (
          <div>
            <div className="page-title-section">
              <h2>מעקות</h2>
              <p className="page-intro-text">בחירת דגם מעקה, גוון ומ"א. לחצו על התמונה לצפייה בשרטוט הטכני.</p>
            </div>

            <div className="options-grid">
              {RAILINGS_OPTIONS.map(opt => (
                <div
                  key={opt.id}
                  className={`option-card ${railings === opt.id ? 'selected' : ''}`}
                  onClick={() => setRailings(opt.id)}
                  style={{ minHeight: '260px' }}
                >
                  <div>
                    <img src={opt.image} alt={opt.name} className="card-preview-image zoomable-img" onClick={(e) => openLightbox(e, opt.image, opt.name)} />
                    <div className="option-card-header" style={{ marginTop: '0.5rem' }}>
                      <div>
                        <span className="option-title" style={{ display: 'block', fontSize: '1.15rem' }}>{opt.name}</span>
                        {opt.id === 2 && (
                          <span style={{ fontSize: '0.8rem', color: 'var(--olive-dark)', cursor: 'pointer', textDecoration: 'underline' }} onClick={(e) => {
                            e.stopPropagation();
                            setActiveModal({ title: `שרטוט טכני — ${opt.name}`, content: 'מפרט מעקה: לוחות שנטו 40/10 מ"מ, גובה חזית 108–120 ס"מ, עמוד אלומיניום מנוקב 50/50/3 מ"מ, פלטת עיגון לרצפה.', image: railingDrawingImg });
                          }}>
                            🔍 שרטוט טכני
                          </span>
                        )}
                      </div>
                      <div className="select-badge">
                        {railings === opt.id && '✓'}
                      </div>
                    </div>
                    <p className="option-description" style={{ fontSize: '0.9rem' }}>{opt.desc}</p>
                  </div>
                  <div className="option-card-footer">
                    {opt.price === 0 ? (
                      <span className="price-badge standard">כלול בסטנדרט (₪0)</span>
                    ) : (
                      <span className="price-badge upgrade">₪{opt.price.toLocaleString()} / {opt.unit}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="selection-details-panel" style={{ marginTop: '2rem' }}>
              <div className="panel-row">
                <span className="panel-row-label">אורך המעקה המשוער (במ"א):</span>
                <div className="qty-stepper">
                  <button className="qty-btn" onClick={() => setRailingsQty(Math.max(1, railingsQty - 1))}>-</button>
                  <input type="text" className="qty-value" readOnly value={railingsQty} />
                  <button className="qty-btn" onClick={() => setRailingsQty(railingsQty + 1)}>+</button>
                </div>
              </div>

              <div className="swatch-group" style={{ marginTop: '1.5rem' }}>
                <div className="swatch-label">גוון מעקה:</div>
                <div className="color-photo-grid" style={{ marginTop: '0.5rem' }}>
                  {RAILING_COLORS.map(color => (
                    <button
                      key={color.name}
                      type="button"
                      className={`color-photo-btn ${railingsColor === color.name ? 'active' : ''}`}
                      onClick={() => setRailingsColor(color.name)}
                    >
                      <div className="color-photo-img" style={{ backgroundColor: color.hex, border: '1px solid var(--line)' }} />
                      <span className="color-photo-label">{color.name}</span>
                      <span className="muted-text" style={{ fontSize: '0.75rem' }}>{color.code}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 6: // Kitchen (item 6) — plan approval, color, cost
        return (
          <div>
            <div className="page-title-section">
              <h2>מטבח</h2>
              <p className="page-intro-text">אישור תכנית מטבח, גוון ועלות</p>
            </div>

            <div className="highlight-box green">
              <span>ℹ</span> תכנית המטבח המפורטת נמצאת בתיקיית התכניות של הוילה (מגרש {villaNumber}). יש לתאם עם מתאמת השינויים לצפייה ואישור.
            </div>

            <label className="checkbox-container" style={{ marginTop: '1.5rem', backgroundColor: 'var(--white)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--line)' }}>
              <input
                type="checkbox"
                checked={kitchen.planApproved}
                onChange={(e) => setKitchen({ ...kitchen, planApproved: e.target.checked })}
              />
              <span className="checkbox-text">אני מאשר/ת את תכנית המטבח כפי שהוצגה</span>
            </label>

            <div className="selection-details-panel" style={{ marginTop: '1.5rem' }}>
              <div className="swatch-group">
                <div className="swatch-label">גוון מטבח שנבחר:</div>
                <input
                  type="text"
                  className="form-control"
                  style={{ marginTop: '0.5rem' }}
                  placeholder="לדוגמה: אפור מט / לבן high-gloss / אלון טבעי"
                  value={kitchen.color}
                  onChange={(e) => setKitchen({ ...kitchen, color: e.target.value })}
                />
              </div>

              <div className="panel-row" style={{ marginTop: '1.25rem' }}>
                <span className="panel-row-label">עלות מטבח (נקבעת ע"י מתאמת השינויים מול ספק המטבחים):</span>
                <input
                  type="number"
                  className="form-control"
                  style={{ maxWidth: '160px' }}
                  value={kitchen.cost}
                  disabled={!isCoordinator}
                  onChange={(e) => setKitchen({ ...kitchen, cost: e.target.value })}
                />
              </div>
              {!isCoordinator && (
                <p className="muted-text" style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>שדה העלות נקבע ומעודכן ע"י מתאמת שינויי הדיירים בלבד.</p>
              )}
            </div>
          </div>
        );

      case 7: // Plaster add-on (item 7: color picker removed, only the thermal render option remains)
        return (
          <div>
            <div className="page-title-section">
              <h2>תוספת טיח</h2>
              <p className="page-intro-text">שליכט תרמי לקירות החוץ (חברת פלס)</p>
            </div>

            <label className="checkbox-container" style={{ backgroundColor: 'var(--white)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--line)' }}>
              <input
                type="checkbox"
                checked={plasterThermalRender}
                onChange={(e) => setPlasterThermalRender(e.target.checked)}
              />
              <span className="checkbox-text">
                ברצוני להוסיף שליכט תרמי של חברת פלס (תוספת ₪{PLASTER_THERMAL_RENDER_PRICE.toLocaleString()} לדירה + מע"מ)
              </span>
            </label>

            <div className="highlight-box green" style={{ marginTop: '1.5rem' }}>
              <span>ℹ</span> {PLASTER_THERMAL_RENDER_VIDEO_NOTE}
            </div>

            <div className="highlight-box copper" style={{ marginTop: '1rem' }}>
              <span>🎨</span> גוון הטיח: השליכט הטרמי (במידה ונבחר) יהיה בגרגור 200. אין אפשרות בחירת גוון לטיח החוץ הבסיסי.
            </div>
          </div>
        );

      case 8: // Pergola (priced per sqm)
        return (
          <div>
            <div className="page-title-section">
              <h2>פרגולות</h2>
              <p className="page-intro-text">שדרוגי פרגולה לחצר/מרפסת</p>
            </div>

            <div className="options-grid two-cols">
              {PERGOLA_OPTIONS.map(opt => (
                <div
                  key={opt.id}
                  className={`option-card ${pergola === opt.id ? 'selected' : ''}`}
                  onClick={() => setPergola(opt.id)}
                  style={{ minHeight: '280px' }}
                >
                  <div>
                    <img src={opt.image} alt={opt.name} className="card-preview-image zoomable-img" style={{ height: '180px' }} onClick={(e) => openLightbox(e, opt.image, opt.name)} />
                    <div className="option-card-header" style={{ marginTop: '0.5rem' }}>
                      <div>
                        <span className="option-title" style={{ display: 'block' }}>{opt.name}</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--olive-dark)', cursor: 'pointer', textDecoration: 'underline' }} onClick={(e) => {
                          e.stopPropagation();
                          setActiveModal({ title: `פרט טכני — ${opt.name}`, content: 'חתך פרופיל מסגרת אלומיניום 10/20 מ"מ, מרישים אנכיים 4/8 מ"מ במרווחים של כ-4 ס"מ לבחירה אדריכלית. יש לוודא אופן חיבור פרופילי האלומיניום עם ארגז תריס במידה וקיים.', image: pergolaDrawingImg });
                        }}>
                          🔍 לחץ לפרט טכני
                        </span>
                      </div>
                      <div className="select-badge">
                        {pergola === opt.id && '✓'}
                      </div>
                    </div>
                    <p className="option-description" style={{ fontSize: '0.9rem' }}>{opt.desc}</p>
                  </div>
                  <div className="option-card-footer">
                    {opt.price === 0 ? (
                      <span className="price-badge standard">כלול בסטנדרט (₪0)</span>
                    ) : (
                      <span className="price-badge upgrade">₪{opt.price.toLocaleString()} / {opt.unit}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="selection-details-panel" style={{ marginTop: '2rem' }}>
              <div className="panel-row">
                <span className="panel-row-label">שטח פרגולה משוער (במ"ר):</span>
                <div className="qty-stepper">
                  <button className="qty-btn" onClick={() => setPergolaQty(Math.max(1, pergolaQty - 1))}>-</button>
                  <input type="text" className="qty-value" readOnly value={pergolaQty} />
                  <button className="qty-btn" onClick={() => setPergolaQty(pergolaQty + 1)}>+</button>
                </div>
              </div>
            </div>
          </div>
        );

      case 9: // Exterior Doors (real photos per model, drill-down full spec)
        return (
          <div>
            <div className="page-title-section">
              <h2>דלתות חוץ</h2>
              <p className="page-intro-text">בחירת דגם דלת כניסה ראשית לבית</p>
            </div>

            <div className="options-grid">
              {EXT_DOORS_OPTIONS.map(opt => (
                <div
                  key={opt.id}
                  className={`option-card ${extDoor === opt.id ? 'selected' : ''}`}
                  style={{ minHeight: '440px' }}
                  onClick={() => setExtDoor(opt.id)}
                >
                  <div>
                    <img src={opt.image} alt={opt.name} className="card-preview-image-tall zoomable-img" onClick={(e) => openLightbox(e, opt.image, opt.name)} />
                    <div className="option-card-header" style={{ marginTop: '0.5rem' }}>
                      <span className="option-title">{opt.name}</span>
                      <div className="select-badge">
                        {extDoor === opt.id && '✓'}
                      </div>
                    </div>
                    <p className="option-description" style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                      {opt.desc}
                    </p>
                    {/* Item 8: contact details per door supplier rep — fill in once received */}
                    <p className="muted-text" style={{ fontSize: '0.8rem' }}>
                      לשאלות מול נציג הספק: {opt.contactName || 'יעודכן ע"י מתאמת השינויים'} {opt.contactPhone && `· ${opt.contactPhone}`}
                    </p>
                  </div>

                  <div className="option-card-footer" style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveModal({ title: opt.name, content: opt.fullSpec, image: opt.image });
                      }}
                    >
                      ℹ למידע נוסף
                    </button>
                    {opt.price === 0 ? (
                      <span className="price-badge standard">כלול בסטנדרט (₪0)</span>
                    ) : (
                      <span className="price-badge upgrade">₪{opt.price.toLocaleString()} + מע"מ</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 10: // Interior Doors (item 9: flat per-unit pricing, total door count, ממ"ד wood-leaf add-on)
        return (
          <div>
            <div className="page-title-section">
              <h2>דלתות פנים</h2>
              <p className="page-intro-text">ספק: חברת חמדיה. לחץ "ℹ מפרט מלא" לפתיחת פרטי הדגם.</p>
            </div>

            <div className="options-grid">
              {INT_DOORS_OPTIONS.map(opt => (
                <div
                  key={opt.id}
                  className={`option-card ${intDoor.selectedOption === opt.id ? 'selected' : ''}`}
                  onClick={() => handleIntDoorOptionChange(opt.id)}
                  style={{ minHeight: '480px' }}
                >
                  <div>
                    {opt.image ? (
                      <img src={opt.image} alt={opt.name} className="card-preview-image-tall zoomable-img" onClick={(e) => openLightbox(e, opt.image, opt.name)} />
                    ) : (
                      <div className="card-preview-image-tall" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '3rem' }}>🚪</span>
                      </div>
                    )}
                    <div className="option-card-header" style={{ marginTop: '0.5rem' }}>
                      <div>
                        <span className="option-title" style={{ display: 'block', fontSize: '1.15rem' }}>{opt.name}</span>
                        <span className="muted-text" style={{ fontSize: '0.8rem' }}>ספק: {opt.supplier}</span>
                      </div>
                      <div className="select-badge">
                        {intDoor.selectedOption === opt.id && '✓'}
                      </div>
                    </div>

                    <p className="option-description" style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>{opt.desc}</p>

                    {opt.id === 'C' && (
                      <div className="price-badge unpriced" style={{ width: '100%', textAlign: 'center', marginBottom: '0.5rem', fontSize: '0.8rem' }}>
                        ⚠ אופציה ג' מצריכה הגדלת פתחי בנייה ב-5 ס"מ
                      </div>
                    )}
                  </div>

                  <div className="option-card-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveModal({ title: opt.name, content: opt.fullSpec, image: opt.image });
                      }}
                    >
                      ℹ מפרט מלא
                    </button>
                    {opt.price === 0 ? (
                      <span className="price-badge standard">כלול בסטנדרט (₪0)</span>
                    ) : (
                      <span className="price-badge upgrade" style={{ fontSize: '0.8rem' }}>+ ₪{opt.price.toLocaleString()} / יח\'</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Item 9: total door count for the villa, plus ממ"ד wood-leaf add-on */}
            <div className="selection-details-panel" style={{ marginBottom: '1.5rem' }}>
              <div className="panel-row">
                <span className="panel-row-label">כמות דלתות פנים בווילה:</span>
                <div className="qty-stepper">
                  <button className="qty-btn" onClick={() => setIntDoor({ ...intDoor, doorCount: Math.max(0, intDoor.doorCount - 1) })}>-</button>
                  <input type="text" className="qty-value" readOnly value={intDoor.doorCount} />
                  <button className="qty-btn" onClick={() => setIntDoor({ ...intDoor, doorCount: intDoor.doorCount + 1 })}>+</button>
                </div>
              </div>

              {INT_DOORS_OPTIONS.find(o => o.id === intDoor.selectedOption)?.colors.length > 0 && (
                <div className="swatch-group" style={{ marginTop: '1.25rem' }}>
                  <div className="swatch-label">בחירת גוון דלת:</div>
                  <div className="swatch-items" style={{ marginTop: '0.5rem' }}>
                    {INT_DOORS_OPTIONS.find(o => o.id === intDoor.selectedOption).colors.map(color => (
                      <button
                        key={color}
                        type="button"
                        className={`swatch-btn ${intDoor.color === color ? 'active' : ''}`}
                        onClick={() => setIntDoor({ ...intDoor, color: color })}
                      >
                        <span className="color-chip">
                          <span className={`color-dot ${color === 'לבן' ? 'color-white' : color === 'שמנת' ? 'color-cream' : color.includes('אגוז') ? 'color-walnut' : color.includes('אלון') ? 'color-oak' : 'color-white'}`}></span>
                          <span>{color}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <label className="checkbox-container" style={{ marginTop: '1.5rem' }}>
                <input
                  type="checkbox"
                  checked={intDoor.mamadWoodLeaf}
                  onChange={(e) => setIntDoor({ ...intDoor, mamadWoodLeaf: e.target.checked })}
                />
                <span className="checkbox-text">
                  תוספת כנף דלת עץ מעל דלת הממ"ד התקנית (₪{MAMAD_WOOD_LEAF_PRICE.toLocaleString()} לכנף)
                </span>
              </label>
              {intDoor.mamadWoodLeaf && (
                <div className="panel-row" style={{ marginTop: '0.75rem' }}>
                  <span className="panel-row-label">כמות כנפי עץ לממ"ד:</span>
                  <div className="qty-stepper">
                    <button className="qty-btn" onClick={() => setIntDoor({ ...intDoor, mamadWoodLeafQty: Math.max(1, intDoor.mamadWoodLeafQty - 1) })}>-</button>
                    <input type="text" className="qty-value" readOnly value={intDoor.mamadWoodLeafQty} />
                    <button className="qty-btn" onClick={() => setIntDoor({ ...intDoor, mamadWoodLeafQty: intDoor.mamadWoodLeafQty + 1 })}>+</button>
                  </div>
                </div>
              )}
            </div>

            {/* General Installation block caveat */}
            <div className="highlight-box copper" style={{ fontSize: '0.95rem', borderRight: '4px solid var(--copper)' }}>
              <strong>הערת התקנה חשובה:</strong> המחירים לעיל מתייחסים להרכבה על מחיצות אשבונד/גבס. במידה וההרכבה תבוצע על קירות בלוק שחור/איטונג, יש לקחת בחשבון הוספת משקוף עיוור לצורך פילוס והכנה נאותה.
            </div>
          </div>
        );

      case 11: // Entrance Path (with visual representations)
        return (
          <div>
            <div className="page-title-section">
              <h2>שביל כניסה</h2>
              <p className="page-intro-text">בחירת חיפוי או יציקת שביל הכניסה לבית</p>
            </div>

            <div className="options-grid">
              {PATH_OPTIONS.map(opt => (
                <div 
                  key={opt.id}
                  className={`option-card ${path === opt.id ? 'selected' : ''}`}
                  onClick={() => setPath(opt.id)}
                  style={{ minHeight: '240px' }}
                >
                  <div>
                    <img src={opt.image} alt={opt.name} className="card-preview-image zoomable-img" onClick={(e) => openLightbox(e, opt.image, opt.name)} />
                    <div className="option-card-header" style={{ marginTop: '0.5rem' }}>
                      <span className="option-title" style={{ fontSize: '1.15rem' }}>{opt.name}</span>
                      <div className="select-badge">
                        {path === opt.id && '✓'}
                      </div>
                    </div>
                    <p className="option-description" style={{ fontSize: '0.9rem' }}>{opt.desc}</p>
                  </div>
                  <div className="option-card-footer">
                    {opt.price === 0 ? (
                      <span className="price-badge standard">כלול בסטנדרט (₪0)</span>
                    ) : (
                      <span className="price-badge upgrade">₪{opt.price.toLocaleString()} / {opt.unit}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {PATH_OPTIONS.find(o => o.id === path)?.price > 0 && (
              <div className="selection-details-panel" style={{ marginTop: '2rem' }}>
                <div className="panel-row">
                  <span className="panel-row-label">שטח השביל המשוער (במ"ר):</span>
                  <div className="qty-stepper">
                    <button className="qty-btn" onClick={() => setPathQty(Math.max(1, pathQty - 1))}>-</button>
                    <input type="text" className="qty-value" readOnly value={pathQty} />
                    <button className="qty-btn" onClick={() => setPathQty(pathQty + 1)}>+</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 12: // Underfloor heating (item 10) — new, before the electric/plumbing step
        return (
          <div>
            <div className="page-title-section">
              <h2>חימום תת רצפתי</h2>
              <p className="page-intro-text">הכנה לחימום תת רצפתי על בסיס מים — הכנה מתחת לרצפה בלבד</p>
            </div>

            <label className="checkbox-container" style={{ backgroundColor: 'var(--white)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--line)' }}>
              <input
                type="checkbox"
                checked={underfloorHeating.selected}
                onChange={(e) => setUnderfloorHeating({ ...underfloorHeating, selected: e.target.checked })}
              />
              <span className="checkbox-text">
                ברצוני בהכנה לחימום תת רצפתי (₪{UNDERFLOOR_HEATING_PRICE_PER_SQM.toLocaleString()} למ"ר + מע"מ)
              </span>
            </label>

            <div className="highlight-box copper" style={{ marginTop: '1rem' }}>
              <span>ℹ</span> התוספת הינה עבור הכנת תשתית מתחת לרצפה בלבד (על בסיס מים). אינה כוללת את מערכת החימום עצמה.
            </div>

            {underfloorHeating.selected && (
              <div className="selection-details-panel" style={{ marginTop: '1.5rem' }}>
                <div className="panel-row">
                  <span className="panel-row-label">שטח לחימום (במ"ר) — נקבע ע"י מתאמת השינויים בלבד:</span>
                  <div className="qty-stepper">
                    <button className="qty-btn" disabled={!isCoordinator} onClick={() => setUnderfloorHeating({ ...underfloorHeating, sqm: Math.max(0, underfloorHeating.sqm - 1) })}>-</button>
                    <input type="text" className="qty-value" readOnly value={underfloorHeating.sqm} />
                    <button className="qty-btn" disabled={!isCoordinator} onClick={() => setUnderfloorHeating({ ...underfloorHeating, sqm: underfloorHeating.sqm + 1 })}>+</button>
                  </div>
                </div>
                {!isCoordinator && (
                  <p className="muted-text" style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>שדה זה נקבע ע"י מתאמת שינויי הדיירים לאחר מדידה בשטח.</p>
                )}
              </div>
            )}
          </div>
        );

      case 13: // Aircon — Tadiran (item 11) — new, before the electric/plumbing step
        return (
          <div>
            <div className="page-title-section">
              <h2>מיזוג אוויר</h2>
              <p className="page-intro-text">ערכת מיזוג אוויר תדיראן — מחיר פאושל לוילה, לפי הסכם עבודות קבלניות</p>
            </div>

            <div className="highlight-box green">
              <span>ℹ</span> פירוט הדגמים, התפוקה (BTU) והכמות ליחידה נמצא במסמך המצורף לוילה שלכם בתיקיית שינויי הדיירים. ניתן לפנות למתאמת השינויים לצפייה.
            </div>

            <div className="selection-details-panel" style={{ marginTop: '1.5rem' }}>
              <div className="panel-row">
                <span className="panel-row-label">מחיר פאושל לוילה {villaNumber} (לא כולל מע"מ):</span>
                <strong>
                  {AIRCON_PRICING[Number(villaNumber)] != null
                    ? `₪${AIRCON_PRICING[Number(villaNumber)].toLocaleString()}`
                    : 'לא סופק מחיר לוילה זו — פנה למתאמת השינויים'}
                </strong>
              </div>
            </div>

            <label className="checkbox-container" style={{ marginTop: '1.5rem' }}>
              <input
                type="checkbox"
                checked={airconOptOut}
                onChange={(e) => setAirconOptOut(e.target.checked)}
              />
              <span className="checkbox-text">
                אינני מעוניין לבצע את ערכת מיזוג האוויר דרך הקבלן
              </span>
            </label>

            {airconOptOut && (
              <div className="warning-alert-banner" style={{ marginTop: '1rem' }}>
                <span>⚠</span> יש לחתום על נספח ביטול מיזוג אוויר להסכם — פנה למתאמת השינויים לקבלת קישור החתימה.
              </div>
            )}
          </div>
        );

      case 14: // Electricity & Plumbing (item 12: renamed)
        return (
          <div>
            <div className="page-title-section">
              <h2>שינויי חשמל אינסטלציה ובינוי</h2>
              <p className="page-intro-text">הוספה או העתקה של נקודות חשמל ומים במבנה. יעודכן לאחר פגישה עם מתאמת שינויים.</p>
            </div>

            <label className="checkbox-container" style={{ margin: '2rem 0', backgroundColor: 'var(--white)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--line)' }}>
              <input 
                type="checkbox" 
                checked={electricity.hasChanges} 
                onChange={(e) => setElectricity({ ...electricity, hasChanges: e.target.checked })}
              />
              <span className="checkbox-text">
                ברצוני לבצע שינויים או תוספות בנקודות חשמל / מים בווילה
              </span>
            </label>

            {electricity.hasChanges && (
              <div className="selection-details-panel">
                <h3 style={{ marginBottom: '1.25rem', fontSize: '1.2rem', fontFamily: 'var(--font-serif)' }}>פירוט שינויי נקודות:</h3>

                {ELECTRICITY_POINT_TYPES.map(type => {
                  const points = electricity.points[type.id];
                  return (
                    <div key={type.id} className="panel-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0.75rem', marginBottom: '1.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="panel-row-label">{type.name} (₪{type.price} לנקודה) — {points.length} נק'</span>
                        <button type="button" className="btn btn-secondary" style={{ padding: '0.35rem 0.9rem', fontSize: '0.85rem' }} onClick={() => addElectricityPoint(type.id)}>
                          + הוסף נקודה
                        </button>
                      </div>

                      {points.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {points.map((point, idx) => (
                            <div key={point.id} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                              <span className="muted-text" style={{ fontSize: '0.85rem', minWidth: '1.5rem' }}>{idx + 1}.</span>
                              <input
                                type="text"
                                className="form-control"
                                style={{ flex: 1 }}
                                placeholder={`הערה למיקום נקודה זו — לדוגמה: "${type.id === 'water' ? 'ליד חדר הכביסה' : 'בחדר השינה, ליד המיטה'}"`}
                                value={point.note}
                                onChange={(e) => updateElectricityPointNote(type.id, point.id, e.target.value)}
                              />
                              <button
                                type="button"
                                className="btn btn-secondary"
                                style={{ padding: '0.35rem 0.7rem', fontSize: '0.85rem' }}
                                onClick={() => removeElectricityPoint(type.id, point.id)}
                              >
                                הסר
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );

      case 15: // Summary & Digital Signature (item 14: grouped notes shown here)
        return (
          <div>
            <div className="page-title-section">
              <h2>סיכום בחירות דייר וחתימה</h2>
              <p className="page-intro-text">אנא עברו על הבחירות שלכם ואשרו אותן בחתימה דיגיטלית בתחתית</p>
            </div>

            {/* Red alert at top if there are unpriced items selected */}
            {pricing.unpricedItemsSelected && (
              <div className="warning-alert-banner">
                <span>⚠</span>
                ישנם פריטים שנבחרו ללא מחיר סופי (למשל וילה ללא מחיר מיזוג אוויר) – יש לפנות למתאמת השינויים להשלמת המחיר לפני חתימה סופית.
              </div>
            )}

            {/* Selections Table */}
            <div className="summary-table-container">
              <table className="summary-table">
                <thead>
                  <tr>
                    <th>קטגוריה</th>
                    <th>הבחירה שנבחרה</th>
                    <th>מאפיינים נוספים</th>
                    <th>כמות</th>
                    <th style={{ textAlign: 'left' }}>תוספת תשלום (₪)</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Aluminum */}
                  <tr>
                    <td><strong>אלומיניום (ויטרינה)</strong></td>
                    <td>{ALUMINUM_MODELS.sliding.find(m => m.id === aluminum.selectedSliding)?.name}</td>
                    <td>פרופיל: {aluminum.profileColor} · צלונים: {aluminum.blindsColor}</td>
                    <td>{aluminum.slidingQty} מ"ר</td>
                    <td style={{ textAlign: 'left', fontWeight: 'bold' }}>
                      ₪{((ALUMINUM_MODELS.sliding.find(m => m.id === aluminum.selectedSliding)?.price || 0) * aluminum.slidingQty).toLocaleString()}
                    </td>
                  </tr>
                  <tr>
                    <td><strong>אלומיניום (חלון)</strong></td>
                    <td>{ALUMINUM_MODELS.window.find(m => m.id === aluminum.selectedWindow)?.name}</td>
                    <td>פרופיל: {aluminum.profileColor} · צלונים: {aluminum.blindsColor}</td>
                    <td>{aluminum.windowQty} מ"ר</td>
                    <td style={{ textAlign: 'left', fontWeight: 'bold' }}>
                      ₪{((ALUMINUM_MODELS.window.find(m => m.id === aluminum.selectedWindow)?.price || 0) * aluminum.windowQty).toLocaleString()}
                    </td>
                  </tr>
                  <tr>
                    <td><strong>אלומיניום (דלת כנף)</strong></td>
                    <td>{ALUMINUM_MODELS.door.find(m => m.id === aluminum.selectedDoor)?.name}</td>
                    <td>פרופיל: {aluminum.profileColor} · צלונים: {aluminum.blindsColor}</td>
                    <td>{aluminum.doorQty} יח'</td>
                    <td style={{ textAlign: 'left', fontWeight: 'bold' }}>
                      ₪{((ALUMINUM_MODELS.door.find(m => m.id === aluminum.selectedDoor)?.price || 0) * aluminum.doorQty).toLocaleString()}
                    </td>
                  </tr>

                  {/* Stairs (only when relevant to this villa) */}
                  {!isSingleStoryVilla && (
                    <tr>
                      <td><strong>מדרגות</strong></td>
                      <td>{STAIRS_OPTIONS.find(o => o.id === stairs)?.name}</td>
                      <td>{showStairsFlightQty ? `${stairsFlightQty} גרמים` : '—'}</td>
                      <td>1</td>
                      <td style={{ textAlign: 'left', fontWeight: 'bold' }}>
                        {STAIRS_OPTIONS.find(o => o.id === stairs)?.price === 0 ? 'כלול בסטנדרט' : `₪${STAIRS_OPTIONS.find(o => o.id === stairs)?.price.toLocaleString()}`}
                      </td>
                    </tr>
                  )}

                  {/* Railings */}
                  <tr>
                    <td><strong>מעקות</strong></td>
                    <td>{RAILINGS_OPTIONS.find(o => o.id === railings)?.name}</td>
                    <td>גוון: {railingsColor}</td>
                    <td>{railingsQty} מ"א</td>
                    <td style={{ textAlign: 'left', fontWeight: 'bold' }}>
                      {RAILINGS_OPTIONS.find(o => o.id === railings)?.price === 0 ? 'כלול בסטנדרט' : `₪${(RAILINGS_OPTIONS.find(o => o.id === railings)?.price * railingsQty).toLocaleString()}`}
                    </td>
                  </tr>

                  {/* Kitchen */}
                  <tr>
                    <td><strong>מטבח</strong></td>
                    <td>{kitchen.planApproved ? 'תכנית מאושרת' : 'טרם אושרה'}</td>
                    <td>גוון: {kitchen.color || 'לא נבחר'}</td>
                    <td>—</td>
                    <td style={{ textAlign: 'left', fontWeight: 'bold' }}>
                      {kitchen.cost ? `₪${Number(kitchen.cost).toLocaleString()}` : 'יעודכן ע"י מתאמת השינויים'}
                    </td>
                  </tr>

                  {/* Plaster thermal render add-on */}
                  <tr>
                    <td><strong>תוספת טיח (שליכט תרמי)</strong></td>
                    <td>{plasterThermalRender ? 'כן — שליכט תרמי פלס' : 'ללא תוספת'}</td>
                    <td>גרגור 200</td>
                    <td>—</td>
                    <td style={{ textAlign: 'left', fontWeight: 'bold' }}>
                      {plasterThermalRender ? `₪${PLASTER_THERMAL_RENDER_PRICE.toLocaleString()}` : 'כלול בסטנדרט'}
                    </td>
                  </tr>

                  {/* Pergola */}
                  <tr>
                    <td><strong>פרגולה</strong></td>
                    <td>{PERGOLA_OPTIONS.find(o => o.id === pergola)?.name}</td>
                    <td>—</td>
                    <td>{pergolaQty} מ"ר</td>
                    <td style={{ textAlign: 'left', fontWeight: 'bold' }}>
                      {PERGOLA_OPTIONS.find(o => o.id === pergola)?.price === 0 ? 'כלול בסטנדרט' : `₪${((PERGOLA_OPTIONS.find(o => o.id === pergola)?.price || 0) * pergolaQty).toLocaleString()}`}
                    </td>
                  </tr>

                  {/* Exterior Door */}
                  <tr>
                    <td><strong>דלת חוץ</strong></td>
                    <td>{EXT_DOORS_OPTIONS.find(o => o.id === extDoor)?.name}</td>
                    <td>—</td>
                    <td>1</td>
                    <td style={{ textAlign: 'left', fontWeight: 'bold' }}>
                      {EXT_DOORS_OPTIONS.find(o => o.id === extDoor)?.price === 0 ? 'כלול בסטנדרט' : `₪${(EXT_DOORS_OPTIONS.find(o => o.id === extDoor)?.price || 0).toLocaleString()}`}
                    </td>
                  </tr>

                  {/* Interior Door */}
                  <tr>
                    <td><strong>דלתות פנים</strong></td>
                    <td>{INT_DOORS_OPTIONS.find(o => o.id === intDoor.selectedOption)?.name}</td>
                    <td>
                      גוון: {intDoor.color || 'ללא בחירה'} · ספק: {INT_DOORS_OPTIONS.find(o => o.id === intDoor.selectedOption)?.supplier}
                      {intDoor.mamadWoodLeaf && ` · תוספת עץ לממ"ד (${intDoor.mamadWoodLeafQty})`}
                    </td>
                    <td>{intDoor.doorCount} יח'</td>
                    <td style={{ textAlign: 'left', fontWeight: 'bold' }}>
                      ₪{(
                        (INT_DOORS_OPTIONS.find(o => o.id === intDoor.selectedOption)?.price || 0) * intDoor.doorCount +
                        (intDoor.mamadWoodLeaf ? MAMAD_WOOD_LEAF_PRICE * intDoor.mamadWoodLeafQty : 0)
                      ).toLocaleString()}
                    </td>
                  </tr>

                  {/* Entrance Path */}
                  <tr>
                    <td><strong>שביל כניסה</strong></td>
                    <td>{PATH_OPTIONS.find(o => o.id === path)?.name}</td>
                    <td>—</td>
                    <td>{PATH_OPTIONS.find(o => o.id === path)?.price > 0 ? `${pathQty} מ"ר` : '—'}</td>
                    <td style={{ textAlign: 'left', fontWeight: 'bold' }}>
                      {PATH_OPTIONS.find(o => o.id === path)?.price === 0
                        ? 'כלול בסטנדרט'
                        : `₪${((PATH_OPTIONS.find(o => o.id === path)?.price || 0) * pathQty).toLocaleString()}`}
                    </td>
                  </tr>

                  {/* Underfloor heating */}
                  <tr>
                    <td><strong>חימום תת רצפתי</strong></td>
                    <td>{underfloorHeating.selected ? 'הכנה על בסיס מים' : 'ללא'}</td>
                    <td>—</td>
                    <td>{underfloorHeating.selected ? `${underfloorHeating.sqm} מ"ר` : '—'}</td>
                    <td style={{ textAlign: 'left', fontWeight: 'bold' }}>
                      {underfloorHeating.selected ? `₪${(UNDERFLOOR_HEATING_PRICE_PER_SQM * (underfloorHeating.sqm || 0)).toLocaleString()}` : '₪0'}
                    </td>
                  </tr>

                  {/* Aircon */}
                  <tr>
                    <td><strong>מיזוג אוויר</strong></td>
                    <td>{airconOptOut ? 'לא דרך הקבלן' : 'ערכת תדיראן (קבלן)'}</td>
                    <td>—</td>
                    <td>1</td>
                    <td style={{ textAlign: 'left', fontWeight: 'bold' }}>
                      {airconOptOut ? '₪0' : (AIRCON_PRICING[Number(villaNumber)] != null ? `₪${AIRCON_PRICING[Number(villaNumber)].toLocaleString()}` : 'יש להשלים מחיר')}
                    </td>
                  </tr>

                  {/* Electricity & Plumbing (one row per point type actually requested) */}
                  {electricity.hasChanges && ELECTRICITY_POINT_TYPES.some(t => electricity.points[t.id]?.length > 0) ? (
                    ELECTRICITY_POINT_TYPES.filter(t => electricity.points[t.id]?.length > 0).map(type => (
                      <tr key={type.id}>
                        <td><strong>{type.name}</strong></td>
                        <td>{electricity.points[type.id].map((p, i) => `${i + 1}) ${p.note || 'ללא הערה'}`).join(' · ')}</td>
                        <td>—</td>
                        <td>{electricity.points[type.id].length} נק'</td>
                        <td style={{ textAlign: 'left', fontWeight: 'bold' }}>
                          ₪{(type.price * electricity.points[type.id].length).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td><strong>שינויי חשמל אינסטלציה ובינוי</strong></td>
                      <td>ללא שינויים</td>
                      <td>—</td>
                      <td>—</td>
                      <td style={{ textAlign: 'left', fontWeight: 'bold' }}>₪0</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Financial Summary */}
            <div className="summary-financial-box">
              <div className="financial-row">
                <span>סכום ביניים שדרוגים (לפני מע"מ):</span>
                <strong>₪{pricing.subtotal.toLocaleString()}</strong>
              </div>
              <div className="financial-row">
                <span>מע"מ (18%):</span>
                <strong>₪{pricing.vat.toLocaleString()}</strong>
              </div>
              <div className="financial-row total">
                <span>סה"כ תוספת לתשלום:</span>
                <strong>
                  ₪{pricing.total.toLocaleString()}
                  {pricing.unpricedItemsSelected && <span style={{ fontSize: '0.85rem', display: 'block', fontWeight: 'normal', color: 'var(--red-text)' }}>(אומדן חלקי בלבד)</span>}
                </strong>
              </div>
              {pricing.unpricedItemsSelected && (
                <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '0.5rem', lineHeight: '1.3' }}>
                  * הסכום אינו כולל פריטים שנבחרו ללא מחיר סופי — יש לפנות למתאמת השינויים.
                </div>
              )}
            </div>

            {/* Item 14: notes, grouped by the section they were written in */}
            {Object.entries(stepNotes).some(([, note]) => note && note.trim()) && (
              <div className="selection-details-panel" style={{ marginTop: '2rem' }}>
                <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem', fontFamily: 'var(--font-serif)' }}>הערות הדייר, לפי פרק:</h3>
                {STEPS.filter(s => stepNotes[s.id] && stepNotes[s.id].trim()).map(s => (
                  <div key={s.id} className="panel-row" style={{ flexDirection: 'column', alignItems: 'stretch', marginBottom: '0.75rem' }}>
                    <strong>{s.label}:</strong>
                    <span>{stepNotes[s.id]}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="selection-details-panel" style={{ marginTop: '1.5rem' }}>
              <div className="swatch-label">הערה נוספת לפרק הסיכום:</div>
              <textarea
                className="form-control"
                style={{ width: '100%', minHeight: '80px', marginTop: '0.5rem' }}
                value={stepNotes[LAST_STEP_ID] || ''}
                onChange={(e) => updateStepNote(LAST_STEP_ID, e.target.value)}
              />
            </div>

            {/* Confirmation & Signature Pad */}
            <div style={{ marginTop: '3rem', borderTop: '1px solid var(--line)', paddingTop: '2rem' }}>
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={isConfirmed}
                  onChange={(e) => setIsConfirmed(e.target.checked)}
                />
                <span className="checkbox-text">
                  אני מאשר/ת כי כל הבחירות המופיעות בטבלה לעיל בוצעו על דעתי, מהוות הנחיה סופית לביצוע בשטח וכי קראתי את כל מפרטי הדלתות וההתקנה (לרבות הערת המשקוף העיוור והגדלת פתחי בנייה לאופציה ג').
                </span>
              </label>

              <div className="signature-panel">
                <h4 style={{ marginBottom: '1rem', fontFamily: 'var(--font-sans)', fontSize: '1.1rem' }}>
                  {isCoordinator ? 'חתימת מתאמת השינויים בשם הדייר:' : 'חתימת הדייר (חתמו באמצעות העכבר או מגע בנייד):'}
                </h4>

                <div className="signature-canvas-container">
                  <canvas
                    ref={canvasRef}
                    className="signature-canvas"
                    width={480}
                    height={180}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                  />
                  {!hasSignature && (
                    <div className="signature-canvas-label">כאן חותמים</div>
                  )}
                </div>

                <div className="signature-actions">
                  <button type="button" className="btn btn-secondary" onClick={clearCanvas}>נקה חתימה</button>
                  <span className="muted-text" style={{ alignSelf: 'center' }}>
                    {hasSignature ? '✓ החתימה נקלטה' : 'טרם נחתם'}
                  </span>
                </div>
              </div>
            </div>

            {/* Submit Block */}
            <div style={{ textAlign: 'center', margin: '3rem 0' }}>
              {isCoordinator && (
                <button type="button" className="btn btn-secondary" style={{ marginBottom: '1rem' }} onClick={handleCoordinatorSave}>
                  💾 שמירת התקדמות (ללא חתימה סופית)
                </button>
              )}
              {pricing.unpricedItemsSelected ? (
                <div className="warning-alert-banner" style={{ display: 'inline-flex', maxWidth: '600px', textAlign: 'right' }}>
                  <span>⚠</span> לא ניתן לשלוח את הטופס לאישור סופי כיוון שישנם פריטים שנבחרו ללא מחיר. אנא פנו למתאמת השינויים להשלמת המחיר.
                </div>
              ) : (
                <button
                  type="button"
                  className="btn btn-accent"
                  style={{ padding: '1rem 3rem', fontSize: '1.2rem' }}
                  disabled={!isConfirmed || !hasSignature}
                  onClick={handleSubmit}
                >
                  שלח לאישור מנהל פרויקט
                </button>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Coordinator mode: show a loading/error state while the villa data is being fetched
  if (coordinatorVillaParam && coordinatorLoadStatus !== 'ready') {
    return (
      <div className="app-container">
        <main className="main-content" style={{ textAlign: 'center', paddingTop: '4rem' }}>
          {coordinatorLoadStatus === 'loading' ? (
            <p>טוען את נתוני וילה {coordinatorVillaParam}...</p>
          ) : (
            <div className="warning-alert-banner" style={{ display: 'inline-flex' }}>
              <span>⚠</span> לא נמצאה וילה {coordinatorVillaParam}, או שאירעה שגיאה בטעינה.
            </div>
          )}
        </main>
      </div>
    );
  }

  // Render Submitted successfully page
  if (isSubmitted) {
    return (
      <div className="app-container">
        <header className="sticky-header">
          <div className="header-top">
            <div className="logo-container">
              <div className="logo-placeholder">נו</div>
              <span className="project-title">נופיה אלפי מנשה</span>
            </div>
            <div className="developer-tag">וילה {villaNumber} · {tenantName}</div>
          </div>
        </header>
        
        <main className="main-content">
          <div className="success-card">
            <div className="success-icon">✓</div>
            <h2>הבחירות נשלחו בהצלחה!</h2>
            <p style={{ marginTop: '1rem', fontSize: '1.15rem' }}>
              תודה <strong>{tenantName}</strong>, מפרט שינויי הדיירים לשלב ב' עבור וילה <strong>{villaNumber}</strong> נחתם דיגיטלית ונשלח לאישור חברת הניהול "מהיסוד".
            </p>
            <p className="muted-text" style={{ marginTop: '1rem' }}>
              עותק מודפס ומסוכם יישלח לכתובת המייל המעודכנת במשרדי הרישום.
            </p>
            <button 
              type="button" 
              className="btn btn-primary" 
              style={{ marginTop: '2rem' }}
              onClick={() => {
                setIsSubmitted(false);
                setIsConfirmed(false);
                setHasSignature(false);
                setIsLoggedIn(false);
                setCurrentStep(0);
              }}
            >
              חזרה לדף הבית
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Sticky top Navigation & Logo */}
      <header className="sticky-header">
        <div className="header-top">
          <div className="logo-container">
            <div className="logo-placeholder">נו</div>
            <div>
              <span className="project-title">נופיה אלפי מנשה</span>
              <span className="muted-text" style={{ display: 'block', fontSize: '0.8rem', marginTop: '-0.2rem' }}>ניהול: חברת "מהיסוד"</span>
            </div>
          </div>
          {isLoggedIn && (
            <div className="developer-tag">
              וילה {villaNumber} · {tenantName}
            </div>
          )}
        </div>

        {/* Step progress horizontal bar (only visible if logged in) */}
        {isLoggedIn && (
          <div className="steps-nav-wrapper">
            <div className="steps-container">
              {visibleSteps.map((step) => {
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;
                return (
                  <div 
                    key={step.id} 
                    className={`step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                    onClick={() => setCurrentStep(step.id)}
                  >
                    <div className="step-dot-container">
                      <div className="step-diamond">
                        <div className="step-diamond-inner">{step.id}</div>
                      </div>
                    </div>
                    <span className="step-label">{step.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* Main Screen Container. Item 1: tenants get view-only on every step except the final
          signature page. Uses a CSS class (not a blanket pointer-events style) so selection
          controls (option cards, steppers, checkboxes, inputs) get locked while links, info/spec
          buttons and image zoom stay clickable — a tenant must still be able to open a plan link
          or read a full spec while in view-only mode. */}
      <main className={`main-content${viewOnly ? ' view-only-lock' : ''}`}>
        {viewOnly && (
          <div className="highlight-box copper" style={{ marginBottom: '1.5rem' }}>
            <span>👁</span> מצב צפייה בלבד — הבחירה והחתימה מתבצעות בעמוד האחרון ("{STEPS[STEPS.length - 1].label}"). ניתן עדיין לפתוח קישורים ולצפות בפרטים.
          </div>
        )}
        {renderStepContent()}
        {/* Item 14: free-text note per step (excluded on welcome/intro/summary, which have their
            own dedicated note UI) */}
        {isLoggedIn && currentStep > 1 && currentStep !== LAST_STEP_ID && (
          <div className="selection-details-panel" style={{ marginTop: '2rem', pointerEvents: 'auto' }}>
            <div className="swatch-label">הערה לפרק זה ({STEPS.find(s => s.id === currentStep)?.label}):</div>
            <textarea
              className="form-control"
              style={{ width: '100%', minHeight: '70px', marginTop: '0.5rem' }}
              value={stepNotes[currentStep] || ''}
              onChange={(e) => updateStepNote(currentStep, e.target.value)}
              disabled={viewOnly}
            />
          </div>
        )}
      </main>

      {/* Sticky Footer controls for navigation (only visible if logged in) */}
      {isLoggedIn && (
        <footer className="sticky-footer">
          <div className="footer-inner">
            <div className="footer-summary">
              <span className="summary-label">תוספת משוערת (כולל מע"מ):</span>
              {pricing.unpricedItemsSelected ? (
                <span className="summary-value warning">₪{pricing.total.toLocaleString()} (אומדן חלקי) ⚠</span>
              ) : (
                <span className="summary-value">₪{pricing.total.toLocaleString()}</span>
              )}
            </div>
            
            <div className="footer-right-buttons">
              {currentStep > 1 && (
                <button type="button" className="btn btn-secondary" onClick={handlePrev}>← הקודם</button>
              )}
              {currentStep !== LAST_STEP_ID ? (
                <button type="button" className="btn btn-primary" onClick={handleNext}>הבא ←</button>
              ) : (
                null
              )}
            </div>
          </div>
        </footer>
      )}

      {/* Interactive technical specification modal popup window */}
      {activeModal && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setActiveModal(null)}>&times;</button>
            <div className="modal-header">
              <h3 className="modal-title">{activeModal.title}</h3>
            </div>
            <div className="modal-body">
              {activeModal.image && (
                <img src={activeModal.image} alt={activeModal.title} className="modal-image zoomable-img" onClick={(e) => openLightbox(e, activeModal.image, activeModal.title)} />
              )}
              <div style={{ whiteSpace: 'pre-line', fontSize: '1.05rem', lineHeight: '1.6', color: 'var(--ink)' }}>
                {activeModal.content}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full-size image lightbox */}
      {lightboxImage && (
        <div className="lightbox-overlay" onClick={() => setLightboxImage(null)}>
          <button className="lightbox-close" onClick={() => setLightboxImage(null)}>&times;</button>
          <img
            src={lightboxImage.src}
            alt={lightboxImage.alt}
            className="lightbox-image"
            onClick={(e) => e.stopPropagation()}
          />
          {lightboxImage.alt && (
            <div className="lightbox-caption" onClick={(e) => e.stopPropagation()}>{lightboxImage.alt}</div>
          )}
        </div>
      )}
    </div>
  );
}
