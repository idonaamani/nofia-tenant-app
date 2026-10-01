import { useState, useRef, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from './lib/supabaseClient';
import TenantAuthGate from './components/TenantAuthGate';

// Real photos & technical drawings extracted from the tenant-choices brochure
import stairsStandardImg from './assets/stairs_standard.jpg';
import stairsSawtoothImg from './assets/stairs_sawtooth.jpg';
import stairsLightweightImg from './assets/stairs_lightweight.jpg';
import stairsButcherImg from './assets/stairs_butcher.jpg';

import railingVerticalImg from './assets/railing_vertical.jpg';
import railingBarcodeImg from './assets/railing_barcode.jpg';
import railingExpandedImg from './assets/railing_expanded.jpg';
import railingDrawingImg from './assets/railing_drawing.jpg';

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


// Item 8: aluminum is no longer an in-app interactive model/qty/color picker — each villa's
// aluminum scope is already fixed in its subcontractor (Bassel) quote, reviewed as a PDF under
// the "אישור תכניות" step (see PLAN_DISCIPLINES further down) instead of priced here.

// Item 12: בוצ'ר אלון עובי 3 ס"מ — reference photo supplied by Ido 2026-09-23 (from a wood
// flooring supplier's site, used as a placeholder for the exact grain/finish); swap for מורן's
// official product photo once she sends it.
const STAIRS_OPTIONS = [
  { id: 1, name: 'מדרגות סטנדרטיות (בטון, תחתית חלקה)', price: 0, desc: 'מדרגות בטון יצוקות בעלות תחתית ישרה חלקה. כלול במפרט ללא תוספת עלות.', image: stairsStandardImg },
  { id: 2, name: 'מדרגות משוננות (בטון, תחתית משוננת)', price: 15000, desc: 'מדרגות בטון מעוצבות שבהן גם החלק התחתון בנוי בצורה משוננת המלווה את שלבי המדרגות. מראה עיצובי מודרני.', image: stairsSawtoothImg },
  { id: 3, name: 'מדרגות קלות (קונסטרוקציה + עץ גושני)', price: 45000, desc: 'מדרגות קלות ומרחפות המבוססות על קונסטרוקציית פלדה כבדה ומדרכי עץ גושני יוקרתי, למראה אוורירי ופתוח.', image: stairsLightweightImg },
  { id: 4, name: 'מדרגות בוצ\'ר אלון עובי 3 ס"מ', price: 30000, desc: 'מדרגות עץ אלון מלא בעיבוד בוצ\'ר בעובי 3 ס"מ. תמונת דגם להמחשה — הגוון הסופי ופרטי הביצוע ייקבעו בתיאום מול מתאמת השינויים.', image: stairsButcherImg },
  { id: 'custom', name: 'אפשרות שאינה כלולה ברשימה', price: null, desc: 'ברצוני לבחור דגם מדרגות אחר, שאינו מופיע כאן. יש לתאם את הפרטים המדויקים מול מתאמת השינויים.', image: null }
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
  { id: 3, name: 'מעקה אקספנדד (פרימיום)', price: 650, unit: 'מ"א', desc: 'מעקה פח רשת מתוח (Expanded Metal) יוקרתי. בידוד ויזואלי קל ומראה תעשייתי יוקרתי.', image: railingExpandedImg },
  { id: 'custom', name: 'אפשרות שאינה כלולה ברשימה', price: null, unit: null, desc: 'ברצוני לבחור דגם מעקה אחר, שאינו מופיע כאן. יש לתאם את הפרטים המדויקים מול מתאמת השינויים.', image: null }
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

// Item 9/12: total interior door count per villa, from the developer's door-count spreadsheet
// ("מטריצת דלתות"), so the price locks in automatically once a door model is chosen — no manual
// entry or dry/wet split needed. All 24 villas are covered (no gaps, unlike AIRCON_PRICING).
const DOOR_COUNT_BY_VILLA = {
  1: 5, 2: 9, 3: 10, 4: 4, 5: 8, 6: 9, 7: 11, 8: 11, 9: 5, 10: 10,
  11: 11, 12: 9, 13: 12, 14: 13, 15: 11, 16: 7, 17: 10, 18: 11, 19: 15, 20: 4,
  21: 5, 22: 12, 23: 12, 24: 11
};

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
// Item 17: descriptions simplified to just "ריצוף" + the stone/finish type, no other prose.
const PATH_OPTIONS = [
  { id: 1, name: 'יציקת שביל כניסה – בטון מסורק (סטנדרט)', price: 0, desc: 'יציקה, בטון מסורק.', image: pathConcreteNewImg },
  { id: 2, name: 'ריצוף משתלבות – אבן הרובע אומבריאנו (סטנדרט)', price: 0, desc: 'ריצוף, אבן הרובע אומבריאנו.', image: pathPaversImg },
  { id: 3, name: 'ריצוף השביל בתיאום משטחים תחת פרגולה (משודרג)', price: 350, unit: 'מ"ר', desc: 'ריצוף, בהתאמה למשטח הפרגולה.', image: pathTravertineImg },
  { id: 4, name: 'יציקת שביל כניסה – בטון מוחלק (פרימיום)', price: 350, unit: 'מ"ר', desc: 'יציקה, בטון מוחלק.', image: pathConcreteFinishedImg }
];

// Item 7 (updated live by Ido): the exterior-plaster color picker is removed entirely — there
// is no tenant color choice for the base plaster. The only tenant-facing item here is the
// optional Peles thermal render (שליכט תרמי) add-on.
const PLASTER_THERMAL_RENDER_PRICE = 3500;
const PLASTER_THERMAL_RENDER_VIDEO_NOTE = 'סרטון המדגים את השליכט התרמי של פלס:';
const PLASTER_THERMAL_RENDER_VIDEO_URL = 'https://www.facebook.com/peles.il/videos/-בניסוי-השוואתי-מעניין-עם-שליכט-אקרילי-תרמי-תרמוקריל-מבית-פלסתשפטו-בעצמכם-מדברים/832743533046495/';

// "תוספות אופציונליות" (end-of-wizard optional add-ons) — flat prices per villa, excl. VAT.
const WATER_HEATER_UPGRADE_PRICE = 2000; // הגדלת דוד חשמל מ-150 ל-200 ליטר
const ROOF_HATCH_LADDER_PRICE = 6000; // פתח יציאה לגג + סולם מתקפל, מפרט טכני מצורף
// Ayalok: no fixed price any more, priced on request (not added to the subtotal).
// Fill in the video / guide links when available; each link is shown only once it is set.
const AYALOK_VIDEO_URL = 'https://www.youtube.com/watch?v=c5ah9lHrMw8';
const AYALOK_GUIDE_URL = '';
// Smart-electric prep (neutral wire at switches + deep boxes), priced per floor level.
const SMART_ELECTRIC_PREP_PRICE_PER_LEVEL = 2500;
const GAS_HEATING_SYSTEM_PRICE = 9000; // מערכת חימום בגז כולל צנרת, התקנה ואחריות (פז גז או שווה ערך)
const ROOF_HATCH_LADDER_SPEC = '• סולם מתכת מגולוונת, צבוע אפוקסי בחלקו, עובי ברזל 2 מ"מ.\n• מתחבר לחלק התחתון של הפתח באמצעות משקוף מתכת צבוע לבן בגובה 14.5 ס"מ.\n• גוף הסולם מחובר למסגרת ע"י שני קפיצים חזקים בקוטר 35 מ"מ, ניתנים לכיוון במספר מצבים.\n• נסגר במישור התקרה ע"י דלת פנל עץ מלא בעובי 16 מ"מ עם סגר מתכת קפיצי.\n• המדרכים מחוברים ל"שמיניות" ע"י ברגים ואומי אבטחה עובי 8 מ"מ מגולוון, עם ארבעה גלגלים במדרגה הראשונה לפיזור עומס.\n• מגיע עם מעקה עליון משני צידי הפתח. מתאים לגובה תקרה עד 3 מטרים, מותקן בזווית 70–75 מעלות.\n• אחריות על כל חלקי הסולם למשך 10 שנים.\n• מגוון רחב של מידות פתח זמינות — המידה הסופית תיקבע בתיאום מול מתאמת השינויים בהתאם למידות פתח הגג בווילה.';

// Point changes are priced per the current Dekel price list (מחירון דקל), so no fixed price
// is shown and they are NOT added to the subtotal; the quantity is counted automatically.
const ELECTRICITY_PRICE_NOTE = 'לפי מחירון דקל עדכני';
const ELECTRICITY_POINT_TYPES = [
  { id: 'light', name: 'העתקת נקודת מאור' },
  { id: 'water', name: 'העתקת נקודת מים' },
  { id: 'power', name: 'הוספת נקודת חשמל' }
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

// Items 6, 8, 9, 10, 11, 14, 15: "אישור תכניות" now covers every discipline that has a plan to
// review — including aluminum (item 8, replacing the old interactive step entirely) and kitchen
// (item 14, folded in from its own former step). Each one gets a real per-villa PDF (served from
// /plans/villa-<N>/<key>.pdf) except kitchen and exterior development, which have no hosted file
// yet and fall back to the admin-managed plan_links URL or a coordinate-with-Noa note.
const PLAN_DISCIPLINES = [
  { key: 'architecture', label: 'אדריכלות', icon: '🏛️', hasFile: true },
  { key: 'electricity', label: 'חשמל', icon: '🔌', hasFile: true },
  { key: 'plumbing', label: 'אינסטלציה', icon: '🚰', hasFile: true },
  { key: 'hvac', label: 'מיזוג אוויר (תכנית)', icon: '❄️', hasFile: true },
  { key: 'aluminum', label: 'אלומיניום', icon: '🖼️', hasFile: true },
  { key: 'exteriorDevelopment', label: 'פיתוח חוץ', icon: '🌳', hasFile: false },
  { key: 'kitchen', label: 'מטבח', icon: '🍳', hasFile: false }
];

// Item 15: שערים וגדרות removed entirely. Item 7: טיח חוץ repurposed into a small thermal-render
// add-on step. Items 10 & 11: two new steps (חימום תת רצפתי, מיזוג אוויר) before the electric
// step, which item 12 renames. LAST_STEP_ID is used everywhere instead of a hardcoded number.
const STEPS = [
  { id: 0, label: 'ברוכים הבאים', icon: '👋' },
  { id: 1, label: 'הסבר כללי', icon: '📝' },
  { id: 2, label: 'אישור תכניות', icon: '📐' },
  { id: 3, label: 'תכניות סופיות לאחר שינויים', icon: '✅' },
  { id: 4, label: 'מדרגות', icon: '🪜' },
  { id: 5, label: 'מעקות', icon: '⛓️' },
  { id: 7, label: 'פרגולה', icon: '⛱️' },
  { id: 8, label: 'דלתות חוץ', icon: '🚪' },
  { id: 9, label: 'דלתות פנים', icon: '🚪' },
  { id: 10, label: 'שביל כניסה', icon: '🛣️' },
  { id: 11, label: 'חימום תת רצפתי', icon: '🔥' },
  { id: 12, label: 'מיזוג אוויר', icon: '❄️' },
  { id: 13, label: 'שינויי חשמל אינסטלציה ובינוי', icon: '🔌' },
  // Item 13 (Monday board): relocated here from right after "מעקות" and renamed — same step
  // id (6) as before, so any already-saved per-step notes/data keyed by id still line up.
  { id: 6, label: 'תוספות אופציונליות', icon: '🧰' },
  { id: 14, label: 'סיכום וחתימה', icon: '✍️' }
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

  // Form selections state.
  // Item 8: aluminum has no in-app selection state anymore — it's a fixed, already-priced
  // subcontractor quote reviewed as a PDF under "אישור תכניות" (see planStatus.aluminum below).

  // Item 13: stairs/railings custom-option text, shown when the tenant picks "custom".
  const [stairsCustomNote, setStairsCustomNote] = useState(() => saved.stairsCustomNote ?? '');
  const [railingsCustomNote, setRailingsCustomNote] = useState(() => saved.railingsCustomNote ?? '');

  const [stairs, setStairs] = useState(() => saved.stairs ?? 1); // STAIRS_OPTIONS ID
  const [stairsFlightQty, setStairsFlightQty] = useState(() => saved.stairsFlightQty ?? 1); // גרמים לפי מפלסים

  const [railings, setRailings] = useState(() => saved.railings ?? 1); // RAILINGS_OPTIONS ID
  const [railingsQty, setRailingsQty] = useState(() => saved.railingsQty ?? 12); // מ"א
  const [railingsColor, setRailingsColor] = useState(() => saved.railingsColor ?? 'שחור');

  // Item 6: kitchen — plan approval, color, and cost (no standard price list was supplied,
  // so cost is entered/edited by the coordinator once quoted with the kitchen supplier).
  // Relocated (item 14) into the "אישור תכניות" step; the cost field itself is unchanged.
  const [kitchen, setKitchen] = useState(() => saved.kitchen ?? { planApproved: false, color: '', cost: 0 });

  // Items 6, 9, 15: per-discipline plan status — "no more changes" flag + free-text notes
  // (item 15), keyed by PLAN_DISCIPLINES[].key. A discipline flagged noMoreChanges appears
  // automatically under "תכניות סופיות לאחר שינויים" (item 11) — a live filtered view, so it can
  // never fall out of sync with the source plan the way a one-off copy could.
  const [planStatus, setPlanStatus] = useState(() => saved.planStatus ?? {});
  const updatePlanStatus = (key, patch) => {
    setPlanStatus(prev => ({ ...prev, [key]: { noMoreChanges: false, notes: '', ...prev[key], ...patch } }));
  };

  // Item 7: plaster color picker removed; only the optional Peles thermal render add-on remains.
  const [plasterThermalRender, setPlasterThermalRender] = useState(() => saved.plasterThermalRender ?? false);

  // Item 13/14 (Monday board): the old "תוספת טיח" step is relocated to the end of the wizard and
  // renamed "תוספות אופציונליות" — same step id (6), just moved in STEPS and given three more
  // flat, optional add-ons alongside the existing thermal render.
  const [waterHeaterUpgrade, setWaterHeaterUpgrade] = useState(() => saved.waterHeaterUpgrade ?? false);
  const [roofHatchLadder, setRoofHatchLadder] = useState(() => saved.roofHatchLadder ?? false);
  const [ayalokSecurity, setAyalokSecurity] = useState(() => saved.ayalokSecurity ?? false);
  const [gasHeatingSystem, setGasHeatingSystem] = useState(() => saved.gasHeatingSystem ?? false);
  const [smartElectricPrep, setSmartElectricPrep] = useState(() => saved.smartElectricPrep ?? false);
  const [smartElectricLevels, setSmartElectricLevels] = useState(() => saved.smartElectricLevels ?? 1);

  const [pergola, setPergola] = useState(() => saved.pergola ?? 1); // PERGOLA_OPTIONS ID
  const [pergolaQty, setPergolaQty] = useState(() => saved.pergolaQty ?? 20); // sqm
  const [extDoor, setExtDoor] = useState(() => saved.extDoor ?? 1); // EXT_DOORS_OPTIONS ID

  // Item 9/12: flat per-unit pricing; total door count now comes from DOOR_COUNT_BY_VILLA
  // (looked up by villaNumber, see getSelectionPricing) instead of manual entry.
  const [intDoor, setIntDoor] = useState(() => saved.intDoor ?? {
    selectedOption: 'A', // INT_DOORS_OPTIONS ID ('A', 'B', 'C', 'D')
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

  // Item 19: full annex text shown + acknowledged in-app when opting out of the contractor's
  // aircon package. Executed together with the main digital signature at the final step —
  // there is no separate signature pad, but the acknowledgment + typed buyer names are required
  // before final submit, exactly like the annex's own "שם רוכש, חתימה, תאריך" lines.
  const [airconAnnexAcknowledged, setAirconAnnexAcknowledged] = useState(() => saved.airconAnnexAcknowledged ?? false);
  const [airconAnnexBuyer1Name, setAirconAnnexBuyer1Name] = useState(() => saved.airconAnnexBuyer1Name ?? '');
  const [airconAnnexBuyer2Name, setAirconAnnexBuyer2Name] = useState(() => saved.airconAnnexBuyer2Name ?? '');

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

  // Item 5: ad-hoc line items outside the standard categories — addable only from the
  // coordinator's own login (?coordinator=<villa>), never by the tenant. A plain tenant sees the
  // list read-only (if the coordinator already added anything) but has no way to add to it.
  const [extraItems, setExtraItems] = useState(() => saved.extraItems ?? []);
  const addExtraItem = () => {
    if (!isCoordinator) return;
    setExtraItems(items => [...items, { id: `extra_${Date.now()}`, description: '', cost: 0 }]);
  };
  const updateExtraItem = (id, patch) => {
    if (!isCoordinator) return;
    setExtraItems(items => items.map(it => it.id === id ? { ...it, ...patch } : it));
  };
  const removeExtraItem = (id) => {
    if (!isCoordinator) return;
    setExtraItems(items => items.filter(it => it.id !== id));
  };

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

  // Items 3+4: make the mobile/browser back gesture close an open lightbox or spec modal
  // first, then step back one wizard step, instead of exiting the app. We push one history
  // entry per step, and one more whenever a modal/lightbox opens; explicit close buttons call
  // history.back() instead of clearing state directly, so state and the browser stack never
  // drift out of sync — a single popstate handler is the only place that ever closes them.
  const isPopStateNav = useRef(false);
  const modalOpenRef = useRef(false);
  const lightboxOpenRef = useRef(false);

  useEffect(() => {
    window.history.replaceState({ nofiaStep: currentStep }, '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isPopStateNav.current) { isPopStateNav.current = false; return; }
    window.history.pushState({ nofiaStep: currentStep }, '');
  }, [currentStep]);

  useEffect(() => {
    const isOpen = !!activeModal;
    if (isOpen && !modalOpenRef.current) {
      window.history.pushState({ nofiaStep: currentStep, nofiaModal: true }, '');
    }
    modalOpenRef.current = isOpen;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeModal]);

  useEffect(() => {
    const isOpen = !!lightboxImage;
    if (isOpen && !lightboxOpenRef.current) {
      window.history.pushState({ nofiaStep: currentStep, nofiaLightbox: true }, '');
    }
    lightboxOpenRef.current = isOpen;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightboxImage]);

  useEffect(() => {
    const handlePopState = (e) => {
      if (lightboxOpenRef.current) { setLightboxImage(null); return; }
      if (modalOpenRef.current) { setActiveModal(null); return; }
      const targetStep = e.state?.nofiaStep;
      if (targetStep !== undefined) {
        isPopStateNav.current = true;
        setCurrentStep(targetStep);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const closeModal = () => window.history.back();
  const closeLightbox = () => window.history.back();

  // Canvas Drawing Pad References
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Autosave the draft (selections + navigation) on every change so a refresh never loses progress
  useEffect(() => {
    if (isSubmitted) return;
    const draft = {
      villaNumber, tenantName, isLoggedIn, currentStep,
      planStatus, extraItems,
      stairs, stairsFlightQty, stairsCustomNote, railings, railingsQty, railingsColor, railingsCustomNote,
      kitchen, plasterThermalRender, waterHeaterUpgrade, roofHatchLadder, ayalokSecurity, gasHeatingSystem, smartElectricPrep, smartElectricLevels,
      pergola, pergolaQty, extDoor, intDoor, path, pathQty, underfloorHeating,
      airconOptOut, airconAnnexAcknowledged, airconAnnexBuyer1Name, airconAnnexBuyer2Name,
      stepNotes, electricity
    };
    try {
      window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    } catch {
      // ignore storage errors (e.g. private browsing / quota)
    }
  }, [
    isSubmitted, villaNumber, tenantName, isLoggedIn, currentStep,
    planStatus, extraItems,
    stairs, stairsFlightQty, stairsCustomNote, railings, railingsQty, railingsColor, railingsCustomNote,
    kitchen, plasterThermalRender, waterHeaterUpgrade, roofHatchLadder, ayalokSecurity, gasHeatingSystem, smartElectricPrep, smartElectricLevels,
    pergola, pergolaQty, extDoor, intDoor, path, pathQty, underfloorHeating,
    airconOptOut, airconAnnexAcknowledged, airconAnnexBuyer1Name, airconAnnexBuyer2Name,
    stepNotes, electricity
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
        if (s.planStatus) setPlanStatus(s.planStatus);
        if (s.extraItems) setExtraItems(s.extraItems);
        if (s.stairs !== undefined) setStairs(s.stairs);
        if (s.stairsFlightQty !== undefined) setStairsFlightQty(s.stairsFlightQty);
        if (s.stairsCustomNote !== undefined) setStairsCustomNote(s.stairsCustomNote);
        if (s.railings !== undefined) setRailings(s.railings);
        if (s.railingsQty !== undefined) setRailingsQty(s.railingsQty);
        if (s.railingsColor) setRailingsColor(s.railingsColor);
        if (s.railingsCustomNote !== undefined) setRailingsCustomNote(s.railingsCustomNote);
        if (s.kitchen) setKitchen(s.kitchen);
        if (s.plasterThermalRender !== undefined) setPlasterThermalRender(s.plasterThermalRender);
        if (s.waterHeaterUpgrade !== undefined) setWaterHeaterUpgrade(s.waterHeaterUpgrade);
        if (s.roofHatchLadder !== undefined) setRoofHatchLadder(s.roofHatchLadder);
        if (s.ayalokSecurity !== undefined) setAyalokSecurity(s.ayalokSecurity);
        if (s.gasHeatingSystem !== undefined) setGasHeatingSystem(s.gasHeatingSystem);
        if (s.smartElectricPrep !== undefined) setSmartElectricPrep(s.smartElectricPrep);
        if (s.smartElectricLevels !== undefined) setSmartElectricLevels(s.smartElectricLevels);
        if (s.pergola !== undefined) setPergola(s.pergola);
        if (s.pergolaQty !== undefined) setPergolaQty(s.pergolaQty);
        if (s.extDoor !== undefined) setExtDoor(s.extDoor);
        if (s.intDoor) setIntDoor(s.intDoor);
        if (s.path !== undefined) setPath(s.path);
        if (s.pathQty !== undefined) setPathQty(s.pathQty);
        if (s.underfloorHeating) setUnderfloorHeating(s.underfloorHeating);
        if (s.airconOptOut !== undefined) setAirconOptOut(s.airconOptOut);
        if (s.airconAnnexAcknowledged !== undefined) setAirconAnnexAcknowledged(s.airconAnnexAcknowledged);
        if (s.airconAnnexBuyer1Name !== undefined) setAirconAnnexBuyer1Name(s.airconAnnexBuyer1Name);
        if (s.airconAnnexBuyer2Name !== undefined) setAirconAnnexBuyer2Name(s.airconAnnexBuyer2Name);
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

  // Item 10: the real fix for "give tenants a way to actually open the plans, not just a link" —
  // each discipline's PDF is hosted directly in the app at /plans/villa-<N>/<key>.pdf (added
  // alongside the aluminum ones from item 8). We only know a given villa/discipline combo truly
  // has a file by asking the server, so a lightweight HEAD check populates availability per
  // discipline instead of guessing and risking a dead link.
  const [planFileAvailable, setPlanFileAvailable] = useState({});
  useEffect(() => {
    if (!isLoggedIn || !villaNumber) return;
    let cancelled = false;
    (async () => {
      const entries = await Promise.all(
        PLAN_DISCIPLINES.filter(d => d.hasFile).map(async (d) => {
          try {
            const res = await fetch(`/plans/villa-${villaNumber}/${d.key}.pdf`, { method: 'HEAD' });
            return [d.key, res.ok];
          } catch {
            return [d.key, false];
          }
        })
      );
      if (!cancelled) setPlanFileAvailable(Object.fromEntries(entries));
    })();
    return () => { cancelled = true; };
  }, [isLoggedIn, villaNumber]);

  // Coordinator-only: save progress to Supabase at any point, without needing signature/submit.
  const handleCoordinatorSave = async () => {
    if (!isSupabaseConfigured) return;
    const selections = {
      planStatus, extraItems,
      stairs, stairsFlightQty, stairsCustomNote, railings, railingsQty, railingsColor, railingsCustomNote,
      kitchen, plasterThermalRender, waterHeaterUpgrade, roofHatchLadder, ayalokSecurity, gasHeatingSystem, smartElectricPrep, smartElectricLevels,
      pergola, pergolaQty, extDoor, intDoor, path, pathQty, underfloorHeating,
      airconOptOut, airconAnnexAcknowledged, airconAnnexBuyer1Name, airconAnnexBuyer2Name,
      stepNotes, electricity
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
    if (viewOnly) return;
    const newPoint = { id: `${typeId}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, note: '' };
    setElectricity({
      ...electricity,
      points: { ...electricity.points, [typeId]: [...electricity.points[typeId], newPoint] }
    });
  };

  const removeElectricityPoint = (typeId, pointId) => {
    if (viewOnly) return;
    setElectricity({
      ...electricity,
      points: { ...electricity.points, [typeId]: electricity.points[typeId].filter(p => p.id !== pointId) }
    });
  };

  const updateElectricityPointNote = (typeId, pointId, note) => {
    if (viewOnly) return;
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

    // Stairs (only counted when the step actually applies to this villa). A null price means
    // "custom option" (item 13) — treated like any other unresolved price until the coordinator
    // fills it in, same mechanism as the other unpriced categories below.
    if (!isSingleStoryVilla) {
      const stairsOpt = STAIRS_OPTIONS.find(o => o.id === stairs);
      if (stairsOpt) {
        if (stairsOpt.price === null) unpricedItemsSelected = true;
        else subtotal += stairsOpt.price;
      }
    }

    // Railings (priced per linear meter — item 5). Same null-price = "custom option" handling.
    const railingsOpt = RAILINGS_OPTIONS.find(o => o.id === railings);
    if (railingsOpt) {
      if (railingsOpt.price === null) unpricedItemsSelected = true;
      else subtotal += railingsOpt.price * railingsQty;
    }

    // Kitchen (item 6) — cost entered by the coordinator once quoted
    if (kitchen.planApproved && kitchen.cost) subtotal += Number(kitchen.cost) || 0;

    // Item 5: coordinator-added ad-hoc line items
    extraItems.forEach(it => { subtotal += Number(it.cost) || 0; });

    // Optional add-ons (item 13/14): plaster thermal render + the four new flat add-ons
    if (plasterThermalRender) subtotal += PLASTER_THERMAL_RENDER_PRICE;
    if (waterHeaterUpgrade) subtotal += WATER_HEATER_UPGRADE_PRICE;
    if (roofHatchLadder) subtotal += ROOF_HATCH_LADDER_PRICE;
    if (smartElectricPrep) subtotal += SMART_ELECTRIC_PREP_PRICE_PER_LEVEL * smartElectricLevels;
    if (gasHeatingSystem) subtotal += GAS_HEATING_SYSTEM_PRICE;

    // Pergola (priced per sqm)
    const pergolaOpt = PERGOLA_OPTIONS.find(o => o.id === pergola);
    if (pergolaOpt) subtotal += pergolaOpt.price * pergolaQty;

    // Exterior Doors
    const extDoorOpt = EXT_DOORS_OPTIONS.find(o => o.id === extDoor);
    if (extDoorOpt) subtotal += extDoorOpt.price;

    // Interior Doors (item 9/12: flat per-unit delta × total door count for the villa, plus ממ"ד wood-leaf add-on)
    const intDoorOpt = INT_DOORS_OPTIONS.find(o => o.id === intDoor.selectedOption);
    const doorCount = DOOR_COUNT_BY_VILLA[Number(villaNumber)];
    if (intDoorOpt) {
      if (doorCount == null) unpricedItemsSelected = true;
      else subtotal += intDoorOpt.price * doorCount;
    }
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
    // Electricity points (Dekel price list) and Ayalok (on request) are priced separately:
    // flagged so the summary shows a notice, but they do not block submission.
    const electricityPointsCount = ELECTRICITY_POINT_TYPES.reduce((n, t) => n + (electricity.points[t.id]?.length || 0), 0);
    const pricedSeparatelyItems = [
      electricityPointsCount > 0 && `שינויי נקודות חשמל/מים (${electricityPointsCount} נק', ${ELECTRICITY_PRICE_NOTE})`,
      ayalokSecurity && 'מערכת איילוק (תמחור לפי דרישה)'
    ].filter(Boolean);

    const vat = Math.round(subtotal * 0.18);
    const total = subtotal + vat;

    return { subtotal, vat, total, unpricedItemsSelected, pricedSeparatelyItems };
  };

  const pricing = getSelectionPricing();

  // Item 19: opting out of the contractor's aircon package requires acknowledging the annex
  // (with both buyers' names) before final submit is allowed — same gate as an unpriced item.
  const airconAnnexBlocking = airconOptOut && !airconAnnexAcknowledged;
  const canSubmit = !pricing.unpricedItemsSelected && !airconAnnexBlocking;

  const handleNext = () => {
    const idx = visibleSteps.findIndex(s => s.id === currentStep);
    if (idx >= 0 && idx < visibleSteps.length - 1) setCurrentStep(visibleSteps[idx + 1].id);
  };

  // Goes through window.history.back() (consumed by the popstate handler above) rather than
  // setting currentStep directly, so the in-app "הקודם" button and the hardware/gesture back
  // button always produce the exact same result and never desync the pushed history stack.
  const handlePrev = () => {
    const idx = visibleSteps.findIndex(s => s.id === currentStep);
    if (idx > 0) window.history.back();
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
    if (isConfirmed && hasSignature && canSubmit) {
      if (isSupabaseConfigured) {
        try {
          await supabase.rpc('submit_selections', {
            payload: {
              planStatus, extraItems,
              stairs, stairsFlightQty, stairsCustomNote, railings, railingsQty, railingsColor, railingsCustomNote,
              kitchen, plasterThermalRender, waterHeaterUpgrade, roofHatchLadder, ayalokSecurity, gasHeatingSystem, smartElectricPrep, smartElectricLevels,
              pergola, pergolaQty, extDoor, intDoor, path, pathQty, underfloorHeating,
              airconOptOut, airconAnnexAcknowledged, airconAnnexBuyer1Name, airconAnnexBuyer2Name,
              stepNotes, electricity, pricing
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
              <span>ℹ</span> מילוי הבחירות במערכת מתבצע יחד עם <strong>מתאמת שינויי הדיירים</strong> בלבד. הדיירים צופים בבחירות ומאשרים אותן, אך אינם ממלאים אותן לבד — יש לתאם פגישה לביצוע הבחירות במשותף.
            </div>

            <h3 style={{ marginBottom: '1rem' }}>הנושאים לבחירה בתהליך:</h3>
            <div className="intro-grid">
              <div className="intro-mini-card"><span>📐</span> אישור תכניות (כולל אלומיניום ומטבח)</div>
              <div className="intro-mini-card"><span>✅</span> תכניות סופיות לאחר שינויים</div>
              <div className="intro-mini-card"><span>🪜</span> מדרגות</div>
              <div className="intro-mini-card"><span>⛓️</span> מעקות</div>
              <div className="intro-mini-card"><span>⛱️</span> פרגולה</div>
              <div className="intro-mini-card"><span>🚪</span> דלתות חוץ</div>
              <div className="intro-mini-card"><span>🚪</span> דלתות פנים</div>
              <div className="intro-mini-card"><span>🛣️</span> שביל כניסה</div>
              <div className="intro-mini-card"><span>🔥</span> חימום תת רצפתי</div>
              <div className="intro-mini-card"><span>❄️</span> מיזוג אוויר</div>
              <div className="intro-mini-card"><span>🔌</span> שינויי חשמל אינסטלציה ובינוי</div>
              <div className="intro-mini-card"><span>🧰</span> תוספות אופציונליות</div>
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

      case 2: // Plan approval (items 2, 6, 8, 9, 10, 14, 15) — every discipline including
              // aluminum (item 8) and kitchen (item 14), each with a real openable PDF where one
              // exists (item 10), a "no more changes" flag (items 6/9), and free-text notes (item 15).
        return (
          <div>
            <div className="page-title-section">
              <h2>אישור תכניות</h2>
              <p className="page-intro-text">תכניות וילה {villaNumber}, לפי תחום. סמנו "אין ברצוני לבצע שינויים נוספים" כשתכנית מסוימת סופית עבורכם.</p>
            </div>

            <div className="highlight-box green">
              <span>ℹ</span> ניתן לפתוח כל תכנית ישירות מכאן. תכנית שתסומן כסופית תופיע גם בפרק "תכניות סופיות לאחר שינויים".
            </div>

            <div className="options-grid" style={{ marginTop: '1.5rem' }}>
              {PLAN_DISCIPLINES.map(d => {
                const status = planStatus[d.key] ?? { noMoreChanges: false, notes: '' };
                const hasLocalFile = d.hasFile && planFileAvailable[d.key];
                const externalUrl = planLinks[d.key];
                const openUrl = hasLocalFile ? `/plans/villa-${villaNumber}/${d.key}.pdf` : externalUrl;
                return (
                  <div key={d.key} className="option-card" style={{ minHeight: 'auto', cursor: 'default' }}>
                    <div className="option-card-header">
                      <span className="option-title">{d.icon} {d.label}</span>
                    </div>

                    {openUrl ? (
                      <a href={openUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ marginTop: '0.75rem', display: 'inline-block' }}>
                        פתיחת תכנית {d.label} ↗
                      </a>
                    ) : (
                      <p className="muted-text" style={{ marginTop: '0.75rem' }}>
                        {d.hasFile ? 'טרם הועלתה תכנית — יש לפנות למתאמת השינויים' : 'יש לתאם צפייה מול מתאמת השינויים'}
                      </p>
                    )}

                    {/* Item 14: kitchen's plan-approval checkbox, color, and coordinator-only cost — relocated here, cost field unchanged */}
                    {d.key === 'kitchen' && (
                      <div style={{ marginTop: '1rem', borderTop: '1px dashed var(--line)', paddingTop: '0.75rem' }}>
                        <label className="checkbox-container" style={{ margin: 0 }}>
                          <input
                            type="checkbox"
                            checked={kitchen.planApproved}
                            onChange={(e) => setKitchen({ ...kitchen, planApproved: e.target.checked })}
                          />
                          <span className="checkbox-text">אני מאשר/ת את תכנית המטבח כפי שהוצגה</span>
                        </label>
                        <div className="swatch-group" style={{ marginTop: '0.75rem' }}>
                          <div className="swatch-label">גוון מטבח שנבחר:</div>
                          <input
                            type="text"
                            className="form-control"
                            style={{ marginTop: '0.4rem' }}
                            placeholder="לדוגמה: אפור מט / לבן high-gloss / אלון טבעי"
                            value={kitchen.color}
                            onChange={(e) => setKitchen({ ...kitchen, color: e.target.value })}
                          />
                        </div>
                        <div className="panel-row" style={{ marginTop: '0.75rem', borderBottom: 'none' }}>
                          <span className="panel-row-label">עלות מטבח (נקבעת ע"י מתאמת השינויים):</span>
                          <input
                            type="number"
                            className="form-control"
                            style={{ maxWidth: '140px' }}
                            value={kitchen.cost}
                            disabled={!isCoordinator}
                            onChange={(e) => setKitchen({ ...kitchen, cost: e.target.value })}
                          />
                        </div>
                        {!isCoordinator && (
                          <p className="muted-text" style={{ fontSize: '0.8rem', marginTop: '0.4rem' }}>שדה העלות נקבע ע"י מתאמת שינויי הדיירים בלבד.</p>
                        )}
                      </div>
                    )}

                    <label className="checkbox-container" style={{ marginTop: '1rem' }}>
                      <input
                        type="checkbox"
                        checked={status.noMoreChanges}
                        onChange={(e) => updatePlanStatus(d.key, { noMoreChanges: e.target.checked })}
                      />
                      <span className="checkbox-text">התכנית סופית, אין ברצוני לבצע שינויים נוספים</span>
                    </label>

                    <div className="swatch-group" style={{ marginTop: '0.75rem' }}>
                      <div className="swatch-label" style={{ fontSize: '0.85rem' }}>הערות לתכנית זו:</div>
                      <textarea
                        className="form-control"
                        style={{ width: '100%', minHeight: '60px', marginTop: '0.35rem' }}
                        value={status.notes}
                        onChange={(e) => updatePlanStatus(d.key, { notes: e.target.value })}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 3: { // Item 11: "finalized plans" is a live filtered mirror of case 2's data — never a
                // separate copy that could drift out of sync — so it always reflects the same
                // noMoreChanges flags and notes the tenant (or coordinator) set above.
        const finalizedDisciplines = PLAN_DISCIPLINES.filter(d => planStatus[d.key]?.noMoreChanges);
        return (
          <div>
            <div className="page-title-section">
              <h2>תכניות סופיות לאחר שינויים</h2>
              <p className="page-intro-text">תכניות שסומנו כסופיות, ללא שינויים נוספים</p>
            </div>
            {finalizedDisciplines.length === 0 ? (
              <p className="muted-text">טרם סומנה אף תכנית כסופית. ניתן לסמן תכניות בפרק "אישור תכניות".</p>
            ) : (
              <div className="options-grid">
                {finalizedDisciplines.map(d => {
                  const hasLocalFile = d.hasFile && planFileAvailable[d.key];
                  const externalUrl = planLinks[d.key];
                  const openUrl = hasLocalFile ? `/plans/villa-${villaNumber}/${d.key}.pdf` : externalUrl;
                  return (
                    <div key={d.key} className="option-card" style={{ minHeight: 'auto', cursor: 'default' }}>
                      <div className="option-card-header">
                        <span className="option-title">{d.icon} {d.label}</span>
                        <span className="price-badge standard">סופי ✓</span>
                      </div>
                      {openUrl ? (
                        <a href={openUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ marginTop: '0.75rem', display: 'inline-block' }}>
                          פתיחת תכנית ↗
                        </a>
                      ) : (
                        <p className="muted-text" style={{ marginTop: '0.75rem' }}>אין קובץ תכנית זמין</p>
                      )}
                      {planStatus[d.key]?.notes && (
                        <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>{planStatus[d.key].notes}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      }

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
                    ) : opt.price === null ? (
                      <span className="price-badge unpriced">יש להוסיף מחיר — פנה למתאמת השינויים</span>
                    ) : (
                      <span className="price-badge upgrade">+ ₪{opt.price.toLocaleString()}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Item 13: custom option — free-text so the tenant can describe what they want */}
            {stairs === 'custom' && (
              <div className="selection-details-panel" style={{ marginTop: '1.5rem' }}>
                <div className="swatch-label">תיאור האפשרות המבוקשת:</div>
                <textarea
                  className="form-control"
                  style={{ width: '100%', minHeight: '70px', marginTop: '0.5rem' }}
                  placeholder="תארו את דגם המדרגות המבוקש — נתאם את הפרטים המדויקים בפגישה עם מתאמת השינויים"
                  value={stairsCustomNote}
                  onChange={(e) => setStairsCustomNote(e.target.value)}
                />
              </div>
            )}

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
                    ) : opt.price === null ? (
                      <span className="price-badge unpriced">יש להוסיף מחיר — פנה למתאמת השינויים</span>
                    ) : (
                      <span className="price-badge upgrade">₪{opt.price.toLocaleString()} / {opt.unit}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Item 13: custom option — free-text so the tenant can describe what they want */}
            {railings === 'custom' && (
              <div className="selection-details-panel" style={{ marginTop: '1.5rem' }}>
                <div className="swatch-label">תיאור האפשרות המבוקשת:</div>
                <textarea
                  className="form-control"
                  style={{ width: '100%', minHeight: '70px', marginTop: '0.5rem' }}
                  placeholder="תארו את דגם המעקה המבוקש — נתאם את הפרטים המדויקים בפגישה עם מתאמת השינויים"
                  value={railingsCustomNote}
                  onChange={(e) => setRailingsCustomNote(e.target.value)}
                />
              </div>
            )}

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

      case 6: // Optional add-ons (item 13: relocated from "תוספת טיח" + 4 new flat add-ons, item 14)
        return (
          <div>
            <div className="page-title-section">
              <h2>תוספות אופציונליות</h2>
              <p className="page-intro-text">תוספות פאושליות, ניתנות לבחירה באופן עצמאי זו מזו</p>
            </div>

            <label className="checkbox-container" style={{ backgroundColor: 'var(--white)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--line)' }}>
              <input
                type="checkbox"
                checked={plasterThermalRender}
                onChange={(e) => setPlasterThermalRender(e.target.checked)}
              />
              <span className="checkbox-text">
                שליכט תרמי לקירות החוץ, חברת פלס (תוספת ₪{PLASTER_THERMAL_RENDER_PRICE.toLocaleString()} לדירה + מע"מ)
              </span>
            </label>

            <div className="highlight-box green" style={{ marginTop: '1rem' }}>
              <span>ℹ</span> {PLASTER_THERMAL_RENDER_VIDEO_NOTE}{' '}
              <a href={PLASTER_THERMAL_RENDER_VIDEO_URL} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>
                לצפייה בסרטון של פלס לחצו כאן
              </a>
            </div>

            <div className="highlight-box copper" style={{ marginTop: '1rem', marginBottom: '1.5rem' }}>
              <span>🎨</span> גוון הטיח: השליכט הטרמי (במידה ונבחר) יהיה בגרגור 200. אין אפשרות בחירת גוון לטיח החוץ הבסיסי.
              <br /><br />
              <strong>מה זה "גרגור 200"?</strong> הספרה מציינת את גודל גרגירי המרקם בשליכט התרמי, שקיים במספר דרגות גרגור (למשל 150, 200, 250) — ככל שהמספר גבוה יותר כך הגרגירים גדולים ובולטים יותר. גרגור 200 הוא מרקם בינוני: עדין ופחות מחוספס מגרגור 250, אך גס ובעל תחושת עומק גדולה יותר מגרגור 150.
            </div>

            <label className="checkbox-container" style={{ backgroundColor: 'var(--white)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--line)', marginTop: '0.75rem' }}>
              <input
                type="checkbox"
                checked={waterHeaterUpgrade}
                onChange={(e) => setWaterHeaterUpgrade(e.target.checked)}
              />
              <span className="checkbox-text">
                הגדלת דוד חשמל מ-150 ל-200 ליטר (תוספת ₪{WATER_HEATER_UPGRADE_PRICE.toLocaleString()})
              </span>
            </label>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: 'var(--white)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--line)', marginTop: '0.75rem' }}>
              <label className="checkbox-container" style={{ flex: 1, padding: 0, border: 'none' }}>
                <input
                  type="checkbox"
                  checked={roofHatchLadder}
                  onChange={(e) => setRoofHatchLadder(e.target.checked)}
                />
                <span className="checkbox-text">
                  פתח יציאה לגג בתוספת מדרגות (סולם) מתקפלות (תוספת ₪{ROOF_HATCH_LADDER_PRICE.toLocaleString()})
                </span>
              </label>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', flexShrink: 0 }}
                onClick={() => setActiveModal({ title: 'מפרט טכני — סולם מתקפל לעליית גג', content: ROOF_HATCH_LADDER_SPEC })}
              >
                ℹ מפרט מלא
              </button>
            </div>

            <label className="checkbox-container" style={{ backgroundColor: 'var(--white)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--line)', marginTop: '0.75rem' }}>
              <input
                type="checkbox"
                checked={ayalokSecurity}
                onChange={(e) => setAyalokSecurity(e.target.checked)}
              />
              <span className="checkbox-text">
                מערכת איילוק, חבילת ביטחון ומיגון לבית (תמחור יבוצע לפי דרישה)
              </span>
            </label>
            {(AYALOK_VIDEO_URL || AYALOK_GUIDE_URL) && (
              <div className="highlight-box green" style={{ marginTop: '0.5rem' }}>
                <span>ℹ</span> מערכת איילוק:{' '}
                {AYALOK_VIDEO_URL && (
                  <a href={AYALOK_VIDEO_URL} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>קישור לסרטון הסבר על מערכת איילוק</a>
                )}
                {AYALOK_VIDEO_URL && AYALOK_GUIDE_URL && ' | '}
                {AYALOK_GUIDE_URL && (
                  <a href={AYALOK_GUIDE_URL} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>למדריך המערכת</a>
                )}
              </div>
            )}

            <label className="checkbox-container" style={{ backgroundColor: 'var(--white)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--line)', marginTop: '0.75rem' }}>
              <input
                type="checkbox"
                checked={gasHeatingSystem}
                onChange={(e) => setGasHeatingSystem(e.target.checked)}
              />
              <span className="checkbox-text">
                מערכת חימום בגז — כולל צנרת, התקנה ואחריות, פז גז או שווה ערך (תוספת ₪{GAS_HEATING_SYSTEM_PRICE.toLocaleString()})
              </span>
            </label>

            <div style={{ backgroundColor: 'var(--white)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--line)', marginTop: '0.75rem' }}>
              <label className="checkbox-container" style={{ padding: 0, border: 'none' }}>
                <input
                  type="checkbox"
                  checked={smartElectricPrep}
                  onChange={(e) => setSmartElectricPrep(e.target.checked)}
                />
                <span className="checkbox-text">
                  הכנות לחשמל חכם: קו אפס במתגים וקופסאות עמוקות (תוספת ₪{SMART_ELECTRIC_PREP_PRICE_PER_LEVEL.toLocaleString()} למפלס)
                </span>
              </label>
              {smartElectricPrep && (
                <div className="panel-row" style={{ marginTop: '0.75rem' }}>
                  <span className="panel-row-label">מספר מפלסים:</span>
                  <div className="qty-stepper">
                    <button className="qty-btn" disabled={viewOnly} onClick={() => setSmartElectricLevels(Math.max(1, smartElectricLevels - 1))}>-</button>
                    <input type="text" className="qty-value" readOnly value={smartElectricLevels} />
                    <button className="qty-btn" disabled={viewOnly} onClick={() => setSmartElectricLevels(smartElectricLevels + 1)}>+</button>
                  </div>
                  <span style={{ fontWeight: 600 }}>₪{(SMART_ELECTRIC_PREP_PRICE_PER_LEVEL * smartElectricLevels).toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        );

      case 7: // Pergola (priced per sqm)
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

      case 8: // Exterior Doors (real photos per model, drill-down full spec)
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

      case 9: // Interior Doors (item 9: flat per-unit pricing, total door count, ממ"ד wood-leaf add-on)
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

            {/* Item 9/12: total door count for the villa, looked up automatically — plus ממ"ד wood-leaf add-on */}
            <div className="selection-details-panel" style={{ marginBottom: '1.5rem' }}>
              {DOOR_COUNT_BY_VILLA[Number(villaNumber)] != null ? (
                <div className="panel-row">
                  <span className="panel-row-label">כמות דלתות פנים בווילה {villaNumber}:</span>
                  <strong>{DOOR_COUNT_BY_VILLA[Number(villaNumber)]} יח'</strong>
                </div>
              ) : (
                <div className="unpriced-message-box">
                  <span>⚠</span> לא נמצאה כמות דלתות עבור מספר וילה {villaNumber} — יש לפנות למתאמת השינויים.
                </div>
              )}

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

      case 10: // Entrance Path (with visual representations)
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

      case 11: // Underfloor heating (item 10) — new, before the electric/plumbing step
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

      case 12: // Aircon — Tadiran (item 11) — new, before the electric/plumbing step
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

            {/* Item 19: full annex text shown and acknowledged in-app instead of a separate
                off-app signing link. Required before final submit (see airconAnnexBlocking). */}
            {airconOptOut && (
              <div className="selection-details-panel" style={{ marginTop: '1.5rem' }}>
                <h3 style={{ marginBottom: '1rem', fontSize: '1.15rem', fontFamily: 'var(--font-serif)' }}>
                  נספח להסכם / טופס הצהרה והתחייבות רוכש — ויתור על הזמנת מערכת מיזוג אוויר דרך הקבלן המבצע
                </h3>
                <div style={{ fontSize: '0.95rem', lineHeight: '1.7', whiteSpace: 'pre-line' }}>
{`שם הפרויקט: פרויקט 24 קוטג'ים, אלפי מנשה.

הואיל ובהתאם למפרט הטכני ולהסכם המכר, תכולת העבודה של הקבלן ביחידה כוללת ביצוע הכנות למיזוג אוויר בלבד (צנרת גז, צנרת ניקוז והזנות חשמל) ואינה כוללת את אספקת והתקנת יחידות המיזוג וסגירות הגבס הנלוות אליהן.
והואיל והקבלן הציע לרוכשים אופציה להזמנה ולביצוע מושלם של מערכת מיזוג האוויר כחלק מעבודות הקבלן.
והואיל והרוכשים בחרו שלא לרכוש את מערכת מיזוג האוויר דרך הקבלן, אלא להתקינה באופן עצמאי ובאחריותם הבלעדית באמצעות מתקין מטעמם לאחר מועד מסירת החזקה.

הרוכשים מצהירים ומתחייבים:
1. העדר אחריות להתקנה ולצנרת ההכנות, כולל אחריות בלעדית לכל נזק שייגרם לצנרת הגז/ניקוז/חשמל כתוצאה מעבודת מתקין חיצוני.
2. הקבלן לא יבצע סגירות גבס/הנמכות תקרה/סינרי גבס סביב יחידות המיזוג, עבודות אלו יבוצעו ע"י הרוכשים ועל חשבונם לאחר מסירת החזקה.
3. איסור כניסת מתקינים/קבלני גבס מטעם הרוכשים לאתר לפני טופס 4 וסיום מסירה סופית, עם התחייבות לשיפוי הקבלן על נזק כתוצאה מהפרה.`}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label htmlFor="airconBuyer1">שם רוכש 1</label>
                    <input type="text" id="airconBuyer1" className="form-control" value={airconAnnexBuyer1Name} onChange={(e) => setAirconAnnexBuyer1Name(e.target.value)} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label htmlFor="airconBuyer2">שם רוכש 2</label>
                    <input type="text" id="airconBuyer2" className="form-control" value={airconAnnexBuyer2Name} onChange={(e) => setAirconAnnexBuyer2Name(e.target.value)} />
                  </div>
                </div>

                <label className="checkbox-container" style={{ marginTop: '1.25rem' }}>
                  <input
                    type="checkbox"
                    checked={airconAnnexAcknowledged}
                    onChange={(e) => setAirconAnnexAcknowledged(e.target.checked)}
                  />
                  <span className="checkbox-text">
                    קראנו את נוסח הנספח לעיל ומאשרים את תוכנו. החתימה על נספח זה מתבצעת יחד עם החתימה הדיגיטלית הסופית בעמוד הסיכום.
                  </span>
                </label>

                {!airconAnnexAcknowledged && (
                  <div className="warning-alert-banner" style={{ marginTop: '1rem' }}>
                    <span>⚠</span> יש לאשר את נוסח הנספח לפני שניתן יהיה לשלוח את הטופס לאישור סופי.
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 13: // Electricity & Plumbing (item 12: renamed)
        return (
          <div>
            <div className="page-title-section">
              <h2>שינויי חשמל אינסטלציה ובינוי</h2>
              <p className="page-intro-text">הוספה או העתקה של נקודות חשמל ומים במבנה. יעודכן לאחר פגישה עם מתאמת שינויים.</p>
            </div>

            <div className="selection-details-panel" style={{ marginTop: '2rem' }}>
                <h3 style={{ marginBottom: '0.5rem', fontSize: '1.2rem', fontFamily: 'var(--font-serif)' }}>ריכוז נקודות:</h3>
                <table className="summary-table" style={{ marginBottom: '1.5rem' }}>
                  <thead>
                    <tr><th>סוג שינוי</th><th>כמות</th><th>עלות ליחידה</th><th>סה"כ</th></tr>
                  </thead>
                  <tbody>
                    {ELECTRICITY_POINT_TYPES.map(type => {
                      const qty = electricity.points[type.id]?.length || 0;
                      return (
                        <tr key={type.id}>
                          <td>{type.name}</td>
                          <td>{qty} נק'</td>
                          <td>{ELECTRICITY_PRICE_NOTE}</td>
                          <td>{qty > 0 ? ELECTRICITY_PRICE_NOTE : '—'}</td>
                        </tr>
                      );
                    })}
                    <tr style={{ fontWeight: 600 }}>
                      <td>סה"כ</td>
                      <td>{ELECTRICITY_POINT_TYPES.reduce((n, t) => n + (electricity.points[t.id]?.length || 0), 0)} נק'</td>
                      <td></td>
                      <td>{ELECTRICITY_PRICE_NOTE}</td>
                    </tr>
                  </tbody>
                </table>

                <h3 style={{ marginBottom: '1.25rem', fontSize: '1.2rem', fontFamily: 'var(--font-serif)' }}>פירוט שינויי נקודות וציון מיקום:</h3>

                {ELECTRICITY_POINT_TYPES.map(type => {
                  const points = electricity.points[type.id];
                  return (
                    <div key={type.id} className="panel-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0.75rem', marginBottom: '1.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="panel-row-label">{type.name}: {points.length} נק'</span>
                        <button type="button" className="btn btn-secondary" style={{ padding: '0.35rem 0.9rem', fontSize: '0.85rem' }} disabled={viewOnly} onClick={() => addElectricityPoint(type.id)}>
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
                                disabled={viewOnly}
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
          </div>
        );

      case 14: // Summary & Digital Signature (item 14: grouped notes shown here)
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

            {/* Items priced outside the app total (Dekel price list / on request) — notice only, not blocking */}
            {pricing.pricedSeparatelyItems.length > 0 && (
              <div className="warning-alert-banner">
                <span>⚠</span>
                פריטים שיתומחרו בנפרד ואינם כלולים בסה"כ: {pricing.pricedSeparatelyItems.join(' · ')}. התמחור הסופי יימסר ע"י מתאמת השינויים.
              </div>
            )}

            {/* Item 19: annex-not-acknowledged blocks submit the same way an unpriced item does */}
            {airconAnnexBlocking && (
              <div className="warning-alert-banner">
                <span>⚠</span>
                יש לאשר את נספח ויתור מיזוג האוויר (בפרק "מיזוג אוויר") לפני חתימה סופית.
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
                  {/* Item 8: aluminum has no pricing row anymore — it's approved as a PDF plan
                      under "אישור תכניות", already priced directly with the subcontractor. */}

                  {/* Stairs (only when relevant to this villa) */}
                  {!isSingleStoryVilla && (
                    <tr>
                      <td><strong>מדרגות</strong></td>
                      <td>{STAIRS_OPTIONS.find(o => o.id === stairs)?.name}{stairs === 'custom' && stairsCustomNote ? ` — ${stairsCustomNote}` : ''}</td>
                      <td>{showStairsFlightQty ? `${stairsFlightQty} גרמים` : '—'}</td>
                      <td>1</td>
                      <td style={{ textAlign: 'left', fontWeight: 'bold' }}>
                        {STAIRS_OPTIONS.find(o => o.id === stairs)?.price === 0
                          ? 'כלול בסטנדרט'
                          : STAIRS_OPTIONS.find(o => o.id === stairs)?.price === null
                            ? 'יש להוסיף מחיר – פנה למתאמת השינויים'
                            : `₪${STAIRS_OPTIONS.find(o => o.id === stairs)?.price.toLocaleString()}`}
                      </td>
                    </tr>
                  )}

                  {/* Railings */}
                  <tr>
                    <td><strong>מעקות</strong></td>
                    <td>{RAILINGS_OPTIONS.find(o => o.id === railings)?.name}{railings === 'custom' && railingsCustomNote ? ` — ${railingsCustomNote}` : ''}</td>
                    <td>גוון: {railingsColor}</td>
                    <td>{railingsQty} מ"א</td>
                    <td style={{ textAlign: 'left', fontWeight: 'bold' }}>
                      {RAILINGS_OPTIONS.find(o => o.id === railings)?.price === 0
                        ? 'כלול בסטנדרט'
                        : RAILINGS_OPTIONS.find(o => o.id === railings)?.price === null
                          ? 'יש להוסיף מחיר – פנה למתאמת השינויים'
                          : `₪${(RAILINGS_OPTIONS.find(o => o.id === railings)?.price * railingsQty).toLocaleString()}`}
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

                  {/* Optional add-ons (item 13/14) — only rows the tenant actually selected */}
                  <tr>
                    <td><strong>תוספות אופציונליות</strong></td>
                    <td>
                      {[
                        plasterThermalRender && 'שליכט תרמי פלס',
                        waterHeaterUpgrade && 'הגדלת דוד חשמל ל-200 ליטר',
                        roofHatchLadder && 'פתח יציאה לגג + סולם מתקפל',
                        ayalokSecurity && 'מערכת איילוק (תמחור לפי דרישה)',
                        smartElectricPrep && `הכנות לחשמל חכם (${smartElectricLevels} מפלסים)`,
                        gasHeatingSystem && 'מערכת חימום בגז'
                      ].filter(Boolean).join(' · ') || 'ללא תוספות'}
                    </td>
                    <td>—</td>
                    <td>—</td>
                    <td style={{ textAlign: 'left', fontWeight: 'bold' }}>
                      ₪{(
                        (plasterThermalRender ? PLASTER_THERMAL_RENDER_PRICE : 0) +
                        (waterHeaterUpgrade ? WATER_HEATER_UPGRADE_PRICE : 0) +
                        (roofHatchLadder ? ROOF_HATCH_LADDER_PRICE : 0) +
                        (smartElectricPrep ? SMART_ELECTRIC_PREP_PRICE_PER_LEVEL * smartElectricLevels : 0) +
                        (gasHeatingSystem ? GAS_HEATING_SYSTEM_PRICE : 0)
                      ).toLocaleString()}
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
                    <td>{DOOR_COUNT_BY_VILLA[Number(villaNumber)] != null ? `${DOOR_COUNT_BY_VILLA[Number(villaNumber)]} יח'` : '—'}</td>
                    <td style={{ textAlign: 'left', fontWeight: 'bold', color: DOOR_COUNT_BY_VILLA[Number(villaNumber)] == null ? 'var(--red-text)' : 'inherit' }}>
                      {DOOR_COUNT_BY_VILLA[Number(villaNumber)] == null ? 'לא נמצאה כמות לווילה זו – פנה למתאמת השינויים' : `₪${(
                        (INT_DOORS_OPTIONS.find(o => o.id === intDoor.selectedOption)?.price || 0) * DOOR_COUNT_BY_VILLA[Number(villaNumber)] +
                        (intDoor.mamadWoodLeaf ? MAMAD_WOOD_LEAF_PRICE * intDoor.mamadWoodLeafQty : 0)
                      ).toLocaleString()}`}
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
                  {ELECTRICITY_POINT_TYPES.some(t => electricity.points[t.id]?.length > 0) ? (
                    ELECTRICITY_POINT_TYPES.filter(t => electricity.points[t.id]?.length > 0).map(type => (
                      <tr key={type.id}>
                        <td><strong>{type.name}</strong></td>
                        <td>{electricity.points[type.id].map((p, i) => `${i + 1}) ${p.note || 'ללא הערה'}`).join(' · ')}</td>
                        <td>—</td>
                        <td>{electricity.points[type.id].length} נק'</td>
                        <td style={{ textAlign: 'left', fontWeight: 'bold' }}>{ELECTRICITY_PRICE_NOTE}</td>
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

                  {/* Item 5: coordinator-added ad-hoc line items */}
                  {extraItems.map(item => (
                    <tr key={item.id}>
                      <td><strong>פריט נוסף</strong></td>
                      <td>{item.description || '—'}</td>
                      <td>—</td>
                      <td>—</td>
                      <td style={{ textAlign: 'left', fontWeight: 'bold' }}>₪{(Number(item.cost) || 0).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Item 5: only the coordinator can add/edit/remove extra items — a tenant sees the
                rows above (read-only) but has no way to add to this list from her own login. */}
            {isCoordinator && (
              <div className="selection-details-panel" style={{ marginBottom: '1.5rem' }}>
                <div className="swatch-label" style={{ marginBottom: '0.75rem' }}>פריטים נוספים (מתאמת השינויים בלבד):</div>
                {extraItems.map(item => (
                  <div key={item.id} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <input
                      type="text"
                      className="form-control"
                      style={{ flex: 2 }}
                      placeholder="תיאור הפריט"
                      value={item.description}
                      onChange={(e) => updateExtraItem(item.id, { description: e.target.value })}
                    />
                    <input
                      type="number"
                      className="form-control"
                      style={{ flex: 1, maxWidth: '140px' }}
                      placeholder="עלות ₪"
                      value={item.cost}
                      onChange={(e) => updateExtraItem(item.id, { cost: e.target.value })}
                    />
                    <button type="button" className="btn btn-secondary" style={{ padding: '0.35rem 0.7rem', fontSize: '0.85rem' }} onClick={() => removeExtraItem(item.id)}>
                      הסר
                    </button>
                  </div>
                ))}
                <button type="button" className="btn btn-secondary" style={{ marginTop: '0.5rem' }} onClick={addExtraItem}>
                  + הוספת פריט
                </button>
              </div>
            )}

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
              {!canSubmit ? (
                <div className="warning-alert-banner" style={{ display: 'inline-flex', maxWidth: '600px', textAlign: 'right' }}>
                  <span>⚠</span> {pricing.unpricedItemsSelected
                    ? 'לא ניתן לשלוח את הטופס לאישור סופי כיוון שישנם פריטים שנבחרו ללא מחיר. אנא פנו למתאמת השינויים להשלמת המחיר.'
                    : 'לא ניתן לשלוח את הטופס לאישור סופי לפני אישור נספח מיזוג האוויר.'}
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
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>&times;</button>
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
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <button className="lightbox-close" onClick={closeLightbox}>&times;</button>
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
