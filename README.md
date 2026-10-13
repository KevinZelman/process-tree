# Known Good Process Tree

- **Live app:** https://kevinzelman.github.io/process-tree/
- **Help center:** https://kevinzelman.github.io/process-tree/help.html

A free, interactive reference for running an IT help desk. It maps 63 standard operating procedures onto one question every technician has to answer first: *is this ours?* From there it walks a request all the way to a clean, copy-ready ticket.

It runs entirely in your browser. There is nothing to install, no account, and no data leaves the page.

## What's inside

| Piece | What it does | Jump straight there |
|---|---|---|
| **Intake map** | Every procedure on one map, grouped by area of responsibility and by support tier. Click a document to see its steps. | [Orbit](https://kevinzelman.github.io/process-tree/#orbit) · [Ledger](https://kevinzelman.github.io/process-tree/#ledger) · [Tiers](https://kevinzelman.github.io/process-tree/#tiers) |
| **Let's help a user** | A guided path from "what is this about?" to a resolved, recorded ticket: substance, ticket, screening, classification, priority, verification, resolution and close. | [#help-a-user](https://kevinzelman.github.io/process-tree/#help-a-user) |
| **Walk a ticket** | Start from what the person said ("locked out", "new phone", "printer") and get the category, owning tier, priority and the exact steps, or a clean redirect when it belongs to another department. | [#walk](https://kevinzelman.github.io/process-tree/#walk) |
| **Coverage** | How much of the catalogue is reachable, where decisions have no stated outcome, and which documents still have no owner. | [#coverage](https://kevinzelman.github.io/process-tree/#coverage) |
| **Help center** | Six self-service guides for the most common requests, each ending with exactly what to send if it didn't work. | [help.html](https://kevinzelman.github.io/process-tree/help.html) |

You can also open a single procedure directly, for example [`#sop/ACC-03`](https://kevinzelman.github.io/process-tree/#sop/ACC-03).

## Make it yours

The vocabulary is deliberately universal: Front Door technicians (Tier 1), Technical Support (Tier 2), Expert Technical (Tier 3), IT Management (Tier 4), "end users", "an internal knowledge base". It is written to fit education, healthcare, finance, nonprofits or any other organization.

To adapt it, fork this repository and edit the data files:

- `sop-graph.json` holds the procedures, their steps and links.
- `dispatch.js` holds the request types, ticket categories, tiers and priorities.
- `guided-path.js` holds the "Let's help a user" stages.
- `help.html` is a plain page; change the guides to match your tools.

Then turn on GitHub Pages for your fork (Settings → Pages → deploy from the `main` branch, root folder).

Redirection is intentionally general. When a request belongs to HR, Finance, Facilities or Security, the app tells the technician to hand it off, not where to send it. That is what an up-to-date staff directory is for.

## Discuss it

The full SOP catalogue, with a PDF for each procedure, is posted in the Known Good Discord community. Questions and suggestions are welcome there or as issues on this repository.

## License

Content and code are licensed under [Creative Commons Attribution 4.0](https://creativecommons.org/licenses/by/4.0/). Use it, adapt it, share it; credit Kevin Zelman.

Built by [Kevin Zelman](https://kevinzelman.github.io/).
