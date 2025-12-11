/*
 Basic backend cron example using node-cron (JS/ESM).
 - Reads schedule from env (defaults to 8 PM UTC: "0 20 * * *")
 - Mocks summary aggregation and dispatch.
 - Replace the in-memory store and dispatcher with your backend implementation.
*/

import cron from 'node-cron';

const SCHEDULE = process.env.SUMMARY_CRON || '0 20 * * *';
const TIMEZONE = process.env.SUMMARY_TIMEZONE || 'Etc/UTC';

// Mock data store
const users = [
  { id: 'u1', name: 'Alice', completedToday: true },
  { id: 'u2', name: 'Bob', completedToday: false },
  { id: 'u3', name: 'Charlie', completedToday: true },
  { id: 'u4', name: 'Dana', completedToday: false },
  { id: 'u5', name: 'Eve', completedToday: false },
];

function aggregateSummary() {
  const completed = users.filter(u => u.completedToday).map(u => u.name);
  const pending = users.filter(u => !u.completedToday).map(u => u.name);
  return { date: new Date().toISOString(), completed, pending };
}

async function dispatchSummary(summary) {
  // Replace with actual push/email dispatch
  console.log('[GuiltPing Summary]', summary);
}

function startCron() {
  console.log(`Starting GuiltPing summary cron: ${SCHEDULE} (${TIMEZONE})`);
  cron.schedule(SCHEDULE, async () => {
    const summary = aggregateSummary();
    await dispatchSummary(summary);
  }, {
    timezone: TIMEZONE,
  });
}

startCron();
