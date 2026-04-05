# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: a11y.spec.ts >> Accessibility — desktop >> / has no WCAG 2.2 AA violations
- Location: e2e/a11y.spec.ts:62:9

# Error details

```
Error: axe found 1 violation(s):
  - [serious] target-size: All touch targets must be 24px large, or leave sufficient space
    https://dequeuniversity.com/rules/axe/4.11/target-size?application=playwright
      .mt-10 > a[href$="careers"]
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - link "Skip to main content" [ref=e2] [cursor=pointer]:
    - /url: "#main-content"
  - banner [ref=e3]:
    - generic [ref=e5]:
      - link "SOWA Offshore Wind Academy" [ref=e6] [cursor=pointer]:
        - /url: /
        - img [ref=e7]
        - generic [ref=e11]:
          - generic [ref=e12]: SOWA
          - generic [ref=e13]: Offshore Wind Academy
      - navigation "Main navigation" [ref=e14]:
        - link "Careers" [ref=e15] [cursor=pointer]:
          - /url: /careers
        - link "Training" [ref=e16] [cursor=pointer]:
          - /url: /training
        - link "Events" [ref=e17] [cursor=pointer]:
          - /url: /events
        - link "Research" [ref=e18] [cursor=pointer]:
          - /url: /research
        - link "News" [ref=e19] [cursor=pointer]:
          - /url: /news
        - link "Diagnostic" [ref=e20] [cursor=pointer]:
          - /url: /diagnostic
      - generic [ref=e21]:
        - link "Search" [ref=e22] [cursor=pointer]:
          - /url: /search
          - img [ref=e23]
        - link "Get Involved" [ref=e26] [cursor=pointer]:
          - /url: /diagnostic
          - button "Get Involved" [ref=e27]
  - main [ref=e28]:
    - generic [ref=e29]:
      - generic:
        - img
        - img
        - img
      - generic [ref=e32]:
        - generic [ref=e33]:
          - img [ref=e34]
          - generic [ref=e38]: Skillnet Offshore Wind Academy
        - heading "Your Career in Offshore Wind Starts Here" [level=1] [ref=e39]
        - paragraph [ref=e40]: Discover pathways, training, and opportunities in Ireland's fastest-growing energy sector.
        - generic [ref=e41]:
          - link "Explore Careers" [ref=e42] [cursor=pointer]:
            - /url: /careers
            - button "Explore Careers" [ref=e43]
          - link "Take Skills Assessment" [ref=e44] [cursor=pointer]:
            - /url: /diagnostic
            - button "Take Skills Assessment" [ref=e45]
    - generic [ref=e48]:
      - link "Explore Careers Discover 12 career pathways across offshore wind energy. Learn more" [ref=e49] [cursor=pointer]:
        - /url: /careers
        - img [ref=e51]
        - heading "Explore Careers" [level=3] [ref=e54]
        - paragraph [ref=e55]: Discover 12 career pathways across offshore wind energy.
        - generic [ref=e56]:
          - text: Learn more
          - img [ref=e57]
      - link "Find Training Browse accredited courses from leading Irish providers. Learn more" [ref=e59] [cursor=pointer]:
        - /url: /training
        - img [ref=e61]
        - heading "Find Training" [level=3] [ref=e64]
        - paragraph [ref=e65]: Browse accredited courses from leading Irish providers.
        - generic [ref=e66]:
          - text: Learn more
          - img [ref=e67]
      - link "Enterprise Support Workforce planning tools and employer resources. Learn more" [ref=e69] [cursor=pointer]:
        - /url: /diagnostic
        - img [ref=e71]
        - heading "Enterprise Support" [level=3] [ref=e75]
        - paragraph [ref=e76]: Workforce planning tools and employer resources.
        - generic [ref=e77]:
          - text: Learn more
          - img [ref=e78]
      - link "Get Involved Join the community shaping Ireland's clean energy future. Learn more" [ref=e80] [cursor=pointer]:
        - /url: /events
        - img [ref=e82]
        - heading "Get Involved" [level=3] [ref=e87]
        - paragraph [ref=e88]: Join the community shaping Ireland's clean energy future.
        - generic [ref=e89]:
          - text: Learn more
          - img [ref=e90]
    - generic [ref=e93]:
      - generic [ref=e94]:
        - generic [ref=e95]:
          - heading "Career Pathways" [level=2] [ref=e96]
          - paragraph [ref=e97]: Explore roles across Ireland's offshore wind energy sector.
        - link "View all careers" [ref=e98] [cursor=pointer]:
          - /url: /careers
          - text: View all careers
          - img [ref=e99]
      - generic [ref=e101]:
        - link "Operations & Maintenance Entry Blade Repair Technician Specialises in the inspection, repair, and maintenance of wind turbine blades. Uses rope access techniques to perform repairs at height, including composite material repairs and leading-edge protection. €32,000 – €48,000 Explore" [ref=e102] [cursor=pointer]:
          - /url: /careers/blade-technician
          - generic [ref=e104]:
            - generic [ref=e105]:
              - generic [ref=e106]: Operations & Maintenance
              - generic [ref=e107]: Entry
            - heading "Blade Repair Technician" [level=3] [ref=e108]
            - paragraph [ref=e109]: Specialises in the inspection, repair, and maintenance of wind turbine blades. Uses rope access techniques to perform repairs at height, including composite material repairs and leading-edge protection.
            - paragraph [ref=e110]: €32,000 – €48,000
            - generic [ref=e111]:
              - text: Explore
              - img [ref=e112]
        - link "Project Management Senior Commercial Manager — Offshore Wind Manages commercial aspects of offshore wind projects including contract negotiations, procurement strategy, cost control, and stakeholder management across the development lifecycle. €70,000 – €100,000 Explore" [ref=e114] [cursor=pointer]:
          - /url: /careers/owe-commercial-manager
          - generic [ref=e116]:
            - generic [ref=e117]:
              - generic [ref=e118]: Project Management
              - generic [ref=e119]: Senior
            - heading "Commercial Manager — Offshore Wind" [level=3] [ref=e120]
            - paragraph [ref=e121]: Manages commercial aspects of offshore wind projects including contract negotiations, procurement strategy, cost control, and stakeholder management across the development lifecycle.
            - paragraph [ref=e122]: €70,000 – €100,000
            - generic [ref=e123]:
              - text: Explore
              - img [ref=e124]
    - generic [ref=e126]:
      - generic:
        - img
        - img
      - generic [ref=e128]:
        - img [ref=e130]
        - heading "See How Careers Connect" [level=2] [ref=e134]
        - paragraph [ref=e135]: Explore an interactive map showing how careers connect across the offshore wind sector — from entry-level roles to senior leadership.
        - link "Discover Your Path" [ref=e136] [cursor=pointer]:
          - /url: /careers
          - button "Discover Your Path" [ref=e137]:
            - text: Discover Your Path
            - img [ref=e138]
    - generic [ref=e141]:
      - generic [ref=e142]:
        - generic [ref=e143]:
          - heading "Start Your Training" [level=2] [ref=e144]
          - paragraph [ref=e145]: Upcoming courses from accredited Irish providers.
        - link "View all courses" [ref=e146] [cursor=pointer]:
          - /url: /training
          - text: View all courses
          - img [ref=e147]
      - generic [ref=e149]:
        - link "Online Free Introduction to Offshore Wind Energy Skillnet Offshore Wind Academy 5 May 2026 2 weeks Free Fully funded by Skillnet Ireland" [ref=e150] [cursor=pointer]:
          - /url: /training/introduction-offshore-wind
          - generic [ref=e151]:
            - generic [ref=e152]:
              - generic [ref=e153]: Online
              - generic [ref=e154]: Free
            - heading "Introduction to Offshore Wind Energy" [level=3] [ref=e155]
            - paragraph [ref=e156]: Skillnet Offshore Wind Academy
            - generic [ref=e157]:
              - generic [ref=e158]:
                - img [ref=e159]
                - generic [ref=e161]: 5 May 2026
              - generic [ref=e162]:
                - img [ref=e163]
                - generic [ref=e166]: 2 weeks
            - generic [ref=e167]:
              - generic [ref=e168]: Free
              - generic [ref=e169]: Fully funded by Skillnet Ireland
        - link "In-Person GWO Basic Safety Training (BST) National Maritime College of Ireland 12 May 2026 5 days Cork, Ireland €1,200" [ref=e170] [cursor=pointer]:
          - /url: /training/gwo-basic-safety
          - generic [ref=e171]:
            - generic [ref=e173]: In-Person
            - heading "GWO Basic Safety Training (BST)" [level=3] [ref=e174]
            - paragraph [ref=e175]: National Maritime College of Ireland
            - generic [ref=e176]:
              - generic [ref=e177]:
                - img [ref=e178]
                - generic [ref=e180]: 12 May 2026
              - generic [ref=e181]:
                - img [ref=e182]
                - generic [ref=e185]: 5 days
              - generic [ref=e186]:
                - img [ref=e187]
                - generic [ref=e190]: Cork, Ireland
            - generic [ref=e192]: €1,200
        - link "In-Person BOSIET — Basic Offshore Safety Induction & Emergency Training National Maritime College of Ireland 19 May 2026 3 days Cork, Ireland €950" [ref=e193] [cursor=pointer]:
          - /url: /training/bosiet-offshore-survival
          - generic [ref=e194]:
            - generic [ref=e196]: In-Person
            - heading "BOSIET — Basic Offshore Safety Induction & Emergency Training" [level=3] [ref=e197]
            - paragraph [ref=e198]: National Maritime College of Ireland
            - generic [ref=e199]:
              - generic [ref=e200]:
                - img [ref=e201]
                - generic [ref=e203]: 19 May 2026
              - generic [ref=e204]:
                - img [ref=e205]
                - generic [ref=e208]: 3 days
              - generic [ref=e209]:
                - img [ref=e210]
                - generic [ref=e213]: Cork, Ireland
            - generic [ref=e215]: €950
    - generic [ref=e217]:
      - generic [ref=e218]:
        - generic [ref=e219]:
          - heading "What's On" [level=2] [ref=e220]
          - paragraph [ref=e221]: Events, webinars, and workshops for the OWE community.
        - link "View all events" [ref=e222] [cursor=pointer]:
          - /url: /events
          - text: View all events
          - img [ref=e223]
      - generic [ref=e225]:
        - 'link "Webinar Virtual Careers in Offshore Wind: Where to Start Thu 14 May 2026, 13:00 An introductory webinar for anyone curious about careers in offshore wind energy. Learn about entry points, training pathways, and what a typical career looks like." [ref=e226] [cursor=pointer]':
          - /url: /events/careers-in-offshore-wind-webinar
          - generic [ref=e227]:
            - generic [ref=e228]:
              - generic [ref=e229]: Webinar
              - generic [ref=e230]:
                - img [ref=e231]
                - text: Virtual
            - 'heading "Careers in Offshore Wind: Where to Start" [level=3] [ref=e233]'
            - paragraph [ref=e234]: Thu 14 May 2026, 13:00
            - paragraph [ref=e235]: An introductory webinar for anyone curious about careers in offshore wind energy. Learn about entry points, training pathways, and what a typical career looks like.
        - 'link "Webinar Virtual GWO Certification: What You Need to Know Thu 28 May 2026, 11:00 A free information session explaining GWO (Global Wind Organisation) safety certifications — what they are, why you need them, and where to get trained in Ireland." [ref=e236] [cursor=pointer]':
          - /url: /events/gwo-awareness-session
          - generic [ref=e237]:
            - generic [ref=e238]:
              - generic [ref=e239]: Webinar
              - generic [ref=e240]:
                - img [ref=e241]
                - text: Virtual
            - 'heading "GWO Certification: What You Need to Know" [level=3] [ref=e243]'
            - paragraph [ref=e244]: Thu 28 May 2026, 11:00
            - paragraph [ref=e245]: A free information session explaining GWO (Global Wind Organisation) safety certifications — what they are, why you need them, and where to get trained in Ireland.
        - link "Conference Physical Skillnet Offshore Wind Academy — National Platform Launch Thu 18 June 2026, 9:00 Convention Centre Dublin Join us for the national launch of Ireland's Offshore Wind Career Pathway Platform. Hear from industry leaders, policy makers, and education providers about Ireland's offshore wind future." [ref=e246] [cursor=pointer]:
          - /url: /events/sowa-national-launch-event
          - generic [ref=e247]:
            - generic [ref=e248]:
              - generic [ref=e249]: Conference
              - generic [ref=e250]:
                - img [ref=e251]
                - text: Physical
            - heading "Skillnet Offshore Wind Academy — National Platform Launch" [level=3] [ref=e254]
            - paragraph [ref=e255]: Thu 18 June 2026, 9:00
            - paragraph [ref=e256]: Convention Centre Dublin
            - paragraph [ref=e257]: Join us for the national launch of Ireland's Offshore Wind Career Pathway Platform. Hear from industry leaders, policy makers, and education providers about Ireland's offshore wind future.
    - generic [ref=e260]:
      - img [ref=e263]
      - generic [ref=e267]:
        - heading "Not sure where to start?" [level=3] [ref=e268]
        - paragraph [ref=e269]: Assess your OWE skills in 5 minutes and get personalised career and training recommendations.
      - link "Start Assessment" [ref=e271] [cursor=pointer]:
        - /url: /diagnostic
        - button "Start Assessment" [ref=e272]:
          - text: Start Assessment
          - img [ref=e273]
    - generic [ref=e277]:
      - generic [ref=e278]:
        - generic [ref=e279]: "0"
        - generic [ref=e280]: Career Pathways
      - generic [ref=e281]:
        - generic [ref=e282]: 0+
        - generic [ref=e283]: Training Courses
      - generic [ref=e284]:
        - generic [ref=e285]: "0"
        - generic [ref=e286]: Upcoming Events
      - generic [ref=e287]:
        - generic [ref=e288]: "0"
        - generic [ref=e289]: Skills Mapped
    - generic [ref=e292]:
      - img [ref=e294]
      - heading "Stay Updated" [level=2] [ref=e297]
      - paragraph [ref=e298]: Get the latest offshore wind career news, training opportunities, and events delivered to your inbox.
      - generic [ref=e299]:
        - generic [ref=e300]:
          - generic [ref=e301]: Email address
          - textbox "Email address" [ref=e302]:
            - /placeholder: your@email.com
          - button "Subscribe" [ref=e303] [cursor=pointer]
        - generic [ref=e304]:
          - generic [ref=e305] [cursor=pointer]:
            - checkbox "Careers" [ref=e307]
            - generic [ref=e309]: Careers
          - generic [ref=e310] [cursor=pointer]:
            - checkbox "Training" [ref=e312]
            - generic [ref=e314]: Training
          - generic [ref=e315] [cursor=pointer]:
            - checkbox "Events" [ref=e317]
            - generic [ref=e319]: Events
          - generic [ref=e320] [cursor=pointer]:
            - checkbox "Research" [ref=e322]
            - generic [ref=e324]: Research
          - generic [ref=e325] [cursor=pointer]:
            - checkbox "Policy" [ref=e327]
            - generic [ref=e329]: Policy
  - contentinfo [ref=e330]:
    - generic [ref=e332]:
      - generic [ref=e333]:
        - generic [ref=e334]:
          - link "SOWA" [ref=e335] [cursor=pointer]:
            - /url: /
            - img [ref=e336]
            - generic [ref=e340]: SOWA
          - paragraph [ref=e341]: Skillnet Offshore Wind Academy — Ireland's national careers platform for offshore wind energy.
        - generic [ref=e342]:
          - heading "Careers" [level=3] [ref=e343]
          - list [ref=e344]:
            - listitem [ref=e345]:
              - link "Explore Careers" [ref=e346] [cursor=pointer]:
                - /url: /careers
            - listitem [ref=e347]:
              - link "Career Pathways" [ref=e348] [cursor=pointer]:
                - /url: /careers#pathways
            - listitem [ref=e349]:
              - link "Skills Map" [ref=e350] [cursor=pointer]:
                - /url: /careers#skills
        - generic [ref=e351]:
          - heading "Training" [level=3] [ref=e352]
          - list [ref=e353]:
            - listitem [ref=e354]:
              - link "Course Directory" [ref=e355] [cursor=pointer]:
                - /url: /training
            - listitem [ref=e356]:
              - link "Providers" [ref=e357] [cursor=pointer]:
                - /url: /training#providers
            - listitem [ref=e358]:
              - link "Certifications" [ref=e359] [cursor=pointer]:
                - /url: /training#certs
        - generic [ref=e360]:
          - heading "Events" [level=3] [ref=e361]
          - list [ref=e362]:
            - listitem [ref=e363]:
              - link "Upcoming Events" [ref=e364] [cursor=pointer]:
                - /url: /events
            - listitem [ref=e365]:
              - link "Webinars" [ref=e366] [cursor=pointer]:
                - /url: /events?type=Webinar
            - listitem [ref=e367]:
              - link "Conferences" [ref=e368] [cursor=pointer]:
                - /url: /events?type=Conference
        - generic [ref=e369]:
          - heading "Resources" [level=3] [ref=e370]
          - list [ref=e371]:
            - listitem [ref=e372]:
              - link "Research" [ref=e373] [cursor=pointer]:
                - /url: /research
            - listitem [ref=e374]:
              - link "News" [ref=e375] [cursor=pointer]:
                - /url: /news
            - listitem [ref=e376]:
              - link "Skills Diagnostic" [ref=e377] [cursor=pointer]:
                - /url: /diagnostic
      - generic [ref=e379]:
        - paragraph [ref=e380]: © 2026 Skillnet Ireland. All rights reserved.
        - generic [ref=e381]:
          - link "Privacy Policy" [ref=e382] [cursor=pointer]:
            - /url: /privacy
          - link "Terms of Use" [ref=e383] [cursor=pointer]:
            - /url: /terms
          - link "Accessibility" [ref=e384] [cursor=pointer]:
            - /url: /accessibility
          - link "Cookie Policy" [ref=e385] [cursor=pointer]:
            - /url: /cookies
  - dialog "Cookie consent" [ref=e386]:
    - generic [ref=e389]:
      - img [ref=e390]
      - generic [ref=e392]:
        - paragraph [ref=e393]: We use cookies to understand how you use SOWA and improve your experience. Analytics cookies help us measure usage; marketing cookies let us reach you on other platforms. You can change your preferences at any time.
        - generic [ref=e394]:
          - button "Accept All" [ref=e395]
          - button "Reject All" [ref=e396]
          - button "Manage Preferences" [ref=e397]:
            - img [ref=e398]
            - text: Manage Preferences
  - button "Open Next.js Dev Tools" [ref=e406] [cursor=pointer]:
    - img [ref=e407]
  - alert [ref=e410]
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | import AxeBuilder from "@axe-core/playwright";
  3  | 
  4  | /**
  5  |  * Platform-wide accessibility sweep.
  6  |  *
  7  |  * The previous a11y coverage only scanned the homepage at desktop width. This
  8  |  * sweep runs axe against every public route in both desktop and mobile form
  9  |  * factors, plus a dedicated scan with the mobile drawer in its open state so
  10 |  * dialog/ARIA regressions are caught.
  11 |  */
  12 | 
  13 | const PUBLIC_ROUTES: string[] = [
  14 |   "/",
  15 |   "/careers",
  16 |   "/training",
  17 |   "/events",
  18 |   "/research",
  19 |   "/diagnostic",
  20 |   "/diagnostic/assessment",
  21 |   "/news",
  22 |   "/search",
  23 | ];
  24 | 
  25 | const AXE_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
  26 | 
  27 | async function expectNoViolations(page: import("@playwright/test").Page) {
  28 |   const results = await new AxeBuilder({ page })
  29 |     .withTags(AXE_TAGS)
  30 |     // The React Flow pathway map is a decorative visualisation with an
  31 |     // accessible card-grid alternative rendered on the same page. Its
  32 |     // internal handles and transformed nodes trip target-size and
  33 |     // contrast rules in ways that don't affect real users, so exclude
  34 |     // the wrapper from axe scans.
  35 |     .exclude('[data-testid="pathway-map"]')
  36 |     .analyze();
  37 |   if (results.violations.length) {
  38 |     const summary = results.violations
  39 |       .map((v) => {
  40 |         const nodeLines = v.nodes.slice(0, 3).map((n) => {
  41 |           const d = (n.any[0]?.data ?? {}) as Record<string, unknown>;
  42 |           const extra =
  43 |             d.contrastRatio !== undefined
  44 |               ? ` ratio=${d.contrastRatio} fg=${d.fgColor} bg=${d.bgColor} size=${d.fontSize} weight=${d.fontWeight}`
  45 |               : "";
  46 |           return `      ${n.target.join(" ")}${extra}`;
  47 |         });
  48 |         return `  - [${v.impact ?? "n/a"}] ${v.id}: ${v.help}\n    ${v.helpUrl}\n${nodeLines.join("\n")}`;
  49 |       })
  50 |       .join("\n");
> 51 |     throw new Error(
     |           ^ Error: axe found 1 violation(s):
  52 |       `axe found ${results.violations.length} violation(s):\n${summary}`
  53 |     );
  54 |   }
  55 |   expect(results.violations).toEqual([]);
  56 | }
  57 | 
  58 | test.describe("Accessibility — desktop", () => {
  59 |   test.use({ viewport: { width: 1440, height: 900 } });
  60 | 
  61 |   for (const route of PUBLIC_ROUTES) {
  62 |     test(`${route} has no WCAG 2.2 AA violations`, async ({ page }) => {
  63 |       await page.goto(route);
  64 |       await page.waitForLoadState("networkidle");
  65 |       await expectNoViolations(page);
  66 |     });
  67 |   }
  68 | });
  69 | 
  70 | test.describe("Accessibility — mobile", () => {
  71 |   // Simulate a mobile form factor without swapping defaultBrowserType
  72 |   // (which Playwright forbids inside a describe block).
  73 |   test.use({
  74 |     viewport: { width: 393, height: 851 },
  75 |     isMobile: true,
  76 |     hasTouch: true,
  77 |   });
  78 | 
  79 |   for (const route of PUBLIC_ROUTES) {
  80 |     test(`${route} has no WCAG 2.2 AA violations`, async ({ page }) => {
  81 |       await page.goto(route);
  82 |       await page.waitForLoadState("networkidle");
  83 |       await expectNoViolations(page);
  84 |     });
  85 |   }
  86 | 
  87 |   test("mobile drawer (open state) has no WCAG 2.2 AA violations", async ({
  88 |     page,
  89 |   }) => {
  90 |     await page.goto("/");
  91 |     await page.getByRole("button", { name: /open menu/i }).click();
  92 |     await expect(
  93 |       page.getByRole("dialog", { name: /navigation menu/i })
  94 |     ).toBeVisible();
  95 |     await expectNoViolations(page);
  96 |   });
  97 | });
  98 | 
```