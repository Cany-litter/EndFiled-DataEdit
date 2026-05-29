<template>
  <div class="dps-page">
    <div class="dps-layout">
      <div class="left-panel">
        <el-card shadow="never">
          <template #header><span>排轴伤害</span></template>

          <el-form label-position="top" size="small">
            <el-form-item label="排轴方案">
              <el-select v-model="selectedScenarioId" filterable placeholder="选择方案" style="width:100%" @change="onScenarioSelect">
                <el-option v-for="s in scenarios" :key="s.id" :label="s.name" :value="s.id" />
              </el-select>
            </el-form-item>

            <div v-if="teamData" style="font-size:14px;font-weight:600;margin-bottom:8px;padding:6px 8px;background:#f0f5ff;border-radius:4px">
              配队: {{ teamData.name }}
            </div>

            <template v-if="memberConfigs.length">
              <el-divider content-position="left">技能库</el-divider>
              <div class="lib-section">
                <div v-for="(mc, ci) in memberConfigs" :key="mc.charId" class="char-block" :class="{ 'char-selected': selectedCharIndex === ci }" @click="selectedCharIndex = ci">
                  <div class="char-header">
                    <span class="slot-badge" :style="{ background: slotColors[ci] }">{{ ci + 1 }}</span>
                    <span class="char-name">{{ mc.name }}</span>
                    <span class="char-atk">攻 {{ mc.attack.toFixed(0) }}</span>
                  </div>
                  <div class="skill-chips">
                    <div v-for="sk in mc.availableSkills" :key="sk.id"
                      class="skill-chip" :class="['type-' + sk.type, { active: selectedSkillId === sk.id }]"
                      @click.stop="selectedSkillId = (selectedSkillId === sk.id ? null : sk.id)">
                      <span class="skill-icon">{{ skillIcon(sk.type) }}</span>
                      <span class="skill-name">{{ sk.name }}</span>
                      <span class="skill-mult" v-if="skillLv12Map[sk.id]">{{ (skillLv12Map[sk.id] * 100).toFixed(0) }}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <el-divider content-position="left">增益库</el-divider>
              <div class="lib-section gain-section">
                <div v-for="g in allGains" :key="g.id"
                  class="gain-chip" :class="{ active: selectedGainId === g.id }"
                  @click="selectedGainId = (selectedGainId === g.id ? null : g.id)">
                  <span class="gain-icon">益</span>
                  <span class="gain-name">{{ g.name }}</span>
                  <span class="gain-meta">{{ gainMeta(g) }}</span>
                </div>
              </div>

              <el-button type="primary" style="width:100%;margin-top:8px" @click="runSim">开始模拟</el-button>
            </template>
          </el-form>
        </el-card>
      </div>

      <div class="right-panel">
        <template v-if="result && result.members.length > 0">
          <el-tabs v-model="activeResultTab" type="border-card" size="small" style="margin-bottom:8px">
            <el-tab-pane v-for="mr in result.members" :key="mr.name" :label="mr.name" :name="mr.name">
              <div class="toolbar">
                <el-button size="small" @click="addSelfBuffCol">+ 己方增益列</el-button>
                <el-button size="small" @click="addEnemyBuffCol">+ 敌人增益列</el-button>
                <span style="font-size:12px;color:#909399;margin-left:8px">
                  点击技能库技能替换技能名称 | 点击增益库填入增益列
                </span>
              </div>
              <el-table :data="mr.actionRows" border stripe size="small" style="width:100%" max-height="320px">
                <el-table-column label="序号" type="index" width="50" />
                <el-table-column label="时间" width="60">
                  <template #default="{ row }">{{ row.time.toFixed(1) }}s</template>
                </el-table-column>
                <el-table-column label="技能类型" width="70">
                  <template #default="{ row }">{{ typeLabel(row.skillType) }}</template>
                </el-table-column>
                <el-table-column label="技能名称" min-width="100">
                  <template #default="{ row }">
                    <span class="clickable-cell" @click="replaceSkill(row)">{{ row.skillName }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="伤害类型" width="70">
                  <template #default="{ row }">{{ row.damageType || '-' }}</template>
                </el-table-column>
                <el-table-column v-for="(_, ci) in selfBuffColCount" :key="'sb' + ci" :label="'己方增益' + (ci + 1)" width="80">
                  <template #default="{ row }">
                    <span class="clickable-cell buff-cell" :class="{ filled: row.selfBuffs[ci] }" @click="fillSelfBuff(row, ci)">
                      {{ row.selfBuffs[ci] ? gainName(row.selfBuffs[ci]) : '+' }}
                    </span>
                  </template>
                </el-table-column>
                <el-table-column label="命中目标" width="70">
                  <template #default="{ row }">
                    <el-input-number v-model="row.targetCount" :min="1" :max="10" size="small" style="width:60px" />
                  </template>
                </el-table-column>
                <el-table-column v-for="(_, ci) in enemyBuffColCount" :key="'eb' + ci" :label="'敌方增益' + (ci + 1)" width="80">
                  <template #default="{ row }">
                    <span class="clickable-cell buff-cell" :class="{ filled: row.enemyBuffs[ci] }" @click="fillEnemyBuff(row, ci)">
                      {{ row.enemyBuffs[ci] ? gainName(row.enemyBuffs[ci]) : '+' }}
                    </span>
                  </template>
                </el-table-column>
                <el-table-column label="造成伤害" width="100">
                  <template #default="{ row }">{{ Math.round(row.damage).toLocaleString() }}</template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
          </el-tabs>

          <el-card shadow="never">
            <template #header><span>伤害统计</span></template>
            <el-table :data="statRows" border stripe size="small">
              <el-table-column prop="name" label="干员" width="80" />
              <el-table-column label="总伤害" width="130">
                <template #default="{ row }">{{ row.totalDamage.toFixed(0) }}</template>
              </el-table-column>
              <el-table-column label="DPS" width="90">
                <template #default="{ row }">{{ row.dps.toFixed(1) }}</template>
              </el-table-column>
              <el-table-column label="占比" width="70">
                <template #default="{ row }">{{ (row.pct * 100).toFixed(1) }}%</template>
              </el-table-column>
              <el-table-column label="消耗技力" width="80">
                <template #default="{ row }">{{ row.totalSpUsed }}</template>
              </el-table-column>
            </el-table>
          </el-card>
        </template>

        <div v-else style="display:flex;align-items:center;justify-content:center;height:400px;color:#909399;font-size:14px">
          <div style="text-align:center;line-height:2">
            <div>📊 排轴伤害计算器</div>
            <div style="font-size:12px">选择一个排轴方案开始</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { TeamApi, CharacterApi, BuildApi, WeaponApi, EquipmentApi, SkillApi, SkillLevelApi, SkillActionApi, GainApi, TimelineApi } from '../../api'
import type { Team, Gain } from '../../api'
import { calcFinalStats, type FinalStats } from '../../engine/formulas/stats'
import { simulateRows } from '../../engine/simulation/teamEngine'
import type { ActionRow, SimulateRowsConfig, TeamSimulationResult } from '../../engine/simulation/types'
import type { Track } from '../../engine/types/timeline'

const route = useRoute()

// ── State ──
const scenarios = ref<any[]>([])
const selectedScenarioId = ref('')
const allGains = ref<Gain[]>([])
const memberConfigs = reactive<{ name: string; charId: string; attack: number; stats: FinalStats; availableSkills: any[]; weaponName: string }[]>([])
const teamData = ref<Team | null>(null)
const actionRows = ref<ActionRow[]>([])
const selfBuffColCount = ref(0)
const enemyBuffColCount = ref(0)
const selectedSkillId = ref<string | null>(null)
const selectedGainId = ref<string | null>(null)
const selectedCharIndex = ref(0)
const activeResultTab = ref('')

// Skill data maps (for replacement lookup)
const skillLv12Map = ref<Record<string, number>>({})
const skillTypeMap = ref<Record<string, string>>({})
const skillDamageTypeMap = ref<Record<string, string>>({})
const charSkillMap = ref<Record<string, any[]>>({})
const charOrder = ref<string[]>([])

const result = ref<TeamSimulationResult | null>(null)

const slotColors = ['#e74c3c', '#e67e22', '#2ecc71', '#3498db']

// ── Helpers ──
function skillIcon(type: string) {
  const m: Record<string, string> = { normal: '普', attack: '普', skill: '技', chain: '连', link: '连', ultimate: '终', talent1: '天1', talent2: '天2' }
  return m[type] || type.slice(0, 2)
}

function typeLabel(t: string) {
  const m: Record<string, string> = { normal: '普攻', attack: '普攻', skill: '战技', chain: '连携', link: '连携', ultimate: '终结', execution: '处决', talent1: '天赋', talent2: '天赋' }
  return m[t] || t
}

function gainMeta(g: Gain) {
  const parts: string[] = []
  if (g.effectCategory) parts.push(g.effectCategory)
  if (g.effectType) parts.push(g.effectType)
  if (g.effectValue != null) parts.push(g.valueType === 'percentage' ? (g.effectValue * 100).toFixed(1) + '%' : String(g.effectValue))
  if (g.duration) parts.push(g.duration + 's')
  return parts.join(' | ') || ''
}

function gainName(id: string) {
  const g = allGains.value.find(x => x.id === id)
  return g ? g.name : id.slice(0, 6)
}

function mapActionTypeToSkillType(type: string): string {
  const m: Record<string, string> = { attack: 'normal', skill: 'skill', link: 'chain', ultimate: 'ultimate', execution: 'other' }
  return m[type] ?? 'other'
}

function applyAttr(equip: any, type: string, value: number) {
  const v = value < 1 ? value : value / 100
  if (type.includes('力量') || type === 'str') { equip.str += value; return }
  if (type.includes('敏捷') || type === 'agi') { equip.agi += value; return }
  if (type.includes('智识') || type === 'int') { equip.int += value; return }
  if (type.includes('意志') || type === 'wil') { equip.wil += value; return }
  if (type.includes('攻击力') || type === 'atk') { equip.atkPercent += v; return }
  if (type.includes('生命值') || type === 'hp') { equip.hpPercent += v; return }
  if (type.includes('防御力') || type === 'def') { equip.defPercent += v; return }
  if (type.includes('暴击率')) { equip.critRate += v; return }
  if (type.includes('暴击伤害')) { equip.critDamage += v; return }
  if (type.includes('增伤') || type.includes('伤害加成')) { equip.damageBonus += v; return }
  if (type.includes('源石技艺')) { equip.artsMastery += value; return }
  if (type.includes('充能')) { equip.energyRecharge += v; return }
}

// ── Scenario select ──
async function onScenarioSelect(id: string) {
  const sc = await TimelineApi.get(id)
  if (!sc) return
  result.value = null
  actionRows.value = []
  memberConfigs.length = 0
  selectedSkillId.value = null
  selectedGainId.value = null
  selfBuffColCount.value = 0
  enemyBuffColCount.value = 0

  let tracks: Track[] = []
  if (sc.tracks) { try { tracks = JSON.parse(sc.tracks) as Track[] } catch { tracks = [] } }

  if (!sc.teamId) { ElMessage.warning('方案没有关联配队'); return }
  const team = await TeamApi.get(sc.teamId)
  teamData.value = team

  // Load character + build + skill data
  const chars = await CharacterApi.listAll()
  const allBuilds = await BuildApi.listAll()
  const weapons = await WeaponApi.listAll()
  const allEquipment = await EquipmentApi.listAll()
  const allSkills = await SkillApi.listAll()
  const allLevels = await SkillLevelApi.listAll()
  const allActions = await SkillActionApi.listAll()

  // Build skill lookup maps
  const lv12Map: Record<string, number> = {}
  const typeMap: Record<string, string> = {}
  const dmgTypeMap: Record<string, string> = {}
  for (const lv of allLevels) { if (lv.level === 12) lv12Map[lv.skillId] = lv.multiplier / 100 }
  for (const sk of allSkills) { typeMap[sk.id] = sk.type; dmgTypeMap[sk.id] = sk.damageType }
  skillLv12Map.value = lv12Map
  skillTypeMap.value = typeMap
  skillDamageTypeMap.value = dmgTypeMap

  const slots = [team.charAId, team.charBId, team.charCId, team.charDId]
  const buildSlots = [team.buildAId, team.buildBId, team.buildCId, team.buildDId]
  const order: string[] = []
  const charList: typeof memberConfigs = []

  for (let i = 0; i < 4; i++) {
    const charId = slots[i]
    if (!charId) continue
    const c = chars.find(ch => ch.id === charId)
    if (!c) continue
    order.push(charId)
    charOrder.value = order

    const build = allBuilds.find((b: any) => b.id === buildSlots[i])
    const weapon = build?.weaponId ? weapons.find((w: any) => w.id === build.weaponId) : null
    const equipResult: any = { str: 0, agi: 0, int: 0, wil: 0, atkPercent: 0, hpPercent: 0, defPercent: 0, critRate: 0, critDamage: 0, damageBonus: 0, artsMastery: 0, energyRecharge: 0 }

    if (build) {
      for (const field of ['armorId', 'gloveId', 'accessory1Id', 'accessory2Id']) {
        const eid = (build as any)[field]
        if (!eid) continue
        const eq = allEquipment.find((e: any) => e.id === eid)
        if (!eq) continue
        for (let ai = 1; ai <= 3; ai++) {
          const type = (eq as any)['attr' + ai + 'Type']
          const val = (eq as any)['attr' + ai + 'Value']
          if (!type || !val) continue
          applyAttr(equipResult, type, val)
        }
      }
    }

    const stats = calcFinalStats(
      { baseAtk: c.baseAtk, baseHp: c.baseHp, baseStr: c.baseStr, baseAgi: c.baseAgi,
        baseInt: c.baseInt, baseWil: c.baseWil, mainAttr: c.mainAttr, subAttr: c.subAttr, trustLevel: 1 },
      { baseAtk: weapon?.baseAtk ?? 0, affix1Value: weapon?.affix1Value, affix1Type: weapon?.affix1Type },
      equipResult,
    )

    const skills = allSkills.filter((s: any) => s.characterId === c.id)
    charSkillMap.value[c.id] = skills
    charList.push({
      name: c.name, charId: c.id, attack: stats.attack, stats,
      availableSkills: skills, weaponName: weapon?.name ?? '',
    })
  }
  memberConfigs.push(...charList)

  // Extract action rows from tracks
  const rows: ActionRow[] = []
  let seq = 0
  for (const track of tracks) {
    if (track.kind === 'buff' || track.kind === 'state') continue
    const charId = track.id
    if (!order.includes(charId)) continue

    // determine enemy buffs from enemyBuffs at each action time
    let enemyBuffSchedule: { time: number; end: number; gainId: string }[] = []
    if (sc.enemyBuffs) {
      try {
        const eb = JSON.parse(sc.enemyBuffs) as Record<string, any[]>
        for (const list of Object.values(eb)) {
          for (const a of list) {
            enemyBuffSchedule.push({ time: a.startTime ?? 0, end: (a.startTime ?? 0) + (a.duration ?? 10), gainId: a.id })
          }
        }
      } catch {}
    }

    for (const action of track.actions) {
      const t = action.startTime ?? 0
      const skId = action.skillId ?? action.id
      const mult = lv12Map[skId] ?? (action.damageTicks?.[0]?.hpDamage ?? 50) / 100

      // Match self buffs from buff tracks
      const selfBuffs: (string | null)[] = []
      for (const bt of tracks) {
        if (!bt.id.endsWith('_buff')) continue
        if (bt.id.replace('_buff', '') !== charId) continue
        for (const ba of bt.actions) {
          const bs = ba.startTime ?? 0
          const be = bs + (ba.duration ?? 0)
          if (t >= bs && t < be) selfBuffs.push(ba.id)
        }
      }

      // Match enemy buffs
      const enemyBuffs: (string | null)[] = []
      for (const es of enemyBuffSchedule) {
        if (t >= es.time && t < es.end) enemyBuffs.push(es.gainId)
      }

      rows.push({
        seq: seq++,
        time: t,
        charId,
        skillId: skId,
        skillName: action.name,
        skillType: typeMap[skId] ?? mapActionTypeToSkillType(action.type),
        damageType: dmgTypeMap[skId] ?? (action as any).damageType ?? action.element,
        selfBuffs,
        targetCount: 1,
        enemyBuffs,
        spCost: action.spCost ?? 0,
        damage: 0,
      })
    }
  }
  rows.sort((a, b) => a.time - b.time)
  rows.forEach((r, i) => r.seq = i + 1)
  actionRows.value = rows

  if (rows.length > 0) {
    activeResultTab.value = memberConfigs[0]?.charId ?? ''
  }
}

// ── Replace skill ──
function replaceSkill(row: ActionRow) {
  const skId = selectedSkillId.value
  if (!skId) { ElMessage.info('请在左侧技能库中先点击选择一个技能'); return }
  row.skillId = skId
  row.skillName = memberConfigs.flatMap(m => m.availableSkills).find(s => s.id === skId)?.name ?? skId
  row.skillType = skillTypeMap.value[skId] ?? 'other'
  row.damageType = skillDamageTypeMap.value[skId] ?? ''
}

// ── Fill buff cells ──
function fillSelfBuff(row: ActionRow, ci: number) {
  if (!selectedGainId.value) { ElMessage.info('请在左侧增益库中先点击选择一个增益'); return }
  const gid = selectedGainId.value
  if (row.selfBuffs[ci] === gid) { row.selfBuffs[ci] = null; return }
  while (row.selfBuffs.length <= ci) row.selfBuffs.push(null)
  row.selfBuffs[ci] = gid
}

function fillEnemyBuff(row: ActionRow, ci: number) {
  if (!selectedGainId.value) { ElMessage.info('请在左侧增益库中先点击选择一个增益'); return }
  const gid = selectedGainId.value
  if (row.enemyBuffs[ci] === gid) { row.enemyBuffs[ci] = null; return }
  while (row.enemyBuffs.length <= ci) row.enemyBuffs.push(null)
  row.enemyBuffs[ci] = gid
}

// ── Add columns ──
function addSelfBuffCol() {
  selfBuffColCount.value++
  for (const row of actionRows.value) {
    while (row.selfBuffs.length < selfBuffColCount.value) row.selfBuffs.push(null)
  }
}

function addEnemyBuffCol() {
  enemyBuffColCount.value++
  for (const row of actionRows.value) {
    while (row.enemyBuffs.length < enemyBuffColCount.value) row.enemyBuffs.push(null)
  }
}

// ── Simulate ──
function runSim() {
  if (actionRows.value.length === 0) { ElMessage.warning('方案中没有技能动作'); return }
  if (memberConfigs.length === 0) { ElMessage.warning('方案没有配队数据'); return }

  const charStats: SimulateRowsConfig['charStats'] = {}
  for (const mc of memberConfigs) {
    charStats[mc.charId] = {
      attack: mc.attack,
      critRate: mc.stats.critRate,
      critDamage: mc.stats.critDamage,
      str: mc.stats.str, agi: mc.stats.agi, int: mc.stats.int, wil: mc.stats.wil,
    }
  }

  const skillMap: SimulateRowsConfig['skillMap'] = {}
  for (const mc of memberConfigs) {
    for (const sk of mc.availableSkills) {
      skillMap[sk.id] = {
        multiplier: skillLv12Map.value[sk.id] ?? 1,
        damageType: sk.damageType,
        type: sk.type,
      }
    }
  }

  const gainMap: SimulateRowsConfig['gainMap'] = {}
  for (const g of allGains.value) {
    gainMap[g.id] = g
  }

  const config: SimulateRowsConfig = {
    rows: actionRows.value,
    charStats,
    skillMap,
    gainMap: gainMap as any,
    gainCategoryMap: {},
    targetDef: 50,
    targetResistance: 20,
    resistanceIgnore: 0,
  }

  result.value = simulateRows(config)
}

// ── Computed ──
const statRows = computed(() => {
  if (!result.value) return []
  const total = result.value.teamTotalDamage
  return result.value.members.map(m => ({
    name: m.name,
    totalDamage: m.totalDamage,
    dps: m.dps,
    pct: m.totalDamage / total,
    totalSpUsed: m.totalSpUsed,
  }))
})

// ── Init ──
onMounted(async () => {
  const [scList, gains] = await Promise.all([
    TimelineApi.listAll().catch(() => []),
    GainApi.listAll().catch(() => []),
  ])
  scenarios.value = scList
  allGains.value = gains

  const scenarioId = route.query.scenarioId as string
  if (scenarioId && scenarios.value.find((s: any) => s.id === scenarioId)) {
    selectedScenarioId.value = scenarioId
    await onScenarioSelect(scenarioId)
  }
})
</script>

<style scoped>
.dps-page { padding: 8px; height: calc(100vh - 80px); }
.dps-layout { display: flex; gap: 8px; height: 100%; }
.left-panel { flex: 0 0 360px; overflow-y: auto; }
.right-panel { flex: 1; overflow-y: auto; min-width: 0; }
.lib-section { max-height: 240px; overflow-y: auto; margin-bottom: 4px; }
.char-block { margin-bottom: 6px; padding: 6px; border-radius: 6px; border: 2px solid transparent; cursor: pointer; transition: all 0.15s; background: #fafafa; }
.char-block:hover { border-color: #e4e7ed; }
.char-selected { border-color: #409eff; background: #f0f7ff; }
.char-header { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
.slot-badge { width: 18px; height: 18px; border-radius: 3px; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #fff; font-weight: 700; flex-shrink: 0; }
.char-name { font-size: 12px; font-weight: 600; color: #303133; }
.char-atk { font-size: 10px; color: #909399; margin-left: auto; }
.skill-chips { display: flex; flex-wrap: wrap; gap: 3px; }
.skill-chip { display: inline-flex; align-items: center; gap: 3px; padding: 2px 6px; border-radius: 4px; font-size: 11px; cursor: pointer; border: 1px solid transparent; transition: all 0.15s; }
.skill-chip:hover { border-color: #c0c4cc; }
.skill-chip.active { border-color: #409eff; background: #ecf5ff; }
.skill-icon { width: 16px; height: 16px; border-radius: 2px; display: inline-flex; align-items: center; justify-content: center; font-size: 8px; color: #fff; font-weight: 600; }
.skill-name { color: #303133; }
.skill-mult { color: #909399; font-size: 10px; }
.type-normal .skill-icon { background: #409eff; }
.type-skill .skill-icon { background: #e6a23c; }
.type-chain .skill-icon { background: #67c23a; }
.type-ultimate .skill-icon { background: #f56c6c; }
.type-talent1 .skill-icon { background: #9b59b6; }
.type-talent2 .skill-icon { background: #1abc9c; }
.type-other .skill-icon { background: #909399; }
.gain-section { display: flex; flex-wrap: wrap; gap: 4px; }
.gain-chip { display: inline-flex; align-items: center; gap: 3px; padding: 3px 8px; border-radius: 4px; font-size: 11px; cursor: pointer; border: 1px solid transparent; background: #f0f9eb; transition: all 0.15s; }
.gain-chip:hover { border-color: #b7eb8f; }
.gain-chip.active { border-color: #67c23a; background: #e1f3d8; }
.gain-icon { width: 16px; height: 16px; border-radius: 2px; display: inline-flex; align-items: center; justify-content: center; font-size: 8px; color: #fff; background: #67c23a; }
.gain-name { color: #303133; }
.gain-meta { color: #909399; font-size: 10px; }
.toolbar { display: flex; align-items: center; gap: 4px; margin-bottom: 6px; padding: 4px 8px; background: #f5f7fa; border-radius: 4px; }
.clickable-cell { cursor: pointer; padding: 1px 4px; border-radius: 3px; transition: background 0.15s; }
.clickable-cell:hover { background: #ecf5ff; }
.buff-cell { display: inline-block; min-width: 50px; text-align: center; color: #909399; }
.buff-cell.filled { color: #67c23a; font-weight: 500; }
</style>
