# Validation scope

The standalone checks exercise the 243-source-entry catalog, time budgets, missed-day continuation, completion rules, and payload validation. The optional local API checks exercise durable save/read, optimistic concurrency, and input/origin rejection, restoring the initial local record afterward. Production starts with no study ticks.

Commands: `node scripts/check-study.mjs --api`, `npx tsc --noEmit`, `npm run build`.

The UI uses accessible checkbox, tab, select and progress primitives. Browser click-through, DOM inspection and screenshot QA were not performed: they were not requested. Optional WebMCP registration uses the same study actions as the UI, but no supported WebMCP browser context was available for registration/list/invoke validation; this remains an explicit validation gap, not a claim of end-to-end verification.

Topic times are author estimates for a first pass, not teacher runtimes or a guarantee. Exam/application dates are linked to the official ÖSYM announcement. Source content was provided by the user.
