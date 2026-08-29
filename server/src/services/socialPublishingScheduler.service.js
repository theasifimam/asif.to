import fs from "fs/promises";
import SocialPost from "../models/SocialPost.js";
import SocialPublication from "../models/SocialPublication.js";
import {
  assetsFromPublication,
  runPublication,
  syncSocialPostPublicationState,
} from "../controllers/socialPostPublication.controller.js";

let timer = null;
let running = false;

export async function processDuePublications() {
  if (running) return;
  running = true;

  try {
    while (true) {
      const publication = await SocialPublication.findOneAndUpdate(
        { status: "scheduled", scheduledAt: { $lte: new Date() } },
        { $set: { status: "publishing", lastAttemptAt: new Date() } },
        { new: true, sort: { scheduledAt: 1 } },
      );

      if (!publication) break;

      const post = await SocialPost.findById(publication.socialPost);

      if (!post) {
        publication.status = "failed";
        publication.errorMessage = "The source social post no longer exists.";
        await publication.save();
        continue;
      }

      try {
        const assets = assetsFromPublication(publication);
        await Promise.all(assets.map((asset) => fs.access(asset.absolutePath)));

        const result = await runPublication({ publication, post, assets });

        await syncSocialPostPublicationState(post);
      } catch (error) {
        publication.status = "failed";
        publication.errorMessage = error.message || "Scheduled publishing failed.";
        await publication.save();
        await syncSocialPostPublicationState(post);
      }
    }
  } catch (error) {
    console.error("[SOCIAL_SCHEDULER]", error);
  } finally {
    running = false;
  }
}

export function startSocialPublishingScheduler() {
  if (timer) return;

  const configuredInterval = Number(process.env.SOCIAL_PUBLISH_SCHEDULER_INTERVAL_MS || 60000);
  const intervalMs = Number.isFinite(configuredInterval)
    ? Math.max(15000, configuredInterval)
    : 60000;

  const staleBefore = new Date(Date.now() - Math.max(intervalMs * 2, 10 * 60 * 1000));
  SocialPublication.updateMany(
    { status: "publishing", lastAttemptAt: { $lt: staleBefore } },
    { $set: { status: "failed", errorMessage: "Publishing was interrupted before completion. Retry manually to avoid a duplicate post." } },
  ).catch((error) => console.error("[SOCIAL_SCHEDULER] Could not recover interrupted publications:", error));

  processDuePublications().catch(() => {});
  timer = setInterval(() => processDuePublications().catch(() => {}), intervalMs);
  timer.unref?.();

  console.log(`[SOCIAL_SCHEDULER] Started (${Math.round(intervalMs / 1000)}s interval)`);
}
