export const wasDeletedByAdministrator = (user) =>
  Boolean(
    user?.deletedAt &&
      user?.deletedBy &&
      String(user.deletedBy) !== String(user._id),
  );

export const canRecreateDeletedAccount = (user) =>
  wasDeletedByAdministrator(user) && user?.status !== "banned";
