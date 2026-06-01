export const COMBO_WINDOW = 3

export const comboDamageBonusMap: Record<number, { skill: number; ultimate: number }> = {
  1: { skill: 0.3, ultimate: 0.2 },
  2: { skill: 0.45, ultimate: 0.3 },
  3: { skill: 0.6, ultimate: 0.4 },
  4: { skill: 0.75, ultimate: 0.5 },
}

export function getComboMultiplier(level: number, type: string): number {
  const entry = comboDamageBonusMap[level]
  if (!entry) return 1
  const bonus = type === 'ultimate' ? entry.ultimate : entry.skill
  return 1 + bonus
}

export interface ComboState {
  comboCount: number
  lastComboTime: number
}

export function updateCombo(state: ComboState, now: number) {
  if (now - state.lastComboTime <= COMBO_WINDOW) {
    state.comboCount = Math.min(state.comboCount + 1, 4)
  } else {
    state.comboCount = 1
  }
  state.lastComboTime = now
}
