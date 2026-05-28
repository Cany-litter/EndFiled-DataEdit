<template>
  <div style="display:flex;gap:16px;height:calc(100vh - 130px)">
    <el-card style="flex:1;overflow-y:auto">
      <template #header>
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span>{{ isNew ? '新建配队' : '编辑配队' }}</span>
          <div>
            <el-button type="primary" size="small" @click="save">保存</el-button>
            <el-button size="small" @click="saveAndSim" v-if="!isNew">保存并模拟</el-button>
            <el-button size="small" type="success" @click="saveAndGoTimeline" v-if="!isNew">排轴</el-button>
            <el-button size="small" @click="$router.push('/teams')">返回</el-button>
          </div>
        </div>
      </template>

      <el-form label-width="100px">
        <el-form-item label="配队名称">
          <el-input v-model="form.name" style="width:300px" placeholder="自动生成" />
        </el-form-item>
      </el-form>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
        <el-card v-for="(slot,i) in slots" :key="i" :body-style="{padding:'14px'}">
          <template #header><span style="font-weight:600">{{ slot.label }}</span></template>
          <el-form label-width="60px" size="small">
            <el-form-item label="角色">
              <el-select v-model="slot.charId" filterable placeholder="选择角色" style="width:100%"
                @change="onCharSlotChange(slot)">
                <el-option v-for="c in availableChars(slot)" :key="c.id"
                  :label="`[${c.rarity}★][${mapProfession(c.profession)}] ${c.name}`" :value="c.id" />
              </el-select>
            </el-form-item>
            <el-form-item label="配装">
              <el-select v-model="slot.buildId" filterable placeholder="选择配装方案" style="width:100%"
                @change="onBuildChange(slot)">
                <el-option v-for="b in filteredBuilds(slot.charId)" :key="b.id"
                  :label="buildOptionLabel(b)" :value="b.id" />
              </el-select>
            </el-form-item>
            <div v-if="slot.buildId && slotStats[slot.buildId]" class="slot-stats">
              <div class="stats-header">
                <span class="stat-title">最终面板</span>
                <el-tag size="small" type="info">武器: {{ buildWeaponName(slot.buildId) }}</el-tag>
              </div>
              <div class="layer-stats">
                <div v-for="(val, sk) in slotStats[slot.buildId]" :key="sk" class="stat-row">
                  <span class="stat-label">{{ STAT_DEFS[sk]?.label || sk }}</span>
                  <span class="stat-value stat-final">{{ formatStatValue(sk, val) }}</span>
                </div>
              </div>
            </div>
          </el-form>
        </el-card>
      </div>
    </el-card>

    <el-card style="flex:0 0 350px;overflow-y:auto" v-if="!isNew">
      <template #header>
        <span>增益列表</span>
        <el-tag size="small" style="margin-left:8px">{{ teamGains.length }} 项</el-tag>
      </template>
      <div v-if="teamGains.length" style="font-size:12px">
        <div v-for="group in gainGroups" :key="group.label" style="margin-bottom:12px">
          <div style="font-weight:600;font-size:13px;padding:4px 0;border-bottom:1px solid #eee;margin-bottom:6px">{{ group.label }}</div>
          <div v-for="g in group.gains" :key="g.id" style="padding:6px 8px;margin-bottom:4px;background:#f9f9f9;border-radius:4px">
            <div style="display:flex;justify-content:space-between;align-items:center">
              <span style="font-weight:500">{{ g.name }}</span>
              <el-tag :type="g.gainType === 'permanent' ? 'success' : 'warning'" size="small">{{ g.gainType === 'permanent' ? '常驻' : '限定' }}</el-tag>
            </div>
            <div style="color:#606266;margin-top:2px">
              {{ g.effectCategory }} · {{ g.effectType }}: {{ g.valueType === 'percentage' ? (g.effectValue + '%') : g.effectValue }}
            </div>
            <div v-if="g.triggerCondition" style="color:#909399;margin-top:2px">触发: {{ g.triggerCondition }}</div>
            <div style="color:#909399;font-size:11px;margin-top:2px">
              来源: {{ g.source }}
              <span v-if="g.maxStacks && g.maxStacks > 1"> · 最大{{ g.maxStacks }}层</span>
              <span v-if="g.duration"> · {{ g.duration }}s</span>
            </div>
          </div>
        </div>
      </div>
      <div v-else style="color:#909399;text-align:center;padding:20px">配置角色与配装后显示增益</div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { mapProfession } from '../../utils/constants'
import { TeamApi, CharacterApi, BuildApi, WeaponApi, EquipmentApi, GainApi, WeaponAffixApi, CharacterStatApi, WeaponStatApi } from '../../api'
import type { Character, Build, Weapon, Equipment, Gain, WeaponAffix, CharacterStat } from '../../api'
import {
  STAT_DEFS, formatStatValue,
  buildBaseLayer, buildWeaponLayer, equipSubStatsToLayer,
  buildGainsLayer, computeDerivedFinal,
} from '../../engine/formulas/stats'
import type { StatLayer } from '../../engine/formulas/stats'

const route = useRoute()
const router = useRouter()
const isNew = route.params.id === 'new'

const characters = ref<Character[]>([])
const allBuilds = ref<Build[]>([])
const weaponsMap = ref<Record<string, Weapon>>({})
const equipmentList = ref<Equipment[]>([])
const allGains = ref<Gain[]>([])
const slotStats = reactive<Record<string, StatLayer>>({})
const charStatMap = ref<Record<string, CharacterStat>>({})
const weaponStatMap = ref<Record<string, number>>({})
const weaponAffixesMap = ref<Record<string, WeaponAffix[]>>({})

const form = reactive({ name: '' })
const slots = reactive([
  { label: '角色A', charId: '', buildId: '', charField: 'charAId' as const, buildField: 'buildAId' as const },
  { label: '角色B', charId: '', buildId: '', charField: 'charBId' as const, buildField: 'buildBId' as const },
  { label: '角色C', charId: '', buildId: '', charField: 'charCId' as const, buildField: 'buildCId' as const },
  { label: '角色D', charId: '', buildId: '', charField: 'charDId' as const, buildField: 'buildDId' as const },
])

const charIdsSet = computed(() => new Set(slots.filter(s => s.charId).map(s => s.charId)))

const teamGains = computed(() => {
  const charIds = charIdsSet.value
  const weaponIds = new Set<string>()
  const setNames = new Set<string>()
  for (const s of slots) {
    if (!s.buildId) continue
    const build = allBuilds.value.find(b => b.id === s.buildId)
    if (!build) continue
    if (build.weaponId) weaponIds.add(build.weaponId)
    for (const ef of ['armorId', 'gloveId', 'accessory1Id', 'accessory2Id'] as const) {
      const eid = (build as any)[ef]
      if (!eid) continue
      const eq = equipmentList.value.find(e => e.id === eid)
      if (eq && eq.setName) setNames.add(eq.setName)
    }
  }
  return allGains.value.filter(g => {
    if (g.sourceType === 'character' && g.sourceRefId && charIds.has(g.sourceRefId)) return true
    if (g.sourceType === 'weapon' && g.sourceRefId && weaponIds.has(g.sourceRefId)) return true
    if (g.sourceType === 'set' && g.sourceRefId && setNames.has(g.sourceRefId)) return true
    if (!g.sourceType || !['character', 'weapon', 'set'].includes(g.sourceType)) return true
    return false
  })
})

const gainGroups = computed(() => {
  const groups: { label: string; gains: Gain[] }[] = []
  const charGains = teamGains.value.filter(g => g.sourceType === 'character')
  if (charGains.length) groups.push({ label: '角色增益', gains: charGains })
  const wpnGains = teamGains.value.filter(g => g.sourceType === 'weapon')
  if (wpnGains.length) groups.push({ label: '武器增益', gains: wpnGains })
  const setGains = teamGains.value.filter(g => g.sourceType === 'set')
  if (setGains.length) groups.push({ label: '套装增益', gains: setGains })
  const otherGains = teamGains.value.filter(g => g.sourceType !== 'character' && g.sourceType !== 'weapon' && g.sourceType !== 'set')
  if (otherGains.length) groups.push({ label: '其他增益', gains: otherGains })
  return groups
})

function availableChars(slot: typeof slots[0]) {
  const selectedIds = slots.filter(s => s !== slot && s.charId).map(s => s.charId)
  return characters.value.filter(c => !selectedIds.includes(c.id))
}

function filteredBuilds(charId: string | undefined) {
  if (!charId) return []
  return allBuilds.value.filter(b => b.characterId === charId)
}

function buildOptionLabel(b: Build) {
  const w = b.weaponId ? weaponsMap.value[b.weaponId] : null
  return `${b.name}${w ? ' (' + w.name + ')' : ''}`
}

function buildWeaponName(buildId: string) {
  const build = allBuilds.value.find(b => b.id === buildId)
  if (!build || !build.weaponId) return '无'
  return weaponsMap.value[build.weaponId]?.name || '无'
}

async function computeSlotStats(buildId: string) {
  if (slotStats[buildId]) return
  const build = allBuilds.value.find(b => b.id === buildId)
  if (!build) return
  const c = characters.value.find(ch => ch.id === build.characterId)
  if (!c) return
  const weapon = build.weaponId ? weaponsMap.value[build.weaponId] : null

  const charLevel = build.charLevel ?? 90
  const weaponLevel = build.weaponLevel ?? 90
  const affix1Level = build.affix1Level ?? 1
  const affix2Level = build.affix2Level ?? 1

  // Level-dependent character stats
  const cs = charStatMap.value[c.id + ':' + charLevel]
  const charCfg = {
    baseAtk: cs?.atk ?? c.baseAtk,
    baseHp: cs?.hp ?? c.baseHp,
    baseStr: cs?.str ?? c.baseStr,
    baseAgi: cs?.agi ?? c.baseAgi,
    baseInt: cs?.int ?? c.baseInt,
    baseWil: cs?.wil ?? c.baseWil,
    mainAttr: c.mainAttr, subAttr: c.subAttr, trustLevel: 1,
  }

  // Level-dependent weapon base ATK
  const wBaseAtk = weapon ? (weaponStatMap.value[weapon.id + ':' + weaponLevel] ?? weapon.baseAtk) : 0

  // Weapon affix values at saved levels
  const affix1Val = weapon ? getAffixValue(weapon.id, 1, affix1Level) : 0
  const affix2Val = weapon ? getAffixValue(weapon.id, 2, affix2Level) : 0

  // Parse equipRefines
  let refines: Record<string, number> = {}
  if (build.equipRefines) { try { refines = JSON.parse(build.equipRefines) } catch {} }

  // Collect equipment substats with refine levels
  const equipSubs: Array<{ desc: string; value: number }> = []
  let totalDef = 0
  const slotKeys = ['armorId', 'gloveId', 'accessory1Id', 'accessory2Id'] as const
  const refinePrefixes = ['armor', 'glove', 'accessory', 'accessory2']
  for (let si = 0; si < slotKeys.length; si++) {
    const eid = (build as any)[slotKeys[si]]
    if (!eid) continue
    const eq = equipmentList.value.find(e => e.id === eid)
    if (!eq) continue
    totalDef += (eq as any).baseDef ?? 0
    for (let ai = 1; ai <= 3; ai++) {
      const t = (eq as any)['attr' + ai + 'Type']
      if (!t) continue
      const r = refines[refinePrefixes[si] + 'r' + ai] ?? 0
      const vals = [
        (eq as any)['attr' + ai + 'Value'] ?? 0,
        (eq as any)['attr' + ai + 'V1'] ?? 0,
        (eq as any)['attr' + ai + 'V2'] ?? 0,
        (eq as any)['attr' + ai + 'V3'] ?? 0,
      ]
      const v = vals[Math.min(r, 3)] ?? vals[0]
      if (v === 0) continue
      equipSubs.push({ desc: t, value: v })
    }
  }
  if (totalDef > 0) equipSubs.push({ desc: '基础防御力', value: totalDef })

  // Build layers
  const weaponCfg = {
    baseAtk: wBaseAtk,
    affix1Type: weapon?.affix1Type, affix1Value: affix1Val,
    affix2Type: weapon?.affix2Type, affix2Value: affix2Val,
  }
  const baseLayer = buildBaseLayer(charCfg)
  const weaponLayer = buildWeaponLayer(weaponCfg)
  const equipLayer = equipSubStatsToLayer(equipSubs)

  // Gains layer from build.selectedGains
  let selectedGainIds: string[] = []
  if (build.selectedGains) { try { selectedGainIds = JSON.parse(build.selectedGains) } catch {} }
  const selectedGains = allGains.value.filter(g => selectedGainIds.includes(g.id))
  const gainsLayer = buildGainsLayer(selectedGains)

  const finalLayer = computeDerivedFinal([baseLayer, weaponLayer, equipLayer, gainsLayer], charCfg)
  slotStats[buildId] = finalLayer
}

function getAffixValue(weaponId: string, affixIndex: number, level: number): number {
  const affixes = weaponAffixesMap.value[weaponId]
  if (!affixes) return 0
  const aff = affixes.find(a => a.affixIndex === affixIndex && a.potential === level - 1)
  return aff?.value ?? 0
}

function onCharSlotChange(slot: typeof slots[0]) {
  slot.buildId = ''
}

async function onBuildChange(slot: typeof slots[0]) {
  if (slot.buildId) await computeSlotStats(slot.buildId)
}

async function save() {
  if (!form.name) form.name = '新配队'
  const data: Record<string, any> = { name: form.name }
  for (const s of slots) {
    data[s.charField] = s.charId || null
    data[s.buildField] = s.buildId || null
  }
  try {
    if (isNew) {
      await TeamApi.save(data as any)
    } else {
      data.id = route.params.id as string
      await TeamApi.save(data as any)
    }
    ElMessage.success('已保存')
    router.push('/teams')
  } catch { ElMessage.error('保存失败') }
}

async function saveAndSim() {
  if (isNew) return
  const data: Record<string, any> = { ...form, id: route.params.id as string }
  for (const s of slots) {
    data[s.charField] = s.charId || null
    data[s.buildField] = s.buildId || null
  }
  try {
    await TeamApi.save(data as any)
    ElMessage.success('已保存，跳转至模拟器')
    router.push(`/damage?teamId=${route.params.id}`)
  } catch { ElMessage.error('保存失败') }
}

async function saveAndGoTimeline() {
  if (isNew) return
  const data: Record<string, any> = { ...form, id: route.params.id as string }
  for (const s of slots) {
    data[s.charField] = s.charId || null
    data[s.buildField] = s.buildId || null
  }
  try {
    await TeamApi.save(data as any)
    ElMessage.success('已保存，跳转至排轴模拟')
    router.push(`/timeline?teamId=${route.params.id}`)
  } catch { ElMessage.error('保存失败') }
}

onMounted(async () => {
  characters.value = await CharacterApi.listAll()
  allBuilds.value = await BuildApi.listAll()
  const weapons = await WeaponApi.listAll()
  for (const w of weapons) weaponsMap.value[w.id] = w
  equipmentList.value = await EquipmentApi.listAll()
  allGains.value = await GainApi.listAll()

  // Load stat maps (same as LoadoutEditor)
  const allCharStats = await CharacterStatApi.listAll()
  const csm: Record<string, CharacterStat> = {}
  for (const s of allCharStats) csm[s.characterId + ':' + s.level] = s
  charStatMap.value = csm
  const allWeaponStats = await WeaponStatApi.listAll()
  const wsm: Record<string, number> = {}
  for (const s of allWeaponStats) wsm[s.weaponId + ':' + s.level] = s.baseAtk
  weaponStatMap.value = wsm

  // Pre-load weapon affixes for all weapons referenced by builds
  const weaponIds = new Set(allBuilds.value.map(b => b.weaponId).filter(Boolean))
  for (const wid of weaponIds) {
    weaponAffixesMap.value[wid!] = await WeaponAffixApi.list(wid!)
  }

  if (!isNew) {
    const team = await TeamApi.get(route.params.id as string)
    if (team) {
      form.name = team.name || ''
      for (const s of slots) {
        s.charId = (team as any)[s.charField] || ''
        s.buildId = (team as any)[s.buildField] || ''
        if (s.buildId) await computeSlotStats(s.buildId)
      }
    }
  } else {
    form.name = `新配队-${new Date().toISOString().slice(0,10).replace(/-/g,'')}`
  }
})
</script>

<style scoped>
.slot-stats {
  margin-top: 8px;
  padding: 8px;
  background: #f5f7fa;
  border-radius: 4px;
}
.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}
.stat-title {
  font-weight: 600;
  font-size: 13px;
}
.layer-stats {
  display: grid;
  grid-template-columns:repeat(auto-fill,190px);
  gap: 2px 12px;
  padding: 2px 0;
}
.stat-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  padding: 1px 4px;
}
.stat-label {
  color: #606266;
}
.stat-value {
  font-weight: 500;
  font-family: monospace;
}
.stat-final {
  font-weight: 600;
  color: #409eff;
}
</style>
