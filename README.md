# שותפים בהפצת אור התורה

אתר שותפות, הקדשות ותרומות עבור שיעורי התורה של הרב יצחק פישחדזי שליט״א. עברית, RTL מלא, mobile-first.

> **מצב נוכחי: האתר בהקמה. אין סליקה.** לא מתבצע חיוב, לא נאספים פרטי אשראי, ושום תרומה לא מוצגת כמושלמת.
> הטפסים עובדים במלואם (בחירה, אימות, תצוגה מקדימה, סיכום), אבל כל המידע נשאר בדפדפן ואינו נשלח לשום מקום.

## מה נבנה

- **דף נחיתה:** Header (בס״ד, שם הרב, ״על המיזם״, ״יצירת קשר״, תפריט נייד), Hero, ארבעה כרטיסי בחירה, ״איך השותפות שלכם מסייעת״, FAQ, יצירת קשר, Footer.
- **דיאלוג תרומה** (מסך מלא בנייד): מחוון התקדמות, אימות לפי שלב, סיכום חי בתחתית, לכידת פוקוס, Escape, הודעות `aria-live`.
- **ארבעה סוגים:** `lesson_dedication` (4 שלבים), `distribution_support`, `monthly_partnership`, `general_donation` (3 שלבים כל אחד).
- **סכום:** 72 / 180 / 360 / 500 / 1,000 ₪ או ״סכום אחר״. שקלים שלמים וחיוביים בלבד, טווח 10–50,000 ₪ (ניתן לשינוי). אין סכום ברירת מחדל. 180 ₪ מסומן בעדינות כ״סכום מוצע״ בלבד.
- **אנונימיות מול פרסום:** ״אנונימי בפרסום״, ״אנונימי גם למפעיל״ ו״הסכמה לפרסום״ הן שלוש בחירות נפרדות. ההסכמה לפרסום לעולם לא מסומנת מראש.
- **תשתית סליקה עתידית:** `PaymentProvider` (`createCheckoutSession`, `verifyWebhook`, `getPaymentStatus`) וספק מושבת. `PAYMENT_MODE=disabled` כברירת מחדל.
- **סכמת Supabase** עם RLS deny-by-default (לא מופעלת).
- **עמודי פרטיות ותנאים** כטיוטה מסומנת, `sitemap.xml`, `robots.txt`, Open Graph, favicon placeholder.

## הרצה מקומית

דורש Node 20+ ו-npm.

```bash
npm install
npm run build      # בונה ל-dist/
npm start          # מגיש את dist/ ב-http://localhost:4173
# או, לפיתוח עם בנייה מחדש אוטומטית:
npm run dev
```

בדיקות:

```bash
npm test           # בדיקות יחידה: סכומים, אימות, אנונימיות, סיכום, ספק מושבת
npm start          # בטרמינל נפרד
npm run test:e2e   # בדיקות דפדפן (Playwright): ארבעת הכרטיסים, אימות, סכום חופשי, תשלום מושבת, מקלדת
npx playwright install chromium   # פעם אחת, אם עדיין לא הותקן דפדפן
npm run typecheck
```

## פריסה (Vercel)

האתר סטטי לגמרי. ב-Vercel: Import מ-GitHub, ‏Framework Preset = Other (קובץ `vercel.json` כבר מגדיר זאת). משתני סביבה:

| משתנה | ערך | הערה |
|---|---|---|
| `PAYMENT_MODE` | `disabled` | ברירת המחדל. כל ערך אחר נשאר מושבת עד שיירשם ספק. |
| `SITE_URL` | `https://הדומיין-הסופי` | ל-sitemap, canonical ו-Open Graph. בלעדיו ה-sitemap ייווצר עם כתובת דוגמה. |

## קבצים עיקריים

```
app/page.tsx                    דף נחיתה
app/privacy, app/terms          טיוטות עמודי משפט
components/landing/*            Header, Hero, DonationCards, Mission, FAQ, Footer
components/donation/*           DonationDialog, PurposeSelector, AmountPicker,
                                DedicationForm, DonorFields, DonationSummary, Stepper
lib/donations/                  types, config (סכומים וטווחים), amount, validation (Zod), form
lib/payments/provider.ts        PaymentProvider + DisabledPaymentProvider
lib/i18n/                       he.ts (כל הטקסטים), index.ts
lib/site-config.ts              פרטי הגוף וה״מקומות השמורים״
supabase/migrations/            0001_init_donations.sql
styles/global.css               עיצוב
tests/                          validation.test.ts, e2e.mjs
```

## מה צריך לספק בעל האתר

הפרטים הבאים מסומנים באתר כ״מקום שמור״ ב-`lib/site-config.ts`. לא הומצא שום פרט:

1. שם הגוף המקבל את הכספים, מספר רישום וכתובת.
2. דוא״ל לפניות.
3. הכרה לפי סעיף 46: רק אם יש אישור בתוקף, ואז לנסח יחד עם יועץ.
4. תמונת Hero מאושרת של הרב (אופציונלי), לוגו, תמונת שיתוף (`og:image`). עד אז: רקע אבסטרקטי של אור.
5. נוסח סופי של פרטיות ותנאים, מאושר משפטית.
6. החלטה על טווח סכומים וסכום מוצע (`lib/donations/config.ts`).
7. ספק סליקה, והחלטה אם נדרשות קבלות (ואז אנונימיות מול המפעיל לא תהיה אפשרית).
8. החלטה על תרגום לרוסית (נדרש תרגום מלא של `he.ts`).

## מה חסר לחיבור סליקה

המבנה מוכן, אבל לא מומש ספק. בעת החיבור חובה:

1. **ליצור checkout בצד שרת בלבד** (Vercel Function או Supabase Edge Function). הדפדפן קורא לנקודת קצה, ואינו מדבר עם הספק ישירות.
2. **לאמת מחדש בשרת**: `submissionSchema` / `parseSubmission` מ-`lib/donations/validation.ts` רצים בשרת על הקלט הנכנס, כולל הסכום. אין לסמוך על הלקוח.
3. **`idempotencyKey`** לכל כוונת תשלום (עמודה `donations.idempotency_key` ייחודית).
4. **webhook חתום**: `verifyWebhook` מאמת חתימה לפני כל עיבוד.
5. **כפילויות webhook**: `webhook_events` עם `unique (provider, event_id)`.
6. **רק webhook מאומת או `getPaymentStatus` מהספק מעבירים ל-`paid`.** לעולם לא query parameter של `success` או redirect. כך גם כתוב ב-`provider.ts`, ובמסד יש constraint ש-`paid` דורש `provider_reference`.
7. **תשלום חוזר**: בתהליך הסליקה יידרש אישור חיוב חוזר מפורש, בנוסף להודעה שבטופס.
8. לרשום את הספק ב-`registry` שב-`lib/payments/provider.ts`, להחליף את `DisabledPaymentProvider` ביישום, ולהוסיף בדיקות.
9. להוסיף rate limiting והגנת spam (Turnstile/hCaptcha או שווה ערך) לנקודות הקצה.
10. אין לאסוף או לשמור פרטי כרטיס. הם מוזנים רק בדף הספק.

אחרי כל זה, להפעיל במפורש `PAYMENT_MODE`. בלי ספק רשום, כל ערך נשאר `disabled`.

## פרטיות ושמירת מידע (לקבוע לפני איסוף אמיתי)

נוסח הקדשה עלול להכיל מידע אישי או רפואי. עד להחלטה אין שמירה בכלל. לפני שמתחילים לשמור, יש להחליט ולפרסם:

- **מה נשמר ולמה**: מינימום (סכום, סוג, מטרה, שם מכובד, נוסח). שם ודוא״ל תורם אופציונליים.
- **כמה זמן**: להצעה: טיוטות ללא תשלום נמחקות אחרי 30 יום; הקדשות שלא אושרו לפרסום נמחקות או מוסרות מזהות לפי החלטה; נתוני תשלום לפי דרישות החוק והחשבונאות.
- **מחיקה**: תהליך לבקשת עיון, תיקון ומחיקה, ומי הגורם האחראי.
- **אין analytics** שאוסף תוכן של שדות טופס. אם יתווסף analytics, רק אירועים כלליים, בלי ערכי שדות.
- **טיוטות**: לא נשמרות בצד שרת בלי החלטה מפורשת והסכמת המשתמש.
- **פרסום**: רק עם `publish_consent`, ורק אחרי אישור (`approved`/`published`). המסד אוכף זאת ב-constraint.
- **ממשק ניהול**: לא קיים בכוונה. כשיתווסף: אחרי אימות ותפקיד admin בלבד.

### Supabase

`supabase/migrations/0001_init_donations.sql` יוצר את `donors`, `donations`, `dedications`, `webhook_events`. RLS מופעל (וגם `force`) ללא policies, ו-`anon`/`authenticated` ללא הרשאות, כלומר deny-by-default. הגישה רק מקוד שרת עם `service_role`. **לא להפעיל בלי אישור.**

## מגבלות ידועות של הגרסה הזו

- **לא Next.js.** הסביבה שבה נבנה האתר לא איפשרה גישה ל-npm, ולכן הוא נבנה כאפליקציית React + TypeScript סטטית (בנייה עם esbuild) ללא Tailwind וללא shadcn/ui. המבנה והשמות זהים להצעה במפרט (`app/page.tsx`, `components/…`, `lib/…`), והרכיבים וה-`lib/` ניתנים להעברה ישירה ל-Next.js (App Router) כשנדרשים נקודות קצה בצד שרת. העיצוב ב-CSS רגיל עם משתני צבע.
- **פונטים:** Heebo ו-Frank Ruhl Libre (שניהם ברישיון OFL) נטענים מ-Google Fonts. לפרטיות מקסימלית אפשר לארח אותם מקומית ב-`public/` ולהחליף את ה-`<link>` ב-`index.html`. בלי הפונטים האתר נופל בשלום לפונטי מערכת.
- **בדיקת טיפוסים של הרכיבים** (`npm run typecheck`) דורשת `@types/react`, שמותקן ב-`npm install`. ה-`lib/` והבדיקות נבדקו בטיפוסים.
- בדיקות הנגישות שבוצעו: ניגודיות (כל הצמדים ≥ AA), מקלדת, לכידת פוקוס, `aria-live`, ‎`prefers-reduced-motion`. לא נבדק עם קורא מסך אמיתי. מומלץ לבדוק ב-VoiceOver/TalkBack ו-NVDA לפני השקה.
