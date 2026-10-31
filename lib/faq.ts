import type { Lang } from './i18n.ts';

// Answer-first FAQ: the first sentence of every answer stands on its own, so search and AI assistants can quote it.
export type QA = { q: string; a: string };

export const FAQ_TITLE: Record<Lang, string> = {
  en: 'Questions investors ask',
  es: 'Preguntas frecuentes de inversionistas',
  fa: 'پرسش‌های رایج سرمایه‌گذاران',
  de: 'Häufige Fragen von Investoren',
  zh: '投资者常见问题',
};

export const FAQ: Record<Lang, QA[]> = {
  en: [
    { q: 'What is a hard money loan?', a: 'A hard money loan is a short-term real estate loan from a private lender that is approved mainly on the property’s value and the deal, not on tax returns. Investors use it to buy, renovate or bridge a property quickly, usually for 6 to 24 months, then sell or refinance.' },
    { q: 'What are typical hard money and fix-and-flip rates in 2026?', a: 'Typical 2026 private-lending rates run about 9–12% for experienced fix-and-flip borrowers and 8–12% for bridge loans, plus 1–3 points. Ground-up construction usually prices higher, around 12–15%. These are market ranges, not offers; a licensed broker sets actual terms after reviewing the deal.' },
    { q: 'How fast can a private bridge loan close?', a: 'Many private bridge and hard money loans close in 7 to 14 days when the property, title and borrower documents are ready. Deals with a lender that fell through or a contract deadline can often be prioritized; the broker confirms timing after review.' },
    { q: 'What is a DSCR loan?', a: 'A DSCR loan is a rental property loan that qualifies on the property’s rent rather than the borrower’s personal income. Lenders compare monthly rent to the monthly payment, taxes and insurance; a ratio of about 1.0 to 1.25 or higher usually unlocks better pricing.' },
    { q: 'How much can I borrow on a fix-and-flip?', a: 'Private lenders commonly lend up to about 70–75% of the after-repair value (ARV) on a fix-and-flip, often covering part of the purchase and the rehab budget. The exact amount depends on the property, your experience and the lender’s limits.' },
    { q: 'Can I talk to the lending desk in my language?', a: 'Yes. The lending desk answers in English, Spanish, Persian (Farsi), German and Chinese, by chat or by voice. It switches if you change language mid-conversation, and the licensed broker receives your file in English with your preferred language noted.' },
  ],
  es: [
    { q: '¿Qué es un préstamo hard money?', a: 'Un préstamo hard money es un préstamo inmobiliario a corto plazo de un prestamista privado que se aprueba principalmente por el valor de la propiedad y el negocio, no por declaraciones de impuestos. Los inversionistas lo usan para comprar, renovar o hacer un puente rápido, por lo general de 6 a 24 meses, y luego vender o refinanciar.' },
    { q: '¿Cuáles son las tasas típicas hard money y fix-and-flip en 2026?', a: 'Las tasas privadas típicas en 2026 rondan el 9–12% para inversionistas con experiencia en fix-and-flip y el 8–12% en préstamos puente, más 1–3 puntos. La construcción nueva suele costar más, alrededor del 12–15%. Son rangos de mercado, no ofertas; un bróker con licencia fija los términos reales.' },
    { q: '¿Qué tan rápido puede cerrar un préstamo puente privado?', a: 'Muchos préstamos puente y hard money privados cierran en 7 a 14 días si la propiedad, el título y los documentos están listos. Si otro prestamista se retiró o hay una fecha límite de contrato, a menudo se puede priorizar; el bróker confirma los plazos.' },
    { q: '¿Qué es un préstamo DSCR?', a: 'Un préstamo DSCR es un préstamo para propiedades de alquiler que califica con la renta de la propiedad y no con sus ingresos personales. Se compara la renta mensual con el pago, los impuestos y el seguro; una relación de 1.0 a 1.25 o más suele dar mejores condiciones.' },
    { q: '¿Cuánto puedo pedir prestado para un fix-and-flip?', a: 'Los prestamistas privados suelen prestar hasta un 70–75% del valor después de la reparación (ARV), a menudo cubriendo parte de la compra y la renovación. El monto exacto depende de la propiedad, su experiencia y los límites del prestamista.' },
    { q: '¿Puedo hablar con la mesa de préstamos en mi idioma?', a: 'Sí. La mesa de préstamos responde en inglés, español, persa, alemán y chino, por chat o por voz. Cambia de idioma si usted cambia, y el bróker recibe su expediente en inglés con su idioma preferido anotado.' },
  ],
  fa: [
    { q: 'وام هارد مانی چیست؟', a: 'وام هارد مانی یک وام کوتاه‌مدت املاک از وام‌دهنده خصوصی است که بیشتر بر پایه ارزش ملک و خود معامله تأیید می‌شود، نه اظهارنامه مالیاتی. سرمایه‌گذاران از آن برای خرید، بازسازی یا تأمین سریع، معمولاً برای ۶ تا ۲۴ ماه، و سپس فروش یا بازتأمین استفاده می‌کنند.' },
    { q: 'نرخ‌های رایج هارد مانی و خرید و بازسازی در ۲۰۲۶ چقدر است؟', a: 'نرخ‌های رایج وام خصوصی در ۲۰۲۶ برای سرمایه‌گذاران باتجربه خرید و بازسازی حدود ۹ تا ۱۲ درصد و برای وام پل ۸ تا ۱۲ درصد، به‌علاوه ۱ تا ۳ امتیاز است. ساخت از پایه معمولاً گران‌تر است، حدود ۱۲ تا ۱۵ درصد. این‌ها بازه بازار هستند، نه پیشنهاد؛ شرایط واقعی را کارگزار دارای مجوز تعیین می‌کند.' },
    { q: 'وام پل خصوصی چقدر سریع بسته می‌شود؟', a: 'بسیاری از وام‌های پل و هارد مانی خصوصی در ۷ تا ۱۴ روز بسته می‌شوند، اگر ملک، سند و مدارک آماده باشد. اگر وام‌دهنده قبلی کنار کشیده یا مهلت قرارداد نزدیک است، اغلب می‌توان اولویت داد؛ کارگزار زمان‌بندی را تأیید می‌کند.' },
    { q: 'وام DSCR چیست؟', a: 'وام DSCR وامی برای ملک اجاره‌ای است که بر پایه درآمد اجاره ملک تأیید می‌شود، نه درآمد شخصی شما. اجاره ماهانه با قسط، مالیات و بیمه مقایسه می‌شود؛ نسبت ۱٫۰ تا ۱٫۲۵ یا بیشتر معمولاً شرایط بهتری می‌دهد.' },
    { q: 'برای خرید و بازسازی چقدر می‌توانم وام بگیرم؟', a: 'وام‌دهندگان خصوصی معمولاً تا حدود ۷۰ تا ۷۵ درصد ارزش پس از بازسازی (ARV) وام می‌دهند و اغلب بخشی از خرید و هزینه بازسازی را پوشش می‌دهند. مبلغ دقیق به ملک، تجربه شما و سقف وام‌دهنده بستگی دارد.' },
    { q: 'آیا می‌توانم به زبان خودم با میز وام صحبت کنم؟', a: 'بله. میز وام به انگلیسی، اسپانیایی، فارسی، آلمانی و چینی، با چت یا صدا پاسخ می‌دهد. اگر زبان را عوض کنید همراه شما عوض می‌کند و کارگزار پرونده شما را به انگلیسی با ذکر زبان دلخواهتان دریافت می‌کند.' },
  ],
  de: [
    { q: 'Was ist ein Hard-Money-Kredit?', a: 'Ein Hard-Money-Kredit ist ein kurzfristiger Immobilienkredit eines privaten Kreditgebers, der vor allem nach Objektwert und Projekt vergeben wird, nicht nach Steuererklärungen. Investoren nutzen ihn, um schnell zu kaufen, zu sanieren oder zu überbrücken, meist für 6 bis 24 Monate, und danach zu verkaufen oder zu refinanzieren.' },
    { q: 'Wie hoch sind typische Hard-Money- und Fix-and-Flip-Zinsen 2026?', a: 'Typische private Kreditzinsen liegen 2026 bei etwa 9–12 % für erfahrene Fix-and-Flip-Investoren und 8–12 % für Überbrückungskredite, zuzüglich 1–3 Punkten. Neubauten kosten meist mehr, etwa 12–15 %. Das sind Marktspannen, keine Angebote; die Konditionen legt ein lizenzierter Makler fest.' },
    { q: 'Wie schnell kann ein privater Überbrückungskredit abgeschlossen werden?', a: 'Viele private Überbrückungs- und Hard-Money-Kredite werden in 7 bis 14 Tagen abgeschlossen, wenn Objekt, Grundbuch und Unterlagen bereit sind. Ist ein anderer Kreditgeber abgesprungen oder läuft eine Vertragsfrist ab, lässt sich oft priorisieren; der Makler bestätigt den Zeitplan.' },
    { q: 'Was ist ein DSCR-Kredit?', a: 'Ein DSCR-Kredit ist ein Kredit für vermietete Immobilien, der über die Mieteinnahmen statt über Ihr persönliches Einkommen geprüft wird. Die Monatsmiete wird mit Rate, Steuern und Versicherung verglichen; ein Verhältnis von etwa 1,0 bis 1,25 oder höher bringt meist bessere Konditionen.' },
    { q: 'Wie viel kann ich für ein Fix-and-Flip leihen?', a: 'Private Kreditgeber finanzieren meist bis etwa 70–75 % des Werts nach Sanierung (ARV) und decken oft einen Teil des Kaufpreises und der Sanierung. Der genaue Betrag hängt vom Objekt, Ihrer Erfahrung und den Grenzen des Kreditgebers ab.' },
    { q: 'Kann ich in meiner Sprache mit dem Kreditdesk sprechen?', a: 'Ja. Der Kreditdesk antwortet auf Englisch, Spanisch, Persisch, Deutsch und Chinesisch, per Chat oder Sprache. Er wechselt die Sprache, wenn Sie wechseln, und der Makler erhält Ihre Akte auf Englisch mit Ihrer bevorzugten Sprache vermerkt.' },
  ],
  zh: [
    { q: '什么是硬钱贷款？', a: '硬钱贷款是由私人贷款方提供的短期房地产贷款，主要依据房产价值和项目本身审批，而不是报税记录。投资者用它快速购买、翻新或过桥，期限通常为6至24个月，之后出售或再融资。' },
    { q: '2026年硬钱和翻新转售贷款的常见利率是多少？', a: '2026年私人贷款的常见利率：有经验的翻新转售投资者约为9–12%，过桥贷款约为8–12%，另加1–3个点。新建工程通常更高，约为12–15%。这些是市场区间而非报价，实际条款由持牌经纪人审核后确定。' },
    { q: '私人过桥贷款多快可以交割？', a: '如果房产、产权和资料齐备，许多私人过桥和硬钱贷款可在7至14天内交割。若原贷款方退出或合同即将到期，通常可以优先处理；具体时间由经纪人确认。' },
    { q: '什么是DSCR贷款？', a: 'DSCR贷款是一种出租房贷款，依据房产租金收入而非个人收入审核。贷款方将月租金与月供、房产税和保险进行比较，比率约1.0至1.25或更高通常可获得更好的条件。' },
    { q: '翻新转售项目可以贷多少？', a: '私人贷款方通常最多可贷到翻新后价值（ARV）的约70–75%，常可覆盖部分购房款和翻新预算。具体金额取决于房产、您的经验以及贷款方的上限。' },
    { q: '可以用我的语言与贷款服务台沟通吗？', a: '可以。贷款服务台支持英语、西班牙语、波斯语、德语和中文，可文字或语音交流。您切换语言时它也会随之切换，经纪人收到的资料为英文并注明您的首选语言。' },
  ],
};
