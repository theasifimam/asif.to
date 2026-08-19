import SocialIntegration from "../models/SocialIntegration.js";
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
