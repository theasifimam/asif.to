import assert from "node:assert/strict";
import test from "node:test";
import jobRoutes from "../routes/job.routes.js";
import { externalApply } from "../controllers/job.controller.js";
import Job from "../models/Job.js";
import JobApplication from "../models/JobApplication.js";
import JobEvent from "../models/JobEvent.js";
import { DEFAULT_ROLE_PERMISSIONS } from "../utils/permissions.js";
import { assertSafeRemoteUrl, cleanStringArray, cleanText, normalizeUrl, normalizedJobFingerprint } from "../utils/jobValidation.js";

test("job imports sanitize untrusted text and lists", () => {
  assert.equal(cleanText("<script>alert(1)</script><p>Build APIs</p>"), "Build APIs");
  assert.deepEqual(cleanStringArray(["React", "React", " Node.js "]), ["React", "Node.js"]);
});

test("job URL validation permits HTTP destinations and blocks unsafe sync targets", () => {
  assert.equal(normalizeUrl("https://careers.example.com/jobs/1#apply"), "https://careers.example.com/jobs/1");
  assert.throws(() => normalizeUrl("javascript:alert(1)"));
  assert.throws(() => assertSafeRemoteUrl("http://127.0.0.1/private"));
  assert.throws(() => assertSafeRemoteUrl("http://192.168.1.2/jobs"));
});

test("job fingerprint is normalized and stable", () => {
  const first = normalizedJobFingerprint({ title: "Senior Frontend Developer", companyName: "Demo Labs", location: "Dubai" });
  const second = normalizedJobFingerprint({ title: " senior frontend developer ", companyName: "DEMO LABS", location: "DUBAI" });
  assert.equal(first, second);
});

test("internal apply and save endpoints require the existing authentication middleware", () => {
  for (const path of ["/:id/save", "/:id/apply"]) {
    const route = jobRoutes.stack.find((layer) => layer.route?.path === path)?.route;
    assert.ok(route, `missing route ${path}`);
    assert.equal(route.stack[0].handle.name, "protect", `${path} must authenticate before any action`);
  }
});

test("external applications accept guests with optional authentication", async () => {
  const route = jobRoutes.stack.find((layer) => layer.route?.path === "/:id/external-apply")?.route;
  assert.equal(route.stack[0].handle.name, "optionalProtect");
  let continued = false;
  await route.stack[0].handle({ headers: {}, cookies: {} }, {}, () => { continued = true; });
  assert.ok(continued);
});

for (const authenticated of [false, true]) {
  test(`external redirect works for ${authenticated ? "members" : "guests"}`, async (t) => {
    const job = { _id: "507f1f77bcf86cd799439011", applicationType: "external", applicationUrl: "https://careers.example.com/jobs/1" };
    t.mock.method(Job, "findOne", async () => job);
    const applications = t.mock.method(JobApplication, "create", async () => ({}));
    const clicks = t.mock.method(Job, "updateOne", async () => ({}));
    const events = t.mock.method(JobEvent, "create", async () => ({}));
    const req = { params: { id: job._id }, ...(authenticated ? { user: { _id: "507f1f77bcf86cd799439012" } } : {}) };
    const res = { json(body) { this.body = body; return this; }, status(code) { this.statusCode = code; return this; } };
    await externalApply(req, res);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.redirectUrl, job.applicationUrl);
    assert.equal(applications.mock.callCount(), authenticated ? 1 : 0);
    assert.deepEqual(clicks.mock.calls[0].arguments[1], { $inc: { applyClicks: 1 } });
    assert.equal(events.mock.calls[0].arguments[0].user, req.user?._id);
  });
}

for (const [name, job, status] of [
  ["unavailable jobs", null, 410],
  ["internal jobs", { applicationType: "internal" }, 400],
]) {
  test(`guest external redirect rejects ${name}`, async (t) => {
    t.mock.method(Job, "findOne", async () => job);
    const events = t.mock.method(JobEvent, "create", async () => ({}));
    const res = { json(body) { this.body = body; return this; }, status(code) { this.statusCode = code; return this; } };
    await externalApply({ params: { id: "507f1f77bcf86cd799439011" } }, res);
    assert.equal(res.statusCode, status);
    assert.equal(res.body.success, false);
    assert.equal(events.mock.callCount(), 0);
  });
}

test("default job permissions separate ordinary management from source and delete access", () => {
  assert.ok(DEFAULT_ROLE_PERMISSIONS.editor.includes("jobs.manage"));
  assert.ok(!DEFAULT_ROLE_PERMISSIONS.editor.includes("job_sources.manage"));
  assert.ok(DEFAULT_ROLE_PERMISSIONS.admin.includes("job_sources.manage"));
  assert.ok(DEFAULT_ROLE_PERMISSIONS.admin.includes("jobs.delete"));
});
