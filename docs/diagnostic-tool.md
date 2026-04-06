# Diagnostic Tool — Reporting & Interpretation

This guide explains how the self-assessment diagnostic tool works from an admin perspective. It covers question types, scoring mechanisms, skill gap calculations, career and course recommendations, AI summaries, HubSpot sync, and how to interpret and use diagnostic results for reporting and insights.

---

## Overview

The SOWA diagnostic tool is a self-assessment questionnaire that helps users identify skill gaps, explore career paths, and discover relevant courses. Users answer questions about their current skills and experience, and the platform generates personalized recommendations based on their responses.

### User Flow

1. User visits the platform and clicks "Take the Assessment" or "Diagnostic"
2. User answers a series of questions (typically 20–40 questions)
3. Platform scores the answers in real-time
4. Results page shows:
   - Skill gap analysis
   - Recommended career roles
   - Recommended training courses
   - Optional AI-generated summary
5. User can consent to HubSpot sync (CRM lead capture)
6. Results are saved and can be viewed later

### Admin View

Admins can monitor diagnostic completions and results in the admin panel. See "Analytics and Reporting" section below.

---

## Question Types

The diagnostic includes different question formats to assess different competencies:

### 1. Single Choice (Radio Button)

One correct or best answer. Example:

**"What voltage do offshore turbines typically operate at?"**
- 240V
- 11 kV
- 120 kV ✓ (Correct)
- 500 kV

The user selects one option. The platform records the response and scores it.

### 2. Multiple Choice (Checkboxes)

Multiple correct answers. Example:

**"Which of the following are core competencies for a project manager? (Select all that apply)"**
- ☑ Leadership and team management ✓
- ☐ Scuba diving
- ☑ Budget forecasting and control ✓
- ☑ Stakeholder communication ✓

The user selects as many correct options as apply. The platform records all selections and scores accordingly. Partial credit may be given (e.g. 3 out of 3 correct = full score; 2 out of 3 = partial score).

### 3. Scale/Likert Scale

Self-assessment of proficiency or confidence. Example:

**"Rate your experience with electrical troubleshooting (1 = No experience, 5 = Expert)"**
[1 ☐] [2 ☐] [3 ☐] [4 ☐] [5 ☑]

The user selects a score from 1 to 5 (or similar scale). The platform maps the score to a skill level.

### 4. Ranking

Prioritize or order items. Example:

**"Rank the following skills by importance for your career (1 = most important, 3 = least important)"**
1. Safety culture and compliance _1_
2. Technical troubleshooting _2_
3. Communication and teamwork _3_

The user enters or drags items into order. The platform scores based on the ordering.

### Question Metadata

Each question in the diagnostic is configured with:
- **Skill Tags** — Which skill(s) does this question assess? (e.g. "Electrical", "Safety", "Project Management")
- **Difficulty Level** — Beginner, Intermediate, Advanced
- **Score Impact** — How many points is this question worth? (e.g. 5 points for a hard question, 1 point for an easy one)

---

## Scoring and Skill Assessment

The platform scores answers and maps them to skill levels.

### How Scoring Works

1. **Question-Level Score:** Each question has a maximum score (set during configuration, e.g. 5 points)
2. **Answer Scoring:** The user's answer is matched against the correct answer:
   - Correct answer = full points (5 points)
   - Partial credit (if multiple choice) = fraction of points (e.g. 2 out of 3 correct = ~3.33 points)
   - Incorrect answer = 0 points
   - Scale answers (Likert) = mapped to points (e.g. rating 5/5 = full points; rating 2/5 = partial points)

3. **Skill Score:** All questions tagged with the same skill are summed to calculate a total score for that skill
   - Example: "Electrical" skill has 5 questions worth 5 points each = max 25 points
   - If user answers 4 correctly and 1 partially = 19 points out of 25 = 76%

4. **Overall Score:** All skill scores are combined into a total assessment score
   - Sum of all skill points / sum of all possible points = overall percentage

### Scoring Example

| Question | Skill Tag | Max Points | Answer | Score |
|----------|-----------|-----------|--------|-------|
| Q1: "Voltage level?" | Electrical | 5 | Correct | 5 |
| Q2: "Competencies? (select 3)" | Project Mgmt | 5 | 2 correct | 3 |
| Q3: "Rate experience" (1–5) | Safety | 5 | 4/5 | 4 |
| Q4: "Rank skills" | Teamwork | 5 | 2/3 correct order | 3 |
| **Total** | — | **20** | — | **15 (75%)** |

---

## Skill Gap Analysis

The platform compares the user's assessed skills against the skills required for their target careers. This produces a skill gap report.

### How Skill Gaps Are Calculated

1. **User's Current Skills:** Based on diagnostic answers
   - "Electrical" skill: 76% proficiency
   - "Safety" skill: 80% proficiency
   - "Project Management" skill: 60% proficiency

2. **Target Career's Required Skills:** Configured per career (defined by admin when setting up careers)
   - Wind Turbine Technician requires:
     - Electrical: 80% (expert)
     - Safety: 90% (expert)
     - Mechanical: 70% (intermediate)
     - Teamwork: 60% (intermediate)

3. **Gap Calculation:** For each skill, compare user level to required level
   - Electrical: 76% user vs 80% required = **-4% gap** (small gap)
   - Safety: 80% user vs 90% required = **-10% gap** (moderate gap)
   - Mechanical: 0% user vs 70% required = **-70% gap** (large gap)
   - Teamwork: Not assessed; assume 0% vs 60% required = **-60% gap** (large gap)

4. **Gap Severity:** Gaps are rated by magnitude:
   - **No gap** (0–5%): User meets or exceeds requirement
   - **Small gap** (5–25%): Can be closed with targeted training
   - **Moderate gap** (25–50%): Significant training needed; realistic pathway
   - **Large gap** (50%+): Substantial retraining required; may take months/years

### Example Skill Gap Report

**User: Sarah, assessing fit for Wind Turbine Technician**

| Skill | User Level | Required | Gap | Severity |
|-------|-----------|----------|-----|----------|
| Electrical | 76% | 80% | -4% | No gap |
| Safety | 80% | 90% | -10% | Small |
| Mechanical | 0% | 70% | -70% | Large |
| Teamwork | 0% | 60% | -60% | Large |

**Interpretation:** Sarah has good electrical knowledge but lacks mechanical expertise and teamwork experience. Becoming a turbine technician would require:
- Short course on mechanical systems (2–3 months)
- Teamwork and communication training (1 month)
- Total pathway: 3–4 months with relevant courses and work experience

---

## Career and Course Recommendations

Based on skill gaps and the diagnostic results, the platform recommends careers and courses.

### Career Recommendations

The algorithm identifies careers that match the user's skill profile:

**Scoring careers by fit:**
1. Compare user's current skills to each career's requirements
2. Calculate overall skill gap (average of all skill gaps)
3. Rank careers by "fit score" (lowest average gap = best fit)
4. Show top recommendations (e.g. top 5)

**Recommendation Categories:**
- **Excellent Fit** (0–20% average gap) — User is already well-positioned for this role
- **Good Fit** (20–40% gap) — User could transition with targeted training (3–6 months)
- **Feasible Fit** (40–70% gap) — User could pursue this role with significant training (6–12 months)
- **Challenge** (70%+ gap) — Would require extensive retraining; not recommended as primary pathway

### Course Recommendations

For each recommended career, the platform suggests courses that address the user's skill gaps:

**Logic:**
1. Identify the top skill gaps for the target career
2. Find courses tagged with those skills
3. Rank courses by relevance and efficiency (shorter courses addressing larger gaps first)
4. Show top 3–5 recommendations

**Example for Sarah (Wind Turbine Technician)**

Skill gaps identified: Mechanical (-70%), Teamwork (-60%)

Recommended courses:
1. "Mechanical Systems for Wind Turbines" (5 days) — Addresses -70% gap, direct pathway
2. "Offshore Team Leadership" (2 days) — Addresses -60% gap, soft skills
3. "STCW Basic Safety Refresher" (1 day) — Consolidates safety knowledge at 80%

---

## Scoring Configuration (Admin Reference)

Admins configure the diagnostic by setting up:

### 1. Questions

For each question, admin sets:
- Question text
- Question type (single choice, multiple choice, scale, ranking)
- Correct answer(s)
- Skill tags (which skill[s] this question assesses)
- Difficulty level (for weighting)
- Score impact (points value)

Example:
- **Q1:** "Rate your electrical troubleshooting ability (1–5)"
  - Type: Scale (1 = novice, 5 = expert)
  - Skill: Electrical
  - Difficulty: Intermediate
  - Score impact: 5 points

### 2. Skills

Admin defines each skill that can be assessed:
- Skill name (e.g. "Electrical", "Safety", "Project Management")
- Description
- Max points (sum of all questions tagged with this skill)
- Threshold for "proficient" (e.g. 70% = intermediate level)

### 3. Careers and Required Skills

For each career, admin specifies:
- Required skill levels (e.g. Electrical: 80%, Safety: 90%)
- This is used to calculate gaps

### 4. Courses and Skill Links

Each course is tagged with skills it develops (e.g. "Mechanical Systems for Wind Turbines" → develops Mechanical skill)

---

## AI Summary Feature

An optional AI-powered feature can generate personalized text summaries of diagnostic results.

### How It Works

If enabled, after the user completes the diagnostic:
1. The system sends their responses and skill profile to an AI language model
2. The AI generates a personalized summary including:
   - Strengths (skills where user scored high)
   - Areas for development (largest skill gaps)
   - Tailored career recommendations (why specific careers are good fits)
   - Next steps and learning pathways

### Example AI Summary

*"Based on your assessment, you have strong foundational knowledge in electrical systems (76%) and safety compliance (80%), which are excellent starting points for a career in the offshore wind sector. Your largest development area is mechanical expertise, but this is very achievable through structured training. We recommend starting with our 'Mechanical Systems for Wind Turbines' course (5 days), followed by hands-on experience. Your profile aligns well with Wind Turbine Technician and Electrical Maintenance roles within 6–9 months of targeted training."*

### Admin Configuration

Admins can enable/disable AI summaries in platform settings. When enabled, summaries are generated automatically. When disabled, only structured results (skill gaps, charts) are shown.

---

## HubSpot Sync and Lead Capture

If HubSpot CRM integration is configured, diagnostic results can be synced to HubSpot for lead management.

### User Consent

Before syncing, the user is shown a consent checkbox:
"I agree to share my assessment results with Skillnet for follow-up communication about relevant courses and careers."

Only results from users who consent are synced.

### What Gets Synced

When a user completes the diagnostic and consents, HubSpot receives:
- Contact info (name, email, phone, organisation, role)
- Assessment completion date and score
- Top skill gaps
- Recommended careers (top 3)
- Recommended courses (top 3)
- Assessment responses (optional, for detailed analysis)

### HubSpot Use Cases

1. **Lead Scoring:** Contacts with large skill gaps may be high-priority for training
2. **Personalized Outreach:** HubSpot can send tailored course recommendations based on gap data
3. **Conversion Tracking:** Track if users who take relevant courses improve their skills (re-assessment after course)
4. **Reporting:** Analyze aggregate skill gaps across cohorts to identify training needs

### Admin Monitoring

In the admin panel, you can see:
- How many diagnostic completions synced to HubSpot
- Sync status (successful, failed, pending)
- Last sync date and time

---

## Accessing Diagnostic Results (Analytics and Reporting)

Admins can view diagnostic results and insights in the analytics section.

### Diagnostic Analytics Dashboard

Typical metrics shown:
- **Total Completions** — How many users completed the assessment
- **Average Overall Score** — Mean percentage score across all users
- **Completion Rate** — Percentage of visitors who started and completed
- **Most Common Skill Gaps** — Skills where users scored lowest
- **Top Recommended Careers** — Which roles users most often matched to
- **Most Recommended Courses** — Which training programs are suggested most

### Filters

You can filter diagnostic results by:
- Date range (e.g. last 30 days)
- Skill (e.g. show all users with gaps in "Electrical")
- Target career (e.g. all users assessed for "Wind Turbine Technician")
- HubSpot sync status (synced vs not synced)

### Individual Results

You can also view individual user results:
1. Find the user in a list or search by email
2. View their:
   - Completion date
   - Overall score and percentile
   - Skill-by-skill breakdown with charts
   - Identified skill gaps (severity ratings)
   - Recommended careers and courses
   - HubSpot sync status

---

## Using Diagnostic Data for Reporting

The diagnostic tool generates valuable insights for program planning and evaluation:

### 1. Identify Training Needs

**Analysis:** Which skills have the largest aggregate gaps?
- Example: "60% of participants have gaps in 'Mechanical Systems'. Recommend prioritizing a Mechanical Systems course."

**Action:** Use this to guide course development or sourcing.

### 2. Evaluate Career Relevance

**Analysis:** Are careers well-positioned within the platform?
- Example: "Wind Turbine Technician was recommended to 40% of participants; Electrical Technician to 30%. Both are viable roles."

**Action:** Ensure course recommendations align with career demand.

### 3. Benchmark Cohorts

**Analysis:** How do skill levels compare across different cohorts or time periods?
- Example: "Average score for Jan cohort: 62%; Feb cohort: 68%. Feb cohort has stronger mechanical skills."

**Action:** Identify if training is improving baseline skills over time.

### 4. Measure Course Impact

**Analysis:** Do users who take a recommended course re-assess with improved scores?
- Example: "15 users took 'Mechanical Systems' course. 10 reassessed; average score improved from 45% to 72%."

**Action:** Validate that courses are effective and adjust course content if needed.

### 5. Generate Quarterly Reports

**Report structure:**
- Total assessments completed
- Average scores and trends
- Top 5 skill gaps (and recommended courses)
- Top 5 recommended careers
- HubSpot lead quality and conversion rates
- Recommendations for next quarter

---

## Best Practices for Using the Diagnostic Tool

1. **Promote the diagnostic widely.** Feature it on the homepage and encourage all platform visitors to take it.
2. **Validate question quality.** Periodically review questions to ensure they accurately assess skills. Update or remove ambiguous questions.
3. **Keep skill definitions current.** As the offshore wind sector evolves, ensure required skill levels for careers remain realistic.
4. **Link courses to outcomes.** After users take a recommended course, encourage them to re-assess. Track if their scores improve.
5. **Use HubSpot sync strategically.** Segment leads by skill gaps in HubSpot and send targeted training recommendations.
6. **Review results regularly.** Monthly or quarterly, review diagnostic analytics to identify trends and training needs.
7. **Communicate results clearly.** Ensure users understand their skill gaps and recommended next steps.
8. **Act on insights.** Use aggregate diagnostic data to guide content development and course sourcing decisions.

---

## Troubleshooting Diagnostic Issues

| Issue | Solution |
|-------|----------|
| Question is ambiguous or confusing | Review question wording with domain experts. Revise the question and re-test. |
| Low completion rate | Promote the diagnostic more prominently. Simplify or shorten the questionnaire if too long. |
| Results do not match expected skill gaps | Verify scoring configuration (question points, skill tags). Re-assess sample users manually. |
| HubSpot sync failed | Check that HubSpot API key is valid and CRM is properly configured. Retry sync. |
| Career recommendations seem off | Review career skill requirements. Verify that required levels are realistic and match course offerings. |
| Users skipping questions | Make questions clearer. Consider adding "I don't know" options instead of requiring all answers. |
| AI summaries not generating | Ensure AI feature is enabled in platform settings. Check API key and rate limits. |

---

## Summary: Key Admin Tasks

| Task | Location | Steps |
|------|----------|-------|
| View diagnostic completions | Analytics Dashboard | Go to Analytics > Diagnostic; view completion count and trends |
| Find skill gaps across cohort | Analytics Dashboard | Filter by date range and skill; review "Most Common Gaps" |
| View individual user results | User/Diagnostic Details | Search user by email; click "View Assessment Results" |
| Review HubSpot sync status | Analytics or HubSpot widget | Check sync success rate and last sync date |
| Generate quarterly report | Analytics Dashboard | Export data; compile metrics, trends, and recommendations |
| Update career skill requirements | Career Management | Edit career, adjust required skill levels, save |
| Enable AI summaries | Platform Settings | Turn on "AI Summary Feature"; test with sample assessment |
