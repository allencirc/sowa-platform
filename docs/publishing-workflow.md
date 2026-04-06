# Publishing Workflow & Version History

This guide explains how content moves through the publishing lifecycle on the SOWA platform, the roles and permissions involved at each stage, how to schedule publication, and how to use version history to review, compare, and restore previous content versions.

---

## Content Statuses: The Full Lifecycle

Every piece of content (Careers, Courses, Events, News, Research) moves through four possible statuses:

| Status        | Meaning                                                                                        | Visible to Public | Who Can Create  | Who Can Publish                                        |
| ------------- | ---------------------------------------------------------------------------------------------- | ----------------- | --------------- | ------------------------------------------------------ |
| **Draft**     | Work in progress. The creator is still editing.                                                | No                | Editors, Admins | Editors (submit for review); Admins (publish directly) |
| **In Review** | Waiting for approval. An Editor has submitted it, and an Admin must review and approve/reject. | No                | —               | Admins only                                            |
| **Published** | Live on the public website. Visible to all visitors.                                           | Yes               | —               | Admins only                                            |
| **Archived**  | Removed from public view but preserved in the system for reference or future reuse.            | No                | —               | Admins only                                            |

---

## Publishing Workflow by Role

### For Editors

Editors can create and edit content, but cannot directly publish. Instead, they submit content for review.

**Workflow:**

1. Create a new content item (Careers, Courses, Events, etc.) by clicking **Create New** in the relevant section
2. Fill in the required and optional fields
3. Click **Save as Draft** to save your work
4. Continue editing as needed; each save creates a version snapshot
5. When the content is complete and ready, click **Submit for Review**
6. The status changes to "In Review"
7. An Admin will review, provide feedback via the rejection note field, or approve and publish

**Key Points:**

- You cannot publish content directly; an Admin must approve it
- You can continue editing content that is "In Review" — just click **Save** and the changes are preserved
- If an Admin rejects your content, you will see a rejection note explaining what needs to be changed. Make the requested edits and resubmit

### For Admins

Admins have full control over the publishing workflow. They can:

- Create content directly
- Edit content
- Publish immediately (without review)
- Schedule publication for a future date
- Reject Editor-submitted content with feedback
- Archive or delete content

**Workflow for Direct Publishing:**

1. Create or edit a content item
2. When ready, click **Publish** to publish immediately
3. The status changes to "Published" and the content is live on the public site

**Workflow for Scheduled Publishing:**

1. Create or edit content
2. Instead of clicking "Publish" immediately, set a **Publish At** date and time in the form
3. Click **Save**
4. The content status changes to "Scheduled"
5. At the scheduled date/time, the system automatically publishes the content

**Workflow for Rejecting Editor Submissions:**

1. Review the submitted content (status "In Review")
2. If changes are needed, click **Reject**
3. Enter a rejection note explaining what needs to be changed
4. The content status returns to "Draft" and the Editor is notified (via the rejection note)
5. The Editor can then make changes and resubmit

---

## Scheduled Publishing

Scheduled publishing allows Admins to queue content for publication at a specific future date and time without manual intervention on that date.

**To Schedule Publication:**

1. Open the content item for editing
2. Find the **Publish At** field (usually at the bottom of the form)
3. Click the date and time picker
4. Select your desired publication date and time (in local Irish timezone)
5. Click **Save**
6. The content status changes to "Scheduled" and remains in draft form until the scheduled time
7. At the scheduled moment, the system automatically publishes the content and changes the status to "Published"

**Use Cases:**

- **Embargo timing:** Publish news at the same time as a press release
- **Event visibility:** Publish an event one month before the start date to give registrants time to plan
- **Course launches:** Publish a new course offering on a specific date when marketing campaigns launch
- **Planned announcements:** Queue multiple announcements to release on a schedule

**Tips:**

- Always double-check the date and time before saving. The timezone defaults to Irish time (UTC+0 or UTC+1 depending on daylight saving).
- If you need to cancel a scheduled publication, open the content, clear the **Publish At** field, and save. The status reverts to "Draft".
- For important publications, set a reminder in your calendar to verify the content published correctly at the scheduled time.

---

## Version History

Every time you save a content item, the system automatically creates a version snapshot. This preserves the full edit history so you can see what changed, who changed it, and when. You can compare versions and restore a previous version if needed.

### Accessing Version History

1. Open a content item for editing
2. Look for the **Version History** tab or panel (location depends on content type; usually on the right side or in a tabbed interface)
3. You will see a list of all versions, sorted chronologically (newest first)

Each version entry shows:

- **Version number** (e.g., Version 5, Version 1)
- **Author** — Who made the change
- **Timestamp** — When the change was saved
- **Change note** — An optional note describing why the change was made

### Change Notes

A change note is an optional but highly recommended text field you can fill in when saving important edits. Change notes help other editors understand the rationale for changes.

**To add a change note:**

1. Make your edits to the content
2. Find the **Change Note** field (usually near the Save button)
3. Enter a brief explanation, e.g. "Updated salary range based on Q1 2026 market survey", "Fixed typo in role description", "Added new related courses"
4. Click **Save**
5. The change note is recorded alongside the version snapshot

**Best Practices for Change Notes:**

- Be specific about what changed and why (e.g. "Updated" or "Fixed typo" is less useful than "Updated salary range from €45–65k to €50–70k based on latest industry survey")
- Include the source of information if relevant (e.g. "Based on feedback from Q1 stakeholder interview")
- Use change notes when making significant content updates, corrections, or revisions
- Short notes are better than long ones; aim for 1–2 sentences

### Comparing Versions

The platform includes a diff viewer that highlights what changed between two versions.

**To compare versions:**

1. Open the Version History panel
2. Select two versions (usually by clicking checkboxes or selecting from a dropdown)
3. Click **Compare** or **View Diff**
4. The diff viewer displays the versions side-by-side or inline
5. Additions are highlighted (often in green), and deletions are highlighted (often in red)
6. Review the changes to understand what was modified

**Use Case:** Before restoring an old version, compare it to the current version to ensure you are not losing recent updates you want to keep.

### Restoring a Previous Version

If you need to revert to a previous version of content (e.g. an update introduced an error, or you want to recover deleted text), you can restore that version.

**To restore a previous version:**

1. Open the Version History panel
2. Find the version you want to restore (consider comparing it first to the current version)
3. Click **Restore** or **Revert to This Version**
4. A confirmation dialog appears (e.g. "Restoring version 3 will overwrite the current version. Continue?")
5. Click **Confirm**
6. The previous version becomes the current version
7. A new version snapshot is created for the restore action

**Important Notes:**

- Restoring a version creates a new version entry (it does not delete the versions in between). The full history is preserved.
- After restoring, you may want to add a change note explaining why you reverted (e.g. "Reverted to version 3 due to error introduced in version 4")
- If you restore the wrong version, you can restore again to a different version

### Version History Limits

For very old content with hundreds of edits, the platform may limit the displayed history to the 50 most recent versions. Contact the system administrator if you need to access older versions.

---

## Common Scenarios

### Scenario 1: Editor Creates and Submits Content

1. Editor navigates to Careers and clicks **Create New**
2. Fills in all required fields and some optional ones
3. Clicks **Save as Draft** (Version 1 created)
4. Continues editing over a few days, clicking **Save** each time (Versions 2, 3, 4 created)
5. When satisfied, clicks **Submit for Review** (status becomes "In Review")
6. Admin reviews the content
7. Admin finds a typo and clicks **Reject** with a note: "Please fix the typo in line 3 of the description"
8. Status returns to "Draft" and Editor is notified
9. Editor makes the fix (Version 5 created) and resubmits
10. Admin approves and clicks **Publish** (status becomes "Published")

### Scenario 2: Admin Schedules an Announcement

1. Admin creates a News article about an upcoming event
2. Sets the publication date to exactly 4 weeks before the event date
3. Sets **Publish At** to 9 AM on that date
4. Clicks **Save** (status becomes "Scheduled")
5. At 9 AM on the scheduled date, the system automatically publishes the article
6. Status changes to "Published"

### Scenario 3: Mistake in Published Content

1. A published Career page has outdated salary information
2. Admin opens the content, finds the wrong salary range was entered
3. Clicks on Version History and compares Version 8 (current/published) with Version 5 (before salary was updated last month)
4. Admin realises Version 5 had the correct salary, Version 6 introduced the error
5. Admin restores Version 5 (the correct version)
6. A new Version 9 is created (the restore action)
7. Admin adds a change note: "Restored correct salary range from Version 5; Version 6 contained erroneous data"
8. The page is now corrected and the correct salary is live

### Scenario 4: Collaborative Editing

1. Editor A creates a new Courses page and saves it (Version 1)
2. Editor B opens the same course, adds more details about NFQ level, and saves (Version 2)
3. Editor A re-opens the page and sees Version 2 is current
4. Editor A can view the version history to see what Editor B added
5. If Editor A disagrees with any changes, they can restore Version 1 or manually remove the unwanted changes

---

## Permissions Matrix: Statuses and Actions

| Action                   | Editor | Admin |
| ------------------------ | ------ | ----- |
| Create content           | ✓      | ✓     |
| Edit Draft content       | ✓      | ✓     |
| Save Draft               | ✓      | ✓     |
| Submit for Review        | ✓      | —     |
| Reject content           | —      | ✓     |
| Publish (immediate)      | —      | ✓     |
| Schedule publication     | —      | ✓     |
| Archive                  | —      | ✓     |
| Delete                   | —      | ✓     |
| View Version History     | ✓      | ✓     |
| Compare versions         | ✓      | ✓     |
| Restore previous version | —      | ✓     |

---

## Best Practices for Publishing

1. **Always use change notes for significant edits.** This helps team members understand the content evolution and prevents duplicate work.
2. **Review content before publishing.** Visit the public page after publishing to verify formatting, links, images, and layout.
3. **Use scheduled publishing for coordinated announcements.** This ensures content goes live at the right moment without manual intervention.
4. **Save often.** Every save creates a version snapshot. Frequent saves give you more granular undo options.
5. **Compare versions before restoring.** Ensure you are not losing important recent updates when reverting to an older version.
6. **Archive, do not delete.** Archived content is hidden from the public but preserved for reference. Deletion is permanent.
7. **Check rejection notes carefully.** When an Admin rejects your content, read the feedback thoroughly and address all points before resubmitting.
8. **Coordinate with team members.** Use change notes and version history to communicate what you changed and why, especially in a collaborative environment.
9. **Test links and imagery.** Before publishing, verify that all links work and images display correctly.
10. **Schedule critical announcements ahead of time.** Plan your content calendar and schedule important publications in advance so you are not rushing at the last minute.
