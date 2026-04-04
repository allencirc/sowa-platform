# Admin User Guide

This guide is for content editors and administrators who manage the SOWA platform through the built-in CMS.

---

## Getting Started

### Logging In

1. Navigate to **yourdomain.ie/admin/login**
2. Enter your email address and password
3. Click **Sign In**

If you cannot log in, contact the system administrator to reset your credentials.

### User Roles

| Role | Can Do |
|------|--------|
| **Admin** | Everything: create/edit/publish/delete content, manage users, export data, view registrations |
| **Editor** | Create and edit content, submit for review, view registrations |
| **Viewer** | View content and registrations (read-only) |

### Dashboard

After logging in, you land on the **Admin Dashboard**. The sidebar on the left provides navigation to all content areas:

- **Dashboard** — Overview and quick stats
- **Careers** — Career role listings
- **Courses** — Training course directory
- **Events** — Events and conferences
- **News** — News articles and announcements
- **Research** — Research publications
- **Users** — User management (Admin only)
- **Media** — Image uploads

---

## Managing Content

All content types (Careers, Courses, Events, News, Research) follow the same workflow.

### Content Statuses

| Status | Meaning |
|--------|---------|
| **Draft** | Work in progress. Not visible on the public site. |
| **In Review** | Submitted for approval. Still not public. |
| **Published** | Live on the public site. |
| **Archived** | Removed from the public site but preserved in the system. |

### Creating New Content

1. Navigate to the content section (e.g. **Careers** in the sidebar)
2. Click the **Create New** button (top right)
3. Fill in the required fields (marked with asterisks)
4. Click **Save as Draft**

The new item is saved with "Draft" status and is not visible to the public.

### Editing Content

1. Navigate to the content listing page
2. Find the item you want to edit (use the search bar or filters)
3. Click the item row or the **Edit** button
4. Make your changes in the form
5. Click **Save**

A version snapshot is automatically created each time you save, preserving the previous state.

### Publishing Content

**If you are an Editor:**
1. Edit the content until it is ready
2. Click **Submit for Review**
3. The status changes to "In Review"
4. An Admin must approve and publish

**If you are an Admin:**
1. You can publish directly: click **Publish**
2. Or schedule publication: set a future date in the **Publish At** field and save
3. To reject content back to draft: click **Reject** and add a rejection note explaining what needs to change

### Archiving Content

1. Open the published content item
2. Click **Archive**
3. The item is removed from the public site but remains in the system

### Deleting Content

1. Open the content item
2. Click the **Delete** button
3. Confirm the deletion in the dialog

**Warning:** Deletion is permanent and removes all related data (skill links, pathway connections, versions). Archive instead if you may need the content again.

---

## Content Type Guides

### Careers

Each career represents a job role in the offshore wind sector.

**Required fields:**
- **Slug** — URL identifier (e.g. `wind-turbine-technician`). Auto-generated from title, but can be customised. Cannot be changed after creation.
- **Title** — Job title (e.g. "Wind Turbine Technician")
- **Sector** — Choose from: Operations & Maintenance, Marine Operations, Survey & Design, Health/Safety/Environment, Electrical, Policy & Regulation, Project Management
- **Entry Level** — Apprentice, Entry, Mid, Senior, or Leadership
- **Description** — Full description of the role

**Optional fields:**
- **Salary Range** — Minimum and maximum in EUR
- **Key Responsibilities** — Add individual responsibilities as list items
- **Qualifications** — Required qualifications as list items
- **Working Conditions** — Description of the work environment
- **Growth Outlook** — Industry growth narrative
- **Skills** — Select from the skills database to link relevant competencies
- **Pathway Connections** — Link to other careers as progression, lateral, or specialisation paths (with timeframe)
- **Related Courses** — Link courses that prepare someone for this career

### Courses

Each course represents a training programme from an education or industry provider.

**Required fields:**
- **Slug**, **Title**, **Description**
- **Provider** — Organisation name (e.g. "University College Cork")
- **Provider Type** — University, ETB, Private, Industry, Skillnet Network, Government
- **Delivery Format** — In-Person, Online, Blended, Self-Paced
- **Duration** — Free text (e.g. "5 days", "1 academic year")

**Optional fields:**
- **Location** — Venue or "Online"
- **NFQ Level** — National Framework of Qualifications level (1-10)
- **Cost** — In EUR. Enter 0 for free courses
- **Cost Notes** — e.g. "Fully funded by Skillnet Ireland"
- **Next Start Date** — Date picker for next intake
- **Accredited** — Checkbox
- **Certification Awarded** — Name of the certificate
- **Entry Requirements** — Prerequisites
- **Skills** — Competencies this course develops
- **Career Relevance** — Which careers this course prepares for
- **Tags** — Freeform tags for filtering

### Events

**Required fields:**
- **Slug**, **Title**, **Description**
- **Type** — Workshop, Webinar, Conference, Networking, Training, Roadshow
- **Start Date** — Date and time picker
- **Location Type** — Physical, Virtual, Hybrid

**Optional fields:**
- **End Date** — For multi-day events
- **Location** — Venue name or virtual link
- **Capacity** — Maximum number of registrations. Leave blank for unlimited.
- **Image** — Upload or select a hero image

### News Articles

**Required fields:**
- **Slug**, **Title**
- **Date** — Publication date
- **Excerpt** — Short summary shown on listing cards (1-2 sentences)
- **Content** — Full article content. Use the rich text editor for formatting (headings, bold, links, lists).
- **Category** — e.g. "Announcements", "Industry News", "Policy"
- **Author** — Author name

**Optional fields:**
- **Image** — Hero image for the article

### Research

**Required fields:**
- **Slug**, **Title**
- **Author**, **Organisation**
- **Publication Date**
- **Summary**
- **Categories** — Add one or more categories

**Optional fields:**
- **Featured** — Toggle to show this item in the featured research section on the homepage
- **Image** — Cover image

---

## Managing Media

### Uploading Images

1. Go to **Media** in the sidebar
2. Click **Upload**
3. Select an image file from your computer
4. The image uploads and appears in the media library

**Constraints:**
- Accepted formats: JPEG, PNG, GIF, WebP, SVG
- Maximum file size: 5 MB
- Files are renamed with a timestamp to prevent conflicts

### Using Images in Content

When editing content, use the image URL from the media library in the image field. Copy the URL from the media manager.

### Deleting Images

1. Find the image in the media library
2. Click the delete icon
3. Confirm deletion

**Note:** If the image is referenced by content, you should update that content first.

---

## Managing Registrations

### Viewing Registrations

1. Navigate to the registrations section from the admin dashboard
2. Use filters to narrow results:
   - **Type**: Event or Course
   - **Status**: Pending, Confirmed, Cancelled
   - **Date range**: Filter by registration date
   - **Search**: Search by name or email

### Confirming or Cancelling

1. Find the registration in the list
2. Click the status dropdown or action button
3. Select **Confirm** or **Cancel**
4. The status updates immediately

### Exporting Data

1. Set your desired filters (type, date range, status, etc.)
2. Click the **Export CSV** button
3. A CSV file downloads with columns: ID, Type, Content ID, Name, Email, Phone, Organisation, Role, Dietary Requirements, Additional Notes, GDPR Consent, Status, Created At

**Note:** Only Admins can export registration data.

---

## Managing Users

*Admin only*

### Creating a User

1. Go to **Users** in the sidebar
2. Click **Create User**
3. Enter:
   - **Email** (must be unique)
   - **Name**
   - **Password** (minimum 8 characters)
   - **Role** (Admin, Editor, or Viewer)
4. Click **Create**

### Editing a User

1. Find the user in the list
2. Click **Edit**
3. Update name, email, role, or password
4. Click **Save**

### Deleting a User

1. Find the user in the list
2. Click **Delete**
3. Confirm the deletion

**Note:** You cannot delete a user if they have content versions associated with them.

---

## Version History

Every time content is saved, a version snapshot is created automatically.

### Viewing Versions

1. Open any content item for editing
2. Click the **Version History** tab or panel
3. You see a list of all versions with:
   - Version number
   - Who made the change
   - When the change was made
   - Change note (if provided)

### Comparing Versions

The diff viewer highlights what changed between versions, showing additions and removals.

---

## Viewing Analytics

### Vercel Speed Insights

The platform includes Vercel Speed Insights for monitoring Core Web Vitals (page load times, interactivity, visual stability). View these in the Vercel dashboard under the **Speed Insights** tab.

### Google Analytics

If a GA4 Measurement ID is configured (`NEXT_PUBLIC_GA_MEASUREMENT_ID`), the platform tracks custom events including:
- Career and course page views
- Diagnostic assessment starts and completions
- Search queries and result counts
- Newsletter sign-ups
- Pathway exploration

View these in your Google Analytics dashboard. Analytics only activates for users who consent to analytics cookies.

### HubSpot CRM

If HubSpot is configured, event/course registrations and newsletter subscriptions are synced to your HubSpot portal automatically. Check sync status via the HubSpot widget on the admin dashboard.

---

## Tips and Best Practices

- **Always add a change note** when making significant edits. This helps other editors understand why a change was made.
- **Use the preview** by checking the public page after publishing to ensure it looks correct.
- **Don't delete when you can archive.** Archived content is hidden from the public but preserved for reference.
- **Set slugs carefully.** Once content is published and linked, changing the slug breaks URLs. The slug is locked after creation.
- **Use the diagnostic tool** yourself to verify that skill-to-career-to-course recommendations make sense after adding new content.
- **Check registrations regularly** for new pending sign-ups, especially before events.
