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

import plasterNgy080Img from './assets/plaster_ngy080.jpg';
import plasterNgy070Img from './assets/plaster_ngy070.jpg';

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

import gateDrawingImg from './assets/gate_drawing.jpg';
import gatePhotoImg from './assets/gate_photo.jpg';

// Structured data constants for models, specifications, and prices
const ALUMINUM_MODELS = {
  sliding: [
    { 
      id: 'model_7500', 
      name: 'פרופיל 7500 (ויטרינה)', 
      price: 1200, 
      unit: 'מ"ר', 
      desc: 'נעילה רב נקודתית, ידית בלגי/אופיס, זיגוג 4–22 מ"מ.',
      fullSpec: '• מנגנון נעילה רב נקודתית לבטיחות משופרת.\n• ידית בלגי/אופיס מעוצבת.\n• זיגוג עובי 4–22 מ"מ.\n• שילוב רשת הזזה אינטגרלית.\n• תריס רפפה / מונובלוק / ארגז סמוי דגם "פירנצה" לבחירה.'
    },
    { 
      id: 'model_7600', 
      name: 'פרופיל 7600 (ויטרינה)', 
      price: 1800, 
      unit: 'מ"ר', 
      desc: 'אביזרים מקוריים, נעילה רב נקודתית, ידית באוהאוס, זיגוג 6–12 מ"מ.',
      fullSpec: '• אביזרים מקוריים מבית קליל.\n• מנגנון נעילה רב נקודתית.\n• ידית דגם באוהאוס יוקרתית.\n• זיגוג 6–12 מ"מ מונוליט / טריפלקס.\n• או זיגוג 14–28 מ"מ בידודית למניעת רעש ואיבוד אנרגיה.'
    },
    { 
      id: 'model_2200', 
      name: 'פרופיל 2200 (ויטרינה)', 
      price: 2200, 
      unit: 'מ"ר', 
      desc: 'ידיות בלגי/אופיס, גלגלים למשקל כבד, סרגל זיגוג.',
      fullSpec: '• ידיות בלגי/אופיס מיוחדות.\n• גלגלים מיוחדים מחוזקים למשקל כבד, לתנועה חלקה וארוכת טווח.\n• זיגוג זכוכית ע"י סרגל זיגוג ייחודי.\n• זיגוג 6–13 מ"מ מונוליטי או 14–47 מ"מ בידודית יוקרתית.'
    },
    { 
      id: 'model_9400', 
      name: 'פרופיל 9400 (ויטרינה)', 
      price: 2000, 
      unit: 'מ"ר', 
      desc: 'מנעול רב נקודתי, גודל כנף מקסימלי, רשת פליסה.',
      fullSpec: '• מנגנון נעילה רב נקודתית אינטגרלי.\n• מיועד לגודל כנף מקסימלי: 180/280 ס"מ או 160/300 ס"מ למראה פנורמי רחב.\n• זיגוג 6–12 מ"מ או 14–24 מ"מ בידודית.\n• רשת פליסה מתקפלת יוקרתית ומעוצבת מובנית.'
    }
  ],
  window: [
    { 
      id: 'model_7000', 
      name: 'פרופיל 7000 (חלון קבוע/הזזה)', 
      price: 1300, 
      unit: 'מ"ר', 
      desc: 'אביזרים מקוריים, זיגוג 3–11 מ"מ, מג\'קליל.',
      fullSpec: '• אביזרים מקוריים מבית קליל.\n• זיגוג עובי 3–11 מ"מ או 14–18 מ"מ בידודית.\n• שילוב פטנט "מג\'קליל" המאפשר ניקוי קל ובטיחותי של שני צידי החלון מתוך הבית.'
    },
    { 
      id: 'model_1600', 
      name: 'פרופיל 1600 (חלון קבוע/הזזה)', 
      price: 1600, 
      unit: 'מ"ר', 
      desc: 'נעילה רב נקודתית, ידית מינימליסטית, רשת צרה.',
      fullSpec: '• מנגנון נעילה רב נקודתית נסתר.\n• ידית מעוצבת בסגנון מינימליסטי מודרני.\n• זיגוג 6–18 מ"מ.\n• כולל רשת הזזה עם פרופילים צרים במיוחד למעבר אור מקסימלי.'
    }
  ],
  door: [
    { 
      id: 'model_5500', 
      name: 'פרופיל 5500 (דלת כנף)', 
      price: 4000, 
      unit: 'קומפלט', 
      desc: 'ידיות בלגי BASIC, צלון פנימי, שילוב תריס גלילה.',
      fullSpec: '• ידיות בלגי BASIC מעוצבות.\n• זיגוג בידודי עם צלון פנימי מובנה (לבחירה הפעלה חשמלית או ידנית).\n• שילוב תריס גלילה או תריס רפפה בהתאמה עיצובית.'
    },
    { 
      id: 'model_4350', 
      name: 'פרופיל 4350 (דלת כנף)', 
      price: 4200, 
      unit: 'קומפלט', 
      desc: 'דלת ציר במפרט בסיסי איכותי.',
      fullSpec: '• דלת כנף/ציר מאלומיניום מחוזק.\n• מתאימה ליציאה למרפסות שירות או חצרות אחוריות.\n• אביזרי נעילה סטנדרטיים ואיטום גומי כפול.'
    },
    { 
      id: 'model_5600', 
      name: 'פרופיל 5600 (דלת כנף)', 
      price: 6000, 
      unit: 'קומפלט', 
      desc: 'ידית מינימליסטית, רשת פליסה, תריס נפתח החוצה.',
      fullSpec: '• ידית מעוצבת מינימליסטית יוקרתית.\n• זיגוג 4–24 מ"מ.\n• רשת פליסה מתקפלת או דלת רשת על ציר לבחירה.\n• תריס בלגי דגם 1300 המותקן עם פתיחה כלפי חוץ לשמירה על מרחב החדר.'
    }
  ]
};

const STAIRS_OPTIONS = [
  { id: 1, name: 'מדרגות סטנדרטיות (בטון, תחתית חלקה)', price: 0, desc: 'מדרגות בטון יצוקות בעלות תחתית ישרה חלקה. כלול במפרט ללא תוספת עלות.', image: stairsStandardImg },
  { id: 2, name: 'מדרגות משוננות (בטון, תחתית משוננת)', price: 15000, desc: 'מדרגות בטון מעוצבות שבהן גם החלק התחתון בנוי בצורה משוננת המלווה את שלבי המדרגות. מראה עיצובי מודרני.', image: stairsSawtoothImg },
  { id: 3, name: 'מדרגות קלות (קונסטרוקציה + עץ גושני)', price: 45000, desc: 'מדרגות קלות ומרחפות המבוססות על קונסטרוקציית פלדה כבדה ומדרכי עץ גושני יוקרתי, למראה אוורירי ופתוח.', image: stairsLightweightImg }
];

const RAILINGS_OPTIONS = [
  { id: 1, name: 'מעקה אנכי (סטנדרטי)', price: 0, desc: 'מעקה ברזל בעל שלבים אנכיים פשוטים ונקיים. מותקן בגוון שחור. כלול בסטנדרט.', image: railingVerticalImg },
  { id: 2, name: 'מעקה ברקוד (משודרג)', price: null, desc: 'מעקה ברזל מעוצב במרווחים משתנים דמויי קוד ברקוד מודרני, בגוון שחור. מראה ייחודי ומתוחכם.', image: railingBarcodeImg },
  { id: 3, name: 'מעקה אקספנדד (פרימיום)', price: null, desc: 'מעקה פח רשת מתוח (Expanded Metal) יוקרתי, בגוון שחור. בידוד ויזואלי קל ומראה תעשייתי יוקרתי.', image: railingExpandedImg }
];

// Price per sqm from "חוברת תוספות ומחירים.xlsx" — the brochure didn't distinguish a
// premium price for the steel-reinforced option, so both use the same rate for now.
const PERGOLA_OPTIONS = [
  { id: 1, name: 'פרגולת אלומיניום (משודרג)', price: 1100, unit: 'מ"ר', desc: 'פרגולה עשויה שלדות אלומיניום מחוזקות, עמידות מקסימלית למים ולשמש.', image: pergolaAluminumImg },
  { id: 2, name: 'אלומיניום בשילוב פלדה (פרימיום)', price: 1100, unit: 'מ"ר', desc: 'פרגולת אלומיניום יוקרתית המשלבת קונסטרוקציית פלדה כבדה לעמידות מוגברת ומפתחים רחבים במיוחד.', image: pergolaAlusteelImg }
];

// Flat price per unit from "חוברת תוספות ומחירים.xlsx" (שדרוג דלת כניסה חוץ) — applies
// equally to all three models since the brochure doesn't price them individually.
const EXT_DOORS_OPTIONS = [
  {
    id: 1,
    name: 'דלת חוץ דגם גארדה (סטנדרטי)',
    price: 6500,
    desc: 'דלת פלדה דגם גארדה. מוצגת בגוון אפור בטון גובה 260 ס"מ.',
    image: doorGardaImg,
    fullSpec: '• דגם גארדה המקורי - שילוב של פלדה מחוזקת וגוון אפור בטון מודרני.\n• מנגנון נעילה מוגבר SMART.\n• משקל דלת כ-50 ק"ג עם איטום אקוסטי משופר.\n• רוחב פתח 580-1200 מ"מ / גובה 1890-2400 מ"מ.'
  },
  {
    id: 2,
    name: 'דלת חוץ דגם מינימאל (משודרג)',
    price: 6500,
    desc: 'דלת חוץ מעוצבת בקו נקי מינימליסטי ויוקרתי.',
    image: doorMinimalImg,
    fullSpec: '• מפרט בסיסי זהה לדגם גארדה.\n• מראה חלק ללא חלוקות או קישוטים, מתאימה לעיצוב קירות חלקים.\n• ללא הגדרת גוון או גובה ספציפיים מראש.'
  },
  {
    id: 3,
    name: 'דלת חוץ דגם שחר (משודרג)',
    price: 6500,
    desc: 'דלת חוץ מעוצבת דגם שחר בעלת חלוקות רוחביות.',
    image: doorShacharImg,
    fullSpec: '• מפרט עמיד ואקוסטי דומה לדגם גארדה.\n• מידות טכניות: רוחב 460-1200 מ"מ / גובה 1890-2310 מ"מ.'
  }
];

const INT_DOORS_OPTIONS = [
  {
    id: 'A',
    name: 'אופציה א\' - אקוודור נאפולי (פורמייקה)',
    priceDry: 1200,
    priceWet: 1245,
    colors: ['לבן', 'שמנת', 'אגוז', 'אלון מולבן לאורך'],
    supplier: 'חמדיה',
    desc: 'דלת איכותית מחופה פורמייקה 2 מ"מ מבית חמדיה.',
    image: doorIntAImg,
    fullSpec: '• מילוי פנימי: פלקסבורד (Flexboard) מבודד רעשים.\n• ציפוי כנף: פורמייקה עבה 2 מ"מ עמידה בפני שריטות.\n• משקופים והלבשות: WPC עמיד מים (7 ס"מ) בתחתית.\n• אביזרים: ידית "בולוניה", מנעול מגנטי שקט, מעצור דלת מובנה.\n• חדרי שינה: כולל מנעול תפוס-פנוי והתקנה.\n• חדרים רטובים: כולל מנעול תפוס-פנוי, צוהר מעוצב והתקנה.'
  },
  {
    id: 'B',
    name: 'אופציה ב\' - אקוודור דרימקולור (שלייפלק)',
    priceDry: 1600,
    priceWet: 1645,
    colors: ['שלייפלק לבן', 'שלייפלק שמנת'],
    supplier: 'חמדיה',
    desc: 'דלת בצביעה אטומה איכותית (שלייפלק בתנור) מבית חמדיה.',
    image: doorIntBImg,
    fullSpec: '• מילוי פנימי: פלקסבורד (Flexboard) אקוסטי.\n• גימור: צבע שלייפלק מטאלי בתנור בעל מראה חלק ומבריק.\n• משקופים והלבשות: WPC עמיד מים (7 ס"מ).\n• אביזרים: ידית "בולוניה", מנעול מגנטי שקט, מעצור דלת.\n• חדרי שינה: כולל מנעול תפוס-פנוי והתקנה.\n• חדרים רטובים: כולל מנעול תפוס-פנוי, צוהר מעל הידית והתקנה.'
  },
  {
    id: 'C',
    name: 'אופציה ג\' - אקוודור בקו אפס',
    priceDry: 2200,
    priceWet: 2245,
    colors: ['לבן', 'שמנת'],
    supplier: 'חמדיה',
    desc: 'משקוף והלבשות נסתרים בקו הקיר, צירים סמויים, כנף שלייפלק.',
    image: doorIntCImg,
    fullSpec: '• משקוף והלבשות נסתרים המותקנים בקו אחד עם הקיר (קו אפס).\n• צירים סמויים מתכווננים.\n• כנף דלת שלייפלק (דגם נאפולי) עם מילוי פלקסבורד.\n• אביזרים: ידית "בולוניה" יוקרתית, מנעול מגנטי, מעצור דלת.\n• חדרי שינה: כולל מנעול תפוס-פנוי והתקנה.\n• חדרים רטובים: כולל מנעול תפוס-פנוי, צוהר מעל הידית והתקנה.\n\n⚠ הערת מפתחים חשובה: דלתות קו אפס מצריכות הגדלת פתחי הבנייה ב-5 ס"מ בהתאם לתקן חמדיה.'
  },
  {
    id: 'D',
    name: 'אופציה ד\' - TOP ZERO פרימיום',
    priceDry: null,
    priceWet: null,
    colors: [],
    supplier: 'רב-בריח',
    desc: 'מפרט קו אפס יוקרתי מבית רב-בריח. ללא תמחור בחוברת.',
    image: null,
    fullSpec: '• יצרן: רב-בריח.\n• אחריות: 10 שנות אחריות מלאה לנזקי מים.\n• מילוי פנימי: פלקסבורד אקוסטי עבה לבידוד מירבי.\n• גובה: 220–240 ס"מ מהריצוף הסופי (דלתות גבוהות ומרשימות).\n• תחתית דלת: 7 ס"מ סגסוגת פולימר מוגנת מים.\n• גימור כנף: פורמייקה 1.8 מ"מ יוקרתית.'
  }
];

// Premium options (3 & 4) priced per sqm from "חוברת תוספות ומחירים.xlsx" (שבילי פיתוח
// וריצוף חוץ) — the two standard options stay included/₪0 regardless of area.
const PATH_OPTIONS = [
  { id: 1, name: 'יציקת שביל כניסה – בטון מסורק (סטנדרט)', price: 0, desc: 'יציקת בטון בגימור מסורק למניעת החלקה. כלול במפרט ללא עלות נוספת.', image: pathConcreteNewImg },
  { id: 2, name: 'ריצוף משתלבות – אבן הרובע אומבריאנו (סטנדרט)', price: 0, desc: 'ריצוף אבנים משתלבות מבית אומבריאנו. בחירה וגוון סופי ייקבעו בהמשך מול ספק הכלים הסניטריים.', image: pathTravertineImg },
  { id: 3, name: 'ריצוף השביל בתיאום משטחים תחת פרגולה (משודרג)', price: 350, unit: 'מ"ר', desc: 'ריצוף שביל כניסה בהמשכיות ושלמות עיצובית עם משטח הפרגולה.', image: pathPaversImg },
  { id: 4, name: 'יציקת שביל כניסה – בטון מוחלק (פרימיום)', price: 350, unit: 'מ"ר', desc: 'יציקת בטון פרימיום בגימור מוחלק ומלוטש למראה מודרני מבריק.', image: pathConcreteFinishedImg }
];

// Real profile / blinds colour swatches (from the brochure's colour chart)
const ALUMINUM_COLORS = [
  { name: 'ירוק אפור 281', image: aluminumColorGreenGray },
  { name: 'שחור אוניקס', image: aluminumColorOnyx },
  { name: 'אפור', image: aluminumColorGray },
  { name: 'Meteorite', image: aluminumColorMeteorite }
];

// Real exterior-plaster colour swatches (Extra White has no illustrative image in the brochure)
const PLASTER_COLORS = [
  { name: 'Extra White', image: null },
  { name: 'אפור פישתן NGY 080', image: plasterNgy080Img },
  { name: 'אפור עלווה NGY 070', image: plasterNgy070Img }
];

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

const STEPS = [
  { id: 0, label: 'ברוכים הבאים', icon: '👋' },
  { id: 1, label: 'הסבר שלב ב\'', icon: '📝' },
  { id: 2, label: 'אלומיניום', icon: '🖼️' },
  { id: 3, label: 'מדרגות', icon: '🪜' },
  { id: 4, label: 'מעקות', icon: '⛓️' },
  { id: 5, label: 'טיח חוץ', icon: '🎨' },
  { id: 6, label: 'פרגולה', icon: '⛱️' },
  { id: 7, label: 'דלתות חוץ', icon: '🚪' },
  { id: 8, label: 'דלתות פנים', icon: '🚪' },
  { id: 9, label: 'שביל כניסה', icon: '🛣️' },
  { id: 10, label: 'שערים וגדרות', icon: '🚧' },
  { id: 11, label: 'חשמל ומים', icon: '🔌' },
  { id: 12, label: 'סיכום וחתימה', icon: '✍️' }
];

export default function App() {
  // Restore any in-progress draft saved locally so a refresh doesn't lose selections
  const saved = loadSavedDraft();

  // Global States
  const [villaNumber, setVillaNumber] = useState(() => saved.villaNumber ?? '14');
  const [tenantName, setTenantName] = useState(() => saved.tenantName ?? 'ישראל ישראלי');
  const [isLoggedIn, setIsLoggedIn] = useState(() => saved.isLoggedIn ?? false);
  const [currentStep, setCurrentStep] = useState(() => saved.currentStep ?? 0);

  // Form selections state
  const [aluminum, setAluminum] = useState(() => saved.aluminum ?? {
    selectedSliding: 'model_7500',
    slidingQty: 10,
    selectedWindow: 'model_7000',
    windowQty: 5,
    selectedDoor: 'model_5500',
    doorQty: 1,
    profileColor: 'ירוק אפור 281',
    blindsColor: 'שחור אוניקס'
  });

  const [stairs, setStairs] = useState(() => saved.stairs ?? 1); // STAIRS_OPTIONS ID
  const [railings, setRailings] = useState(() => saved.railings ?? 1); // RAILINGS_OPTIONS ID

  const [plaster, setPlaster] = useState(() => saved.plaster ?? {
    mainColor: 'Extra White (לבן)',
    accentColor: 'אפור פישתן NGY080'
  });

  const [pergola, setPergola] = useState(() => saved.pergola ?? 1); // PERGOLA_OPTIONS ID
  const [pergolaQty, setPergolaQty] = useState(() => saved.pergolaQty ?? 20); // sqm
  const [extDoor, setExtDoor] = useState(() => saved.extDoor ?? 1); // EXT_DOORS_OPTIONS ID

  const [intDoor, setIntDoor] = useState(() => saved.intDoor ?? {
    selectedOption: 'A', // INT_DOORS_OPTIONS ID ('A', 'B', 'C', 'D')
    dryQty: 5,
    wetQty: 2,
    color: 'לבן'
  });

  const [path, setPath] = useState(() => saved.path ?? 1); // PATH_OPTIONS ID
  const [pathQty, setPathQty] = useState(() => saved.pathQty ?? 40); // sqm, only relevant for priced (premium) options

  const [electricity, setElectricity] = useState(() => saved.electricity ?? {
    hasChanges: true,
    points: {
      light: { qty: 0, notes: '' },
      water: { qty: 0, notes: '' },
      power: { qty: 0, notes: '' }
    }
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
      aluminum, stairs, railings, plaster, pergola, pergolaQty, extDoor, intDoor, path, pathQty, electricity
    };
    try {
      window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    } catch {
      // ignore storage errors (e.g. private browsing / quota)
    }
  }, [
    isSubmitted, villaNumber, tenantName, isLoggedIn, currentStep,
    aluminum, stairs, railings, plaster, pergola, pergolaQty, extDoor, intDoor, path, pathQty, electricity
  ]);

  // Reset signature confirmation when step changes
  useEffect(() => {
    if (currentStep === 12) {
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
    const option = INT_DOORS_OPTIONS.find(o => o.id === optionId);
    setIntDoor({
      ...intDoor,
      selectedOption: optionId,
      color: option.colors.length > 0 ? option.colors[0] : ''
    });
  };

  const updateElectricityPoint = (pointId, field, value) => {
    setElectricity({
      ...electricity,
      points: { ...electricity.points, [pointId]: { ...electricity.points[pointId], [field]: value } }
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

    // Stairs
    const stairsOpt = STAIRS_OPTIONS.find(o => o.id === stairs);
    if (stairsOpt) subtotal += stairsOpt.price;

    // Railings
    const railingsOpt = RAILINGS_OPTIONS.find(o => o.id === railings);
    if (railingsOpt) {
      if (railingsOpt.price === null) unpricedItemsSelected = true;
      else subtotal += railingsOpt.price;
    }

    // Pergola (priced per sqm)
    const pergolaOpt = PERGOLA_OPTIONS.find(o => o.id === pergola);
    if (pergolaOpt) {
      if (pergolaOpt.price === null) unpricedItemsSelected = true;
      else subtotal += pergolaOpt.price * pergolaQty;
    }

    // Exterior Doors
    const extDoorOpt = EXT_DOORS_OPTIONS.find(o => o.id === extDoor);
    if (extDoorOpt) {
      if (extDoorOpt.price === null) unpricedItemsSelected = true;
      else subtotal += extDoorOpt.price;
    }

    // Interior Doors
    const intDoorOpt = INT_DOORS_OPTIONS.find(o => o.id === intDoor.selectedOption);
    if (intDoorOpt) {
      if (intDoorOpt.priceDry === null) {
        unpricedItemsSelected = true;
      } else {
        subtotal += (intDoorOpt.priceDry * intDoor.dryQty) + (intDoorOpt.priceWet * intDoor.wetQty);
      }
    }

    // Entrance Path (premium options priced per sqm; standard options are ₪0 regardless)
    const pathOpt = PATH_OPTIONS.find(o => o.id === path);
    if (pathOpt) {
      if (pathOpt.price === null) unpricedItemsSelected = true;
      else subtotal += pathOpt.price * pathQty;
    }

    // Electricity & Plumbing (each point type priced and quantified separately)
    if (electricity.hasChanges) {
      ELECTRICITY_POINT_TYPES.forEach(type => {
        subtotal += type.price * (electricity.points[type.id]?.qty || 0);
      });
    }

    const vat = Math.round(subtotal * 0.18);
    const total = subtotal + vat;

    return { subtotal, vat, total, unpricedItemsSelected };
  };

  const pricing = getSelectionPricing();

  const handleNext = () => {
    if (currentStep < 12) setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
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
            payload: { aluminum, stairs, railings, plaster, pergola, pergolaQty, extDoor, intDoor, path, pathQty, electricity, pricing }
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
              <h2>הסבר על תהליך שלב ב'</h2>
              <p className="page-intro-text">בחירת אלמנטים משלימים ומפרטים טכניים לביתכם</p>
            </div>
            
            <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
              בהמשך לאישור התוכניות ולסיום הבחירות בששלב א', אנו עוברים כעת ל<strong>שלב ב'</strong>: בחירת אלמנטים שונים בבית שלכם, קבלת אומדן עלויות משודרג בזמן אמת, וחתימה דיגיטלית בסיום התהליך.
            </p>

            <h3 style={{ marginBottom: '1rem' }}>הנושאים לבחירה בתהליך:</h3>
            <div className="intro-grid">
              <div className="intro-mini-card"><span>🖼️</span> אלומיניום</div>
              <div className="intro-mini-card"><span>🪜</span> מדרגות</div>
              <div className="intro-mini-card"><span>⛓️</span> מעקות</div>
              <div className="intro-mini-card"><span>🎨</span> גוון טיח חוץ</div>
              <div className="intro-mini-card"><span>⛱️</span> פרגולות</div>
              <div className="intro-mini-card"><span>🚪</span> דלתות חוץ</div>
              <div className="intro-mini-card"><span>🚪</span> דלתות פנים</div>
              <div className="intro-mini-card"><span>🛣️</span> שביל כניסה</div>
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

      case 2: // Aluminum (Visual Swatches, Popups, Exact pricing)
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
                    <span className="price-badge upgrade">₪{model.price.toLocaleString()} / יחידה</span>
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
                    </button>
                  ))}
                </div>
              </div>
              <div className="swatch-group">
                <div className="swatch-label">גוון רפפות / צלונים:</div>
                <div className="color-photo-grid">
                  {ALUMINUM_COLORS.map(color => (
                    <button
                      key={color.name}
                      type="button"
                      className={`color-photo-btn ${aluminum.blindsColor === color.name ? 'active' : ''}`}
                      onClick={() => setAluminum({ ...aluminum, blindsColor: color.name })}
                    >
                      <img src={color.image} alt={color.name} className="color-photo-img zoomable-img" onClick={(e) => openLightbox(e, color.image, color.name)} />
                      <span className="color-photo-label">{color.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 3: // Stairs (with real generated images)
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
          </div>
        );

      case 4: // Railings (real photos + technical drawing drill-down)
        return (
          <div>
            <div className="page-title-section">
              <h2>מעקות</h2>
              <p className="page-intro-text">בחירת מעקות ברזל לבית (בגוון שחור). לחצו על התמונה לצפייה בשרטוט הטכני.</p>
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
                        <span style={{ fontSize: '0.8rem', color: 'var(--olive-dark)', cursor: 'pointer', textDecoration: 'underline' }} onClick={(e) => {
                          e.stopPropagation();
                          setActiveModal({ title: `שרטוט טכני — ${opt.name}`, content: 'מפרט מעקה: לוחות שנטו 40/10 מ"מ, גובה חזית 108–120 ס"מ, עמוד אלומיניום מנוקב 50/50/3 מ"מ, פלטת עיגון לרצפה. גוון שחור אחיד לכל דגמי המעקות בפרויקט.', image: railingDrawingImg });
                        }}>
                          🔍 שרטוט טכני
                        </span>
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
                      <span className="price-badge unpriced">יש להוסיף מחיר — פנה לחברת הניהול</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {RAILINGS_OPTIONS.find(o => o.id === railings)?.price === null && (
              <div className="unpriced-message-box" style={{ marginTop: '2rem' }}>
                <span>⚠</span> יש להוסיף מחיר – פנה לחברת הניהול
              </div>
            )}

          </div>
        );

      case 5: // Exterior Plaster (Double selection, clean color chips)
        return (
          <div>
            <div className="page-title-section">
              <h2>גוון טיח חוץ</h2>
              <p className="page-intro-text">בחירת צבעים לקירות הבית ולבליטות האדריכליות</p>
            </div>

            <div className="selection-details-panel" style={{ marginTop: '2rem' }}>
              <div className="swatch-group" style={{ marginBottom: '2.5rem' }}>
                <div className="swatch-label" style={{ fontSize: '1.1rem' }}>גוון קירות חוץ ראשיים:</div>
                <div className="color-photo-grid" style={{ marginTop: '0.5rem' }}>
                  {PLASTER_COLORS.map(color => (
                    <button
                      key={color.name}
                      type="button"
                      className={`color-photo-btn ${plaster.mainColor === color.name ? 'active' : ''}`}
                      onClick={() => setPlaster({ ...plaster, mainColor: color.name })}
                    >
                      {color.image ? (
                        <img src={color.image} alt={color.name} className="color-photo-img zoomable-img" onClick={(e) => openLightbox(e, color.image, color.name)} />
                      ) : (
                        <div className="color-photo-img color-photo-blank" />
                      )}
                      <span className="color-photo-label">{color.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="swatch-group">
                <div className="swatch-label" style={{ fontSize: '1.1rem' }}>גוון בליטות ועיטורים ארכיטקטוניים:</div>
                <div className="color-photo-grid" style={{ marginTop: '0.5rem' }}>
                  {PLASTER_COLORS.map(color => (
                    <button
                      key={color.name}
                      type="button"
                      className={`color-photo-btn ${plaster.accentColor === color.name ? 'active' : ''}`}
                      onClick={() => setPlaster({ ...plaster, accentColor: color.name })}
                    >
                      {color.image ? (
                        <img src={color.image} alt={color.name} className="color-photo-img zoomable-img" onClick={(e) => openLightbox(e, color.image, color.name)} />
                      ) : (
                        <div className="color-photo-img color-photo-blank" />
                      )}
                      <span className="color-photo-label">{color.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 6: // Pergola (priced per sqm)
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
                    <span className="price-badge upgrade">₪{opt.price.toLocaleString()} / {opt.unit}</span>
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

      case 7: // Exterior Doors (real photos per model, drill-down full spec)
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
                  style={{ minHeight: '260px' }}
                  onClick={() => setExtDoor(opt.id)}
                >
                  <div>
                    <img src={opt.image} alt={opt.name} className="card-preview-image zoomable-img" onClick={(e) => openLightbox(e, opt.image, opt.name)} />
                    <div className="option-card-header" style={{ marginTop: '0.5rem' }}>
                      <span className="option-title">{opt.name}</span>
                      <div className="select-badge">
                        {extDoor === opt.id && '✓'}
                      </div>
                    </div>
                    <p className="option-description" style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                      {opt.desc}
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
                    <span className="price-badge upgrade">₪{opt.price.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 8: // Interior Doors (Verified Hamadia specs, interactive modal)
        return (
          <div>
            <div className="page-title-section">
              <h2>דלתות פנים</h2>
              <p className="page-intro-text">בחירת דלתות מבית חמדיה ורב-בריח. לחץ "ℹ מפרט מלא" לפתיחת פרטי הדגם.</p>
            </div>

            <div className="options-grid">
              {INT_DOORS_OPTIONS.map(opt => (
                <div 
                  key={opt.id}
                  className={`option-card ${intDoor.selectedOption === opt.id ? 'selected' : ''}`}
                  onClick={() => handleIntDoorOptionChange(opt.id)}
                  style={{ minHeight: '320px' }}
                >
                  <div>
                    {opt.image ? (
                      <img src={opt.image} alt={opt.name} className="card-preview-image zoomable-img" onClick={(e) => openLightbox(e, opt.image, opt.name)} />
                    ) : (
                      <div className="card-preview-image" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--dune)' }}>
                        <span style={{ fontSize: '3rem' }}>🚪</span>
                      </div>
                    )}
                    <div className="option-card-header" style={{ marginTop: '0.5rem' }}>
                      <div>
                        <span className="option-title" style={{ display: 'block', fontSize: '1.15rem' }}>{opt.name}</span>
                        <span className="muted-text" style={{ fontSize: '0.8rem' }}>יצרן: {opt.supplier}</span>
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
                    {opt.priceDry !== null ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', alignItems: 'flex-end' }}>
                        <span className="price-badge upgrade" style={{ fontSize: '0.8rem' }}>יבש: ₪{opt.priceDry.toLocaleString()}</span>
                        <span className="price-badge upgrade" style={{ fontSize: '0.8rem' }}>רטוב: ₪{opt.priceWet.toLocaleString()}</span>
                      </div>
                    ) : (
                      <span className="price-badge unpriced" style={{ fontSize: '0.8rem' }}>יש להוסיף מחיר — פנה לחברת הניהול</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Quantities & Color selection */}
            <div className="selection-details-panel" style={{ marginBottom: '1.5rem' }}>
              <div className="panel-row">
                <span className="panel-row-label">כמות דלתות חדר יבש (שינה, סלון):</span>
                <div className="qty-stepper">
                  <button className="qty-btn" onClick={() => setIntDoor({ ...intDoor, dryQty: Math.max(0, intDoor.dryQty - 1) })}>-</button>
                  <input type="text" className="qty-value" readOnly value={intDoor.dryQty} />
                  <button className="qty-btn" onClick={() => setIntDoor({ ...intDoor, dryQty: intDoor.dryQty + 1 })}>+</button>
                </div>
              </div>
              
              <div className="panel-row">
                <span className="panel-row-label">כמות דלתות חדר רטוב (מקלחת, שירותים):</span>
                <div className="qty-stepper">
                  <button className="qty-btn" onClick={() => setIntDoor({ ...intDoor, wetQty: Math.max(0, intDoor.wetQty - 1) })}>-</button>
                  <input type="text" className="qty-value" readOnly value={intDoor.wetQty} />
                  <button className="qty-btn" onClick={() => setIntDoor({ ...intDoor, wetQty: intDoor.wetQty + 1 })}>+</button>
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
            </div>

            {/* General Installation block caveat */}
            <div className="highlight-box copper" style={{ fontSize: '0.95rem', borderRight: '4px solid var(--copper)' }}>
              <strong>הערת התקנה חשובה:</strong> המחירים לעיל מתייחסים להרכבה על מחיצות אשבונד/גבס. במידה וההרכבה תבוצע על קירות בלוק שחור/איטונג, יש לקחת בחשבון הוספת משקוף עיוור לצורך פילוס והכנה נאותה.
            </div>
          </div>
        );

      case 9: // Entrance Path (with visual representations)
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

      case 10: // Gates & Fences (Info only, beautiful vector layout)
        return (
          <div>
            <div className="page-title-section">
              <h2>שערים וגדרות</h2>
              <p className="page-intro-text">מידע טכני בלבד לגבי שערים וגדרות שנבחרו עבור כלל הפרויקט</p>
            </div>

            <p style={{ fontSize: '1.15rem', marginBottom: '1.5rem' }}>
              על מנת לשמור על חזות אחידה ואסתטית של הפרויקט, נבחר דגם גדר אחיד עבור כלל הווילות בפרויקט.
            </p>

            <div className="static-spec-container">
              <img src={gatePhotoImg} alt="שער וגדר אלומיניום שחור - טרלידור" className="card-preview-image zoomable-img" style={{ height: '260px' }} onClick={(e) => openLightbox(e, gatePhotoImg, 'שער וגדר אלומיניום שחור - טרלידור')} />
              <button
                type="button"
                className="btn btn-secondary"
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', marginTop: '0.75rem' }}
                onClick={() => setActiveModal({ title: 'שרטוט טכני — שער וגדר טרלידור', content: 'גדר אלומיניום שלבים 60/24, חזית 60 ס"מ, מרווח אור 10 מ"מ. עמוד אלומיניום מנוקב 50/50/3 מ"מ המעוגן בפלטה לרצפה. גובה כולל כ-106 ס"מ.', image: gateDrawingImg })}
              >
                🔍 שרטוט טכני מלא
              </button>

              <h3 style={{ borderBottom: '1px solid var(--line)', paddingBottom: '0.5rem', marginTop: '1.5rem', marginBottom: '1rem' }}>מפרט גדר ושערים (ספק: טרלידור)</h3>
              <p style={{ fontWeight: 'bold', marginBottom: '1.25rem', color: 'var(--olive-dark)' }}>
                גדר אלומיניום שלבים 60/24, גובה חזית 60 ס"מ, מרווח אור 10 מ"מ, כולל עמודי 50/50 מ"מ המעוגנים עם פלטה לקרקע.
              </p>
              
              <div className="static-spec-item">
                <div>
                  <strong>שער הולכי רגל:</strong> כולל מנעול חשמלי לפתיחה מתוך הבית וידית מעוצבת דו-צדדית.
                </div>
              </div>
              <div className="static-spec-item">
                <div>
                  <strong>שער חניה נגרר (כנף על כנף):</strong> סט של 2 יחידות שער, מנוע גרירה חשמלי חזק, עיניים פוטו-אלקטריות לבטיחות ומניעת סגירה על רכב, מנורה מהבהבת בעת פעולה, ועמוד יציקה RHS.
                </div>
              </div>
              <div className="static-spec-item">
                <div>
                  <strong>שער פילר אשפה:</strong> שער אלומיניום קטן ומעוצב לגישה נוחה לפחי האשפה.
                </div>
              </div>
              <div className="static-spec-item">
                <div>
                  <strong>גדר חזית וגדר היקפית:</strong> שלמות אסתטית לכל היקף המגרש בדגם התואם לשערים.
                </div>
              </div>
              <div className="static-spec-item">
                <div>
                  <strong>שערי פילר:</strong> מים, חשמל ותקשורת - חיפוי אחיד לארונות המונים בחזית המגרש.
                </div>
              </div>
            </div>
            
            <div className="highlight-box green" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span>ℹ</span> דגם זה מבוצע כחלק מהפיתוח הסביבתי הכולל של הפרויקט ואין צורך בבחירה נוספת מצד הדייר.
            </div>
          </div>
        );

      case 11: // Electricity & Plumbing
        return (
          <div>
            <div className="page-title-section">
              <h2>שינויי חשמל ואינסטלציה</h2>
              <p className="page-intro-text">הוספה או העתקה של נקודות חשמל ומים במבנה</p>
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
                  const point = electricity.points[type.id];
                  return (
                    <div key={type.id} className="panel-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="panel-row-label">{type.name} (₪{type.price} לנקודה):</span>
                        <div className="qty-stepper">
                          <button className="qty-btn" onClick={() => updateElectricityPoint(type.id, 'qty', Math.max(0, point.qty - 1))}>-</button>
                          <input type="text" className="qty-value" readOnly value={point.qty} />
                          <button className="qty-btn" onClick={() => updateElectricityPoint(type.id, 'qty', point.qty + 1)}>+</button>
                        </div>
                      </div>
                      {point.qty > 0 && (
                        <input
                          type="text"
                          className="form-control"
                          placeholder={`הערות למיקום — לדוגמה: "${type.id === 'water' ? 'ליד חדר הכביסה' : 'בחדר השינה, ליד המיטה'}"`}
                          value={point.notes}
                          onChange={(e) => updateElectricityPoint(type.id, 'notes', e.target.value)}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );

      case 12: // Summary & Digital Signature
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
                ישנם פריטים שנבחרו ללא מחיר בחוברת – יש לפנות לחברת הניהול להשלמת המחיר לפני חתימה סופית.
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

                  {/* Stairs */}
                  <tr>
                    <td><strong>מדרגות</strong></td>
                    <td>{STAIRS_OPTIONS.find(o => o.id === stairs)?.name}</td>
                    <td>—</td>
                    <td>1</td>
                    <td style={{ textAlign: 'left', fontWeight: 'bold' }}>
                      {STAIRS_OPTIONS.find(o => o.id === stairs)?.price === 0 ? 'כלול בסטנדרט' : `₪${STAIRS_OPTIONS.find(o => o.id === stairs)?.price.toLocaleString()}`}
                    </td>
                  </tr>

                  {/* Railings */}
                  <tr>
                    <td><strong>מעקות</strong></td>
                    <td>{RAILINGS_OPTIONS.find(o => o.id === railings)?.name}</td>
                    <td>גוון שחור</td>
                    <td>1</td>
                    <td style={{ textAlign: 'left', fontWeight: 'bold', color: RAILINGS_OPTIONS.find(o => o.id === railings)?.price === null ? 'var(--red-text)' : 'inherit' }}>
                      {RAILINGS_OPTIONS.find(o => o.id === railings)?.price === 0 ? 'כלול בסטנדרט' : 
                       RAILINGS_OPTIONS.find(o => o.id === railings)?.price === null ? 'יש להוסיף מחיר – פנה לחברת הניהול' : `₪${RAILINGS_OPTIONS.find(o => o.id === railings)?.price}`}
                    </td>
                  </tr>

                  {/* Plaster */}
                  <tr>
                    <td><strong>גוון טיח חוץ</strong></td>
                    <td>קירות: {plaster.mainColor}</td>
                    <td>בליטות: {plaster.accentColor}</td>
                    <td>—</td>
                    <td style={{ textAlign: 'left', fontWeight: 'bold' }}>כלול בסטנדרט</td>
                  </tr>

                  {/* Pergola */}
                  <tr>
                    <td><strong>פרגולה</strong></td>
                    <td>{PERGOLA_OPTIONS.find(o => o.id === pergola)?.name}</td>
                    <td>—</td>
                    <td>{pergolaQty} מ"ר</td>
                    <td style={{ textAlign: 'left', fontWeight: 'bold' }}>
                      ₪{((PERGOLA_OPTIONS.find(o => o.id === pergola)?.price || 0) * pergolaQty).toLocaleString()}
                    </td>
                  </tr>

                  {/* Exterior Door */}
                  <tr>
                    <td><strong>דלת חוץ</strong></td>
                    <td>{EXT_DOORS_OPTIONS.find(o => o.id === extDoor)?.name}</td>
                    <td>—</td>
                    <td>1</td>
                    <td style={{ textAlign: 'left', fontWeight: 'bold' }}>
                      ₪{(EXT_DOORS_OPTIONS.find(o => o.id === extDoor)?.price || 0).toLocaleString()}
                    </td>
                  </tr>

                  {/* Interior Door */}
                  <tr>
                    <td><strong>דלתות פנים</strong></td>
                    <td>{INT_DOORS_OPTIONS.find(o => o.id === intDoor.selectedOption)?.name}</td>
                    <td>גוון: {intDoor.color || 'ללא בחירה'} · ספק: {INT_DOORS_OPTIONS.find(o => o.id === intDoor.selectedOption)?.supplier}</td>
                    <td>{intDoor.dryQty} יבש / {intDoor.wetQty} רטוב</td>
                    <td style={{ textAlign: 'left', fontWeight: 'bold', color: INT_DOORS_OPTIONS.find(o => o.id === intDoor.selectedOption)?.priceDry === null ? 'var(--red-text)' : 'inherit' }}>
                      {INT_DOORS_OPTIONS.find(o => o.id === intDoor.selectedOption)?.priceDry === null ? 'יש להוסיף מחיר – פנה לחברת הניהול' :
                       `₪${((INT_DOORS_OPTIONS.find(o => o.id === intDoor.selectedOption)?.priceDry * intDoor.dryQty) + 
                             (INT_DOORS_OPTIONS.find(o => o.id === intDoor.selectedOption)?.priceWet * intDoor.wetQty)).toLocaleString()}`}
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

                  {/* Electricity & Plumbing (one row per point type actually requested) */}
                  {electricity.hasChanges && ELECTRICITY_POINT_TYPES.some(t => electricity.points[t.id]?.qty > 0) ? (
                    ELECTRICITY_POINT_TYPES.filter(t => electricity.points[t.id]?.qty > 0).map(type => (
                      <tr key={type.id}>
                        <td><strong>{type.name}</strong></td>
                        <td>{electricity.points[type.id].notes || '—'}</td>
                        <td>—</td>
                        <td>{electricity.points[type.id].qty} נק'</td>
                        <td style={{ textAlign: 'left', fontWeight: 'bold' }}>
                          ₪{(type.price * electricity.points[type.id].qty).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td><strong>חשמל ומים</strong></td>
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
                  * הסכום אינו כולל את הפריטים המסומנים ב-"יש להוסיף מחיר – פנה לחברת הניהול".
                </div>
              )}
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
                <h4 style={{ marginBottom: '1rem', fontFamily: 'var(--font-sans)', fontSize: '1.1rem' }}>חתימת הדייר (חתמו באמצעות העכבר או מגע בנייד):</h4>
                
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
              {pricing.unpricedItemsSelected ? (
                <div className="warning-alert-banner" style={{ display: 'inline-flex', maxWidth: '600px', textAlign: 'right' }}>
                  <span>⚠</span> לא ניתן לשלוח את הטופס לאישור סופי כיוון שישנם פריטים שנבחרו ללא מחיר. אנא פנו לחברת הניהול להשלמת המחיר.
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
              {STEPS.map((step) => {
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

      {/* Main Screen Container */}
      <main className="main-content">
        {renderStepContent()}
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
              {currentStep < 12 ? (
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
