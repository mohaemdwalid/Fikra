# Shopify funnel proposal

The proposed funnel is added at the top of `index.html`, above the existing hero. All original sections remain below the “Original page continues below” marker.

New sections include a Shopify headline and introduction, a VSL area, consultation CTA, short offer summary, six-logo trust strip, three customer problems, three client-store previews with outbound links, full proposed offer, client feedback cards, three-step process, seven FAQ items and a final booking CTA. Booking buttons use the existing calendar at the bottom of the original page. The booking click handler now prevents the exported Webflow anchor handler from overriding the scroll destination.

English and Arabic copy is in `assets/funnel-copy.js`; styling is in `assets/funnel.css`. The original page styling and text are preserved. Project preview images were captured from the supplied client stores: AskAbays, Keshtban and Qataria Abaya. They show storefront appearance, not measured performance or independently verified project scope.

## Details to approve

- Package price and payment terms.
- Delivery schedule.
- Number of products and pages included.
- Whether Arabic and English are included or an optional extra.
- Revision allowance and post-launch support period.
- Final payment/delivery integrations and separately billed costs.
- Video file or embed URL for the VSL area.
- Correct brand attribution for each existing review.

The offer is explicitly proposed and has no invented price, discount, deadline, guarantee or performance figures. The video area is a placeholder, not a working video player. Original reference claims remain in the original sections for comparison as requested; this additive review version is not ready for publication.

## Suggested VSL outline

1. Introduce the audience: brands launching or redesigning a Shopify store.
2. Describe the problem: a site that no longer fits the brand, awkward mobile shopping or a complicated launch.
3. Show real stores and explain the specific work FIKRA delivered, once approved.
4. Explain the package and its confirmed inclusions, timeline and cost.
5. Explain the consultation: understand the store and agree the next steps.
6. Invite the viewer to choose a time in the booking calendar.

Local Chrome checks: new sections render, original 17-brand grid remains, booking buttons reach the existing calendar, Arabic switching works, FAQs open, and mobile has no horizontal page overflow. No deployment or external booking integration was performed.
