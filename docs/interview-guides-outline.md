# Career interview guides: first three categories (outline for review)

Status: DRAFT OUTLINE. Nothing here is published or entered in admin.
Chosen from UAE job supply on 2026-10-15 (see "Why these three"). Each category becomes a `TopicCategory` with `track: "career"` and no course, shown in the "Career & role guides" section of `/interview-questions`.

## How each category is built

| Piece | Where it lives | Notes |
|---|---|---|
| Category page intro (`content`) | `TopicCategory.content` | Who the guide is for, roles covered, how interviews usually run. 200-300 words. |
| Questions | `Question` (`type: interview`) | One per question; `tags` carries the role (e.g. `commis-chef`) so role pages can filter later. |
| Role guides (long form) | `Article` (`type: interview_note`) | Optional second phase: "Hotel Receptionist Interview Questions and Answers in UAE". Links to the question set and to jobs. |
| SEO | `seoTitle` (max 70), `seoDescription` (max 170) | Drafts below. |

Question fields used: `questionType` (`conceptual` = knowledge, `scenario` = situational, `behavioral` = past experience), `difficulty` (easy / medium / hard), `followUps`, `answer` (HTML/markdown: what a good answer covers, a sample the candidate adapts honestly, and a common mistake).

Rules for every answer, so the guides are not one template with the job title swapped:
- Open with what the interviewer is really testing.
- Give a concrete, role-specific example (equipment, document, number, situation), not a generic statement.
- Sample answers are written in the first person but flagged "adapt to your own experience; do not claim experience you do not have".
- End with one common mistake.

Approximate target per category at launch: 18-20 questions and a 250-word intro. Do not publish a category with fewer than about 12 solid questions.

---

## 1. Hospitality and restaurant operations

- Name: Hospitality & Restaurant
- Slug: `hospitality-restaurant-operations` (check it does not collide with an existing category slug)
- seoTitle: Hospitality & Restaurant Interview Questions and Answers (UAE)
- seoDescription: Interview questions, guest-service scenarios and sample answers for waiters, chefs, receptionists and housekeeping roles in UAE hotels and restaurants.

Roles covered (as tags): `waiter`, `commis-chef`, `chef-de-partie`, `hotel-receptionist`, `housekeeping`, `barista`, `restaurant-supervisor`.

Job-link keywords (for step 2): waiter, waitress, chef, cook, commis, barista, housekeeping, room attendant, receptionist, front office, F&B, restaurant, hotel.

Intro points: shift patterns and split shifts are normal; many hotel interviews include a trade test (chefs) or role-play (front desk); grooming and language matter; group interviews and walk-in days are common (tag "Walk-in" already exists on jobs).

Questions:

| # | Question | Type | Level | What a good answer covers | Follow-ups |
|---|---|---|---|---|---|
| 1 | Tell me about yourself and why hospitality. | behavioral | easy | 60-second structure: background, one concrete service moment, why this property. | Why us rather than another hotel? |
| 2 | How do you greet a guest and set the tone in the first 30 seconds? | conceptual | easy | Eye contact, smile, name use, offering help before being asked, brand standard. | How does it change for a VIP or a family with children? |
| 3 | A guest says their food is cold. What do you do? | scenario | easy | Apologise once, do not argue, remove or replace quickly, inform the kitchen, tell the supervisor, follow up. | What if the guest is loud in front of other tables? |
| 4 | Two tables ask for you at the same time. How do you prioritise? | scenario | medium | Acknowledge both, quick fix first, ask a colleague, never ignore a table. | What if both are VIPs? |
| 5 | What is cross-contamination and how do you prevent it? | conceptual | medium | Separate boards/knives by food type, handwashing, storage order, labelling. Mention food-safety training/certification the candidate actually holds. | Where do you store raw chicken in the chiller? |
| 6 | What does HACCP mean for your role? | conceptual | medium | Hazard analysis, critical control points (cooking and holding temperatures, chilling), records. Keep it to the candidate's own level. | Name a temperature you would check. (Verify exact figures against the employer's own standard.) |
| 7 | How do you handle a guest with a food allergy? | scenario | medium | Ask, never guess, check ingredients with kitchen, separate preparation, tell the whole team, record it. | What if you are not sure about one ingredient? |
| 8 | Describe a time you dealt with a difficult guest. | behavioral | medium | STAR: situation, what you did, result, what you learned. Avoid blaming the guest. | What would you do differently? |
| 9 | You are short-staffed in the middle of a busy service. What do you do? | scenario | medium | Tell the supervisor, prioritise guest-facing tasks, ask for help, stay calm. | Would you stay past your shift? How do you handle overtime rules? |
| 10 | How do you upsell without sounding pushy? | conceptual | medium | Suggest, don't push; know the menu; offer a choice of two; read the guest. | Give an example for a dessert or a drink. |
| 11 | (Front desk) A guest's reservation cannot be found. What do you do? | scenario | medium | Search by name/email/booking ID, check the channel, offer an alternative, inform the supervisor, apologise. | What if the hotel is fully booked? |
| 12 | (Housekeeping) How do you prioritise rooms on a busy day? | scenario | easy | Early check-ins, VIPs, departures before stayovers, supervisor's list. | What do you do if you find a lost item? |
| 13 | (Chef) Walk me through how you would prepare mise en place for a service. | conceptual | medium | Station set-up, labelling, prep list, FIFO, tasting, cleaning as you go. | What if a key ingredient has not arrived? |
| 14 | (Chef) What is FIFO and why does it matter? | conceptual | easy | First in, first out, dating and labelling, waste, safety. | How do you label a prepared item? |
| 15 | How do you work under pressure during peak hours? | behavioral | easy | Real example with a number (covers, tables, rooms). Not "I am a hard worker". | How do you avoid mistakes when it is busy? |
| 16 | How do you work with colleagues from different cultures and languages? | behavioral | easy | Practical: clear simple English, checking understanding, respect. | Do you speak any other language? (Be accurate.) |
| 17 | Are you comfortable with split shifts, weekends and holidays? | conceptual | easy | Honest answer; ask about the roster; never promise what you cannot do. | How do you handle fatigue after a double shift? |
| 18 | Describe your grooming and uniform standards. | conceptual | easy | Why it matters in guest-facing roles; brand standards. | |
| 19 | What would you do if you saw a colleague breaking a hygiene rule? | scenario | medium | Speak to them, then escalate; safety before friendship. | What if it was your supervisor? |
| 20 | Where do you see yourself in two years? | behavioral | easy | A realistic next role in the same department. | What training would you want? |

Questions to ask the interviewer (include in intro or a closing section): roster pattern, service charge/tips policy, training offered, accommodation or transport if provided, probation length, progression path.

Needs verification before publishing:
- Any food-safety certification names, temperature figures and local authority requirements (Dubai Municipality, Abu Dhabi ADAFSA, and others differ).
- Whether service charge and tips policy statements apply across employers; keep general and say "ask the employer".
- Employment details such as visa/medical/accommodation: phrase as questions to ask, not as facts.

---

## 2. Construction and site engineering roles

- Name: Construction & Site Engineering
- Slug: `construction-site-engineering`
- seoTitle: Construction & Site Engineer Interview Questions (UAE)
- seoDescription: Interview questions and sample answers for site engineers, QS, MEP and site supervisors in UAE construction: RFIs, HSE, snagging, variations and more.

Roles covered (as tags): `site-engineer`, `civil-engineer`, `mep-engineer`, `quantity-surveyor`, `site-supervisor`, `qa-qc-engineer`, `hse-officer`.

Job-link keywords (for step 2): site engineer, civil engineer, MEP, quantity surveyor, QS, QA/QC, HSE, project engineer, foreman, planning engineer, architect (if added).

Note: this category is intentionally NOT "Document Control". Only about 7-9 UAE jobs currently match it. Document control questions can be added later as tag `document-controller` in this category (or its own category if search demand justifies it).

Intro points: interviews usually combine a CV walk-through of past projects, a technical round, and sometimes a drawing-reading or BOQ exercise; bring project names, scope, values and your own role; clients, consultants and contractors are three different parties.

Questions:

| # | Question | Type | Level | What a good answer covers | Follow-ups |
|---|---|---|---|---|---|
| 1 | Walk me through your most recent project: scope, your role, size, duration. | behavioral | easy | Project type, value or area, team, your responsibilities, one result with a number. | What was the hardest problem? |
| 2 | What is the difference between client, consultant and contractor? | conceptual | easy | Roles and who approves what. | Who issues the NOC or approval in your experience? |
| 3 | What is an RFI and when do you raise one? | conceptual | easy | Request for information; unclear/conflicting drawings; raise early; track responses. | What do you do while waiting for the reply? |
| 4 | How do you read a set of drawings before starting work? | conceptual | medium | Architectural vs structural vs MEP, coordination, revision/latest issue, specs. | How do you find a clash? |
| 5 | What is an Inspection and Test Plan (ITP) and a method statement? | conceptual | medium | Purpose, hold/witness points, approvals before work. | Who signs? |
| 6 | What does a Material Inspection Request (MIR) or Work Inspection Request (WIR) do? | conceptual | medium | Approval before material use or covering work. (Terms vary; confirm what the candidate's company used.) | What happens if the inspection is failed? |
| 7 | A subcontractor wants to pour concrete but the reinforcement inspection is not signed off. What do you do? | scenario | medium | Do not pour, explain the hold point, escalate, document the delay. | The project manager says the deadline cannot move. |
| 8 | Name three site hazards and how you control them. | scenario | easy | Work at height, excavation, lifting; permit to work, PPE, supervision. Mention heat stress in the UAE summer and any midday work rules (verify current rule). | What is a toolbox talk? |
| 9 | What would you do if a worker is not wearing PPE? | scenario | easy | Stop, correct, record, repeat offenders escalate. | What if the offender is the subcontractor's foreman? |
| 10 | How do you control quality for concrete works? | conceptual | medium | Mix approval, slump test, cube samples, curing, records. | What do you do if cube results fail? |
| 11 | What is a variation order and how is it handled? | conceptual | medium | Change in scope, written instruction, cost/time, approval before work. | What if the client asks verbally on site? |
| 12 | (QS) How do you prepare a monthly interim valuation or payment application? | conceptual | medium | Measured quantities, certified work, materials on site, deductions, retention. | How do you deal with a disputed item? |
| 13 | (QS) Explain BOQ, rate analysis and cost control. | conceptual | medium | Role of each; check against actual cost. | |
| 14 | (MEP) How do you coordinate MEP with civil/structural work? | scenario | medium | Coordination drawings, sleeves/openings before concrete, clash resolution meetings. | What if ductwork clashes with beams after concrete? |
| 15 | (Supervisor) How do you plan daily manpower and equipment? | conceptual | medium | Look-ahead programme, tasks, constraints, handover. | What if material arrives late? |
| 16 | What is a snag list and how do you close it out? | conceptual | easy | Defects found at handover, prioritise, assign, re-inspect, sign. | How do you avoid repeat snags? |
| 17 | A consultant rejects your work. How do you respond? | scenario | medium | Understand reason, check the spec, fix or clarify, keep it professional. | What if you believe they are wrong? |
| 18 | How do you handle delays? | scenario | medium | Record the cause (weather, late approvals, material), notify formally, recovery plan. | Who pays for delays you do not cause? (keep general) |
| 19 | What software and tools do you use (AutoCAD, Primavera/MS Project, Excel, Procore)? | conceptual | easy | Only what the candidate really uses, with an example. | |
| 20 | Why do you want to work in the UAE / for this contractor? | behavioral | easy | Genuine reasons; relevant project experience. | Are you available immediately? What is your notice period? |

Questions to ask the interviewer: project stage and duration, reporting line, site vs office split, working hours and rest days, how approvals are handled with the consultant.

Needs verification before publishing:
- Authority and approval names (Dubai Municipality, Civil Defence, DEWA, ADDC, Trakhees, etc.) and any midday-work rule; only mention what is verified, with a source and date.
- Document terms (MIR/WIR/IR) vary by contractor; phrase as "commonly called".
- Contract forms (FIDIC) and payment terms: stay general unless sourced.

---

## 3. Sales (retail and corporate)

- Name: Sales
- Slug: `sales-retail-corporate`
- seoTitle: Sales Executive Interview Questions and Answers (UAE)
- seoDescription: Sales interview questions with sample answers for retail, B2B and field sales roles in the UAE: targets, objections, pipeline, negotiation and commission.

Roles covered (as tags): `sales-executive`, `retail-sales-associate`, `b2b-sales`, `telesales`, `sales-manager`, `business-development`.

Job-link keywords (for step 2): sales executive, sales associate, sales representative, sales consultant, business development, account manager, telesales. Caution: "accounts" also matches "Key Accounts Manager" (sales) and "Accounts Assistant" (finance); the mapping needs to handle this.

Intro points: interviews often include a role-play (sell me this pen) or a case on targets; interviewers look for numbers (target, achievement %, deal size); Arabic and other languages are an advantage in many roles but only claim what you speak; the sales cycle differs a lot between retail and B2B.

Questions:

| # | Question | Type | Level | What a good answer covers | Follow-ups |
|---|---|---|---|---|---|
| 1 | Tell me about yourself and your sales background. | behavioral | easy | Products sold, customer type, targets met, one achievement with a number. | Why sales? |
| 2 | What was your last target and how did you perform against it? | behavioral | easy | Actual target, % achieved, how, honest if you missed. | What did you do in the month you missed? |
| 3 | Walk me through your sales process from first contact to close. | conceptual | medium | Prospecting, discovery questions, proposal, objections, close, follow-up. | Where do you lose most deals? |
| 4 | Sell me this product. | scenario | medium | Ask questions first, then match benefits to needs; do not list features. | The customer says it is too expensive. |
| 5 | How do you handle the objection "your price is too high"? | scenario | medium | Understand the reason, value over price, options, do not discount first. | When would you walk away? |
| 6 | How do you find new customers? | conceptual | medium | Referrals, cold calling, LinkedIn, events, existing accounts. | How many calls/visits per day? |
| 7 | A customer is angry about a delivery. What do you do? | scenario | medium | Listen, own the issue, fix it, follow up, protect the relationship. | What if it was not your fault? |
| 8 | How do you manage your pipeline and follow-ups? | conceptual | medium | CRM or Excel, stages, next step on every deal, weekly review. | What do you do with stalled deals? |
| 9 | How do you build trust with a customer in one meeting? | conceptual | easy | Listen, honest answers, local market knowledge, follow through. | |
| 10 | Describe the biggest deal you closed. | behavioral | medium | Value, stakeholders, timeline, your role. | What made the customer decide? |
| 11 | (Retail) How do you approach a customer who is "just looking"? | scenario | easy | Light open question, give space, offer help. | |
| 12 | (B2B) How do you deal with a decision maker who does not reply? | scenario | medium | Multiple channels, new value each time, ask an ally, escalate politely. | |
| 13 | (Field) How do you plan your visits and territory? | conceptual | medium | Priority accounts, route, time, targets. | |
| 14 | How do you handle rejection? | behavioral | easy | Learn from it; real example. | |
| 15 | How do you negotiate without giving away margin? | conceptual | hard | Trade concessions, never give without getting, know your limit. | Who approves discounts in your last company? |
| 16 | A colleague is closing deals by overpromising. What do you do? | scenario | hard | Ethics, tell the manager, protect customer trust. | |
| 17 | What do you know about our products and competitors? | conceptual | medium | Do the research and mention specifics (do this per employer). | |
| 18 | What commission or incentive structure do you prefer? | conceptual | medium | Be honest; ask about the structure; avoid sounding only money-driven. | |
| 19 | How would you hit the target in your first 90 days? | scenario | medium | Learn product, shadow, build pipeline, early quick wins. | |
| 20 | Which languages do you speak and how do you use them with customers? | conceptual | easy | Accurate answer with a real example. | |

Questions to ask the interviewer: target and how it is set, commission/incentive structure and payment timing, lead sources (given vs self-generated), territory, training, average sales cycle.

Needs verification before publishing:
- Any statement about commission norms, basic-versus-variable pay or VAT: keep general or source it. Do not publish salary figures from this guide; the jobs side already has a salary-insights page with sample-size rules.

---

## Why these three

From the read-only report of 2026-10-15 (UAE published jobs, 3,263):

- Hospitality: about 121 job titles matching waiter/chef/cook/barista/housekeeping; the Hospitality category (120 jobs) plus a large share of Accor/Radisson roles filed under "Operations".
- Construction/engineering: Engineering 534, Construction 156, about 62 site-engineer/MEP/QS titles; several top sources are engineering and construction firms.
- Sales: 314 jobs across 114 employers, the broadest employer base of any category, so job links do not depend on one source.
- Held back: Document Control (7 jobs, 6 employers), Customer Service (168 jobs but 13 employers, only 4 matching titles). Admin/office support is a strong fourth once title matching is cleaned up.

Caveats: category counts are inflated by the "Operations" catch-all; keyword counts are rough upper bounds; no Search Console data was used, so search demand is not yet measured. Check impressions for these topics before heavy writing.

## Review checklist (for you)

1. Are these the right three? Swap any with admin/office support if you prefer.
2. Are the slugs and names acceptable?
3. For each question, delete or reword anything you cannot stand behind; the sample answers are written only after you approve the list.
4. Confirm the "needs verification" items and who verifies them.
5. Decide whether role-level long-form guides (Articles) come in phase 2 or are skipped.
