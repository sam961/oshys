# Corals & Shells Website — Final Refinements
**Client:** Academy Owner
**Date Received:** March 18, 2026
**Status:** Pending Implementation

---

## Overview

The client has completed a review of the English section of the website and requests a final set of refinements to align the site with the academy's updated identity before project closure. The changes span homepage flow, navigation, content, branding, and minor fixes.

---

## 1. HOMEPAGE FLOW (New Section Order)

The homepage sections should be reordered as follows:

| # | Section | Current Status |
|---|---------|----------------|
| 1 | Hero Slider (Breathe Underwater) | Exists — content update needed |
| 2 | Start Diving (Your Journey Underwater) | NEW — replaces Featured Instructor |
| 3 | Programs | Exists — restructure needed |
| 4 | Blogs (How We Train) | Exists — reposition higher |
| 5 | Trips | Exists as Featured Trips — reposition |
| 6 | Community / Initiatives | Exists at `/initiatives` — add to homepage |
| 7 | Calendar | Exists — move lower |
| 8 | Equipment | Exists — move lower |
| 9 | Closing Line | NEW |

**Impact:** Major homepage restructure. Current order is: Hero → Featured Instructor → Tagline → Services → About → Calendar → Trips → Courses → Equipment → Blog → CTA

---

## 2. HERO SLIDER UPDATES

### Slide 1 (Currently: "Adventure")
- **Headline:** "Have you ever wondered what it feels like to breathe underwater?"
- **Subtext:**
  > "Most people have never experienced their first breath underwater."
  > At CAS, we guide you through that moment safely and confidently.
- **Button 1:** "Start Your Diving Journey with CAS" → links to Open Water program
- **Button 2:** "Learn How We Work" → links to fixed blog page: "How We Train Divers at CAS"

### Slide 2 (Currently: "Discovery")
- **Image:** Corals (update if current image differs)
- **Headline:** "The Ocean Changes the Way You Think"
- **Subtext:** "CAS programs focus on calmness, awareness, and disciplined diving."

### Slide 3 (Currently: "Fun")
- **Image:** Diver preparing equipment (REMOVE the shark image)
- **Headline:** "Diving Is Learned — Not Just Experienced"
- **Subtext:** "Structured training pathways from beginner to advanced divers."

**Note:** Slides are CMS-managed via `/api/banners`. These can be updated via admin panel OR directly in code/database.

**Open Question:** The blog page "How We Train Divers at CAS" — does it already exist, or does the client need to provide the content? This needs a dedicated blog post or static page.

---

## 3. STATISTICS SECTION

- **Request:** Revise statistics to reflect development and training rather than generic numbers.
- **Current stats:** +1000 Certifications, +600 Happy Clients, 95% Satisfaction Rate, +200 Diving Trips
- **Action:** Client wants to update these AFTER the website launches ("Can we do that when we get the website")
- **Status:** DEFERRED — client will provide new stats post-launch. No code change needed now, but ensure stats are easily editable (they are, via About page or settings).

---

## 4. STRUCTURED PATHS SECTION (Tagline/Services Area)

- **Current:** Two buttons — "Our Programs" / "Learn How We Work"
- **Change:** Rename "Learn How We Work" → "Explore the Sea" (because it links to Trips, not a blog)

---

## 5. "WHAT WE OFFER" SECTION (Services Cards)

### Current:
1. Diving Essentials → links to shop
2. Diving Trips
3. Diving Courses

### New:
1. **Start Your Diving Journey** → links to Open Water program
2. **Develop Your Diving** (Blue Watch / advanced training) → links to Development programs
3. **Explore the Sea** (Trips) → links to Trips page

---

## 6. HOMEPAGE CLOSING LINE (NEW)

Add at the bottom of the homepage (before footer):

> **"The sea rewards calmness, discipline, and patience."**
> **"CAS exists to help divers develop those qualities."**

Replaces or supplements the current CTA section.

---

## 7. TRAINING TEAM SECTION

### Current:
- Featured instructor with individual profile, bio, social links

### New:
- **Remove individual listing**
- **Add description with underwater image:**
  > "CAS works with a team of experienced instructors, assistant instructors, and dive professionals who support training programs and trips throughout the year."
- **List categories below:**
  - Instructors
  - Assistant Instructors
  - Divemasters
  - Adaptive Diving Team
- **Owner's image:** Client says "I will provide an image for me — I thought I did" → **ACTION: Follow up with client for the image**

---

## 8. PROGRAM CATEGORIES UPDATE

### Current Categories:
1. Swimming
2. Diving
3. Long-Term
4. Family

### New Categories:
1. **Swim Programs**
2. **Start Diving**
3. **Develop Your Diving**
4. **Leadership**
5. **Family and Youth**
6. **Blue Access**

**Impact:** This requires database seeder updates AND reassignment of existing courses to new categories. The category field in the Course model needs to support these new values.

---

## 9. NAVIGATION ADJUSTMENTS

- **Change:** "Courses" → "Programs" in homepage navigation
- **Current nav:** Home, About, Blog, Initiatives, Contact + Shop dropdown (Shop, Courses, Trips)
- **Action:** Rename "Courses" to "Programs" in navigation

---

## 10. MINOR CORRECTIONS

| # | Item | Current | New |
|---|------|---------|-----|
| 1 | Site name | "Coral & Shells Diving" / "Coral & Shells Diving Center" | **"Corals & Shells Diving — CAS Academy"** |
| 2 | Location | Dammam, Saudi Arabia | **Al Khobar** |
| 3 | Email button | Broken | **Fix it** |
| 4 | Working hours | Current hours displayed | **Verify/update** |
| 5 | Equipment section | Current position (after Calendar) | **Move lower on homepage** |
| 6 | Calendar section | Current position | **Move lower on homepage** (per new flow: position 7) |

---

## 11. CLIENT QUESTIONS (Require Response)

### Q1: Section Descriptions
> "We wanted to add some descriptions to the sections like Swim Programs / Learn to Dive / Develop Your Diving. Is it feasible?"

**Answer:** YES — each program category can have a description field. We can add a short description/subtitle to each category that displays on the programs listing page and homepage.

### Q2: "Learn to Dive" Emphasis Page
> "I have a whole page written (which also includes the visual step for the course with images). Where can we put that? And how to emphasize Start Your Journey Underwater?"

**Options:**
- **Option A:** Create a dedicated landing page `/programs/start-diving` with the full content
- **Option B:** Use the existing course detail page for Open Water and expand it with the step-by-step visual content
- **Option C:** Create a static page via the CMS footer links system (already supports custom pages at `/pages/:slug`)

**Recommendation:** Option A — a dedicated landing page gives the most prominence and flexibility for the visual step-by-step content.

### Q3: Post-Project Discussion
Client wants to discuss:
- Website SEO
- Newsletter implementation
- Next steps and remaining payment
- Schedule a phone call

**Status:** These are out of scope for current implementation. Note for project management discussion.

---

## 12. ITEMS REQUIRING CLIENT INPUT

| # | Item | Status |
|---|------|--------|
| 1 | Owner's photo for Training Team section | Awaiting from client |
| 2 | Blog post content: "How We Train Divers at CAS" | Confirm if client provides or we draft |
| 3 | New statistics (training-focused) | Deferred post-launch |
| 4 | "Learn to Dive" full page content with images | Client has it written — request it |
| 5 | Category descriptions for Swim Programs / Start Diving / etc. | Request from client |
| 6 | Underwater image for Training Team section | Awaiting from client |
| 7 | Updated working hours (if changed) | Confirm with client |

---

## 13. IMPLEMENTATION PRIORITY

### Phase 1 — Structural (High Impact)
1. Homepage section reorder
2. Hero slider content updates
3. Program categories update (database + UI)
4. Navigation rename (Courses → Programs)

### Phase 2 — Content Updates
5. "What We Offer" section restructure
6. Structured Paths button rename
7. Training Team section redesign
8. Homepage closing line
9. Branding updates (name, location)

### Phase 3 — Fixes & Polish
10. Fix email button
11. Move Equipment and Calendar sections
12. Working hours verification
13. Community/Initiatives section on homepage

### Phase 4 — Pending Client Input
14. "Learn to Dive" dedicated landing page
15. Owner photo in team section
16. Statistics revision
17. Program category descriptions

---

## Technical Notes

- **CMS-managed content** (banners, team members, courses) can be updated via admin panel at `/admin`
- **Translation files** at `/public/locales/{en,ar}/common.json` need updates for all text changes
- **Course categories** are stored as enum values in the database — migration needed for new categories
- **Arabic translations** were NOT reviewed by client — will need separate pass after English is finalized

---

*Document prepared: March 18, 2026*
*Project: Corals & Shells Diving Academy Website*
