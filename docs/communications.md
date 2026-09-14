# Communications implementation and deployment

## Workspace and existing systems reused

`/communications` opens the first permitted area. Horizontal top tabs connect Inbox, Campaigns, Subscribers, Automations, Transactional, Templates, Team, Discussions, Analytics and Settings. Campaigns, templates and automations have separate list and editor pages. Inbox details are disclosed on demand; all chat timelines reuse the original `MessageBubble` component.

Team reuses `MessagesWorkspace`, `ConversationSidebar`, `ChatHeader`, `MessageInput`, `MessageBubble`, `MessagingContext`, the existing Conversation/Message/ConversationRead collections, existing messaging APIs and the established Socket.IO server. Discussions extends the existing conversation-list API with an optional read-only overview; opening one uses the existing chat experience. No new internal chat/discussion models, routes, presence service or notification engine were created.

The existing Notification model, admin RBAC, user accounts, mention parser and Asset storage service are shared. Customer attachments use an explicit private communications scope and an authenticated inbox download route.

## New systems and models

External email functionality adds these models in `server/src/models/Communication.js`:

- CustomerMessage: customer email, admin reply and private note timeline.
- EmailSubscriber: verified consent, interests and irreversible marketing suppression through ordinary preferences.
- EmailTemplate and EmailCampaign: reusable text templates and durable campaigns.
- EmailJob: durable outbound queue, retries and delivery monitoring.
- EmailWebhookEvent: provider event deduplication and processing health.
- EmailAutomation and AutomationRun: controlled action workflows and restartable execution.
- CommunicationSettings: sender identities, topics, routing, rate limits and worker leases.

Modified models: ContactMessage remains the authoritative customer conversation and retains legacy messages/replies; Asset adds `accessScope`; Notification adds an optional unique communications deduplication key. Existing internal chat models are unchanged.

## Routes and compatibility

- Admin: `/communications`, `/communications/{inbox,campaigns,subscribers,automations,transactional,templates,team,discussions,analytics,settings}`.
- Focused editors: `/communications/{campaigns,templates,automations}/new` and `/{id}`.
- Published announcements: `/communications/campaigns/notify`, optionally `?type=article&contentId=...`.
- Web: `/email-preferences`, with signed `?token=...` links. Signup is not required.
- `/messages` redirects to `/communications/team`, retaining conversation/message query parameters.
- `/contact-inquiries` redirects to `/communications/inbox`. Legacy contact API routes remain for compatibility.

Existing APIs reused: `/messaging/conversations` (optional `overview=discussions`), team, messages, read receipts, unread, attachments, pins, reactions and discussion resolution; authenticated `/search/admin/index`; content publishing APIs remain separate from email queueing.

## New API endpoints

All below are under `/api/v1/communications`. Except `/public/*` and the signed webhook, they require authentication and the corresponding existing RBAC checks.

| Area | Endpoints |
| --- | --- |
| Inbox | `GET /inbox`, `GET /inbox/users`, `GET/PATCH /inbox/:id`, `PATCH /inbox/:id/read`, `POST /inbox/:id/messages`, `POST /inbox/:id/attachments`, `GET /inbox/attachments/:assetId`, `POST /inbox/:id/share` |
| Campaigns | `GET/POST /campaigns`, `PATCH /campaigns/:id`, `POST /campaigns/:id/action`, `POST /audience`, `POST /notify-content` |
| Subscribers | `GET /subscribers`, `PATCH /subscribers/:id` |
| Templates | `GET/POST /templates`, `PATCH /templates/:id`, `POST /preview`, `POST /test` (test recipient is the requesting admin) |
| Operations | `GET/POST /automations`, `PATCH /automations/:id`, `GET /transactional`, `POST /transactional/:id/retry`, `GET /analytics`, `GET/PATCH /settings`, `GET /search` |
| Public | `GET /public/topics`, `POST /public/subscribe`, `GET/POST /public/preferences`, `POST /public/unsubscribe?token=...` |
| Webhook | `POST /webhooks/email` |

`communications.*` permissions are registered in the existing catalog. Existing custom role overrides must be deliberately granted the new permissions; Team and Discussions continue using `messages.*` and their content permissions.

## Environment variables

Existing SMTP is preserved. No provider credentials are hardcoded.

| Variable | Purpose |
| --- | --- |
| `MONGO_URI` | Existing MongoDB database |
| `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASSWORD` | Existing SMTP transport |
| `EMAIL_SECURE`, `EMAIL_TLS_REJECT_UNAUTHORIZED` | Existing transport TLS options |
| `COMMUNICATIONS_SIGNING_SECRET` | Independent random secret, at least 32 characters; signs reply/preference links |
| `COMMUNICATIONS_WEBHOOK_SECRET` | Independent random secret, at least 32 characters; authenticates the inbound relay |
| `COMMUNICATIONS_WORKER_ENABLED=true` | Opt-in worker startup; leave disabled until sender/routing configuration is verified |
| `COMMUNICATIONS_MESSAGE_DOMAIN` | Message-ID domain; default `asif.to` |
| `WEB_URL`, `ADMIN_URL` | Public web/admin link origins |
| `PUBLIC_API_URL` | API base including `/api/v1`, used for one-click unsubscribe; default `https://api.asif.to/api/v1` |
| `NEXT_PUBLIC_API_URL` | Existing frontend API base |
| `EMAIL_LOGO_URL` | Optional absolute logo URL used by the shared branded HTML email layout; defaults to `${WEB_URL}/logo.png` |

Keep signing secrets stable. Replacing the signing secret invalidates existing preference and reply addresses; no rotating-key ring is implemented.

## Provider, inbound webhook and DNS setup

SMTP alone cannot receive customer replies or report delivery. Configure an inbound-capable provider or a trusted relay alongside the current SMTP provider. Verify each configured sender (`support@`, `updates@`, `jobs@`, `security@`) with that provider. Sender aliases must be permitted by the SMTP account.

The application accepts a **normalized signed JSON relay**, not native Mailgun/Postmark/SES payloads. The relay must first authenticate the provider's native webhook and check sender authentication/spoofing policy, then normalize the message and sign the exact JSON bytes:

```text
X-Communications-Timestamp: <current Unix seconds>
X-Communications-Signature: hex(HMAC-SHA256(webhookSecret, timestamp + "." + rawJsonBytes))
```

Timestamp tolerance is five minutes. Preserve a stable event ID on retries; sign each retry with a fresh timestamp. Retry non-2xx responses with backoff. Example inbound payload:

```json
{
  "id": "provider-stable-event-id",
  "kind": "inbound",
  "from": "customer@example.com",
  "to": "enq+<24-character-id>.<32-character-token>@reply.asif.to",
  "authenticatedSender": true,
  "messageId": "<customer-message-id@example.com>",
  "inReplyTo": "<previous-message-id@asif.to>",
  "references": ["<previous-message-id@asif.to>"],
  "subject": "Re: Course access",
  "text": "Thanks, I have another question.",
  "attachments": []
}
```

Attachments are `{name, contentType, content}` with base64 content. Maximum four files, 10 MB per file; outbound aggregate maximum is 10 MB. The webhook JSON limit is 15 MB including base64. The existing file validator restricts file types. Preserve plain text and optionally strip quoted history in the relay. `authenticatedSender` must reflect an actual provider authentication decision, never an unverified sender-supplied header.

Support replies use signed `enq+...@reply.asif.to` addresses. Marketing replies use signed `mail+...@reply.asif.to` addresses tied to the recipient's EmailJob; subsequent support replies use the customer conversation address. A different sender cannot append to the conversation. Subject matching alone is never used. Direct email to configured inbox addresses opens a new conversation.

Delivery payload:

```json
{"id":"stable-delivery-event-id","kind":"delivery","messageId":"<email-job-id@asif.to>","event":"BOUNCED","hardBounce":true}
```

Supported events: DELIVERED, FAILED, BOUNCED, COMPLAINED, OPENED, CLICKED, UNSUBSCRIBED. Use the original RFC Message-ID, not a provider-specific unrelated ID. Hard bounces and complaints suppress marketing immediately. Mandatory legacy account/security emails remain independent.

DNS manual work: configure provider-supplied MX records for `reply.asif.to`, route its signed addresses to the relay, and route the configured support inbox. Publish the sending provider's SPF and DKIM records, configure DMARC appropriate to the existing domain, and verify all sender identities. Exact record values depend on the chosen provider and are not generated by this code.

## Queue and migration

No Redis dependency is introduced. MongoDB stores jobs, campaign recipient cursors, retry timestamps, automation cursors and worker leases. One delivery runs at a time across API processes, with configurable rate limiting, batches of 100 recipients, exponential backoff and restart recovery. Ensure all instances share the same MongoDB and private upload volume.

SMTP cannot guarantee exactly-once delivery after an interrupted transmission. An ambiguous send is marked failed and is not automatically retried. Reconcile the provider's logs before arranging a resend. Security tokens are never replayed through the admin retry button. Legacy immediate sends retain their behavior and log metadata only, without storing OTP/reset bodies.

From `server/`:

```sh
node src/scripts/migrate-communications.js
node src/scripts/migrate-communications.js --apply
```

The first command reports without creating indexes or changing data. `--apply` creates additive indexes and idempotently backfills customer timelines, numbers and user references. It never deletes legacy enquiries or auto-subscribes existing users. Back up the database first. Run during a controlled deployment before enabling the worker. Re-running is safe; it does not drop existing indexes.

## Production rollout

1. Back up MongoDB and uploads. Deploy backend/frontend code with the worker disabled.
2. Run the migration report, then the explicit apply command. Review role grants.
3. Configure secrets, link origins, SMTP-authorized sender identities, subscription topics and sender footer.
4. Configure DNS and the authenticated inbound/delivery relay. Block `/uploads/private/` at any reverse proxy or CDN that serves the upload directory directly; the Express server already blocks this path.
5. Test support outbound/inbound threading with controlled test mailboxes, then enable the durable worker and send a small opt-in campaign.
6. Monitor Settings → Delivery and Transactional for provider errors, worker health and delivery events.

## Validation and remaining manual work

Backend regression suite: `cd server && npm test`. Communications tests use mocked persistence and SMTP; they never send email. Browser fixtures: start a local admin build on port 3100 and headless Chrome CDP on 9333, then run `node tests/communications-browser.mjs` from `apps/admin`. It intercepts external HTTP and uses fixture users/messages.

For offline compiler validation, `apps/admin/tests/font-responses.cjs` can be supplied through Next's `NEXT_FONT_GOOGLE_MOCKED_RESPONSES` test variable and `next build --webpack`. It substitutes local Arial only in that test build; production fonts and font-fetch configuration are unchanged.

Before production, manually verify live realtime messages, presence, mentions, discussion links, team enquiry references, contact creation, SMTP acceptance, same-thread Gmail/Outlook replies, attachment downloads, duplicate provider retries, assignment permissions, one-click unsubscribe, hard-bounce suppression and paused/cancelled campaigns. Credentials, sender verification, DNS, native-provider relay integration and production migration have not been performed automatically.

## Known limits

- Native provider adapters, webhook relay hosting, open/click tracking enablement and domain verification remain deployment work.
- Single-delivery worker concurrency favors predictable SMTP throughput; it is not a high-volume multi-worker ESP replacement.
- Templates are controlled plain text rendered safely as HTML; no arbitrary HTML/script editor or drag-and-drop designer.
- Automated source scans run in bounded batches about every 30 seconds. A rule processes a source record once; inactivity means an existing lastActiveAt older than 30 days. Legacy records created before a registration rule are not automatically replayed. Content update announcements are explicitly available from editors.
- Existing discussion types are preserved; unsupported types, including jobs, do not gain a new discussion system.
- Legacy `/contact` reply clients retain their old immediate SMTP flow; the unified inbox uses durable replies and signed routing.
- No database transaction spans MongoDB and SMTP. Idempotency keys protect replay, and ambiguous transmission outcomes require reconciliation.
