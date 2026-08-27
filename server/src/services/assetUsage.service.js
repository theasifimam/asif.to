import AssetUsage from "../models/AssetUsage.js";

export async function syncEntityAssetUsages({
  entityType,
  entityId,
  entityTitle,
  entityStatus,
  route,
  references = [],
}) {
  const valid = references.filter((reference) => reference?.asset && reference?.field);
  await AssetUsage.deleteMany({ entityType, entityId });
  if (!valid.length) return [];
  return AssetUsage.insertMany(
    valid.map((reference) => ({
      asset: reference.asset,
      entityType,
      entityId,
      field: reference.field,
      entityTitle,
      entityStatus,
      route,
    })),
    { ordered: false },
  ).catch((error) => {
    if (error?.code === 11000) return [];
    throw error;
  });
}

export function removeEntityAssetUsages(entityType, entityId) {
  return AssetUsage.deleteMany({ entityType, entityId });
}
