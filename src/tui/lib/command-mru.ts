const MAX_MRU = 5;
const recent: string[] = [];

export function recordCommand(name: string): void {
  const idx = recent.indexOf(name);
  if (idx !== -1) recent.splice(idx, 1);
  recent.unshift(name);
  if (recent.length > MAX_MRU) recent.length = MAX_MRU;
}

export function getRecentCommands(): string[] {
  return [...recent];
}

export function getMruBoost(name: string): number {
  const idx = recent.indexOf(name);
  return idx === -1 ? 0 : MAX_MRU - idx;
}
