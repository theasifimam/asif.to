export const DEFAULT_ROLE_PERMISSIONS = Object.freeze({
  reader: ["content.read"],
  author: [
    "content.read", "articles.create", "articles.edit_own", "analytics.view",
    "topics.view", "interview_questions.view", "courses.view",
    "cheatsheets.view", "question_bank.view", "monetization.view", "messages.view", "messages.send", "messages.attach",
    "assets.view", "assets.upload",
  ],
  editor: [
    "content.read", "articles.create", "articles.edit_own", "articles.edit_all",
    "articles.publish", "topics.view", "topics.manage",
    "interview_questions.view", "interview_questions.manage", "courses.view",
    "courses.manage", "cheatsheets.view", "cheatsheets.manage",
    "question_bank.view", "question_bank.manage", "planner.view",
    "planner.manage", "analytics.view", "monetization.view", "seo.view", "users.view",
    "messages.view", "messages.send", "messages.attach", "messages.pin",
    "assets.view", "assets.upload", "assets.manage", "jobs.view", "jobs.manage", "job_applications.review",
  ],
  admin: [
    "communications.inbox.read",
    "communications.inbox.reply",
    "communications.inbox.assign",
    "communications.campaigns.read",
    "communications.campaigns.create",
    "communications.campaigns.send",
    "communications.subscribers.read",
    "communications.subscribers.manage",
    "communications.automations.manage",
    "communications.templates.manage",
    "communications.transactional.read",
    "communications.analytics.read",
    "communications.settings.manage",

    "content.read", "articles.create", "articles.edit_own", "articles.edit_all",
    "articles.publish", "articles.delete", "topics.view", "topics.manage",
    "interview_questions.view", "interview_questions.manage", "courses.view",
    "courses.manage", "cheatsheets.view", "cheatsheets.manage",
    "question_bank.view", "question_bank.manage", "planner.view", "planner.manage",
    "analytics.view", "monetization.view", "monetization.manage", "seo.view", "users.view", "users.create", "users.edit",
    "users.suspend", "users.delete", "authors.manage", "invitations.manage",
    "playground.manage", "social_integrations.manage", "messages.view", "messages.send", "messages.channels.manage", "messages.attach", "messages.pin", "messages.moderate",
    "assets.view", "assets.upload", "assets.manage", "jobs.view", "jobs.manage", "jobs.delete", "job_sources.manage", "job_applications.review",
  ],
  super_admin: ["*"],
});

export const ROLE_PERMISSIONS = DEFAULT_ROLE_PERMISSIONS;

export const hasPermission = (user, permission) => {
  if (!permission) return true;
  const permissions = Array.isArray(user?.permissions)
    ? user.permissions
    : DEFAULT_ROLE_PERMISSIONS[user?.role] || [];
  return permissions.includes("*") || permissions.includes(permission);
};

const routeRules = [
  [/^\/communications\/(team|discussions)(?:\/|$)/, "messages.view"],
  [/^\/communications\/inbox(?:\/|$)/, "communications.inbox.read"],
  [/^\/communications\/campaigns(?:\/|$)/, "communications.campaigns.read"],
  [/^\/communications\/subscribers(?:\/|$)/, "communications.subscribers.read"],
  [/^\/communications\/automations(?:\/|$)/, "communications.automations.manage"],
  [/^\/communications\/templates(?:\/|$)/, "communications.templates.manage"],
  [/^\/communications\/transactional(?:\/|$)/, "communications.transactional.read"],
  [/^\/communications\/analytics(?:\/|$)/, "communications.analytics.read"],
  [/^\/communications\/settings(?:\/|$)/, "communications.settings.manage"],

  [/^\/jobs\/sources(?:\/|$)/, "job_sources.manage"],
  [/^\/jobs\/applications(?:\/|$)/, "job_applications.review"],
  [/^\/jobs\/(?:new|[^/]+\/edit)(?:\/|$)/, "jobs.manage"],
  [/^\/jobs(?:\/|$)/, "jobs.view"],
  [/^\/files(?:\/|$)/, "assets.view"],
  [/^\/messages(?:\/|$)/, "messages.view"],
  [/^\/activity(?:\/|$)/, "users.view"],
  [/^\/notifications(?:\/|$)/, "articles.create"],
  [/^\/users\/invitations(?:\/|$)/, "invitations.manage"],
  [/^\/users\/roles(?:\/|$)/, "roles.manage"],
  [/^\/users\/activity(?:\/|$)/, "users.edit"],
  [/^\/users\/[^/]+(?:\/|$)/, "users.edit"],
  [/^\/users(?:\/|$)/, "users.view"],
  [/^\/analytics(?:\/|$)/, "analytics.view"],
  [/^\/monetization(?:\/|$)/, "monetization.view"],
  [/^\/seo-settings(?:\/|$)/, "seo.view"],
  [/^\/playground-settings(?:\/|$)/, "playground.manage"],
  [/^\/announcements(?:\/|$)/, "settings.manage"],
  [/^\/legal(?:\/|$)/, "settings.manage"],
  [/^\/media-audit(?:\/|$)/, "settings.manage"],
  [/^\/messages(?:\/|$)/, "users.edit"],
  [/^\/articles(?:\/|$)/, "articles.create"],
  [/^\/topics\/(?:new|[^/]+\/edit)(?:\/|$)/, "topics.manage"],
  [/^\/topics(?:\/|$)/, "topics.view"],
  [/^\/categories(?:\/|$)/, "topics.view"],
  [/^\/interview-questions\/(?:new|[^/]+\/edit)(?:\/|$)/, "interview_questions.manage"],
  [/^\/interview-questions(?:\/|$)/, "interview_questions.view"],
  [/^\/courses\/[^/]+\/categories\/[^/]+\/interview-questions(?:\/|$)/, "interview_questions.view"],
  [/^\/courses\/(?:new|[^/]+\/edit)(?:\/|$)/, "courses.manage"],
  [/^\/courses(?:\/|$)/, "courses.view"],
  [/^\/cheatsheets\/(?:new|[^/]+\/edit)(?:\/|$)/, "cheatsheets.manage"],
  [/^\/cheatsheets(?:\/|$)/, "cheatsheets.view"],
  [/^\/quiz\/(?:new|[^/]+\/edit)(?:\/|$)/, "question_bank.manage"],
  [/^\/quiz(?:\/|$)/, "question_bank.view"],
  [/^\/social-posts(?:\/|$)/, "articles.create"],
  [/^\/social-integrations(?:\/|$)/, "social_integrations.manage"],
  [/^\/planner(?:\/|$)/, "planner.view"],
];

export const permissionForPath = (pathname) =>
  routeRules.find(([pattern]) => pattern.test(pathname))?.[1] || null;

export const canAccessPath = (user, pathname) =>
  hasPermission(user, permissionForPath(pathname));
