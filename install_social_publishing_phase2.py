from pathlib import Path

ROOT = Path.cwd()

def req(rel):
    p = ROOT / rel
    if not p.exists():
        raise SystemExit(f"Missing {rel}. Run from asif.to repo root.")
    return p

def write(rel, content):
    p = ROOT / rel
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(content, encoding="utf-8")
    print(f"✓ wrote {rel}")

def patch_once(rel, old, new):
    p = req(rel)
    text = p.read_text(encoding="utf-8")
    if new in text:
        print(f"• already patched {rel}")
        return
    if old not in text:
        raise SystemExit(f"Patch anchor not found in {rel}")
    p.write_text(text.replace(old, new, 1), encoding="utf-8")
    print(f"✓ patched {rel}")

req("apps/admin")
req("server/src")

write("server/src/models/SocialPublication.js", r'''import { Schema, model } from "mongoose";

const schema = new Schema(
  {
    socialPost: { type: Schema.Types.ObjectId, ref: "SocialPost", required: true, index: true },
    platform: { type: String, enum: ["instagram", "facebook", "linkedin"], required: true, index: true },
    status: { type: String, enum: ["publishing", "published", "failed"], default: "publishing", index: true },
    remotePostId: { type: String, default: "" },
    remotePostUrl: { type: String, default: "" },
    errorMessage: { type: String, default: "" },
    caption: { type: String, default: "" },
    assetUrls: { type: [String], default: [] },
    publishedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    publishedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

schema.index({ socialPost: 1, platform: 1, createdAt: -1 });
export default model("SocialPublication", schema);
''')

write("server/src/services/socialPublishing.service.js", r'''import fs from "fs/promises";
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
''')

write("server/src/controllers/socialPostPublication.controller.js", r'''import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import SocialPost from "../models/SocialPost.js";
import SocialPublication from "../models/SocialPublication.js";
import { publishSocialPostToPlatform } from "../services/socialPublishing.service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsRoot = path.resolve(__dirname, "../../uploads");
const PLATFORMS = ["instagram", "facebook", "linkedin"];

const publicUrl = (relative) => `${(process.env.API_PUBLIC_URL || process.env.API_URL || "http://localhost:5000").replace(/\/$/, "")}/uploads/${relative.replace(/\\/g, "/")}`;

function assetFrom(input) {
  const relative = String(input?.path || "").replace(/^\/+/, "");
  const absolutePath = path.resolve(uploadsRoot, relative);
  if (!absolutePath.startsWith(`${uploadsRoot}${path.sep}`)) throw new Error("Invalid publishing asset path.");
  return { path: relative, absolutePath, url: input?.url || publicUrl(relative), mimeType: input?.mimeType || "image/png" };
}

export async function uploadSocialPostPublishingAssets(req, res) {
  try {
    const post = await SocialPost.findOne({ _id: req.params.id, createdBy: req.user._id }).select("_id").lean();
    if (!post) {
      await Promise.all((req.files || []).map((f) => fs.unlink(f.path).catch(() => {})));
      return res.status(404).json({ success: false, message: "Social post not found." });
    }
    const assets = (req.files || []).map((file) => {
      const relative = path.relative(uploadsRoot, file.path).replace(/\\/g, "/");
      return { path: relative, url: publicUrl(relative), mimeType: file.mimetype || "image/png", size: file.size };
    });
    if (!assets.length) return res.status(400).json({ success: false, message: "No slide images were uploaded." });
    return res.status(201).json({ success: true, data: assets });
  } catch (error) {
    console.error("[SOCIAL_PUBLISH] upload:", error);
    return res.status(500).json({ success: false, message: error.message || "Upload failed." });
  }
}

export async function publishSocialPost(req, res) {
  try {
    const post = await SocialPost.findOne({ _id: req.params.id, createdBy: req.user._id });
    if (!post) return res.status(404).json({ success: false, message: "Social post not found." });

    const platforms = [...new Set((Array.isArray(req.body?.platforms) ? req.body.platforms : []).map((x) => String(x).toLowerCase()).filter((x) => PLATFORMS.includes(x)))];
    if (!platforms.length) return res.status(400).json({ success: false, message: "Choose at least one platform." });

    const assets = (Array.isArray(req.body?.assets) ? req.body.assets : []).map(assetFrom);
    if (!assets.length) return res.status(400).json({ success: false, message: "Render and upload slides before publishing." });
    await Promise.all(assets.map((a) => fs.access(a.absolutePath)));

    const results = [];
    for (const platform of platforms) {
      const publication = await SocialPublication.create({
        socialPost: post._id,
        platform,
        status: "publishing",
        caption: typeof req.body?.caption === "string" ? req.body.caption : post.caption || "",
        assetUrls: assets.map((a) => a.url),
        publishedBy: req.user._id,
      });

      try {
        const result = await publishSocialPostToPlatform({ platform, post, assets, captionOverride: req.body?.caption });
        publication.status = "published";
        publication.remotePostId = result.remotePostId || "";
        publication.remotePostUrl = result.remotePostUrl || "";
        publication.caption = result.caption || publication.caption;
        publication.publishedAt = new Date();
        publication.errorMessage = "";
        await publication.save();
        results.push({ platform, status: "published", remotePostId: publication.remotePostId, remotePostUrl: publication.remotePostUrl, publishedAt: publication.publishedAt });
      } catch (error) {
        publication.status = "failed";
        publication.errorMessage = error.message || "Publishing failed.";
        await publication.save();
        results.push({ platform, status: "failed", error: publication.errorMessage });
      }
    }

    if (results.some((r) => r.status === "published")) {
      post.status = "published";
      post.updatedAt = new Date();
      await post.save();
    }

    return res.json({ success: true, data: results });
  } catch (error) {
    console.error("[SOCIAL_PUBLISH] publish:", error);
    return res.status(500).json({ success: false, message: error.message || "Publishing failed." });
  }
}

export async function getSocialPostPublications(req, res) {
  const post = await SocialPost.findOne({ _id: req.params.id, createdBy: req.user._id }).select("_id");
  if (!post) return res.status(404).json({ success: false, message: "Social post not found." });
  const rows = await SocialPublication.find({ socialPost: post._id }).sort({ createdAt: -1 }).limit(30).lean();
  return res.json({ success: true, data: rows });
}
''')

write("apps/admin/src/components/social-posts/PublishPanel.jsx", r'''"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Facebook, Instagram, Linkedin, Loader2, Send } from "lucide-react";
import { socialIntegrationsApi, socialPostsApi } from "@/lib/api";
import { renderNodesToFiles } from "./export/ExportEngine";

const META = {
  instagram: { label: "Instagram", icon: Instagram },
  facebook: { label: "Facebook", icon: Facebook },
  linkedin: { label: "LinkedIn", icon: Linkedin },
};

function defaultCaption(post) {
  const caption = (post.caption || "").trim();
  const tags = (post.hashtags || []).map((x) => String(x).trim()).filter(Boolean).map((x) => x.startsWith("#") ? x : `#${x}`);
  const missing = tags.filter((tag) => !caption.toLowerCase().includes(tag.toLowerCase()));
  return [caption, missing.join(" ")].filter(Boolean).join("\n\n");
}

export default function PublishPanel({ postId, post, exportRefs }) {
  const [integrations, setIntegrations] = useState([]);
  const [selected, setSelected] = useState([]);
  const [caption, setCaption] = useState(() => defaultCaption(post));
  const [publishing, setPublishing] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [results, setResults] = useState([]);

  useEffect(() => setCaption(defaultCaption(post)), [post.caption, post.hashtags]);
  useEffect(() => {
    socialIntegrationsApi.list().then((result) => {
      const rows = Array.isArray(result?.data?.data) ? result.data.data : [];
      setIntegrations(rows);
      setSelected(rows.filter((x) => x.status === "connected").map((x) => x.platform));
    });
  }, []);

  const byPlatform = useMemo(() => Object.fromEntries(integrations.map((x) => [x.platform, x])), [integrations]);
  const toggle = (platform) => {
    if (byPlatform[platform]?.status !== "connected") return;
    setSelected((s) => s.includes(platform) ? s.filter((x) => x !== platform) : [...s, platform]);
  };

  async function publish() {
    if (!postId || publishing || !selected.length) return;
    setPublishing(true);
    setResults([]);
    try {
      setStatusText("Rendering slides...");
      const files = await renderNodesToFiles(exportRefs.current.filter(Boolean), { name: post.name, type: "png" });
      setStatusText("Uploading slide images...");
      const upload = await socialPostsApi.uploadPublishingAssets(postId, files);
      if (!upload?.success) throw new Error(upload?.error || "Slide upload failed.");
      const assets = upload?.data?.data;
      if (!Array.isArray(assets) || !assets.length) throw new Error("No publishing assets returned.");

      setStatusText(`Publishing to ${selected.length} platform${selected.length === 1 ? "" : "s"}...`);
      const result = await socialPostsApi.publish(postId, { platforms: selected, assets, caption });
      if (!result?.success) throw new Error(result?.error || "Publishing failed.");
      setResults(Array.isArray(result?.data?.data) ? result.data.data : []);
      setStatusText("");
    } catch (error) {
      setStatusText(error.message || "Publishing failed.");
    } finally {
      setPublishing(false);
    }
  }

  if (!postId) {
    return <div className="admin-surface p-4"><div className="text-sm font-semibold">Publish to social media</div><p className="mt-1 text-xs text-muted-foreground">Save this post first. Publishing becomes available after it has a post ID.</p></div>;
  }

  return (
    <div className="admin-surface overflow-hidden">
      <div className="border-b border-zinc-200/80 p-4 dark:border-zinc-800">
        <div className="flex items-center gap-2 font-bold"><Send size={16} />Publish</div>
        <p className="mt-1 text-xs text-muted-foreground">Publish the current rendered slides with a caption.</p>
      </div>
      <div className="space-y-4 p-4">
        <div className="grid gap-2 sm:grid-cols-3">
          {Object.entries(META).map(([platform, meta]) => {
            const item = byPlatform[platform];
            const connected = item?.status === "connected";
            const checked = selected.includes(platform);
            const Icon = meta.icon;
            return (
              <button key={platform} type="button" disabled={!connected || publishing} onClick={() => toggle(platform)} className={`rounded-xl border p-3 text-left transition ${checked ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-zinc-200 bg-background dark:border-zinc-800"} disabled:cursor-not-allowed disabled:opacity-45`}>
                <div className="flex items-center justify-between"><Icon size={17} /><span className={`h-4 w-4 rounded-full border ${checked ? "border-primary bg-primary" : "border-zinc-300 dark:border-zinc-700"}`} /></div>
                <div className="mt-3 text-sm font-semibold">{meta.label}</div>
                <div className="mt-0.5 truncate text-[11px] text-muted-foreground">{connected ? item.accountName || "Connected" : "Not connected"}</div>
              </button>
            );
          })}
        </div>

        <div>
          <div className="mb-1.5 text-xs font-semibold">Caption + hashtags</div>
          <textarea value={caption} onChange={(e) => setCaption(e.target.value)} rows={5} disabled={publishing} className="w-full resize-y rounded-xl border border-zinc-200 bg-background px-3 py-2.5 text-sm leading-6 outline-none focus:ring-2 focus:ring-primary/20 dark:border-zinc-800" />
        </div>

        {results.length > 0 && <div className="space-y-2">{results.map((result) => {
          const ok = result.status === "published";
          return <div key={result.platform} className={`flex items-start gap-2 rounded-xl border p-3 text-xs ${ok ? "border-emerald-500/20 bg-emerald-500/5" : "border-rose-500/20 bg-rose-500/5"}`}>
            {ok ? <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-600" /> : <AlertCircle size={15} className="mt-0.5 shrink-0 text-rose-600" />}
            <div><div className="font-semibold">{META[result.platform]?.label || result.platform} · {ok ? "Published" : "Failed"}</div>{!ok && result.error && <div className="mt-1 text-muted-foreground">{result.error}</div>}</div>
          </div>;
        })}</div>}

        {statusText && <div className="text-xs text-muted-foreground">{statusText}</div>}
        <button type="button" onClick={publish} disabled={publishing || selected.length === 0} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition hover:opacity-90 disabled:opacity-50">
          {publishing ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          {publishing ? "Publishing..." : `Publish to ${selected.length} platform${selected.length === 1 ? "" : "s"}`}
        </button>
      </div>
    </div>
  );
}
''')

# ExportEngine: expose blob converter + add render-to-files helper.
patch_once(
    "apps/admin/src/components/social-posts/export/ExportEngine.js",
    "function dataUrlToBlob(dataUrl) {",
    "export function dataUrlToBlob(dataUrl) {",
)
engine = req("apps/admin/src/components/social-posts/export/ExportEngine.js")
text = engine.read_text(encoding="utf-8")
if "export async function renderNodesToFiles" not in text:
    text += r'''

export async function renderNodesToFiles(nodes, { type = "png", name = "social-post" } = {}) {
  if (!nodes?.length) throw new Error("No slides available to render.");
  const extension = type === "jpeg" ? "jpg" : "png";
  const files = [];
  for (let index = 0; index < nodes.length; index += 1) {
    const dataUrl = await renderNode(nodes[index], type);
    const blob = dataUrlToBlob(dataUrl);
    files.push(new File([blob], `${slugify(name)}-${String(index + 1).padStart(2, "0")}.${extension}`, { type: blob.type || (type === "jpeg" ? "image/jpeg" : "image/png") }));
  }
  return files;
}
'''
    engine.write_text(text, encoding="utf-8")
    print("✓ added renderNodesToFiles")

# Admin API: multipart helper + publishing methods.
api = req("apps/admin/src/lib/api.js")
text = api.read_text(encoding="utf-8")
if "export async function apiPostFormData" not in text:
    marker = "// ═══════════════════════════════════════════════════════════════════════════\n// ADMIN API ENDPOINTS"
    helper = r'''export async function apiPostFormData(endpoint, formData) {
  try {
    const headers = { ...getAuthHeaders(), "ngrok-skip-browser-warning": "true" };
    delete headers["Content-Type"];
    const response = await fetch(buildUrl(endpoint), { method: "POST", headers, body: formData, credentials: "include" });
    return handleResponse(response);
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Network error" };
  }
}

'''
    if marker not in text: raise SystemExit("API helper insertion point not found")
    text = text.replace(marker, helper + marker, 1)

if "uploadPublishingAssets" not in text:
    old = '''  duplicate: (id) => apiPost(`/social-posts/${id}/duplicate`),
  delete: (id) => apiDelete(`/social-posts/${id}`),
};'''
    new = '''  duplicate: (id) => apiPost(`/social-posts/${id}/duplicate`),
  uploadPublishingAssets: (id, files) => {
    const form = new FormData();
    Array.from(files || []).forEach((file) => form.append("files", file));
    return apiPostFormData(`/social-posts/${id}/publishing-assets`, form);
  },
  publish: (id, data) => apiPost(`/social-posts/${id}/publish`, data),
  publications: (id) => apiGet(`/social-posts/${id}/publications`),
  delete: (id) => apiDelete(`/social-posts/${id}`),
};'''
    if old not in text: raise SystemExit("socialPostsApi block not found")
    text = text.replace(old, new, 1)
api.write_text(text, encoding="utf-8")
print("✓ patched apps/admin/src/lib/api.js")

# Routes: multer upload + publish/history endpoints.
routes = req("server/src/routes/socialPost.routes.js")
text = routes.read_text(encoding="utf-8")
if 'socialPostPublication.controller.js' not in text:
    text = text.replace('import { Router } from "express";\n', 'import { Router } from "express";\nimport multer from "multer";\nimport fs from "fs";\nimport path from "path";\nimport { fileURLToPath } from "url";\n', 1)
    text = text.replace('import { requirePermission } from "../utils/permissions.js";\n', 'import { requirePermission } from "../utils/permissions.js";\nimport { getSocialPostPublications, publishSocialPost, uploadSocialPostPublishingAssets } from "../controllers/socialPostPublication.controller.js";\n', 1)
    text = text.replace('const router = Router();\n', r'''const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publishingRoot = path.resolve(__dirname, "../../uploads/social-publishing");
const publishingStorage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const destination = path.join(publishingRoot, String(req.params.id).replace(/[^a-zA-Z0-9_-]/g, ""));
    fs.mkdirSync(destination, { recursive: true });
    cb(null, destination);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase() || ".png";
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 9)}${ext}`);
  },
});
const publishingUpload = multer({
  storage: publishingStorage,
  limits: { files: 20, fileSize: 12 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => ["image/png", "image/jpeg"].includes(file.mimetype) ? cb(null, true) : cb(new Error("Publishing only supports PNG or JPEG slides.")),
});
''', 1)

if '"/:id/publishing-assets"' not in text:
    anchor = 'router.get("/", getSocialPosts);\n'
    add = r'''router.post("/:id/publishing-assets", publishingUpload.array("files", 20), uploadSocialPostPublishingAssets);
router.post("/:id/publish", publishSocialPost);
router.get("/:id/publications", getSocialPostPublications);
'''
    if anchor not in text: raise SystemExit("routes anchor not found")
    text = text.replace(anchor, anchor + add, 1)
routes.write_text(text, encoding="utf-8")
print("✓ patched server/src/routes/socialPost.routes.js")

# Studio: show PublishPanel before slide navigator.
studio = req("apps/admin/src/components/social-posts/SocialPostStudio.jsx")
text = studio.read_text(encoding="utf-8")
if 'import PublishPanel from "./PublishPanel";' not in text:
    text = text.replace('import ExportControls from "./export/ExportControls";\n', 'import ExportControls from "./export/ExportControls";\nimport PublishPanel from "./PublishPanel";\n', 1)
if "<PublishPanel" not in text:
    anchor = '      <div className="admin-surface p-3">\n        <div className="mb-2 px-1 text-xs font-semibold text-muted-foreground">\n          Slides · select a slide to edit\n        </div>'
    add = '      <PublishPanel postId={postId} post={editor.post} exportRefs={exportRefs} />\n\n'
    if anchor not in text: raise SystemExit("studio anchor not found")
    text = text.replace(anchor, add + anchor, 1)
studio.write_text(text, encoding="utf-8")
print("✓ patched SocialPostStudio.jsx")

# LinkedIn version example.
env = ROOT / "server/.env.social.example"
if env.exists():
    text = env.read_text(encoding="utf-8")
    if "LINKEDIN_API_VERSION=" not in text:
        env.write_text(text.rstrip() + "\nLINKEDIN_API_VERSION=202607\n", encoding="utf-8")
        print("✓ patched server/.env.social.example")

print("""
Phase 2 installed.

Run:
  npm --prefix apps/admin run build
  pm2 restart all --update-env

Then open a SAVED social post and use the new Publish panel.

Notes:
- Instagram/Facebook need api.asif.to/uploads/* publicly reachable.
- Facebook needs pages_manage_posts to actually publish.
- LinkedIn currently publishes to the connected MEMBER profile.
- LinkedIn Page publishing can be switched in after w_organization_social is approved.
""")
