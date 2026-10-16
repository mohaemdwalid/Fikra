"""Topic-specific diagram compositions for the website and Qatar guide expansion."""
TOPICS = {
'why-business-needs-website':('web','check'),'website-or-instagram':('compare','chat'),'business-website-types':('grid','web'),'business-website-cost-qatar':('form','coin'),'domain-versus-hosting':('network','globe'),'website-project-ownership':('security','key'),'custom-website-or-builder':('compare','code'),'choose-website-cms':('grid','file'),'website-homepage-content':('web','text'),'website-contact-page':('form','mail'),'portfolio-or-online-store':('compare','bag'),'website-inquiry-forms':('form','check'),'website-accessibility':('web','person'),'arabic-business-website':('compare','direction'),'booking-website-or-store':('compare','calendar'),
'what-is-shopify':('web','bag'),'why-choose-shopify':('grid','check'),'shopify-versus-wordpress':('compare','file'),'shopify-versus-woocommerce-cost':('compare','coin'),'shopify-versus-woocommerce-maintenance':('compare','gear'),'shopify-versus-woocommerce-seo':('compare','search'),'shopify-versus-woocommerce-arabic':('compare','globe'),'wordpress-com-or-org':('network','file'),'wordpress-blog-shopify-store':('network','bag'),'wordpress-content-to-shopify':('network','arrow'),'shopify-versus-wix':('compare','web'),'shopify-versus-squarespace':('compare','grid'),'shopify-selling-services':('calendar','check'),'shopify-digital-products':('network','download'),'shopify-versus-marketplace':('compare','network'),
'qatar-online-business-registration':('form','file'),'qatar-business-website-trust':('security','check'),'qatar-website-language-priority':('compare','chat'),'qatar-domain-qa-or-com':('network','search'),'qatar-customer-address-forms':('form','pin'),'qatar-preorder-store':('calendar','box'),'qatar-seasonal-campaigns':('calendar','moon'),'qatar-personalised-gifts':('web','gift'),'qatar-b2b-quote-website':('form','people'),'qatar-click-and-collect':('delivery','pin'),'qatar-restaurant-website':('web','plate'),'qatar-service-booking':('calendar','person'),'qatar-home-business-online':('security','house'),'qatar-website-price-invoice-clarity':('form','check'),'qatar-selling-abroad':('delivery','globe'),
'website-maintenance-or-rebuild':('compare','tool'),'shopify-gift-cards':('web','gift'),'shopify-product-bundles':('grid','box'),'shopify-subscriptions':('calendar','repeat'),'shopify-pos-qatar':('delivery','card'),'shopify-b2b-capabilities':('network','people'),'shopify-customer-accounts':('security','person'),'shopify-order-notifications':('network','mail'),'shopify-inventory-locations':('delivery','network'),'shopify-social-selling':('network','chat'),'shopify-email-marketing':('web','mail'),'website-structured-data':('network','code'),'shopify-account-security':('security','key'),'shopify-redesign-seo-preservation':('web','search'),'website-ai-search-visibility':('network','search')
}
def add_expansion_art(ns):
    rect,path,line,circle,arrow,bars,browser,frame = [ns[k] for k in ['rect','path','line','circle','arrow','bars','browser','frame']]
    INK,PINK,SOFT,PAPER,GREY=[ns[k] for k in ['INK','PINK','SOFT','PAPER','GREY']]
    def icon(kind,x,y):
        shapes={
        'check':path('M-35 0l25 25 50-55',PINK),
        'chat':rect(-55,-40,110,70,SOFT,14)+path('M-20 30l-10 25 40-25',INK)+bars(-32,-15,65,2),
        'web':browser(-65,-45,130,100)+bars(-45,15,85,2),
        'coin':circle(0,0,55,SOFT)+circle(0,0,35,PAPER,PINK)+path('M0-25v50M15-15c-35-15-40 15-10 15s20 30-15 15',PINK,sw=4),
        'globe':circle(0,0,52,SOFT)+line(-52,0,52,0)+path('M0-52c-40 35-40 70 0 104 40-34 40-69 0-104Z',INK,sw=4),
        'key':circle(-20,-10,30,PAPER,PINK)+path('M0 10l45 45M25 35l15-15M35 45l15-15',PINK),
        'code':path('M-25-30l-30 30 30 30M25-30l30 30-30 30M10-40l-20 80',PINK),
        'file':rect(-40,-55,80,110)+bars(-25,-30,50,3),
        'text':bars(-50,-30,100,3),
        'mail':rect(-60,-40,120,80,SOFT)+path('M-55-30L0 10l55-40',INK),
        'bag':path('M-45-15h90l10 75H-55Z',INK,SOFT)+path('M-25-10v-20c0-35 50-35 50 0v20',INK),
        'person':circle(0,-25,25,SOFT)+path('M-50 55c0-65 100-65 100 0',PINK),
        'direction':path('M55-20H-55l20-20M-55-20l20 20M-55 30H55L35 10M55 30L35 50',PINK),
        'calendar':rect(-55,-45,110,100)+line(-55,-15,55,-15,PINK)+path('M-30-55v25M30-55v25',INK)+circle(0,20,15,SOFT,PINK),
        'gear':circle(0,0,35,PAPER,PINK)+circle(0,0,12,SOFT,PINK)+path('M0-60v20M0 40v20M-60 0h20M40 0h20M-45-45l15 15M30 30l15 15M45-45L30-30M-30 30l-15 15',PINK),
        'search':circle(-10,-10,35,'none',PINK)+line(15,15,55,55,PINK,10),
        'grid':''.join(rect(xx,yy,42,42,SOFT,6) for xx in [-50,10] for yy in [-50,10]),
        'arrow':path('M-60 0H60L35-25M60 0L35 25',PINK),
        'download':path('M0-55v80L-25 0M0 25L25 0M-50 30v25H50V30',PINK),
        'network':circle(0,0,20,SOFT,PINK)+''.join(line(0,0,xx,yy,INK,4)+circle(xx,yy,12,PAPER,PINK) for xx,yy in [(-45,-40),(45,-40),(-45,40),(45,40)]),
        'pin':path('M0-55c-65 0-65 75 0 115 65-40 65-115 0-115Z',INK,SOFT)+circle(0,-15,15,PAPER,PINK),
        'box':rect(-50,-45,100,90,SOFT,4)+line(0,-45,0,45)+line(-50,-10,50,-10),
        'moon':path('M20-55c-85 20-85 95 0 110-40-35-40-75 0-110Z',PINK,SOFT),
        'gift':rect(-55,-20,110,75,SOFT,6)+line(0,-20,0,55,PINK)+path('M0-20c-60-70-90 20 0 0 60-70 90 20 0 0',PINK),
        'people':circle(-25,-20,20,SOFT)+circle(25,-20,20,PAPER,PINK)+path('M-65 50c0-60 80-60 80 0M-15 50c0-60 80-60 80 0',INK),
        'plate':circle(0,0,45,PAPER,PINK)+circle(0,0,30,SOFT,GREY)+line(-65,-45,-65,50)+path('M-75-45v30h20v-30M65-45v95',INK,sw=4),
        'house':path('M-60 0L0-55L60 0M-45-10V55H45V-10',INK,SOFT)+rect(-12,15,24,40,PAPER,3),
        'tool':path('M-40-50c-25 35-5 65 25 55l50 50 20-20-50-50c10-30-20-50-45-35l25 25-20 20Z',INK,SOFT),
        'repeat':path('M-45-10c0-55 90-55 90 0l-20-20M45-10l20-20M45 20c0 55-90 55-90 0l20 20M-45 20l-20 20',PINK),
        'card':rect(-60,-40,120,80)+rect(-60,-20,120,20,INK,0)+circle(35,20,10,SOFT,PINK)
        }
        return f'<g transform="translate({x} {y})">{shapes[kind]}</g>'
    for i,(slug,(mode,kind)) in enumerate(TOPICS.items()):
        offset=(i%4)*8
        if mode=='compare':
            scene=rect(235,205,300,285)+rect(655,205,300,285,SOFT)+bars(265,245,230,2)+bars(685,245,230,2)+icon(kind,385,390)+icon(kind,805,390)+path('M565 330h60M565 365h60',PINK)+circle(935-offset,225,8,PINK,'none')
        elif mode=='web':
            scene=browser(235,200,470,290)+rect(265,270,190,165,SOFT)+bars(490,285,170,3)+rect(490,420,155,35,PINK,7,'none')+circle(840,345,95,PAPER,PINK)+icon(kind,840,345)+line(265,465,360+offset,465,GREY,5)
        elif mode=='form':
            scene=rect(255,200,440,300)+''.join(rect(290,245+j*75,370,48,SOFT if j==i%3 else PAPER,9,GREY) for j in range(3))+bars(315,268,190+offset,1)+circle(835,345,90,SOFT,PINK)+icon(kind,835,345)
        elif mode=='security':
            scene=path('M380 200l135 45v100c0 85-65 145-135 170-70-25-135-85-135-170V245Z',INK,SOFT)+icon(kind,380,345)+rect(625,220,300,250)+bars(655,260,230-offset,4)+ns['check'](735,430)
        elif mode=='network':
            scene=rect(225,245,240,190)+icon(kind,345,340)+arrow(495,335,665,335)+''.join(rect(720,195+j*115,235,85,SOFT if j==i%3 else PAPER)+bars(745,225+j*115,180-offset,1) for j in range(3))+path('M680 240v230',GREY,sw=4)
        elif mode=='calendar':
            scene=rect(245,205,450,290)+line(245,270,695,270,PINK)+path('M330 185v45M610 185v45',INK)+''.join(circle(x,y,16,PINK if (x+y+i)%3==0 else GREY,'none') for x in [315,410,505,600] for y in [320,385,450])+circle(845,345,85,SOFT,PINK)+icon(kind,845,345)
        elif mode=='delivery':
            scene=ns['box'](255,270,170)+arrow(470,340,625,340)+circle(805,345,110,SOFT,PINK)+icon(kind,805,345)+line(250,470,430+offset,470,GREY,5)
        else:
            scene=''.join(rect(x,y,175,125,SOFT if (x+y+i)%3==0 else PAPER)+bars(x+25,y+35,120-offset,2) for x in [240,460,680] for y in [215,375])+icon(kind,950,345)
        descriptions={
        'compare':('Two website options compared side by side.','مقارنة بين خيارين لموقع جنبًا إلى جنب.'),
        'web':('Website layout with a topic-specific feature illustration.','تخطيط موقع مع رسم لخاصية مرتبطة بموضوع الدليل.'),
        'form':('Structured website form and its related workflow symbol.','نموذج موقع منظّم ورمز لمسار العمل المرتبط به.'),
        'security':('Business control and verification diagram beside an information panel.','رسم للتحكّم والتحقّق بجانب لوحة معلومات.'),
        'network':('Connected website systems and information routes.','أنظمة موقع مترابطة ومسارات للمعلومات.'),
        'calendar':('Scheduling calendar with a service or order symbol.','تقويم جدولة مع رمز خدمة أو طلب.'),
        'delivery':('Parcel connected to a fulfilment destination or service.','طرد متصل بوجهة أو خدمة تنفيذ.'),
        'grid':('Organised website content and feature cards.','بطاقات منظّمة لمحتوى الموقع وخصائصه.')}
        en,ar=descriptions[mode]
        ns['put'](slug,frame(scene),en,ar)
