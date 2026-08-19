import jwt from "jsonwebtoken";
import SocialIntegration from "../models/SocialIntegration.js";
import { decryptSocialSecret, encryptSocialSecret } from "../utils/socialTokenCrypto.js";

const META_VERSION = process.env.META_GRAPH_VERSION || "v23.0";
const stateSecret = () => process.env.SOCIAL_OAUTH_STATE_SECRET || process.env.JWT_SECRET;
const adminUrl = () => (process.env.ADMIN_URL || "http://localhost:3001").replace(/\/$/, "");
const apiUrl = () => (process.env.API_PUBLIC_URL || process.env.API_URL || "http://localhost:5000").replace(/\/$/, "");
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
  return save("linkedin", { status: "connected", accountId: profile.sub || "", accountName: profile.name || profile.given_name || "LinkedIn account", accountType: "member", accessTokenEncrypted: encryptSocialSecret(token.access_token), refreshTokenEncrypted: encryptSocialSecret(token.refresh_token || ""), accountTokenEncrypted: "", tokenExpiresAt: token.expires_in ? new Date(Date.now() + Number(token.expires_in) * 1000) : null, scopes: String(token.scope || "openid profile email w_member_social").split(/\s+/).filter(Boolean), accountOptions: [], errorMessage: "", connectedBy: userId, connectedAt: new Date() });
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
