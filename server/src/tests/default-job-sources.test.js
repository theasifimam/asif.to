import assert from "node:assert/strict";
import test from "node:test";
import { DEFAULT_PUBLIC_JOB_SOURCES } from "../services/jobs/defaultSources.service.js";

test("default job sources are credential-free public ATS configurations", () => {
  assert.deepEqual(DEFAULT_PUBLIC_JOB_SOURCES.map((source) => source.type), ["greenhouse", "smartrecruiters", "workable"]);
  for (const source of DEFAULT_PUBLIC_JOB_SOURCES) {
    assert.ok(source.providerOrganizationId);
    assert.match(source.careersUrl, /^https:\/\//);
    assert.equal(source.credentialEnvKey, undefined);
  }
});
