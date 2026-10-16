const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const logger = require('firebase-functions/logger');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

admin.initializeApp();
const SMTP_HOST = defineSecret('SMTP_HOST');
const SMTP_PORT = defineSecret('SMTP_PORT');
const SMTP_USER = defineSecret('SMTP_USER');
const SMTP_PASS = defineSecret('SMTP_PASS');
const MAIL_FROM = defineSecret('MAIL_FROM');
const db = admin.database();
const siteUrl = 'https://letsscore.online/login.html';
const genericReply = { ok: true };

function normalizeEmail(v) {
  if (typeof v !== 'string') return '';
  return v.trim().toLowerCase().slice(0, 254);
}
function normalizeUsername(v) {
  if (typeof v !== 'string') return '';
  return v.trim().toLowerCase().slice(0, 40);
}
function hashKey(s) { return crypto.createHash('sha256').update(s).digest('hex'); }
async function rateLimit(key) {
  const now = Date.now();
  const ref = db.ref('_accountRecoveryLimits/' + hashKey(key));
  const result = await ref.transaction(old => {
    const record = old && typeof old === 'object' ? old : { windowStart: now, count: 0 };
    let next = record;
    if (now - Number(record.windowStart || 0) > 60 * 60 * 1000) next = { windowStart: now, count: 0 };
    if (next.count >= 3) return;
    return { windowStart: next.windowStart, count: next.count + 1, expiresAt: now + 24 * 60 * 60 * 1000 };
  });
  return result.committed;
}
function mailer() {
  return nodemailer.createTransport({
    host: SMTP_HOST.value(),
    port: Number(SMTP_PORT.value() || 587),
    secure: Number(SMTP_PORT.value() || 587) === 465,
    auth: { user: SMTP_USER.value(), pass: SMTP_PASS.value() }
  });
}
async function sendMail(to, subject, text) {
  await mailer().sendMail({ from: MAIL_FROM.value(), to, subject, text });
}

exports.requestAccountRecovery = onCall({
  region: 'us-central1',
  maxInstances: 3,
  enforceAppCheck: false,
  secrets: [SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM]
}, async request => {
  const body = request.data || {};
  const action = body.action;
  const contactEmail = normalizeEmail(body.contactEmail);
  const username = normalizeUsername(body.username);
  if (!['password', 'username'].includes(action) || !contactEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
    throw new HttpsError('invalid-argument', 'Enter a valid recovery request.');
  }
  if (action === 'password' && (!username || !/^[a-z0-9]{2,40}$/.test(username))) {
    throw new HttpsError('invalid-argument', 'Enter the username used at registration.');
  }
  const throttleKey = action + ':' + (action === 'password' ? username + ':' : '') + contactEmail;
  if (!(await rateLimit(throttleKey))) return genericReply;

  try {
    const profilesRef = db.ref('studentProfiles');
    let matches = [];
    if (action === 'password') {
      const snap = await profilesRef.orderByChild('username').equalTo(username).limitToFirst(2).once('value');
      snap.forEach(child => { matches.push({ uid: child.key, profile: child.val() || {} }); });
      const found = matches.find(x => normalizeEmail(x.profile.contactEmail) === contactEmail && x.profile.role !== 'admin');
      if (found && typeof found.profile.email === 'string') {
        const link = await admin.auth().generatePasswordResetLink(found.profile.email, { url: siteUrl, handleCodeInApp: false });
        await sendMail(contactEmail, 'LET’S SCORE password reset',
          'A password reset was requested for your LET’S SCORE account.\n\nOpen this secure Firebase link to set a new password:\n' + link +
          '\n\nAfter resetting, sign in using your generated username and the new password. If you did not request this, ignore this email.\n\nLET’S SCORE Support');
      }
    } else {
      const snap = await profilesRef.orderByChild('contactEmail').equalTo(contactEmail).limitToFirst(10).once('value');
      snap.forEach(child => { const p = child.val() || {}; if (p.username && p.role !== 'admin') matches.push(p.username); });
      const unique = [...new Set(matches)].slice(0, 10);
      if (unique.length) {
        await sendMail(contactEmail, 'LET’S SCORE username recovery',
          'Your LET’S SCORE username(s):\n\n' + unique.join('\n') +
          '\n\nKeep your username private. If you did not request this, you can ignore this email.\n\nLET’S SCORE Support');
      }
    }
  } catch (err) {
    logger.error('Account recovery processing failed', { code: err && err.code ? err.code : 'unknown' });
    // Do not expose whether an account exists to the caller.
    // SMTP/configuration failures are logged for the project administrator.
  }
  return genericReply;
});
