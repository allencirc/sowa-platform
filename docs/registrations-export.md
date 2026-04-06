# Registrations & CSV Export

This guide covers managing event and course registrations, viewing and filtering registrations, confirming or cancelling registrations, managing event capacity, exporting registration data, and GDPR considerations.

---

## Overview

When users visit the public platform and register for an event or course, their registration is recorded in the admin panel. Admins can view, filter, manage, and export this registration data.

### Accessing Registrations

1. Navigate to **Registrations** in the admin sidebar (available to Admins and Editors)
2. You see a list of all registrations with filters and search options
3. Click a registration to view full details

---

## Viewing Registrations

The registrations list shows all registrations for events and courses. By default, it displays the most recent registrations first.

### Registration Information Displayed

For each registration, you see:
- **Name** — Full name of the person registering
- **Email** — Email address
- **Content Type** — "Event" or "Course"
- **Content Title** — The specific event or course they registered for
- **Status** — Pending, Confirmed, or Cancelled
- **Registration Date** — When they registered
- **Organisation** (if provided)
- **Role** (if provided)

### Full Registration Details

Click a registration row to view complete information:
- Name, email, phone, organisation, job role
- Dietary requirements or special needs (if the registration form captured this)
- Additional notes
- GDPR consent status (whether they agreed to data use)
- Timestamp of registration
- Current status

---

## Filtering Registrations

Use filters to narrow results and find the registrations you are interested in.

### Available Filters

| Filter | Options | Use Case |
|--------|---------|----------|
| **Type** | Event, Course | Show only event registrations or only course registrations |
| **Status** | Pending, Confirmed, Cancelled | Show registrations by confirmation status |
| **Content** | Dropdown of all events/courses | Show registrations for a specific event or course |
| **Date Range** | Start and end date pickers | Show registrations within a specific time period (e.g. "registrations from Jan 1 to Feb 28") |
| **Search** | Text search field | Search by name or email address |

### Applying Filters

1. In the registrations list, find the filter section (usually above the list)
2. Select your filter criteria:
   - For Type/Status: Click checkboxes or select from dropdowns
   - For Date Range: Click the date pickers and select start and end dates
   - For Search: Type a name or email and press Enter or click Search
3. The list updates automatically to show matching registrations
4. To clear a filter, click "Clear" or deselect the option

### Common Filtering Scenarios

**Scenario 1: Who registered for the March 15 "Offshore Safety Fundamentals" event?**
1. Set Type to "Event"
2. Set Content to "Offshore Safety Fundamentals"
3. View the list

**Scenario 2: How many pending (unconfirmed) registrations do we have right now?**
1. Set Status to "Pending"
2. Count the results

**Scenario 3: What registrations were cancelled this month?**
1. Set Status to "Cancelled"
2. Set Date Range to the current month
3. View the list

**Scenario 4: Did Jane Smith register for anything?**
1. Search for "jane smith" or "jane@email.com"
2. View results

---

## Confirming and Cancelling Registrations

Registrations are initially created with "Pending" status. You can manually confirm or cancel them.

**To confirm a registration:**
1. Find the registration in the list
2. Click the registration to view details
3. Look for a **Status** dropdown or **Confirm** button
4. Click **Confirm**
5. The status changes to "Confirmed" immediately
6. The action is logged with a timestamp

**To cancel a registration:**
1. Find the registration in the list
2. Click the registration to view details
3. Look for a **Cancel** button or change Status to "Cancelled"
4. Click **Cancel**
5. The status changes to "Cancelled"
6. The action is logged

**When to Confirm:**
- When the person has paid any required fee
- When you have received additional required information (e.g. dietary requirements for catering)
- When an event or course is about to start and you have verified attendance
- Generally, before or during an event, confirm registrations so you have an accurate headcount

**When to Cancel:**
- The person requested to withdraw
- The event was cancelled
- The person's booking was fraudulent or incorrect
- A duplicate registration was created by mistake

### Bulk Actions (If Available)

Some platforms allow bulk status changes (e.g. "Confirm all registrations"). If available:
1. Select multiple registrations using checkboxes
2. Click "Bulk Action" or "Change Status"
3. Select the new status (Confirm, Cancel, etc.)
4. Click Apply

Use bulk actions carefully; verify you have the correct registrations selected before applying.

---

## Managing Event Capacity

When you create an event, you can set a maximum capacity (registration limit). The platform tracks this and closes registrations when capacity is reached.

### Setting Capacity

1. Open the event for editing
2. Find the **Capacity** field
3. Enter the maximum number of registrations (or leave blank for unlimited)
4. Save

**Examples:**
- Set Capacity to "30" for a workshop with 30 chairs
- Set Capacity to "100" for a virtual webinar with no physical limit (but use 100 to manage expectations)
- Leave blank for unlimited

### When Event Reaches Capacity

Once the number of confirmed registrations equals the capacity:
1. The registration button is disabled on the public event page
2. New visitors see "This event is at capacity. Join the waitlist." (or similar message)
3. You can continue to manage pending and confirmed registrations in the admin panel

### Managing Overflow

If an event is at capacity but you want to allow more registrations:
1. Edit the event and increase the capacity number
2. Save
3. The registration button becomes available to the public again

If a confirmed registrant cancels:
1. Cancel their registration in the admin panel
2. The capacity count decreases
3. The registration button becomes available again

### Waitlist (If Enabled)

Some platforms include a waitlist feature. If enabled:
- When an event is at capacity, visitors can add themselves to a waitlist
- If a confirmed registrant cancels, the first person on the waitlist can be automatically offered a spot or manually promoted
- Check your platform settings for waitlist configuration

---

## CSV Export

CSV (Comma-Separated Values) export allows you to download registration data for analysis, reporting, email lists, or catering coordination.

### Exporting Data

**Steps:**
1. In the Registrations section, apply any filters for the data you want to export (Type, Status, Date Range, etc.)
2. Click the **Export CSV** button (usually top right or bottom)
3. A CSV file downloads to your computer (typically named `registrations-[date].csv`)
4. Open the file in Excel, Google Sheets, or any spreadsheet application

**What Is Included:**
The CSV export contains one row per registration with the following columns (depending on your platform configuration):

| Column | Description | Example |
|--------|-------------|---------|
| ID | Unique registration ID | `reg-12345` |
| Type | Event or Course | `Event` |
| Content ID | Platform ID of the event/course | `event-567` |
| Content Title | Name of the event/course | `Offshore Safety Fundamentals` |
| Name | Registrant's full name | `Jane Smith` |
| Email | Registrant's email | `jane@example.com` |
| Phone | Registrant's phone number | `+353 1 234 5678` |
| Organisation | Registrant's employer | `Wind Tech Solutions` |
| Role | Registrant's job title | `Electrical Technician` |
| Dietary Requirements | Any special dietary needs | `Vegetarian` |
| Additional Notes | Any notes provided during registration | `Will be 10 minutes late` |
| GDPR Consent | Did they consent to data use | `Yes` or `No` |
| Status | Pending, Confirmed, or Cancelled | `Confirmed` |
| Registration Date | When they registered | `2026-03-15 14:30:00` |
| Confirmation Date | When confirmed, if applicable | `2026-03-20 09:00:00` |

### Using the Exported Data

**For Catering:**
1. Export registrations filtered to status "Confirmed"
2. Use the Dietary Requirements column to count vegetarian, vegan, gluten-free, etc.
3. Provide counts to your catering provider

**For Email Lists:**
1. Export all confirmed registrations
2. Copy the Email column
3. Use in your email platform (Mailchimp, HubSpot, etc.) to send event reminders

**For Reports:**
1. Export registrations for a time period
2. Use spreadsheet functions to count, sum, or analyse data
3. Create charts or summaries for stakeholders

**For Contact Management:**
1. Export confirmed registrations
2. Import into your CRM system (HubSpot, etc.)
3. Use for follow-up communication or leads

### Filters Before Export

Always apply filters before exporting to ensure you are exporting only the data you need.

**Recommended filters before export:**
- **Event-specific export:** Set Content to the specific event, then export
- **Confirmed only:** Set Status to "Confirmed" before catering export
- **Date range:** If exporting monthly reports, set date range to the month

This reduces file size and makes the data more usable.

### File Format Notes

The exported CSV file is plain text with comma-separated columns. It is compatible with:
- Microsoft Excel
- Google Sheets
- LibreOffice Calc
- Apple Numbers
- Any text editor

When opening in Excel:
1. Open Excel
2. File > Open
3. Select the CSV file
4. Excel may ask about formatting; use default settings
5. Data appears in columns

---

## GDPR and Data Privacy Considerations

The SOWA platform handles personal data from registrations. Your organisation must comply with GDPR (General Data Protection Regulation) and other relevant privacy laws.

### GDPR Consent

During registration, users should be asked to consent to data collection and use. The registration form typically includes a checkbox like:
"I agree that my registration data may be used for event communications and follow-up contact."

**In the CSV export:**
- The "GDPR Consent" column shows "Yes" or "No"
- Only contact people who have consented (marked "Yes")
- Do not use data of people who did not consent

### Data Retention

Registration data should be retained only as long as necessary:
- **During event:** Keep registration data for communications and headcount
- **After event:** Retain data for 30–90 days for follow-up communication
- **Long-term:** Archive old registrations or delete them after a retention period (typically 6–12 months)

Consult your organisation's data retention policy and legal requirements.

### Best Practices

1. **Only contact people who consented.** Before sending emails to registrants, check that GDPR Consent is "Yes".
2. **Secure exported files.** When you export CSV data, store it securely (not on a public server). Delete files once you have used them.
3. **Do not share data unnecessarily.** Only share registration data with team members who need it (e.g. event coordinators, catering providers).
4. **Have a privacy notice.** Ensure your platform displays a privacy notice explaining how registration data is used and stored.
5. **Allow opt-out.** Provide registrants with a way to request deletion of their data.
6. **Document consent.** Keep records of who consented and when, for audit purposes.

### Data Handling Checklist

- [ ] Registration form includes GDPR consent checkbox
- [ ] Privacy notice is displayed to registrants
- [ ] CSV exports are stored securely
- [ ] Only consented registrants are contacted
- [ ] Data is deleted or archived after the retention period
- [ ] Shared registration files are restricted to necessary team members

---

## Troubleshooting Registrations

| Issue | Solution |
|-------|----------|
| New registration does not appear in list | Registrations may not sync immediately. Refresh the page. Check filters to ensure you are not filtering out the registration. |
| Cannot confirm a registration | Check that you have Admin or Editor permissions. Only admins can typically confirm/cancel registrations. |
| CSV export is empty | Check your filters. You may have applied filters that match no registrations. Try clearing filters and exporting again. |
| CSV file does not open in Excel | Ensure the file is saved as .csv (not .xlsx or .txt). If needed, open in a text editor first to verify the format. |
| Registrations exceed event capacity | Edit the event and increase the capacity, or cancel some registrations to make room. Consider if you need a waitlist. |
| Person registered twice by mistake | You can safely leave both registrations in the system, or cancel one of them. Cancel the older one to preserve any recent updates. |
| Registrant wants to cancel | Find their registration, change status to "Cancelled". Optionally, send them a confirmation email. |

---

## Summary: Key Actions

| Task | Steps |
|------|-------|
| View registrations for a specific event | Go to Registrations, set Content filter to the event, view the list |
| Export confirmed registrations | Set Status filter to "Confirmed", click "Export CSV", open the file in Excel |
| Get a headcount for catering | Filter to status "Confirmed", count rows (or use CSV and count in Excel) |
| Contact registered participants | Export CSV with consent check, copy emails, use your email platform |
| Increase event capacity | Edit event, increase Capacity number, save |
| Mark someone as no-show | Cancel their registration (status becomes Cancelled) |
