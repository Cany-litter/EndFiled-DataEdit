<template>
  <div class="character-card" v-if="loaded">
    <div class="card-header">
      <div class="char-main">
        <span class="char-name">{{ character?.name ?? '' }}</span>
        <span class="char-rarity">{{ '★'.repeat(character?.rarity ?? 0) }}</span>
        <el-tag size="small" :type="elementTagType" class="char-element">{{ elementLabel }}</el-tag>
      </div>
      <div class="char-slot">Slot {{ slotLabels[slotIndex] }}</div>
    </div>

    <div class="card-section">
      <div class="equip-row">
        <span class="equip-label">武器</span>
        <span class="equip-value">{{ weapon?.name ?? '无' }}</span>
        <span v-if="weapon" class="equip-detail">Lv.{{ build?.weaponLevel ?? weapon.level }} ATK:{{ weapon.baseAtk }}</span>
      </div>
      <div class="equip-row">
        <span class="equip-label">装备</span>
        <span class="equip-value">{{ equipSummary || '无' }}</span>
      </div>
    </div>

    <div class="card-section skills-section">
      <div class="skills-header">
        <span>技能列表</span>
        <el-tooltip content="拖拽技能到右侧时间轴放置" placement="top">
          <el-icon style="color:#909399;cursor:pointer"><InfoFilled /></el-icon>
        </el-tooltip>
      </div>
      <div v-if="skills.length === 0" class="empty-skills">暂无技能</div>
      <div
        v-for="(skill, si) in skills"
        :key="skill.id"
        class="skill-chip"
        :class="'skill-type-' + skill.type"
        draggable="true"
        @dragstart="onDragStart($event, skill, si)"
      >
        <span class="skill-type-icon">{{ typeIcon(skill.type) }}</span>
        <div class="skill-info">
          <span class="skill-name">{{ skill.name }}</span>
          <span class="skill-meta">{{ skillMeta(skill, si) }}</span>
        </div>
        <span v-if="skillLevel12[si]" class="skill-mult">{{ (skillLevel12[si]).toFixed(0) }}%</span>
      </div>
    </div>
  </div>
  <div v-else class="card-loading">
    <el-skeleton :rows="6" animated />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { InfoFilled } from '@element-plus/icons-vue'
import { CharacterApi, BuildApi, WeaponApi, EquipmentApi, SkillApi, SkillLevelApi, SkillActionApi, SkillCostApi, SkillDamageTickApi } from '../../api'
import type { Character, Build, Weapon, Equipment, Skill, SkillAction, SkillCost, SkillDamageTick } from '../../api'
import type { TimelineAction } from '../../engine/types/timeline'

const props = defineProps<{
  characterId: string
  buildId: string
  slotIndex: number
  element: string
  snapFn?: (t: number) => number
}>()

const emit = defineEmits<{
  'drop-skill': [data: DragSkillData]
}>()

export interface DragSkillData {
  characterId: string
  skillId: string
  actionData: Partial<TimelineAction>
}

const slotLabels = ['1', '2', '3', '4']

const loaded = ref(false)
const character = ref<Character | null>(null)
const build = ref<Build | null>(null)
const weapon = ref<Weapon | null>(null)
const equipment = ref<Equipment[]>([])
const skills = ref<Skill[]>([])
const skillLevels = ref<Record<string, SkillLevel[]>>({})
const skillActions = ref<Record<string, SkillAction[]>>({})
const skillCosts = ref<Record<string, SkillCost[]>>({})
const skillDamageTicks = ref<Record<string, SkillDamageTick[]>>({})

const skillLevel12 = computed(() => {
  return skills.value.map(s => {
    const levels = skillLevels.value[s.id]
    if (!levels) return null
    const lv12 = levels.find(l => l.level === 12)
    return lv12?.multiplier ?? null
  })
})

const elementTagType = computed(() => {
  const map: Record<string, string> = { blaze: 'danger', emag: 'warning', cold: 'primary', nature: 'success', physical: 'info' }
  return map[props.element] ?? 'info'
})

const elementLabel = computed(() => {
  const map: Record<string, string> = { blaze: '烈焰', emag: '电磁', cold: '霜寒', nature: '自然', physical: '物理' }
  return map[props.element] ?? props.element
})

const equipSummary = computed(() => {
  const names = equipment.value.map(e => e.name)
  return names.join(' | ') || '未配置'
})

function typeIcon(type: string) {
  return ({ normal: '普攻', skill: '战技', chain: '连携', ultimate: '终结', talent1: '天赋', talent2: '天赋' })[type] ?? type
}

function skillMeta(skill: Skill, si: number): string {
  const parts: string[] = []
  const actions = skillActions.value[skill.id]
  if (actions && actions.length > 0) {
    const a = actions[0]
    if (a.castTime) parts.push(`${a.castTime}s`)
  } else {
    parts.push({ normal: '0.8s', skill: '1.5s', chain: '2.0s', ultimate: '2.5s' }[skill.type] ?? '1.0s')
  }
  const costs = skillCosts.value[skill.id]
  const cost = costs?.find(c => c.level === 12)
  if (cost) {
    if (cost.coolDown && cost.coolDown > 0) parts.push(`CD:${cost.coolDown}s`)
    if (cost.usp && cost.usp > 0) parts.push(`SP:${cost.usp}`)
  } else {
    if (skill.type === 'skill') parts.push('SP:100')
    if (skill.type === 'ultimate') parts.push('技力:80')
  }
  return parts.join(' ')
}

function buildActionData(skill: Skill, skillIdx: number): Partial<TimelineAction> {
  const actions = skillActions.value[skill.id]
  const skillAction = actions?.[0]
  const costs = skillCosts.value[skill.id]
  const cost = costs?.find(c => c.level === 12)

  const typeMap: Record<string, 'attack' | 'skill' | 'link' | 'ultimate' | 'execution'> = {
    normal: 'attack', skill: 'skill', chain: 'link', ultimate: 'ultimate',
  }
  const type = typeMap[skill.type] ?? 'attack'

  const elementMap: Record<string, string> = {
    pyro: 'blaze', cryo: 'cold', electro: 'emag', natural: 'nature', physical: 'physical',
  }
  const element = elementMap[props.element] ?? 'physical'

  const duration = skillAction?.castTime ?? {
    normal: 0.8, skill: 1.5, chain: 2.0, ultimate: 2.5,
  }[skill.type] ?? 1.0

  const cooldown = cost?.coolDown ?? skillAction?.chainCd ?? skillAction?.ultimateCd ?? {
    normal: 0, skill: 5, chain: 8, ultimate: 20,
  }[skill.type] ?? 5

  const spCost = cost?.usp ?? (skill.type === 'skill' ? 100 : 0)
  const gaugeCost = (skill.type === 'ultimate' ? (cost?.usp ?? 100) : 0)
  const gaugeGain = skillAction?.techReturn ?? 0
  const teamGaugeGain = skillAction?.techRegen ?? 0

  const atk = (character.value?.baseAtk ?? 0) + (weapon.value?.baseAtk ?? 0)
  const mult = skillLevel12.value[skillIdx] ?? 1
  const hpDamage = atk * (mult / 100)

  // Use real damage ticks from DB if available
  const damageTicks = skillDamageTicks.value[skill.id]
  const ticks = damageTicks?.length ? damageTicks.map(t => ({
    offset: t.offset,
    stagger: t.stagger ?? 0,
    sp: t.sp ?? 0,
    boundEffects: [] as string[],
    hpDamage,
  })) : [{ offset: duration * 0.5, stagger: cost?.poise ?? 10, sp: skillAction?.techCost ?? 0, boundEffects: [] as string[], hpDamage }]

  return {
    id: skill.id,
    type,
    name: skill.name,
    librarySource: 'character',
    element: element as any,
    icon: '',
    duration,
    cooldown,
    spCost,
    gaugeCost,
    gaugeGain,
    teamGaugeGain,
    damageTicks: ticks,
    allowedTypes: [],
    physicalAnomaly: [],
    sourceWeaponId: build.value?.weaponId ?? null,
    weaponId: build.value?.weaponId ?? null,
  }
}

function onDragStart(e: DragEvent, skill: Skill, skillIdx: number) {
  if (!e.dataTransfer) return
  const data: DragSkillData = {
    characterId: props.characterId,
    skillId: skill.id,
    actionData: buildActionData(skill, skillIdx),
  }
  e.dataTransfer.setData('application/json', JSON.stringify(data))
  e.dataTransfer.effectAllowed = 'copy'
}

onMounted(async () => {
  try {
    const [char, b] = await Promise.all([
      CharacterApi.get(props.characterId),
      BuildApi.get(props.buildId),
    ])
    character.value = char
    build.value = b

    if (b.weaponId) {
      weapon.value = await WeaponApi.get(b.weaponId)
    }

    const equipIds = [b.armorId, b.gloveId, b.accessory1Id, b.accessory2Id].filter(Boolean) as string[]
    equipment.value = await Promise.all(equipIds.map(id => EquipmentApi.get(id)))

    const skillList = await SkillApi.list(props.characterId)
    skills.value = skillList

    const [levels, actions, costs, ticks] = await Promise.all([
      Promise.all(skillList.map(s => SkillLevelApi.list(s.id))),
      Promise.all(skillList.map(s => SkillActionApi.list(s.id))),
      Promise.all(skillList.map(s => SkillCostApi.list(s.id))),
      Promise.all(skillList.map(s => SkillDamageTickApi.list(s.id))),
    ])
    for (let i = 0; i < skillList.length; i++) {
      skillLevels.value[skillList[i].id] = levels[i]
      skillActions.value[skillList[i].id] = actions[i]
      skillCosts.value[skillList[i].id] = costs[i]
      skillDamageTicks.value[skillList[i].id] = ticks[i]
    }

    loaded.value = true
  } catch (err) {
    console.error('Failed to load character card:', err)
    loaded.value = true
  }
})
</script>

<style scoped>
.character-card {
  display: flex; flex-direction: column; gap: 6px;
}
.card-header {
  display: flex; justify-content: space-between; align-items: center;
}
.char-main { display: flex; align-items: center; gap: 6px; }
.char-name { font-size: 14px; font-weight: 700; }
.char-rarity { font-size: 13px; color: #e6a23c; }
.char-element { font-size: 11px; }
.char-slot { font-size: 11px; color: #909399; background: #f5f7fa; padding: 1px 6px; border-radius: 3px; }
.card-section { margin-bottom: 2px; }
.equip-row { display: flex; align-items: center; gap: 6px; font-size: 12px; padding: 2px 0; }
.equip-label { color: #909399; flex-shrink: 0; width: 36px; }
.equip-value { font-weight: 500; }
.equip-detail { color: #909399; font-size: 11px; }
.skills-section { }
.skills-header { display: flex; align-items: center; gap: 6px; font-weight: 600; font-size: 12px; color: #303133; margin-bottom: 4px; }
.empty-skills { color: #909399; font-size: 11px; text-align: center; padding: 8px 0; }
.skill-chip {
  display: flex; align-items: center; gap: 6px; padding: 5px 8px; margin-bottom: 3px;
  border-radius: 4px; cursor: grab; transition: all 0.15s; border-left: 3px solid transparent;
}
.skill-chip:hover { transform: translateY(-1px); box-shadow: 0 2px 6px rgba(0,0,0,0.1); }
.skill-chip:active { cursor: grabbing; }
.skill-type-normal { background: #ecf5ff; border-left-color: #409eff; }
.skill-type-skill { background: #fdf6ec; border-left-color: #e6a23c; }
.skill-type-chain { background: #f0f9eb; border-left-color: #67c23a; }
.skill-type-talent1 { background: #f9f0ff; border-left-color: #a855f7; }
.skill-type-talent2 { background: #ecfdf5; border-left-color: #14b8a6; }
.skill-type-ultimate { background: #fef0f0; border-left-color: #f56c6c; }
.skill-type-icon { font-weight: 700; font-size: 12px; width: 18px; text-align: center; }
.skill-type-normal .skill-type-icon { color: #409eff; }
.skill-type-skill .skill-type-icon { color: #e6a23c; }
.skill-type-chain .skill-type-icon { color: #67c23a; }
.skill-type-ultimate .skill-type-icon { color: #f56c6c; }
.skill-info { flex: 1; display: flex; flex-direction: column; }
.skill-name { font-size: 12px; font-weight: 500; }
.skill-meta { font-size: 10px; color: #909399; }
.skill-mult { font-size: 11px; font-weight: 600; color: #f56c6c; }
.card-loading { padding: 16px; }
</style>
