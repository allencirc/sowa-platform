# Training Materials & Refresher Guides

This document is designed for new Skillnet staff members joining the SOWA platform team. It includes quick-start checklists, common task walkthroughs, troubleshooting FAQs, and links to full documentation.

---

## Welcome to the SOWA Platform Team

The SOWA (Skillnet Offshore Wind Academy) platform is a Next.js-based content management system for careers, courses, events, news, and research in the offshore wind energy sector. This guide will get you up to speed quickly.

### Before You Start

1. You should have received your login credentials (email and temporary password)
2. Log in to **yourdomain.ie/admin/login** with your email and temporary password
3. Change your password immediately
4. Review the Admin User Guide (link at bottom of this document)

### Your Role

Are you an **Editor**, **Admin**, or **Viewer**? This determines what you can do:

- **Editors:** Create and edit content; submit for review
- **Admins:** Create, edit, publish content; manage users; export data
- **Viewers:** Read-only access to view content and registrations

Not sure? Check with your manager or the platform administrator.

---

## Quick-Start Checklist for New Editors

Complete this checklist during your first week:

**Day 1: Setup**

- [ ] Log in and change your password
- [ ] Read the Admin User Guide (overview)
- [ ] Read the Content-Type Guides (understand the 5 content types)
- [ ] Explore the admin dashboard; familiarize yourself with the sidebar navigation

**Day 2: Hands-On Practice**

- [ ] Create a new Career (draft only) — fill in required fields, save as draft
- [ ] Upload an image to the media library
- [ ] Edit a published piece of content (make a small change, save)
- [ ] View the version history of what you edited

**Day 3: First Real Task**

- [ ] Create a new Careers listing (complete, all fields)
- [ ] Add related courses and skills
- [ ] Save as draft, request feedback from an Admin
- [ ] Once approved, submit for review
- [ ] Complete the Publishing Workflow guide (understand the review process)

**Day 4: Registrations & Data**

- [ ] View the Registrations section
- [ ] Apply filters (by event, status, date)
- [ ] Read the Registrations & CSV Export guide
- [ ] If relevant to your role, download and open a sample CSV export

**Day 5: Consolidation**

- [ ] Review any feedback from your first submitted content
- [ ] Ask questions; note any gaps in your understanding
- [ ] Read User & Role Management (understand team structure)
- [ ] Bookmark key documentation for future reference

---

## Common Tasks Walkthrough

### Task 1: Creating Your First Career

**Goal:** Publish a new career listing for an offshore wind role.

**Time:** 20–30 minutes

**Steps:**

1. **Navigate to Careers**
   - Click **Careers** in the left sidebar
   - You see a list of existing careers
   - Click **Create New** (top right)

2. **Fill in Required Fields**
   - **Slug:** Enter a URL-friendly name (e.g. `cable-installer-technician`). Use lowercase, hyphens, no spaces.
   - **Title:** Enter the job title (e.g. "Cable Installer Technician")
   - **Sector:** Choose from the dropdown (e.g. "Marine Operations")
   - **Entry Level:** Select the appropriate level (e.g. "Mid")
   - **Description:** Write a 150–300 word description of the role. Cover what they do, where they work, who they work with, key challenges.

3. **Add Optional Fields (Recommended)**
   - **Salary Range:** If you have data, enter minimum and maximum EUR
   - **Key Responsibilities:** Add 4–8 bullet points
   - **Qualifications:** List required certifications or education
   - **Working Conditions:** Describe the physical environment and schedule
   - **Growth Outlook:** Add a short statement about industry demand

4. **Link Skills**
   - Scroll to the "Skills" section
   - Click **Add Skill** and select from the list (e.g. "Cable splicing", "Safety", "Teamwork")
   - Add 3–5 core skills

5. **Link Courses (Optional)**
   - Scroll to "Related Courses"
   - Click **Add Course** and select courses that prepare someone for this role
   - Add 2–5 relevant courses

6. **Save as Draft**
   - Click **Save as Draft** (bottom left)
   - A confirmation message appears; Version 1 is created

7. **Review and Edit**
   - The page reloads; you see your draft saved
   - Review the content for typos or missing information
   - Click **Edit** if you need to make changes
   - Save again; a new version is created

8. **Submit for Review (or Publish if Admin)**
   - If you are an **Editor:** Click **Submit for Review**. An Admin will review and either publish or reject.
   - If you are an **Admin:** Click **Publish** to publish immediately.

9. **Test on Public Site**
   - Once published, visit yourdomain.ie/careers/cable-installer-technician (use your slug)
   - Verify the career page displays correctly, images load, and links work
   - Share the link with your team for feedback

**Tips:**

- Save often (every 5 minutes) to avoid losing work
- Add a change note if you make significant edits (e.g. "Updated salary range based on Q1 survey")
- If rejected, read the Admin's feedback, make the requested changes, and resubmit

---

### Task 2: Creating and Managing Your First Event

**Goal:** Create an event, publish it, and manage registrations.

**Time:** 30–45 minutes

**Steps:**

1. **Create the Event**
   - Click **Events** in the sidebar
   - Click **Create New**
   - Fill in required fields:
     - **Slug:** e.g. `offshore-safety-webinar-march`
     - **Title:** e.g. "Offshore Safety Fundamentals Webinar"
     - **Description:** 100–150 words describing the webinar, learning outcomes, and target audience
     - **Type:** Select "Webinar" (or Workshop, Conference, etc.)
     - **Start Date:** Click the date/time picker and select the date and time
     - **Location Type:** Select "Virtual" (for a webinar)

2. **Add Optional Details**
   - **End Date:** For multi-day events, set the final day
   - **Location:** For webinars, you may enter "Online" or a Zoom link
   - **Capacity:** If you want to limit registrations, enter a number (e.g. 100). Leave blank for unlimited.
   - **Image:** Upload or select a hero image

3. **Save and Publish**
   - Click **Save as Draft**
   - If you are an **Editor:** Click **Submit for Review**
   - If you are an **Admin:** Click **Publish**

4. **Test Registration**
   - Visit the public event page (yourdomain.ie/events/offshore-safety-webinar-march)
   - Verify the registration button is visible (for published events)
   - If you want, test the registration form (or have a colleague test it)

5. **Monitor Registrations**
   - Go to **Registrations** in the admin sidebar
   - Filter by **Content** > "Offshore Safety Fundamentals Webinar"
   - You see registrations appear as they come in
   - Confirm the registration count matches your capacity if you set one

6. **Prepare for the Event**
   - 1 week before: Review confirmed registrations
   - 1 day before: Export CSV of confirmed registrations for headcount/attendee list
   - Send reminder email to confirmed registrants (if your process includes this)

7. **Manage Registration Status**
   - If someone asks to cancel, find their registration, change status to "Cancelled"
   - If you want to confirm a pending registration, change status to "Confirmed"
   - The headcount updates automatically

**Tips:**

- Set accurate date and time; ambiguous times confuse registrants
- Use a descriptive title so people know what the event is about
- Upload a professional hero image to make the event page attractive
- Review registrations frequently, especially as the event date approaches
- If the event fills up and you want to allow more, edit the event and increase capacity

---

### Task 3: Running the Diagnostic Tool and Viewing Results

**Goal:** Understand how users see and complete the self-assessment, and review diagnostic insights as an admin.

**Time:** 20–30 minutes

**Steps:**

1. **Take the Diagnostic as a Test User**
   - Visit yourdomain.ie (the public platform homepage)
   - Look for "Diagnostic", "Assessment", or "Take the Assessment" link
   - Click to start the diagnostic
   - Answer 15–20 questions (sample, not the full diagnostic; or take the full one if time allows)
   - Review the results page (skill gaps, recommended careers, recommended courses)
   - Note: You may be asked to consent to HubSpot sync; you can opt out for testing

2. **View Diagnostic Results as an Admin**
   - Go to **Analytics** or **Diagnostics** in the admin sidebar (location varies by platform)
   - You see a dashboard with:
     - Total completions
     - Average score
     - Most common skill gaps
     - Top recommended careers
   - Review these metrics to understand platform usage and user interests

3. **View Your Test Results**
   - Find your email in the diagnostic results (if visible)
   - Or search for your test user
   - View your individual assessment:
     - Overall score
     - Skill-by-skill breakdown (chart or table)
     - Identified skill gaps (severity: small, moderate, large)
     - Recommended careers (top 3 with fit scores)
     - Recommended courses (top 3)
   - Note which careers and courses the system recommended

4. **Review Career and Course Links**
   - Take note of the recommended careers and courses
   - Visit those careers and courses on the public site
   - Verify they are well-written and have good descriptions
   - This helps you understand how the platform connects content

5. **Read the Diagnostic Tool Guide**
   - Refer to "Diagnostic Tool — Reporting & Interpretation" documentation for detailed explanations of scoring, gaps, and recommendations
   - This will help you interpret results and use them for reporting

**Tips:**

- Take the diagnostic yourself; this is the best way to understand it
- Review diagnostic metrics monthly to understand what users are seeking
- Use results to identify missing courses or poorly-described careers
- If you see a lot of users being recommended to a specific career, ensure that career has excellent courses listed

---

### Task 4: Exporting Registration Data for Reporting

**Goal:** Export registrations for a specific event and prepare a simple report.

**Time:** 15–20 minutes

**Steps:**

1. **Navigate to Registrations**
   - Click **Registrations** in the sidebar

2. **Apply Filters**
   - Set **Type** to "Event"
   - Set **Content** to the specific event you want to report on (e.g. "Offshore Safety Fundamentals Webinar")
   - Set **Status** to "Confirmed" (to get headcount of confirmed attendees)
   - Set **Date Range** if needed (e.g. last 30 days)

3. **Review the List**
   - You see registrations matching your filters
   - Note the count (e.g. "23 confirmed registrations")

4. **Export to CSV**
   - Click **Export CSV** (top right or bottom)
   - A CSV file downloads to your computer (e.g. `registrations-2026-03-20.csv`)

5. **Open in Excel or Google Sheets**
   - Open the CSV file (double-click or drag into Excel)
   - Excel opens the data in columns:
     - Name, Email, Phone, Organisation, Role, Dietary Requirements, Status, Registration Date, etc.

6. **Analyse the Data**
   - Count rows to verify headcount (e.g. 23 confirmed)
   - Review the "Dietary Requirements" column; count vegetarian, vegan, gluten-free (e.g. "5 vegetarian, 2 vegan")
   - Review "Organisation" column; identify which companies are sending people
   - Use this data for:
     - Catering coordination (dietary breakdown)
     - Attendee confirmation (email list)
     - Reporting to stakeholders (company breakdown)

7. **Create a Simple Report**
   - In a document or spreadsheet, summarise:
     - Event name and date
     - Total registrations (Pending, Confirmed, Cancelled)
     - Confirmed headcount
     - Dietary breakdown
     - Top 5 companies represented
     - Any other insights

**Tips:**

- Export only the data you need (apply filters first)
- Filter to "Confirmed" for accurate headcount; pending registrations may not attend
- Save the CSV file with a clear name (e.g. `Event-SafetyWebinar-2026-03-15-Registrations.csv`)
- Delete the CSV file after use (it contains personal data)

---

## Troubleshooting FAQ

### General Questions

**Q: I forgot my password. What do I do?**
A: Contact your platform administrator or manager. They can reset your password and provide you with a temporary one. Change it immediately after login.

**Q: I cannot see content I just created. Is it lost?**
A: Check the status. If you saved it as "Draft", it is not visible on the public site (only in the admin panel). If you are an Editor, content must be submitted for review and approved by an Admin before being published. If you are an Admin, click "Publish" to publish it.

**Q: What is the difference between "Save" and "Submit for Review"?**
A: "Save" keeps the content as Draft and saves your edits. Only Editors use this. "Submit for Review" sends the content to an Admin for approval; the status becomes "In Review". Only Editors submit for review. Admins can publish directly without review.

**Q: I published something by mistake. Can I unpublish it?**
A: Yes. Open the content, click "Archive" to hide it from the public (but preserve it). Or use "Delete" to remove it permanently. Archive is safer if you might need the content again.

### Content Creation Issues

**Q: I keep getting "Slug already exists" error. What does this mean?**
A: The URL identifier (slug) is already in use by another piece of content. Choose a different slug. Slugs must be unique within each content type (e.g. two Careers cannot have the same slug, but a Career and a Course can).

**Q: I created a typo in the slug/title and cannot change it. Why?**
A: Slugs cannot be changed after creation (to avoid breaking URLs). Titles can be changed. If your slug is wrong, delete the draft and recreate it with the correct slug. Once published, do not delete; instead, create a new item with the correct slug and archive the old one.

**Q: My content is not appearing on the public website, but I published it.**
A: Wait a few minutes; the site may need to rebuild. Refresh your browser. If it still does not appear, check that the status is "Published" (not Draft or In Review). Verify the publish date has passed (if you scheduled publication, it may not be live yet).

**Q: How do I make content appear in a specific order (e.g. featured careers first)?**
A: This depends on the platform configuration. Some platforms support a "Featured" checkbox or "Sort Order" field. Check the content form. Otherwise, contact the admin or developer.

### Media and Images

**Q: My image is too large and will not upload. What is the size limit?**
A: Maximum 5 MB. Compress your image using TinyPNG (www.tinypng.com) or another tool. Aim for 500 KB–2 MB.

**Q: I uploaded an image, but it does not appear in my content. Why?**
A: Check that you used the correct image URL in the content field. Copy the URL from the media library. If the image is still missing, try deleting it from content and re-adding it. If the URL is broken, delete the image and re-upload.

**Q: I cannot delete an image because it says "Used in content". What do I do?**
A: The image is linked to published content. To delete it, first remove the image from all content that uses it, then delete the image from the media library. Or leave the image unused in the library (it takes minimal space).

### Publishing and Review

**Q: I submitted content for review, but the Admin has not reviewed it in days. What do I do?**
A: Follow up with the Admin directly (email, chat, etc.). They may have missed the notification. Provide the content title and date submitted.

**Q: The Admin rejected my content. I am confused about the feedback. What now?**
A: Read the rejection note carefully. It explains what needs to change. If still unclear, ask the Admin for clarification. Make the requested changes, save, and resubmit.

**Q: Can I schedule content to publish at a specific future date?**
A: Yes, if you are an Admin. Edit the content and set the **Publish At** date and time. The content will automatically publish at that moment. Editors cannot schedule; they must submit for Admin review.

### Registrations and Data

**Q: An event is full (capacity reached), but I want to accept more registrations. What do I do?**
A: Edit the event and increase the capacity number. Save. The registration button becomes available to the public again.

**Q: I want to contact all registrants for an event. How do I get their email addresses?**
A: Export the registrations to CSV (set Status filter to "Confirmed" first). Open the CSV in Excel. Copy the Email column and paste into your email platform (Mailchimp, HubSpot, etc.). Ensure they consented to contact (check GDPR Consent column).

**Q: A registrant has a disability and needs accommodation. Where do I note this?**
A: Ask the registrant to provide details. Some registrations include an "Additional Notes" field where you can record this. If not in the form, add it to your own spreadsheet for internal tracking.

**Q: The CSV export looks corrupted or displays incorrectly in Excel. What is wrong?**
A: This is usually an Excel character encoding issue. Try opening the file in Google Sheets instead, or opening it in a text editor first to verify the content. If the CSV is damaged, try exporting again.

### Skills, Careers, and Diagnostics

**Q: I want to create a new skill (e.g. "Robotics") but cannot find the field. Can I add skills?**
A: Skills are typically managed by Admins only. Contact your platform administrator. They may add skills in bulk or on request.

**Q: A career I created is not showing up in the diagnostic recommendations. Why?**
A: The diagnostic recommends careers based on skill matches. Verify that the career has skills linked to it and that those skills are assessed in the diagnostic questions. If still missing, contact an Admin to check diagnostic configuration.

**Q: Can users retake the diagnostic to reassess after taking a course?**
A: Yes, the platform should allow users to retake the diagnostic. This helps measure learning progress. Encourage users to retake it after completing a recommended course.

---

## Key Documentation Links

Keep these handy for reference:

1. **Admin User Guide** — Platform overview, roles, navigation, basic workflows
   - File: `/docs/admin-guide.md`

2. **Content-Type Guides** — Detailed field explanations for Careers, Courses, Events, News, Research
   - File: `/docs/content-type-guides.md`
   - Start here if you are creating content and need field-specific guidance

3. **Publishing Workflow & Version History** — How content moves from Draft to Published; how to submit for review, schedule publication, restore versions
   - File: `/docs/publishing-workflow.md`
   - Essential for understanding the review and approval process

4. **User & Role Management** — Creating users, assigning roles, onboarding
   - File: `/docs/user-role-management.md`
   - For Admins managing team members

5. **Media Library & Asset Management** — Uploading images, sizing, naming conventions, optimization
   - File: `/docs/media-library.md`
   - Refer to before uploading images

6. **Registrations & CSV Export** — Managing event/course registrations, exporting data, GDPR
   - File: `/docs/registrations-export.md`
   - Essential before exporting registration data

7. **Diagnostic Tool — Reporting & Interpretation** — How the self-assessment works, scoring, skill gaps, career recommendations
   - File: `/docs/diagnostic-tool.md`
   - Refer to when using diagnostic analytics or explaining results

---

## Quick Reference: Common Admin Tasks

| Task                  | Navigation                                                   | Key Steps                                                |
| --------------------- | ------------------------------------------------------------ | -------------------------------------------------------- |
| Create a career       | Careers > Create New                                         | Fill required fields, add skills, save/submit            |
| Create an event       | Events > Create New                                          | Set title, type, date/time, location type, capacity      |
| Create a course       | Courses > Create New                                         | Set provider, delivery format, duration, cost, NFQ level |
| Publish content       | Edit content > Publish (Admin) or Submit for Review (Editor) | Click Publish or Submit, confirm                         |
| Export registrations  | Registrations > Apply filters > Export CSV                   | Select event/course, status, date range; download CSV    |
| Upload an image       | Media > Upload                                               | Select file (under 5 MB); copy URL for use in content    |
| Create a user         | Users > Create User                                          | Enter email, name, password, role; click Create          |
| View version history  | Edit content > Version History tab                           | See all edits, who made them, when, why (change notes)   |
| Schedule publication  | Edit content > Set Publish At date > Save                    | Content publishes automatically at scheduled time        |
| Manage event capacity | Edit event > Change Capacity field > Save                    | Increase or decrease max registrations                   |

---

## Next Steps

1. **Complete the Quick-Start Checklist** above (should take a full work week)
2. **Read all documentation** referenced in the "Key Documentation Links" section
3. **Schedule a 1-on-1 with your manager or mentor** — Ask questions, get feedback on your first content
4. **Create your first 2–3 pieces of content** (careers, courses, or events) to build confidence
5. **Join regular team meetings** to stay aligned with other content creators and admins
6. **Bookmark this page and the documentation links** — You will refer to them frequently

---

## Getting Help

If you get stuck:

1. **Check the relevant documentation** — It probably covers your question
2. **Ask a teammate** — Your peers can often answer quickly
3. **Contact your manager or platform admin** — For technical issues or clarifications
4. **Use the troubleshooting FAQ** above — Common issues are listed with solutions

Welcome to the team! We look forward to working with you to build the SOWA platform into the best resource for offshore wind careers and training.
