import assert from "node:assert/strict";
import test from "node:test";
import { extractExperienceHint, extractSalary, extractSkills } from "../services/jobs/jobExtraction.service.js";

const ids = (text) => extractSkills(text).map((skill) => skill.id);

test("extractSkills finds tech skills and keeps catalog order", () => {
  assert.deepEqual(ids("We use TypeScript, React and Node.js with MongoDB on AWS."), ["react", "typescript", "nodejs", "mongodb", "aws"]);
  assert.deepEqual(ids("Experience with C# and ASP.NET Core"), ["csharp-dotnet"]);
});

test("extractSkills avoids ordinary-word false positives", () => {
  assert.deepEqual(ids("You will react to guest requests and go the extra mile."), []);
  assert.deepEqual(ids("Java developer"), ["java"], "Java must not match JavaScript");
  assert.deepEqual(ids("JavaScript developer"), ["javascript"], "JavaScript must not also tag Java");
  assert.deepEqual(ids("Build apps with React Native"), ["react-native"], "React Native is not React");
});

test("extractSalary reads explicit AED ranges with salary context", () => {
  assert.deepEqual(extractSalary("Salary: AED 15,000 - 20,000 per month plus visa."), { minimumSalary: 15000, maximumSalary: 20000, salaryPeriod: "month" });
  assert.deepEqual(extractSalary("Package of 12,000 to 14,000 AED monthly"), { minimumSalary: 12000, maximumSalary: 14000, salaryPeriod: "month" });
  assert.deepEqual(extractSalary("Compensation: AED 15k-20k per month"), { minimumSalary: 15000, maximumSalary: 20000, salaryPeriod: "month" });
  assert.deepEqual(extractSalary("Annual salary AED 240,000"), { minimumSalary: 240000, maximumSalary: 240000, salaryPeriod: "year" });
});

test("extractSalary ignores perks, fees and amounts without salary context", () => {
  assert.equal(extractSalary("Housing allowance of AED 3,000 is provided."), null);
  assert.equal(extractSalary("Salary is competitive. AED 2,500 sign-on bonus."), null);
  assert.equal(extractSalary("Our company turned over AED 50,000,000 last year."), null);
  assert.equal(extractSalary("Competitive salary and benefits."), null);
});

test("extractSalary rejects implausible figures for the period", () => {
  assert.equal(extractSalary("Salary AED 5 - 20 per month"), null);
  assert.equal(extractSalary("Salary AED 9,000,000 per month"), null);
});

test("extractExperienceHint finds the required experience phrase", () => {
  assert.equal(extractExperienceHint("Requires 3-5 years of experience in sales."), "3-5 years");
  assert.equal(extractExperienceHint("Minimum 5 years' relevant experience"), "Minimum 5 years");
  assert.equal(extractExperienceHint("7+ years professional experience leading teams"), "7+ years");
  assert.equal(extractExperienceHint("We have 12 years of history. Experience is a plus."), "");
});

test("extractSalary does not call an unlabelled six-figure amount monthly, and reads gapped ranges", () => {
  assert.deepEqual(extractSalary("Expect total first-year compensation ranging from AED 255,000 (average performance) to AED 293,000."), { minimumSalary: 255000, maximumSalary: 293000, salaryPeriod: "year" });
  assert.equal(extractSalary("Compensation is AED 255,000 for the role."), null);
  assert.deepEqual(extractSalary("Salary AED 80,000 per month"), { minimumSalary: 80000, maximumSalary: 80000, salaryPeriod: "month" });
  assert.deepEqual(extractSalary("Basic salary: AED 3000 to 3600 depending on experience"), { minimumSalary: 3000, maximumSalary: 3600, salaryPeriod: "month" });
});

// ── Quick-filter tags ─────────────────────────────────────────────────────────
import { extractTags } from "../services/jobs/jobExtraction.service.js";

test("extractTags recognises visa, walk-in, Arabic, graduate and urgent postings", () => {
  assert.deepEqual(extractTags("Benefits: employment visa provided, medical insurance."), ["visa"]);
  assert.deepEqual(extractTags("We sponsor your UAE visa and flight ticket."), ["visa"]);
  assert.deepEqual(extractTags("Walk-in interview on Saturday 10am."), ["walk-in"]);
  assert.deepEqual(extractTags("Arabic speaker preferred for this front desk role"), ["arabic-speaking"]);
  assert.deepEqual(extractTags("Open to fresh graduates"), ["fresh-graduate"]);
  assert.deepEqual(extractTags("Urgently hiring a driver, immediate joiner"), ["urgent"]);
  assert.deepEqual(extractTags("Housekeeper. Visa provided. Walk-in interview on Monday."), ["visa", "walk-in"]);
});

test("extractTags does not tag a visa requirement or refusal as a visa offer", () => {
  assert.deepEqual(extractTags("Candidates must hold their own UAE visa."), []);
  assert.deepEqual(extractTags("Valid UAE visa required; no visa sponsorship is available."), []);
  assert.deepEqual(extractTags("We cannot provide a visa for this position."), []);
  assert.deepEqual(extractTags("Responsible for the visa processing of our staff."), []);
  assert.deepEqual(extractTags("A normal posting with nothing special."), []);
});

test("walk-in tags the hiring event, not a front-desk duty", () => {
  assert.deepEqual(extractTags("Walk-in interview on Saturday 10am."), ["walk-in"]);
  assert.deepEqual(extractTags("Walk in drive at our Sharjah office"), ["walk-in"]);
  assert.deepEqual(extractTags("Greet visitors and walk-in clients; handle walk in counter reservations."), []);
});
