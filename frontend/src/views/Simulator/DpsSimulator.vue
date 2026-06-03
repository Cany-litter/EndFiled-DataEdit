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
                      <span class="skill-icon">{{ skillShortName(sk.type, sk.id) }}</span>
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
            <el-tab-pane v-for="mr in result.members" :key="mr.name" :label="charNameMap[mr.name] || mr.name" :name="mr.name">
              <div class="toolbar">
                <el-button size="small" @click="addSelfBuffCol">+ 己方增益列</el-button>
                <el-button size="small" @click="addEnemyBuffCol">+ 敌方增益列</el-button>
                <el-button size="small" type="primary" @click="addRowToCurrentTab" style="margin-left:4px">+ 添加行</el-button>
                <el-button size="small" :disabled="currentRowSeq === null" type="danger" @click="deleteCurrentRow" style="margin-left:4px">删除</el-button>
                <el-button size="small" :disabled="currentRowSeq === null" @click="showDamageCalc" style="margin-left:4px">展示伤害计算过程</el-button>
                <el-button size="small" :type="dirty ? 'warning' : 'primary'" style="margin-left:8px" @click="runSim">{{ dirty ? '⚠ 更新计算' : '✓ 更新计算' }}</el-button>
                <span style="font-size:12px;color:var(--text-secondary);margin-left:8px">
                  点击选中行 | 点击技能库技能替换技能名称 | 点击增益/敌人填入对应列
                </span>
              </div>
              <el-table :data="mr.actionRows" border stripe size="small" style="width:100%" max-height="320px" highlight-current-row row-key="seq" @current-change="onCurrentRowChange">
                <el-table-column label="序号" type="index" width="50" />
                <el-table-column label="时间" width="60">
                  <template #default="{ row }">{{ row.time.toFixed(1) }}s</template>
                </el-table-column>
                <el-table-column label="技能类型" width="80">
                  <template #default="{ row }">
                    <span class="skill-tag" :class="'s-' + row.skillType">{{ typeLabel(row.skillType) }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="技能名称" min-width="100">
                  <template #default="{ row }">
                    <span class="clickable-cell" @click="replaceSkill(row)">{{ row.skillName }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="伤害类型" width="75">
                  <template #default="{ row }">
                    <span class="dmg-tag" :class="'d-' + row.damageType">{{ damageTypeLabel(row.damageType) }}</span>
                  </template>
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
                <el-table-column label="期望伤害" width="100">
                  <template #default="{ row }">{{ Math.round(row.damage).toLocaleString() }}</template>
                </el-table-column>
                <el-table-column label="不暴击伤害" width="100">
                  <template #default="{ row }">{{ row.nonCritDmg != null ? Math.round(row.nonCritDmg).toLocaleString() : '-' }}</template>
                </el-table-column>
                <el-table-column label="暴击伤害" width="100">
                  <template #default="{ row }">{{ row.critDmg != null ? Math.round(row.critDmg).toLocaleString() : '-' }}</template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
          </el-tabs>

          <div style="display:flex;gap:8px;margin-bottom:8px;align-items:stretch">
            <el-card shadow="never" style="flex:2;min-width:320px">
              <template #header><span style="font-size:13px;font-weight:600">伤害统计</span></template>
              <el-table :data="statRows" border stripe size="small" style="width:100%">
                <el-table-column label="干员" min-width="70">
                  <template #default="{ row }">{{ charNameMap[row.name] || row.name }}</template>
                </el-table-column>
                <el-table-column label="总伤害" min-width="100">
                  <template #default="{ row }">{{ row.totalDamage.toFixed(0) }}</template>
                </el-table-column>
                <el-table-column label="DPS" min-width="80">
                  <template #default="{ row }">{{ row.dps.toFixed(1) }}</template>
                </el-table-column>
                <el-table-column label="占比" min-width="60">
                  <template #default="{ row }">{{ (row.pct * 100).toFixed(1) }}%</template>
                </el-table-column>
                <el-table-column label="消耗技力" min-width="70">
                  <template #default="{ row }">{{ row.totalSpUsed }}</template>
                </el-table-column>
              </el-table>
            </el-card>
            <el-card shadow="never" style="flex:1;min-width:180px">
              <template #header><span style="font-size:12px;font-weight:600">元素伤害占比</span></template>
              <div ref="elementChartRef" style="height:160px" />
            </el-card>
            <el-card shadow="never" style="flex:1;min-width:180px">
              <template #header><span style="font-size:12px;font-weight:600">技能类型伤害占比</span></template>
              <div ref="skillTypeChartRef" style="height:160px" />
            </el-card>
          </div>

          <el-card shadow="never" style="margin-top:8px">
            <template #header>
              <span style="font-size:13px;font-weight:600">敌人配置</span>
              <el-button size="small" style="float:right" @click="openEnemySearch()">+ 添加敌人</el-button>
            </template>
            <div v-if="enemyList.length === 0" style="color:#909399;font-size:12px;padding:8px 0">暂无敌人，请点击"添加敌人"</div>
            <div v-else style="display:flex;flex-direction:column;gap:6px">
              <div v-for="e in enemyList" :key="e.id"
                class="enemy-card" :class="{ 'enemy-selected': selectedEnemyId === e.id }"
                @click="selectedEnemyId = e.id">
                <div style="display:flex;justify-content:space-between;align-items:center">
                  <span style="font-weight:600;font-size:12px">{{ e.name }}</span>
                  <el-button size="small" text type="danger" @click.stop="removeEnemy(e.id)">✕</el-button>
                </div>
                <div style="display:flex;gap:6px;margin-top:4px;flex-wrap:wrap">
                  <span style="font-size:11px;color:var(--text-secondary);line-height:28px">防御</span>
                  <el-input-number v-model="e.def" :min="0" :max="5000" size="small" style="width:120px" @click.stop @change="markEnemyDirty" />
                  <span style="font-size:11px;color:var(--text-secondary);line-height:28px;margin-left:4px">物理抗性</span>
                  <el-input-number v-model="e.physicalResist" :min="-100" :max="100" size="small" style="width:120px" @click.stop @change="markEnemyDirty" />
                  <span style="font-size:11px;color:var(--text-secondary);line-height:28px">灼热抗性</span>
                  <el-input-number v-model="e.burnResist" :min="-100" :max="100" size="small" style="width:120px" @click.stop @change="markEnemyDirty" />
                  <span style="font-size:11px;color:var(--text-secondary);line-height:28px">电磁抗性</span>
                  <el-input-number v-model="e.electroResist" :min="-100" :max="100" size="small" style="width:120px" @click.stop @change="markEnemyDirty" />
                  <span style="font-size:11px;color:var(--text-secondary);line-height:28px">寒冷抗性</span>
                  <el-input-number v-model="e.coldResist" :min="-100" :max="100" size="small" style="width:120px" @click.stop @change="markEnemyDirty" />
                  <span style="font-size:11px;color:var(--text-secondary);line-height:28px">自然抗性</span>
                  <el-input-number v-model="e.natureResist" :min="-100" :max="100" size="small" style="width:120px" @click.stop @change="markEnemyDirty" />
                </div>
              </div>
            </div>
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

    <el-dialog v-model="showEnemySearch" title="添加敌人" width="400px">
      <el-select v-model="searchEnemyKeyword" filterable placeholder="搜索敌人..." style="width:100%" @change="onEnemySelect">
        <el-option v-for="e in enemyDbList" :key="e.id" :label="e.name" :value="e.id" />
      </el-select>
    </el-dialog>

    <el-dialog v-model="showDamageDetail" title="伤害计算过程" width="640px">
      <div v-if="damageCalcData" class="dc-detail">
        <div class="dc-header">
          <span class="dc-skill-name">{{ damageCalcData.skillName }}</span>
          <el-tag size="small">{{ typeLabel(damageCalcData.skillType) }}</el-tag>
          <el-tag size="small" type="info" style="margin-left:4px">{{ damageTypeLabel(damageCalcData.damageType) }}</el-tag>
        </div>

        <div class="dc-params">
          <div class="dc-param"><label>攻击力</label><span>{{ damageCalcData.attack.toFixed(2) }}</span></div>
          <div class="dc-param"><label>技能倍率</label><span>{{ (damageCalcData.multiplier * 100).toFixed(2) }}%</span></div>
          <div class="dc-param"><label>暴击率</label><span>{{ (damageCalcData.critRate * 100).toFixed(2) }}%</span></div>
          <div class="dc-param"><label>暴击伤害</label><span>{{ (damageCalcData.critDamage * 100).toFixed(2) }}%</span></div>
          <div class="dc-param"><label>敌方防御</label><span>{{ damageCalcData.defense }}</span></div>
          <div class="dc-param"><label>敌方抗性</label><span>{{ damageCalcData.resistance }}%</span></div>
        </div>

        <div class="dc-section">
          <div class="dc-section-title">伤害拆解</div>
          <div class="dc-calc">
            <div class="dc-row">
              <span>基础伤害 = 攻击力 × 倍率</span>
              <span class="dc-val">{{ damageCalcData.attack.toFixed(2) }} × {{ (damageCalcData.multiplier * 100).toFixed(2) }}% = {{ damageCalcData.baseDamage.toFixed(4) }}</span>
            </div>

            <template v-for="cat in damageCalcData.categories" :key="cat.label">
              <div class="dc-row">
                <span v-if="cat.buffs.length > 0">{{ cat.label }}乘区 = 1 + {{ cat.buffs.map(b => (b.value * 100).toFixed(2) + '%').join(' + ') }}</span>
                <span v-else>{{ cat.label }}乘区 = 1</span>
                <span class="dc-val">{{ cat.multiplier.toFixed(4) }}x</span>
              </div>
              <div v-for="b in cat.buffs" :key="b.name" class="dc-buff-row">
                <span class="dc-buff-name">├ {{ b.name }}</span>
                <span class="dc-buff-val">+{{ (b.value * 100).toFixed(2) }}%</span>
              </div>
              <div v-if="cat.buffs.length === 0" class="dc-buff-row">
                <span class="dc-buff-name">└ 无增益</span>
              </div>
            </template>

            <div class="dc-row">
              <span>暴击乘区 = 1 + {{ (damageCalcData.critRate * 100).toFixed(2) }}% × {{ (damageCalcData.critDamage * 100).toFixed(2) }}%</span>
              <span class="dc-val">{{ damageCalcData.critMult.toFixed(4) }}x</span>
            </div>
            <div class="dc-row">
              <span>防御乘区 = 100 / (防御 + 100)</span>
              <span class="dc-val">100 / ({{ damageCalcData.defense }} + 100) = {{ damageCalcData.defenseMult.toFixed(4) }}x</span>
            </div>
            <div class="dc-row">
              <span>抗性乘区 = 1 - 抗性%</span>
              <span class="dc-val">1 - {{ damageCalcData.resistance }}% = {{ damageCalcData.resistanceMult.toFixed(4) }}x</span>
            </div>
            <div class="dc-row">
              <span>目标数</span>
              <span class="dc-val">{{ damageCalcData.targetCount }}</span>
            </div>
            <div class="dc-row">
              <span>不暴击伤害（暴击乘区=1）</span>
              <span class="dc-val">{{ damageCalcData.nonCritDmg.toFixed(2) }}</span>
            </div>
            <div class="dc-row">
              <span>暴击伤害（100%暴击）</span>
              <span class="dc-val" style="color:var(--status-danger)">{{ damageCalcData.critDmg.toFixed(2) }}</span>
            </div>
            <div class="dc-row dc-subtotal">
              <span>期望伤害</span>
              <span class="dc-val dc-final">{{ damageCalcData.finalDamage.toFixed(2) }}</span>
            </div>
          </div>
        </div>

        <div class="dc-formula">
          {{ damageCalcData.attack.toFixed(2) }} × {{ (damageCalcData.multiplier * 100).toFixed(2) }}%
          <template v-for="cat in damageCalcData.categories" :key="cat.label"> × {{ cat.multiplier.toFixed(4) }}</template>
          × {{ damageCalcData.critMult.toFixed(4) }} × {{ damageCalcData.defenseMult.toFixed(4) }} × {{ damageCalcData.resistanceMult.toFixed(4) }} × {{ damageCalcData.targetCount }}
          = {{ damageCalcData.finalDamage.toFixed(2) }}
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as echarts from 'echarts'
import { TeamApi, CharacterApi, BuildApi, WeaponApi, EquipmentApi, SkillApi, SkillLevelApi, SkillActionApi, GainApi, TimelineApi, EnemyApi, CharacterStatApi, WeaponStatApi, WeaponAffixApi } from '../../api'
import type { Team, Gain, CharacterStat } from '../../api'
import { buildBaseLayer, buildWeaponLayer, equipSubStatsToLayer, buildGainsLayer, buildSetEffectsLayer, computeDerivedFinal } from '../../engine/formulas/stats'
import type { FinalStats } from '../../engine/formulas/stats'
import { GAIN_CATEGORY_TO_DAMAGE_CAT } from '../../engine/formulas/stats'
import { calcDamageByCategories, DAMAGE_CATEGORIES } from '../../engine/formulas/damageCategories'
import { collectCrit } from '../../engine/formulas/effectResolver'
import { simulateRows } from '../../engine/simulation/teamEngine'
import type { ActionRow, SimulateRowsConfig, TeamSimulationResult } from '../../engine/simulation/types'
import type { Track } from '../../engine/types/timeline'
import { skillShortName } from '../../utils/constants'

const route = useRoute()

// ── State ──
const scenarios = ref<any[]>([])
const selectedScenarioId = ref('')
const allGains = ref<Gain[]>([])
const memberConfigs = reactive<{ name: string; charId: string; attack: number; stats: FinalStats; availableSkills: any[]; weaponName: string; statLayer: Record<string, number> }[]>([])
const teamData = ref<Team | null>(null)
const actionRows = ref<ActionRow[]>([])
const selfBuffColCount = ref(2)
const enemyBuffColCount = ref(2)
const selectedSkillId = ref<string | null>(null)
const selectedGainId = ref<string | null>(null)
const selectedCharIndex = ref(0)
const activeResultTab = ref('')

const skillLv12Map = ref<Record<string, number>>({})
const skillTypeMap = ref<Record<string, string>>({})
const skillDamageTypeMap = ref<Record<string, string>>({})
const charSkillMap = ref<Record<string, any[]>>({})
const result = ref<TeamSimulationResult | null>(null)
const dirty = ref(false)

// ── Current row tracking ──
const currentRowSeq = ref<number | null>(null)

// ── Damage calc dialog ──
const showDamageDetail = ref(false)
interface CategoryMult {
  label: string
  multiplier: number
  buffs: { name: string; value: number }[]
}
interface DamageCalcData {
  skillName: string
  skillType: string
  damageType: string
  attack: number
  multiplier: number
  baseDamage: number
  categories: CategoryMult[]
  critRate: number
  critDamage: number
  critMult: number
  defense: number
  defenseMult: number
  resistance: number
  resistanceMult: number
  comboMult: number
  comboCount: number
  targetCount: number
  finalDamage: number
  nonCritDmg: number
  critDmg: number
}
const damageCalcData = ref<DamageCalcData | null>(null)

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
interface EnemyBrief { id: string; name: string; enemyId?: string; def: number; physicalResist: number; burnResist: number; electroResist: number; coldResist: number; natureResist: number }

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
  const m: Record<string, string> = { normal: '普', charged: '重', execution: '处', plunge: '落', attack: '普', skill: '技', chain: '连', link: '连', ultimate: '终', talent1: '天1', talent2: '天2' }
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

// ── Current row ──
function onCurrentRowChange(row: ActionRow | null) {
  currentRowSeq.value = row?.seq ?? null
}

function deleteCurrentRow() {
  if (currentRowSeq.value === null) { ElMessage.info('请先点击选中要删除的行'); return }
  actionRows.value = actionRows.value.filter(r => r.seq !== currentRowSeq.value)
  actionRows.value.forEach((r, i) => r.seq = i + 1)
  currentRowSeq.value = null
  dirty.value = true
  runSim()
}

function showDamageCalc() {
  if (currentRowSeq.value === null) { ElMessage.info('请先点击选中一行'); return }
  const row = actionRows.value.find(r => r.seq === currentRowSeq.value)
  if (!row) return

  const mc = memberConfigs.find(m => m.charId === row.charId)
  if (!mc) return

  const mult = skillLv12Map.value[row.skillId] ?? 1
  const atk = mc.attack
  const baseDamage = atk * mult
  const critRate = mc.stats.critRate
  const critDamage = mc.stats.critDamage
  const enemy = enemyList.value.find(e => e.id === row.targetEnemyId)
  const def = enemy?.def ?? 100
  const isTrue = row.damageType === 'true'
  const defMult = isTrue ? 1 : 100 / (def + 100)
  const ELEMENT_RESIST_KEY: Record<string, string> = {
    physical: 'physicalResist', pyro: 'burnResist',
    electro: 'electroResist', cryo: 'coldResist',
    natural: 'natureResist',
  }
  const elem = row.damageType || 'physical'
  const resistKey = ELEMENT_RESIST_KEY[elem]
  const resist = resistKey && enemy ? (enemy as any)[resistKey] ?? 0 : 0
  const resMult = 1 - resist / 100

  const ELEMENT_DMG_KEY: Record<string, string> = {
    physical: 'physicalDmgBonus', pyro: 'burnDmgBonus',
    electro: 'electroDmgBonus', cryo: 'frostDmgBonus',
    natural: 'natureDmgBonus', ultra: 'extraDmgBonus',
  }
  const SKILLTYPE_DMG_KEY: Record<string, string> = {
    normal: 'normalAtkDmgBonus', skill: 'skillDmgBonus',
    chain: 'chainDmgBonus', ultimate: 'ultimateDmgBonus',
  }

  const buffs: any[] = []
  // Row buffs
  for (const gid of [...row.selfBuffs, ...row.enemyBuffs]) {
    if (!gid) continue
    const g = allGains.value.find(x => x.id === gid)
    if (!g) continue
    const cat = GAIN_CATEGORY_TO_DAMAGE_CAT[g.effectCategory ?? '']
    if (cat && g.effectValue != null && g.effectCategory !== '失衡') {
      buffs.push({
        id: g.id, name: g.name ?? g.id,
        source: 'gain', buffType: 'permanent',
        effectCategory: g.effectCategory ?? '', effectType: g.effectType ?? '',
        effectValue: g.effectValue, stackRule: 'add_same', targetScope: 'self',
        effects: [{ category: cat, value: g.valueType === 'percentage' ? g.effectValue : g.effectValue }],
      })
    }
  }

  // Stat-layer damage bonuses as virtual buffs
  const sl = mc.statLayer || {}
  const elemKey = ELEMENT_DMG_KEY[elem]
  const elemBonus = elemKey ? ((sl[elemKey] ?? 0) / 100) : 0
  if (elemBonus > 0) {
    buffs.push({ id: '_elem', name: '面板元素伤害加成', effects: [{ category: 'DMG_Dealt', value: elemBonus }] })
  }
  const allBonus = (sl['damageBonus'] ?? 0) / 100
  if (allBonus > 0) {
    buffs.push({ id: '_all', name: '面板全伤害加成', effects: [{ category: 'DMG_Dealt', value: allBonus }] })
  }
  const stKey = SKILLTYPE_DMG_KEY[row.skillType]
  const stBonus = stKey ? ((sl[stKey] ?? 0) / 100) : 0
  if (stBonus > 0) {
    buffs.push({ id: '_st', name: '面板技能类型伤害加成', effects: [{ category: 'DMG_Dealt', value: stBonus }] })
  }
  const staggerBonus = (sl['staggerDmgBonus'] ?? 0) / 100
  if (staggerBonus > 0) {
    buffs.push({ id: '_stagger', name: '面板对失衡目标伤害加成', effects: [{ category: 'Staggered', value: staggerBonus }] })
  }

  const context = {
    skillType: skillTypeMap.value[row.skillId] ?? 'other',
    element: row.damageType || 'physical',
    statTotals: { strength: mc.stats.str, agility: mc.stats.agi, intellect: mc.stats.int, will: mc.stats.wil },
  }

  const { breakdown: catBreakdown } = calcDamageByCategories(baseDamage, buffs, DAMAGE_CATEGORIES, context)
  const categories: CategoryMult[] = []
  for (const cat of DAMAGE_CATEGORIES) {
    const entry = catBreakdown[cat.key]
    if (entry) {
      categories.push({
        label: cat.label,
        multiplier: entry.multiplier,
        buffs: entry.contributions.map(c => ({ name: c.buffName, value: c.value })),
      })
    }
  }

  const crit = collectCrit(buffs, context, critRate, critDamage)
  let catFinal = baseDamage
  for (const cat of categories) catFinal *= cat.multiplier
  const expectedFinal = catFinal * crit.expectedMultiplier * defMult * resMult * row.targetCount
  const nonCritFinal = catFinal * 1 * defMult * resMult * row.targetCount
  const critHitFinal = catFinal * (1 + crit.critDamage) * defMult * resMult * row.targetCount

  damageCalcData.value = {
    skillName: row.skillName, skillType: row.skillType, damageType: row.damageType,
    attack: atk, multiplier: mult, baseDamage,
    categories,
    critRate: crit.critRate, critDamage: crit.critDamage, critMult: crit.expectedMultiplier,
    defense: def, defenseMult: defMult, resistance: resist, resistanceMult: resMult,
    comboMult: 1, comboCount: 0, targetCount: row.targetCount, finalDamage: expectedFinal,
    nonCritDmg: nonCritFinal,
    critDmg: critHitFinal,
  }
  showDamageDetail.value = true
}

function mapActionTypeToSkillType(type: string): string {
  const m: Record<string, string> = { attack: 'normal', skill: 'skill', link: 'chain', ultimate: 'ultimate', execution: 'other' }
  return m[type] ?? 'other'
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
  selfBuffColCount.value = 2
  enemyBuffColCount.value = 2
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

  // Load level-based stat data for layered calculation
  const allCharStats = await CharacterStatApi.listAll()
  const allWeaponStats = await WeaponStatApi.listAll()
  const allWeaponAffixes = await WeaponAffixApi.listAll()

  const csm: Record<string, CharacterStat> = {}
  for (const s of allCharStats) csm[s.characterId + ':' + s.level] = s
  const wsm: Record<string, number> = {}
  for (const s of allWeaponStats) wsm[s.weaponId + ':' + s.level] = s.baseAtk

  const lv12Map: Record<string, number> = {}
  const typeMap: Record<string, string> = {}
  const dmgTypeMap: Record<string, string> = {}
  for (const lv of allLevels) { if (lv.level === 12) lv12Map[lv.skillId] = lv.multiplier }
  for (const sk of allSkills) { typeMap[sk.id] = sk.type; dmgTypeMap[sk.id] = sk.damageType }
  skillLv12Map.value = lv12Map
  skillTypeMap.value = typeMap
  skillDamageTypeMap.value = dmgTypeMap

  const slots = [team.charAId, team.charBId, team.charCId, team.charDId]
  const buildSlots = [team.buildAId, team.buildBId, team.buildCId, team.buildDId]
  const order: string[] = []
  const charList: typeof memberConfigs = []

  const slotKeys = ['armor', 'glove', 'accessory', 'accessory2']
  const slotFields = ['armorId', 'gloveId', 'accessory1Id', 'accessory2Id']
  const slotLabels = ['护甲', '护手', '配件1', '配件2']

  const ETYPE_TO_DMG_CAT: Record<string, string> = {
    phys_dmg_up: 'DMG_Dealt', phy_dmg_up: 'DMG_Dealt',
    burn_dmg_up: 'DMG_Dealt', blaze_dmg_up: 'DMG_Dealt',
    electro_dmg_up: 'DMG_Dealt', emag_dmg_up: 'DMG_Dealt',
    frost_dmg_up: 'DMG_Dealt', cold_dmg_up: 'DMG_Dealt',
    nature_dmg_up: 'DMG_Dealt', extra_dmg_up: 'DMG_Dealt',
    all_dmg_up: 'DMG_Dealt',
    skill_dmg_up: 'DMG_Dealt', link_dmg_up: 'DMG_Dealt',
    ult_dmg_up: 'DMG_Dealt', normal_atk_dmg_up: 'DMG_Dealt',
    stagger_dmg_up: 'Staggered',
  }
  const DESC_TO_DMG_CAT: Record<string, string> = {
    '物理伤害加成': 'DMG_Dealt', '灼热伤害加成': 'DMG_Dealt',
    '电磁伤害加成': 'DMG_Dealt', '寒冷伤害加成': 'DMG_Dealt',
    '自然伤害加成': 'DMG_Dealt', '超域伤害加成': 'DMG_Dealt',
    '全伤害加成': 'DMG_Dealt', '伤害加成': 'DMG_Dealt',
  }

  for (let i = 0; i < 4; i++) {
    const charId = slots[i]
    if (!charId) continue
    const c = chars.find(ch => ch.id === charId)
    if (!c) continue
    order.push(charId)

    const build = allBuilds.find((b: any) => b.id === buildSlots[i])
    const weapon = build?.weaponId ? weapons.find((w: any) => w.id === build.weaponId) : null

    // Override skill multipliers with build's saved levels
    if (build?.skillLevels) {
      try {
        const savedLevels: Record<string, number> = JSON.parse(build.skillLevels)
        for (const [skillId, level] of Object.entries(savedLevels)) {
          const lvEntry = allLevels.find((l: any) => l.skillId === skillId && l.level === level)
          if (lvEntry) lv12Map[skillId] = lvEntry.multiplier
        }
      } catch {}
    }

    // 1. Char config with level-scaled stats
    const charLevel = build?.charLevel ?? 90
    const cs = csm[c.id + ':' + charLevel]
    const charCfg = {
      baseAtk: cs?.atk ?? c.baseAtk, baseHp: cs?.hp ?? c.baseHp,
      baseStr: cs?.str ?? c.baseStr, baseAgi: cs?.agi ?? c.baseAgi,
      baseInt: cs?.int ?? c.baseInt, baseWil: cs?.wil ?? c.baseWil,
      mainAttr: c.mainAttr, subAttr: c.subAttr, trustLevel: 1,
    }
    const baseLayer = buildBaseLayer(charCfg)

    // 2. Weapon config with level-scaled baseAtk and affixes
    const weaponLevel = build?.weaponLevel ?? 90
    const wBaseAtk = weapon ? (wsm[weapon.id + ':' + weaponLevel] ?? weapon.baseAtk ?? 0) : 0
    const waList = weapon ? allWeaponAffixes.filter((a: any) => a.weaponId === weapon.id) : []
    const aff1 = waList.find((a: any) => a.affixIndex === 1 && a.potential === (build?.affix1Level ?? 1) - 1)
    const aff2 = waList.find((a: any) => a.affixIndex === 2 && a.potential === (build?.affix2Level ?? 1) - 1)
    const weaponCfg = {
      baseAtk: wBaseAtk,
      affix1Type: aff1?.type ?? weapon?.affix1Type, affix1Value: aff1?.value ?? weapon?.affix1Value,
      affix2Type: aff2?.type ?? weapon?.affix2Type, affix2Value: aff2?.value ?? weapon?.affix2Value,
    }
    const weaponLayer = buildWeaponLayer(weaponCfg)

    // 3. Equipment substats with refines
    const equipRefines: Record<string, number> = build?.equipRefines
      ? (() => { try { return JSON.parse(build.equipRefines) } catch { return {} } })() : {}
    const equipSubs: Array<{ desc: string; value: number }> = []
    let totalDef = 0
    if (build) {
      for (let si = 0; si < 4; si++) {
        const eid = (build as any)[slotFields[si]]
        if (!eid) continue
        const eq = allEquipment.find((e: any) => e.id === eid)
        if (!eq) continue
        for (let ai = 1; ai <= 3; ai++) {
          const type = (eq as any)['attr' + ai + 'Type']
          if (!type) continue
          const refine = equipRefines[slotKeys[si] + 'r' + ai] ?? 0
          const vals = [
            (eq as any)['attr' + ai + 'Value'] ?? 0,
            (eq as any)['attr' + ai + 'V1'] ?? 0,
            (eq as any)['attr' + ai + 'V2'] ?? 0,
            (eq as any)['attr' + ai + 'V3'] ?? 0,
          ]
          const v = vals[Math.min(refine, 3)] ?? vals[0]
          if (v) equipSubs.push({ desc: type, value: v })
        }
        totalDef += eq.baseDef ?? 0
      }
    }
    if (totalDef > 0) equipSubs.push({ desc: '基础防御力', value: totalDef })
    const equipLayer = equipSubStatsToLayer(equipSubs)

    // 4. Set effects
    const setNameCount = new Map<string, number>()
    if (build) {
      for (let si = 0; si < 4; si++) {
        const eid = (build as any)[slotFields[si]]
        if (!eid) continue
        const eq = allEquipment.find((e: any) => e.id === eid)
        if (eq?.setName) setNameCount.set(eq.setName, (setNameCount.get(eq.setName) ?? 0) + 1)
      }
    }
    const activeSetNames = Array.from(setNameCount.entries()).filter(([, c]) => c >= 3).map(([n]) => n)
    const setEffects: Array<{ setName: string; etype?: string; value?: number; desc?: string }> = []
    if (build) {
      for (let si = 0; si < 4; si++) {
        const eid = (build as any)[slotFields[si]]
        if (!eid) continue
        const eq: any = allEquipment.find((e: any) => e.id === eid)
        if (!eq || !activeSetNames.includes(eq.setName ?? '')) continue
        if (eq.setEffect1Etype) setEffects.push({ setName: eq.setName, etype: eq.setEffect1Etype, value: eq.setEffect1Value, desc: eq.setEffect1Desc })
        if (eq.setEffect2Etype) setEffects.push({ setName: eq.setName, etype: eq.setEffect2Etype, value: eq.setEffect2Value, desc: eq.setEffect2Desc })
      }
    }
    const setLayer = buildSetEffectsLayer(setEffects, activeSetNames)

    // 5. Gains
    const selectedGainIds: string[] = build?.selectedGains
      ? (() => { try { return JSON.parse(build.selectedGains) } catch { return [] } })() : []
    const selectedGains = allGains.value.filter(g => selectedGainIds.includes(g.id))
    const gainsLayer = buildGainsLayer(selectedGains)

    // 6. Final layer
    const finalLayer = computeDerivedFinal([baseLayer, weaponLayer, equipLayer, setLayer, gainsLayer], charCfg)

    // 7. Convert to FinalStats for compatibility
    const stats: FinalStats = {
      attack: finalLayer.atk ?? 0,
      hp: finalLayer.hp ?? 0,
      defense: finalLayer.defense ?? 0,
      damageReduction: (finalLayer.damageReduction ?? 0) / 100,
      str: finalLayer.str ?? 0, agi: finalLayer.agi ?? 0, int: finalLayer.int ?? 0, wil: finalLayer.wil ?? 0,
      attrBonus: 0, strHpBonus: 0, defPercent: 0,
      critRate: (finalLayer.critRate ?? 5) / 100,
      critDamage: (finalLayer.critDamage ?? 50) / 100,
      damageBonus: 0,
      artsMastery: finalLayer.artsMastery ?? 0,
      energyRecharge: (finalLayer.energyRecharge ?? 0) / 100,
      physicalResist: (finalLayer.physicalResist ?? 0) / 100,
      magicResist: 0,
      healEfficiency: (finalLayer.healEfficiency ?? 0) / 100,
    }

    // 8. Collect damage source details
    const damageSources: { category: string; value: number; sourceName: string }[] = []
    if (build) {
      // From set effects
      for (const se of setEffects) {
        const cat = ETYPE_TO_DMG_CAT[se.etype ?? '']
        if (cat && se.value != null && se.value !== 0) {
          damageSources.push({ category: cat, value: se.value, sourceName: se.desc || `${se.setName}(套装效果)` })
        }
      }
      // From equipment substats (damage bonus types)
      for (let si = 0; si < 4; si++) {
        const eid = (build as any)[slotFields[si]]
        if (!eid) continue
        const eq = allEquipment.find((e: any) => e.id === eid)
        if (!eq) continue
        for (let ai = 1; ai <= 3; ai++) {
          const type = (eq as any)['attr' + ai + 'Type']
          if (!type) continue
          const cat = DESC_TO_DMG_CAT[type] ?? ETYPE_TO_DMG_CAT[type]
          if (!cat) continue
          const refine = equipRefines[slotKeys[si] + 'r' + ai] ?? 0
          const vals = [
            (eq as any)['attr' + ai + 'Value'] ?? 0,
            (eq as any)['attr' + ai + 'V1'] ?? 0,
            (eq as any)['attr' + ai + 'V2'] ?? 0,
            (eq as any)['attr' + ai + 'V3'] ?? 0,
          ]
          const v = vals[Math.min(refine, 3)] ?? vals[0]
          if (v) damageSources.push({ category: cat, value: v, sourceName: `${eq.name}(${slotLabels[si]})` })
        }
      }
      // From selected gains
      for (const g of selectedGains) {
        const cat = GAIN_CATEGORY_TO_DAMAGE_CAT[g.effectCategory ?? '']
        if (cat && g.effectValue != null && g.effectCategory !== '失衡') {
          damageSources.push({
            category: cat,
            value: g.valueType === 'percentage' ? g.effectValue / 100 : g.effectValue,
            sourceName: g.name ?? g.id,
          })
        }
      }
    }

    const skills = allSkills.filter((s: any) => s.characterId === c.id)
    const typeOrder: Record<string, number> = { normal: 0, attack: 0, charged: 1, plunge: 2, execution: 3, skill: 4, chain: 5, link: 5, ultimate: 6, talent1: 7, talent2: 8, other: 9 }
    skills.sort((a: any, b: any) => (typeOrder[a.type] ?? 99) - (typeOrder[b.type] ?? 99))
    charSkillMap.value[c.id] = skills
    charList.push({
      name: c.name, charId: c.id, attack: stats.attack, stats,
      availableSkills: skills, weaponName: weapon?.name ?? '',
      statLayer: finalLayer,
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

  // Load enemies from scenario — correct def from Enemy API
  const allEnemies = await EnemyApi.listAll()
  const enemyDbMap = new Map(allEnemies.map((en: any) => [en.id, en]))
  if (sc.enemies) {
    try {
      const parsed = JSON.parse(sc.enemies)
      const parseResist = (v: any) => v != null ? Number(String(v).replace('%', '')) : 0
      const list = (Array.isArray(parsed) ? parsed : []).map((e: any) => {
        const dbEnemy = e.enemyId ? enemyDbMap.get(e.enemyId) : null
        const resist = (key: string): number => {
          const ev = (e as any)[key]
          if (ev != null) return parseResist(ev)
          if (dbEnemy) {
            const dv = (dbEnemy as any)[key]
            if (dv != null) return parseResist(dv)
          }
          return 0
        }
        return {
          id: e.id, name: e.name || e.id, enemyId: e.enemyId,
          def: dbEnemy?.def ?? e.def ?? 100,
          physicalResist: resist('physicalResist'),
          burnResist: resist('burnResist'),
          electroResist: resist('electroResist'),
          coldResist: resist('coldResist'),
          natureResist: resist('natureResist'),
        }
      })
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

  // 名称去重
  const baseName = found.name || found.id
  const existingNames = new Set(enemyList.value.map(e => e.name))
  let name = baseName
  if (existingNames.has(name)) {
    let suffix = 2
    while (existingNames.has(`${baseName}${suffix}`)) suffix++
    name = `${baseName}${suffix}`
  }

  const parseResist = (v: any) => v != null ? Number(String(v).replace('%', '')) : 0
  enemyList.value.push({
    id: found.id,
    name,
    def: found.def ?? 100,
    physicalResist: parseResist(found.physicalResist),
    burnResist: parseResist(found.burnResist),
    electroResist: parseResist(found.electroResist),
    coldResist: parseResist(found.coldResist),
    natureResist: parseResist(found.natureResist),
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

function markEnemyDirty() {
  dirty.value = true
}

function assignEnemy(row: ActionRow) {
  if (!selectedEnemyId.value) { ElMessage.info('请在左侧敌人配置中先点击选择一个敌人'); return }
  row.targetEnemyId = row.targetEnemyId === selectedEnemyId.value ? undefined : selectedEnemyId.value
  dirty.value = true
}

// ── Replace skill ──
function replaceSkill(row: ActionRow) {
  const skId = selectedSkillId.value
  if (!skId) { ElMessage.info('请在左侧技能库中先点击选择一个技能'); return }
  row.skillId = skId
  row.skillName = memberConfigs.flatMap(m => m.availableSkills).find(s => s.id === skId)?.name ?? skId
  row.skillType = skillTypeMap.value[skId] ?? 'other'
  row.damageType = skillDamageTypeMap.value[skId] ?? ''
  dirty.value = true
}

// ── Fill buff cells ──
function fillSelfBuff(row: ActionRow, ci: number) {
  if (!selectedGainId.value) { ElMessage.info('请在左侧增益库中先点击选择一个增益'); return }
  const gid = selectedGainId.value
  if (row.selfBuffs[ci] === gid) { row.selfBuffs[ci] = null; dirty.value = true; return }
  while (row.selfBuffs.length <= ci) row.selfBuffs.push(null)
  row.selfBuffs[ci] = gid
  dirty.value = true
}

function fillEnemyBuff(row: ActionRow, ci: number) {
  if (!selectedGainId.value) { ElMessage.info('请在左侧增益库中先点击选择一个增益'); return }
  const gid = selectedGainId.value
  if (row.enemyBuffs[ci] === gid) { row.enemyBuffs[ci] = null; dirty.value = true; return }
  while (row.enemyBuffs.length <= ci) row.enemyBuffs.push(null)
  row.enemyBuffs[ci] = gid
  dirty.value = true
}

// ── Add columns ──
function addSelfBuffCol() {
  selfBuffColCount.value++
  for (const row of actionRows.value) {
    while (row.selfBuffs.length < selfBuffColCount.value) row.selfBuffs.push(null)
  }
  dirty.value = true
}

function addEnemyBuffCol() {
  enemyBuffColCount.value++
  for (const row of actionRows.value) {
    while (row.enemyBuffs.length < enemyBuffColCount.value) row.enemyBuffs.push(null)
  }
  dirty.value = true
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
    selfBuffs: [null, null],
    targetCount: 1,
    enemyBuffs: [null, null],
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

  const enemyMap: Record<string, { def: number; resistance: number; physicalResist: number; burnResist: number; electroResist: number; coldResist: number; natureResist: number }> = {}
  for (const e of enemyList.value) { enemyMap[e.id] = { def: e.def, resistance: 0, physicalResist: e.physicalResist, burnResist: e.burnResist, electroResist: e.electroResist, coldResist: e.coldResist, natureResist: e.natureResist } }

  const charDamageSources: Record<string, { category: string; value: number; sourceName: string }[]> = {}
  const ELEMENT_DMG_KEY = { physical: 'physicalDmgBonus', pyro: 'burnDmgBonus', electro: 'electroDmgBonus', cryo: 'frostDmgBonus', natural: 'natureDmgBonus', ultra: 'extraDmgBonus' }
  const SKILLTYPE_DMG_KEY = { normal: 'normalAtkDmgBonus', skill: 'skillDmgBonus', chain: 'chainDmgBonus', ultimate: 'ultimateDmgBonus' }
  for (const mc of memberConfigs) {
    const sl = mc.statLayer
    if (!sl) continue
    const sources: { category: string; value: number; sourceName: string }[] = []
    for (const [elem, key] of Object.entries(ELEMENT_DMG_KEY)) {
      const v = (sl[key] ?? 0) / 100
      if (v > 0) sources.push({ category: 'DMG_Dealt', value: v, sourceName: `${elem}伤害加成` })
    }
    const allBonus = (sl['damageBonus'] ?? 0) / 100
    if (allBonus > 0) sources.push({ category: 'DMG_Dealt', value: allBonus, sourceName: '全伤害加成' })
    for (const [st, key] of Object.entries(SKILLTYPE_DMG_KEY)) {
      const v = (sl[key] ?? 0) / 100
      if (v > 0) sources.push({ category: 'DMG_Dealt', value: v, sourceName: `${st}类型伤害加成` })
    }
    const staggerBonus = (sl['staggerDmgBonus'] ?? 0) / 100
    if (staggerBonus > 0) sources.push({ category: 'Staggered', value: staggerBonus, sourceName: '对失衡目标伤害加成' })
    if (sources.length > 0) charDamageSources[mc.charId] = sources
  }

  const config: SimulateRowsConfig = {
    rows: actionRows.value,
    charStats,
    skillMap,
    gainMap: gainMap as any,
    gainCategoryMap: {},
    charDamageSources: Object.keys(charDamageSources).length > 0 ? charDamageSources : undefined,
    enemyMap,
    targetDef: 50,
    targetResistance: 20,
    resistanceIgnore: 0,
  }

  result.value = simulateRows(config)
  dirty.value = false
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
.lib-section { max-height: 260px; overflow-y: auto; margin-bottom: 4px; }
.char-block { margin-bottom: 6px; padding: 6px; border-radius: 6px; border: 2px solid transparent; cursor: pointer; transition: all 0.15s; background: #fafafa; }
.char-block:hover { border-color: #e4e7ed; }
.char-selected { border-color: #409eff; background: #f0f7ff; }
.char-header { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
.slot-badge { width: 18px; height: 18px; border-radius: 3px; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #fff; font-weight: 700; flex-shrink: 0; }
.char-name { font-size: 12px; font-weight: 600; color: var(--text-primary); }
.char-atk { font-size: 10px; color: var(--text-secondary); margin-left: auto; }
.skill-chips { display: grid; grid-template-columns: 1fr 1fr; gap: 3px; }
.skill-chip { display: inline-flex; align-items: center; gap: 3px; padding: 2px 6px; border-radius: 4px; font-size: 11px; cursor: pointer; border: 1px solid transparent; transition: all 0.15s; }
.skill-chip:hover { border-color: #c0c4cc; }
.skill-chip.active { border-color: #409eff; background: #ecf5ff; }
.skill-icon { width: 24px; height: 16px; border-radius: 2px; display: inline-flex; align-items: center; justify-content: center; font-size: 8px; color: #fff; font-weight: 600; }
.skill-name { color: #303133; }
.skill-mult { color: #909399; font-size: 10px; }
.type-normal .skill-icon,
.type-charged .skill-icon,
.type-execution .skill-icon,
.type-plunge .skill-icon { background: var(--skill-normal); }
.type-skill .skill-icon { background: var(--skill-skill); }
.type-chain .skill-icon { background: var(--skill-chain); }
.type-ultimate .skill-icon { background: var(--skill-ultimate); }
.type-talent1 .skill-icon { background: var(--skill-talent1); }
.type-talent2 .skill-icon { background: var(--skill-talent2); }
.type-other .skill-icon { background: var(--skill-other); }
.gain-section { display: flex; flex-wrap: wrap; gap: 4px; }
.gain-chip { display: inline-flex; align-items: center; gap: 3px; padding: 3px 8px; border-radius: 4px; font-size: 11px; cursor: pointer; border: 1px solid transparent; background: #f0f9eb; transition: all 0.15s; }
.gain-chip:hover { border-color: #b7eb8f; }
.gain-chip.active { border-color: var(--status-success); background: #e1f3d8; }
.gain-icon { width: 16px; height: 16px; border-radius: 2px; display: inline-flex; align-items: center; justify-content: center; font-size: 8px; color: var(--text-white); background: var(--status-success); }
.gain-name { color: var(--text-primary); }
.gain-meta { color: var(--text-secondary); font-size: 10px; }
.enemy-card { margin-bottom: 6px; padding: 8px; border-radius: 6px; border: 2px solid #e4e7ed; cursor: pointer; transition: all 0.15s; background: #fafafa; }
.enemy-card:hover { border-color: var(--text-placeholder); }
.enemy-selected { border-color: var(--status-primary); background: #f0f7ff; }
.toolbar { display: flex; align-items: center; gap: 4px; margin-bottom: 6px; padding: 4px 8px; background: #f5f7fa; border-radius: 4px; }
.clickable-cell { cursor: pointer; padding: 1px 4px; border-radius: 3px; transition: background 0.15s; }
.clickable-cell:hover { background: var(--skill-bg-normal); }
.buff-cell { display: inline-block; min-width: 50px; text-align: center; color: var(--text-secondary); }
.buff-cell.filled { color: var(--status-success); font-weight: 500; }

.dc-detail { font-size: 13px; line-height: 1.6; }
.dc-header { display: flex; align-items: center; gap: 6px; margin-bottom: 12px; }
.dc-skill-name { font-weight: 600; font-size: 15px; color: var(--text-primary); }
.dc-params { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; margin-bottom: 12px; }
.dc-param { display: flex; flex-direction: column; background: #f5f7fa; padding: 6px 8px; border-radius: 4px; }
.dc-param label { font-size: 11px; color: var(--text-secondary); }
.dc-param span { font-size: 13px; font-weight: 600; color: var(--text-primary); }
.dc-section-title { font-weight: 600; font-size: 13px; color: var(--text-primary); margin-bottom: 6px; }
.dc-calc { background: #f5f7fa; border-radius: 6px; padding: 8px 12px; }
.dc-row { display: flex; justify-content: space-between; padding: 3px 0; font-size: 12px; }
.dc-row .dc-val { font-weight: 500; color: var(--text-primary); text-align: right; }
.dc-buff-row { display: flex; justify-content: space-between; padding: 0 0 0 16px; font-size: 11px; color: var(--text-secondary); }
.dc-buff-name { color: var(--text-secondary); }
.dc-buff-val { color: var(--status-success); font-weight: 500; }
.dc-subtotal { border-top: 1px solid #e4e7ed; padding-top: 6px; margin-top: 4px; }
.dc-final { font-weight: 700; color: var(--status-danger); font-size: 15px; }
.dc-formula { margin-top: 12px; padding: 8px 12px; background: var(--skill-bg-ultimate); border-radius: 6px; font-size: 12px; color: var(--text-regular); line-height: 1.8; word-break: break-all; }
</style>
