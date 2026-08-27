import { Router } from "express";

import {
  bulkAssetAction,
  deleteAssetPermanently,
  getAsset,
  getAssetUsages,
  listAssets,
  listAssetUploaders,
  restoreAsset,
  serveAssetContent,
  trashAsset,
  updateAsset,
  uploadAssetFiles,
} from "../controllers/asset.controller.js";
import {
  createAssetFolder,
  deleteAssetFolderPermanently,
  getAssetFolder,
  listAssetFolders,
  restoreAssetFolder,
  trashAssetFolder,
  updateAssetFolder,
} from "../controllers/assetFolder.controller.js";
import { optionalProtect, protect } from "../middlewares/auth.middleware.js";
import { uploadAssets } from "../middlewares/assetUpload.middleware.js";
import { requirePermission } from "../utils/permissions.js";

const router = Router();

router.get("/:id/content", optionalProtect, serveAssetContent);

router.use(protect);
router.get("/", requirePermission("assets.view"), listAssets);
router.get("/uploaders", requirePermission("assets.view"), listAssetUploaders);
router.get("/folders", requirePermission("assets.view"), listAssetFolders);
router.get("/folders/:id", requirePermission("assets.view"), getAssetFolder);
router.post("/upload", requirePermission("assets.upload"), uploadAssets.array("files", 20), uploadAssetFiles);
router.post("/folders", requirePermission("assets.manage"), createAssetFolder);
router.patch("/folders/:id", requirePermission("assets.manage"), updateAssetFolder);
router.post("/folders/:id/trash", requirePermission("assets.manage"), trashAssetFolder);
router.post("/folders/:id/restore", requirePermission("assets.manage"), restoreAssetFolder);
router.delete("/folders/:id/permanent", requirePermission("assets.delete_permanent"), deleteAssetFolderPermanently);
router.post("/bulk", requirePermission("assets.manage"), bulkAssetAction);
router.get("/:id/usages", requirePermission("assets.view"), getAssetUsages);
router.get("/:id", requirePermission("assets.view"), getAsset);
router.patch("/:id", requirePermission("assets.manage"), updateAsset);
router.post("/:id/trash", requirePermission("assets.manage"), trashAsset);
router.post("/:id/restore", requirePermission("assets.manage"), restoreAsset);
router.delete("/:id/permanent", requirePermission("assets.delete_permanent"), deleteAssetPermanently);

export default router;
