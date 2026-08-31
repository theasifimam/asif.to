import test from "node:test";
import assert from "node:assert/strict";
import {
  canRecreateDeletedAccount,
  wasDeletedByAdministrator,
} from "../utils/accountLifecycle.js";

const userId = "507f1f77bcf86cd799439011";
const adminId = "507f191e810c19729de860ea";

test("an account deleted by an administrator can be recreated", () => {
  const user = {
    _id: userId,
    status: "deactivated",
    deletedAt: new Date(),
    deletedBy: adminId,
  };
  assert.equal(wasDeletedByAdministrator(user), true);
  assert.equal(canRecreateDeletedAccount(user), true);
});

test("self-deleted and banned accounts cannot use recreation signup", () => {
  assert.equal(
    canRecreateDeletedAccount({
      _id: userId,
      status: "deactivated",
      deletedAt: new Date(),
      deletedBy: userId,
    }),
    false,
  );
  assert.equal(
    canRecreateDeletedAccount({
      _id: userId,
      status: "banned",
      deletedAt: new Date(),
      deletedBy: adminId,
    }),
    false,
  );
});
