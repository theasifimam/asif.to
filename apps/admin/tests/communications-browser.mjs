// Run against a local admin build and headless Chrome on CDP port 9333.
// All non-local HTTP requests are intercepted; no real users or emails are touched.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const origin = 'http://localhost:3100';
const target = await (await fetch('http://127.0.0.1:9333/json/new?about:blank', { method: 'PUT' })).json();
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise(resolve => ws.addEventListener('open', resolve, { once: true }));
let sequence = 0;
const pending = new Map(), errors = [], requests = [];
function send(method, params = {}) { const id = ++sequence; return new Promise((resolve, reject) => { pending.set(id, { resolve, reject }); ws.send(JSON.stringify({ id, method, params })); }); }
const admin = { _id: '507f1f77bcf86cd799439012', fullName: 'Support Admin', username: 'admin', email: 'admin@example.com', role: 'super_admin', permissions: ['*'], status: 'active' };
const contact = { _id: '507f1f77bcf86cd799439011', conversationNumber: 'ENQ-1051', name: 'Alex Reader', email: 'alex@example.com', subject: 'Help accessing the React course', conversationStatus: 'OPEN', priority: 'NORMAL', source: 'CONTACT_FORM', unreadCount: 1, tags: [], createdAt: '2026-09-13T08:00:00Z' };
const messages = [
  { _id: '507f1f77bcf86cd799439021', direction: 'CUSTOMER', text: 'Hi! I cannot access the React course. Could you help?', createdAt: '2026-09-13T08:00:00Z', deliveryStatus: 'RECEIVED' },
  { _id: '507f1f77bcf86cd799439022', direction: 'ADMIN', sender: admin, text: 'Of course, Alex. I am checking your course access now.', createdAt: '2026-09-13T08:01:00Z', deliveryStatus: 'SENT' },
  { _id: '507f1f77bcf86cd799439023', direction: 'NOTE', sender: admin, text: 'The team is checking the course permissions.', createdAt: '2026-09-13T08:02:00Z', deliveryStatus: 'INTERNAL' },
];
const team = { _id: '507f1f77bcf86cd799439031', type: 'channel', name: 'General', members: [admin], unreadCount: 2, lastMessageText: 'The course update is ready.', lastMessageAt: '2026-09-13T08:00:00Z' };
const campaign = { _id: '507f1f77bcf86cd799439041', name: 'This week on asif.to', subject: 'New React lessons', text: 'Hi {{firstName}}, here are this week’s lessons.', topics: ['React'], kind: 'newsletter', stream: 'MARKETING', status: 'DRAFT' };
const template = { _id: '507f1f77bcf86cd799439051', name: 'Course access help', subject: 'Your course access', text: 'Hi {{firstName}}, we can help you access your course.', category: 'Support' };
function response(url, method) {
  const path = new URL(url).pathname.replace(/^.*\/api\/v1/, '');
  if (path.endsWith('/auth/me')) return { user: admin };
  if (path.endsWith('/communications/inbox/users')) return [admin];
  if (path.endsWith('/communications/inbox')) return { items: [contact], total: 1, unread: 1 };
  if (path.includes('/communications/inbox/')) return { conversation: contact, messages, hasMore: false };
  if (path.endsWith('/communications/public/topics')) return { topics: ['General Newsletter', 'React', 'New Articles', 'Course Updates', 'Job Alerts'] };
  if (path.endsWith('/communications/templates')) return { items: [template] };
  if (path.endsWith('/communications/campaigns')) return { items: [campaign] };
  if (path.endsWith('/communications/audience')) return { count: 2410 };
  if (path.endsWith('/communications/subscribers')) return { items: [], total: 0 };
  if (path.endsWith('/communications/automations')) return { items: [], runs: [] };
  if (path.endsWith('/communications/transactional')) return { items: [], total: 0 };
  if (path.endsWith('/communications/settings')) return { settings: { topics: ['React', 'Job Alerts'], senders: { SUPPORT: 'support@asif.to', MARKETING: 'updates@asif.to', JOBS: 'jobs@asif.to', SECURITY: 'security@asif.to', TRANSACTIONAL: 'support@asif.to' }, replyDomain: 'reply.asif.to', inboundAddresses: ['support@asif.to'], footer: 'asif.to', ratePerMinute: 30 }, health: { smtpConfigured: true, signedRepliesConfigured: false, webhookConfigured: false, workerEnabled: false }, events: [] };
  if (path.endsWith('/messaging/conversations')) return { conversations: [team] };
  if (path.endsWith('/messaging/team')) return { users: [admin] };
  if (path.endsWith('/messaging/unread')) return { totalUnread: 2, conversations: { [team._id]: 2 } };
  if (path.endsWith('/read')) return { read: true };
  if (path.endsWith('/members')) return { users: [admin] };
  if (path.endsWith('/pins')) return { pins: [] };
  if (path.endsWith('/messages')) return { messages: [{ _id: messages[0]._id, senderId: { ...admin, _id: contact._id, fullName: 'Saif' }, content: 'The course update is ready.', createdAt: contact.createdAt, reactions: [], attachments: [] }, { _id: messages[1]._id, senderId: admin, content: 'Great, I will review it now.', createdAt: contact.createdAt, reactions: [], attachments: [] }], hasMore: false };
  if (path.includes('/notifications')) return { notifications: [], unreadCount: 0, items: [], total: 0 };
  if (path.includes('/notes')) return { notes: [], items: [] };
  if (path.includes('/search/')) return { items: [] };
  if (method !== 'GET' && method !== 'OPTIONS') throw new Error(`Unexpected mutation in browser test: ${method} ${path}`);
  return { items: [], data: [], settings: {}, notes: [], unreadCount: 0 };
}
ws.addEventListener('message', async event => {
  const message = JSON.parse(event.data);
  if (message.id) { const job = pending.get(message.id); pending.delete(message.id); if (message.error) job?.reject(new Error(message.error.message)); else job?.resolve(message.result); return; }
  if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text);
  if (message.method === 'Fetch.requestPaused') {
    const { requestId, request } = message.params;
    try {
      if (request.url.startsWith(origin)) { await send('Fetch.continueRequest', { requestId }); return; }
      requests.push(request.url);
      if (!request.url.includes('/api/') && !request.url.includes('/auth/') && !request.url.includes('/messaging/')) { await send('Fetch.failRequest', { requestId, errorReason: 'BlockedByClient' }); return; }
      const data = response(request.url, request.method);
      await send('Fetch.fulfillRequest', { requestId, responseCode: 200, responseHeaders: [{ name: 'Content-Type', value: 'application/json' }, { name: 'Access-Control-Allow-Origin', value: origin }, { name: 'Access-Control-Allow-Credentials', value: 'true' }, { name: 'Access-Control-Allow-Headers', value: 'authorization,content-type,ngrok-skip-browser-warning' }, { name: 'Access-Control-Allow-Methods', value: 'GET,POST,PATCH,OPTIONS' }], body: Buffer.from(JSON.stringify({ success: true, data })).toString('base64') });
    } catch (error) { if (!error.message.includes("Invalid InterceptionId")) errors.push(error.message); await send('Fetch.failRequest', { requestId, errorReason: 'BlockedByClient' }).catch(() => {}); }
  }
});
await send('Page.enable'); await send('Runtime.enable'); await send('Network.enable');
await send('Network.setBlockedURLs', { urls: ['*socket.io*'] });
await send('Fetch.enable', { patterns: [{ urlPattern: '*' }] });
await send('Page.addScriptToEvaluateOnNewDocument', { source: "localStorage.setItem('asif_admin_token','local-browser-fixture-only');" });
const evaluate = async expression => { const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }); if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text); return result.result.value; };
async function waitFor(expression) { for (let i = 0; i < 80; i++) { if (await evaluate(expression)) return; await new Promise(r => setTimeout(r, 150)); } throw new Error(`Timed out: ${expression}\n${await evaluate('document.body?.innerText')}`); }
async function open(path) { await send('Page.navigate', { url: origin + path }); }
await fs.mkdir('.tmp-communications-ui', { recursive: true });
async function screenshot(name) { const image = await send('Page.captureScreenshot', { format: 'png' }); await fs.writeFile(`.tmp-communications-ui/${name}.png`, Buffer.from(image.data, 'base64')); }
try {
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 960, deviceScaleFactor: 1, mobile: false });
  await open(`/communications/inbox?conversation=${contact._id}`);
  await waitFor("document.body?.innerText.includes('I am checking your course access now.')");
  assert.equal(await evaluate("document.querySelectorAll('[id^=\"msg-\"]').length"), 3);
  assert.equal(await evaluate("!!document.querySelector('[role=dialog]')"), false);
  assert.equal(await evaluate("document.querySelector('[role=log]').scrollHeight > 0"), true);
  assert.equal(await evaluate("document.documentElement.scrollWidth <= innerWidth"), true);
  await screenshot('inbox-desktop');
  await evaluate("Array.from(document.querySelectorAll('button')).find(b => b.innerText === 'Details').click()");
  await waitFor("document.querySelector('[role=dialog]')?.innerText.includes('Assigned to')");
  await screenshot('inbox-details');
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape' });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape' });
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await screenshot('inbox-mobile');
  assert.equal(await evaluate("document.documentElement.scrollWidth <= innerWidth"), true);
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 960, deviceScaleFactor: 1, mobile: false });
  await open(`/messages?conversation=${team._id}`);
  await waitFor("document.body?.innerText.includes('Great, I will review it now.')");
  assert.equal(await evaluate("location.pathname"), '/communications/team');
  assert.ok(await evaluate("document.querySelector('[id^=\"msg-\"]').getBoundingClientRect().height > 0"));
  await screenshot('team-desktop');
  await open('/communications/campaigns');
  await waitFor("document.body?.innerText.includes('This week on asif.to')");
  assert.equal(await evaluate('document.querySelectorAll("textarea").length'), 0);
  await screenshot('campaign-list');
  await open(`/communications/campaigns/${campaign._id}`);
  await waitFor("document.body?.innerText.includes('Write your email')");
  assert.equal(await evaluate('document.querySelectorAll("textarea").length'), 1);
  await screenshot('campaign-editor');
  await open('/communications/settings');
  await waitFor("document.body?.innerText.includes('General settings')");
  assert.equal(await evaluate("document.body?.innerText.includes('SMTP credentials')"), false);
  await screenshot('settings');
  assert.deepEqual(errors, []);
  console.log('PASS: desktop/mobile inbox, shared message bubbles, details disclosure, legacy team redirect, campaign list/editor separation, settings.');
} catch (error) { console.error(error.message); console.error('Browser errors:', errors); console.error('API routes:', [...new Set(requests)].map(url => new URL(url).pathname)); process.exitCode = 1; }
finally { await send('Page.close').catch(() => {}); ws.close(); }
