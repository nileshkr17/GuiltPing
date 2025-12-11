export function log(...args) {
  const ts = new Date().toISOString();
  // eslint-disable-next-line no-console
  console.log(`[${ts}]`, ...args);
}

export function error(...args) {
  const ts = new Date().toISOString();
  // eslint-disable-next-line no-console
  console.error(`[${ts}]`, ...args);
}
