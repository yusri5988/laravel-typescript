# Hono Laravel Workspace Rule

This rule is always applicable to work in this repository.

Before planning, reviewing, or editing code, read and follow @../../AGENTS.md in full. That file is the single source of truth for project architecture, implementation workflow, verification, language, and safety rules.

Key non-negotiable constraints:

- Persistent features follow Route -> Request -> Controller -> Service -> Repository -> Drizzle -> D1.
- Controllers and routes never access the database.
- External input is validated with dedicated Zod request schemas.
- Authentication and authorization are separate; data access is deny-by-default.
- Preserve unrelated user changes and do not perform remote, destructive, deployment, push, or data operations without explicit approval.
- Inspect the closest existing module before introducing files or patterns.
- Run relevant verification and report actual results before claiming completion.

Do not duplicate the full architecture in this file. If this rule and `AGENTS.md` ever differ, `AGENTS.md` is authoritative.
