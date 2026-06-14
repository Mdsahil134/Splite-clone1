# prompts.md

Chronological record of AI prompts used to build the Splitwise Clone.

---

## Prompt 1 — Project scaffold & BUILD_PLAN

**Goal:** Create the full application from a simplified BUILD_PLAN.

**Prompt (summary):**

```
splitwise-clone/
backend/ (users, groups, expenses, settlements, manage.py)
frontend/ (pages, components, api, context, package.json)

BUILD_PLAN.md phases:
- Phase 1: Auth (register, login)
- Phase 2: Groups (create, add members)
- Phase 3: Expenses (equal split)
- Phase 4: Balances + dashboard
- Phase 5: Debt settlement
- Phase 6: Deployment (Render + Vercel)

Tech: Django + DRF, React + TailwindCSS, PostgreSQL
```

**AI output:** Full project scaffold — Django backend with JWT auth, 4 REST apps, equal-split expense logic, balance/settlement services, React SPA with Login/Register/Dashboard/Groups/GroupDetail pages, TailwindCSS styling, `README.md`, `BUILD_PLAN.md`, env examples, `render.yaml`, `vercel.json`.

---

## Prompt 2 — README enhancement

**Goal:** Improve setup documentation for local development.

**Prompt:**

```
README.md
```

**AI output:** Expanded README with features table, tech stack, project structure, prerequisites, step-by-step backend/frontend setup (including Windows venv activation for MSYS2 and PowerShell), environment variable tables, API endpoint reference, and deployment notes.

---

## Prompt 3 — Complete documentation set

**Goal:** Add remaining project documentation files.

**Prompt:**

```
README.md
BUILD_PLAN.md
AI_CONTEXT.md
prompts.md
add rest of files
```

**AI output:** `AI_CONTEXT.md` (single source of truth for architecture, schema, APIs, business rules) and this `prompts.md` file.

---

## Prompting strategy used

1. **Start with BUILD_PLAN** — define phases and success criteria before coding.
2. **Provide folder structure** — explicit directory layout reduces guesswork.
3. **One phase at a time** — scaffold prompt covered all phases; acceptable for a greenfield MVP.
4. **Iterate on docs** — README first, then AI_CONTEXT for rebuildability.
5. **Record decisions** — AI_CONTEXT.md captures tradeoffs and out-of-scope items.

## Tips for future prompts

- Attach `AI_CONTEXT.md` when asking for new features so the AI respects existing conventions.
- Specify exact file paths: e.g. "add `expenses/views.py` endpoint for DELETE".
- Call out what is **out of scope** to prevent over-engineering.
- Ask for incremental changes after MVP: "add unequal split support per AI_CONTEXT Expense Engine section".
