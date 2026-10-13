/*
 * Word data and gender rules.
 *
 * Works in the browser (window.QuizData) and in Node (module.exports),
 * so the same data can be checked by the automated tests.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.QuizData = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  // Reliable suffix rules. A word with a `rule` shows the matching tip after the answer.
  // Rules are attached to words by hand (not guessed from spelling),
  // because words like "Kuchen" end in -chen but are not diminutives.
  const RULES = {
    ung: { suffix: "ung", article: "die", text: "Nouns ending in -ung are feminine: die Zeitung, die Rechnung." },
    heit: { suffix: "heit", article: "die", text: "Nouns ending in -heit are feminine: die Freiheit." },
    keit: { suffix: "keit", article: "die", text: "Nouns ending in -keit are feminine: die Möglichkeit." },
    schaft: { suffix: "schaft", article: "die", text: "Nouns ending in -schaft are feminine: die Freundschaft." },
    tion: { suffix: "tion", article: "die", text: "Nouns ending in -tion are feminine: die Information." },
    itaet: { suffix: "ität", article: "die", text: "Nouns ending in -ität are feminine: die Universität." },
    chen: { suffix: "chen", article: "das", text: "Diminutives ending in -chen are neuter: das Mädchen, das Brötchen." },
    ling: { suffix: "ling", article: "der", text: "Nouns ending in -ling are masculine: der Frühling." },
    ismus: { suffix: "ismus", article: "der", text: "Nouns ending in -ismus are masculine: der Tourismus." },
  };

  // e(category, article, German word, English meaning, Arabic meaning, optional rule key)
  const e = (category, article, word, en, ar, rule) => {
    const entry = { word, article, en, ar, category };
    if (rule) entry.rule = rule;
    return entry;
  };

  const WORDS = [
    // ----- Everyday: der -----
    e("everyday", "der", "Tisch", "table", "طاولة"),
    e("everyday", "der", "Stuhl", "chair", "كرسي"),
    e("everyday", "der", "Hund", "dog", "كلب"),
    e("everyday", "der", "Apfel", "apple", "تفاحة"),
    e("everyday", "der", "Bahnhof", "train station", "محطة قطار"),
    e("everyday", "der", "Kuchen", "cake", "كعكة"),
    e("everyday", "der", "Kaffee", "coffee", "قهوة"),
    e("everyday", "der", "Tag", "day", "يوم"),
    e("everyday", "der", "Zug", "train", "قطار"),
    e("everyday", "der", "Schlüssel", "key", "مفتاح"),
    e("everyday", "der", "Brief", "letter", "خطاب"),
    e("everyday", "der", "Garten", "garden", "حديقة"),
    e("everyday", "der", "Frühling", "spring", "ربيع", "ling"),
    e("everyday", "der", "Tourismus", "tourism", "سياحة", "ismus"),

    // ----- Everyday: die -----
    e("everyday", "die", "Frau", "woman", "امرأة"),
    e("everyday", "die", "Katze", "cat", "قطة"),
    e("everyday", "die", "Tasche", "bag", "حقيبة"),
    e("everyday", "die", "Lampe", "lamp", "مصباح"),
    e("everyday", "die", "Schule", "school", "مدرسة"),
    e("everyday", "die", "Zeitung", "newspaper", "جريدة", "ung"),
    e("everyday", "die", "Küche", "kitchen", "مطبخ"),
    e("everyday", "die", "Uhr", "clock", "ساعة"),
    e("everyday", "die", "Straße", "street", "شارع"),
    e("everyday", "die", "Blume", "flower", "زهرة"),
    e("everyday", "die", "Woche", "week", "أسبوع"),
    e("everyday", "die", "Tür", "door", "باب"),
    e("everyday", "die", "Stadt", "city", "مدينة"),
    e("everyday", "die", "Familie", "family", "عائلة"),
    e("everyday", "die", "Freiheit", "freedom", "حرية", "heit"),
    e("everyday", "die", "Möglichkeit", "possibility", "إمكانية", "keit"),
    e("everyday", "die", "Freundschaft", "friendship", "صداقة", "schaft"),
    e("everyday", "die", "Information", "information", "معلومة", "tion"),
    e("everyday", "die", "Universität", "university", "جامعة", "itaet"),

    // ----- Everyday: das -----
    e("everyday", "das", "Haus", "house", "بيت"),
    e("everyday", "das", "Buch", "book", "كتاب"),
    e("everyday", "das", "Auto", "car", "سيارة"),
    e("everyday", "das", "Kind", "child", "طفل"),
    e("everyday", "das", "Wasser", "water", "ماء"),
    e("everyday", "das", "Brot", "bread", "خبز"),
    e("everyday", "das", "Fenster", "window", "نافذة"),
    e("everyday", "das", "Handy", "mobile phone", "موبايل"),
    e("everyday", "das", "Bett", "bed", "سرير"),
    e("everyday", "das", "Geld", "money", "فلوس"),
    e("everyday", "das", "Mädchen", "girl", "بنت", "chen"),
    e("everyday", "das", "Brötchen", "bread roll", "رغيف صغير", "chen"),

    // ----- Customer service: der -----
    e("service", "der", "Kunde", "customer", "عميل"),
    e("service", "der", "Vertrag", "contract", "عقد"),
    e("service", "der", "Anruf", "phone call", "مكالمة"),
    e("service", "der", "Termin", "appointment", "موعد"),
    e("service", "der", "Tarif", "rate, plan", "باقة"),
    e("service", "der", "Preis", "price", "سعر"),
    e("service", "der", "Betrag", "amount", "مبلغ"),
    e("service", "der", "Mitarbeiter", "employee", "موظف"),
    e("service", "der", "Kundendienst", "customer service", "خدمة العملاء"),

    // ----- Customer service: die -----
    e("service", "die", "Rechnung", "invoice", "فاتورة", "ung"),
    e("service", "die", "Bestellung", "order", "طلب", "ung"),
    e("service", "die", "Adresse", "address", "عنوان"),
    e("service", "die", "Nummer", "number", "رقم"),
    e("service", "die", "Beschwerde", "complaint", "شكوى"),
    e("service", "die", "Kündigung", "cancellation", "إلغاء اشتراك", "ung"),
    e("service", "die", "Lieferung", "delivery", "توصيل", "ung"),
    e("service", "die", "Zahlung", "payment", "دفع", "ung"),
    e("service", "die", "Rückerstattung", "refund", "استرداد", "ung"),
    e("service", "die", "Versicherung", "insurance", "تأمين", "ung"),
    e("service", "die", "Störung", "malfunction, outage", "عطل", "ung"),
    e("service", "die", "Gebühr", "fee", "رسوم"),
    e("service", "die", "Hotline", "hotline", "خط ساخن"),
    e("service", "die", "E-Mail", "email", "إيميل"),
    e("service", "die", "Kundennummer", "customer number", "رقم العميل"),

    // ----- Customer service: das -----
    e("service", "das", "Konto", "account", "حساب"),
    e("service", "das", "Passwort", "password", "كلمة السر"),
    e("service", "das", "Problem", "problem", "مشكلة"),
    e("service", "das", "Telefon", "telephone", "تليفون"),
    e("service", "das", "Angebot", "offer", "عرض"),
    e("service", "das", "Gespräch", "conversation", "محادثة"),
    e("service", "das", "Formular", "form", "استمارة"),
    e("service", "das", "Paket", "parcel", "طرد"),
    e("service", "das", "Ticket", "ticket", "تذكرة"),
    e("service", "das", "Datum", "date", "تاريخ"),
    e("service", "das", "Produkt", "product", "منتج"),
  ];

  return { WORDS, RULES };
});
