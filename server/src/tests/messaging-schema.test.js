import test from "node:test";
import assert from "node:assert/strict";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import MessageReaction from "../models/MessageReaction.js";
import MessagePin from "../models/MessagePin.js";

test("V2 message fields remain backward compatible", () => {
  const message = new Message({ conversationId: "507f1f77bcf86cd799439011", senderId: "507f1f77bcf86cd799439012", content: "legacy V1 message" });
  assert.equal(message.content, "legacy V1 message");
  assert.deepEqual(message.attachments, []);
  assert.deepEqual(message.mentions, []);
  assert.equal(message.deletedAt, undefined);
});

test("content discussions have duplicate-prevention indexes", () => {
  const indexes = Conversation.schema.indexes();
  assert.ok(indexes.some(([keys, options]) => keys.entityType === 1 && keys.entityId === 1 && options.unique));
  assert.equal(Conversation.schema.path("entityKey").options.unique, true);
});

test("reaction and pin uniqueness are enforced by compound indexes", () => {
  assert.ok(MessageReaction.schema.indexes().some(([keys, options]) => keys.messageId === 1 && keys.emoji === 1 && keys.userId === 1 && options.unique));
  assert.ok(MessagePin.schema.indexes().some(([keys, options]) => keys.conversationId === 1 && keys.messageId === 1 && options.unique));
});
