import test from "node:test";
import assert from "node:assert/strict";

import Asset from "../models/Asset.js";
import AssetFolder from "../models/AssetFolder.js";
import AssetUsage from "../models/AssetUsage.js";
import { describeAssetFile, sanitizeAssetName } from "../utils/assetFiles.js";
import { DEFAULT_ROLE_PERMISSIONS } from "../utils/permissions.js";

test("asset metadata remains separate from binary file contents", () => {
  assert.equal(Asset.schema.path("storageKey").instance, "String");
  assert.equal(Asset.schema.path("checksum").instance, "String");
  assert.equal(Asset.schema.path("folderId").options.ref, "AssetFolder");
  assert.equal(Asset.schema.path("buffer"), undefined);
  assert.deepEqual(Asset.schema.path("status").enumValues, ["active", "trashed"]);
});

test("asset library has indexes for listing, checksums, folder names, and usages", () => {
  const assetIndexes = Asset.schema.indexes();
  assert.ok(assetIndexes.some(([keys]) => keys.status === 1 && keys.folderId === 1 && keys.createdAt === -1));
  assert.ok(assetIndexes.some(([keys]) => keys.checksum === 1 && keys.status === 1));
  assert.ok(AssetFolder.schema.indexes().some(([keys, options]) => keys.parentId === 1 && keys.normalizedName === 1 && options.unique));
  assert.ok(AssetUsage.schema.indexes().some(([keys, options]) => keys.asset === 1 && keys.entityType === 1 && keys.entityId === 1 && keys.field === 1 && options.unique));
});

test("file validation uses content signatures instead of browser MIME alone", () => {
  const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
  const described = describeAssetFile({ originalname: "cover.PNG", mimetype: "text/plain", buffer: png });
  assert.equal(described.mimeType, "image/png");
  assert.equal(described.category, "image");
  assert.throws(
    () => describeAssetFile({ originalname: "cover.png", mimetype: "image/png", buffer: Buffer.from("not an image") }),
    /do not match/,
  );
});

test("unsafe SVG content and path-like filenames are rejected or sanitized", () => {
  assert.equal(sanitizeAssetName("../../course-cover.jpg"), "course-cover.jpg");
  assert.throws(
    () => describeAssetFile({ originalname: "bad.svg", buffer: Buffer.from('<svg><script>alert(1)</script></svg>') }),
    /unsafe/i,
  );
});

test("media permissions follow the existing author/editor/admin hierarchy", () => {
  assert.ok(DEFAULT_ROLE_PERMISSIONS.author.includes("assets.upload"));
  assert.ok(DEFAULT_ROLE_PERMISSIONS.editor.includes("assets.manage"));
  assert.ok(DEFAULT_ROLE_PERMISSIONS.admin.includes("assets.manage"));
  assert.ok(!DEFAULT_ROLE_PERMISSIONS.admin.includes("assets.delete_permanent"));
  assert.deepEqual(DEFAULT_ROLE_PERMISSIONS.super_admin, ["*"]);
});
