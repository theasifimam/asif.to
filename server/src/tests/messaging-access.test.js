import test from "node:test";
import assert from "node:assert/strict";
import { canAccessConversation, canPostConversation, canUseMessaging } from "../services/messagingAccess.service.js";

const user = (id, role, permissions = ["messages.view", "messages.send"]) => ({ _id: id, role, effectivePermissions: permissions });
const direct = { type: "direct", members: ["a", "b"], readRoles: [], postRoles: [], allowedMemberIds: [] };
const channel = (readRoles, postRoles, allowedMemberIds = []) => ({ type: "channel", members: [], readRoles, postRoles, allowedMemberIds });

test("readers never receive internal messaging access", () => {
  assert.equal(canUseMessaging(user("r", "reader", ["messages.view", "messages.send"])), false);
  assert.equal(canAccessConversation(user("r", "reader"), channel(["author"], ["author"])), false);
});

test("a direct conversation is restricted to its two members", () => {
  assert.equal(canAccessConversation(user("a", "author"), direct), true);
  assert.equal(canAccessConversation(user("c", "admin"), direct), false);
});

test("channel read and post roles are enforced independently", () => {
  const announcements = channel(["author", "editor", "admin", "super_admin"], ["admin", "super_admin"]);
  assert.equal(canAccessConversation(user("a", "author"), announcements), true);
  assert.equal(canPostConversation(user("a", "author"), announcements), false);
  assert.equal(canPostConversation(user("x", "admin"), announcements), true);
});

test("explicit channel members allow future specialist access", () => {
  const technical = channel(["admin", "super_admin"], ["admin", "super_admin"], ["specialist"]);
  assert.equal(canAccessConversation(user("specialist", "author"), technical), true);
  assert.equal(canPostConversation(user("specialist", "author"), technical), true);
});

test("send permission is always required even for a conversation member", () => {
  assert.equal(canPostConversation(user("a", "author", ["messages.view"]), direct), false);
});

test("content discussions require the referenced content permission", () => {
  const discussion = { type: "discussion", requiredPermission: "courses.view", entityAuthorId: null, members: [], readRoles: [], postRoles: [], allowedMemberIds: [] };
  assert.equal(canAccessConversation(user("a", "author", ["messages.view", "messages.send", "courses.view"]), discussion), true);
  assert.equal(canAccessConversation(user("a", "author", ["messages.view", "messages.send"]), discussion), false);
});

test("article authors can access their own linked discussion but not another author's", () => {
  const own = { type: "discussion", requiredPermission: "articles.edit_all", entityAuthorId: "a", members: [], readRoles: [], postRoles: [], allowedMemberIds: [] };
  const author = user("a", "author", ["messages.view", "messages.send", "articles.edit_own"]);
  assert.equal(canAccessConversation(author, own), true);
  assert.equal(canAccessConversation({ ...author, _id: "b" }, own), false);
});
