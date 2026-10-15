(() => {
  'use strict';
  const ar = {
    'Services': 'خدماتنا', 'Reviews (354+)': 'آراء العملاء', 'Case Studies': 'أعمالنا', 'Resources': 'المصادر',
    'Learn More': 'اعرف المزيد', 'Discuss Your Shopify Project': 'احجز مكالمة لمشروعك',
    'Shopify Websites For Growing Brands': 'متاجر شوبيفاي لعلامات تجارية طموحة',
    'Your Traffic Is Working. Your Store Isn’t.': 'الزيارات تصل إلى متجرك. هل تتحوّل إلى مبيعات؟',
    'FIKRA designs and builds Shopify stores around your brand, your products, and the way your customers shop.': 'نصمّم ونطوّر في فكرة متاجر شوبيفاي تناسب هويتك ومنتجاتك وطريقة تسوّق عملائك.',
    'Design · Development · Store Setup': 'تصميم · تطوير · إعداد المتجر',
    'Your Shopify website, built around your brand.': 'متجرك على شوبيفاي، بتصميم يعبّر عن علامتك.',
    'Trusted by brands': 'علامات تجارية', 'what clients say': 'آراء العملاء',
    'Results That Speak Louder Than Promises.': 'نتائج تتحدّث عن نفسها.',
    'IS THIS YOU?': 'هل تواجه هذه التحديات؟', 'Sound Familiar?': 'هل يبدو هذا مألوفًا؟',
    "Most brands don't have a traffic problem; they have a conversion, funnel, or offer problem. We identify the highest-impact lever in your business and fix it fast.": 'قد لا تكون المشكلة في عدد الزيارات، بل في تجربة الشراء أو عرض المنتجات. نراجع رحلة العميل لتحديد التحسينات الأكثر أهمية لمتجرك.',
    'Rising costs. Flat conversions.': 'تكاليف أعلى، ومبيعات لا تتغيّر.',
    "You're spending more on ads and getting the same results.": 'تنفق أكثر على الإعلانات، لكن النتائج لا تتحسّن.',
    'AI gave you ideas. Not results.': 'أفكار كثيرة، وتنفيذ قليل.',
    'Tools can generate recommendations in minutes.': 'الأفكار تحتاج إلى تنفيذ يناسب متجرك.',
    'Agencies gave you reports. Not revenue.': 'تقارير كثيرة، وتحسينات قليلة.',
    'Slow processes, 40-page audits, endless strategy decks.': 'خطوات طويلة وتقارير لا تتحوّل إلى تغييرات واضحة.',
    'The ConversionWise Approach': 'كيف نعمل في فكرة',
    'How We Find & Fix': 'نحدّد التحديات ونعالج', 'What’s Holding You Back.': 'ما يعيق نمو متجرك.',
    'We identify your biggest growth opportunities, prioritize what will move the needle, then build, test and scale what works.': 'نراجع متجرك، ونرتّب الأولويات، ثم نصمّم ونطوّر التحسينات المناسبة لعملك.',
    'Diagnose': 'نفهم متجرك', 'Prioritize': 'نحدّد الأولويات', 'Build & Grow': 'نصمّم ونطوّر',
    'We analyze your store, funnel, and customer behavior to find the single biggest opportunity.': 'نراجع المتجر ورحلة الشراء وسلوك العملاء لتحديد فرص التحسين.',
    'We focus on the one or two changes most likely to move the needle. No fluff.': 'نركّز على التحسينات التي تستحق البدء بها وفق احتياجات متجرك.',
    'We execute. Landing pages, offer changes, and AOV mechanics. Something live in 10 days.': 'ننقل الأفكار إلى صفحات وخصائص عملية، وفق نطاق العمل والجدول المتّفق عليه.',
    'real partners': 'شراكة حقيقية', 'Built Into Your Team.': 'نعمل مع فريقك.', 'Not Bolted On.': 'خطوة بخطوة.',
    'We don’t operate in isolation. We plug directly into your business, working alongside your media buyers, retention teams, creatives, and developers.': 'نتعاون مع فريقك لفهم احتياجات المتجر وتنفيذ العمل بما يناسب أهدافك.',
    'expert drivers': 'أدوات تخدم مشروعك', 'Expert Drivers Behind the World’s Best Tools.': 'نختار الأدوات المناسبة لمتجرك.',
    "We don't use tools and AI blindly; we use the industry's most powerful models as multipliers to provide better results, faster.": 'نستخدم أدوات التصميم والتطوير لدعم العمل، مع مراجعة التفاصيل وتجربة الاستخدام.',
    'WHAT POWERS OUR APPROACH': 'تصميم وتطوير يعملان معًا',
    'We combine 13 Years of Experience': 'نجمع بين التصميم والتطوير', 'With Proprietary AI.': 'لبناء تجربة شراء أفضل.',
    'Our data, our people and our proprietary AI work together to identify and move the numbers that matter most, fast.': 'نركّز على وضوح المحتوى وسهولة التصفّح وجودة التنفيذ في كل صفحة من صفحات متجرك.',
    'OUR SERVICES': 'خدماتنا', 'Shopify Websites Built Around Your Business.': 'متاجر شوبيفاي تناسب احتياجات مشروعك.',
    'From a new store to a better shopping experience, we design and develop the Shopify pages and features your business needs.': 'من إطلاق متجر جديد إلى تحسين تجربة الشراء، نصمّم ونطوّر الصفحات والخصائص التي يحتاجها مشروعك على شوبيفاي.',
    'Shopify Store Setup': 'إنشاء متجر شوبيفاي', 'Shopify Store Redesign': 'إعادة تصميم المتجر',
    'Shopify Theme Development': 'تطوير ثيم شوبيفاي', 'Shopify Store Review': 'مراجعة المتجر',
    'Shopify Product & Landing Pages': 'صفحات المنتجات والهبوط', 'Shopify Store Support': 'دعم وتحديثات المتجر',
    'A complete Shopify store with your products, collections, navigation and essential settings.': 'إعداد متجرك على شوبيفاي، من المنتجات والتصنيفات إلى القوائم والإعدادات الأساسية.',
    'Refresh your existing Shopify website with a design that fits your brand.': 'تجديد تصميم متجرك الحالي ليعبّر عن هوية علامتك ويقدّم تجربة أوضح.',
    'Custom Liquid sections, theme features and storefront functionality.': 'تطوير أقسام Liquid وخصائص مخصّصة لواجهة متجرك.',
    'Review your storefront, navigation and product pages to identify improvements.': 'مراجعة واجهة المتجر والتصفّح وصفحات المنتجات لتحديد التحسينات المطلوبة.',
    'Focused product pages and landing pages for your products and campaigns.': 'صفحات منتجات وهبوط مصمّمة لعرض منتجاتك ودعم حملاتك.',
    'Ongoing updates to your theme, content and shopping experience.': 'تحديثات مستمرة للتصميم والمحتوى وتجربة التسوّق.',
    'CLIENT WORK RESULTS': 'نتائج أعمال العملاء', 'Work That Moves Revenue, Not Just Metrics.': 'أعمال تؤثّر في المبيعات، وليس الأرقام فقط.',
    'Founded in 2013': 'عن فكرة', 'Obsessed with Results.': 'نهتم بتفاصيل متجرك.', 'Since Day One.': 'من أول خطوة.',
    'ABOUT CONVERSIONWISE': 'عن فكرة', 'Common Questions. Straight': 'أسئلة شائعة.', 'Answers.': 'وإجابات واضحة.',
    'Have more questions?': 'لديك أسئلة أخرى؟', 'Chat with us.': 'تواصل معنا.',
    'Ready to Stop Losing': 'هل أنت مستعد لتطوير', 'Revenue Between the Click': 'متجرك على شوبيفاي', 'and the Checkout?': 'وتحسين تجربة عملائك؟',
    "Book a free 30-minute discovery call. We'll identify your single highest-impact growth lever. No pitch deck. No 40-page audit. Just clarity on what to fix first.": 'اختر موعدًا لمكالمة مدتها ٣٠ دقيقة لنتعرّف على مشروعك ونناقش احتياجات متجرك على شوبيفاي.',
    'The Fikra Newsletter': 'نشرة فكرة', 'Email Address': 'البريد الإلكتروني',
    'Weekly ecommerce CRO tips, teardowns, and tactics, delivered every Monday. Free forever.': 'تحديثات ونصائح حول تصميم وتطوير متاجر شوبيفاي.',
    'Blog': 'المدونة', 'Reviews': 'آراء العملاء', 'ROI Calculator': 'حاسبة العائد', 'A/B Test Calculator': 'حاسبة الاختبارات',
    'Newsletter': 'النشرة البريدية', 'Community': 'المجتمع', 'Support': 'الدعم', 'Company': 'الشركة',
    'About': 'عن فكرة', 'Speaking': 'المشاركات', 'Careers': 'الوظائف', 'hiring': 'انضم إلينا', 'Contact': 'تواصل معنا',
    'FAQ': 'الأسئلة الشائعة', 'Discovery Call': 'احجز مكالمة', 'Work with Oliver': 'اعمل مع فريقنا',
    'CRO': 'تحسين المتجر', 'Landing Pages': 'صفحات الهبوط', 'Website Redesigns': 'إعادة التصميم', 'Development': 'التطوير',
    'Strategic Workshops': 'جلسات استشارية', 'Post-Click Audit': 'مراجعة المتجر', 'Legal': 'المعلومات القانونية',
    'Terms & Conditions': 'الشروط والأحكام', 'Privacy Policy': 'سياسة الخصوصية', 'Cookie Policy': 'ملفات الارتباط',
    'Shopify Websites': 'مواقع شوبيفاي', 'Official partner with:': 'شريك رسمي مع:', 'Agency': 'الوكالة', 'Academy': 'الأكاديمية',
    'Landing Page & Funnel Builds': 'صفحات هبوط لمتاجر شوبيفاي', 'Conversion Rate Optimization (CRO)': 'تحسين تجربة المتجر',
    'Full Website Redesigns': 'إعادة تصميم متاجر شوبيفاي', 'Development Services': 'تطوير شوبيفاي',
    'Post-Click Audits': 'مراجعة متاجر شوبيفاي', 'Strategic Workshops & Consultancy': 'استشارات شوبيفاي',
    'High-converting, custom-built landing pages and full-funnel architectures.': 'صفحات هبوط مخصّصة لمنتجاتك وحملاتك.',
    'Continuous, data-led experimentation across your entire customer journey.': 'تحسينات مدروسة على رحلة العميل وتجربة الشراء.',
    'We analyze your GA4 and Clarity data to create conversion-led redesigns': 'إعادة تصميم المتجر وفق احتياجات علامتك وعملائك.',
    'Expert implementation and technical execution, from Shopify liquid work to app.': 'تنفيذ وتطوير أقسام وخصائص شوبيفاي.',
    'A deep-dive diagnostic into your store and user data.': 'مراجعة المتجر وتحديد التحسينات المطلوبة.',
    'High-level strategic partnership to align your performance goals.': 'مناقشة احتياجات متجرك وخطوات تطويره.',
    'ROI & CRO Calculator': 'حاسبة أداء المتجر', 'CRO Guides & Insights': 'أدلة ومقالات', 'Fikra Newsletter': 'نشرة فكرة',
    'Estimate the revenue impact of improving conversion rates and AOV.': 'استكشف أثر تحسين تجربة الشراء على أداء المتجر.',
    'Estimate the revenue impact of a successful A/B test.': 'استكشف نتائج الاختبارات على أداء المتجر.',
    'Actionable strategies, case studies, and optimization best practices.': 'أفكار ومقالات حول تحسين متجرك على شوبيفاي.',
    'Weekly CRO insights, case studies, and growth strategies.': 'تحديثات وأفكار لتطوير متجرك.',
    'Your name': 'الاسم', 'Email address': 'البريد الإلكتروني', 'Tell us about your project': 'أخبرنا عن مشروعك',
    'Let’s build your next idea.': 'لنبدأ العمل على فكرتك.',
    'Tell us about your Shopify store, a new website, or the improvements you have in mind.': 'أخبرنا عن متجرك على شوبيفاي أو التحسينات التي ترغب في تنفيذها.',
    'Message @fikraagency.qa on Instagram': 'راسلنا على إنستغرام ‎@fikraagency.qa', 'Contact FIKRA': 'تواصل مع فكرة',
    'This page is being prepared. Contact FIKRA to discuss your project.': 'هذه الصفحة قيد الإعداد. تواصل مع فكرة لمناقشة مشروعك.',
    'Close dialog': 'إغلاق النافذة', 'Subscribe': 'اشترك', 'SUBMIT': 'اشترك',
    'Newsletter signup is coming soon. Your email has not been submitted.': 'التسجيل في النشرة متاح قريبًا. لم يتم إرسال بريدك الإلكتروني.'
  };
  Object.assign(ar, {
    'OUR CLIENTS': 'عملاؤنا', 'Our Clients': 'عملاؤنا', 'Brands we’ve worked with': 'علامات تجارية عملنا معها',
    'Our Work': 'أعمالنا', 'The Offer': 'الباقة', 'Client Reviews': 'آراء العملاء',
    'Shopify design and development.': 'تصميم وتطوير متاجر شوبيفاي.',
    '© 2026 FIKRA. All rights reserved.': '© ٢٠٢٦ فكرة. جميع الحقوق محفوظة.',
    'Words from our clients': 'كلمات من عملائنا',
    '100+': '١٠٠+', '4': '٤', 'years': 'سنوات',
    'Brands Grown': 'علامة تجارية ساعدناها على النمو', 'In Business': 'من العمل والخبرة',
    'Sample messages for layout preview. Genuine client reviews will replace these before launch.': 'رسائل توضيحية لمعاينة التصميم. سنستبدلها بتقييمات حقيقية من العملاء قبل النشر.',
    'Sample messages paired with client brand names for layout preview only. These are not reviews from the named brands.': 'رسائل توضيحية مع أسماء العلامات التجارية لمعاينة التصميم فقط. هذه ليست تقييمات صادرة عن العلامات المذكورة.',
    'The ConversionWise Approach': 'منهجية كونفرجن وايز',
    'We execute. Landing pages, offer changes, and AOV mechanics. Something live in 10 days.': 'ننفّذ صفحات الهبوط وتحسينات العروض ومتوسط قيمة الطلب، مع إطلاق أول تغيير خلال ١٠ أيام.',
    'We combine 13 Years of Experience': 'نجمع بين ١٣ عامًا من الخبرة', 'With Proprietary AI.': 'وتقنية ذكاء اصطناعي خاصة بنا.',
    'Our data, our people and our proprietary AI work together to identify and move the numbers that matter most, fast.': 'تعمل بياناتنا وفريقنا وتقنياتنا معًا لتحديد المؤشرات الأهم وتحسينها بسرعة.',
    'Founded in 2013': 'تأسست عام ٢٠١٣', 'ABOUT CONVERSIONWISE': 'عن كونفرجن وايز',
    'ConversionWise was founded in 2013 by Oliver Kenyon and Andy Haskins, two practitioners who built their careers inside real ecommerce brands, not in theory.': 'تأسست كونفرجن وايز عام ٢٠١٣ على يد أوليفر كينيون وآندي هاسكينز، اللذين بنيا خبرتهما من العمل المباشر مع علامات تجارية في التجارة الإلكترونية.',
    'Oliver and Andy started with a simple belief: that most agencies were too slow, too process-heavy, and too disconnected from the revenue outcomes their clients actually needed.': 'انطلق أوليفر وآندي من قناعة بأن كثيرًا من الوكالات بطيئة ومعقّدة الإجراءات، ولا تركّز بما يكفي على نتائج المبيعات التي يحتاجها العملاء.',
    "Thirteen years later, that belief drives everything we do. We've worked with over 4,000 brands, built thousands of pages, and never stopped being hands-on with the work.": 'بعد ثلاثة عشر عامًا، ما زالت هذه القناعة تقود عملنا. عملنا مع أكثر من ٤٠٠٠ علامة تجارية، وأنشأنا آلاف الصفحات، وواصلنا المشاركة المباشرة في التنفيذ.',
    "We didn't build ConversionWise to be the biggest agency. We built it to be the most effective one.": 'لم نبنِ كونفرجن وايز لتكون أكبر وكالة، بل لتكون الأكثر فاعلية.',
    'Oliver & Andy': 'أوليفر وآندي', ', the founders': '، المؤسّسان',
    'Do I need a minimum amount of traffic to work with you?': 'هل يشترط حد أدنى من الزيارات للعمل معكم؟',
    "For lower-traffic brands, we build first, creating high-converting pages and improving your funnel without needing large test sample sizes. For higher-traffic brands, we layer in structured A/B testing alongside builds. Traffic volume doesn't exclude you from working with us.": 'للمتاجر ذات الزيارات الأقل، نبدأ ببناء الصفحات وتحسين رحلة الشراء دون الحاجة إلى عيّنات اختبار كبيرة. ومع ارتفاع الزيارات، نضيف اختبارات مقارنة منظّمة إلى أعمال التطوير. حجم الزيارات لا يمنع العمل معنا.',
    'What is Optimo AI and did you build it?': 'ما هو Optimo AI؟ وهل طوّرتموه بأنفسكم؟',
    'Optimo is our proprietary AI technology, we built it ourselves, trained on 13 years of ecommerce conversion data and thousands of real page builds. It is not a third-party tool. It helps us analyse faster, surface patterns quicker, and cut the time between insight and implementation. Our experience still decides the direction.': 'أوبتيمو تقنية ذكاء اصطناعي خاصة طوّرناها بأنفسنا، وتدرّبت على ١٣ عامًا من بيانات التجارة الإلكترونية وآلاف الصفحات. تساعدنا على تسريع التحليل واكتشاف الأنماط وتقليل الوقت بين الفكرة والتنفيذ، بينما تحدّد خبرتنا اتجاه العمل.',
    'How quickly will I see results?': 'متى يمكنني رؤية النتائج؟',
    'Every engagement starts with a Day 10 commitment, something live on your store within the first 10 days. Not a report. Not a strategy deck. Something real.': 'يبدأ كل تعاون بالتزام إطلاق تغيير فعلي في متجرك خلال الأيام العشرة الأولى، وليس الاكتفاء بتقرير أو عرض استراتيجية.',
    'Do you only work with Shopify brands?': 'هل تعملون فقط مع متاجر شوبيفاي؟',
    "Shopify and Shopify Plus is our primary focus. If you're doing £1M–£20M in annual revenue and spending on paid acquisition, we're very likely a fit regardless of platform.": 'نركّز أساسًا على شوبيفاي وشوبيفاي بلس. وإذا كانت مبيعاتك السنوية بين مليون و٢٠ مليون جنيه إسترليني وتستثمر في الإعلانات، فقد نكون مناسبين للعمل معك بغضّ النظر عن المنصّة.',
    'What types of work do you actually deliver?': 'ما الأعمال التي تنفّذونها؟',
    'Landing pages, product page improvements, offer strategy, funnel optimisation, A/B testing, AOV mechanics, checkout improvements, and messaging refinement, across the entire post-click journey.': 'صفحات الهبوط، وتحسين صفحات المنتجات والعروض ورحلة الشراء، واختبارات المقارنة، وتحسين متوسط الطلب والدفع والرسائل التسويقية عبر مراحل ما بعد النقر.',
    'Why do I need an agency when I can use AI tools myself?': 'لماذا أحتاج إلى وكالة إذا كان بإمكاني استخدام أدوات الذكاء الاصطناعي؟',
    "AI tools give you ideas. They don't tell you which idea matters most for your specific store, margin structure, or customer behaviour, and they can't execute. Our value is 13 years of commercial judgement: knowing what to prioritise, what to ignore, and how to build it without breaking what's already working.": 'تقدّم أدوات الذكاء الاصطناعي أفكارًا، لكنها لا تحدّد دائمًا الأنسب لمتجرك وهوامشك وسلوك عملائك، ولا تنفّذ العمل وحدها. تكمن قيمة الخبرة في ترتيب الأولويات واختيار ما يستحق التنفيذ دون تعطيل ما يعمل بالفعل.',
    'Book a Call': 'احجز مكالمة', 'Doha, Qatar': 'الدوحة، قطر', 'Headquarters': 'المقر الرئيسي', '103 Farringdon Rd,': '١٠٣ شارع فارينغدون،', 'London EC1R 3BS, England': 'لندن EC1R 3BS، إنجلترا',
    '© 2026 FIKRA. All rights reserved.': '© ٢٠٢٦ فكرة. جميع الحقوق محفوظة.',
    'The ConversionWise Group:': 'مجموعة كونفرجن وايز:',
    'Booking dates': 'تواريخ الحجز', 'Choose a day': 'اختر يومًا'
  });
  Object.assign(ar, {
    '4.9★ Verified · 354+ five-star reviews · No pitch deck. Just clarity.': 'تقييم موثّق ٤٫٩ ★ · أكثر من ٣٥٤ تقييمًا بخمس نجوم · خطوات واضحة.',
    '4.9': '٤٫٩', 'Verified ·': 'موثّق ·', '354+ five-star reviews': 'أكثر من ٣٥٤ تقييمًا بخمس نجوم'
  });
  Object.assign(ar, window.FIKRA_FUNNEL_AR || {});
  ar['Scroll to explore the stores and shopping experiences.'] = 'مرّر لاستكشاف المتاجر وتجارب التسوّق.';
  const t = value => document.documentElement.lang === 'ar' ? ar[value] || value : value;
  const nodes = [];
  const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walk.nextNode()) {
    const node = walk.currentNode;
    if (node.parentElement.closest('script,style,svg,[data-no-translate]')) continue;
    const key = node.textContent.trim().replace(/\s+/g, ' ');
    if (ar[key]) nodes.push({node, original: node.textContent, key});
  }
  const button = document.createElement('button');
  button.className = 'fikra-language'; button.type = 'button';
  document.querySelector('.navbar-wrapper').append(button);
  function apply(lang) {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    // Discard horizontal offsets retained from the previous writing direction.
    window.scrollTo({left: 0, top: window.scrollY, behavior: 'instant'});
    nodes.forEach(({node, original, key}) => { node.textContent = lang === 'ar' ? ar[key] : original; });
    button.textContent = lang === 'ar' ? 'English' : 'العربية';
    button.lang = lang === 'ar' ? 'en' : 'ar';
    button.setAttribute('aria-label', lang === 'ar' ? 'Switch to English' : 'التبديل إلى العربية');
    document.title = lang === 'ar' ? 'فكرة | تصميم وتطوير متاجر شوبيفاي' : 'FIKRA | Shopify Websites';
    document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll('input[placeholder]').forEach(el => {
      if (!el.dataset.originalPlaceholder) el.dataset.originalPlaceholder = el.placeholder;
      el.placeholder = t(el.dataset.originalPlaceholder);
    });
    document.querySelectorAll('input[type="submit"]').forEach(el => {
      if (!el.dataset.originalValue) el.dataset.originalValue = el.value;
      el.value = t(el.dataset.originalValue);
    });
    try { localStorage.setItem('fikra-language', lang); } catch {}
    window.dispatchEvent(new CustomEvent('fikra:language', {detail: lang}));
  }
  button.addEventListener('click', () => apply(document.documentElement.lang === 'ar' ? 'en' : 'ar'));
  window.FIKRA_I18N = {t, apply};
  let lang = 'en';
  try { if (localStorage.getItem('fikra-language') === 'ar') lang = 'ar'; } catch {}
  apply(lang);
})();
