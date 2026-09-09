import assert from "node:assert/strict";
import test from "node:test";
import jobRoutes from "../routes/job.routes.js";
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

test("apply and save endpoints require the existing authentication middleware", () => {
  for (const path of ["/:id/save", "/:id/external-apply", "/:id/apply"]) {
    const route = jobRoutes.stack.find((layer) => layer.route?.path === path)?.route;
    assert.ok(route, `missing route ${path}`);
    assert.equal(route.stack[0].handle.name, "protect", `${path} must authenticate before any action`);
  }
});

test("default job permissions separate ordinary management from source and delete access", () => {
  assert.ok(DEFAULT_ROLE_PERMISSIONS.editor.includes("jobs.manage"));
  assert.ok(!DEFAULT_ROLE_PERMISSIONS.editor.includes("job_sources.manage"));
  assert.ok(DEFAULT_ROLE_PERMISSIONS.admin.includes("job_sources.manage"));
  assert.ok(DEFAULT_ROLE_PERMISSIONS.admin.includes("jobs.delete"));
});

