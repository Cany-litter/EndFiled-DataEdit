<template>
  <div class="char-library">
    <div class="lib-header">
      <span class="lib-title">技能库</span>
      <el-tag v-if="totalSkills" size="small">{{ totalSkills }} 个技能</el-tag>
    </div>

    <div v-if="!characters.length" class="lib-empty">
      <div>暂无干员数据</div>
      <div class="lib-hint">请先在右侧选择一个配队</div>
    </div>

    <div v-else class="lib-char-list">
      <div v-for="(c, ci) in characters" :key="c.id" class="lib-char-section">
        <div class="lib-char-header">
          <span class="lib-slot-badge" :style="{ background: slotColors[ci] }">{{ slotLabels[ci] }}</span>
          <div class="lib-char-info">
            <span class="lib-char-name">{{ c.name }}</span>
            <span class="lib-char-weapon" v-if="weaponNames[c.id]">{{ weaponNames[c.id] }}</span>
          </div>
        </div>

        <div class="lib-skills">
          <div
            v-for="skill in sortedSkillsByChar[c.id] || []"
            :key="skill.id"
            class="lib-skill-chip"
            :class="'skill-type-' + skill.type"
            draggable="true"
            @dragstart="onDragStart($event, c, skill)"
            @click="emit('select-skill', { character: c, skill })"
          >
            <span class="lib-skill-icon">{{ skillShortName(skill.type, skill.id) }}</span>
            <div class="lib-skill-info">
              <span class="lib-skill-name">{{ skill.name }}</span>
              <span class="lib-skill-meta">{{ skillMeta(skill) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Character, Skill, SkillAction, SkillLevel } from '../../api'
import type { TimelineAction } from '../../engine/types/timeline'
import { skillShortName } from '../../utils/constants'

const props = defineProps<{
  characters: (Character | null)[]
  skillsByChar: Record<string, Skill[]>
  skillActionsByChar: Record<string, Record<string, SkillAction>>
  skillLevel12Map: Record<string, number>
  weaponNames: Record<string, string>
}>()

const emit = defineEmits<{
  'drop-skill': [charId: string, actionData: Partial<TimelineAction>, time: number]
  'select-skill': [data: { character: Character; skill: Skill }]
}>()

const slotLabels = ['干员1', '干员2', '干员3', '干员4']
const slotColors = ['#e74c3c', '#e67e22', '#2ecc71', '#3498db']

const typeOrder: Record<string, number> = {
  normal: 0, attack: 0,
  charged: 1,
  plunge: 2,
  execution: 3,
  skill: 4,
  chain: 5, link: 5,
  ultimate: 6,
  talent1: 7,
  talent2: 8,
  other: 9,
}

const sortedSkillsByChar = computed(() => {
  const result: Record<string, any[]> = {}
  for (const c of props.characters) {
    if (!c) continue
    const skills = [...(props.skillsByChar[c.id] || [])]
    skills.sort((a, b) => (typeOrder[a.type] ?? 99) - (typeOrder[b.type] ?? 99))
    result[c.id] = skills
  }
  return result
})

const totalSkills = computed(() => {
  let n = 0
  for (const c of props.characters) {
    if (c) n += (props.skillsByChar[c.id]?.length || 0)
  }
  return n
})

const SKILL_ICONS: Record<string, string> = {
  normal: '普', execution: '处', plunge: '落', charged: '重',
  skill: '技', chain: '连', ultimate: '终',
  talent1: '天1', talent2: '天2', other: '?',
}
function skillTypeIcon(type: string) {
  return SKILL_ICONS[type] || type.slice(0, 2)
}

function skillMeta(skill: Skill): string {
  const parts: string[] = []
  const sa = props.skillActionsByChar[skill.characterId]?.[skill.id]
  if (sa?.castTime) parts.push(sa.castTime + 's')
  if (sa?.spCost) parts.push(sa.spCost + '技力')
  if (sa?.gaugeGain) parts.push('自身充能+' + sa.gaugeGain)
  const mult = props.skillLevel12Map[skill.id]
  if (mult) parts.push((mult * 100).toFixed(0) + '%')
  return parts.join(' | ') || ''
}

function uid(prefix = 'id'): string {
  return prefix + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

function onDragStart(e: DragEvent, c: Character, skill: Skill) {
  if (!e.dataTransfer) return
  const sa = props.skillActionsByChar[c.id]?.[skill.id]
  const actionData: Partial<TimelineAction> = {
    id: skill.id,
    skillId: skill.id,
    type: skill.type,
    name: skill.name,
    damageType: skill.damageType,
    librarySource: 'character',
    element: (c as any).element || 'physical',
    icon: '',
    duration: sa?.castTime ?? 1,
    cooldown: sa?.chainCd?.valueOf() ?? sa?.cooldown?.valueOf() ?? 0,
    spCost: sa?.techCost ?? sa?.spCost ?? 0,
    gaugeGain: Number(sa?.gaugeGain ?? 0),
    teamGaugeGain: Number(sa?.teamGaugeGain ?? 0),
    damageTicks: [{ offset: 0.5, stagger: 10, sp: 0, boundEffects: [] }],
    allowedTypes: [],
    physicalAnomaly: [],
  }
  if (sa?.ultimateGaugeMax != null) actionData.gaugeCost = sa.ultimateGaugeMax
  e.dataTransfer.setData('application/json', JSON.stringify({ characterId: c.id, actionData }))
  e.dataTransfer.effectAllowed = 'copy'
}
</script>

<style scoped>
.char-library { padding: 8px; height: 100%; display: flex; flex-direction: column; }
.lib-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; flex-shrink: 0; }
.lib-title { font-weight: 600; font-size: 13px; color: #303133; }
.lib-empty { padding: 20px 8px; text-align: center; color: #c0c4cc; font-size: 12px; }
.lib-hint { margin-top: 4px; font-size: 11px; color: #e0e0e0; }
.lib-char-list { flex: 1; overflow-y: auto; }
.lib-char-section { margin-bottom: 10px; }
.lib-char-header { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
.lib-slot-badge { width: 18px; height: 18px; border-radius: 3px; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #fff; font-weight: 700; flex-shrink: 0; }
.lib-char-info { display: flex; flex-direction: column; min-width: 0; }
.lib-char-name { font-size: 12px; font-weight: 500; color: #303133; }
.lib-char-weapon { font-size: 10px; color: #909399; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.lib-skills { display: flex; flex-direction: column; gap: 3px; }
.lib-skill-chip { display: flex; align-items: center; gap: 5px; padding: 4px 6px; border-radius: 4px; cursor: grab; transition: background 0.15s; border: 1px solid transparent; }
.lib-skill-chip:active { cursor: grabbing; }
.lib-skill-chip:hover { background: #f5f7fa; border-color: #e4e7ed; }
.lib-skill-icon { width: 20px; height: 20px; border-radius: 3px; display: flex; align-items: center; justify-content: center; font-size: 9px; color: #fff; font-weight: 600; flex-shrink: 0; }

.skill-type-normal,
.skill-type-execution,
.skill-type-plunge,
.skill-type-charged { background-color: var(--skill-bg-normal); }
.skill-type-skill { background-color: var(--skill-bg-skill); }
.skill-type-chain { background-color: var(--skill-bg-chain); }
.skill-type-ultimate { background-color: var(--skill-bg-ultimate); }
.skill-type-talent1 { background-color: var(--skill-bg-talent1); }
.skill-type-talent2 { background-color: var(--skill-bg-talent2); }
.skill-type-other { background-color: var(--skill-bg-other); }

.skill-type-normal .lib-skill-icon,
.skill-type-execution .lib-skill-icon,
.skill-type-plunge .lib-skill-icon,
.skill-type-charged .lib-skill-icon { background: var(--skill-normal); }
.skill-type-skill .lib-skill-icon { background: var(--skill-skill); }
.skill-type-chain .lib-skill-icon { background: var(--skill-chain); }
.skill-type-ultimate .lib-skill-icon { background: var(--skill-ultimate); }
.skill-type-talent1 .lib-skill-icon { background: var(--skill-talent1); }
.skill-type-talent2 .lib-skill-icon { background: var(--skill-talent2); }
.skill-type-other .lib-skill-icon { background: var(--skill-other); }

.lib-skill-info { display: flex; flex-direction: column; min-width: 0; flex: 1; }
.lib-skill-name { font-size: 11px; color: #303133; }
.lib-skill-meta { font-size: 9px; color: #909399; }
</style>
