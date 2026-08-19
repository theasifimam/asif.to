import fs from "fs/promises";
import SocialIntegration from "../models/SocialIntegration.js";
import { decryptSocialSecret } from "../utils/socialTokenCrypto.js";

const META_VERSION = process.env.META_GRAPH_VERSION || "v23.0";
const LINKEDIN_VERSION = process.env.LINKEDIN_API_VERSION || "202607";

async function jsonRequest(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch { data = { message: text }; }
  if (!response.ok || data?.error) {
    throw new Error(data?.error?.message || data?.error_description || data?.message || `Provider request failed (${response.status}).`);
  }
  return { data, response };
}

async function integration(platform) {
  const row = await SocialIntegration.findOne({ platform, status: "connected" });
  if (!row) throw new Error(`${platform} is not connected.`);
  return row;
}

function captionFor(post, override) {
  const caption = typeof override === "string" ? override.trim() : (post.caption || "").trim();
  const tags = (post.hashtags || []).map((x) => String(x).trim()).filter(Boolean).map((x) => x.startsWith("#") ? x : `#${x}`);
  const missing = tags.filter((tag) => !caption.toLowerCase().includes(tag.toLowerCase()));
  return [caption, missing.join(" ")].filter(Boolean).join("\n\n");
}

async function formPost(url, values) {
  const body = new URLSearchParams();
  Object.entries(values).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") body.set(k, String(v));
  });
  return jsonRequest(url, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body });
}

async function instagram(post, assets, caption) {
  const row = await integration("instagram");
  const token = decryptSocialSecret(row.accessTokenEncrypted);
  if (!row.accountId || !token) throw new Error("Instagram connection is incomplete. Reconnect Instagram.");
  if (!assets.length) throw new Error("Instagram requires at least one image.");
  if (assets.length > 10) throw new Error("Instagram carousels support up to 10 images.");
  const base = `https://graph.instagram.com/${META_VERSION}`;
  let creationId;

  if (assets.length === 1) {
    const c = await formPost(`${base}/${row.accountId}/media`, { image_url: assets[0].url, caption, access_token: token });
    creationId = c.data.id;
  } else {
    const children = [];
    for (const asset of assets) {
      const child = await formPost(`${base}/${row.accountId}/media`, { image_url: asset.url, is_carousel_item: "true", access_token: token });
      children.push(child.data.id);
    }
    const c = await formPost(`${base}/${row.accountId}/media`, { media_type: "CAROUSEL", children: children.join(","), caption, access_token: token });
    creationId = c.data.id;
  }

  const p = await formPost(`${base}/${row.accountId}/media_publish`, { creation_id: creationId, access_token: token });
  return { remotePostId: String(p.data.id || ""), remotePostUrl: "" };
}

async function facebook(post, assets, caption) {
  const row = await integration("facebook");
  const token = decryptSocialSecret(row.accountTokenEncrypted);
  if (!row.accountId || !token) throw new Error("Facebook Page token is missing. Reconnect Facebook and select the Page again.");
  if (!assets.length) throw new Error("Facebook requires at least one image.");
  const base = `https://graph.facebook.com/${META_VERSION}`;
  const ids = [];

  for (const asset of assets) {
    const photo = await formPost(`${base}/${row.accountId}/photos`, { url: asset.url, published: "false", access_token: token });
    if (!photo.data.id) throw new Error("Facebook did not return a photo ID.");
    ids.push(photo.data.id);
  }

  const body = new URLSearchParams({ message: caption, access_token: token });
  ids.forEach((id, i) => body.set(`attached_media[${i}]`, JSON.stringify({ media_fbid: id })));
  const p = await jsonRequest(`${base}/${row.accountId}/feed`, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body });
  return { remotePostId: String(p.data.id || ""), remotePostUrl: "" };
}

const liHeaders = (token, type = "application/json") => ({
  Authorization: `Bearer ${token}`,
  "Content-Type": type,
  "Linkedin-Version": LINKEDIN_VERSION,
  "X-Restli-Protocol-Version": "2.0.0",
});

async function liUpload(token, owner, asset) {
  const init = await jsonRequest("https://api.linkedin.com/rest/images?action=initializeUpload", {
    method: "POST",
    headers: liHeaders(token),
    body: JSON.stringify({ initializeUploadRequest: { owner } }),
  });
  const uploadUrl = init.data?.value?.uploadUrl;
  const urn = init.data?.value?.image;
  if (!uploadUrl || !urn) throw new Error("LinkedIn did not return an image upload URL.");
  const bytes = await fs.readFile(asset.absolutePath);
  const up = await fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": asset.mimeType || "image/png" }, body: bytes });
  if (!up.ok) throw new Error(`LinkedIn image upload failed (${up.status}).`);
  return urn;
}

async function linkedin(post, assets, caption) {
  const row = await integration("linkedin");
  const token = decryptSocialSecret(row.accessTokenEncrypted);
  if (!token || !row.accountId) throw new Error("LinkedIn connection is incomplete. Reconnect LinkedIn.");
  if (!(row.scopes || []).includes("w_member_social")) throw new Error("LinkedIn connection does not include w_member_social.");
  if (!assets.length) throw new Error("LinkedIn requires at least one image.");
  if (assets.length > 20) throw new Error("LinkedIn MultiImage supports up to 20 images.");

  const owner = `urn:li:person:${row.accountId}`;
  const urns = [];
  for (const asset of assets) urns.push(await liUpload(token, owner, asset));

  const payload = {
    author: owner,
    commentary: caption,
    visibility: "PUBLIC",
    distribution: { feedDistribution: "MAIN_FEED", targetEntities: [], thirdPartyDistributionChannels: [] },
    lifecycleState: "PUBLISHED",
    isReshareDisabledByAuthor: false,
    content: urns.length === 1
      ? { media: { id: urns[0], altText: post.name || "asif.to social post" } }
      : { multiImage: { images: urns.map((id, i) => ({ id, altText: `${post.name || "asif.to social post"} slide ${i + 1}` })) } },
  };

  const p = await jsonRequest("https://api.linkedin.com/rest/posts", { method: "POST", headers: liHeaders(token), body: JSON.stringify(payload) });
  return { remotePostId: p.response.headers.get("x-restli-id") || p.data?.id || "", remotePostUrl: "" };
}

export async function publishSocialPostToPlatform({ platform, post, assets, captionOverride }) {
  const caption = captionFor(post, captionOverride);
  let result;
  if (platform === "instagram") result = await instagram(post, assets, caption);
  else if (platform === "facebook") result = await facebook(post, assets, caption);
  else if (platform === "linkedin") result = await linkedin(post, assets, caption);
  else throw new Error(`Unsupported publishing platform: ${platform}`);
  return { ...result, caption };
}
