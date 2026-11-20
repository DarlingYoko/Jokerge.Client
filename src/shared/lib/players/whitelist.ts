type NamedPlayer = { name: string; uuid: string };

/** Search results with a flag for players that are already in the profile whitelist. */
export const markWhitelisted = <T extends NamedPlayer>(players: T[], whitelist: NamedPlayer[]) => {
  const inList = new Set(whitelist.map((w) => w.uuid));
  return players.map((player) => ({ player, inWhitelist: inList.has(player.uuid) }));
};

export const filterPlayersByName = <T extends NamedPlayer>(players: T[], query: string): T[] => {
  const needle = query.trim().toLowerCase();
  const filtered = needle ? players.filter((p) => p.name.toLowerCase().includes(needle)) : players;
  return [...filtered].sort((a, b) => a.name.localeCompare(b.name, 'ru', { sensitivity: 'base' }));
};
