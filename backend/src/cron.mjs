import 'dotenv/config';
import { fileURLToPath } from 'url';
import cron from 'node-cron';
import mongoose from 'mongoose';
import User from './models/User.mjs';
import { Group } from './models/Group.mjs';
import Checkin from './models/Checkin.mjs';
import PushSubscription from './models/PushSubscription.mjs';
import webpush from 'web-push';
import { log, error as logError } from './utils/logger.mjs';

const TIMEZONE = process.env.SUMMARY_TIMEZONE || 'Etc/UTC';

async function connect() {
  if (mongoose.connection.readyState === 1) return;
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('Missing MONGO_URI');
  await mongoose.connect(uri);
}

async function sendNotifications() {
  const currentHour = new Date().getHours();
  log(`Checking for groups with notification time: ${currentHour}:00`);

  // Find all groups that should be notified at this hour
  const groups = await Group.find({ notificationTime: currentHour }).populate('members');

  if (groups.length === 0) {
    log(`No groups scheduled for hour ${currentHour}`);
    return;
  }

  const today = new Date(new Date().toDateString());
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

  for (const group of groups) {
    const checkins = await Checkin.find({
      groupId: group._id,
      date: { $gte: todayStart, $lt: todayEnd }
    });
    const completedIds = checkins.filter(c => c.completed).map(c => c.userId.toString());
    const completed = group.members.filter(u => completedIds.includes(u._id.toString())).map(u => u.email);
    const pending = group.members.filter(u => !completedIds.includes(u._id.toString())).map(u => u.email);

    const summary = {
      group: group.name,
      date: today.toISOString(),
      completed,
      pending
    };
    log('[Group Summary]', summary);
    // Send Web Push to group members
    const subject = process.env.VAPID_SUBJECT || 'mailto:maintainer@guiltping.app';
    const pub = process.env.VAPID_PUBLIC_KEY;
    const priv = process.env.VAPID_PRIVATE_KEY;
    if (pub && priv) {
      webpush.setVapidDetails(subject, pub, priv);
      const payload = JSON.stringify({
        title: `${group.name} Daily Summary`,
        body: `Completed: ${completed.length}/${group.members.length} | Pending: ${pending.length}`,
        data: { group: group.name, completed, pending, date: summary.date }
      });

      // Get subscriptions for group members
      const memberIds = group.members.map(m => m._id);
      const subs = await PushSubscription.find({ userId: { $in: memberIds } });
      log('Group push dispatch', { group: group.name, subscriptions: subs.length });

      await Promise.all(subs.map(s => webpush
        .sendNotification({ endpoint: s.endpoint, keys: s.keys }, payload)
        .catch((err) => {
          logError('Push send error', { group: group.name, endpoint: s.endpoint, err: String(err) });
          return null;
        })));
    } else {
      log('VAPID keys missing; skipping push dispatch');
    }
  }
}


export function startCron() {
  // Run every hour to check for groups that need notifications
  const schedule = '0 * * * *'; // Every hour at minute 0
  log(`Starting notification cron: ${schedule} (${TIMEZONE})`);

  cron.schedule(schedule, async () => {
    await connect();
    await sendNotifications();
  }, { timezone: TIMEZONE });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  startCron();
}
