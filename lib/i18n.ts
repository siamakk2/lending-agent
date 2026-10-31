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
  embed: { title: string; lead: string; steps: string[]; copy: string; copied: string; note: string };
  segments: { residential: string; commercial: string };
  coverage: { title: string; lead: string };
};

const en: Dict = {
  nav: { programs: 'Loan programs', rates: 'Rates', how: 'How it works', brokers: 'For brokers', talk: 'Talk to us' },
  hero: {
    title: 'Residential and commercial real estate loans, every type, in every state we serve.',
    lead: 'Lending Desk is a non-bank lender. Our account executives and 50+ partner brokers arrange purchase, refinance, bridge, fix-and-flip, construction, DSCR, bank-statement and commercial loans across multiple states. Ask about today’s rates or your deal, in your language, any hour.',
    ctaChat: 'Start with your deal',
    ctaBroker: 'Submit a deal as a broker',
    proof: ['Non-bank lender, multi-state', 'Account executives and 50+ partner brokers', 'Answers in 5 languages'],
  },
  chat: {
    title: 'Lending desk',
    sub: 'AI assistant. An account executive follows up.',
    greeting: (l) => `Hello, and thank you for contacting ${l}. I’m the AI lending assistant, not a loan officer, so I can’t approve loans or quote your rate. I can explain your options, share today’s market rates and get your deal to the right account executive. What are you working on?`,
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
    lead: 'Typical market ranges for residential and commercial real estate loans. Your account executive confirms actual terms after reviewing the deal.',
    cols: ['Program', 'Best for', 'Typical rate', 'Points', 'Term'],
    rows: {
      fix_flip: { name: 'Fix-and-flip', use: 'Buy, renovate and sell' },
      bridge: { name: 'Bridge', use: 'Close fast, refinance or sell later' },
      construction: { name: 'Ground-up construction', use: 'New builds and major rebuilds' },
      dscr: { name: 'DSCR rental', use: 'Long-term rentals, qualify on rent' },
      bank_statement: { name: 'Bank-statement / non-QM', use: 'Self-employed buyers and refinances, no tax returns' },
      commercial_perm: { name: 'Commercial permanent', use: 'Multifamily, office, retail, industrial, mixed-use' },
      commercial: { name: 'Commercial bridge', use: 'Transitional and value-add commercial' },
    },
    note: 'Ranges from published 2026 market surveys. Not an offer to lend.',
  },
  how: {
    title: 'How it works',
    steps: [
      { t: 'Tell us about the deal', d: 'Chat or talk with the lending desk. It asks only what a lender needs: property, numbers, exit and timeline.' },
      { t: 'See if it fits', d: 'You get a plain answer on whether the deal fits the lending box, and what would make it fit.' },
      { t: 'An account executive calls', d: 'Your deal goes to the account executive covering your state and loan type, usually within minutes.' },
    ],
  },
  brokers: {
    title: 'For brokers',
    lead: 'Join the network, submit deals in minutes and check status any time by chat, text or phone.',
    points: ['Instant scenario check against the lending box', 'Deals routed by state, loan type and size', 'Your comp stays yours'],
    cta: 'Submit a deal',
  },
  footer: {
    disclaimer: 'Lending Desk is a non-bank lender, not a bank or depository institution. This site provides general information about residential and commercial real estate financing. It is not a loan offer, commitment or approval. All loans are subject to underwriting, appraisal and lender approval. Rates, points and terms are set only by a licensed broker or lender.',
    ehoText: 'Equal Housing Opportunity',
    rights: 'All rights reserved.',
  },
  units: { mo: 'months', yr: 'years', varies: 'Varies', lang: 'Language' },
  embed: {
    title: 'Put Lending Desk on your website',
    lead: 'Brokers, realtors and partners can add the lending desk to any website with one line of code. Every lead it captures is tagged to you.',
    steps: ['Copy the code', 'Replace YOUR-ID with your partner ID', 'Paste it before the closing </body> tag'],
    copy: 'Copy code',
    copied: 'Copied',
    note: 'Works on WordPress, Wix, Squarespace, Shopify, Webflow and custom sites. Add data-lang="es" for Spanish, "fa" Persian, "de" German, "zh" Chinese.',
  },
  segments: { residential: 'Residential', commercial: 'Commercial' },
  coverage: { title: 'Where we lend', lead: 'Account executives cover these states today. Ask the lending desk about others.' },
};

const es: Dict = {
  nav: { programs: 'Programas de préstamo', rates: 'Tasas', how: 'Cómo funciona', brokers: 'Para brókers', talk: 'Hable con nosotros' },
  hero: {
    title: 'Préstamos inmobiliarios residenciales y comerciales de todo tipo, en cada estado que atendemos.',
    lead: 'Lending Desk es un prestamista no bancario. Nuestros ejecutivos de cuenta y más de 50 brókers asociados estructuran préstamos de compra, refinanciamiento, puente, fix-and-flip, construcción, DSCR, con estados de cuenta bancarios y comerciales en varios estados. Pregunte por las tasas de hoy o por su negocio, en su idioma y a cualquier hora.',
    ctaChat: 'Empiece con su negocio',
    ctaBroker: 'Enviar un negocio como bróker',
    proof: ['Prestamista no bancario, en varios estados', 'Ejecutivos de cuenta y más de 50 brókers asociados', 'Respuestas en 5 idiomas'],
  },
  chat: {
    title: 'Mesa de préstamos',
    sub: 'Asistente de IA. Un ejecutivo de cuenta le dará seguimiento.',
    greeting: (l) => `Hola, gracias por comunicarse con ${l}. Soy el asistente de préstamos con inteligencia artificial, no un oficial de préstamos, así que no puedo aprobar préstamos ni cotizar su tasa. Puedo explicarle sus opciones, compartir las tasas de mercado de hoy y enviar su negocio al ejecutivo de cuenta indicado. ¿En qué está trabajando?`,
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
    lead: 'Rangos típicos del mercado para préstamos inmobiliarios residenciales y comerciales. Su ejecutivo de cuenta confirma los términos reales tras revisar el negocio.',
    cols: ['Programa', 'Ideal para', 'Tasa típica', 'Puntos', 'Plazo'],
    rows: {
      fix_flip: { name: 'Fix-and-flip', use: 'Comprar, renovar y vender' },
      bridge: { name: 'Préstamo puente', use: 'Cerrar rápido y refinanciar o vender después' },
      construction: { name: 'Construcción nueva', use: 'Obras nuevas y reconstrucciones' },
      dscr: { name: 'Alquiler DSCR', use: 'Rentas a largo plazo, califica con la renta' },
      bank_statement: { name: 'Estados de cuenta / non-QM', use: 'Trabajadores independientes, sin declaraciones de impuestos' },
      commercial_perm: { name: 'Comercial a largo plazo', use: 'Multifamiliar, oficinas, comercio, industrial, uso mixto' },
      commercial: { name: 'Puente comercial', use: 'Propiedades comerciales en transición o con valor agregado' },
    },
    note: 'Rangos de encuestas de mercado publicadas en 2026. No es una oferta de préstamo.',
  },
  how: {
    title: 'Cómo funciona',
    steps: [
      { t: 'Cuéntenos del negocio', d: 'Escriba o hable con la mesa de préstamos. Solo pregunta lo que un prestamista necesita: propiedad, números, salida y plazos.' },
      { t: 'Vea si califica', d: 'Recibe una respuesta clara sobre si el negocio encaja y qué haría falta para que encaje.' },
      { t: 'Le llama un ejecutivo de cuenta', d: 'Su negocio va al ejecutivo de cuenta que atiende su estado y tipo de préstamo, por lo general en minutos.' },
    ],
  },
  brokers: {
    title: 'Para brókers',
    lead: 'Únase a la red, envíe negocios en minutos y consulte su estado por chat, texto o teléfono.',
    points: ['Revisión inmediata del escenario', 'Negocios asignados por estado, tipo y monto', 'Su comisión es suya'],
    cta: 'Enviar un negocio',
  },
  footer: {
    disclaimer: 'Lending Desk es un prestamista no bancario, no un banco ni una institución de depósito. Este sitio ofrece información general sobre financiamiento inmobiliario residencial y comercial. No es una oferta, compromiso ni aprobación de préstamo. Todo préstamo está sujeto a evaluación, tasación y aprobación del prestamista. Las tasas, puntos y términos los fija solo un bróker o prestamista con licencia.',
    ehoText: 'Igualdad de oportunidades en la vivienda',
    rights: 'Todos los derechos reservados.',
  },
  units: { mo: 'meses', yr: 'años', varies: 'Varía', lang: 'Idioma' },
  embed: {
    title: 'Ponga Lending Desk en su sitio web',
    lead: 'Brókers, agentes inmobiliarios y socios pueden agregar la mesa de préstamos a cualquier sitio con una sola línea de código. Cada cliente que capta queda asignado a usted.',
    steps: ['Copie el código', 'Reemplace YOUR-ID por su ID de socio', 'Péguelo antes de la etiqueta </body>'],
    copy: 'Copiar código',
    copied: 'Copiado',
    note: 'Funciona en WordPress, Wix, Squarespace, Shopify, Webflow y sitios a medida. Agregue data-lang="es" para español.',
  },
  segments: { residential: 'Residencial', commercial: 'Comercial' },
  coverage: { title: 'Dónde prestamos', lead: 'Nuestros ejecutivos de cuenta cubren hoy estos estados. Pregunte por otros a la mesa de préstamos.' },
};

const fa: Dict = {
  nav: { programs: 'برنامه‌های وام', rates: 'نرخ‌ها', how: 'روند کار', brokers: 'ویژه کارگزاران', talk: 'با ما صحبت کنید' },
  hero: {
    title: 'وام‌های املاک مسکونی و تجاری از هر نوع، در همه ایالت‌هایی که پوشش می‌دهیم.',
    lead: 'Lending Desk یک وام‌دهنده غیربانکی است. مدیران حساب ما و بیش از ۵۰ کارگزار همکار، وام‌های خرید، بازتأمین، پل، خرید و بازسازی، ساخت، DSCR، صورت‌حساب بانکی و تجاری را در چندین ایالت ترتیب می‌دهند. درباره نرخ‌های امروز یا معامله خود، به زبان خودتان و در هر ساعتی بپرسید.',
    ctaChat: 'با معامله خود شروع کنید',
    ctaBroker: 'ثبت معامله به‌عنوان کارگزار',
    proof: ['وام‌دهنده غیربانکی، چندایالتی', 'مدیران حساب و بیش از ۵۰ کارگزار همکار', 'پاسخ به ۵ زبان'],
  },
  chat: {
    title: 'میز وام',
    sub: 'دستیار هوش مصنوعی. یک مدیر حساب پیگیری می‌کند.',
    greeting: (l) => `سلام، از تماس شما با ${l} سپاسگزاریم. من دستیار وام با هوش مصنوعی هستم، نه کارشناس وام؛ بنابراین نمی‌توانم وامی را تأیید کنم یا نرخ شما را اعلام کنم. می‌توانم گزینه‌هایتان را توضیح دهم، نرخ‌های امروز بازار را بگویم و معامله شما را به مدیر حساب مناسب برسانم. روی چه کاری کار می‌کنید؟`,
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
    lead: 'بازه‌های رایج بازار برای وام‌های املاک مسکونی و تجاری. مدیر حساب شما پس از بررسی معامله، شرایط واقعی را تأیید می‌کند.',
    cols: ['برنامه', 'مناسب برای', 'نرخ رایج', 'امتیاز', 'مدت'],
    rows: {
      fix_flip: { name: 'خرید و بازسازی', use: 'خرید، نوسازی و فروش' },
      bridge: { name: 'وام پل', use: 'بستن سریع، بازتأمین یا فروش بعدی' },
      construction: { name: 'ساخت از پایه', use: 'ساخت‌وساز جدید و بازسازی کامل' },
      dscr: { name: 'اجاره DSCR', use: 'اجاره بلندمدت، بر پایه درآمد اجاره' },
      bank_statement: { name: 'صورت‌حساب بانکی / non-QM', use: 'خوداشتغالان، بدون اظهارنامه مالیاتی' },
      commercial_perm: { name: 'تجاری بلندمدت', use: 'چندواحدی، اداری، تجاری، صنعتی، کاربری مختلط' },
      commercial: { name: 'پل تجاری', use: 'املاک تجاری در حال تغییر یا ارزش‌افزایی' },
    },
    note: 'بازه‌ها از نظرسنجی‌های منتشرشده بازار در ۲۰۲۶. پیشنهاد وام نیست.',
  },
  how: {
    title: 'روند کار',
    steps: [
      { t: 'معامله را برای ما شرح دهید', d: 'با میز وام بنویسید یا صحبت کنید. فقط آنچه وام‌دهنده لازم دارد پرسیده می‌شود: ملک، ارقام، راه خروج و زمان‌بندی.' },
      { t: 'ببینید مناسب است یا نه', d: 'پاسخی روشن می‌گیرید که آیا معامله در چارچوب وام‌دهی قرار می‌گیرد و چه چیزی آن را مناسب می‌کند.' },
      { t: 'مدیر حساب تماس می‌گیرد', d: 'معامله شما معمولاً ظرف چند دقیقه به مدیر حسابی می‌رسد که ایالت و نوع وام شما را پوشش می‌دهد.' },
    ],
  },
  brokers: {
    title: 'ویژه کارگزاران',
    lead: 'به شبکه بپیوندید، در چند دقیقه معامله ثبت کنید و وضعیت را هر زمان با چت، پیامک یا تلفن ببینید.',
    points: ['بررسی فوری سناریو با چارچوب وام‌دهی', 'تخصیص بر اساس ایالت، نوع و مبلغ وام', 'کارمزد شما متعلق به خودتان است'],
    cta: 'ثبت معامله',
  },
  footer: {
    disclaimer: 'Lending Desk یک وام‌دهنده غیربانکی است، نه بانک یا مؤسسه سپرده‌پذیر. این سایت اطلاعات عمومی درباره تأمین مالی املاک مسکونی و تجاری ارائه می‌کند و پیشنهاد، تعهد یا تأیید وام نیست. همه وام‌ها منوط به ارزیابی، کارشناسی و تأیید وام‌دهنده هستند. نرخ، امتیاز و شرایط فقط توسط کارگزار یا وام‌دهنده دارای مجوز تعیین می‌شود.',
    ehoText: 'فرصت برابر مسکن',
    rights: 'همه حقوق محفوظ است.',
  },
  units: { mo: 'ماه', yr: 'سال', varies: 'متغیر', lang: 'زبان' },
  embed: {
    title: 'Lending Desk را روی وب‌سایت خود قرار دهید',
    lead: 'کارگزاران، مشاوران املاک و همکاران می‌توانند میز وام را با یک خط کد به هر وب‌سایتی اضافه کنند. هر مشتری‌ای که جذب شود به نام شما ثبت می‌شود.',
    steps: ['کد را کپی کنید', 'به‌جای YOUR-ID شناسه همکاری خود را بگذارید', 'آن را پیش از تگ </body> قرار دهید'],
    copy: 'کپی کد',
    copied: 'کپی شد',
    note: 'روی وردپرس، Wix، Squarespace، Shopify، Webflow و سایت‌های اختصاصی کار می‌کند. برای فارسی data-lang="fa" را اضافه کنید.',
  },
  segments: { residential: 'مسکونی', commercial: 'تجاری' },
  coverage: { title: 'ایالت‌های تحت پوشش', lead: 'مدیران حساب ما امروز این ایالت‌ها را پوشش می‌دهند. درباره سایر ایالت‌ها از میز وام بپرسید.' },
};

const de: Dict = {
  nav: { programs: 'Kreditprogramme', rates: 'Zinsen', how: 'So funktioniert es', brokers: 'Für Makler', talk: 'Mit uns sprechen' },
  hero: {
    title: 'Wohn- und Gewerbeimmobilienkredite jeder Art, in allen Bundesstaaten, die wir betreuen.',
    lead: 'Lending Desk ist ein Nichtbanken-Kreditgeber. Unsere Account Executives und mehr als 50 Partnermakler strukturieren Kauf-, Refinanzierungs-, Überbrückungs-, Fix-and-Flip-, Bau-, DSCR-, Kontoauszugs- und Gewerbekredite in mehreren Bundesstaaten. Fragen Sie nach den heutigen Zinsen oder Ihrem Projekt, in Ihrer Sprache, rund um die Uhr.',
    ctaChat: 'Mit Ihrem Projekt beginnen',
    ctaBroker: 'Als Makler ein Projekt einreichen',
    proof: ['Nichtbanken-Kreditgeber, mehrere Bundesstaaten', 'Account Executives und mehr als 50 Partnermakler', 'Antworten in 5 Sprachen'],
  },
  chat: {
    title: 'Kreditdesk',
    sub: 'KI-Assistent. Ein Account Executive meldet sich.',
    greeting: (l) => `Guten Tag und danke, dass Sie ${l} kontaktieren. Ich bin der KI-Kreditassistent, kein Kreditberater. Ich kann daher keine Kredite genehmigen und keinen Zinssatz nennen. Ich kann Ihre Optionen erklären, die heutigen Marktzinsen nennen und Ihr Projekt an den passenden Account Executive weitergeben. Woran arbeiten Sie?`,
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
    lead: 'Typische Marktspannen für Wohn- und Gewerbeimmobilienkredite. Ihr Account Executive bestätigt die tatsächlichen Konditionen nach Prüfung.',
    cols: ['Programm', 'Geeignet für', 'Typischer Zins', 'Punkte', 'Laufzeit'],
    rows: {
      fix_flip: { name: 'Fix-and-Flip', use: 'Kaufen, sanieren, verkaufen' },
      bridge: { name: 'Überbrückung', use: 'Schnell abschließen, später refinanzieren oder verkaufen' },
      construction: { name: 'Neubau', use: 'Neubauten und Kernsanierungen' },
      dscr: { name: 'DSCR-Vermietung', use: 'Langfristige Vermietung, Bonität über die Miete' },
      bank_statement: { name: 'Kontoauszug / Non-QM', use: 'Selbstständige, ohne Steuererklärungen' },
      commercial_perm: { name: 'Gewerbliche Langfristfinanzierung', use: 'Mehrfamilienhaus, Büro, Handel, Industrie, gemischte Nutzung' },
      commercial: { name: 'Gewerbliche Überbrückung', use: 'Gewerbeobjekte im Umbruch oder mit Wertsteigerungspotenzial' },
    },
    note: 'Spannen aus veröffentlichten Marktumfragen 2026. Kein Kreditangebot.',
  },
  how: {
    title: 'So funktioniert es',
    steps: [
      { t: 'Beschreiben Sie das Projekt', d: 'Schreiben oder sprechen Sie mit dem Kreditdesk. Gefragt wird nur, was ein Kreditgeber braucht: Objekt, Zahlen, Exit und Zeitplan.' },
      { t: 'Prüfen, ob es passt', d: 'Sie erhalten eine klare Antwort, ob das Projekt in den Kreditrahmen passt und was es passend machen würde.' },
      { t: 'Ein Account Executive ruft an', d: 'Ihr Projekt geht an den Account Executive für Ihren Bundesstaat und Ihre Kreditart, meist innerhalb von Minuten.' },
    ],
  },
  brokers: {
    title: 'Für Makler',
    lead: 'Treten Sie dem Netzwerk bei, reichen Sie Projekte in Minuten ein und prüfen Sie den Status jederzeit per Chat, SMS oder Telefon.',
    points: ['Sofortige Szenarioprüfung', 'Zuordnung nach Bundesstaat, Kreditart und Höhe', 'Ihre Provision bleibt Ihre'],
    cta: 'Projekt einreichen',
  },
  footer: {
    disclaimer: 'Lending Desk ist ein Nichtbanken-Kreditgeber, keine Bank und kein Einlageninstitut. Diese Website bietet allgemeine Informationen zur Finanzierung von Wohn- und Gewerbeimmobilien. Sie ist kein Kreditangebot, keine Zusage und keine Genehmigung. Alle Kredite unterliegen Prüfung, Bewertung und Freigabe durch den Kreditgeber. Zinsen, Punkte und Konditionen legt nur ein lizenzierter Makler oder Kreditgeber fest.',
    ehoText: 'Chancengleichheit beim Wohnen',
    rights: 'Alle Rechte vorbehalten.',
  },
  units: { mo: 'Monate', yr: 'Jahre', varies: 'Variabel', lang: 'Sprache' },
  embed: {
    title: 'Lending Desk auf Ihrer Website',
    lead: 'Makler, Immobilienberater und Partner können den Kreditdesk mit einer einzigen Codezeile auf jeder Website einbinden. Jeder gewonnene Kontakt wird Ihnen zugeordnet.',
    steps: ['Code kopieren', 'YOUR-ID durch Ihre Partner-ID ersetzen', 'Vor dem schließenden </body>-Tag einfügen'],
    copy: 'Code kopieren',
    copied: 'Kopiert',
    note: 'Funktioniert mit WordPress, Wix, Squarespace, Shopify, Webflow und eigenen Websites. data-lang="de" für Deutsch.',
  },
  segments: { residential: 'Wohnimmobilien', commercial: 'Gewerbe' },
  coverage: { title: 'Wo wir finanzieren', lead: 'Unsere Account Executives betreuen derzeit diese Bundesstaaten. Fragen Sie den Kreditdesk nach weiteren.' },
};

const zh: Dict = {
  nav: { programs: '贷款产品', rates: '利率', how: '流程', brokers: '经纪人专区', talk: '与我们交谈' },
  hero: {
    title: '住宅与商业房地产贷款，各类产品，覆盖我们服务的各州。',
    lead: 'Lending Desk是一家非银行贷款机构。我们的客户经理与50多位合作经纪人在多个州为您安排购房、再融资、过桥、翻新转售、建筑、DSCR、银行流水及商业贷款。随时用您的语言咨询今日利率或您的项目。',
    ctaChat: '从您的项目开始',
    ctaBroker: '以经纪人身份提交项目',
    proof: ['非银行贷款机构，覆盖多州', '客户经理与50多位合作经纪人', '支持5种语言'],
  },
  chat: {
    title: '贷款服务台',
    sub: 'AI助手。客户经理将与您跟进。',
    greeting: (l) => `您好，感谢您联系${l}。我是AI贷款助手，不是贷款专员，因此无法批准贷款或报出您的利率。我可以为您介绍各种选择、提供今日市场利率，并将您的项目转给合适的客户经理。请问您在做什么项目？`,
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
    lead: '住宅与商业房地产贷款的常见市场区间。实际条款由您的客户经理在审核项目后确认。',
    cols: ['产品', '适用于', '常见利率', '点数', '期限'],
    rows: {
      fix_flip: { name: '翻新转售', use: '购买、翻新并出售' },
      bridge: { name: '过桥贷款', use: '快速交割，之后再融资或出售' },
      construction: { name: '新建工程', use: '新建与大规模重建' },
      dscr: { name: 'DSCR出租', use: '长期出租，按租金收入审核' },
      bank_statement: { name: '银行流水 / Non-QM', use: '自雇人士，无需报税记录' },
      commercial_perm: { name: '商业长期贷款', use: '多户住宅、办公、零售、工业、综合用途' },
      commercial: { name: '商业过桥', use: '过渡期或增值型商业物业' },
    },
    note: '区间来自2026年公开的市场调查，并非贷款要约。',
  },
  how: {
    title: '流程',
    steps: [
      { t: '介绍您的项目', d: '与贷款服务台文字或语音交流。只询问贷款方需要的信息：房产、金额、退出方式和时间。' },
      { t: '查看是否符合', d: '您会得到明确答复：项目是否符合放贷标准，以及如何调整才能符合。' },
      { t: '客户经理来电', d: '您的项目通常会在几分钟内转给负责您所在州和贷款类型的客户经理。' },
    ],
  },
  brokers: {
    title: '经纪人专区',
    lead: '加入网络，几分钟内提交项目，并可随时通过聊天、短信或电话查询进度。',
    points: ['即时对照放贷标准进行方案评估', '按州、贷款类型和金额分配项目', '您的佣金归您所有'],
    cta: '提交项目',
  },
  footer: {
    disclaimer: 'Lending Desk是非银行贷款机构，并非银行或存款机构。本网站提供有关住宅与商业房地产融资的一般信息，并非贷款要约、承诺或批准。所有贷款均需经过审核、评估及贷款方批准。利率、点数和条款仅由持牌经纪人或贷款方确定。',
    ehoText: '平等住房机会',
    rights: '保留所有权利。',
  },
  units: { mo: '个月', yr: '年', varies: '视情况而定', lang: '语言' },
  embed: {
    title: '将 Lending Desk 放到您的网站上',
    lead: '经纪人、房地产经纪及合作伙伴只需一行代码，即可在任何网站上添加贷款服务台。它获取的每一位客户都会记在您名下。',
    steps: ['复制代码', '将 YOUR-ID 替换为您的合作伙伴ID', '粘贴到 </body> 标签之前'],
    copy: '复制代码',
    copied: '已复制',
    note: '适用于 WordPress、Wix、Squarespace、Shopify、Webflow 及自建网站。中文请添加 data-lang="zh"。',
  },
  segments: { residential: '住宅', commercial: '商业' },
  coverage: { title: '服务地区', lead: '我们的客户经理目前覆盖以下各州。其他州请咨询贷款服务台。' },
};

export const DICT: Record<Lang, Dict> = { en, es, fa, de, zh };
