/**
 * Buff 替换逻辑：当某个 buff 含有 replaces 字段时，
 * 从列表中移除被替换的旧 buff（升级取代）。
 */

export function applyBuffReplacements<T extends { id: string; replaces?: string | string[] }>(
  buffs: T[],
  contextBuffs: T[] = [],
): T[] {
  const replacedIds = new Set<string>()
  for (const b of [...buffs, ...contextBuffs]) {
    if (b.replaces) {
      const ids = Array.isArray(b.replaces) ? b.replaces : [b.replaces]
      for (const id of ids) replacedIds.add(id)
    }
  }
  if (replacedIds.size === 0) return buffs
  return buffs.filter((b) => !replacedIds.has(b.id))
}
