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

              <el-divider content-position="left">敌人配置</el-divider>
              <div style="margin-bottom:4px">
                <el-button size="small" @click="showEnemySearch = true">+ 添加敌人</el-button>
              </div>
              <div class="lib-section">
                <div v-for="e in enemyList" :key="e.id"
                  class="enemy-card" :class="{ 'enemy-selected': selectedEnemyId === e.id }"
                  @click="selectedEnemyId = e.id">
                  <div style="display:flex;justify-content:space-between;align-items:center">
                    <span style="font-weight:600;font-size:12px">{{ e.name }}</span>
                    <el-button size="small" text type="danger" @click.stop="removeEnemy(e.id)">✕</el-button>
                  </div>
                  <div style="display:flex;gap:8px;margin-top:4px">
                    <span style="font-size:11px;color:#909399">防御</span>
                    <el-input-number v-model="e.def" :min="0" :max="500" size="small" style="width:80px" @click.stop />
                    <span style="font-size:11px;color:#909399">抗性</span>
                    <el-input-number v-model="e.resistance" :min="0" :max="100" size="small" style="width:80px" @click.stop />
                  </div>
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
            <el-tab-pane v-for="mr in result.members" :key="mr.name" :label="charNameMap[mr.name] || mr.name" :name="mr.name">
              <div class="toolbar">
                <el-button size="small" @click="addSelfBuffCol">+ 己方增益列</el-button>
                <el-button size="small" @click="addEnemyBuffCol">+ 敌方增益列</el-button>
                <el-button size="small" type="primary" @click="addRowToCurrentTab" style="margin-left:4px">+ 添加行</el-button>
                <span style="font-size:12px;color:#909399;margin-left:8px">
                  点击技能库技能替换技能名称 | 点击增益/敌人填入对应列
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
                  <template #default="{ row }">{{ damageTypeLabel(row.damageType) }}</template>
                </el-table-column>
                <el-table-column v-for="(_, ci) in selfBuffColCount" :key="'sb' + ci" :label="'己方增益' + (ci + 1)" width="80">
                  <template #default="{ row }">
                    <span class="clickable-cell buff-cell" :class="{ filled: row.selfBuffs[ci] }" @click="fillSelfBuff(row, ci)">
                      {{ row.selfBuffs[ci] ? gainName(row.selfBuffs[ci]) : '+' }}
                    </span>
                  </template>
                </el-table-column>
                <el-table-column label="命中敌人" width="100">
                  <template #default="{ row }">
                    <span class="clickable-cell" :class="{ filled: !!row.targetEnemyId }" @click="assignEnemy(row)">
                      {{ row.targetEnemyId ? enemyName(row.targetEnemyId) : '+' }}
                    </span>
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

          <div style="display:flex;gap:8px;margin-bottom:8px;align-items:stretch">
            <el-card shadow="never" style="flex:1;min-width:0">
              <template #header><span style="font-size:13px;font-weight:600">伤害统计</span></template>
              <el-table :data="statRows" border stripe size="small">
                <el-table-column label="干员" width="80">
                  <template #default="{ row }">{{ charNameMap[row.name] || row.name }}</template>
                </el-table-column>
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
            <el-card shadow="never" style="width:240px;flex-shrink:0">
              <template #header><span style="font-size:12px;font-weight:600">元素伤害占比</span></template>
              <div ref="elementChartRef" style="height:160px" />
            </el-card>
            <el-card shadow="never" style="width:240px;flex-shrink:0">
              <template #header><span style="font-size:12px;font-weight:600">技能类型伤害占比</span></template>
              <div ref="skillTypeChartRef" style="height:160px" />
            </el-card>
          </div>
        </template>

        <div v-else style="display:flex;align-items:center;justify-content:center;height:400px;color:#909399;font-size:14px">
          <div style="text-align:center;line-height:2">
            <div>📊 排轴伤害计算器</div>
            <div style="font-size:12px">选择一个排轴方案开始</div>
          </div>
        </div>
      </div>
    </div>

    <el-dialog v-model="showEnemySearch" title="添加敌人" width="400px">
      <el-select v-model="searchEnemyKeyword" filterable placeholder="搜索敌人..." style="width:100%" @change="onEnemySelect">
        <el-option v-for="e in enemyDbList" :key="e.id" :label="e.name" :value="e.id" />
      </el-select>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as echarts from 'echarts'
import { TeamApi, CharacterApi, BuildApi, WeaponApi, EquipmentApi, SkillApi, SkillLevelApi, SkillActionApi, GainApi, TimelineApi, EnemyApi } from '../../api'
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

const skillLv12Map = ref<Record<string, number>>({})
const skillTypeMap = ref<Record<string, string>>({})
const skillDamageTypeMap = ref<Record<string, string>>({})
const charSkillMap = ref<Record<string, any[]>>({})
const result = ref<TeamSimulationResult | null>(null)

const slotColors = ['#e74c3c', '#e67e22', '#2ecc71', '#3498db']

// ── Chart refs ──
const elementChartRef = ref<HTMLDivElement | null>(null)
const skillTypeChartRef = ref<HTMLDivElement | null>(null)
let elementChart: echarts.ECharts | null = null
let skillTypeChart: echarts.ECharts | null = null

const elementColors: Record<string, string> = {
  physical: '#909399', pyro: '#f56c6c', electro: '#e6a23c',
  cryo: '#409eff', natural: '#67c23a', ultra: '#b37feb', true: '#ffd700',
}
const skillTypeChartColors: Record<string, string> = {
  normal: '#409eff', skill: '#e6a23c', chain: '#67c23a',
  ultimate: '#f56c6c', talent1: '#9b59b6', talent2: '#1abc9c', other: '#909399',
}

// ── Enemy state ──
interface EnemyBrief { id: string; name: string; def: number; resistance: number }

const enemyList = ref<EnemyBrief[]>([])
const selectedEnemyId = ref<string>('')
const showEnemySearch = ref(false)
const searchEnemyKeyword = ref('')
const enemyDbList = ref<any[]>([])

// ── Computed ──
const charNameMap = computed(() => {
  const map: Record<string, string> = {}
  for (const mc of memberConfigs) map[mc.charId] = mc.name
  return map
})

// ── Helpers ──
function skillIcon(type: string) {
  const m: Record<string, string> = { normal: '普', attack: '普', skill: '技', chain: '连', link: '连', ultimate: '终', talent1: '天1', talent2: '天2' }
  return m[type] || type.slice(0, 2)
}

function typeLabel(t: string) {
  const m: Record<string, string> = { normal: '普攻', attack: '普攻', skill: '战技', chain: '连携', link: '连携', ultimate: '终结', execution: '处决', talent1: '天赋', talent2: '天赋' }
  return m[t] || t
}

function damageTypeLabel(t: string) {
  const m: Record<string, string> = { pyro: '灼热', cryo: '寒冷', electro: '电磁', natural: '自然', physical: '物理', ultra: '超域', true: '真实' }
  return m[t] || t || '-'
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

function enemyName(id: string) {
  const e = enemyList.value.find(x => x.id === id)
  return e ? e.name : id.slice(0, 6)
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
  enemyList.value = []
  selectedEnemyId.value = ''

  let tracks: Track[] = []
  if (sc.tracks) { try { tracks = JSON.parse(sc.tracks) as Track[] } catch { tracks = [] } }

  if (!sc.teamId) { ElMessage.warning('方案没有关联配队'); return }
  const team = await TeamApi.get(sc.teamId)
  teamData.value = team

  const chars = await CharacterApi.listAll()
  const allBuilds = await BuildApi.listAll()
  const weapons = await WeaponApi.listAll()
  const allEquipment = await EquipmentApi.listAll()
  const allSkills = await SkillApi.listAll()
  const allLevels = await SkillLevelApi.listAll()

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

    for (const action of track.actions) {
      const t = action.startTime ?? 0
      const skId = action.skillId ?? action.id

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
        enemyBuffs: [],
        spCost: action.spCost ?? 0,
        damage: 0,
      })
    }
  }
  rows.sort((a, b) => a.time - b.time)
  rows.forEach((r, i) => r.seq = i + 1)

  // Load enemies from scenario
  if (sc.enemies) {
    try {
      const parsed = JSON.parse(sc.enemies)
      const list = (Array.isArray(parsed) ? parsed : []).map((e: any) => ({
        id: e.id, name: e.name || e.id,
        def: e.def ?? 50, resistance: e.resistance ?? 20,
      }))
      enemyList.value = list
      if (list.length > 0) {
        selectedEnemyId.value = list[0].id
        for (const r of rows) r.targetEnemyId = list[0].id
      }
    } catch {}
  }

  actionRows.value = rows
  if (rows.length > 0) activeResultTab.value = memberConfigs[0]?.charId ?? ''
}

// ── Enemy management ──
async function openEnemySearch() {
  showEnemySearch.value = true
  searchEnemyKeyword.value = ''
  try {
    enemyDbList.value = await EnemyApi.listAll()
  } catch { enemyDbList.value = [] }
}

function onEnemySelect(id: string) {
  const found = enemyDbList.value.find((e: any) => e.id === id)
  if (!found) return
  if (enemyList.value.find(e => e.id === id)) { ElMessage.info('该敌人已在列表中'); return }
  enemyList.value.push({
    id: found.id,
    name: found.name || found.id,
    def: found.def ?? found.maxStagger ?? 50,
    resistance: found.resistance ?? 20,
  })
  selectedEnemyId.value = found.id
  showEnemySearch.value = false
}

async function removeEnemy(eid: string) {
  const affected = actionRows.value.filter(r => r.targetEnemyId === eid)
  let msg = `确认删除敌人「${enemyName(eid)}」？`
  if (affected.length > 0) {
    msg += ` 该操作将清空 ${affected.length} 行动作中的命中敌人设置。`
  }
  try {
    await ElMessageBox.confirm(msg, '删除确认')
    for (const r of affected) r.targetEnemyId = undefined
    enemyList.value = enemyList.value.filter(e => e.id !== eid)
    if (selectedEnemyId.value === eid) {
      selectedEnemyId.value = enemyList.value[0]?.id ?? ''
    }
  } catch { /* cancelled */ }
}

function assignEnemy(row: ActionRow) {
  if (!selectedEnemyId.value) { ElMessage.info('请在左侧敌人配置中先点击选择一个敌人'); return }
  row.targetEnemyId = row.targetEnemyId === selectedEnemyId.value ? undefined : selectedEnemyId.value
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

// ── Add row ──
function addRowToCurrentTab() {
  const charId = activeResultTab.value
  if (!charId) { ElMessage.warning('请先选择一个干员标签'); return }
  const charRows = actionRows.value.filter(r => r.charId === charId)
  const lastTime = charRows.length > 0 ? Math.max(...charRows.map(r => r.time)) : 0
  const mc = memberConfigs.find(m => m.charId === charId)
  const firstSkill = mc?.availableSkills?.[0]
  const skId = firstSkill?.id ?? ''
  const newRow: ActionRow = {
    seq: actionRows.value.length + 1,
    time: lastTime + 1,
    charId,
    skillId: skId,
    skillName: firstSkill?.name ?? '新动作',
    skillType: skillTypeMap.value[skId] ?? 'other',
    damageType: skillDamageTypeMap.value[skId] ?? firstSkill?.damageType ?? '',
    selfBuffs: [],
    targetCount: 1,
    enemyBuffs: [],
    spCost: 0,
    damage: 0,
    targetEnemyId: selectedEnemyId.value || undefined,
  }
  actionRows.value.push(newRow)
  actionRows.value.sort((a, b) => a.time - b.time)
  actionRows.value.forEach((r, i) => r.seq = i + 1)
  runSim()
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
  for (const g of allGains.value) { gainMap[g.id] = g }

  const enemyMap: Record<string, { def: number; resistance: number }> = {}
  for (const e of enemyList.value) { enemyMap[e.id] = { def: e.def, resistance: e.resistance } }

  const config: SimulateRowsConfig = {
    rows: actionRows.value,
    charStats,
    skillMap,
    gainMap: gainMap as any,
    gainCategoryMap: {},
    enemyMap,
    targetDef: 50,
    targetResistance: 20,
    resistanceIgnore: 0,
  }

  result.value = simulateRows(config)
  nextTick(() => renderCharts())
}

function renderCharts() {
  // Element damage pie
  if (elementChartRef.value && result.value?.teamElementDamage) {
    if (!elementChart) elementChart = echarts.init(elementChartRef.value)
    const data = Object.entries(result.value.teamElementDamage)
      .filter(([, v]) => v > 0)
      .map(([k, v]) => ({
        name: damageTypeLabel(k) || k,
        value: v,
        itemStyle: { color: elementColors[k] || '#909399' },
      }))
    elementChart.setOption({
      tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
      series: [{ type: 'pie', radius: ['30%', '60%'], data, label: { fontSize: 10, formatter: '{b}\n{d}%' } }],
    })
  }

  // Skill type damage bar
  if (skillTypeChartRef.value && result.value?.teamSkillTypeDamage) {
    if (!skillTypeChart) skillTypeChart = echarts.init(skillTypeChartRef.value)
    const entries = Object.entries(result.value.teamSkillTypeDamage).filter(([, v]) => v > 0)
    const total = entries.reduce((s, [, v]) => s + v, 0)
    const labels = entries.map(([k]) => skillTypeChartLabel(k) || k)
    skillTypeChart.setOption({
      tooltip: { trigger: 'axis', formatter: (p: any) => `${p[0].name}: ${Number(p[0].value).toFixed(0)} (${(Number(p[0].value) / total * 100).toFixed(1)}%)` },
      grid: { left: 5, right: 5, top: 15, bottom: 30 },
      xAxis: { type: 'category', data: labels, axisLabel: { fontSize: 10, rotate: 0, interval: 0 } },
      yAxis: { type: 'value', show: false },
      series: [{
        type: 'bar', barWidth: '60%',
        data: entries.map(([k, v]) => ({ value: v, itemStyle: { color: skillTypeChartColors[k] || '#909399' } })),
        label: { show: true, position: 'top', fontSize: 9, formatter: (p: any) => (p.value / total * 100).toFixed(0) + '%' },
      }],
    })
  }
}

function skillTypeChartLabel(t: string) {
  const m: Record<string, string> = { normal: '普攻', skill: '战技', chain: '连携', ultimate: '终结', talent1: '天赋', talent2: '天赋', other: '其他' }
  return m[t] || t
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
.lib-section { max-height: 200px; overflow-y: auto; margin-bottom: 4px; }
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
.enemy-card { margin-bottom: 6px; padding: 8px; border-radius: 6px; border: 2px solid #e4e7ed; cursor: pointer; transition: all 0.15s; background: #fafafa; }
.enemy-card:hover { border-color: #c0c4cc; }
.enemy-selected { border-color: #409eff; background: #f0f7ff; }
.toolbar { display: flex; align-items: center; gap: 4px; margin-bottom: 6px; padding: 4px 8px; background: #f5f7fa; border-radius: 4px; }
.clickable-cell { cursor: pointer; padding: 1px 4px; border-radius: 3px; transition: background 0.15s; }
.clickable-cell:hover { background: #ecf5ff; }
.buff-cell { display: inline-block; min-width: 50px; text-align: center; color: #909399; }
.buff-cell.filled { color: #67c23a; font-weight: 500; }
</style>
