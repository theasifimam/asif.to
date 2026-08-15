import PlaygroundSetting from "../models/PlaygroundSetting.js";
import AuditLog from "../models/AuditLog.js";

const REGISTRY = ["javascript", "typescript", "html", "css", "web", "react", "react-typescript", "nextjs", "python", "c", "cpp", "java"];
const defaults = () => ({
  editorEnabled: true, executionEnabled: true, maintenanceMessage: "",
  languages: Object.fromEntries(REGISTRY.map((value, order) => [value, { enabled: true, selectable: true, executionEnabled: true, order }])),
  runtimes: { sandpack: true, python: true, clang: true, java: true, nextjs: true },
  limits: { executionTimeoutMs: 10000, maxOutputChars: 20000, maxSourceChars: 100000, runCooldownMs: 500 },
  features: { preview: true, console: true, testCases: true, sharing: true, download: true, persistence: true },
});

function plain(item) {
  const fallback = defaults();
  const value = item?.toObject?.() || item || {};
  const languages = { ...fallback.languages, ...(value.languages instanceof Map ? Object.fromEntries(value.languages) : value.languages) };
  return { ...fallback, ...value, languages, runtimes: { ...fallback.runtimes, ...(value.runtimes instanceof Map ? Object.fromEntries(value.runtimes) : value.runtimes) }, limits: { ...fallback.limits, ...value.limits }, features: { ...fallback.features, ...value.features } };
}

export async function getPublicPlaygroundSetting(_req, res) {
  const item = await PlaygroundSetting.findOne({ key: "default", status: "published" }).lean();
  res.set("Cache-Control", "no-store").json({ success: true, data: plain(item) });
}

export async function getPlaygroundSetting(_req, res) {
  const item = await PlaygroundSetting.findOne({ key: "default-draft" }).lean() || await PlaygroundSetting.findOne({ key: "default" }).lean();
  res.json({ success: true, data: plain(item) });
}

export async function savePlaygroundSetting(req, res) {
  const body = req.body || {};
  const current = await PlaygroundSetting.findOne({ key: "default-draft" }) || await PlaygroundSetting.findOne({ key: "default" });
  const isDraft = body.status === "draft";
  const data = { ...defaults(), ...(current?.toObject() || {}), ...body, key: isDraft ? "default-draft" : "default", status: isDraft ? "draft" : "published", updatedBy: req.user._id };
  data.languages = Object.fromEntries(REGISTRY.map((id, order) => [id, { ...defaults().languages[id], ...(body.languages?.[id] || current?.languages?.get?.(id) || {}), order }]));
  data.runtimes = Object.fromEntries(Object.keys(defaults().runtimes).map((id) => [id, body.runtimes?.[id] !== undefined ? Boolean(body.runtimes[id]) : (current?.runtimes?.get?.(id) ?? true)]));
  delete data._id; delete data.createdAt; delete data.updatedAt; delete data.version; delete data.__v;
  const item = await PlaygroundSetting.findOneAndUpdate({ key: data.key }, { $set: data, $inc: { version: 1 } }, { upsert: true, new: true, runValidators: true });
  await AuditLog.create({ actor: req.user._id, action: `playground_settings_${data.status === "published" ? "published" : "saved"}`, metadata: { version: item.version } });
  res.json({ success: true, data: plain(item) });
}

export async function publishPlaygroundSetting(req, res) {
  const draft = await PlaygroundSetting.findOne({ key: "default-draft" }).lean();
  const next = plain(draft); delete next._id; delete next.createdAt; delete next.updatedAt; delete next.version; delete next.__v;
  const item = await PlaygroundSetting.findOneAndUpdate({ key: "default" }, { $set: { ...next, key: "default", status: "published", updatedBy: req.user._id }, $inc: { version: 1 } }, { new: true, upsert: true, runValidators: true });
  await AuditLog.create({ actor: req.user._id, action: "playground_settings_published", metadata: { version: item.version } });
  res.json({ success: true, data: plain(item) });
}
