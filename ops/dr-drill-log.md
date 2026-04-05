# DR Drill Log

Operational record of disaster-recovery drills for the SOWA OWE Platform.
Referenced by `docs/disaster-recovery.md` §5.

Drills required:

| Drill | Cadence | Automated? |
|-------|---------|------------|
| PITR of a single record | Quarterly | Manual |
| Full dump restore into scratch Neon project | Every 6 months | Manual |
| Application rollback on Vercel | Quarterly | Manual |
| Regional failover tabletop | Annually | Manual |
| Backup-restore verification | Weekly | Automated — `.github/workflows/restore-drill.yml` |

Automated weekly drill runs are recorded in GitHub Actions run history; only exceptions, manual drills, and follow-up actions are captured below.

---

## Log

| Date | Drill type | Operator | Outcome | Duration | Remediation / Notes |
|------|------------|----------|---------|----------|---------------------|
| _(pending — first production drill scheduled for the week after environment cutover)_ | | | | | |

---

## Entry template

When recording a new drill, append a row to the table above and include a
short narrative below if the drill was non-trivial or required remediation:

```
### YYYY-MM-DD — <drill type>

- **Operator:** <name / role>
- **Runbook reference:** docs/disaster-recovery.md §<section>
- **Start / end:** HH:MM UTC → HH:MM UTC
- **Target:** <e.g. Neon branch restored from 2026-04-05T02:00 dump>
- **Result:** success | partial | failure
- **Row counts (restored vs prod):**
- **Issues encountered:**
- **Remediation:**
- **Next action owner:**
```
