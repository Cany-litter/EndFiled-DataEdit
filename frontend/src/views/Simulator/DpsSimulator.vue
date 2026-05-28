<template>
  <div class="dps-page">
    <div class="dps-layout">
      <div class="left-panel">
        <el-card shadow="never">
          <template #header><span>排轴伤害</span></template>
          <el-form label-position="top" size="small">
            <el-radio-group v-model="mode" size="small" style="margin-bottom:8px;width:100%">
              <el-radio-button value="scenario" style="flex:1">从排轴方案</el-radio-button>
              <el-radio-button value="manual" style="flex:1">手动创建</el-radio-button>
            </el-radio-group>

            <template v-if="mode === 'scenario'">
              <el-form-item label="选择排轴方案">
                <el-select v-model="selectedScenarioId" filterable placeholder="选择方案" style="width:100%" @change="onScenarioSelect">
                  <el-option v-for="s in scenarios" :key="s.id" :label="s.name" :value="s.id" />
                </el-select>
              </el-form-item>
              <div v-if="currentScenario" style="font-size:12px;color:#909399;margin-bottom:8px;padding:6px 8px;background:#f5f7fa;border-radius:4px">
                <div v-if="currentScenario.teamId && teamData">配队: {{ teamData.name }}</div>
                <div>时间: {{ duration }}s | 角色: {{ memberConfigs.filter(m => m.rotation.length > 0).length }} 人 | 动作: {{ totalActions }}</div>
                <el-button size="small" type="primary" link @click="goToTimeline">✏️ 在排轴编辑器中打开</el-button>
              </div>
            </template>

            <template v-if="mode === 'manual'">
              <el-form-item label="选择配队">
                <el-select v-model="selectedTeam" filterable placeholder="选择配队" style="width:100%" @change="onTeamChange">
                  <el-option v-for="t in teams" :key="t.id" :label="t.name || t.id" :value="t" />
                </el-select>
              </el-form-item>
              <div style="display:flex;gap:4px;margin-bottom:8px">
                <el-button size="small" @click="showImportDialog = true">从时间线导入</el-button>
                <el-button size="small" @click="exportRotation">导出循环至时间线</el-button>
              </div>
            </template>

            <template v-if="memberConfigs.length">
              <el-divider content-position="left">成员旋转</el-divider>
              <el-collapse v-model="activeMemberPanels" style="margin-bottom:8px">
                <el-collapse-item v-for="(mc, mi) in memberConfigs" :key="mi" :name="String(mi)">
                  <template #title>
                    <span style="font-weight:600;font-size:13px">{{ mc.name }}</span>
                    <el-tag size="small" style="margin-left:8px" type="info">攻 {{ mc.attack.toFixed(0) }}</el-tag>
                    <el-tag size="small" style="margin-left:4px" v-if="mc.stats.critRate">暴 {{ (mc.stats.critRate * 100).toFixed(1) }}%</el-tag>
                    <el-tag size="small" style="margin-left:4px" v-if="mc.rotation.length">{{ mc.rotation.length }} 步</el-tag>
                  </template>
                  <div v-for="s in mc.availableSkills" :key="s.id" class="skill-row">
                    <span style="flex:1;font-size:12px">{{ s.name || s.id }}
                      <el-tag size="small" style="margin-left:4px">{{ skillTypeLabel(s.type) }}</el-tag>
                    </span>
                    <el-button size="small" type="primary" link @click="addStep(mi, s)">+</el-button>
                  </div>
                  <div style="margin-top:6px">
                    <div v-for="(step, si) in mc.rotation" :key="si" class="step-row">
                      <span style="font-size:12px">{{ si+1 }}. {{ step.label }}</span>
                      <el-button size="small" type="danger" link @click="mc.rotation.splice(si,1)">✕</el-button>
                    </div>
                    <div v-if="!mc.rotation.length" style="color:#909399;font-size:12px">空旋转</div>
                  </div>
                </el-collapse-item>
              </el-collapse>

              <el-divider content-position="left">敌人参数</el-divider>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
                <el-form-item label="时长(s)">
                  <el-input-number v-model="duration" :min="10" :max="600" :step="10" size="small" style="width:100%" />
                </el-form-item>
                <el-form-item label="目标数">
                  <el-input-number v-model="targetCount" :min="1" :max="10" size="small" style="width:100%" />
                </el-form-item>
                <el-form-item label="防御">
                  <el-input-number v-model="targetDef" :min="0" :max="500" size="small" style="width:100%" />
                </el-form-item>
                <el-form-item label="抗性">
                  <el-input-number v-model="targetResistance" :min="0" :max="100" size="small" style="width:100%" />
                </el-form-item>
                <el-form-item label="穿透">
                  <el-input-number v-model="resistanceIgnore" :min="0" :max="100" size="small" style="width:100%" />
                </el-form-item>
                <el-form-item label="失衡">
                  <el-switch v-model="isStaggered" />
                </el-form-item>
              </div>

              <el-divider content-position="left">Buff 选择</el-divider>
              <div style="margin-bottom:8px;max-height:200px;overflow-y:auto">
                <el-checkbox-group v-model="selectedGainIds" size="small">
                  <div v-for="cat in gainCategories" :key="cat" style="margin-bottom:4px">
                    <div style="font-size:11px;color:#909399;margin-bottom:2px">{{ cat }}</div>
                    <el-checkbox-button v-for="g in gainsByCategory(cat)" :key="g.id" :label="g.id">
                      {{ g.name }}
                    </el-checkbox-button>
                  </div>
                </el-checkbox-group>
              </div>

              <el-button type="primary" style="width:100%;margin-top:4px" @click="runSim">开始模拟</el-button>
            </template>
          </el-form>
        </el-card>
      </div>

      <div class="right-panel">
        <div v-if="!result && memberConfigs.length === 0" style="display:flex;align-items:center;justify-content:center;height:400px;color:#909399;font-size:14px;text-align:center;line-height:2">
          <div>
            <div>📊 排轴伤害计算器</div>
            <div style="font-size:12px">选择一个排轴方案或配队开始</div>
          </div>
        </div>

        <template v-if="result">
          <el-card shadow="never" style="margin-bottom:8px">
            <template #header>
              <span>模拟结果</span>
              <el-tag type="success" style="margin-left:12px">DPS: {{ result.teamDps.toFixed(1) }}</el-tag>
              <el-tag style="margin-left:8px">总伤害: {{ result.teamTotalDamage.toFixed(0) }}</el-tag>
              <el-tag type="warning" style="margin-left:8px">{{ totalCasts }} 次施放</el-tag>
            </template>
            <el-table :data="teamRows" border stripe size="small">
              <el-table-column prop="name" label="成员" width="90" />
              <el-table-column prop="totalDamage" label="总伤害" width="130">
                <template #default="{ row }">{{ row.totalDamage.toFixed(0) }}</template>
              </el-table-column>
              <el-table-column prop="dps" label="DPS" width="90">
                <template #default="{ row }">{{ row.dps.toFixed(1) }}</template>
              </el-table-column>
              <el-table-column prop="pct" label="占比" width="70">
                <template #default="{ row }">{{ (row.pct * 100).toFixed(1) }}%</template>
              </el-table-column>
              <el-table-column prop="casts" label="施放" width="55" />
            </el-table>
          </el-card>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
            <el-card shadow="never">
              <template #header><span style="font-size:12px">角色伤害占比</span></template>
              <div ref="charChartRef" style="height:160px" />
            </el-card>
            <el-card shadow="never">
              <template #header><span style="font-size:12px">乘区分析</span></template>
              <div v-if="result.teamCategoryBreakdown" class="cat-grid">
                <div v-for="(val, cat) in result.teamCategoryBreakdown" :key="cat" class="cat-card">
                  <div class="cat-badge">{{ cat }}</div>
                  <div class="cat-val">{{ (val * 100).toFixed(1) }}%</div>
                </div>
              </div>
            </el-card>
          </div>

          <el-card shadow="never" style="margin-bottom:8px">
            <template #header><span>技能详情</span></template>
            <el-tabs type="border-card" size="small">
              <el-tab-pane v-for="(mr, mi) in result.members" :key="mi" :label="mr.name">
                <el-table :data="skillDetailRows(mr)" border stripe size="small">
                  <el-table-column prop="skill" label="技能" />
                  <el-table-column prop="count" label="次数" width="55" />
                  <el-table-column prop="damage" label="总伤害" width="120">
                    <template #default="{ row }">{{ row.damage.toFixed(0) }}</template>
                  </el-table-column>
                  <el-table-column prop="pct" label="占比" width="65">
                    <template #default="{ row }">{{ (row.pct * 100).toFixed(1) }}%</template>
                  </el-table-column>
                </el-table>
              </el-tab-pane>
            </el-tabs>
          </el-card>
        </template>
      </div>
    </div>

    <el-dialog v-model="showImportDialog" title="从时间线导入循环" width="500px">
      <el-alert type="info" :closable="false" style="margin-bottom:12px">
        请先在排轴编辑器中导出循环 JSON，然后在此处导入。
      </el-alert>
      <el-upload drag accept=".json" :auto-upload="false" :show-file-list="false" @change="onImportFile">
        <el-icon style="font-size:40px;color:#409eff"><UploadFilled /></el-icon>
        <div style="margin-top:8px;font-size:14px">点击或拖拽 JSON 文件</div>
      </el-upload>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { TeamApi, CharacterApi, BuildApi, WeaponApi, EquipmentApi, SkillApi, SkillLevelApi, GainApi, TimelineApi } from '../../api'
import type { Team, Character, Build, Weapon, Equipment, Skill, SkillLevel, Gain } from '../../api'
import type { TimelineScenario as ApiTimelineScenario } from '../../api'
import { calcFinalStats, type FinalStats } from '../../engine/formulas/stats'
import { GAIN_CATEGORY_TO_DAMAGE_CAT } from '../../engine/formulas/stats'
import { runTeamSimulation } from '../../engine/simulation/teamEngine'
import { DEFAULT_SKILL_CONFIGS } from '../../engine/simulation/types'
import type { SimulationConfig, RotationStep, TeamSimulationResult, SkillConfig, SkillType } from '../../engine/simulation/types'
import type { Buff } from '../../engine/types/buff'
import type { Track, TimelineAction } from '../../engine/types/timeline'

const route = useRoute()
const router = useRouter()

// ── Mode ──
const mode = ref<'scenario' | 'manual'>('scenario')

// ── Scenario mode ──
const scenarios = ref<ApiTimelineScenario[]>([])
const selectedScenarioId = ref('')
const currentScenario = computed(() => scenarios.value.find(s => s.id === selectedScenarioId.value))

// ── Manual mode ──
const teams = ref<Team[]>([])
const selectedTeam = ref<Team | null>(null)
const showImportDialog = ref(false)

// ── Shared ──
const allGains = ref<Gain[]>([])
const selectedGainIds = ref<string[]>([])
const activeMemberPanels = ref<string[]>([])

interface MemberConfig {
  name: string
  charId: string
  attack: number
  hp: number
  stats: FinalStats
  availableSkills: (Skill & { skillLevels?: SkillLevel[] })[]
  rotation: RotationStep[]
}

const memberConfigs = reactive<MemberConfig[]>([])
const teamData = ref<Team | null>(null)

const duration = ref(120)
const targetCount = ref(1)
const targetDef = ref(50)
const targetResistance = ref(20)
const resistanceIgnore = ref(0)
const isStaggered = ref(false)
const result = ref<TeamSimulationResult | null>(null)

const charChartRef = ref<HTMLDivElement | null>(null)
let charChart: echarts.ECharts | null = null
const colors = ['#409eff', '#67c23a', '#e6a23c', '#f56c6c']

// ── Computed ──
const totalActions = computed(() => memberConfigs.reduce((s, m) => s + m.rotation.length, 0))

const gainCategories = computed(() => {
  const cats = new Set<string>()
  for (const g of allGains.value) {
    if (g.effectCategory) cats.add(g.effectCategory)
  }
  return Array.from(cats).sort()
})

function gainsByCategory(cat: string) {
  return allGains.value.filter(g => g.effectCategory === cat)
}

const totalCasts = computed(() => {
  if (!result.value) return 0
  return result.value.members.reduce((s, m) => s + m.totalCasts, 0)
})

const teamRows = computed(() => {
  if (!result.value) return []
  const total = result.value.teamTotalDamage
  return result.value.members.map(m => ({
    name: m.name,
    totalDamage: m.totalDamage,
    dps: m.dps,
    pct: m.totalDamage / total,
    casts: m.totalCasts,
  }))
})

// ── Helpers ──
function skillTypeLabel(t: string) {
  const m: Record<string, string> = { normal: '普攻', skill: '战技', chain: '连携', ultimate: '终结技', talent1: '天赋1', talent2: '天赋2', other: '其他' }
  return m[t] || t
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

function mapActionTypeToSkillType(type: string): SkillType {
  const m: Record<string, SkillType> = { attack: 'normal', skill: 'skill', link: 'chain', ultimate: 'ultimate', execution: 'other', normal: 'normal', chain: 'chain' }
  return m[type] ?? 'other'
}

// ── Scenario: extract rotation from tracks ──
function extractRotationFromTracks(tracks: Track[], charIndexMap: Record<string, number>): Record<string, RotationStep[]> {
  const result: Record<string, RotationStep[]> = {}
  for (const track of tracks) {
    if (track.kind === 'buff' || track.kind === 'state') continue
    const charId = track.id
    const charIndex = charIndexMap[charId] ?? 0
    const steps: RotationStep[] = []
    for (const action of track.actions) {
      steps.push({
        skillId: action.id,
        skillType: mapActionTypeToSkillType(action.type),
        label: action.name,
        charIndex,
        timelineActionId: action.instanceId,
      })
    }
    if (steps.length > 0) {
      result[charId] = steps
    }
  }
  return result
}

// ── Load team data (shared between scenario and manual) ──
async function loadTeamData(teamId: string, rotations: Record<string, RotationStep[]> | null) {
  memberConfigs.length = 0
  activeMemberPanels.value = ['0', '1', '2', '3']

  const team = await TeamApi.get(teamId)
  teamData.value = team

  const chars = await CharacterApi.listAll()
  const allBuilds = await BuildApi.listAll()
  const weapons = await WeaponApi.listAll()
  const allEquipment = await EquipmentApi.listAll()

  const slots = [
    { charId: team.charAId, buildField: 'buildAId' as const },
    { charId: team.charBId, buildField: 'buildBId' as const },
    { charId: team.charCId, buildField: 'buildCId' as const },
    { charId: team.charDId, buildField: 'buildDId' as const },
  ]
  const charIndexMap: Record<string, number> = {}

  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i]
    if (!slot.charId) continue
    const c = chars.find(ch => ch.id === slot.charId)
    if (!c) continue

    charIndexMap[slot.charId] = i
    const build = allBuilds.find(b => b.id === (team as any)[slot.buildField])
    const weapon = build?.weaponId ? weapons.find(w => w.id === build.weaponId) : null
    const equipResult = { str: 0, agi: 0, int: 0, wil: 0, atkPercent: 0, hpPercent: 0, defPercent: 0, critRate: 0, critDamage: 0, damageBonus: 0, artsMastery: 0, energyRecharge: 0 }

    if (build) {
      for (const equipField of ['armorId', 'gloveId', 'accessory1Id', 'accessory2Id']) {
        const equipId = (build as any)[equipField]
        if (!equipId) continue
        const eq = allEquipment.find(e => e.id === equipId)
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
        baseInt: c.baseInt, baseWil: c.baseWil, mainAttr: c.mainAttr, subAttr: c.subAttr,
        trustLevel: 1 },
      { baseAtk: weapon?.baseAtk ?? 0, affix1Value: weapon?.affix1Value, affix1Type: weapon?.affix1Type },
      equipResult,
    )

    const skills = await SkillApi.list(c.id)
    for (const sk of skills) {
      (sk as any).skillLevels = await SkillLevelApi.list(sk.id)
    }

    const rotation = rotations?.[slot.charId] ?? []
    memberConfigs.push({
      name: c.name,
      charId: c.id,
      attack: stats.attack,
      hp: stats.hp,
      stats,
      availableSkills: skills as any,
      rotation,
    })
  }
}

// ── Scenario select ──
async function onScenarioSelect(id: string) {
  const sc = await TimelineApi.get(id)
  if (!sc) return
  result.value = null

  let tracks: Track[] = []
  if (sc.tracks) {
    try { tracks = JSON.parse(sc.tracks) as Track[] } catch { tracks = [] }
  }

  if (sc.enemies) {
    try {
      const enemies = JSON.parse(sc.enemies) as any[]
      if (enemies.length > 0) {
        targetDef.value = (enemies[0] as any).def ?? 50
        targetResistance.value = (enemies[0] as any).resistance ?? 20
      }
    } catch { /* ignore */ }
  }

  if (sc.teamId) {
    await loadTeamData(sc.teamId, null)

    // Build charIndexMap from the loaded memberConfigs order
    const charIndexMap: Record<string, number> = {}
    memberConfigs.forEach((mc, i) => { charIndexMap[mc.charId] = i })

    const extracted = extractRotationFromTracks(tracks, charIndexMap)
    for (const mc of memberConfigs) {
      if (extracted[mc.charId]) {
        mc.rotation = extracted[mc.charId]
      }
    }
  }

  if (tracks.length > 0) {
    const allActions = tracks.flatMap(t => t.actions)
    if (allActions.length > 0) {
      const maxEnd = Math.max(...allActions.map(a => a.startTime + (a.duration ?? 0)))
      duration.value = Math.max(30, Math.ceil(maxEnd / 10) * 10)
    }
  }
}

// ── Manual mode: team select ──
async function onTeamChange(team: Team) {
  result.value = null
  await loadTeamData(team.id, null)
}

function skillTypeToRotationType(type: string): SkillType {
  const m: Record<string, SkillType> = { talent: 'other', talent1: 'other', talent2: 'other', normal: 'normal', skill: 'skill', chain: 'chain', ultimate: 'ultimate' }
  return m[type] ?? 'other'
}

function addStep(mi: number, skill: Skill & { skillLevels?: SkillLevel[] }) {
  memberConfigs[mi].rotation.push({
    skillId: skill.id,
    skillType: skillTypeToRotationType(skill.type),
    label: `${skillTypeLabel(skill.type)}${skill.name ? '-' + skill.name : ''}`,
    charIndex: mi,
  })
}

// ── Buff building ──
function buildSelectedBuffs(): Buff[] {
  const selectedGains = allGains.value.filter(g => selectedGainIds.value.includes(g.id))
  const buffs: Buff[] = []
  for (const g of selectedGains) {
    const cat = GAIN_CATEGORY_TO_DAMAGE_CAT[g.effectCategory ?? '']
    if (cat && g.effectValue != null) {
      buffs.push({
        id: g.id,
        name: g.name,
        source: g.source ?? 'gain',
        buffType: 'permanent',
        effectCategory: g.effectCategory ?? '',
        effectType: g.effectType ?? '',
        effectValue: g.effectValue,
        stackRule: 'add_same',
        targetScope: 'self',
        effects: [{
          category: cat,
          value: g.valueType === 'percentage' ? g.effectValue : g.effectValue,
        }],
      })
    }
    if (g.effectCategory === '基础属性' || g.effectCategory === '能力值') {
      buffs.push({
        id: g.id + '_stat',
        name: g.name,
        source: g.source ?? 'gain',
        buffType: 'permanent',
        effectCategory: g.effectCategory ?? '',
        effectType: g.effectType ?? '',
        effectValue: g.effectValue ?? 0,
        stackRule: 'add_same',
        targetScope: 'self',
      })
    }
  }
  return buffs
}

// ── Simulate ──
function runSim() {
  const teamBuffs = buildSelectedBuffs()
  const teamData = memberConfigs.map(mc => ({
    name: mc.name,
    attack: mc.attack,
    hp: mc.hp,
    stats: mc.stats,
    buffs: teamBuffs,
    skills: mc.availableSkills.map(sk => {
      const lv12 = (sk as any).skillLevels?.find((l: SkillLevel) => l.level === 12)
      const cfg = DEFAULT_SKILL_CONFIGS[sk.type as keyof typeof DEFAULT_SKILL_CONFIGS] ?? DEFAULT_SKILL_CONFIGS.other
      return {
        id: sk.id, name: sk.name, type: sk.type as any,
        damageType: sk.damageType,
        multiplier: (lv12?.multiplier ?? 100) / 100,
        cooldown: cfg.cooldown, energyCost: cfg.energyCost, castTime: cfg.castTime,
      } as SkillConfig
    }),
    rotation: mc.rotation.map(r => ({ ...r })),
  }))

  const config: SimulationConfig = {
    duration: duration.value, targetCount: targetCount.value,
    targetDef: targetDef.value,
    targetResistance: targetResistance.value,
    targetResistanceIgnore: resistanceIgnore.value,
    critRate: 0.05, critDamage: 1.3, damageBonus: 0,
    isStaggered: isStaggered.value,
  }

  result.value = runTeamSimulation(teamData, config)
  nextTick(() => renderChart())
}

// ── Export / Import ──
function exportRotation() {
  const data = memberConfigs.map(mc => ({
    name: mc.name,
    charId: mc.charId,
    rotation: mc.rotation,
    attack: mc.attack,
  }))
  const blob = new Blob([JSON.stringify({ version: 2, members: data, gains: selectedGainIds.value }, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = `rotation_export_${Date.now()}.json`
  a.click(); URL.revokeObjectURL(url)
  ElMessage.success('已导出循环配置，可在排轴编辑器中导入')
}

function onImportFile(uploadFile: any) {
  const file = uploadFile.raw || uploadFile
  if (!file) return
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target?.result as string)
      if (data.version === 2 && Array.isArray(data.members)) {
        for (const imported of data.members) {
          const mc = memberConfigs.find(m => m.charId === imported.charId || m.name === imported.name)
          if (mc && Array.isArray(imported.rotation)) {
            mc.rotation = imported.rotation.map((r: any) => ({
              skillId: r.skillId,
              skillType: r.skillType,
              label: r.label,
              charIndex: r.charIndex,
            }))
          }
        }
        if (Array.isArray(data.gains)) {
          selectedGainIds.value = data.gains
        }
        ElMessage.success('已导入循环配置')
        showImportDialog.value = false
      }
    } catch (err) {
      ElMessage.error('导入失败: ' + (err as Error).message)
    }
  }
  reader.readAsText(file)
}

// ── Navigation ──
function goToTimeline() {
  if (selectedScenarioId.value) {
    router.push(`/timeline?scenarioId=${selectedScenarioId.value}`)
  }
}

// ── Chart ──
function skillDetailRows(mr: TeamSimulationResult['members'][0]) {
  const total = mr.totalDamage
  return Object.entries(mr.skillBreakdown).map(([id, data]) => ({
    skill: id,
    count: data.count,
    damage: data.totalDamage,
    pct: data.totalDamage / total,
  }))
}

function renderChart() {
  if (!charChartRef.value || !result.value) return
  if (!charChart) charChart = echarts.init(charChartRef.value)
  charChart.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    series: [{
      type: 'pie', radius: ['30%', '60%'],
      data: result.value.members.map((m, i) => ({
        name: m.name, value: m.totalDamage, itemStyle: { color: colors[i % colors.length] },
      })),
      label: { formatter: '{b}\n{d}%', fontSize: 10 },
    }],
  })
}

// ── Init ──
onMounted(async () => {
  try {
    allGains.value = await GainApi.listAll()
  } catch { /* ignore */ }

  try {
    const allScenarios = await TimelineApi.listAll()
    scenarios.value = allScenarios
  } catch { /* ignore */ }

  try {
    teams.value = await TeamApi.listAll()
  } catch { /* ignore */ }

  const teamId = route.query.teamId as string
  const scenarioId = route.query.scenarioId as string
  if (scenarioId) {
    mode.value = 'scenario'
    selectedScenarioId.value = scenarioId
    await onScenarioSelect(scenarioId)
  } else if (teamId) {
    mode.value = 'manual'
    const team = teams.value.find(t => t.id === teamId)
    if (team) {
      selectedTeam.value = team
      await onTeamChange(team)
    }
  }
})
</script>

<style scoped>
.dps-page { padding: 8px; height: calc(100vh - 80px); }
.dps-layout { display: flex; gap: 8px; height: 100%; }
.left-panel { flex: 0 0 400px; overflow-y: auto; }
.right-panel { flex: 1; overflow-y: auto; min-width: 0; }
.skill-row { display: flex; align-items: center; padding: 3px 0; border-bottom: 1px solid #f0f0f0; }
.step-row { display: flex; align-items: center; justify-content: space-between; padding: 2px 6px; margin: 1px 0; background: #f9f9f9; border-radius: 4px; }
.cat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; }
.cat-card { background: #f5f7fa; border-radius: 6px; padding: 8px; text-align: center; }
.cat-badge { font-size: 10px; color: #909399; }
.cat-val { font-size: 14px; font-weight: 700; color: #303133; }
</style>
