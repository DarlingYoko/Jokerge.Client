import { ModBaseEntity, ModDetailsEntity } from '@/shared/api/contracts/mods/schemas';

export type DependencyOption = { label: string; value: string };

type DetailsByKey = Record<string, ModDetailsEntity>;

/** Mod details (title, description, dependencies) are stored under the jar file name. */
export const modKey = (name: string): string => `${name}.jar`;

const modTitle = (mod: ModBaseEntity, details: DetailsByKey): string =>
  details[modKey(mod.name)]?.title || mod.name;

/** Keys of the mods that need `key`, directly or through other mods. */
const dependentsOf = (details: DetailsByKey, key: string): Set<string> => {
  const dependents = new Set<string>();
  const queue = [key];

  while (queue.length > 0) {
    const current = queue.shift() as string;
    for (const entry of Object.values(details)) {
      if (entry.dependencies?.includes(current) && !dependents.has(entry.key)) {
        dependents.add(entry.key);
        queue.push(entry.key);
      }
    }
  }

  return dependents;
};

/**
 * The optional mods `selfKey` may depend on: every other optional mod of the profile except those
 * that already need it, so the panel cannot save a loop.
 */
export const dependencyOptions = (
  mods: ModBaseEntity[],
  details: DetailsByKey,
  selfKey: string,
): DependencyOption[] => {
  const dependents = dependentsOf(details, selfKey);

  return mods
    .filter((mod) => modKey(mod.name) !== selfKey && !dependents.has(modKey(mod.name)))
    .map((mod) => ({ label: modTitle(mod, details), value: modKey(mod.name) }));
};

/** Names of this profile's optional mods that list `key` as a dependency. */
export const requiredBy = (mods: ModBaseEntity[], details: DetailsByKey, key: string): string[] =>
  mods
    .filter((mod) => details[modKey(mod.name)]?.dependencies?.includes(key))
    .map((mod) => modTitle(mod, details));
