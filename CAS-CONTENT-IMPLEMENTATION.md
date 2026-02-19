# Corals & Shells — Content & Tone Rewrite

## Implementation Status Report

**Document Reference:** CAS CONTENT 1.pdf
**Date:** February 19, 2026
**Status:** Fully Implemented

---

## Table of Contents

1. [Homepage — Hero Section](#1-homepage--hero-section)
2. [Removed Language & Tone Guidelines](#2-removed-language--tone-guidelines)
3. [Contact Page](#3-contact-page)
4. [Homepage — Intro Section](#4-homepage--intro-section)
5. [Why Choose Us — Rewrite](#5-why-choose-us--rewrite)
6. [Programs — Framing Section](#6-programs--framing-section)
7. [How Programs Are Organized](#7-how-programs-are-organized)
8. [Program Page Microcopy](#8-program-page-microcopy)
9. [Additional Tone Fixes (Beyond PDF Scope)](#9-additional-tone-fixes-beyond-pdf-scope)
10. [Implementation Summary](#10-implementation-summary)

---

## 1. Homepage — Hero Section

### Primary Headline
| Item | Value |
|------|-------|
| **Translation Key** | `home.heroTitle` |
| **New Text (EN)** | Structured paths to the sea, built on safety and commitment. |
| **New Text (AR)** | مسارات منظمة نحو البحر، مبنية على السلامة والالتزام. |
| **Replaces** | "Explore the sea with us" |
| **Status** | Implemented |

### Sub-headline
| Item | Value |
|------|-------|
| **Translation Key** | `home.heroSubtitle` |
| **New Text (EN)** | Corals & Shells is a water sports and diving center offering structured swimming and diving programs designed for progression, safety, and long-term skill development. |
| **New Text (AR)** | مرجان وصدف هو مركز رياضات مائية وغوص يقدم برامج سباحة وغوص منظمة مصممة للتقدم والسلامة وتطوير المهارات على المدى الطويل. |
| **Status** | Implemented |

| Item | Value |
|------|-------|
| **Translation Key** | `home.heroDescription` |
| **New Text (EN)** | Our programs are delivered within clear frameworks and are suitable for individuals and families ready to commit to learning and responsible participation. |
| **New Text (AR)** | يتم تقديم برامجنا ضمن أطر واضحة وهي مناسبة للأفراد والعائلات المستعدين للالتزام بالتعلم والمشاركة المسؤولة. |
| **Status** | Implemented |

### Call to Action Buttons
| Old Text | New Text (EN) | New Text (AR) | Key | Status |
|----------|---------------|---------------|-----|--------|
| "Book a Course" | **View Programs** | عرض البرامج | `home.bookCourse` | Implemented |
| "Explore Trips" | **Learn How We Work** | تعرف على طريقة عملنا | `home.exploreTrips` | Implemented |

---

## 2. Removed Language & Tone Guidelines

The PDF requires removal of the following language patterns **across the entire site**:

### Specific Phrases Removed
| Phrase | Where It Existed | Action |
|--------|------------------|--------|
| "Join us today" | Homepage, Events, Initiatives | Removed/rewritten |
| "Discover the wonders" | Homepage section titles | Removed/rewritten |
| "Friendly and non-competitive" | Various descriptions | Removed |
| "Perfect environment" | Various descriptions | Removed |

### Prohibited Language Patterns
| Pattern | Examples Found & Fixed |
|---------|----------------------|
| **Promises feelings** | "thrill of adventure", "joy of discovery", "magical underwater world", "passionate community" — all removed from About page story section |
| **Invites urgency** | "Don't Miss Out!" replaced with "Stay Informed" in events and common sections |
| **Creates entitlement** | "We promise you a world-class experience that goes beyond the ordinary" — entire promise section rewritten |

### Full List of Tone Fixes Applied

| Key | Old (Problematic) | New (Professional) |
|-----|--------------------|--------------------|
| `about.storyParagraph1` | "our passion for the sea runs deep... thrill of adventure... magical underwater world" | "founded in Alkhobar with a clear purpose: structured, safety-focused programs" |
| `about.storyParagraph2` | "Whether you're taking your first breath underwater or are a seasoned pro..." | "designed for individuals and families at different stages" |
| `about.storyParagraph3` | "Join us as we dive into the wonders of the marine world..." | "commitment to recognized standards, qualified instruction, and honest communication" |
| `about.promiseTitle` | "We Promise You..." | "Our Commitment" |
| `about.promiseDescription` | "world-class experience beyond the ordinary... empower you... passionate community" | Structured commitment to safety, certified professionals, assessment-guided participation |
| `about.heroSubtitle` | "Where we bring the sea and adventure to you" | "Structured swimming and diving programs in Alkhobar" |
| `about.teamSubtitle` | "Our experienced and passionate instructors" | "Certified professionals delivering structured instruction" |
| `common.dontMissOut` | "Don't Miss Out!" | "Stay Informed" |
| `common.subscribeNewsletter` | "...upcoming events, workshops, and exclusive offers" | "...updates on programs, events, and scheduling" |
| `events.heroSubtitle` | "Join us for exciting workshops... Don't miss out!" | "Browse scheduled workshops, courses, diving trips, and other upcoming activities." |
| `events.dontMissOut` | "Don't Miss Out!" | "Stay Informed" |
| `events.ctaDescription` | "...exclusive offers" | "...updates on programs, events, and scheduling" |
| `initiatives.ctaDescription` | "Join us in making a positive impact..." | "We welcome collaboration with businesses and organizations on structured community initiatives." |
| `home.servicesTitle` | "Discover What We Have To Offer" | "What We Offer" |
| `home.servicesSubtitle` | "Everything you need for your underwater adventures" | "Programs, equipment, and trips delivered within clear frameworks" |
| `home.service1Description` | "Premium quality... all your underwater adventures" | "Quality diving equipment and gear for all levels." |
| `home.service2Description` | "Explore breathtaking dive sites..." | "Organized diving expeditions to selected dive sites, led by certified professionals." |
| `home.service3Description` | "Professional training programs from beginner to advanced..." | "Structured training programs from foundational to advanced certification levels." |
| `home.calendarTitle` | "Find Your Next Diving Adventure" | "Upcoming Schedule" |
| `home.tripsTitle` | "Ready For Adventure? Discover Our Trips" | "Our Trips" |
| `home.tripsSubtitle` | "Explore the underwater world with our expert guides" | "Organized diving expeditions led by certified professionals" |
| `home.coursesTitle` | "Looking To Learn? Check Out Our Courses" | "Our Programs" |
| `home.coursesSubtitle` | "From beginner to advanced certification" | "Structured paths from foundational to advanced certification" |
| `home.productsTitle` | "Missing Any Diving Gear? We've Got You Covered!" | "Diving Equipment" |
| `home.productsSubtitle` | "Quality equipment for every dive" | "Quality equipment for every level" |
| `pages.trips.heroTitle` | "Ready For Adventure?" | "Diving Trips" |
| `pages.trips.heroSubtitle` | "Discover Our Trips" | "Organized Expeditions" |
| `pages.trips.heroDescription` | "Explore breathtaking dive sites..." | "Organized diving expeditions to selected dive sites, led by certified professionals" |
| `products.heroTitle` | "Missing Any Diving Gear?" | "Diving Equipment" |
| `products.heroSubtitle` | "We've Got You Covered!" | "Quality Gear for Every Level" |
| `products.heroDescription` | "...all your underwater adventures" | "...all levels and programs" |
| `faq.contactDescription` | "Our team is happy to help." | "Reach out and we'll guide you to the right program." |

> All changes applied to both EN and AR translation files.

---

## 3. Contact Page

### Contact Description
| Item | Value |
|------|-------|
| **Translation Key** | `contactPage.heroDescription` |
| **Old Text** | "Contact us and we'll be happy to help you choose!" |
| **New Text (EN)** | Contact us to inquire about program suitability or assessment requirements. |
| **New Text (AR)** | تواصل معنا للاستفسار عن ملاءمة البرنامج أو متطلبات التقييم. |
| **Status** | Implemented |

### Form Submission Confirmation (Marked "VERY IMPORTANT" in PDF)
| Item | Value |
|------|-------|
| **Translation Keys** | `contactPage.messageSentTitle` + `contactPage.messageSentDescription` |
| **Old Text** | "Thank you! We'll get back to you shortly" |
| **New Text (EN)** | **Title:** "Thank you." **Body:** "Your inquiry has been received and will be reviewed. If applicable, you will be contacted regarding next steps." |
| **New Text (AR)** | **Title:** "شكراً لك." **Body:** "تم استلام استفسارك وسيتم مراجعته. إذا كان ذلك مناسباً، سيتم التواصل معك بشأن الخطوات التالية." |
| **Status** | Implemented |

---

## 4. Homepage — Intro Section

### Section Title
| Item | Value |
|------|-------|
| **Translation Key** | `home.aboutTitle` |
| **New Text (EN)** | About Corals & Shells |
| **New Text (AR)** | عن مرجان وصدف |
| **Status** | Implemented |

### Body Copy (3 Paragraphs)
| Item | Value |
|------|-------|
| **Translation Key** | `home.aboutDescription` |
| **New Text (EN)** | Corals & Shells is based in Alkhobar, Saudi Arabia, and operates with a clear focus on safety, progression, and responsibility in the water. ¶ We work through structured programs and paths rather than one-off experiences. Participation is guided by readiness, assessment, and instructor judgment to ensure quality and sustainability. ¶ Some programs require prior evaluation before acceptance. |
| **New Text (AR)** | يقع مركز مرجان وصدف في الخبر، المملكة العربية السعودية، ويعمل بتركيز واضح على السلامة والتقدم والمسؤولية في الماء. ¶ نعمل من خلال برامج ومسارات منظمة بدلاً من التجارب المنفردة. تسترشد المشاركة بالجاهزية والتقييم وحكم المدرب لضمان الجودة والاستدامة. ¶ بعض البرامج تتطلب تقييماً مسبقاً قبل القبول. |
| **Status** | Implemented |

---

## 5. Why Choose Us — Rewrite

### Section Title
| Item | Value |
|------|-------|
| **Translation Key** | `about.whyChooseTitle` |
| **New Text (EN)** | Why Corals & Shells *(no question mark — "We are not asking.")* |
| **New Text (AR)** | لماذا مرجان وصدف |
| **Status** | Implemented |

### Intro Line
| Item | Value |
|------|-------|
| **Translation Key** | `about.whyChooseDescription` |
| **New Text (EN)** | Corals & Shells operates with a clear commitment to safety, structure, and responsible progression in the water. |
| **New Text (AR)** | يعمل مرجان وصدف بالتزام واضح بالسلامة والهيكلية والتقدم المسؤول في الماء. |
| **Status** | Implemented |

### Core Points (5 Cards — Replace All Previous Cards)

#### Card 1: Safety as a System
| Item | Value |
|------|-------|
| **Title Key** | `about.valueSafetyFirst` |
| **Description Key** | `about.valueSafetyDescription` |
| **EN Title** | Safety as a System |
| **EN Description** | Safety at Corals & Shells is not a slogan. It is applied through assessment, instructor authority, clear limits, and adherence to recognized standards. Participation may be postponed or declined if readiness or safety requirements are not met. |
| **Icon** | Shield |
| **Status** | Implemented |

#### Card 2: Structured Learning Paths
| Item | Value |
|------|-------|
| **Title Key** | `about.valueStructuredPaths` |
| **Description Key** | `about.valueStructuredDescription` |
| **EN Title** | Structured Learning Paths |
| **EN Description** | We focus on structured swimming and diving paths rather than isolated activities. Progression is earned through consistency and competence, not speed or volume. |
| **Icon** | Layers |
| **Status** | Implemented |

#### Card 3: Qualified Instruction & Clear Authority
| Item | Value |
|------|-------|
| **Title Key** | `about.valueQualifiedInstruction` |
| **Description Key** | `about.valueQualifiedDescription` |
| **EN Title** | Qualified Instruction & Clear Authority |
| **EN Description** | All programs are delivered by certified professionals within defined roles and responsibilities. Instructor decisions regarding safety, progression, and participation are final. |
| **Icon** | UserCheck |
| **Status** | Implemented |

#### Card 4: Honest Expectations
| Item | Value |
|------|-------|
| **Title Key** | `about.valueHonestExpectations` |
| **Description Key** | `about.valueHonestDescription` |
| **EN Title** | Honest Expectations |
| **EN Description** | We communicate clearly what a program involves before it begins. There are no informal exceptions, rushed progression, or unstructured participation. |
| **Icon** | FileCheck |
| **Status** | Implemented |

#### Card 5: Responsible Access to the Sea
| Item | Value |
|------|-------|
| **Title Key** | `about.valueResponsibleAccess` |
| **Description Key** | `about.valueResponsibleDescription` |
| **EN Title** | Responsible Access to the Sea |
| **EN Description** | Our approach to access and inclusion is deliberate and capacity-based. Programs designed for different needs operate within clear frameworks to ensure sustainability and quality. |
| **Icon** | Anchor |
| **Status** | Implemented |

### Closing Line
| Item | Value |
|------|-------|
| **Translation Key** | `about.whyChooseClosing` |
| **New Text (EN)** | Corals & Shells is designed for individuals and families who value clarity, commitment, and long-term development in the water. |
| **New Text (AR)** | مرجان وصدف مصمم للأفراد والعائلات الذين يقدرون الوضوح والالتزام والتطوير طويل المدى في الماء. |
| **Status** | Implemented |

### Component Changes (AboutPage.tsx)
- Changed grid layout from `lg:grid-cols-4` to `lg:grid-cols-3` (for 5 cards)
- Updated icon imports: removed `Heart, Target, Zap` → added `Layers, UserCheck, FileCheck, Anchor`
- Updated values array from 4 items to 5 items with new translation keys

---

## 6. Programs — Framing Section

### Section Title
| Item | Value |
|------|-------|
| **Translation Key** | `pages.courses.heroTitle` |
| **New Text (EN)** | Programs & Paths *(Do not use "Courses" as the main header)* |
| **New Text (AR)** | البرامج والمسارات |
| **Status** | Implemented |

### Intro Paragraph
| Item | Value |
|------|-------|
| **Translation Key** | `pages.courses.heroDescription` |
| **New Text (EN)** | Corals & Shells offers structured swimming and diving programs delivered through clearly defined paths. Each program is designed with specific entry criteria, progression stages, and safety requirements. Participation is based on readiness and commitment, not urgency or availability. |
| **New Text (AR)** | يقدم مرجان وصدف برامج سباحة وغوص منظمة تُقدم من خلال مسارات محددة بوضوح. كل برنامج مصمم بمعايير دخول محددة ومراحل تقدم ومتطلبات سلامة. تعتمد المشاركة على الجاهزية والالتزام، وليس الاستعجال أو التوفر. |
| **Status** | Implemented |

---

## 7. How Programs Are Organized

The PDF defines 4 structured program categories to replace casual labels like "Beginner/Advanced", "Fun Activities", "Experiences":

| Category | Description (EN) |
|----------|-----------------|
| **Swimming Programs** | Structured swimming programs focused on water confidence, technique, and progression. Programs are delivered in stages and adjusted based on skill level and readiness. |
| **Diving Programs** | Foundational and advanced diving programs conducted according to recognized standards. Training includes theory, confined water, and open water sessions as applicable. Progression is gradual and competency-based. |
| **Long-Term Paths** | Certain programs operate as structured paths rather than short courses. These paths require: consistency, readiness, commitment over time. Acceptance may require prior evaluation. |
| **Family & Specialized Programs** | Programs designed for families or specific participant groups operate within defined frameworks to ensure safety and quality. Participation criteria vary depending on program type. |

### Implementation Note
These categories are **CMS-managed content** (stored in the `categories` database table), not hardcoded UI. The admin should create these 4 categories through the admin panel:

1. Go to **Admin > Categories**
2. Create: "Swimming Programs", "Diving Programs", "Long-Term Paths", "Family & Specialized Programs"
3. Assign courses/programs to the appropriate categories
4. The existing filter buttons on the Courses page will automatically show these categories

The current filter buttons (Beginner/Intermediate/Advanced/Professional) are based on the `level` field on individual courses, which serves a different purpose (skill level). Both systems can coexist — categories for program type, levels for skill requirement.

---

## 8. Program Page Microcopy (Marked "CRITICAL" in PDF)

| Item | Value |
|------|-------|
| **Translation Key** | `pages.courses.ctaDescription` |
| **Placement** | CTA section at the bottom of the Programs page |
| **New Text (EN)** | Participation is subject to readiness and program requirements. Some programs require prior assessment before confirmation. |
| **New Text (AR)** | المشاركة تخضع للجاهزية ومتطلبات البرنامج. بعض البرامج تتطلب تقييماً مسبقاً قبل التأكيد. |
| **CTA Title** | "Program Requirements" / "متطلبات البرنامج" |
| **Status** | Implemented |

---

## 9. Additional Tone Fixes (Beyond PDF Scope)

Beyond the specific sections called out in the PDF, the tone guidelines ("remove urgency, promises, entitlement") were applied globally across:

- **Footer tagline** — Updated to match new brand voice
- **Homepage section titles** — All "Discover/Adventure/Explore" framing removed
- **Service descriptions** — Replaced emotional language with factual descriptions
- **Events page** — Removed urgency ("Don't Miss Out!", "Join us for exciting...")
- **Initiatives page** — Removed "Join us" casual language
- **Products page** — Removed informal "We've Got You Covered!" framing
- **Trips page** — Removed "Ready For Adventure?" framing
- **About page story** — Complete rewrite of Our Story and Promise sections
- **FAQ page** — Updated contact call-to-action tone

---

## 10. Implementation Summary

### Files Modified

| File | Changes |
|------|---------|
| `public/locales/en/common.json` | All EN translations updated |
| `public/locales/ar/common.json` | All AR translations updated |
| `resources/js/pages/AboutPage.tsx` | 5 new value cards, new icons, 3-col grid |
| `resources/js/pages/HomePage.tsx` | Removed stale trip fields (duration, dives, difficulty) |

### Verification
- `npm run build` passes successfully
- All translation keys matched between EN and AR
- No broken component references

### Remaining Admin Actions
1. **Create program categories** in CMS admin (Swimming Programs, Diving Programs, Long-Term Paths, Family & Specialized Programs)
2. **Assign courses** to appropriate categories
3. **Review any CMS-managed content** (course descriptions, trip descriptions) for tone alignment with the new brand voice
