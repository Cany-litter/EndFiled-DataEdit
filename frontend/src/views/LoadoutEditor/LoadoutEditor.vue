<template>
  <div style="display:flex;gap:16px;height:calc(100vh - 80px)">
    <!-- LEFT: Selectors -->
    <el-card style="flex:0 0 420px;overflow-y:auto">
      <template #header>
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span>配装编辑器</span>
          <div>
            <el-button type="primary" size="small" @click="saveBuild">保存方案</el-button>
            <el-button size="small" @click="exportCurrent">导出 Excel</el-button>
            <el-button size="small" @click="$router.push('/builds')">返回</el-button>
          </div>
        </div>
      </template>

      <el-form label-width="80px" label-position="top" size="small">
        <el-form-item label="角色">
          <el-select v-model="selectedChar" filterable placeholder="选择角色" style="width:100%" @change="onCharChange">
            <el-option v-for="c in characters" :key="c.id" :label="`[${c.rarity}★] ${c.name} (${c.profession})`" :value="c" />
          </el-select>
        </el-form-item>

        <template v-if="selectedChar">
          <el-divider content-position="left">基础信息</el-divider>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
            <el-statistic title="攻击力" :value="stats.attack" />
            <el-statistic title="生命值" :value="stats.hp" />
            <el-statistic title="防御加成" :value="(stats.defPercent*100).toFixed(1)+'%'" />
            <el-statistic title="暴击率" :value="(stats.critRate*100).toFixed(1)+'%'" />
            <el-statistic title="暴击伤害" :value="(stats.critDamage*100).toFixed(1)+'%'" />
            <el-statistic title="增伤加成" :value="(stats.damageBonus*100).toFixed(1)+'%'" />
            <el-statistic title="力量" :value="stats.str" />
            <el-statistic title="敏捷" :value="stats.agi" />
            <el-statistic title="智识" :value="stats.int" />
            <el-statistic title="意志" :value="stats.wil" />
          </div>
          <div style="margin-top:8px;font-size:13px;color:#909399">
            属性加成: {{ (stats.attrBonus * 100).toFixed(1) }}%
          </div>

          <el-divider content-position="left">武器</el-divider>
          <el-select v-model="selectedWeapon" filterable placeholder="选择武器" style="width:100%" @change="recalc">
            <el-option v-for="w in compatibleWeapons" :key="w.id"
              :label="`[${w.rarity}★] ${w.name} (基础攻击 ${w.baseAtk})`" :value="w" />
          </el-select>

          <el-divider content-position="left">装备</el-divider>
          <div v-for="slot in equipSlots" :key="slot.key" style="margin-bottom:12px">
            <div style="font-size:13px;margin-bottom:4px">{{ slot.label }}</div>
            <el-select v-model="slot.value" filterable placeholder="选择" style="width:100%" @change="recalc">
              <el-option v-for="e in equipmentBySlot(slot.key)" :key="e.id"
                :label="`${e.name}${e.setName ? ' ['+e.setName+']' : ''} (防${e.baseDef})`" :value="e" />
            </el-select>
          </div>

          <el-divider content-position="left">套装检测</el-divider>
          <div v-if="setCounts.size > 0">
            <el-tag v-for="(cnt, s) in setCounts" :key="s" :type="cnt >= 2 ? 'success' : 'info'"
              style="margin:0 4px 4px 0">
              {{ s }} x{{ cnt }}
              <span v-if="cnt >= 2"> ✅ 激活</span>
            </el-tag>
          </div>
          <div v-else style="color:#909399;font-size:13px">尚未选择装备</div>

          <el-divider content-position="left">战斗参数</el-divider>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
            <el-form-item label="暴击率">
              <el-input-number v-model="battleConfig.critRate" :min="0" :max="1" :step="0.01" size="small" style="width:100%" @change="recalc" />
            </el-form-item>
            <el-form-item label="暴击伤害">
              <el-input-number v-model="battleConfig.critDamage" :min="0" :max="5" :step="0.01" size="small" style="width:100%" @change="recalc" />
            </el-form-item>
            <el-form-item label="增伤加成">
              <el-input-number v-model="battleConfig.damageBonus" :min="0" :max="5" :step="0.01" size="small" style="width:100%" @change="recalc" />
            </el-form-item>
            <el-form-item label="目标防御">
              <el-input-number v-model="battleConfig.targetDef" :min="0" :max="500" size="small" style="width:100%" @change="recalc" />
            </el-form-item>
            <el-form-item label="目标抗性">
              <el-input-number v-model="battleConfig.targetResistance" :min="0" :max="100" size="small" style="width:100%" @change="recalc" />
            </el-form-item>
            <el-form-item label="抗性穿透">
              <el-input-number v-model="battleConfig.targetResistanceIgnore" :min="0" :max="100" size="small" style="width:100%" @change="recalc" />
            </el-form-item>
          </div>
        </template>
      </el-form>
    </el-card>

    <!-- RIGHT: Skill Damage -->
    <el-card style="flex:1;overflow-y:auto" v-if="selectedChar">
      <template #header><span>技能伤害计算</span></template>
      <el-tabs>
        <el-tab-pane v-for="sk in skills" :key="sk.id" :label="skillLabel(sk)">
          <div style="margin-bottom:12px">
            <el-slider v-model="skillLevels[sk.id]" :min="1" :max="12" show-stops :step="1"
              show-input size="small" style="width:300px" @input="recalc" />
            <span style="margin-left:12px;font-size:13px">等级 {{ skillLevels[sk.id] }}</span>
          </div>
          <div v-if="skillMult[sk.id]" style="margin-bottom:12px">
            倍率: {{ (skillMult[sk.id] * 100).toFixed(2) }}%
          </div>
          <el-table :data="damageRows(sk)" border stripe size="small" max-height="500">
            <el-table-column prop="zone" label="乘区" width="140" />
            <el-table-column prop="formula" label="公式" width="160" />
            <el-table-column prop="value" label="数值" width="120" />
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <el-card v-else style="flex:1;display:flex;align-items:center;justify-content:center;color:#909399">
      请先从左侧选择一个角色
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { CharacterApi, WeaponApi, EquipmentApi, SkillApi, SkillLevelApi, BuildApi } from '../../api'
import type { Character, Weapon, Equipment, Skill } from '../../api'
import { calcFinalStats, type FinalStats } from '../../engine/formulas/stats'
import { calcDamage } from '../../engine/formulas/damage'

const route = useRoute()

const characters = ref<Character[]>([])
const compatibleWeapons = ref<Weapon[]>([])
const equipmentBySlotMap = reactive<Record<string, Equipment[]>>({ armor: [], glove: [], accessory: [] })
const skills = ref<Skill[]>([])
const skillLevelMap = ref<Record<string, SkillLevel[]>>({})

const selectedChar = ref<Character | null>(null)
const selectedWeapon = ref<Weapon | null>(null)
const skillLevels = reactive<Record<string, number>>({})

const equipSlots = reactive([
  { key: 'armor', label: '护甲', value: null as Equipment | null },
  { key: 'glove', label: '护手', value: null as Equipment | null },
  { key: 'accessory', label: '配件1', value: null as Equipment | null },
  { key: 'accessory2', label: '配件2', value: null as Equipment | null },
])

const stats = ref<FinalStats>({ attack: 0, hp: 0, str: 0, agi: 0, int: 0, wil: 0, attrBonus: 0, defPercent: 0, critRate: 0, critDamage: 0, damageBonus: 0 })
const skillMult = reactive<Record<string, number>>({})

const battleConfig = reactive({
  critRate: 0.05, critDamage: 1.3, damageBonus: 0.2, targetDef: 50,
  targetResistance: 0, targetResistanceIgnore: 0,
  isStaggered: false, staggerMultiplier: 1,
  comboBonus: 0, specialMultiplier: 1,
})

const setCounts = computed(() => {
  const map = new Map<string, number>()
  for (const s of equipSlots) {
    if (s.value?.setName) map.set(s.value.setName, (map.get(s.value.setName) || 0) + 1)
  }
  return map
})

function equipmentBySlot(slot: string) {
  if (slot === 'accessory2') return equipmentBySlotMap['accessory'] || []
  return equipmentBySlotMap[slot] || []
}

function skillLabel(sk: Skill) {
  const map: Record<string, string> = { normal: '普攻', skill: '战技', chain: '连携技', ultimate: '终结技', other: '其他' }
  return map[sk.type] || sk.type
}

async function loadCharacters() {
  characters.value = await CharacterApi.list()
}

async function onCharChange(c: Character) {
  selectedWeapon.value = null
  equipSlots.forEach(s => s.value = null)
  // Load compatible weapons
  compatibleWeapons.value = await WeaponApi.list({ type: c.weaponType })
  // Load equipment by slot
  equipmentBySlotMap.armor = await EquipmentApi.list({ slot: 'armor' })
  equipmentBySlotMap.glove = await EquipmentApi.list({ slot: 'glove' })
  equipmentBySlotMap.accessory = await EquipmentApi.list({ slot: 'accessory' })
  // Load skills
  skills.value = await SkillApi.list(c.id)
  // Load skill levels
  for (const sk of skills.value) {
    skillLevelMap.value[sk.id] = await SkillLevelApi.list(sk.id)
    skillLevels[sk.id] = 12
  }
  recalc()
}

function recalc() {
  const c = selectedChar.value
  if (!c) return
  // Compute equipment stats: sum attr bonuses from selected equipment
  const equip = { str: 0, agi: 0, int: 0, wil: 0, atkPercent: 0, hpPercent: 0, defPercent: 0, critRate: 0, critDamage: 0, damageBonus: 0 }
  for (const s of equipSlots) {
    const e = s.value
    if (!e) continue
    // attr1
    if (e.attr1Type) {
      const v = refineValue(e.attr1Value, e.attr1V1, e.attr1V2, e.attr1V3, e.attr1Refine ?? 0)
      applyAttr(equip, e.attr1Type, v)
    }
    if (e.attr2Type) {
      const v = refineValue(e.attr2Value, e.attr2V1, e.attr2V2, e.attr2V3, e.attr2Refine ?? 0)
      applyAttr(equip, e.attr2Type, v)
    }
    if (e.attr3Type) {
      const v = refineValue(e.attr3Value, e.attr3V1, e.attr3V2, e.attr3V3, e.attr3Refine ?? 0)
      applyAttr(equip, e.attr3Type, v)
    }
  }

  const weapon = selectedWeapon.value
  // Compute final stats
  stats.value = calcFinalStats(
    {
      baseAtk: c.baseAtk, baseHp: c.baseHp,
      baseStr: c.baseStr, baseAgi: c.baseAgi, baseInt: c.baseInt, baseWil: c.baseWil,
      mainAttr: c.mainAttr, subAttr: c.subAttr,
      trustLevel: c.trustTalent ?? 1,
    },
    { baseAtk: weapon?.baseAtk ?? 0, affix1Value: weapon?.affix1Value ?? 0 },
    equip,
  )

  // Compute skill multiplayers
  for (const sk of skills.value) {
    const lvs = skillLevelMap.value[sk.id]
    if (lvs) {
      const lvRec = lvs.find(l => l.level === (skillLevels[sk.id] ?? 12))
      skillMult[sk.id] = lvRec ? lvRec.multiplier / 100 : 0
    }
  }
}

function refineValue(base: number | undefined, v1?: number, v2?: number, v3?: number, refine: number = 0): number {
  const vals = [base ?? 0, v1 ?? 0, v2 ?? 0, v3 ?? 0]
  return vals[Math.min(refine, 3)] ?? vals[0]
}

function toPercent(v: number): number { return v < 1 ? v : v / 100 }

function applyAttr(equip: { str: number; agi: number; int: number; wil: number; atkPercent: number; hpPercent: number; defPercent: number; critRate: number; critDamage: number; damageBonus: number }, type: string, value: number) {
  if (type.includes('力量') || type === 'str') { equip.str += value; return }
  if (type.includes('敏捷') || type === 'agi') { equip.agi += value; return }
  if (type.includes('智识') || type === 'int') { equip.int += value; return }
  if (type.includes('意志') || type === 'wil') { equip.wil += value; return }
  if (type.includes('攻击力') || type === 'atk' || type.includes('atk_up')) { equip.atkPercent += toPercent(value); return }
  if (type.includes('生命值') || type === 'hp') { equip.hpPercent += toPercent(value); return }
  if (type.includes('防御力') || type === 'def') { equip.defPercent += toPercent(value); return }
  if (type.includes('暴击率') || type.includes('crit_rate')) { equip.critRate += toPercent(value); return }
  if (type.includes('暴击伤害') || type.includes('crit_dmg')) { equip.critDamage += toPercent(value); return }
  if (type.includes('增伤') || type.includes('damage_bonus') || type.includes('伤害加成')) { equip.damageBonus += toPercent(value); return }
}

function damageRows(sk: Skill) {
  const s = stats.value
  const mult = skillMult[sk.id] ?? 0
  const totalDamageBonus = s.damageBonus + battleConfig.damageBonus
  const totalCritRate = s.critRate + battleConfig.critRate
  const totalCritDmg = s.critDamage + battleConfig.critDamage
  const comboBonus = (sk.type === 'chain' ? 0.3 : 0) + battleConfig.comboBonus
  const dmg = calcDamage({
    attack: s.attack,
    skillMultiplier: mult,
    baseDamageFlat: 0,
    critRate: totalCritRate,
    critDamage: totalCritDmg,
    damageBonus: totalDamageBonus,
    damageReduction: [],
    amplifyBonus: 0,
    weakenReduction: [],
    shelterValue: 0,
    fragileBonus: 0,
    vulnerableBonus: 0,
    defense: battleConfig.targetDef,
    isTrueDamage: sk.damageType === 'true',
    isStaggered: battleConfig.isStaggered,
    staggerMultiplier: battleConfig.staggerMultiplier,
    resistance: battleConfig.targetResistance,
    resistanceIgnore: battleConfig.targetResistanceIgnore,
    nonControlledReduction: 0,
    comboBonus: comboBonus,
    specialMultiplier: battleConfig.specialMultiplier,
  })
  return [
    { zone: '基础伤害', formula: '攻击×倍率', value: dmg.baseDamage.toFixed(1) },
    { zone: '暴击区', formula: '1+暴击率×爆伤', value: `x${dmg.critMult.toFixed(3)}` },
    { zone: '增伤区', formula: '1+增伤加成', value: `x${dmg.damageBonusMult.toFixed(3)}` },
    { zone: '防御区', formula: '1-def/(def+100)', value: `x${dmg.defenseMult.toFixed(3)}` },
    { zone: '抗性区', formula: '1-抗性+穿透', value: `x${dmg.resistanceMult.toFixed(3)}` },
    { zone: '连击增伤区', formula: '1+连击增伤', value: `x${dmg.comboMult.toFixed(3)}` },
    { zone: '最终伤害', formula: '全乘区连乘', value: dmg.finalDamage.toFixed(1), bold: true },
  ]
}

function exportCurrent() {
  if (!selectedChar.value) { ElMessage.warning('请先选择角色'); return }
  const rows: Record<string, any[]> = {}
  for (const sk of skills.value) {
    rows[skillLabel(sk)] = damageRows(sk).map(r => ({
      乘区: r.zone,
      公式: r.formula,
      数值: r.value,
    }))
  }
  exportBuild({
    name: `${selectedChar.value.name}配装方案`,
    characterId: selectedChar.value.id,
    weaponId: selectedWeapon.value?.id,
  }, rows, stats.value)
}

async function saveBuild() {
  if (!selectedChar.value) { ElMessage.warning('请先选择角色'); return }
  const data = {
    name: `${selectedChar.value.name}配装方案`,
    characterId: selectedChar.value.id,
    weaponId: selectedWeapon.value?.id || null,
    armorId: equipSlots[0].value?.id || null,
    gloveId: equipSlots[1].value?.id || null,
    accessory1Id: equipSlots[2].value?.id || null,
    accessory2Id: equipSlots[3].value?.id || null,
    charLevel: 90,
    weaponLevel: 90,
    equipLevel: 70,
  }
  try {
    await BuildApi.save(data)
    ElMessage.success('方案已保存')
  } catch { ElMessage.error('保存失败') }
}

async function loadBuild(id: string) {
  const build = await BuildApi.get(id)
  const c = characters.value.find(ch => ch.id === build.characterId)
  if (!c) return
  selectedChar.value = c
  await onCharChange(c)
  // Pre-select items
  if (build.weaponId) {
    selectedWeapon.value = compatibleWeapons.value.find(w => w.id === build.weaponId) || null
  }
  const slotMap: Record<string, string> = { armor: 'armorId', glove: 'gloveId', accessory: 'accessory1Id', accessory2: 'accessory2Id' }
  for (const s of equipSlots) {
    const buildField = slotMap[s.key]
    const equipId = (build as any)[buildField]
    if (equipId) {
      const pool = equipmentBySlot(s.key)
      s.value = pool.find(e => e.id === equipId) || null
    }
  }
  recalc()
}

onMounted(async () => {
  await loadCharacters()
  const id = route.params.id as string
  if (id) await loadBuild(id)
})
</script>
