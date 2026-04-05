-- Force rotation of the seeded default admin password on first login.
ALTER TABLE "users" ADD COLUMN "mustChangePassword" BOOLEAN NOT NULL DEFAULT false;

-- Any pre-existing admin account still sitting on the documented default
-- (`admin@sowa.ie`) is flagged so that the next login is forced through
-- the password-change flow.
UPDATE "users" SET "mustChangePassword" = true WHERE "email" = 'admin@sowa.ie';
