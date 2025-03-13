import { setTimeout } from 'node:timers/promises';

// pseudo auth with IO
export async function onAuth(parseCookie) {
  const value0 = parseCookie();
  const value1 = await setTimeout(10, value0);
  return value1;
}
