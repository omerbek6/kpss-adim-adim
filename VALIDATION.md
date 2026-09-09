# Validation scope

The standalone checks exercise the 243-source-entry catalog, time budgets, missed-day continuation, completion rules, and payload validation. The optional local API checks exercise durable save/read, optimistic concurrency, and input/origin rejection, restoring the initial local record afterward. Production starts with no study ticks.

The mixed-program update preserves existing production records and appends no SQL migrations. It upgrades only today's legacy plan in memory while retaining all completed steps and historical plans; the next ordinary save persists the new shape. Checks also cover the six-study-day subject rotation, 25/50/100/240/360-minute limits, spaced review intervals, exam substitution, final-days review, legacy payload compatibility, and switching programs without clearing ticks. Future plans are not prefilled or silently marked complete. Research supports general spacing/retrieval principles, not these exact daily allocations or an 80-point guarantee.

Commands: `node scripts/check-study.mjs --api`, `npx tsc --noEmit`, `npm run build`.

The UI uses accessible checkbox, tab, select and progress primitives. Browser click-through, DOM inspection and screenshot QA were not performed: they were not requested. Optional WebMCP registration uses the same study actions as the UI, but no supported WebMCP browser context was available for registration/list/invoke validation; this remains an explicit validation gap, not a claim of end-to-end verification.

Topic times are author estimates for a first pass, not teacher runtimes or a guarantee. Exam/application dates are linked to the official ÖSYM announcement. Source content was provided by the user.

## iPhone companion update

The home-screen app includes a credentialed standalone manifest, generated PNG icons, Apple metadata, safe-area navigation, a persisted wall-clock timer, focus-session logs, topic notes/revisit flags, net-based exam records, progress summaries and an iPhone installation guide. Existing study JSON fields and the production SQL schema remain unchanged; new companion fields are optional and validated. The database is not reset or seeded.

`node scripts/check-companion.mjs --api` checks timer pause/resume/expiry arithmetic, enriched and legacy payload validation, invalid score rejection, net totals, icon dimensions, manifest/Apple metadata, local round-trip persistence and stale-write rejection. Its service-worker simulation verifies that only a marker-checked generic offline page is cached and API requests are not intercepted. It restores the original local record. These are unit/API checks, not actual iPhone installation or browser click-through tests.

Private HTML and study API responses are not service-worker cached. Offline records/editing and background notifications are intentionally not implemented. The timer recalculates from saved timestamps; an iPhone background alarm is not promised. Saved timer time is elapsed time confirmed by the user, not proof of attention or topic completion. The original WebMCP browser-context validation gap remains.
