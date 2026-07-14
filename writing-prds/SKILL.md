---
name: writing-prds
description: Write or review a PRD (product requirements doc), feature spec, or acceptance criteria with ASSERTABLE, machine-verifiable criteria tied to the agentic test pipeline. Use this whenever the user is drafting a PRD, writing a feature spec, defining what a new feature should do, listing acceptance criteria, or planning how a feature will be tested and verified — even if they just say "write up the requirements", "spec this out", "what should the acceptance criteria be", or "plan this feature" without saying the word PRD. Applies across all Laravel + Inertia + React projects (feedguardians, grandranker, marqetir). The whole point: every criterion must be provable by a test or dev-browser assertion so that after implementation we can prove the feature works and that nothing else broke.
---

# Writing PRDs with Assertable Criteria

## Why this skill exists

The agentic workflow is **PRD → implement → prove it works → done.** That last step only works if the PRD said *exactly* what "works" means. A criterion like "competitor adding works" is unprovable — there's nothing to assert, so the model can fool itself with a screenshot that merely *looks* okay and declare victory.

This skill makes every acceptance criterion an **assertable statement**: a concrete, observable fact a test (or dev-browser) can check and return pass/fail with no judgement call. The bulk of criteria are proven by a fast automated suite (the regression net that proves nothing *else* broke); a thin top layer uses dev-browser to drive the new feature's real buttons.

**The rule:** if you can't write the assertion that proves a criterion, the criterion isn't done being written.

---

## The job

1. Receive a feature description from the user
2. Ask 3–5 essential clarifying questions (with lettered options)
3. Generate a structured PRD based on answers
4. Save to `tasks/prd-[feature-name].md`
5. Create a spec file in `specs/features/<category>/` (pick the right subdirectory — platform, foundation, marketplace, etc.) with `Status: planned` at the top. Add a row for it in `specs/README.md` under the matching section. The spec summarizes the feature's purpose, scope, data model changes, routes, and key decisions — so future agents can see what's planned/built at a glance without reading code.

**Do NOT start implementing. Just create the PRD.**

---

## Step 1: Clarifying questions

Ask only critical questions where the initial prompt is ambiguous. Focus on:

- **Problem/Goal:** What problem does this solve?
- **Core Functionality:** What are the key actions?
- **Scope/Boundaries:** What should it NOT do?
- **Success Criteria:** How do we know it's done?

Format with lettered options so the user can reply "1A, 2C, 3B":

```
1. What is the primary goal of this feature?
   A. Improve user onboarding experience
   B. Increase user retention
   C. Reduce support burden
   D. Other: [please specify]

2. Who is the target user?
   A. New users only
   B. Existing users only
   C. All users
   D. Admin users only

3. What is the scope?
   A. Minimal viable version
   B. Full-featured implementation
   C. Just the backend/API
   D. Just the UI
```

Skip questions the initial prompt already answers clearly.

---

## Step 2: PRD structure

### 1. Introduction/Overview
Brief description of the feature and the problem it solves.

### 2. Goals
Specific, measurable objectives (bullet list).

### 3. User Stories
Each story must be small enough to implement in one focused session.

**Format:**

```markdown
### US-001: [Title]
**Description:** As a [user], I want [feature] so that [benefit].

**Acceptance Criteria:**
- [feature] After POST /things with {name:"Acme"}, a row scoped to the current
  organization_id exists and Inertia props contain the new row.
- [browser] Submitting "Acme" in the Add form adds a row to #things-table,
  shows toast "Thing added", and logs zero console errors.

**Verification:**
- New tests to add: <feature/unit/vitest files>
- dev-browser flow: <click-path with specific data values>
- Regression risk: <existing flows this could break>
```

### 4. Functional Requirements
Numbered, referenceable list separate from stories:
- "FR-1: The system must allow users to..."
- "FR-2: When a user clicks X, the system must..."

Be explicit and unambiguous. Implementation plans reference these by number.

### 5. Non-Goals (Out of Scope)
What this feature will NOT include. Critical for managing scope creep.

### 6. Design Considerations (optional)
UI/UX requirements, mockups, existing components to reuse.

### 7. Technical Considerations (optional)
Known constraints, integration points, performance requirements.

### 8. Success Metrics
Product-level measures (not test assertions — those live in acceptance criteria):
- "Reduce time to complete X by 50%"
- "Users can do Y in under 2 clicks"

### 9. Open Questions
Remaining questions or areas needing clarification. Explicit parking lot — better here than buried in Slack.

### 10. Verification Checklist

This is the final section of every PRD. The PRD author **fills it out per-feature** — not copy-pasted blindly. Each item must name the specific thing being verified for *this* feature. If a layer doesn't apply (e.g. no new fields), mark it N/A with a reason.

The checklist has two parts: **per-change coverage** (proves each change works across all layers) and **suite gates** (proves nothing else broke).

```
## Verification Checklist

### Per-change coverage

For each change in this feature (new field, new page, new filter, new action, etc.),
every applicable layer must have at least one acceptance criterion covering it.

**[Change 1: e.g. "Add priority field to task form"]**
- [ ] **Frontend**: field exists in correct form position, correct input type, label, placeholder
- [ ] **Validation**: required/optional rule, min/max/format, error message shown via <InputError>
- [ ] **Backend storage**: value stored in correct column with correct type after submit
- [ ] **Round-trip**: submit → save → reload page → field shows the saved value
- [ ] **Edge cases**: empty submission, max length, special characters, boundary values
- [ ] **Org scoping**: data scoped to organization_id (N/A if not tenant data — state why)

**[Change 2: e.g. "Add priority filter to task list"]**
- [ ] **Frontend**: filter control exists, correct options, correct position
- [ ] **Validation**: invalid filter value handled gracefully
- [ ] **Backend**: filtered query returns correct subset (divergent-data rule: assert count differs)
- [ ] **Round-trip**: apply filter → URL param set → refresh → filter still applied, same results
- [ ] **Edge cases**: no results (empty state shown), clear filter restores full list
- [ ] **Org scoping**: filtered results still scoped to current org

(Repeat for each distinct change in the feature.)

### Test data setup

Before browser verification, seed the local database with data that makes every criterion
provable. The PRD must define exactly what data is needed — don't rely on whatever happens
to exist.

- [ ] **Seed command or tinker snippet**: list the exact records to create (models, counts,
      field values). Use factories or `php artisan tinker` — never manual SQL.
- [ ] **Divergent data**: for filters/search, seed records that produce DIFFERENT counts
      per filter value (e.g. 8 medium-priority + 3 high-priority + 1 low-priority — not
      all the same value).
- [ ] **Edge-case data**: at least one record per edge case (empty string, max length,
      special characters, null optional fields, boundary values).
- [ ] **Multi-org data**: if tenant-scoped, seed records in BOTH org A and org B to prove
      cross-org isolation (org B's data must never appear for org A's user).
- [ ] **Cleanup**: note whether seeded data persists or should be removed after verification.

Example:
```php
// Seed via tinker before browser tests
$org = Organization::find(1);
Task::factory()->count(8)->for($org)->create(['priority' => 'medium']);
Task::factory()->count(3)->for($org)->create(['priority' => 'high']);
Task::factory()->count(1)->for($org)->create(['priority' => 'low']);
// Org B data (must NOT appear for org A user)
Task::factory()->count(2)->for(Organization::find(3))->create(['priority' => 'high']);
```

### Browser end-to-end

- [ ] Test data seeded per the setup above
- [ ] Every [browser]-tagged criterion driven in dev-browser:
      DOM asserted, zero console errors, network 2xx
- [ ] Full happy-path walkthrough: start to finish with the seeded data
- [ ] Screenshot captured for visual changes (layout, new components, modals)

### Suite gates

- [ ] `php artisan test` passes (whole-app regression net)
- [ ] `npm run test` (Vitest) passes
- [ ] `npm run types` passes
- [ ] `npm run lint` passes
- [ ] Evidence reported: test output + dev-browser assertions, not "looks good"
```

**The rule for PRD authors:** scan every user story. For each concrete change it introduces (a new field, a new button, a new page, a new filter, a new column), add a coverage block. If a user story doesn't have full-stack coverage across the layers above, acceptance criteria are missing — go back and add them.

---

## Writing assertable criteria

Every criterion describes **act → observable result**, where the result is something code can read:

> After **\<specific action with specific data\>**, **\<specific observable thing\>** is true.

The observable thing must be one of these four, strongest → weakest:

1. **DOM / text state** — a row exists, a count changed, text is visible, an element is gone
2. **HTTP outcome** — status code, redirect target, Inertia prop value, DB row created/updated
3. **Console / network** — no JS errors after the action, request returned 2xx
4. **Visual** — layout, chart rendered, modal visible *(weakest — use only when DOM can't tell you)*

If the "observable thing" is a feeling ("works", "is fast", "looks good"), rewrite it until it's one of the four above. The litmus test: *"What exact line of code would assert this, and what specific data makes it pass vs fail?"* If you can't answer, it isn't assertable yet.

### Bad → Good

| Not assertable | Assertable |
|---|---|
| "Adding a competitor works" | "After submitting name `Acme` in the Add form, a row containing `Acme` appears in `#competitors-table` and a toast reading `Competitor added` is shown." |
| "Validation is handled" | "Submitting with an empty name shows an `<InputError>` with text `The name field is required.` and sends no network request." |
| "The filter works" | "Selecting status `Active` reduces the table from 12 rows to 3, and every visible row shows an `Active` badge." |
| "Deleting works" | "Clicking Delete on row `Acme`, then confirming, removes that row; the header count drops from 4 to 3; the `DELETE` request returns 200." |
| "Page loads correctly" | "Visiting `/competitors` returns 200, renders the `Competitors/Index` Inertia page, and the console has zero errors." |
| "Only my org's data shows" | "A user in org A sees exactly the 2 records belonging to org A; a record from org B is never present in the response." |

### The divergent-data rule

A filter/search/sort criterion is only meaningful if the asserted result **differs** from the unfiltered result. If "all" returns 5 and the filter also returns 5, the filter might be broken and the check still passes. Every such criterion must name a value that returns a **different (smaller) count** and assert the count *changed*:

> "With 12 total records, selecting `Tracked = yes` shows exactly 4 rows (not 12)."

Never "selecting a filter shows the filtered results" — that asserts nothing.

---

## Verification layer tags

Each criterion gets a tag saying **how it will be proven**:

| Tag | Layer | Use for | Speed |
|---|---|---|---|
| `[feature]` | PHP Feature test (`tests/Feature`) | HTTP/Inertia behaviour, auth, validation, **org scoping**, DB writes, jobs dispatched | fast |
| `[unit]` | PHP Unit test (`tests/Unit`) | pure service logic — scoring, formatting, calculations | fast |
| `[vitest]` | Vitest (`resources/js`) | component render/interaction logic in isolation | fast |
| `[browser]` | dev-browser | the new feature's real buttons/actions end-to-end; visual rendering | slow |

**Default the bulk to `[feature]` / `[vitest]`** — that's the regression net, runs in seconds, proves nothing else broke. Most criteria can be proven at `[feature]` level via Inertia assertions without a browser; prefer that. Reserve `[browser]` for the new feature's actual click-paths and anything that must visually render.

Org-scoping / multi-tenant criteria are **mandatory** for any feature touching tenant data and are always `[feature]`.

### Tagged example

```
US-3: Manage tracked competitors

Acceptance Criteria:
- [feature] POST /competitors with {name:"Acme"} creates a row scoped to the current
  organization_id and redirects back with the row present in Inertia props.
- [feature] POST /competitors with {name:""} returns validation error "name required",
  creates no row.
- [feature] A user in org A requesting /competitors never receives org B's competitors.
- [vitest] <CompetitorRow> renders a "Tracked" badge when competitor.tracked === true.
- [browser] Submitting "Acme" in the Add form adds a row with "Acme" to #competitors-table,
  shows toast "Competitor added", and logs zero console errors.
- [browser] Selecting Tracked=yes with 12 total competitors shows exactly 4 rows.
```

---

## The dev-browser verification protocol

For every `[browser]` criterion, dev-browser follows this order. **The assertion is the check; the screenshot is only evidence.**

1. **Act** — click / fill / submit with the specific data named in the criterion.
2. **Assert DOM/state** — read the page, verify the named observable (row present, count changed, text visible, element gone). This is the pass/fail.
3. **Assert no console errors** — catches JS exceptions Inertia swallows.
4. **Assert network outcome** — the mutation returned 2xx and landed on the expected URL.
5. **Screenshot — only if the criterion is visual** (chart, layout, modal). One screenshot at the milestone, not one per click.

---

## Writing for the reader

The PRD reader may be an AI agent or junior developer. Therefore:

- Be explicit and unambiguous — no assumed context
- Avoid jargon or explain it inline
- Number requirements (FR-N) for easy reference
- Use concrete examples where helpful
- Name specific data values, not placeholders

---

## Authoring checklist (run before calling a PRD ready)

- [ ] Asked clarifying questions with lettered options (or skipped — prompt was unambiguous).
- [ ] Every acceptance criterion names **specific input data** and a **specific observable result**.
- [ ] No criterion uses "works / handled / correct / fast / good" without an assertion behind it.
- [ ] Every filter/search/sort criterion names a value that returns a **different count**, and asserts the change.
- [ ] Every criterion is **tagged** with a verification layer (`[feature]` / `[unit]` / `[vitest]` / `[browser]`).
- [ ] The bulk is `[feature]` / `[vitest]`; `[browser]` is reserved for real click-paths + visual checks.
- [ ] Tenant-data features include explicit `[feature]` **org-scoping** criteria.
- [ ] Each user story has a `Verification` block (tests to add, dev-browser flow, regression risk).
- [ ] Functional Requirements are numbered (FR-N) and referenceable.
- [ ] Non-Goals section defines clear scope boundaries.
- [ ] Success Metrics are product-level (not test assertions).
- [ ] Open Questions section exists (even if empty).
- [ ] Test data setup section defines exact records, counts, and edge-case data to seed.
- [ ] The PRD ends with a filled-out `Verification Checklist` (test data + per-change coverage + suite gates).
- [ ] Saved to `tasks/prd-[feature-name].md`.
- [ ] **Spec file created** in `specs/features/` (under the appropriate subdirectory) based on the PRD. The spec captures the feature's purpose, scope, data model changes, routes, and status (`Status: planned`). Reference it in `specs/README.md` under the correct section. This lets future agents see what's been planned/built without digging through code.

---

## Example PRD

```markdown
# PRD: Task Priority System

## Introduction

Add priority levels to tasks so users can focus on what matters most. Tasks can be
marked as high, medium, or low priority, with visual indicators and filtering.

## Goals

- Allow assigning priority (high/medium/low) to any task
- Provide clear visual differentiation between priority levels
- Enable filtering and sorting by priority
- Default new tasks to medium priority

## User Stories

### US-001: Add priority field to database
**Description:** As a developer, I need to store task priority so it persists across sessions.

**Acceptance Criteria:**
- [feature] Migration adds `priority` string column (default `medium`) to tasks table.
- [feature] Task model casts `priority` and accepts only `high`, `medium`, `low`.

**Verification:**
- New tests: tests/Feature/Models/TaskTest.php
- Regression risk: existing task CRUD tests must still pass.

### US-002: Display priority indicator on task cards
**Description:** As a user, I want to see task priority at a glance.

**Acceptance Criteria:**
- [vitest] <TaskCard> renders red badge for `high`, yellow for `medium`, gray for `low`.
- [browser] Visiting /tasks shows colored priority badges on each card without hover.

**Verification:**
- New tests: resources/js/components/TaskCard.test.tsx
- dev-browser flow: visit /tasks, assert badge colors by data-testid
- Regression risk: task list page layout.

### US-003: Change priority from task edit
**Description:** As a user, I want to change a task's priority when editing it.

**Acceptance Criteria:**
- [feature] PUT /tasks/{id} with {priority:"high"} updates the row; returns updated props.
- [feature] PUT /tasks/{id} with {priority:"invalid"} returns 422.
- [feature] A user in org A cannot update a task belonging to org B (403).
- [browser] Priority dropdown in edit modal shows current value, saves on change,
  toast confirms "Task updated".

**Verification:**
- New tests: tests/Feature/Http/Controllers/TaskControllerTest.php
- dev-browser flow: edit task → change priority → verify badge updates
- Regression risk: task edit form, task list rendering.

### US-004: Filter tasks by priority
**Description:** As a user, I want to filter the task list to see only high-priority items.

**Acceptance Criteria:**
- [feature] GET /tasks?priority=high returns only high-priority tasks in Inertia props.
- [browser] With 12 total tasks and 3 high-priority, selecting "High" filter shows exactly
  3 rows (not 12). Filter persists in URL params across refresh.
- [browser] Clearing filter restores all 12 rows. Empty state shown when no tasks match.

**Verification:**
- dev-browser flow: visit /tasks, apply filter, count rows, refresh, verify URL param
- Regression risk: existing task list filters (status, assignee).

## Functional Requirements

- FR-1: Add `priority` string column to tasks table (values: `high`, `medium`, `low`; default `medium`).
- FR-2: Display colored priority badge on each task card (red/yellow/gray).
- FR-3: Include priority selector in task edit modal.
- FR-4: Add priority filter dropdown to task list header; filter state in URL params.
- FR-5: Sort by priority within each status column (high → medium → low).

## Non-Goals

- No priority-based notifications or reminders
- No automatic priority assignment based on due date
- No priority inheritance for subtasks

## Technical Considerations

- Reuse existing Badge component with color variants
- Filter state managed via URL search params (Inertia)
- Priority stored as plain string in DB (no enum column)

## Success Metrics

- Users can change priority in under 2 clicks
- High-priority tasks immediately visible at top of lists
- No regression in task list load time

## Open Questions

- Should priority affect task ordering within Kanban columns?
- Keyboard shortcuts for priority changes — worth it for v1?

## Verification Checklist

### Per-change coverage

**Change 1: Add priority field to task form**
- [ ] **Frontend**: priority dropdown in edit modal, correct position, label "Priority"
- [ ] **Validation**: PUT with {priority:"invalid"} returns 422; empty uses default "medium"
- [ ] **Backend storage**: priority saved to `priority` column as string after submit
- [ ] **Round-trip**: set priority to "high" → save → reload → dropdown shows "high"
- [ ] **Edge cases**: create task without setting priority → defaults to "medium"
- [ ] **Org scoping**: user in org A cannot update priority of org B's task (403)

**Change 2: Add priority badges to task cards**
- [ ] **Frontend**: colored badge visible on each card (red/yellow/gray) without hover
- [ ] **Round-trip**: change priority → badge color updates on list page after redirect
- [ ] **Edge cases**: N/A — badge always maps to one of three values

**Change 3: Add priority filter to task list**
- [ ] **Frontend**: filter dropdown with options All / High / Medium / Low
- [ ] **Backend**: GET /tasks?priority=high returns only high-priority tasks
- [ ] **Round-trip**: apply filter → URL param set → refresh → same filter, same results
- [ ] **Edge cases**: no matching tasks shows empty state; clear filter restores full list
- [ ] **Org scoping**: filtered results still scoped to current org

### Test data setup

```php
// Seed via tinker before browser tests
$org = Organization::find(1);
Task::factory()->count(8)->for($org)->create(['priority' => 'medium']);
Task::factory()->count(3)->for($org)->create(['priority' => 'high']);
Task::factory()->count(1)->for($org)->create(['priority' => 'low']);
// Edge case: task with no explicit priority (should default to 'medium')
Task::factory()->for($org)->create(); // relies on DB default

// Org B isolation data
Task::factory()->count(2)->for(Organization::find(3))->create(['priority' => 'high']);
```
- Divergent counts: 12 total, 3 high, 8 medium, 1 low — filter assertions use these exact numbers
- Org B has 2 high-priority tasks that must never appear for org A user
- Cleanup: not needed (test DB)

### Browser end-to-end

- [ ] Test data seeded per the setup above
- [ ] Full happy path: create task → set priority "high" → see red badge → filter by "high" →
      see 4 rows (3 seeded + 1 just created, not 12) → filter by "low" → see 1 row
- [ ] Zero console errors throughout
- [ ] Screenshot of task list with mixed priorities

### Suite gates

- [ ] `php artisan test` passes
- [ ] `npm run test` (Vitest) passes
- [ ] `npm run types` passes
- [ ] `npm run lint` passes
- [ ] Evidence reported: test output + dev-browser assertions, not "looks good"
```

---

## Project-specific notes

The stack and commands above (`php artisan test`, `npm run test`, `npm run types`, `npm run lint`, Inertia, `<InputError>`, `organization_id` scoping, the `dev-browser` skill) are shared across feedguardians, grandranker, and marqetir. For anything project-specific — task tracking, deployment gates, extra commands — defer to that project's `CLAUDE.md`; it takes precedence over this skill.
