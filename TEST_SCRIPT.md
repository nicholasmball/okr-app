# OKR App — Manual Test Script

Based on the original requirements and success criteria from the project brief.

**App URL:** `http://localhost:3000` (or your Vercel preview URL)

## Test Accounts

| User | Email | Password | Role | Team |
|------|-------|----------|------|------|
| Nick Ball | nicholasmball@gmail.com | *(your password)* | Admin / Team Lead | Turing |
| Alex Chen | dev@example.com | password123 | Member | Turing |
| Sam Taylor | tester@example.com | password123 | Member | Turing |

## Seed Data Summary

- **Organisation:** Acme Corp
- **Team:** Turing (Lead: Nick Ball, Members: Alex Chen, Sam Taylor)
- **Active Cycle:** Q1 2026 (Jan 1 – Mar 31)
- **Objectives:** 4 (1 team, 1 cross-cutting, 2 individual)
- **Key Results:** 9 across all objectives

---

## 1. Authentication & Roles

### 1.1 Sign in as admin
- [ ] Go to `/login`
- [ ] Sign in as **Nick Ball** (nicholasmball@gmail.com)
- [ ] Verify you are redirected to the **My OKRs** dashboard
- [ ] Verify sidebar shows: My OKRs, Teams, People, Cycles, Settings

### 1.2 Sign in as team member
- [ ] Sign out, then sign in as **Alex Chen** (dev@example.com / password123)
- [ ] Verify you see the My OKRs dashboard
- [ ] Verify you can see team objectives for the Turing team

### 1.3 Role-based visibility
- [ ] As Alex Chen (member), go to **Settings**
- [ ] Verify you see the **Profile** tab
- [ ] Verify you do NOT see Users or Organisation tabs (admin-only)
- [ ] Sign back in as Nick Ball (admin)
- [ ] Verify Settings shows all tabs: Profile, Teams, Users, Organisation

---

## 2. My OKRs Dashboard (Success Criteria #1)

> *"A team member can sign in and see all their relevant OKRs in under 3 seconds"*

### 2.1 Dashboard loads with correct data
- [ ] Sign in as **Nick Ball**
- [ ] Verify the **Cycle Health** widget appears showing RAG breakdown (On Track / At Risk / Off Track percentages)
- [ ] Verify the **Cycle Header** shows "Q1 2026" with date range and average score
- [ ] Verify **Team Objectives** section shows "Ship v2 platform with 99.9% uptime"
- [ ] Verify **Cross-Cutting Objectives** section shows "Improve customer satisfaction to NPS 50+"
- [ ] Verify **Individual Objectives** section shows "Grow technical leadership skills" and "Use Claude Code"

### 2.2 Objective details
- [ ] Click to expand the "Ship v2 platform" objective
- [ ] Verify 3 Key Results are shown: API migration (75%), p95 latency (50%), uptime SLA (70%)
- [ ] Verify each KR shows a progress bar with correct RAG colour (green/amber/red)
- [ ] Verify score badges show correct values

### 2.3 Dashboard as a different user
- [ ] Sign in as **Alex Chen**
- [ ] Verify dashboard shows Turing team objectives (Alex is a Turing team member)
- [ ] Verify cross-cutting objectives assigned to Alex appear (if any)

---

## 3. Team View

### 3.1 View team page
- [ ] Navigate to **Teams** in the sidebar
- [ ] Verify the Turing team is listed
- [ ] Click on the Turing team
- [ ] Verify the team header shows team name, team lead (Nick Ball), and member count (3)
- [ ] Verify team objectives are listed with progress and scores
- [ ] Verify the **Health Summary** shows RAG distribution of all KRs

### 3.2 Team members visible
- [ ] Verify all 3 team members are visible: Nick Ball, Alex Chen, Sam Taylor

---

## 4. People View (Success Criteria #2)

> *"A manager can view any team member's complete OKR picture in 2 clicks"*

### 4.1 People list
- [ ] Navigate to **People** in the sidebar
- [ ] Verify all 3 users are listed: Nick Ball, Alex Chen, Sam Taylor
- [ ] Verify each person card shows their name, team, score ring, and RAG status

### 4.2 Person detail (2-click test)
- [ ] Click on **Nick Ball** (click 1 = People page, click 2 = person)
- [ ] Verify the person header shows name, email, role badge, score ring, KR count
- [ ] Verify you can see ALL of Nick's objectives: team + cross-cutting + individual
- [ ] Verify KR details are visible with progress values and check-in history

### 4.3 Person detail for team member
- [ ] Go back to People, click on **Sam Taylor**
- [ ] Verify Sam's assigned KRs are visible (should have "Initiative has > 80% unit test coverage" KR)

---

## 5. OKR Creation & Editing

### 5.1 Create a new objective
- [ ] From the dashboard, click **New Objective**
- [ ] Verify the multi-step dialog opens
- [ ] **Step 1:** Select objective type — choose "Team"
- [ ] **Step 2:** Enter title: "Improve CI/CD pipeline reliability"
- [ ] Select team: Turing
- [ ] Click Create
- [ ] Verify the new objective appears in the Team Objectives section

### 5.2 Edit an objective
- [ ] Find the newly created objective
- [ ] Click the edit button (pencil icon or menu)
- [ ] Change the title to "Improve CI/CD pipeline to <5 min builds"
- [ ] Save and verify the title updated

### 5.3 Add Key Results
- [ ] On the new objective, add a Key Result: "Reduce average build time" with target 5, unit "minutes"
- [ ] Add another KR: "Achieve 99% pipeline success rate" with target 99, unit "%"
- [ ] Verify both KRs appear under the objective

### 5.4 Assign KR to an individual
- [ ] Assign "Reduce average build time" to **Alex Chen**
- [ ] Verify the assignee avatar/name appears on the KR

### 5.5 Delete an objective
- [ ] Delete the test objective "Improve CI/CD pipeline to <5 min builds"
- [ ] Verify a confirmation dialog appears
- [ ] Confirm deletion
- [ ] Verify the objective and its KRs are removed

---

## 6. KR Progress Check-ins

### 6.1 Record a check-in
- [ ] Find the KR "Complete API migration to v2" (currently at 75%)
- [ ] Click to open the check-in panel/sheet
- [ ] Enter new value: 85
- [ ] Set status to "On Track"
- [ ] Add comment: "Completed user endpoints, auth endpoints remaining"
- [ ] Submit the check-in
- [ ] Verify the KR progress updates to 85%
- [ ] Verify the objective score recalculates

### 6.2 Check-in history
- [ ] Verify the check-in timeline shows the new entry with value, status, comment, and timestamp
- [ ] Verify any previous check-ins are also visible

### 6.3 Score cascade
- [ ] After the check-in, verify the parent objective's score has updated (average of its KR scores)
- [ ] Verify the dashboard Cycle Health widget reflects the updated RAG distribution

---

## 7. Scoring & RAG Status

### 7.1 RAG colour thresholds
- [ ] Verify KRs with score >= 0.7 show **green** (On Track)
- [ ] Verify KRs with score 0.3–0.7 show **amber** (At Risk)
- [ ] Verify KRs with score < 0.3 show **red** (Off Track)

### 7.2 Score badges and rings
- [ ] Verify score badges show decimal (e.g. 0.75) or percentage format
- [ ] Verify score rings on People cards fill proportionally

### 7.3 Health summary accuracy
- [ ] On the dashboard, verify Cycle Health percentages add up to 100%
- [ ] On the Team view, verify the team Health Summary matches the KR distribution

---

## 8. OKR Cycles

### 8.1 View cycles
- [ ] Navigate to **Cycles** in the sidebar
- [ ] Verify Q1 2026 is shown as the active cycle
- [ ] Verify the cycle card shows: status (Active), objective count, average score, completion rate, RAG breakdown

### 8.2 Create a new cycle
- [ ] Click **New Cycle** (admin/team lead only)
- [ ] Enter name: "Q2 2026", start date: 2026-04-01, end date: 2026-06-30
- [ ] Create the cycle
- [ ] Verify it appears as "Upcoming" (not active)

### 8.3 Set active cycle
- [ ] Click **Set Active** on the Q2 2026 cycle
- [ ] Verify Q2 2026 becomes active and Q1 2026 becomes inactive
- [ ] Verify the dashboard now shows Q2 2026 (likely with no objectives yet)

### 8.4 Carry forward objectives
- [ ] On the Q1 2026 cycle card, click **Carry Forward**
- [ ] Select Q2 2026 as the target cycle
- [ ] Verify incomplete objectives are copied to Q2 with progress reset to 0

### 8.5 Restore active cycle
- [ ] Set Q1 2026 back as the active cycle for remaining tests
- [ ] Delete Q2 2026 or close it

---

## 9. Settings & Admin

### 9.1 Profile settings
- [ ] Go to **Settings** > **Profile** tab
- [ ] Verify your email (disabled) and name are shown
- [ ] Change name to "Nicholas Ball", save
- [ ] Verify the name updates across the app (sidebar, header)
- [ ] Change it back to "Nick Ball"

### 9.2 Team management (admin/team lead)
- [ ] Go to **Settings** > **Teams** tab
- [ ] Verify the Turing team is listed with its members
- [ ] Create a new team: "Lovelace"
- [ ] Add Alex Chen to the Lovelace team
- [ ] Verify Alex now appears in both Turing and Lovelace
- [ ] Remove Alex from Lovelace
- [ ] Delete the Lovelace team

### 9.3 User management (admin only)
- [ ] Go to **Settings** > **Users** tab
- [ ] Verify all 3 users are listed with their roles
- [ ] Verify your own row shows a "You" badge and the role dropdown is disabled
- [ ] Change Alex Chen's role to "Team Lead"
- [ ] Verify the role updates
- [ ] Change it back to "Member"

### 9.4 Organisation settings (admin only)
- [ ] Go to **Settings** > **Organisation** tab
- [ ] Verify the org name is shown
- [ ] Update the name, save, verify it updates
- [ ] Restore the original name

---

## 10. Cross-Cutting Objectives (Success Criteria #3)

> *"Cross-cutting objectives (like 'adopt tool X') can be tracked per-individual across teams"*

### 10.1 Verify cross-cutting objective
- [ ] On the dashboard, find "Improve customer satisfaction to NPS 50+"
- [ ] Verify it appears in the **Cross-Cutting Objectives** section
- [ ] Verify its KRs can be assigned to people from any team

### 10.2 Create a cross-cutting objective
- [ ] Click **New Objective** > type: "Cross-Cutting"
- [ ] Title: "Adopt Claude Code for all new development"
- [ ] Create it, add a KR: "Complete one feature using Claude Code", target: 1, unit: "features"
- [ ] Assign the KR to Alex Chen
- [ ] Verify it appears on Alex's My OKRs dashboard when signed in as Alex
- [ ] Clean up: delete the test objective

---

## 11. Edge Cases & Robustness

### 11.1 Empty states
- [ ] If you remove all objectives from a cycle, verify the "No objectives yet" empty state appears
- [ ] If a user has no team, verify they still see individual/cross-cutting objectives

### 11.2 Score boundaries
- [ ] Check-in a KR value that exceeds the target (e.g. 120/100) — score should cap at 1.0
- [ ] Check-in a KR with value 0 — score should be 0.0, status should be red

### 11.3 Objective with no KRs
- [ ] Create an objective with no Key Results
- [ ] Verify it shows with a score of 0 and no progress bar errors

---

## Success Criteria Checklist

| # | Criterion | Pass/Fail |
|---|-----------|-----------|
| 1 | Team member signs in and sees all relevant OKRs in under 3 seconds | |
| 2 | Manager can view any team member's complete OKR picture in 2 clicks | |
| 3 | Cross-cutting objectives can be tracked per-individual across teams | |
| 4 | The tool is simple enough that teams would actually use it | |
