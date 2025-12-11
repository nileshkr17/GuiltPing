import express from 'express';
import webpush from 'web-push';
import { log, error as logError } from '../utils/logger.mjs';
import PushSubscription from '../models/PushSubscription.mjs';
import { requireAuth } from '../middleware/auth.mjs';

const router = express.Router();

function ensureVapid() {
  const pub = process.env.VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || 'mailto:example@example.com';
  if (!pub || !priv) throw new Error('Missing VAPID keys');
  webpush.setVapidDetails(subject, pub, priv);
}

router.post('/subscribe', requireAuth, async (req, res) => {
  const userId = req.user.id;
  const subscription = req.body; // { endpoint, keys: { p256dh, auth } }
  if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
    return res.status(400).json({ error: 'Invalid subscription payload' });
  }
  await PushSubscription.updateOne(
    { endpoint: subscription.endpoint },
    { userId, endpoint: subscription.endpoint, keys: subscription.keys },
    { upsert: true }
  );
  log('Subscribed push', { userId, endpoint: subscription.endpoint });
  res.json({ ok: true });
});

router.get('/public-key', (_req, res) => {
  const pub = process.env.VAPID_PUBLIC_KEY;
  if (!pub) return res.status(500).json({ error: 'VAPID public key not configured' });
  res.json({ publicKey: pub });
});

router.post('/unsubscribe', requireAuth, async (req, res) => {
  const { endpoint } = req.body;
  if (!endpoint) return res.status(400).json({ error: 'Endpoint required' });
  await PushSubscription.deleteOne({ endpoint });
  res.json({ ok: true });
});

router.post('/test', requireAuth, async (req, res) => {
  try {
    ensureVapid();
    const userId = req.user.id;
    const subs = await PushSubscription.find({ userId });
    log('Sending test push', { userId, count: subs.length });
    const payload = JSON.stringify({ title: 'GuiltPing', body: 'Test notification' });
    await Promise.all(subs.map(s => webpush.sendNotification({ endpoint: s.endpoint, keys: s.keys }, payload).catch((err) => {
      logError('Push send error', { endpoint: s.endpoint, err: String(err) });
      return null;
    })));
    res.json({ ok: true, sent: subs.length });
  } catch (e) {
    logError('Failed to send test notification', e);
    res.status(500).json({ error: 'Failed to send test notification' });
  }
});

router.get('/debug', requireAuth, async (req, res) => {
  const userId = req.user.id;
  const count = await PushSubscription.countDocuments({ userId });
  const pub = process.env.VAPID_PUBLIC_KEY ? true : false;
  log('Debug push', { userId, subscriptions: count, vapidConfigured: pub });
  res.json({ subscriptions: count, vapidConfigured: pub });
});

export default router;
