from pathlib import Path

ROOT = Path.cwd()

def must(rel):
    p = ROOT / rel
    if not p.exists():
        raise SystemExit(f"Missing expected path: {rel}\nRun this from the root of the asif.to repository.")
    return p

def write(rel, content):
    p = ROOT / rel
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(content, encoding="utf-8")
    print(f"✓ wrote {rel}")

def patch(rel, old, new):
    p = must(rel)
    text = p.read_text(encoding="utf-8")
    if new in text:
        print(f"• already patched {rel}")
        return
    if old not in text:
        raise SystemExit(f"Could not find expected patch location in {rel}")
    p.write_text(text.replace(old, new, 1), encoding="utf-8")
    print(f"✓ patched {rel}")

must("apps/admin")
must("server/src")

write("server/src/models/SocialIntegration.js", '''import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    platform: { type: String, enum: ["instagram", "facebook", "linkedin"], required: true, unique: true, index: true },
    status: { type: String, enum: ["connected", "needs_selection", "error", "disconnected"], default: "disconnected" },
    accountId: { type: String, default: "" },
    accountName: { type: String, default: "" },
    accountType: { type: String, default: "" },
    accessTokenEncrypted: { type: String, default: "" },
    refreshTokenEncrypted: { type: String, default: "" },
    accountTokenEncrypted: { type: String, default: "" },
    scopes: { type: [String], default: [] },
    tokenExpiresAt: { type: Date, default: null },
    accountOptions: { type: [{ id: String, name: String }], default: [] },
    errorMessage: { type: String, default: "" },
    connectedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    connectedAt: { type: Date, default: null },
    lastCheckedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export default mongoose.models.SocialIntegration || mongoose.model("SocialIntegration", schema);
''')

write("server/src/utils/socialTokenCrypto.js", '''import crypto from "crypto";

function key() {
  const secret = process.env.SOCIAL_TOKEN_ENCRYPTION_KEY;
  if (!secret) throw new Error("SOCIAL_TOKEN_ENCRYPTION_KEY is not configured.");
  return crypto.createHash("sha256").update(secret).digest();
}

export function encryptSocialSecret(value) {
  if (!value) return "";
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key(), iv);
  const encrypted = Buffer.concat([cipher.update(String(value), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString("base64url"), tag.toString("base64url"), encrypted.toString("base64url")].join(".");
}

export function decryptSocialSecret(payload) {
  if (!payload) return "";
  const [ivRaw, tagRaw, encryptedRaw] = String(payload).split(".");
  const decipher = crypto.createDecipheriv("aes-256-gcm", key(), Buffer.from(ivRaw, "base64url"));
  decipher.setAuthTag(Buffer.from(tagRaw, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(encryptedRaw, "base64url")), decipher.final()]).toString("utf8");
}
''')

write("server/src/services/socialOAuth.service.js", '''import jwt from "jsonwebtoken";
import SocialIntegration from "../models/SocialIntegration.js";
import { decryptSocialSecret, encryptSocialSecret } from "../utils/socialTokenCrypto.js";

const META_VERSION = process.env.META_GRAPH_VERSION || "v23.0";
const stateSecret = () => process.env.SOCIAL_OAUTH_STATE_SECRET || process.env.JWT_SECRET;
const adminUrl = () => (process.env.ADMIN_URL || "http://localhost:3001").replace(/\\/$/, "");
const apiUrl = () => (process.env.API_PUBLIC_URL || process.env.API_URL || "http://localhost:5000").replace(/\\/$/, "");
const callbackUrl = (platform) => `${apiUrl()}/api/v1/social-integrations/${platform}/callback`;

function requireEnv(...keys) {
  const missing = keys.filter((name) => !process.env[name]);
  if (missing.length) throw new Error(`Missing environment variable(s): ${missing.join(", ")}`);
}

function createState(platform, userId) {
  if (!stateSecret()) throw new Error("OAuth state secret is not configured.");
  return jwt.sign({ platform, userId: String(userId), purpose: "social-oauth" }, stateSecret(), { expiresIn: "10m" });
}

export function verifySocialOAuthState(state, platform) {
  const value = jwt.verify(state, stateSecret());
  if (value?.purpose !== "social-oauth" || value?.platform !== platform || !value?.userId) throw new Error("Invalid OAuth state.");
  return value;
}

export function socialAdminRedirect(params = {}) {
  return `${adminUrl()}/social-integrations?${new URLSearchParams(params)}`;
}

export function getSocialConnectUrl(platform, userId) {
  const state = createState(platform, userId);
  const redirectUri = callbackUrl(platform);

  if (platform === "linkedin") {
    requireEnv("LINKEDIN_CLIENT_ID", "LINKEDIN_CLIENT_SECRET");
    return `https://www.linkedin.com/oauth/v2/authorization?${new URLSearchParams({ response_type: "code", client_id: process.env.LINKEDIN_CLIENT_ID, redirect_uri: redirectUri, state, scope: "openid profile email w_member_social" })}`;
  }

  if (platform === "instagram") {
    requireEnv("INSTAGRAM_APP_ID", "INSTAGRAM_APP_SECRET");
    return `https://www.instagram.com/oauth/authorize?${new URLSearchParams({ client_id: process.env.INSTAGRAM_APP_ID, redirect_uri: redirectUri, response_type: "code", scope: process.env.INSTAGRAM_OAUTH_SCOPES || "instagram_business_basic,instagram_business_content_publish", state })}`;
  }

  if (platform === "facebook") {
    requireEnv("META_APP_ID", "META_APP_SECRET");
    return `https://www.facebook.com/${META_VERSION}/dialog/oauth?${new URLSearchParams({ client_id: process.env.META_APP_ID, redirect_uri: redirectUri, response_type: "code", state, scope: process.env.FACEBOOK_OAUTH_SCOPES || "public_profile,pages_show_list,pages_read_engagement,pages_manage_posts" })}`;
  }

  throw new Error("Unsupported social platform.");
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch { data = { message: text }; }
  if (!response.ok || data?.error) throw new Error(data?.error?.message || data?.error_description || data?.message || `Provider request failed (${response.status}).`);
  return data;
}

async function save(platform, values) {
  return SocialIntegration.findOneAndUpdate({ platform }, { $set: { platform, ...values, lastCheckedAt: new Date() } }, { new: true, upsert: true, setDefaultsOnInsert: true });
}

async function connectLinkedIn(code, userId) {
  const token = await requestJson("https://www.linkedin.com/oauth/v2/accessToken", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "authorization_code", code, redirect_uri: callbackUrl("linkedin"), client_id: process.env.LINKEDIN_CLIENT_ID, client_secret: process.env.LINKEDIN_CLIENT_SECRET }),
  });
  const profile = await requestJson("https://api.linkedin.com/v2/userinfo", { headers: { Authorization: `Bearer ${token.access_token}` } });
  return save("linkedin", { status: "connected", accountId: profile.sub || "", accountName: profile.name || profile.given_name || "LinkedIn account", accountType: "member", accessTokenEncrypted: encryptSocialSecret(token.access_token), refreshTokenEncrypted: encryptSocialSecret(token.refresh_token || ""), accountTokenEncrypted: "", tokenExpiresAt: token.expires_in ? new Date(Date.now() + Number(token.expires_in) * 1000) : null, scopes: String(token.scope || "openid profile email w_member_social").split(/\\s+/).filter(Boolean), accountOptions: [], errorMessage: "", connectedBy: userId, connectedAt: new Date() });
}

async function connectInstagram(code, userId) {
  const token = await requestJson("https://api.instagram.com/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: process.env.INSTAGRAM_APP_ID, client_secret: process.env.INSTAGRAM_APP_SECRET, grant_type: "authorization_code", redirect_uri: callbackUrl("instagram"), code }),
  });
  let accessToken = token.access_token;
  try {
    const longLived = await requestJson(`https://graph.instagram.com/access_token?${new URLSearchParams({ grant_type: "ig_exchange_token", client_secret: process.env.INSTAGRAM_APP_SECRET, access_token: accessToken })}`);
    if (longLived.access_token) accessToken = longLived.access_token;
    if (longLived.expires_in) token.expires_in = longLived.expires_in;
  } catch {}
  const profile = await requestJson(`https://graph.instagram.com/me?${new URLSearchParams({ fields: "id,user_id,username,account_type", access_token: accessToken })}`);
  return save("instagram", { status: "connected", accountId: String(profile.user_id || profile.id || token.user_id || ""), accountName: profile.username ? `@${profile.username}` : "Instagram account", accountType: profile.account_type || "professional", accessTokenEncrypted: encryptSocialSecret(accessToken), refreshTokenEncrypted: "", accountTokenEncrypted: "", tokenExpiresAt: token.expires_in ? new Date(Date.now() + Number(token.expires_in) * 1000) : null, scopes: String(process.env.INSTAGRAM_OAUTH_SCOPES || "instagram_business_basic,instagram_business_content_publish").split(",").map((x) => x.trim()).filter(Boolean), accountOptions: [], errorMessage: "", connectedBy: userId, connectedAt: new Date() });
}

async function connectFacebook(code, userId) {
  const token = await requestJson(`https://graph.facebook.com/${META_VERSION}/oauth/access_token?${new URLSearchParams({ client_id: process.env.META_APP_ID, client_secret: process.env.META_APP_SECRET, redirect_uri: callbackUrl("facebook"), code })}`);
  const pages = await requestJson(`https://graph.facebook.com/${META_VERSION}/me/accounts?${new URLSearchParams({ fields: "id,name,access_token", access_token: token.access_token })}`);
  const rows = Array.isArray(pages.data) ? pages.data : [];
  if (!rows.length) throw new Error("No manageable Facebook Pages were returned.");
  const selected = rows.length === 1 ? rows[0] : null;
  return save("facebook", { status: selected ? "connected" : "needs_selection", accountId: selected ? String(selected.id) : "", accountName: selected?.name || "", accountType: "page", accessTokenEncrypted: encryptSocialSecret(token.access_token), refreshTokenEncrypted: "", accountTokenEncrypted: encryptSocialSecret(selected?.access_token || ""), tokenExpiresAt: token.expires_in ? new Date(Date.now() + Number(token.expires_in) * 1000) : null, scopes: String(process.env.FACEBOOK_OAUTH_SCOPES || "public_profile,pages_show_list,pages_read_engagement,pages_manage_posts").split(",").map((x) => x.trim()).filter(Boolean), accountOptions: rows.map((page) => ({ id: String(page.id), name: page.name || "Facebook Page" })), errorMessage: "", connectedBy: userId, connectedAt: new Date() });
}

export async function completeSocialOAuth(platform, code, userId) {
  if (platform === "linkedin") return connectLinkedIn(code, userId);
  if (platform === "instagram") return connectInstagram(code, userId);
  if (platform === "facebook") return connectFacebook(code, userId);
  throw new Error("Unsupported social platform.");
}

export async function selectFacebookPage(pageId, userId) {
  const integration = await SocialIntegration.findOne({ platform: "facebook" });
  if (!integration?.accessTokenEncrypted) throw new Error("Connect Facebook first.");
  const token = decryptSocialSecret(integration.accessTokenEncrypted);
  const pages = await requestJson(`https://graph.facebook.com/${META_VERSION}/me/accounts?${new URLSearchParams({ fields: "id,name,access_token", access_token: token })}`);
  const selected = pages.data?.find((page) => String(page.id) === String(pageId));
  if (!selected) throw new Error("Selected Facebook Page is unavailable.");
  integration.status = "connected";
  integration.accountId = String(selected.id);
  integration.accountName = selected.name || "Facebook Page";
  integration.accountType = "page";
  integration.accountTokenEncrypted = encryptSocialSecret(selected.access_token);
  integration.connectedBy = userId;
  integration.connectedAt = new Date();
  integration.lastCheckedAt = new Date();
  integration.errorMessage = "";
  await integration.save();
  return integration;
}
''')

write("server/src/controllers/socialIntegration.controller.js", '''import SocialIntegration from "../models/SocialIntegration.js";
import { completeSocialOAuth, getSocialConnectUrl, selectFacebookPage, socialAdminRedirect, verifySocialOAuthState } from "../services/socialOAuth.service.js";

const PLATFORMS = ["instagram", "facebook", "linkedin"];
const publicView = (row) => row ? ({ platform: row.platform, status: row.status, accountId: row.accountId || "", accountName: row.accountName || "", accountType: row.accountType || "", scopes: row.scopes || [], tokenExpiresAt: row.tokenExpiresAt || null, accountOptions: row.accountOptions || [], errorMessage: row.errorMessage || "", connectedAt: row.connectedAt || null, lastCheckedAt: row.lastCheckedAt || null }) : null;

export async function listSocialIntegrations(_req, res) {
  const records = await SocialIntegration.find({ platform: { $in: PLATFORMS } }).lean();
  const map = Object.fromEntries(records.map((item) => [item.platform, publicView(item)]));
  return res.json({ success: true, data: PLATFORMS.map((platform) => map[platform] || { platform, status: "disconnected", accountId: "", accountName: "", accountType: "", scopes: [], tokenExpiresAt: null, accountOptions: [], errorMessage: "", connectedAt: null, lastCheckedAt: null }) });
}

export async function startSocialConnection(req, res) {
  try {
    const { platform } = req.params;
    if (!PLATFORMS.includes(platform)) return res.status(400).json({ success: false, message: "Unsupported platform." });
    return res.json({ success: true, data: { platform, authUrl: getSocialConnectUrl(platform, req.user._id) } });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message || "Could not start connection." });
  }
}

export async function socialOAuthCallback(req, res) {
  const { platform } = req.params;
  try {
    if (!PLATFORMS.includes(platform)) throw new Error("Unsupported platform.");
    if (req.query.error) throw new Error(req.query.error_description || req.query.error_reason || req.query.error);
    if (!req.query.code || !req.query.state) throw new Error("OAuth callback is missing code or state.");
    const state = verifySocialOAuthState(req.query.state, platform);
    const integration = await completeSocialOAuth(platform, String(req.query.code), state.userId);
    return res.redirect(socialAdminRedirect({ platform, status: integration.status === "needs_selection" ? "needs_selection" : "connected" }));
  } catch (error) {
    try { await SocialIntegration.findOneAndUpdate({ platform }, { $set: { platform, status: "error", errorMessage: error.message || "Connection failed.", lastCheckedAt: new Date() } }, { upsert: true }); } catch {}
    return res.redirect(socialAdminRedirect({ platform, status: "error", message: error.message || "Connection failed." }));
  }
}

export async function chooseFacebookPage(req, res) {
  try {
    if (!req.body?.pageId) return res.status(400).json({ success: false, message: "Select a Facebook Page." });
    const integration = await selectFacebookPage(req.body.pageId, req.user._id);
    return res.json({ success: true, data: publicView(integration) });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message || "Could not select Facebook Page." });
  }
}

export async function disconnectSocialIntegration(req, res) {
  const { platform } = req.params;
  if (!PLATFORMS.includes(platform)) return res.status(400).json({ success: false, message: "Unsupported platform." });
  await SocialIntegration.findOneAndUpdate({ platform }, { $set: { status: "disconnected", accountId: "", accountName: "", accountType: "", accessTokenEncrypted: "", refreshTokenEncrypted: "", accountTokenEncrypted: "", scopes: [], tokenExpiresAt: null, accountOptions: [], errorMessage: "", connectedAt: null, lastCheckedAt: new Date() } }, { upsert: true });
  return res.json({ success: true });
}
''')

write("server/src/routes/socialIntegration.routes.js", '''import { Router } from "express";
import { chooseFacebookPage, disconnectSocialIntegration, listSocialIntegrations, socialOAuthCallback, startSocialConnection } from "../controllers/socialIntegration.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../utils/permissions.js";

const router = Router();
router.get("/:platform/callback", socialOAuthCallback);
router.use(protect, requirePermission("social_integrations.manage"));
router.get("/", listSocialIntegrations);
router.get("/:platform/connect", startSocialConnection);
router.patch("/facebook/account", chooseFacebookPage);
router.delete("/:platform", disconnectSocialIntegration);
export default router;
''')

patch("server/src/index.js", 'import socialPostRoutes from "./routes/socialPost.routes.js";\n', 'import socialPostRoutes from "./routes/socialPost.routes.js";\nimport socialIntegrationRoutes from "./routes/socialIntegration.routes.js";\n')
patch("server/src/index.js", 'app.use("/api/v1/social-posts", socialPostRoutes);\n', 'app.use("/api/v1/social-posts", socialPostRoutes);\napp.use("/api/v1/social-integrations", socialIntegrationRoutes);\n')
patch("server/src/utils/permissions.js", '  ["playground.manage", "Manage interactive code playground", "System"],\n', '  ["playground.manage", "Manage interactive code playground", "System"],\n  ["social_integrations.manage", "Connect and manage social publishing accounts", "System"],\n')
patch("apps/admin/src/lib/permissions.js", '    "playground.manage", "messages.view", "messages.send", "messages.channels.manage", "messages.attach", "messages.pin", "messages.moderate",\n', '    "playground.manage", "social_integrations.manage", "messages.view", "messages.send", "messages.channels.manage", "messages.attach", "messages.pin", "messages.moderate",\n')
patch("apps/admin/src/lib/permissions.js", '  [/^\\/social-posts(?:\\/|$)/, "articles.create"],\n', '  [/^\\/social-posts(?:\\/|$)/, "articles.create"],\n  [/^\\/social-integrations(?:\\/|$)/, "social_integrations.manage"],\n')

api = must("apps/admin/src/lib/api.js")
text = api.read_text(encoding="utf-8")
if "export const socialIntegrationsApi" not in text:
    api.write_text(text.rstrip() + '''\n\n/** Social publishing account integrations. */\nexport const socialIntegrationsApi = {\n  list: () => apiGet("/social-integrations"),\n  connect: (platform) => apiGet(`/social-integrations/${platform}/connect`),\n  selectFacebookPage: (pageId) => apiPatch("/social-integrations/facebook/account", { pageId }),\n  disconnect: (platform) => apiDelete(`/social-integrations/${platform}`),\n};\n''', encoding="utf-8")
    print("✓ patched apps/admin/src/lib/api.js")

write("apps/admin/src/app/(admin)/social-integrations/page.jsx", '''"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Check, ExternalLink, Facebook, Instagram, Linkedin, Loader2, Plug, RefreshCw, ShieldCheck, Unplug } from "lucide-react";
import { socialIntegrationsApi } from "@/lib/api";

const META = {
  instagram: { label: "Instagram", description: "Connect a professional Instagram account for image and carousel publishing.", icon: Instagram },
  facebook: { label: "Facebook", description: "Connect Facebook and choose the Page admin.asif.to should publish to.", icon: Facebook },
  linkedin: { label: "LinkedIn", description: "Connect your LinkedIn account for developer and educational posts.", icon: Linkedin },
};

function Status({ value }) {
  const connected = value === "connected";
  const selection = value === "needs_selection";
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${connected ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : selection ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" : "bg-zinc-500/10 text-zinc-500"}`}><span className={`h-1.5 w-1.5 rounded-full ${connected ? "bg-emerald-500" : selection ? "bg-amber-500" : "bg-zinc-400"}`} />{connected ? "Connected" : selection ? "Choose Page" : "Not connected"}</span>;
}

export default function SocialIntegrationsPage() {
  const searchParams = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [notice, setNotice] = useState("");
  const byPlatform = useMemo(() => Object.fromEntries(items.map((item) => [item.platform, item])), [items]);

  async function load() {
    setLoading(true);
    try { const result = await socialIntegrationsApi.list(); setItems(Array.isArray(result?.data?.data) ? result.data.data : []); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);
  useEffect(() => {
    const platform = searchParams.get("platform");
    const status = searchParams.get("status");
    const message = searchParams.get("message");
    if (status === "connected" && platform) setNotice(`${META[platform]?.label || platform} connected successfully.`);
    else if (status === "needs_selection") setNotice("Facebook connected. Choose the Page you want to publish to.");
    else if (status === "error") setNotice(message || "Social account connection failed.");
  }, [searchParams]);

  async function connect(platform) {
    setBusy(platform); setNotice("");
    try {
      const result = await socialIntegrationsApi.connect(platform);
      const url = result?.data?.data?.authUrl;
      if (!result?.success || !url) throw new Error(result?.error || "Could not start connection.");
      window.location.assign(url);
    } catch (error) { setNotice(error.message || "Could not start connection."); setBusy(""); }
  }

  async function disconnect(platform) {
    if (!window.confirm(`Disconnect ${META[platform].label}?`)) return;
    setBusy(platform);
    try { const result = await socialIntegrationsApi.disconnect(platform); if (!result?.success) throw new Error(result?.error || "Disconnect failed."); await load(); setNotice(`${META[platform].label} disconnected.`); }
    catch (error) { setNotice(error.message || "Disconnect failed."); }
    finally { setBusy(""); }
  }

  async function choosePage(pageId) {
    if (!pageId) return;
    setBusy("facebook");
    try { const result = await socialIntegrationsApi.selectFacebookPage(pageId); if (!result?.success) throw new Error(result?.error || "Could not select Facebook Page."); await load(); setNotice("Facebook Page selected successfully."); }
    catch (error) { setNotice(error.message || "Could not select Facebook Page."); }
    finally { setBusy(""); }
  }

  return <div className="space-y-6 p-4 md:p-6">
    <div><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary"><Plug size={14}/>Publishing</div><h1 className="mt-2 text-2xl font-black">Social Integrations</h1><p className="mt-1 max-w-2xl text-sm text-muted-foreground">Connect each account once through OAuth. Social Post Studio can later publish using these approved connections.</p></div>
    <div className="admin-surface flex items-start gap-3 p-4"><ShieldCheck size={19} className="mt-0.5 shrink-0 text-primary"/><div><div className="text-sm font-semibold">Secure server-side connections</div><p className="mt-1 text-xs leading-5 text-muted-foreground">OAuth tokens are encrypted before database storage and never returned to the admin browser.</p></div></div>
    {notice && <div className="admin-surface p-4 text-sm">{notice}</div>}
    {loading ? <div className="flex items-center gap-2 p-8 text-sm text-muted-foreground"><Loader2 size={16} className="animate-spin"/>Loading integrations...</div> : <div className="grid gap-4 xl:grid-cols-3">{Object.entries(META).map(([platform, meta]) => {
      const item = byPlatform[platform] || { platform, status: "disconnected", accountOptions: [] };
      const Icon = meta.icon; const connected = item.status === "connected"; const isBusy = busy === platform;
      return <section key={platform} className="admin-surface p-5"><div className="flex items-start justify-between gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-muted"><Icon size={20}/></div><Status value={item.status}/></div><h2 className="mt-5 text-lg font-bold">{meta.label}</h2><p className="mt-1 min-h-10 text-xs leading-5 text-muted-foreground">{meta.description}</p>
      {item.accountName && <div className="mt-4 rounded-xl border border-zinc-200/80 bg-muted/30 p-3 dark:border-zinc-800"><div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Connected account</div><div className="mt-1 text-sm font-semibold">{item.accountName}</div></div>}
      {platform === "facebook" && item.status === "needs_selection" && item.accountOptions?.length > 0 && <div className="mt-4"><label className="mb-1.5 block text-xs font-semibold">Choose Facebook Page</label><select defaultValue="" disabled={isBusy} onChange={(e) => choosePage(e.target.value)} className="w-full rounded-xl border border-zinc-200 bg-background px-3 py-2.5 text-sm dark:border-zinc-800"><option value="">Select a Page...</option>{item.accountOptions.map((page) => <option key={page.id} value={page.id}>{page.name}</option>)}</select></div>}
      <div className="mt-5 flex gap-2">{connected ? <><button type="button" onClick={() => connect(platform)} disabled={isBusy} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-zinc-200 px-3 py-2.5 text-xs font-bold transition hover:bg-muted disabled:opacity-50 dark:border-zinc-800">{isBusy ? <Loader2 size={14} className="animate-spin"/> : <RefreshCw size={14}/>}Reconnect</button><button type="button" onClick={() => disconnect(platform)} disabled={isBusy} className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 px-3 py-2.5 text-xs font-bold text-rose-600 dark:border-zinc-800"><Unplug size={14}/>Disconnect</button></> : <button type="button" onClick={() => connect(platform)} disabled={isBusy} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2.5 text-xs font-bold text-primary-foreground">{isBusy ? <Loader2 size={14} className="animate-spin"/> : <ExternalLink size={14}/>}Connect {meta.label}</button>}</div>
      {item.errorMessage && <p className="mt-3 text-xs leading-5 text-rose-600">{item.errorMessage}</p>}
      {connected && <div className="mt-3 flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400"><Check size={13}/>Ready for publishing</div>}
      </section>;
    })}</div>}
  </div>;
}
''')

layout = must("apps/admin/src/app/(admin)/layout.jsx")
text = layout.read_text(encoding="utf-8")
if "  Share2,\n" not in text:
    text = text.replace('  Image,\n} from "lucide-react";', '  Image,\n  Share2,\n} from "lucide-react";', 1)
if 'href: "/social-integrations"' not in text:
    marker = '''      {\n        name: "Social Posts",\n        href: "/social-posts",\n        icon: Image,\n        permission: "articles.create",\n        description: "Branded social images",\n      },\n'''
    if marker not in text: raise SystemExit("Could not locate Social Posts navigation item.")
    text = text.replace(marker, marker + '''      {\n        name: "Social Integrations",\n        href: "/social-integrations",\n        icon: Share2,\n        permission: "social_integrations.manage",\n        description: "Connect publishing accounts",\n      },\n''', 1)
layout.write_text(text, encoding="utf-8")
print("✓ patched apps/admin/src/app/(admin)/layout.jsx")

write("server/.env.social.example", '''SOCIAL_TOKEN_ENCRYPTION_KEY=\nSOCIAL_OAUTH_STATE_SECRET=\nAPI_PUBLIC_URL=https://api.asif.to\nADMIN_URL=https://admin.asif.to\n\nMETA_APP_ID=\nMETA_APP_SECRET=\nMETA_GRAPH_VERSION=v23.0\nFACEBOOK_OAUTH_SCOPES=public_profile,pages_show_list,pages_read_engagement,pages_manage_posts\n\nINSTAGRAM_APP_ID=\nINSTAGRAM_APP_SECRET=\nINSTAGRAM_OAUTH_SCOPES=instagram_business_basic,instagram_business_content_publish\n\nLINKEDIN_CLIENT_ID=\nLINKEDIN_CLIENT_SECRET=\n''')

print("\nPhase 1 complete.")
print("Configure callback URLs:")
print("  https://api.asif.to/api/v1/social-integrations/instagram/callback")
print("  https://api.asif.to/api/v1/social-integrations/facebook/callback")
print("  https://api.asif.to/api/v1/social-integrations/linkedin/callback")
print("Then copy server/.env.social.example values into server/.env, restart backend, and run npm --prefix apps/admin run build")
