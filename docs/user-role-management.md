# User & Role Management

This guide is for platform Admins responsible for managing user accounts and assigning roles. It covers creating and editing users, understanding the three role types and their permissions, when to use each role, onboarding new team members, and password management.

---

## The Three Roles

The SOWA platform has three user roles, each with distinct permissions. Choose the right role based on the person's responsibilities and the level of access they need.

| Role       | Purpose                                                           | Can Create Content | Can Publish | Can Manage Users | Can Export Data | Can Delete |
| ---------- | ----------------------------------------------------------------- | ------------------ | ----------- | ---------------- | --------------- | ---------- |
| **Admin**  | Full platform access. Manage content, users, and data.            | ✓                  | ✓           | ✓                | ✓               | ✓          |
| **Editor** | Create and edit content. Submit for review.                       | ✓                  | Submit only | ✗                | ✗               | ✗          |
| **Viewer** | Read-only access. View content and registrations but cannot edit. | ✗                  | ✗           | ✗                | ✗               | ✗          |

### Admin Role

**Use Admin when:**

- The person is responsible for final approval and publishing of content
- The person needs to manage other users (create, edit, delete accounts)
- The person needs to export registration data or generate reports
- The person oversees the overall platform strategy and quality control

**Responsibilities:**

- Review content submitted by Editors for quality and accuracy
- Publish or reject content
- Manage user accounts
- Monitor registrations and export data for events and courses
- Ensure consistent tone, terminology, and domain accuracy across the platform
- Archive or delete content when necessary

**Permissions:**

- Create, edit, publish, and delete content without review
- Schedule content for future publication
- Access user management (create, edit, delete users)
- View and export registration data
- View version history and restore previous versions
- Confirm or cancel registrations

**Typical Users:** Skillnet platform coordinators, content leads, communications managers

### Editor Role

**Use Editor when:**

- The person creates and maintains content but does not have final approval authority
- The person should not have access to user management or sensitive data
- The person is a domain expert (e.g. career advisor, course researcher) contributing specific content

**Responsibilities:**

- Research and write career, course, event, news, and research content
- Maintain content accuracy and relevance
- Format content according to platform standards
- Submit content for Admin review

**Permissions:**

- Create and edit content (all types)
- Save content as Draft
- Submit content for review
- View and edit their own content
- View version history of content they created
- View registrations (read-only) for their own content

**Limitations:**

- Cannot publish content directly (must submit for review)
- Cannot view or manage users
- Cannot export registration data
- Cannot delete or archive content
- Cannot restore previous versions

**Typical Users:** Content writers, subject matter experts, researchers, event coordinators

### Viewer Role

**Use Viewer when:**

- The person needs visibility into content and registrations but should not make any changes
- The person is a stakeholder who wants to monitor the platform without edit access
- The person is external (e.g. partner organisation) who should only see data, not modify it

**Responsibilities:**

- Monitor published content
- Review registrations for events and courses they care about
- Provide feedback to Admins or Editors on content accuracy

**Permissions:**

- View all published content
- View registrations (read-only)
- View version history (read-only)

**Limitations:**

- Cannot create or edit any content
- Cannot publish content
- Cannot manage users
- Cannot export data
- Cannot delete or archive content

**Typical Users:** Stakeholders, advisors, reporting contacts, external partners

---

## Creating a New User

Only Admins can create user accounts.

**Steps:**

1. Go to **Users** in the sidebar
2. Click **Create User** (top right)
3. Fill in the form:
   - **Email** — Must be unique; used for login. Use the person's official email address (e.g. name@skillnet.ie or name@organisation.ie)
   - **Name** — Full name as it will appear in version history and user listings
   - **Password** — Set an initial password (minimum 8 characters). Use a strong password with letters, numbers, and special characters
   - **Role** — Choose Admin, Editor, or Viewer (see section above)
4. Click **Create**

**After Creating:**

- Send the new user their email address and temporary password via a secure channel (e.g. encrypted email, in-person, phone)
- Advise them to change their password immediately after first login
- Share this documentation with them (provide links to the admin guide and relevant role guides)
- If they are an Editor, share the content-type guides; if an Admin, share the full admin documentation

### Initial Password Best Practices

- Use a randomly generated password (e.g. from a password manager) rather than a simple one
- Make the initial password temporary; require the user to change it on first login
- Do not reuse passwords from other systems
- Do not email passwords in plain text; use an encrypted channel or share verbally

---

## Editing a User

Only Admins can edit user accounts.

**To edit a user:**

1. Go to **Users** in the sidebar
2. Find the user in the list (use the search bar if needed)
3. Click **Edit**
4. Update any of the following:
   - **Name** — Change the display name
   - **Email** — Change the email address (must remain unique)
   - **Password** — Set a new password (the user does not need the old password to reset it)
   - **Role** — Change the user's role (e.g. from Editor to Admin)
5. Click **Save**

**Considerations:**

- Changing a user's email address does not log them out of the current session; they will use the new email for future logins
- Changing a user's role takes effect immediately; they will see different navigation and permissions on next page load
- If you change a user's password without their knowledge, inform them of the new temporary password and advise them to change it immediately
- If a user requests a password reset, generate a new temporary password, inform them securely, and advise them to change it

---

## Deleting a User

Only Admins can delete user accounts.

**To delete a user:**

1. Go to **Users** in the sidebar
2. Find the user
3. Click **Delete**
4. A confirmation dialog appears: "Are you sure? If this user has created content versions, you cannot delete them."
5. If you can proceed, click **Confirm**

**Important Limitation:**
You cannot delete a user if they have created content versions (version snapshots). This is a safety measure to preserve the integrity of version history. If you see this error:

- Archive or delete the content they created first (which removes their version entries)
- Or reassign the content to another user (if the system supports it; otherwise, you must delete or archive the content)
- Then attempt to delete the user again

**When to Delete:**

- The person has left the organisation
- A temporary or test account is no longer needed
- An account was created by mistake

**Caution:** Deletion is permanent. Consider disabling or downgrading a user's role to Viewer instead if they may return or if you want to preserve a record of their access.

---

## Onboarding a New Team Member

Follow this checklist when bringing a new Skillnet staff member onto the platform:

### 1. Determine the Role (Admin, Editor, or Viewer)

Ask yourself:

- Does this person need to publish content, manage users, and export data? → **Admin**
- Does this person create or edit content? → **Editor**
- Does this person only need to view content and registrations? → **Viewer**

### 2. Create the Account

1. Create a new user account with the person's email and a temporary password
2. Share the login credentials via a secure channel (not email)
3. Ask them to change their password immediately after first login

### 3. Provide Documentation

**For all roles:**

- Admin User Guide (overview of the platform)
- This user-role-management guide (for context on permissions)

**For Editors:**

- Content-Type Guides (detailed field explanations for each content type)
- Publishing Workflow guide (how to submit for review)
- Media Library guide (how to upload and use images)

**For Admins:**

- All documentation listed above
- Publishing Workflow guide (how to publish, reject, and schedule)
- Registrations & CSV Export guide (how to manage registrations)
- Diagnostic Tool guide (if they will oversee the self-assessment tool)

**For Viewers:**

- Admin User Guide (overview only)
- A brief orientation on how to view content and registrations

### 4. Walk Through Key Workflows

**For Editors:**

- Show them how to create a new piece of content (e.g. Career, Course, or Event)
- Demonstrate how to submit for review
- Show them how to use the media library

**For Admins:**

- Show them the dashboard and navigation
- Demonstrate publishing a piece of content
- Show them how to manage users
- Demonstrate exporting registration data

**For Viewers:**

- Show them where to find content
- Show them how to filter and search registrations

### 5. Set Up Communication

- Add their email to relevant team communication channels (email, Slack, etc.)
- Provide contact information for technical support or questions about the platform
- Schedule a follow-up check-in after a few days to see if they have questions

### 6. First Content Task

For Editors and Admins, assign a small first task to familiarise them with the workflow:

- "Create a new Career listing for [specific role]"
- "Create an Event for [upcoming event]"
- "Publish the News article about [announcement]"

Give them a checklist (see "Training Materials & Refresher Guides" document for examples) and have them walk you through their work.

---

## Password Management

The SOWA platform uses secure password storage. Users can manage their own passwords, and Admins can reset passwords when needed.

### For Users: Changing Your Own Password

Users can change their password themselves (this feature may be available in Account Settings; check with your Admin if unsure).

**Best Practices:**

- Change your password regularly (every 3–6 months)
- Use a strong password: at least 8 characters, including letters, numbers, and special characters
- Do not share your password with colleagues
- Do not reuse passwords from other systems
- If you suspect your account has been compromised, change your password immediately and notify an Admin

### For Admins: Resetting a User's Password

If a user forgets their password or if you need to reset it (e.g. for security reasons):

1. Go to **Users** in the sidebar
2. Find and click **Edit** next to the user
3. In the **Password** field, enter a new temporary password
4. Click **Save**
5. Share the new temporary password with the user securely (encrypted email, phone, in-person)
6. Instruct them to change the password immediately after logging in

**Password Reset Best Practices:**

- Never email passwords in plain text
- Use a secure channel (phone, encrypted message, or in-person)
- Inform the user that the password is temporary and must be changed
- Document the password reset in your records (for audit purposes if needed)

### Password Policy

The platform enforces the following password requirements:

- Minimum 8 characters
- At least one letter and one number (recommended)
- Special characters allowed (recommended)

Encourage all users to use passwords that are strong and not used elsewhere.

---

## Troubleshooting User Issues

| Issue                                             | Solution                                                                                                                                                                          |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| User cannot log in                                | Check that the email address is correct. Ask if they are using the right password. If they forgot the password, reset it (see above). Verify their account has not been disabled. |
| User role changed but permissions haven't updated | Have them log out and log back in. Browser cache may require a refresh. If persists, contact the system administrator.                                                            |
| "Cannot delete user" error                        | The user has created content versions. Archive or delete the content first, then retry.                                                                                           |
| New user did not receive onboarding email         | Onboarding may be manual. Share the admin guide and relevant documentation via your usual channels.                                                                               |
| User accidentally created a duplicate account     | Create the duplicate account as an Admin and delete it, or contact the system administrator if you cannot delete it.                                                              |
| User's email needs to change                      | Edit the user and update the email field. Inform them of the new email address to use for login.                                                                                  |

---

## Permissions Summary Table

| Task                         | Admin | Editor | Viewer |
| ---------------------------- | ----- | ------ | ------ |
| Create content               | ✓     | ✓      | ✗      |
| Edit own content             | ✓     | ✓      | ✗      |
| Edit others' content         | ✓     | ✗      | ✗      |
| Publish directly             | ✓     | ✗      | ✗      |
| Submit for review            | ✓     | ✓      | ✗      |
| Reject content               | ✓     | ✗      | ✗      |
| View registrations           | ✓     | ✓      | ✓      |
| Export registrations         | ✓     | ✗      | ✗      |
| Confirm/cancel registrations | ✓     | ✗      | ✗      |
| View version history         | ✓     | ✓      | ✓      |
| Restore versions             | ✓     | ✗      | ✗      |
| Create users                 | ✓     | ✗      | ✗      |
| Edit users                   | ✓     | ✗      | ✗      |
| Delete users                 | ✓     | ✗      | ✗      |
| Upload media                 | ✓     | ✓      | ✗      |
| Delete media                 | ✓     | ✓      | ✗      |
| Access analytics             | ✓     | ✗      | ✗      |

---

## Key Principles

1. **Principle of Least Privilege:** Give each user only the access they need to do their job. Do not grant Admin access to users who only need to edit content.
2. **Separation of Duties:** Editors create content; Admins review and publish. This ensures quality control and prevents accidental or unauthorized publication.
3. **Regular Review:** Quarterly, review your user list and disable or delete accounts for people who have left the organisation.
4. **Documentation:** When you create a new user, document their role and responsibilities. This helps with onboarding and auditing.
5. **Secure Passwords:** Enforce strong passwords and educate users about security. Do not share or reuse passwords across systems.
