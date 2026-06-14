# AI_USAGE.md

Disclosure of AI tool usage during development of the Splitwise Clone.

_Author: Md Sahil | Last updated: 2026-06-15_

---

## Summary

AI coding assistants (Cursor IDE with Claude) were used to accelerate initial scaffolding, documentation, and iterative improvements. All AI-generated code was reviewed, tested manually, and integrated into the project by the author. Business logic, scope boundaries, and final architectural choices were guided by the author via prompts and review.

---

## Tools Used

| Tool | Purpose |
|------|---------|
| **Cursor IDE** | Primary development environment with integrated AI assistant |
| **Claude (via Cursor)** | Code generation, documentation, README expansion |

No AI was used for runtime/production features (no LLM APIs in the application itself).

---

## What AI Helped With

### 1. Initial project scaffold (2026-06-12)

**Prompt goal:** Build full-stack app from `BUILD_PLAN.md` phases.

**AI generated:**
- Django backend: `users`, `groups`, `expenses`, `settlements` apps
- JWT auth, REST serializers, views, URL routing
- Equal-split expense logic in `expenses/serializers.py`
- Balance engine in `settlements/services.py`
- React frontend: Login, Register, Dashboard, Groups, GroupDetail pages
- TailwindCSS styling, Axios API client, AuthContext
- Deployment configs: `render.yaml`, `vercel.json`, env examples

**Author role:** Defined folder structure, tech stack, phases, and success criteria in the prompt.

### 2. README enhancement (2026-06-12)

**Prompt goal:** Improve setup documentation.

**AI generated:**
- Expanded setup steps (Windows MSYS2/PowerShell venv notes)
- Environment variable tables
- API endpoint reference
- Deployment instructions

**Author role:** Requested README improvements; verified commands on local machine.

### 3. Documentation set (2026-06-12 – 2026-06-15)

**Prompt goal:** Complete project documentation for portfolio submission.

**AI generated:**
- `AI_CONTEXT.md` — architecture, schema, business rules
- `prompts.md` — chronological prompt record
- `SCOPE.md`, `DECISIONS.md`, `AI_USAGE.md`, `FILE_IMPORT_REPORT.md`

**Author role:** Requested specific files; content reflects actual implemented codebase.

---

## What Was Written Without AI

- Manual testing of all user flows (register, groups, expenses, balances, settlements)
- Environment configuration (`.env` values for local dev)
- Deployment account setup (Render, Vercel) — if deployed by author
- Final review and acceptance of generated code

---

## AI Limitations Encountered

| Issue | How it was handled |
|-------|-------------------|
| Windows venv path differences (MSYS2 vs PowerShell) | Documented in README after local testing |
| Scope creep (AI may suggest extra features) | Explicit out-of-scope list in prompts and `SCOPE.md` |
| No automated tests generated | Accepted for MVP; noted as future work |

---

## Prompting Strategy

1. **Start with BUILD_PLAN** — phases and success criteria before code.
2. **Provide explicit folder structure** — reduces incorrect file placement.
3. **Reference AI_CONTEXT.md** for follow-up features — keeps conventions consistent.
4. **Call out out-of-scope items** — prevents over-engineering.
5. **Record prompts** — see [prompts.md](./prompts.md) for full history.

---

## Academic Integrity Statement

AI was used as a development assistant, similar to using Stack Overflow, documentation, or pair programming. The author:

- Understands the codebase structure and business logic
- Can explain balance calculation, equal split, and JWT auth flow
- Reviewed and owns all committed code
- Discloses AI usage transparently in this document

---

## Related Files

- [prompts.md](./prompts.md) — Full chronological prompt log
- [AI_CONTEXT.md](./AI_CONTEXT.md) — Technical source of truth
- [DECISIONS.md](./DECISIONS.md) — Rationale for architectural choices
