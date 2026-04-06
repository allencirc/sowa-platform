/**
 * Account lockout configuration.
 * After MAX_FAILED_ATTEMPTS consecutive failed logins the account
 * is locked for LOCKOUT_DURATION_MS milliseconds.
 * A successful login resets the counter and clears any active lock.
 */

/** Number of consecutive failed login attempts before the account is locked. */
export const MAX_FAILED_ATTEMPTS = 5;

/** Duration of the lockout window in milliseconds (15 minutes). */
export const LOCKOUT_DURATION_MS = 15 * 60 * 1000;
