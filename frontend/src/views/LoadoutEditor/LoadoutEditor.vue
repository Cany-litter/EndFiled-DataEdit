<template>
  <div class="loadout-editor">
    <div class="header">
      <el-button size="small" @click="$router.push('/builds')">← 返回</el-button>
      <div class="header-title">
        <span style="font-size:13px;white-space:nowrap">配建方案名称</span>
        <el-input v-model="buildName" placeholder="方案名称" size="small" class="header-title-input" />
      </div>
      <div>
        <el-button type="primary" size="small" @click="saveBuild">保存方案</el-button>
        <el-button size="small" @click="exportCurrent">导出 Excel</el-button>
      </div>
    </div>

    <div v-if="selectedChar" class="body">
      <div class="top-section">
        <div class="top-col">
          <div class="section char-section">
            <div class="section-header">角色</div>
            <div class="field-row">
              <span class="field-label">角色：</span>
              <el-select v-model="selectedCharId" filterable placeholder="选择角色" style="width:100%" @change="onCharChange">
                <el-option v-for="c in characters" :key="c.id" :label="c.name" :value="c.id">
                  <span>{{ c.name }}</span>
                </el-option>
              </el-select>
            </div>
            <div class="field-row">
              <span class="field-label">等级：</span>
              <el-slider v-model="charEditLevel" :min="1" :max="90" :step="1" show-stops size="small" class="field-slider" @input="recalc" />
              <span class="field-val">{{ charEditLevel }}</span>
            </div>
            <div class="field-row">
              <span class="field-label">潜能：</span>
              <el-slider v-model="charPotential" :min="0" :max="5" :step="1" show-stops size="small" class="field-slider" @input="recalc" />
              <span class="field-val">{{ charPotential }}</span>
            </div>
            <div class="field-row">
              <span class="field-label">主能力：{{ attrLabel(selectedChar?.mainAttr) }}</span>
              <span class="field-label" style="margin-left:12px">副能力：{{ attrLabel(selectedChar?.subAttr) }}</span>
            </div>
          </div>

          <div class="section weapon-section">
            <div class="section-header">武器</div>
            <div class="field-row">
              <span class="field-label">武器：</span>
              <el-select v-model="selectedWeapon" filterable placeholder="选择武器" style="width:100%" @change="onWeaponChange">
                <el-option v-for="w in compatibleWeapons" :key="w.id"
                  :label="`[${w.rarity}★] ${w.name} (基础攻击 ${w.baseAtk})`" :value="w.id" />
              </el-select>
            </div>
            <div class="field-row">
              <span class="field-label">等级：</span>
              <el-slider v-model="weaponEditLevel" :min="1" :max="90" :step="1" show-stops size="small" class="field-slider" @input="recalc" />
              <span class="field-val">{{ weaponEditLevel }}</span>
            </div>
            <template v-if="selectedWeapon">
              <div v-for="ai in 2" :key="ai" class="field-row">
                <span class="field-label">词条{{ ai }}：</span>
                <span class="affix-name">{{ getAffixData(ai)?.name || '未知' }}</span>
                <el-slider :model-value="affixLevels[selectedWeapon + '_' + ai] ?? 1"
                  :min="1" :max="9" show-stops :step="1" size="small" class="field-slider"
                  @input="(val: number) => setAffixLevelAndRecalc(ai, val)" />
                <span class="field-val">{{ affixLevels[selectedWeapon + '_' + ai] ?? 1 }}</span>
              </div>
              <div class="field-row">
                <span class="field-label">词条3：</span>
                <span class="affix-desc" @click="affix3Expanded = !affix3Expanded">
                  {{ getAffixData(3)?.name || '描述文本' }}
                  <el-icon style="vertical-align:middle;font-size:12px">
                    <template v-if="affix3Expanded">▲</template>
                    <template v-else>▼</template>
                  </el-icon>
                </span>
                <el-slider :model-value="affixLevels[selectedWeapon + '_3'] ?? 1"
                  :min="1" :max="9" show-stops :step="1" size="small" class="field-slider"
                  @input="(val: number) => setAffixLevelAndRecalc(3, val)" />
                <span class="field-val">{{ affixLevels[selectedWeapon + '_3'] ?? 1 }}</span>
              </div>
              <div v-if="affix3Expanded && weaponAffixes.filter(a => a.affixIndex === 3).length" class="affix-detail">
                <div v-for="a in weaponAffixes.filter(a => a.affixIndex === 3 && a.potential === 0)" :key="a.potential" class="affix-detail-text">
                  <span v-if="a.effect1">{{ a.effect1 }}</span>
                  <span v-if="a.effect2">、{{ a.effect2 }}</span>
                  <span v-if="a.effect3">、{{ a.effect3 }}</span>
                </div>
              </div>
              <div class="field-row">
                <span class="field-label">潜能：</span>
                <el-slider v-model="weaponPotential" :min="0" :max="5" :step="1" show-stops size="small" class="field-slider" @input="recalc" />
                <span class="field-val">{{ weaponPotential }}</span>
              </div>
            </template>
          </div>
        </div>

        <div class="top-col">
          <div class="section equip-section">
            <div class="section-header">护甲</div>
            <div class="field-row">
              <el-select v-model="equipSlots[0].value" filterable placeholder="选择护甲" style="width:100%" @change="onEquipChange(equipSlots[0])">
                <el-option v-for="e in equipmentBySlot('armor')" :key="e.id"
                  :label="`${e.name}${e.setName ? ' ['+e.setName+']' : ''} (防${e.baseDef})`" :value="e.id" />
              </el-select>
            </div>
            <div v-if="equipSlots[0].value && selectedEquipBySlot['armor']" class="slot-attrs">
              <template v-for="ai in 3" :key="ai">
                <div v-if="selectedEquipBySlot['armor']!['attr'+ai+'Type']" class="slot-attr">
                  <span class="attr-label">{{ equipAttrLineSimple(selectedEquipBySlot['armor']!, ai) }}</span>
                  <el-button-group>
                    <el-button v-for="r in 4" :key="r-1" size="small"
                      :type="(equipRefines['armorr'+ai] ?? 0) === r-1 ? 'primary' : 'default'"
                      @click="setRefine('armorr'+ai, r-1)">{{ r-1 }}</el-button>
                  </el-button-group>
                  <span class="attr-val">{{ equipAttrLineValue(selectedEquipBySlot['armor']!, ai, equipRefines['armorr'+ai] ?? 0) }}</span>
                </div>
              </template>
            </div>
          </div>
          <div class="section equip-section">
            <div class="section-header">护手</div>
            <div class="field-row">
              <el-select v-model="equipSlots[1].value" filterable placeholder="选择护手" style="width:100%" @change="onEquipChange(equipSlots[1])">
                <el-option v-for="e in equipmentBySlot('glove')" :key="e.id"
                  :label="`${e.name}${e.setName ? ' ['+e.setName+']' : ''} (防${e.baseDef})`" :value="e.id" />
              </el-select>
            </div>
            <div v-if="equipSlots[1].value && selectedEquipBySlot['glove']" class="slot-attrs">
              <template v-for="ai in 3" :key="ai">
                <div v-if="selectedEquipBySlot['glove']!['attr'+ai+'Type']" class="slot-attr">
                  <span class="attr-label">{{ equipAttrLineSimple(selectedEquipBySlot['glove']!, ai) }}</span>
                  <el-button-group>
                    <el-button v-for="r in 4" :key="r-1" size="small"
                      :type="(equipRefines['glover'+ai] ?? 0) === r-1 ? 'primary' : 'default'"
                      @click="setRefine('glover'+ai, r-1)">{{ r-1 }}</el-button>
                  </el-button-group>
                  <span class="attr-val">{{ equipAttrLineValue(selectedEquipBySlot['glove']!, ai, equipRefines['glover'+ai] ?? 0) }}</span>
                </div>
              </template>
            </div>
          </div>
          <div v-if="activatedSetNames.length" class="set-badge">
            <span v-for="s in activatedSetNames" :key="s" class="set-badge-item">{{ s }} 已激活</span>
          </div>
        </div>

        <div class="top-col">
          <div class="section equip-section">
            <div class="section-header">配件1</div>
            <div class="field-row">
              <el-select v-model="equipSlots[2].value" filterable placeholder="选择配件" style="width:100%" @change="onEquipChange(equipSlots[2])">
                <el-option v-for="e in equipmentBySlot('accessory')" :key="e.id"
                  :label="`${e.name}${e.setName ? ' ['+e.setName+']' : ''} (防${e.baseDef})`" :value="e.id" />
              </el-select>
            </div>
            <div v-if="equipSlots[2].value && selectedEquipBySlot['accessory']" class="slot-attrs">
              <template v-for="ai in 3" :key="ai">
                <div v-if="selectedEquipBySlot['accessory']!['attr'+ai+'Type']" class="slot-attr">
                  <span class="attr-label">{{ equipAttrLineSimple(selectedEquipBySlot['accessory']!, ai) }}</span>
                  <el-button-group>
                    <el-button v-for="r in 4" :key="r-1" size="small"
                      :type="(equipRefines['accessoryr'+ai] ?? 0) === r-1 ? 'primary' : 'default'"
                      @click="setRefine('accessoryr'+ai, r-1)">{{ r-1 }}</el-button>
                  </el-button-group>
                  <span class="attr-val">{{ equipAttrLineValue(selectedEquipBySlot['accessory']!, ai, equipRefines['accessoryr'+ai] ?? 0) }}</span>
                </div>
              </template>
            </div>
          </div>
          <div class="section equip-section">
            <div class="section-header">配件2</div>
            <div class="field-row">
              <el-select v-model="equipSlots[3].value" filterable placeholder="选择配件" style="width:100%" @change="onEquipChange(equipSlots[3])">
                <el-option v-for="e in equipmentBySlot('accessory')" :key="e.id"
                  :label="`${e.name}${e.setName ? ' ['+e.setName+']' : ''} (防${e.baseDef})`" :value="e.id" />
              </el-select>
            </div>
            <div v-if="equipSlots[3].value && selectedEquipBySlot['accessory2']" class="slot-attrs">
              <template v-for="ai in 3" :key="ai">
                <div v-if="selectedEquipBySlot['accessory2']!['attr'+ai+'Type']" class="slot-attr">
                  <span class="attr-label">{{ equipAttrLineSimple(selectedEquipBySlot['accessory2']!, ai) }}</span>
                  <el-button-group>
                    <el-button v-for="r in 4" :key="r-1" size="small"
                      :type="(equipRefines['accessory2r'+ai] ?? 0) === r-1 ? 'primary' : 'default'"
                      @click="setRefine('accessory2r'+ai, r-1)">{{ r-1 }}</el-button>
                  </el-button-group>
                  <span class="attr-val">{{ equipAttrLineValue(selectedEquipBySlot['accessory2']!, ai, equipRefines['accessory2r'+ai] ?? 0) }}</span>
                </div>
              </template>
            </div>
          </div>
        </div>

        <div class="top-col">
          <div class="section gains-section">
            <div class="section-header">常驻增益</div>
            <div class="gains-list">
              <div v-for="(gs, cat) in groupedGains" :key="cat" class="gain-cat">
                <div class="gain-cat-title">{{ cat }}</div>
                <div v-for="g in gs" :key="g.id" class="gain-item">
                  <el-checkbox v-model="selectedGainIds" :label="g.id" @change="recalc" size="small">
                    <span class="gain-name">{{ g.name }}</span>
                    <span v-if="g.effectValue" class="gain-val">({{ g.effectValue }}{{ g.valueType === 'percentage' ? '%' : '' }})</span>
                  </el-checkbox>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="bottom-section">
        <div class="stats-panel">
          <template v-for="ly in layerKeys" :key="ly.key">
            <div class="layer">
              <div class="layer-title">{{ ly.label }}</div>
              <div v-if="hasStats(ly.key)" class="layer-stats">
                <div v-if="ly.key === 'base' && selectedChar" class="stat-row-full">
                  <span class="stat-label">主能力：{{ attrLabel(selectedChar.mainAttr) }}　|　副能力：{{ attrLabel(selectedChar.subAttr) }}</span>
                </div>
                <template v-for="(val, sk) in layerData[ly.key]" :key="sk">
                  <div v-if="val && STAT_DEFS[sk]" class="stat-row">
                    <span class="stat-label">{{ STAT_DEFS[sk].label }}</span>
                    <span :class="['stat-val', ly.key === 'final' ? 'stat-final' : '']">{{ formatStatValue(sk, val) }}</span>
                  </div>
                </template>
              </div>
              <div v-else class="layer-empty">—</div>
            </div>
            <hr v-if="ly.divider" class="layer-divider" />
          </template>
        </div>

        <div class="damage-panel">
          <div class="section-header">技能伤害</div>
          <el-table :data="skillDamageRows" border stripe size="small" class="damage-table">
            <el-table-column prop="name" label="技能名称" width="100" />
            <el-table-column prop="level" label="等级" width="60" />
            <el-table-column prop="multiplier" label="倍率" width="80">
              <template #default="{ row }">
                {{ row.multiplier }}%
              </template>
            </el-table-column>
            <el-table-column prop="damage" label="技能伤害" width="120" />
          </el-table>
        </div>
      </div>
    </div>

    <div v-else class="body placeholder">
      <div class="placeholder-content">
        <el-select v-model="selectedCharId" filterable placeholder="请选择一个角色" style="width:280px" @change="onCharChange">
          <el-option v-for="c in characters" :key="c.id" :label="c.name" :value="c.id" />
        </el-select>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { CharacterApi, WeaponApi, WeaponAffixApi, EquipmentApi, SkillApi, SkillLevelApi, BuildApi, GainApi, CharacterStatApi, WeaponStatApi } from '../../api'
import type { Character, Weapon, Equipment, Skill, SkillLevel, Gain, WeaponAffix, CharacterStat } from '../../api'
import { mapAttrType, formatPct } from '../../utils/constants'
import { calcDamage } from '../../engine/formulas'
import { calcFinalStats } from '../../engine/formulas/stats'
import type { FinalStats, StatLayer } from '../../engine/formulas/stats'
import {
  STAT_DEFS, formatStatValue,
  buildBaseLayer, buildWeaponLayer, equipSubStatsToLayer,
  buildGainsLayer, computeDerivedFinal,
} from '../../engine/formulas/stats'
import { exportBuild } from '../../utils/exportExcel'

const route = useRoute()

// --- 方案元数据 ---
const buildName = ref('')
const currentBuildId = ref<string | null>(null)

// --- 角色与武器基础状态 ---
const selectedCharId = ref<string | null>(null)
const selectedChar = ref<Character | null>(null)
const selectedWeapon = ref<string | null>(null)
const charEditLevel = ref(90)
const weaponEditLevel = ref(90)
const charPotential = ref(0)
const weaponPotential = ref(0)
const affix3Expanded = ref(false)

// --- 备选数据池（从后端拉取） ---
const characters = ref<Character[]>([])
const compatibleWeapons = ref<Weapon[]>([])
const allEquipment = ref<Equipment[]>([])
const equipmentBySlotMap = reactive<Record<string, Equipment[]>>({ armor: [], glove: [], accessory: [] })
const skills = ref<Skill[]>([])
const skillLevelMap = ref<Record<string, SkillLevel[]>>({})
const allGains = ref<Gain[]>([])

// --- 静态数值查找表（角色等级属性/武器等级攻击） ---
const charStatMap = ref<Record<string, CharacterStat>>({})
const weaponStatMap = ref<Record<string, number>>({})

// --- 装备槽位 ---
const equipSlots = reactive([
  { key: 'armor', label: '护甲', value: null as string | null },
  { key: 'glove', label: '护手', value: null as string | null },
  { key: 'accessory', label: '配件1', value: null as string | null },
  { key: 'accessory2', label: '配件2', value: null as string | null },
])
const selectedEquipBySlot = reactive<Record<string, Equipment | null>>({ armor: null, glove: null, accessory: null, accessory2: null })
const equipRefines = reactive<Record<string, number>>({})

// --- 武器词条 ---
const weaponAffixes = ref<WeaponAffix[]>([])
const affixLevels = reactive<Record<string, number>>({})

// --- 技能 ---
const skillLevels = reactive<Record<string, number>>({})
const skillMult = reactive<Record<string, number>>({})

// --- 常驻增益 ---
const selectedGainIds = ref<string[]>([])

// --- 技能伤害计算默认参数（无UI，仅用于 calcDamage 内部默认值） ---
const battleConfig = reactive({
  targetDef: 100, targetResistance: 0, targetResistanceIgnore: 0,
  isStaggered: false, staggerMultiplier: 1.3,
  baseDamageFlat: 0, comboBonus: 0, specialMultiplier: 1,
  damageReduction: 0, amplifyBonus: 0, weakenReduction: 0,
  shelterValue: 0, fragileBonus: 0, vulnerableBonus: 0,
  nonControlledReduction: 0, targetCount: 1,
  extraCritRate: 0, extraCritDamage: 0, extraDamageBonus: 0,
})

// --- 面板属性计算结果 ---
const stats = ref<FinalStats>({
  attack: 0, hp: 0, defense: 0, damageReduction: 0,
  str: 0, agi: 0, int: 0, wil: 0, attrBonus: 0,
  strHpBonus: 0, healEfficiency: 0,
  defPercent: 0, critRate: 0, critDamage: 0, damageBonus: 0,
  artsMastery: 0, energyRecharge: 0, physicalResist: 0, magicResist: 0,
})

// --- 属性分层数据（用于"面板属性"展示） ---
const layerData = reactive<Record<string, StatLayer>>({
  base: {}, weapon: {}, equip: {}, gains: {}, final: {},
})
const layerKeys = [
  { key: 'final', label: '最终面板', divider: true },
  { key: 'base', label: '角色基础', divider: false },
  { key: 'weapon', label: '武器加成', divider: false },
  { key: 'equip', label: '装备加成', divider: true },
  { key: 'gains', label: '常驻增益加成', divider: false },
]

// --- 映射工具 ---
const ATTR_LABEL: Record<string, string> = { str: '力量', agi: '敏捷', int: '智识', wil: '意志' }
const attrLabel = (k: string) => ATTR_LABEL[k] || k

// --- 套装计数：统计各套装拥有几件装备 ---
const setCounts = computed(() => {
  const map = new Map<string, number>()
  for (const s of equipSlots) {
    if (!s.value) continue
    const e = findEquip(s.key, s.value)
    if (e?.setName) map.set(e.setName, (map.get(e.setName) || 0) + 1)
  }
  return map
})

// --- 已激活套装：同套装 ≥3 件时激活 ---
const activatedSetNames = computed(() => {
  const names: string[] = []
  for (const [name, cnt] of setCounts.value) {
    if (cnt >= 3) names.push(name)
  }
  return names
})

// --- 过滤增益列表：按角色/武器/已激活套装过滤可用的常驻增益 ---
const filteredGains = computed(() => {
  const cId = selectedChar.value?.id
  const wId = selectedWeapon.value
  const actSets = new Set(activatedSetNames.value)
  return allGains.value.filter(g => {
    if (g.sourceType === 'character') return g.sourceRefId === cId
    if (g.sourceType === 'weapon') return g.sourceRefId === wId
    if (g.sourceType === 'set') return actSets.has(g.source)
    return true
  })
})

watch(filteredGains, () => {
  const validIds = new Set(filteredGains.value.map(g => g.id))
  selectedGainIds.value = selectedGainIds.value.filter(id => validIds.has(id))
})

const groupedGains = computed(() => {
  const groups: Record<string, Gain[]> = {}
  for (const g of filteredGains.value) {
    const cat = g.effectCategory || '其他'
    if (!groups[cat]) groups[cat] = []
    groups[cat].push(g)
  }
  return groups
})

// --- 技能伤害汇总表（从分层数据取面板属性，使用默认战斗参数） ---
const skillDamageRows = computed(() => {
  const f = layerData.final || {}
  const attack = f['atk'] || 0
  const critRate = ((f['critRate'] || 0) + 5) / 100
  const critDamage = ((f['critDamage'] || 0) + 50) / 100
  const damageBonus = (
    (f['physicalDmgBonus'] || 0) +
    (f['burnDmgBonus'] || 0) +
    (f['electroDmgBonus'] || 0) +
    (f['frostDmgBonus'] || 0) +
    (f['natureDmgBonus'] || 0) +
    (f['extraDmgBonus'] || 0) +
    (f['normalAtkDmgBonus'] || 0) +
    (f['skillDmgBonus'] || 0) +
    (f['chainDmgBonus'] || 0) +
    (f['ultimateDmgBonus'] || 0) +
    (f['staggerDmgBonus'] || 0)
  ) / 100
  return skills.value.map(sk => {
    const mult = skillMult[sk.id] ?? 0
    const dmg = calcDamage({
      attack, skillMultiplier: mult,
      baseDamageFlat: battleConfig.baseDamageFlat,
      critRate, critDamage,
      damageBonus,
      damageReduction: battleConfig.damageReduction > 0 ? [battleConfig.damageReduction] : [],
      amplifyBonus: battleConfig.amplifyBonus,
      weakenReduction: battleConfig.weakenReduction > 0 ? [battleConfig.weakenReduction] : [],
      shelterValue: battleConfig.shelterValue,
      fragileBonus: battleConfig.fragileBonus,
      vulnerableBonus: battleConfig.vulnerableBonus,
      defense: battleConfig.targetDef,
      isTrueDamage: sk.damageType === 'true',
      isStaggered: battleConfig.isStaggered,
      staggerMultiplier: battleConfig.staggerMultiplier,
      resistance: battleConfig.targetResistance,
      resistanceIgnore: battleConfig.targetResistanceIgnore,
      nonControlledReduction: battleConfig.nonControlledReduction,
      comboBonus: battleConfig.comboBonus,
      specialMultiplier: battleConfig.specialMultiplier,
    })
    return {
      name: skillLabel(sk),
      level: skillLevels[sk.id] ?? 12,
      multiplier: (mult * 100).toFixed(1),
      damage: dmg.finalDamage.toFixed(1),
    }
  })
})

// --- 工具函数 ---

function hasStats(key: string) {
  const layer = layerData[key]
  return layer && Object.keys(layer).some(k => layer[k])
}

function findEquip(slot: string, id: string) {
  return equipmentBySlot(slot).find(e => e.id === id) ?? null
}

function equipmentBySlot(slot: string) {
  if (slot === 'accessory2') return equipmentBySlotMap['accessory'] || []
  return equipmentBySlotMap[slot] || []
}

function setRefine(key: string, val: number) {
  equipRefines[key] = val
  recalc()
}

// 获取指定词条的基础数据（potential=0 时的名称和类型）
function getAffixData(ai: number): WeaponAffix | undefined {
  const wId = selectedWeapon.value
  if (!wId) return undefined
  return weaponAffixes.value.find(a => a.affixIndex === ai && a.potential === 0)
}

// 根据当前词条等级获取实际数值
function getAffixValue(ai: number): number {
  const wId = selectedWeapon.value
  if (!wId) return 0
  const level = affixLevels[wId + '_' + ai] ?? 1
  const aff = weaponAffixes.value.find(a => a.affixIndex === ai && a.potential === level - 1)
  return aff?.value ?? 0
}

function getAffixLevel(ai: number): number {
  const wId = selectedWeapon.value
  if (!wId) return 1
  return affixLevels[wId + '_' + ai] ?? 1
}

function setAffixLevelAndRecalc(ai: number, val: number) {
  const wId = selectedWeapon.value
  if (wId) affixLevels[wId + '_' + ai] = val
  recalc()
}

// 提取装备副属性名称
function equipAttrLineSimple(e: Equipment, idx: number): string {
  const prefix = 'attr' + idx
  const type = (e as any)[prefix + 'Type']
  if (!type) return ''
  return idx <= 2 ? (mapAttrType(type) || type) : type
}

// 提取装备副属性数值（按精炼等级取对应档位）
function equipAttrLineValue(e: Equipment, idx: number, refine: number = 0): string {
  const prefix = 'attr' + idx
  const refineKey = refine === 0 ? 'Value' : 'V' + refine
  const val = (e as any)[prefix + refineKey]
  if (val == null) return ''
  return formatPct(val)
}

const SKILL_LABEL_MAP: Record<string, string> = { normal: '普攻', skill: '战技', chain: '连携技', ultimate: '终结技', talent1: '天赋1', talent2: '天赋2', other: '其他' }
function skillLabel(sk: Skill) {
  return SKILL_LABEL_MAP[sk.type] || sk.type
}

// --- 数据加载 ---

async function loadCharacters() {
  characters.value = await CharacterApi.listAll()
}

async function loadGains() {
  allGains.value = await GainApi.listAll({ gainType: 'permanent' })
}

// --- 事件处理 ---

async function onWeaponChange(weaponId: string) {
  selectedWeapon.value = weaponId
  if (weaponId) await loadAffixes(weaponId)
  else recalc()
}

async function loadAffixes(weaponId: string) {
  weaponAffixes.value = await WeaponAffixApi.list(weaponId)
  for (let ai = 1; ai <= 3; ai++) {
    const key = weaponId + '_' + ai
    if (affixLevels[key] === undefined) affixLevels[key] = 1
  }
  recalc()
}

function onEquipChange(slot: { key: string; value: string | null }) {
  const equip = slot.value ? findEquip(slot.key, slot.value) : null
  selectedEquipBySlot[slot.key] = equip
  if (equip) {
    for (let ai = 1; ai <= 3; ai++) {
      const key = slot.key + 'r' + ai
      equipRefines[key] = (equip as any)['attr' + ai + 'Refine'] ?? 0
    }
  }
  recalc()
}

async function onCharChange(id: string) {
  selectedCharId.value = id
  const c = characters.value.find(ch => ch.id === id)
  if (c) await selectChar(c)
}

async function selectChar(c: Character) {
  selectedChar.value = c
  selectedCharId.value = c.id
  buildName.value = c.name + ' 配装方案'
  currentBuildId.value = null
  selectedWeapon.value = null
  weaponAffixes.value = []
  weaponPotential.value = 0
  affix3Expanded.value = false
  equipSlots.forEach(s => { s.value = null; selectedEquipBySlot[s.key] = null })
  compatibleWeapons.value = await WeaponApi.list({ type: c.weaponType })
  equipmentBySlotMap.armor = allEquipment.value.filter(e => e.slot === 'armor')
  equipmentBySlotMap.glove = allEquipment.value.filter(e => e.slot === 'glove')
  equipmentBySlotMap.accessory = allEquipment.value.filter(e => e.slot === 'accessory')
  skills.value = await SkillApi.list(c.id)
  for (const sk of skills.value) {
    skillLevelMap.value[sk.id] = await SkillLevelApi.list(sk.id)
    skillLevels[sk.id] = 12
  }
  recalc()
}

// --- 核心计算：面板属性 + 技能倍率 ---
function recalc() {
  const c = selectedChar.value
  if (!c) return

  // 1. 收集装备副属性
  const equipSubs: Array<{ desc: string; value: number }> = []
  let totalDef = 0
  for (const s of equipSlots) {
    if (!s.value) continue
    const e = findEquip(s.key, s.value)
    if (!e) continue
    if (equipRefines[s.key + 'r1'] === undefined) equipRefines[s.key + 'r1'] = e.attr1Refine ?? 0
    if (equipRefines[s.key + 'r2'] === undefined) equipRefines[s.key + 'r2'] = e.attr2Refine ?? 0
    if (equipRefines[s.key + 'r3'] === undefined) equipRefines[s.key + 'r3'] = e.attr3Refine ?? 0
    for (let ai = 1; ai <= 3; ai++) {
      const type = (e as any)['attr' + ai + 'Type']
      if (!type) continue
      const r = equipRefines[s.key + 'r' + ai] ?? 0
      const vals = [
        (e as any)['attr' + ai + 'Value'] ?? 0,
        (e as any)['attr' + ai + 'V1'] ?? 0,
        (e as any)['attr' + ai + 'V2'] ?? 0,
        (e as any)['attr' + ai + 'V3'] ?? 0,
      ]
      const v = vals[Math.min(r, 3)] ?? vals[0]
      equipSubs.push({ desc: type, value: v })
    }
    totalDef += e.baseDef ?? 0
  }
  if (totalDef > 0) equipSubs.push({ desc: '基础防御力', value: totalDef })

  const weapon = compatibleWeapons.value.find(w => w.id === selectedWeapon.value) || null

  // 2. 将副属性映射到 equipOld 结构（calcFinalStats 需要）
  const equipOld = { str: 0, agi: 0, int: 0, wil: 0, atkPercent: 0, hpPercent: 0, defPercent: 0, critRate: 0, critDamage: 0, damageBonus: 0, artsMastery: 0, energyRecharge: 0, baseDef: 0 }
  for (const sub of equipSubs) {
    const t = sub.desc
    const v = sub.value
    if (t.includes('力量') || t === 'str') { equipOld.str += v }
    else if (t.includes('敏捷') || t === 'agi') { equipOld.agi += v }
    else if (t.includes('智识') || t === 'int') { equipOld.int += v }
    else if (t.includes('意志') || t === 'wil') { equipOld.wil += v }
    else if (t.includes('攻击力') || t === 'atk' || t.includes('atk_up')) { equipOld.atkPercent += v < 1 ? v : v / 100 }
    else if (t.includes('生命值') || t === 'hp') { equipOld.hpPercent += v < 1 ? v : v / 100 }
    else if (t.includes('防御力') || t === 'def') { equipOld.defPercent += v < 1 ? v : v / 100 }
    else if (t.includes('暴击率') || t.includes('crit_rate')) { equipOld.critRate += v < 1 ? v : v / 100 }
    else if (t.includes('暴击伤害') || t.includes('crit_dmg')) { equipOld.critDamage += v < 1 ? v : v / 100 }
    else if (t.includes('增伤') || t.includes('damage_bonus') || t.includes('伤害加成')) { equipOld.damageBonus += v < 1 ? v : v / 100 }
    else if (t.includes('源石技艺') || t.includes('arts_mastery')) { equipOld.artsMastery += v }
    else if (t.includes('充能') || t.includes('energy_recharge')) { equipOld.energyRecharge += v < 1 ? v : v / 100 }
  }

  const affix1Val = getAffixValue(1)
  const affix2Val = getAffixValue(2)

  // 3. 读取角色等级属性
  const cs = c ? charStatMap.value[c.id + ':' + charEditLevel.value] : undefined
  const charCfg = {
    baseAtk: cs?.atk ?? c.baseAtk,
    baseHp: cs?.hp ?? c.baseHp,
    baseStr: cs?.str ?? c.baseStr,
    baseAgi: cs?.agi ?? c.baseAgi,
    baseInt: cs?.int ?? c.baseInt,
    baseWil: cs?.wil ?? c.baseWil,
    mainAttr: c.mainAttr, subAttr: c.subAttr, trustLevel: 1,
  }
  const wBaseAtk = selectedWeapon.value
    ? (weaponStatMap.value[selectedWeapon.value + ':' + weaponEditLevel.value] ?? weapon?.baseAtk ?? 0)
    : 0

  // 4. 旧版兼容计算（供导出用）
  stats.value = calcFinalStats(
    charCfg,
    { baseAtk: wBaseAtk, affix1Type: weapon?.affix1Type ?? undefined, affix1Value: affix1Val },
    equipOld,
  )

  // 5. 分层计算（用于面板属性展示）
  const weaponCfg = { baseAtk: wBaseAtk, affix1Type: weapon?.affix1Type, affix1Value: affix1Val, affix2Type: weapon?.affix2Type, affix2Value: affix2Val }
  const baseLayer = buildBaseLayer(charCfg)
  const weaponLayer = buildWeaponLayer(weaponCfg)
  const equipLayer = equipSubStatsToLayer(equipSubs)
  const selectedGains = allGains.value.filter(g => selectedGainIds.value.includes(g.id))
  const gainsLayer = buildGainsLayer(selectedGains)
  const finalLayer = computeDerivedFinal([baseLayer, weaponLayer, equipLayer, gainsLayer], charCfg)

  layerData.base = baseLayer
  layerData.weapon = weaponLayer
  layerData.equip = equipLayer
  layerData.gains = gainsLayer
  layerData.final = finalLayer

  // 6. 技能倍率
  for (const sk of skills.value) {
    const lvs = skillLevelMap.value[sk.id]
    if (lvs) {
      const lvRec = lvs.find(l => l.level === (skillLevels[sk.id] ?? 12))
      skillMult[sk.id] = lvRec ? lvRec.multiplier / 100 : 0
    }
  }
}

// --- 导出 / 保存 ---

function exportCurrent() {
  if (!selectedChar.value) { ElMessage.warning('请先选择角色'); return }
  const rows: Record<string, any[]> = {}
  for (const sk of skills.value) {
    const mult = skillMult[sk.id] ?? 0
    rows[skillLabel(sk)] = [{ 技能名称: skillLabel(sk), 等级: skillLevels[sk.id] ?? 12, 倍率: (mult * 100).toFixed(1) + '%', 伤害: skillDamageRows.value.find(r => r.name === skillLabel(sk))?.damage || '' }]
  }
  exportBuild({
    name: buildName.value || `${selectedChar.value.name}配装方案`,
    characterId: selectedChar.value.id,
    weaponId: selectedWeapon.value,
  }, rows, stats.value)
}

async function saveBuild() {
  if (!selectedChar.value) { ElMessage.warning('请先选择角色'); return }
  if (!buildName.value.trim()) { ElMessage.warning('请输入方案名称'); return }
  const data: any = {
    name: buildName.value.trim(),
    characterId: selectedChar.value.id,
    weaponId: selectedWeapon.value,
    armorId: equipSlots[0].value || null,
    gloveId: equipSlots[1].value || null,
    accessory1Id: equipSlots[2].value || null,
    accessory2Id: equipSlots[3].value || null,
    charLevel: charEditLevel.value, weaponLevel: weaponEditLevel.value, equipLevel: 70,
    charPotential: charPotential.value, weaponPotential: weaponPotential.value,
    affix1Level: getAffixLevel(1),
    affix2Level: getAffixLevel(2),
    affix3Level: getAffixLevel(3),
    equipRefines: JSON.stringify(equipRefines),
    selectedGains: JSON.stringify(selectedGainIds.value),
  }
  if (currentBuildId.value) data.id = currentBuildId.value
  try {
    await BuildApi.save(data)
    ElMessage.success('方案已保存')
  } catch { ElMessage.error('保存失败') }
}

// --- 编辑已有方案（路由带 id 时调用） ---
async function loadBuild(id: string) {
  const build = await BuildApi.get(id)
  const c = characters.value.find(ch => ch.id === build.characterId)
  if (!c) return
  await selectChar(c)
  buildName.value = build.name || c.name + ' 配装方案'
  currentBuildId.value = build.id
  charEditLevel.value = build.charLevel ?? 90
  weaponEditLevel.value = build.weaponLevel ?? 90
  charPotential.value = build.charPotential ?? 0
  weaponPotential.value = build.weaponPotential ?? 0
  if (build.weaponId) {
    selectedWeapon.value = build.weaponId
    await loadAffixes(build.weaponId)
    const wId = build.weaponId
    if (build.affix1Level) affixLevels[wId + '_1'] = build.affix1Level
    if (build.affix2Level) affixLevels[wId + '_2'] = build.affix2Level
    if (build.affix3Level) {
      affixLevels[wId + '_3'] = build.affix3Level
    }
  }
  const slotMap: Record<string, string> = { armor: 'armorId', glove: 'gloveId', accessory: 'accessory1Id', accessory2: 'accessory2Id' }
  for (const s of equipSlots) {
    s.value = (build as any)[slotMap[s.key]] || null
    if (s.value) {
      const equip = findEquip(s.key, s.value)
      selectedEquipBySlot[s.key] = equip
      if (equip) {
        for (let ai = 1; ai <= 3; ai++) {
          const key = s.key + 'r' + ai
          equipRefines[key] = (equip as any)['attr' + ai + 'Refine'] ?? 0
        }
      }
    }
  }
  if (build.equipRefines) {
    try {
      const saved = JSON.parse(build.equipRefines)
      Object.assign(equipRefines, saved)
    } catch {}
  }
  if (build.selectedGains) {
    try {
      const saved = JSON.parse(build.selectedGains)
      const validIds = new Set(filteredGains.value.map(g => g.id))
      selectedGainIds.value = saved.filter((id: string) => validIds.has(id))
    } catch {}
  }
  recalc()
}

// --- 初始化 ---
onMounted(async () => {
  await loadCharacters()
  await loadGains()
  allEquipment.value = await EquipmentApi.listAll()
  const allCharStats = await CharacterStatApi.listAll()
  const csm: Record<string, CharacterStat> = {}
  for (const s of allCharStats) csm[s.characterId + ':' + s.level] = s
  charStatMap.value = csm
  const allWeaponStats = await WeaponStatApi.listAll()
  const wsm: Record<string, number> = {}
  for (const s of allWeaponStats) wsm[s.weaponId + ':' + s.level] = s.baseAtk
  weaponStatMap.value = wsm
  const id = route.params.id as string
  if (id) await loadBuild(id)
})
</script>

<style scoped>
.loadout-editor {
  display:flex;
  flex-direction:column;
  height:calc(100vh - 130px);
}

.header {
  display:flex;
  align-items:center;
  gap:12px;
  padding:8px 12px;
  background:#fff;
  border-bottom:1px solid #e4e7ed;
  flex-shrink:0;
}

.header-title {
  display:flex;
  align-items:center;
  gap:8px;
  margin-right:auto;
}

.header-title-input {
  font-size:15px;
  font-weight:600;
  width:240px;
}

.header-title-input :deep(.el-input__inner) {
  font-size:15px;
  font-weight:600;
  border:none;
  background:transparent;
  padding:0;
}

.header-title-input :deep(.el-input__inner):focus {
  border:none;
  box-shadow:none;
  background:#f5f7fa;
  padding:0 4px;
}

.body {
  flex:1;
  overflow-y:auto;
  padding:8px 12px;
  background:#fff;
}

.body.placeholder {
  display:flex;
  align-items:center;
  justify-content:center;
}

.placeholder-content {
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:12px;
}

.top-section {
  display:flex;
  gap:12px;
  margin-bottom:12px;
  overflow-x:auto;
  padding-bottom:4px;
}

.top-col {
  flex:1;
  min-width:300px;
  display:flex;
  flex-direction:column;
  gap:8px;
}

.section {
  background:#fafafa;
  border:1px solid #e4e7ed;
  border-radius:4px;
  padding:8px;
}

.section-header {
  font-size:13px;
  font-weight:600;
  color:#303133;
  margin-bottom:6px;
  padding-bottom:4px;
  border-bottom:1px solid #ebeef5;
}

.gains-section {
  max-width:500px;
}

.field-row {
  display:flex;
  align-items:center;
  gap:6px;
  margin-bottom:4px;
  font-size:12px;
}

.field-label {
  font-size:12px;
  color:#606266;
  white-space:nowrap;
  flex-shrink:0;
}

.field-slider {
  flex:1;
  min-width:0;
}

.field-slider :deep(.el-slider__runway) {
  margin:0;
}

.field-val {
  font-size:12px;
  font-weight:600;
  color:#303133;
  min-width:20px;
  text-align:center;
  margin-left:10px;
}

.affix-name {
  font-size:12px;
  color:#409eff;
  flex-shrink:0;
}

.affix-desc {
  font-size:12px;
  color:#409eff;
  cursor:pointer;
  flex-shrink:0;
  text-decoration:underline dotted;
}

.affix-detail {
  margin:2px 0 4px 60px;
  padding:4px 8px;
  background:#f0f5ff;
  border-radius:4px;
  font-size:12px;
  color:#606266;
}

.affix-detail-text {
  line-height:1.5;
}

.slot-attrs {
  margin-top:4px;
}

.slot-attr {
  display:flex;
  align-items:center;
  gap:4px;
  margin-top:2px;
  font-size:12px;
}

.attr-label {
  color:#606266;
  min-width:150px;
}

.attr-val {
  color:#303133;
  font-weight:500;
  min-width:40px;
  text-align:right;
  margin-left:auto;
}

.set-badge {
  margin-top:6px;
  text-align:left;
}

.set-badge-item {
  display:inline-block;
  font-size:12px;
  color:#67c23a;
  font-weight:600;
  padding:2px 8px;
  background:#f0f9eb;
  border-radius:4px;
}

.gains-list {
  max-height:480px;
  overflow-y:auto;
  font-size:12px;
}

.gain-cat {
  margin-bottom:4px;
}

.gain-cat-title {
  font-size:12px;
  font-weight:600;
  color:#606266;
  padding:2px 0;
}

.gain-item {
  padding:1px 4px;
}

.gain-name {
  font-size:12px;
}

.gain-val {
  color:#909399;
  font-size:11px;
}

.bottom-section {
  display:flex;
  gap:12px;
  padding-top:8px;
  border-top:1px solid #e4e7ed;
}

.stats-panel {
  flex:1;
  min-width:0;
}

.damage-panel {
  flex:0 0 380px;
}

.damage-table {
  width:100%;
}

.damage-table :deep(.el-table__header th) {
  font-size:12px;
}

.damage-table :deep(.el-table__body td) {
  font-size:12px;
}

.layer {
  margin-bottom:4px;
}

.layer-title {
  font-size:12px;
  font-weight:600;
  color:#606266;
  padding:4px 0;
}

.layer-stats {
  display:grid;
  grid-template-columns:repeat(auto-fill,190px);
  gap:2px 12px;
  padding:2px 0;
}

.stat-row {
  display:flex;
  justify-content:space-between;
  font-size:12px;
  padding:1px 4px;
}

.stat-row-full {
  font-size:12px;
  padding:1px 4px;
  color:#606266;
  grid-column:1 / -1;
}

.stat-label {
  color:#606266;
}

.stat-val {
  color:#303133;
}

.stat-final {
  font-weight:600;
  color:#409eff;
}

.layer-empty {
  font-size:12px;
  color:#c0c4cc;
  padding:2px;
}

.layer-divider {
  border:none;
  border-top:2px solid #409eff;
  margin:6px 0;
}
</style>
