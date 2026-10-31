export type Lang = 'en' | 'es' | 'fa' | 'de' | 'zh';

export const LANG_META: Record<Lang, { label: string; native: string; dir: 'ltr' | 'rtl'; speech: string; promptName: string }> = {
  en: { label: 'English', native: 'English', dir: 'ltr', speech: 'en-US', promptName: 'English' },
  es: { label: 'Spanish', native: 'Español', dir: 'ltr', speech: 'es-US', promptName: 'Spanish' },
  fa: { label: 'Persian', native: 'فارسی', dir: 'rtl', speech: 'fa-IR', promptName: 'Persian (Farsi)' },
  de: { label: 'German', native: 'Deutsch', dir: 'ltr', speech: 'de-DE', promptName: 'German' },
  zh: { label: 'Chinese', native: '中文', dir: 'ltr', speech: 'zh-CN', promptName: 'Simplified Chinese (Mandarin)' },
};

export const LANGS = Object.keys(LANG_META) as Lang[];

export function isLang(v: unknown): v is Lang {
  return typeof v === 'string' && (LANGS as string[]).includes(v);
}

type Dict = {
  nav: { programs: string; rates: string; how: string; brokers: string; talk: string };
  hero: { title: string; lead: string; ctaChat: string; ctaBroker: string; proof: string[] };
  chat: {
    title: string;
    sub: string;
    greeting: (lender: string) => string;
    starters: string[];
    placeholder: string;
    send: string;
    thinking: string;
    talk: string;
    listening: string;
    stop: string;
    voiceUnsupported: string;
    error: string;
    consent: (lender: string) => string;
    fine: string;
  };
  rates: { title: string; note: string; asOf: string; source: string; labels: Record<string, string> };
  programs: { title: string; lead: string; cols: [string, string, string, string, string]; rows: Record<string, { name: string; use: string }>; note: string };
  how: { title: string; steps: { t: string; d: string }[] };
  brokers: { title: string; lead: string; points: string[]; cta: string };
  footer: { disclaimer: string; ehoText: string; rights: string };
  units: { mo: string; yr: string; varies: string; lang: string };
};

const en: Dict = {
  nav: { programs: 'Loan programs', rates: 'Rates', how: 'How it works', brokers: 'For brokers', talk: 'Talk to us' },
  hero: {
    title: 'Private capital for real estate investors, matched to the right broker.',
    lead: 'Hard money, fix-and-flip, bridge, construction and DSCR loans through a network of 50+ licensed brokers. Ask about today’s rates or your deal, in your language, any hour.',
    ctaChat: 'Start with your deal',
    ctaBroker: 'Submit a deal as a broker',
    proof: ['50+ licensed brokers', 'Answers in 5 languages', 'Live market rates, sourced daily'],
  },
  chat: {
    title: 'Lending desk',
    sub: 'AI assistant. A licensed broker follows up.',
    greeting: (l) => `Hello, and thank you for contacting ${l}. I’m the AI lending assistant, not a loan officer, so I can’t approve loans or quote your rate. I can explain your options, share today’s market rates and get your deal to the right licensed broker. What are you working on?`,
    starters: ['What are hard money rates today?', 'I need a fix-and-flip loan', 'I’m a broker with a deal', 'My lender fell through before closing'],
    placeholder: 'Type your question or describe your deal',
    send: 'Send',
    thinking: 'Checking',
    talk: 'Talk to the lending desk',
    listening: 'Listening. Tap to stop.',
    stop: 'Stop',
    voiceUnsupported: 'Voice isn’t available in this browser. You can type instead.',
    error: 'The assistant didn’t respond. Check your connection and send again.',
    consent: (l) => `I agree that ${l} and its partner brokers may contact me at the number and email I provide, including by calls and texts using an AI-generated voice or automated technology, about my financing inquiry. Consent is not a condition of any loan. Message and data rates may apply. Reply STOP to opt out.`,
    fine: 'General information and market ranges only, not a loan offer or commitment to lend. Please don’t share Social Security or account numbers here.',
  },
  rates: {
    title: 'Today’s benchmarks',
    note: 'Benchmarks move daily. Private-lending terms are priced from them plus the risk of each deal.',
    asOf: 'As of',
    source: 'Source',
    labels: { DPRIME: 'Prime rate', SOFR: 'SOFR, overnight', DGS10: '10-year Treasury', MORTGAGE30US: '30-year fixed average', DFEDTARU: 'Fed funds, upper bound' },
  },
  programs: {
    title: 'Loan programs',
    lead: 'Typical market ranges for private real estate loans. Your broker sets the actual terms after reviewing the deal.',
    cols: ['Program', 'Best for', 'Typical rate', 'Points', 'Term'],
    rows: {
      fix_flip: { name: 'Fix-and-flip', use: 'Buy, renovate and sell' },
      bridge: { name: 'Bridge', use: 'Close fast, refinance or sell later' },
      construction: { name: 'Ground-up construction', use: 'New builds and major rebuilds' },
      dscr: { name: 'DSCR rental', use: 'Long-term rentals, qualify on rent' },
      commercial: { name: 'Commercial bridge', use: 'Multifamily, retail, industrial' },
    },
    note: 'Ranges from published 2026 market surveys. Not an offer to lend.',
  },
  how: {
    title: 'How it works',
    steps: [
      { t: 'Tell us about the deal', d: 'Chat or talk with the lending desk. It asks only what a lender needs: property, numbers, exit and timeline.' },
      { t: 'See if it fits', d: 'You get a plain answer on whether the deal fits the lending box, and what would make it fit.' },
      { t: 'A licensed broker calls', d: 'Your deal goes to the broker licensed in your state for that loan type, usually within minutes.' },
    ],
  },
  brokers: {
    title: 'For brokers',
    lead: 'Join the network, submit deals in minutes and check status any time by chat, text or phone.',
    points: ['Instant scenario check against the lending box', 'Deals routed by state, loan type and size', 'Your comp stays yours'],
    cta: 'Submit a deal',
  },
  footer: {
    disclaimer: 'This site provides general information about private real estate financing. It is not a loan offer, commitment or approval. All loans are subject to underwriting, appraisal and lender approval. Rates, points and terms are set only by a licensed broker or lender.',
    ehoText: 'Equal Housing Opportunity',
    rights: 'All rights reserved.',
  },
  units: { mo: 'months', yr: 'years', varies: 'Varies', lang: 'Language' },
};

const es: Dict = {
  nav: { programs: 'Programas de préstamo', rates: 'Tasas', how: 'Cómo funciona', brokers: 'Para brókers', talk: 'Hable con nosotros' },
  hero: {
    title: 'Capital privado para inversionistas inmobiliarios, con el bróker indicado.',
    lead: 'Préstamos hard money, fix-and-flip, puente, construcción y DSCR a través de una red de más de 50 brókers con licencia. Pregunte por las tasas de hoy o por su negocio, en su idioma y a cualquier hora.',
    ctaChat: 'Empiece con su negocio',
    ctaBroker: 'Enviar un negocio como bróker',
    proof: ['Más de 50 brókers con licencia', 'Respuestas en 5 idiomas', 'Tasas de mercado actualizadas a diario'],
  },
  chat: {
    title: 'Mesa de préstamos',
    sub: 'Asistente de IA. Un bróker con licencia le dará seguimiento.',
    greeting: (l) => `Hola, gracias por comunicarse con ${l}. Soy el asistente de préstamos con inteligencia artificial, no un oficial de préstamos, así que no puedo aprobar préstamos ni cotizar su tasa. Puedo explicarle sus opciones, compartir las tasas de mercado de hoy y enviar su negocio al bróker con licencia indicado. ¿En qué está trabajando?`,
    starters: ['¿Cuáles son las tasas hard money hoy?', 'Necesito un préstamo fix-and-flip', 'Soy bróker y tengo un negocio', 'Mi prestamista se retiró antes del cierre'],
    placeholder: 'Escriba su pregunta o describa su negocio',
    send: 'Enviar',
    thinking: 'Revisando',
    talk: 'Hablar con la mesa de préstamos',
    listening: 'Escuchando. Toque para detener.',
    stop: 'Detener',
    voiceUnsupported: 'La voz no está disponible en este navegador. Puede escribir.',
    error: 'El asistente no respondió. Revise su conexión y envíe de nuevo.',
    consent: (l) => `Acepto que ${l} y sus brókers asociados me contacten al número y correo que proporcione, incluso mediante llamadas y mensajes de texto con voz generada por IA o tecnología automatizada, sobre mi consulta de financiamiento. El consentimiento no es condición para ningún préstamo. Pueden aplicarse cargos por mensajes y datos. Responda STOP para cancelar.`,
    fine: 'Solo información general y rangos de mercado; no es una oferta ni un compromiso de préstamo. No comparta aquí números de Seguro Social ni de cuentas.',
  },
  rates: {
    title: 'Tasas de referencia de hoy',
    note: 'Las tasas de referencia cambian a diario. Los préstamos privados se fijan a partir de ellas más el riesgo de cada negocio.',
    asOf: 'Al',
    source: 'Fuente',
    labels: { DPRIME: 'Tasa prime', SOFR: 'SOFR, a un día', DGS10: 'Bono del Tesoro a 10 años', MORTGAGE30US: 'Promedio fijo a 30 años', DFEDTARU: 'Fondos federales, límite superior' },
  },
  programs: {
    title: 'Programas de préstamo',
    lead: 'Rangos típicos del mercado para préstamos inmobiliarios privados. Su bróker fija los términos reales tras revisar el negocio.',
    cols: ['Programa', 'Ideal para', 'Tasa típica', 'Puntos', 'Plazo'],
    rows: {
      fix_flip: { name: 'Fix-and-flip', use: 'Comprar, renovar y vender' },
      bridge: { name: 'Préstamo puente', use: 'Cerrar rápido y refinanciar o vender después' },
      construction: { name: 'Construcción nueva', use: 'Obras nuevas y reconstrucciones' },
      dscr: { name: 'Alquiler DSCR', use: 'Rentas a largo plazo, califica con la renta' },
      commercial: { name: 'Puente comercial', use: 'Multifamiliar, comercio, industrial' },
    },
    note: 'Rangos de encuestas de mercado publicadas en 2026. No es una oferta de préstamo.',
  },
  how: {
    title: 'Cómo funciona',
    steps: [
      { t: 'Cuéntenos del negocio', d: 'Escriba o hable con la mesa de préstamos. Solo pregunta lo que un prestamista necesita: propiedad, números, salida y plazos.' },
      { t: 'Vea si califica', d: 'Recibe una respuesta clara sobre si el negocio encaja y qué haría falta para que encaje.' },
      { t: 'Le llama un bróker con licencia', d: 'Su negocio va al bróker con licencia en su estado para ese tipo de préstamo, por lo general en minutos.' },
    ],
  },
  brokers: {
    title: 'Para brókers',
    lead: 'Únase a la red, envíe negocios en minutos y consulte su estado por chat, texto o teléfono.',
    points: ['Revisión inmediata del escenario', 'Negocios asignados por estado, tipo y monto', 'Su comisión es suya'],
    cta: 'Enviar un negocio',
  },
  footer: {
    disclaimer: 'Este sitio ofrece información general sobre financiamiento inmobiliario privado. No es una oferta, compromiso ni aprobación de préstamo. Todo préstamo está sujeto a evaluación, tasación y aprobación del prestamista. Las tasas, puntos y términos los fija solo un bróker o prestamista con licencia.',
    ehoText: 'Igualdad de oportunidades en la vivienda',
    rights: 'Todos los derechos reservados.',
  },
  units: { mo: 'meses', yr: 'años', varies: 'Varía', lang: 'Idioma' },
};

const fa: Dict = {
  nav: { programs: 'برنامه‌های وام', rates: 'نرخ‌ها', how: 'روند کار', brokers: 'ویژه کارگزاران', talk: 'با ما صحبت کنید' },
  hero: {
    title: 'سرمایه خصوصی برای سرمایه‌گذاران املاک، همراه با کارگزار مناسب.',
    lead: 'وام‌های هارد مانی، خرید و بازسازی، پل، ساخت و DSCR از طریق شبکه‌ای با بیش از ۵۰ کارگزار دارای مجوز. درباره نرخ‌های امروز یا معامله خود، به زبان خودتان و در هر ساعتی بپرسید.',
    ctaChat: 'با معامله خود شروع کنید',
    ctaBroker: 'ثبت معامله به‌عنوان کارگزار',
    proof: ['بیش از ۵۰ کارگزار دارای مجوز', 'پاسخ به ۵ زبان', 'نرخ‌های روز بازار با منبع'],
  },
  chat: {
    title: 'میز وام',
    sub: 'دستیار هوش مصنوعی. یک کارگزار دارای مجوز پیگیری می‌کند.',
    greeting: (l) => `سلام، از تماس شما با ${l} سپاسگزاریم. من دستیار وام با هوش مصنوعی هستم، نه کارشناس وام؛ بنابراین نمی‌توانم وامی را تأیید کنم یا نرخ شما را اعلام کنم. می‌توانم گزینه‌هایتان را توضیح دهم، نرخ‌های امروز بازار را بگویم و معامله شما را به کارگزار مناسب دارای مجوز برسانم. روی چه کاری کار می‌کنید؟`,
    starters: ['نرخ وام هارد مانی امروز چقدر است؟', 'برای خرید و بازسازی وام می‌خواهم', 'کارگزار هستم و معامله دارم', 'وام‌دهنده‌ام پیش از بستن قرارداد کنار کشید'],
    placeholder: 'سؤال خود را بنویسید یا معامله را شرح دهید',
    send: 'ارسال',
    thinking: 'در حال بررسی',
    talk: 'گفت‌وگو با میز وام',
    listening: 'در حال شنیدن. برای توقف بزنید.',
    stop: 'توقف',
    voiceUnsupported: 'صدا در این مرورگر در دسترس نیست. می‌توانید بنویسید.',
    error: 'دستیار پاسخ نداد. اتصال خود را بررسی کنید و دوباره بفرستید.',
    consent: (l) => `موافقم که ${l} و کارگزاران همکارش درباره درخواست تأمین مالی من، از طریق شماره و ایمیلی که ارائه می‌کنم با من تماس بگیرند؛ از جمله با تماس و پیامک با صدای تولیدشده توسط هوش مصنوعی یا فناوری خودکار. این رضایت شرط دریافت هیچ وامی نیست. ممکن است هزینه پیام و داده اعمال شود. برای لغو، STOP را بفرستید.`,
    fine: 'فقط اطلاعات عمومی و بازه‌های بازار؛ پیشنهاد یا تعهد وام نیست. لطفاً شماره تأمین اجتماعی یا شماره حساب را اینجا وارد نکنید.',
  },
  rates: {
    title: 'نرخ‌های مرجع امروز',
    note: 'نرخ‌های مرجع روزانه تغییر می‌کنند. شرایط وام خصوصی بر پایه آن‌ها به‌علاوه ریسک هر معامله تعیین می‌شود.',
    asOf: 'تاریخ',
    source: 'منبع',
    labels: { DPRIME: 'نرخ پرایم', SOFR: 'SOFR یک‌شبه', DGS10: 'اوراق خزانه ۱۰ ساله', MORTGAGE30US: 'میانگین وام ثابت ۳۰ ساله', DFEDTARU: 'نرخ صندوق‌های فدرال، سقف' },
  },
  programs: {
    title: 'برنامه‌های وام',
    lead: 'بازه‌های رایج بازار برای وام‌های خصوصی املاک. کارگزار شما پس از بررسی معامله، شرایط واقعی را تعیین می‌کند.',
    cols: ['برنامه', 'مناسب برای', 'نرخ رایج', 'امتیاز', 'مدت'],
    rows: {
      fix_flip: { name: 'خرید و بازسازی', use: 'خرید، نوسازی و فروش' },
      bridge: { name: 'وام پل', use: 'بستن سریع، بازتأمین یا فروش بعدی' },
      construction: { name: 'ساخت از پایه', use: 'ساخت‌وساز جدید و بازسازی کامل' },
      dscr: { name: 'اجاره DSCR', use: 'اجاره بلندمدت، بر پایه درآمد اجاره' },
      commercial: { name: 'پل تجاری', use: 'چندواحدی، تجاری، صنعتی' },
    },
    note: 'بازه‌ها از نظرسنجی‌های منتشرشده بازار در ۲۰۲۶. پیشنهاد وام نیست.',
  },
  how: {
    title: 'روند کار',
    steps: [
      { t: 'معامله را برای ما شرح دهید', d: 'با میز وام بنویسید یا صحبت کنید. فقط آنچه وام‌دهنده لازم دارد پرسیده می‌شود: ملک، ارقام، راه خروج و زمان‌بندی.' },
      { t: 'ببینید مناسب است یا نه', d: 'پاسخی روشن می‌گیرید که آیا معامله در چارچوب وام‌دهی قرار می‌گیرد و چه چیزی آن را مناسب می‌کند.' },
      { t: 'کارگزار دارای مجوز تماس می‌گیرد', d: 'معامله شما معمولاً ظرف چند دقیقه به کارگزار دارای مجوز در ایالت شما برای همان نوع وام می‌رسد.' },
    ],
  },
  brokers: {
    title: 'ویژه کارگزاران',
    lead: 'به شبکه بپیوندید، در چند دقیقه معامله ثبت کنید و وضعیت را هر زمان با چت، پیامک یا تلفن ببینید.',
    points: ['بررسی فوری سناریو با چارچوب وام‌دهی', 'تخصیص بر اساس ایالت، نوع و مبلغ وام', 'کارمزد شما متعلق به خودتان است'],
    cta: 'ثبت معامله',
  },
  footer: {
    disclaimer: 'این سایت اطلاعات عمومی درباره تأمین مالی خصوصی املاک ارائه می‌کند و پیشنهاد، تعهد یا تأیید وام نیست. همه وام‌ها منوط به ارزیابی، کارشناسی و تأیید وام‌دهنده هستند. نرخ، امتیاز و شرایط فقط توسط کارگزار یا وام‌دهنده دارای مجوز تعیین می‌شود.',
    ehoText: 'فرصت برابر مسکن',
    rights: 'همه حقوق محفوظ است.',
  },
  units: { mo: 'ماه', yr: 'سال', varies: 'متغیر', lang: 'زبان' },
};

const de: Dict = {
  nav: { programs: 'Kreditprogramme', rates: 'Zinsen', how: 'So funktioniert es', brokers: 'Für Makler', talk: 'Mit uns sprechen' },
  hero: {
    title: 'Privates Kapital für Immobilieninvestoren, vermittelt an den passenden Makler.',
    lead: 'Hard-Money-, Fix-and-Flip-, Überbrückungs-, Bau- und DSCR-Kredite über ein Netzwerk von mehr als 50 lizenzierten Maklern. Fragen Sie nach den heutigen Zinsen oder Ihrem Projekt, in Ihrer Sprache, rund um die Uhr.',
    ctaChat: 'Mit Ihrem Projekt beginnen',
    ctaBroker: 'Als Makler ein Projekt einreichen',
    proof: ['Mehr als 50 lizenzierte Makler', 'Antworten in 5 Sprachen', 'Tagesaktuelle Marktzinsen mit Quelle'],
  },
  chat: {
    title: 'Kreditdesk',
    sub: 'KI-Assistent. Ein lizenzierter Makler meldet sich.',
    greeting: (l) => `Guten Tag und danke, dass Sie ${l} kontaktieren. Ich bin der KI-Kreditassistent, kein Kreditberater. Ich kann daher keine Kredite genehmigen und keinen Zinssatz nennen. Ich kann Ihre Optionen erklären, die heutigen Marktzinsen nennen und Ihr Projekt an den passenden lizenzierten Makler weitergeben. Woran arbeiten Sie?`,
    starters: ['Wie hoch sind die Hard-Money-Zinsen heute?', 'Ich brauche einen Fix-and-Flip-Kredit', 'Ich bin Makler und habe ein Projekt', 'Mein Kreditgeber ist vor dem Abschluss abgesprungen'],
    placeholder: 'Frage eingeben oder Projekt beschreiben',
    send: 'Senden',
    thinking: 'Wird geprüft',
    talk: 'Mit dem Kreditdesk sprechen',
    listening: 'Ich höre zu. Zum Beenden tippen.',
    stop: 'Beenden',
    voiceUnsupported: 'Sprache ist in diesem Browser nicht verfügbar. Sie können tippen.',
    error: 'Der Assistent hat nicht geantwortet. Prüfen Sie Ihre Verbindung und senden Sie erneut.',
    consent: (l) => `Ich stimme zu, dass ${l} und seine Partnermakler mich unter der angegebenen Nummer und E-Mail-Adresse zu meiner Finanzierungsanfrage kontaktieren dürfen, auch per Anruf und SMS mit KI-generierter Stimme oder automatisierter Technik. Die Einwilligung ist keine Voraussetzung für einen Kredit. Es können Nachrichten- und Datengebühren anfallen. Antworten Sie STOP zum Abmelden.`,
    fine: 'Nur allgemeine Informationen und Marktspannen, kein Kreditangebot und keine Zusage. Bitte geben Sie hier keine Sozialversicherungs- oder Kontonummern ein.',
  },
  rates: {
    title: 'Heutige Referenzzinsen',
    note: 'Referenzzinsen ändern sich täglich. Private Kredite werden auf dieser Basis plus dem Risiko des jeweiligen Projekts bepreist.',
    asOf: 'Stand',
    source: 'Quelle',
    labels: { DPRIME: 'Prime Rate', SOFR: 'SOFR, Tagesgeld', DGS10: '10-jährige US-Staatsanleihe', MORTGAGE30US: '30 Jahre fest, Durchschnitt', DFEDTARU: 'Leitzins, Obergrenze' },
  },
  programs: {
    title: 'Kreditprogramme',
    lead: 'Typische Marktspannen für private Immobilienkredite. Ihr Makler legt die tatsächlichen Konditionen nach Prüfung fest.',
    cols: ['Programm', 'Geeignet für', 'Typischer Zins', 'Punkte', 'Laufzeit'],
    rows: {
      fix_flip: { name: 'Fix-and-Flip', use: 'Kaufen, sanieren, verkaufen' },
      bridge: { name: 'Überbrückung', use: 'Schnell abschließen, später refinanzieren oder verkaufen' },
      construction: { name: 'Neubau', use: 'Neubauten und Kernsanierungen' },
      dscr: { name: 'DSCR-Vermietung', use: 'Langfristige Vermietung, Bonität über die Miete' },
      commercial: { name: 'Gewerbliche Überbrückung', use: 'Mehrfamilienhaus, Handel, Industrie' },
    },
    note: 'Spannen aus veröffentlichten Marktumfragen 2026. Kein Kreditangebot.',
  },
  how: {
    title: 'So funktioniert es',
    steps: [
      { t: 'Beschreiben Sie das Projekt', d: 'Schreiben oder sprechen Sie mit dem Kreditdesk. Gefragt wird nur, was ein Kreditgeber braucht: Objekt, Zahlen, Exit und Zeitplan.' },
      { t: 'Prüfen, ob es passt', d: 'Sie erhalten eine klare Antwort, ob das Projekt in den Kreditrahmen passt und was es passend machen würde.' },
      { t: 'Ein lizenzierter Makler ruft an', d: 'Ihr Projekt geht an den in Ihrem Bundesstaat lizenzierten Makler für diese Kreditart, meist innerhalb von Minuten.' },
    ],
  },
  brokers: {
    title: 'Für Makler',
    lead: 'Treten Sie dem Netzwerk bei, reichen Sie Projekte in Minuten ein und prüfen Sie den Status jederzeit per Chat, SMS oder Telefon.',
    points: ['Sofortige Szenarioprüfung', 'Zuordnung nach Bundesstaat, Kreditart und Höhe', 'Ihre Provision bleibt Ihre'],
    cta: 'Projekt einreichen',
  },
  footer: {
    disclaimer: 'Diese Website bietet allgemeine Informationen zur privaten Immobilienfinanzierung. Sie ist kein Kreditangebot, keine Zusage und keine Genehmigung. Alle Kredite unterliegen Prüfung, Bewertung und Freigabe durch den Kreditgeber. Zinsen, Punkte und Konditionen legt nur ein lizenzierter Makler oder Kreditgeber fest.',
    ehoText: 'Chancengleichheit beim Wohnen',
    rights: 'Alle Rechte vorbehalten.',
  },
  units: { mo: 'Monate', yr: 'Jahre', varies: 'Variabel', lang: 'Sprache' },
};

const zh: Dict = {
  nav: { programs: '贷款产品', rates: '利率', how: '流程', brokers: '经纪人专区', talk: '与我们交谈' },
  hero: {
    title: '为房地产投资者提供私人资本，并匹配合适的经纪人。',
    lead: '通过由50多位持牌经纪人组成的网络，提供硬钱贷款、翻新转售、过桥、建筑及DSCR贷款。随时用您的语言咨询今日利率或您的项目。',
    ctaChat: '从您的项目开始',
    ctaBroker: '以经纪人身份提交项目',
    proof: ['50多位持牌经纪人', '支持5种语言', '每日更新并注明来源的市场利率'],
  },
  chat: {
    title: '贷款服务台',
    sub: 'AI助手。持牌经纪人将与您跟进。',
    greeting: (l) => `您好，感谢您联系${l}。我是AI贷款助手，不是贷款专员，因此无法批准贷款或报出您的利率。我可以为您介绍各种选择、提供今日市场利率，并将您的项目转给合适的持牌经纪人。请问您在做什么项目？`,
    starters: ['今天的硬钱贷款利率是多少？', '我需要翻新转售贷款', '我是经纪人，有一个项目', '我的贷款方在交割前退出了'],
    placeholder: '输入您的问题或描述您的项目',
    send: '发送',
    thinking: '正在查询',
    talk: '与贷款服务台通话',
    listening: '正在聆听，点击停止。',
    stop: '停止',
    voiceUnsupported: '此浏览器不支持语音，您可以直接输入。',
    error: '助手未响应。请检查网络后重新发送。',
    consent: (l) => `我同意${l}及其合作经纪人就我的融资咨询，通过我提供的电话和电子邮件与我联系，包括使用AI生成语音或自动化技术的电话和短信。同意并非获得任何贷款的条件。可能产生短信和数据费用。回复STOP即可退订。`,
    fine: '仅提供一般信息和市场区间，并非贷款要约或承诺。请勿在此填写社会安全号码或账户号码。',
  },
  rates: {
    title: '今日基准利率',
    note: '基准利率每日变动。私人贷款以此为基础，再加上每个项目的风险定价。',
    asOf: '截至',
    source: '来源',
    labels: { DPRIME: '最优惠利率', SOFR: 'SOFR隔夜利率', DGS10: '10年期美国国债', MORTGAGE30US: '30年固定房贷平均', DFEDTARU: '联邦基金利率上限' },
  },
  programs: {
    title: '贷款产品',
    lead: '私人房地产贷款的常见市场区间。实际条款由您的经纪人在审核项目后确定。',
    cols: ['产品', '适用于', '常见利率', '点数', '期限'],
    rows: {
      fix_flip: { name: '翻新转售', use: '购买、翻新并出售' },
      bridge: { name: '过桥贷款', use: '快速交割，之后再融资或出售' },
      construction: { name: '新建工程', use: '新建与大规模重建' },
      dscr: { name: 'DSCR出租', use: '长期出租，按租金收入审核' },
      commercial: { name: '商业过桥', use: '多户住宅、零售、工业' },
    },
    note: '区间来自2026年公开的市场调查，并非贷款要约。',
  },
  how: {
    title: '流程',
    steps: [
      { t: '介绍您的项目', d: '与贷款服务台文字或语音交流。只询问贷款方需要的信息：房产、金额、退出方式和时间。' },
      { t: '查看是否符合', d: '您会得到明确答复：项目是否符合放贷标准，以及如何调整才能符合。' },
      { t: '持牌经纪人来电', d: '您的项目通常会在几分钟内转给您所在州、该贷款类型的持牌经纪人。' },
    ],
  },
  brokers: {
    title: '经纪人专区',
    lead: '加入网络，几分钟内提交项目，并可随时通过聊天、短信或电话查询进度。',
    points: ['即时对照放贷标准进行方案评估', '按州、贷款类型和金额分配项目', '您的佣金归您所有'],
    cta: '提交项目',
  },
  footer: {
    disclaimer: '本网站提供有关私人房地产融资的一般信息，并非贷款要约、承诺或批准。所有贷款均需经过审核、评估及贷款方批准。利率、点数和条款仅由持牌经纪人或贷款方确定。',
    ehoText: '平等住房机会',
    rights: '保留所有权利。',
  },
  units: { mo: '个月', yr: '年', varies: '视情况而定', lang: '语言' },
};

export const DICT: Record<Lang, Dict> = { en, es, fa, de, zh };
