<template>
  <div class="timeline-editor" @dragover.prevent="onEditorDragOver" @drop.prevent="onFileDrop">
    <div v-if="dragOver" class="drop-overlay">
      <div class="drop-overlay-text">松开导入排轴方案</div>
    </div>
    <div class="left-panel" :class="{ collapsed: leftPanelCollapsed }">
      <div class="panel-section">
        <div class="section-header">
          <span>排轴方案</span>
          <div class="section-actions">
            <el-tooltip content="导入"><el-button size="small" :icon="Upload" @click="onImport" circle /></el-tooltip>
            <el-tooltip content="导出"><el-button size="small" :icon="Download" @click="onExport" circle /></el-tooltip>
          </div>
        </div>
        <div class="scenario-row">
          <el-select v-model="selectedScenarioId" filterable placeholder="选择方案" style="flex:1" @change="onScenarioChange">
            <el-option v-for="s in store.scenarios" :key="s.id" :label="s.name" :value="s.id" />
          </el-select>
          <el-button size="small" text @click="onRename" title="重命名">✏️</el-button>
        </div>
        <div class="action-row">
          <el-button size="small" @click="onNewScenario">新建</el-button>
          <el-button size="small" @click="onDuplicate">复制</el-button>
          <el-button size="small" type="primary" :loading="saving" @click="onSaveScenario">保存</el-button>
          <el-button size="small" type="danger" @click="onDelete">删除</el-button>
          <el-button size="small" style="margin-left:4px" @click="goToDpsSim">📊 排轴伤害</el-button>
        </div>
      </div>

      <div class="panel-section">
        <div class="section-header"><span>配队选择</span></div>
        <el-select v-model="selectedTeamId" filterable placeholder="选择配队" style="width:100%" @change="onTeamSelect">
          <el-option v-for="t in teamList" :key="t.id" :label="t.name" :value="t.id" />
        </el-select>
        <div v-if="teamData" style="margin-top:4px;font-size:12px;color:#909399;display:flex;align-items:center;gap:4px">
          <span>当前: {{ teamData.name }}</span>
          <el-button size="small" text @click="refreshTeam">↻</el-button>
        </div>
      </div>

      <div class="panel-section card-panel full-panel" v-if="teamChars.some(Boolean)">
        <el-tabs v-model="libraryTab" style="height:100%;display:flex;flex-direction:column" class="library-tabs">
          <el-tab-pane label="技能库" name="skill">
            <CharacterLibrary
              :characters="teamChars"
              :skills-by-char="teamSkills"
              :skill-actions-by-char="teamSkillActions"
              :skill-level12-map="teamSkillLevel12"
              :weapon-names="teamWeaponNames"
              @select-skill="onSelectLibrarySkill"
            />
          </el-tab-pane>
          <el-tab-pane label="增益库" name="buff">
            <BuffLibrary />
          </el-tab-pane>
        </el-tabs>
      </div>
      <div class="panel-section card-panel" v-else>
        <div class="empty-state">请选择一个配队或导入排轴数据</div>
      </div>

    </div>

    <button class="left-toggle" @click="leftPanelCollapsed = !leftPanelCollapsed">
      {{ leftPanelCollapsed ? '▶' : '◀' }}
    </button>

    <div class="main-area">
      <div class="main-scroll">
        <div class="canvas-area">
          <TimelineCanvas
            :tracks="store.tracks"
            :system-constants="store.systemConstants"
            :snap-fn="snapFn"
            :can-undo="canUndo"
            :can-redo="canRedo"
            :snap-granularity="snapGranularity"
            :char-name-map="charNameMap"
            :char-element-map="charElementMap"
            :char-slot-map="charSlotMap"
            :enemies="enemies"
            :enemy-buffs="enemyBuffs"
            @update-enemy-buffs="onUpdateEnemyBuffs"
            @select-action="onSelectAction"
            @deselect-action="onDeselectAction"
            @drop-skill="onDropSkill"
            @drop-buff="onDropBuff"
            @delete-actions="onDeleteActions"
            @update-action="onUpdateAction"
            @add-buff="onAddBuff"
            @add-state="onAddState"
            @move-action="pushHistory"
            @undo="onUndo"
            @redo="onRedo"
            @update:snap-granularity="snapGranularity = $event"
            @toggle-properties="rightPanelCollapsed = !rightPanelCollapsed"
          />
        </div>
        <EnemyBar :enemies="enemies" @update="onEnemiesUpdate" />
      </div>
    </div>

    <PropertiesPanel
      v-if="!rightPanelCollapsed"
      :action="selectedAction"
      :library-skill="selectedLibrarySkill"
      :is-library-mode="isLibraryMode"
      :enemy-list="enemies"
      @update="onPropertiesUpdate"
      @close="rightPanelCollapsed = true"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { Upload, Download } from '@element-plus/icons-vue'
import { useTimelineStore } from '../../stores/timelineStore'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { TimelineAction, TimelineExport, Track, TimelineEnemy } from '../../engine/types/timeline'
import api, { TimelineApi, TeamApi, CharacterApi, BuildApi, SkillApi, SkillLevelApi, SkillActionApi, WeaponApi } from '../../api'
import type { Character, Build, Team, Skill, SkillAction, SkillLevel } from '../../api'
import { TimelineHistory } from '../../engine/utils/TimelineHistory'
import TimelineCanvas from './TimelineCanvas.vue'
import CharacterLibrary from './CharacterLibrary.vue'
import BuffLibrary from './BuffLibrary.vue'
import EnemyBar from './EnemyBar.vue'
import PropertiesPanel from './PropertiesPanel.vue'

const props = defineProps<{ teamId?: string }>()
const router = useRouter()
const store = useTimelineStore()

const slotLabels = ['1', '2', '3', '4']
const slotKeys: (keyof Team)[] = ['charAId', 'charBId', 'charCId', 'charDId']
const buildSlotKeys: (keyof Team)[] = ['buildAId', 'buildBId', 'buildCId', 'buildDId']

function uid(prefix = 'id'): string { return prefix + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6) }

const selectedScenarioId = ref('')
const activeCharSlot = ref<number | null>(null)
const selectedAction = ref<TimelineAction | null>(null)
const selectedLibrarySkill = ref<any>(null)
const rightPanelCollapsed = ref(true)
const libraryTab = ref('skill')
const saving = ref(false)
const savedScenarioIds = ref<Set<string>>(new Set())
const loadingTeam = ref(false)
const leftPanelCollapsed = ref(false)
const dragOver = ref(false)

function onEditorDragOver(e: DragEvent) {
  if (e.dataTransfer?.types?.includes('Files')) {
    dragOver.value = true
  }
}
const enemies = ref<TimelineEnemy[]>([])

const enemyBuffs = computed(() => store.activeScenario?.data?.enemyBuffs ?? {})

function onUpdateEnemyBuffs(buffs: Record<string, TimelineAction[]>) {
  const scenario = store.activeScenario
  if (scenario) {
    scenario.data.enemyBuffs = buffs
    pushHistory()
  }
}

const isLibraryMode = computed(() => !!selectedLibrarySkill.value && !selectedAction.value)

const charNameMap = computed(() => {
  const map: Record<string, string> = {}
  for (const c of teamChars.value) {
    if (c) map[c.id] = c.name
  }
  return map
})

const charElementMap = computed(() => {
  const map: Record<string, string> = {}
  for (const c of teamChars.value) {
    if (c) map[c.id] = c.element
  }
  return map
})


const charSlotMap = computed(() => {
  const map: Record<string, string> = {}
  for (let i = 0; i < teamChars.value.length; i++) {
    const c = teamChars.value[i]
    if (c) {
      map[c.id] = slotLabels[i]
      map[c.id + '_buff'] = slotLabels[i]
      map[c.id + '_state'] = slotLabels[i]
    }
  }
  return map
})


const snapGranularity = ref(0.5)
const snapFn = computed(() => (t: number) => Math.round(t / snapGranularity.value) * snapGranularity.value)

const history = new TimelineHistory(50)
let historyPaused = false
const historyVersion = ref(0)

const canUndo = computed(() => { historyVersion.value; return history.canUndo() })
const canRedo = computed(() => { historyVersion.value; return history.canRedo() })

const teamList = ref<Team[]>([])
const selectedTeamId = ref('')
const teamChars = ref<(Character | null)[]>([])
const teamBuildIds = ref<string[]>([])
const teamData = ref<Team | null>(null)

// Skill library data
const teamSkills = ref<Record<string, Skill[]>>({})
const teamSkillActions = ref<Record<string, Record<string, SkillAction>>>({})
const teamSkillLevel12 = ref<Record<string, number>>({})
const teamWeaponNames = ref<Record<string, string>>({})

function pushHistory() {
  if (historyPaused) return
  history.push(JSON.parse(JSON.stringify(store.tracks)))
  historyVersion.value++
}

function applyTracks(tracks: Track[]) {
  if (store.activeData) {
    historyPaused = true
    store.activeData.tracks = tracks
    historyPaused = false
    historyVersion.value++
  }
}

function onScenarioChange(id: string) {
  store.setActiveScenario(id)
  activeCharSlot.value = null
  history.clear()
  const scenario = store.activeScenario
  if (scenario?.teamId) {
    if (scenario.teamId !== selectedTeamId.value) {
      loadTeamById(scenario.teamId)
    }
  } else {
    loadTeamFromScenario()
  }
  restoreEnemiesFromScenario()
}

function restoreEnemiesFromScenario() {
  const scenario = store.activeScenario
  if (scenario?.data?.enemies && Array.isArray(scenario.data.enemies)) {
    enemies.value = scenario.data.enemies
  } else {
    enemies.value = []
  }
}

function onNewScenario() {
  const id = uid('sc')
  const existingNames = store.scenarios.map(s => s.name)
  let idx = 1
  let name = '新方案'
  while (existingNames.includes(name)) {
    idx++
    name = '新方案-' + idx
  }
  store.addScenario({ id, name, data: { tracks: [] } })
  selectedScenarioId.value = id
  history.clear()
}

function onDuplicate() {
  const src = store.activeScenario
  if (!src) { ElMessage.warning('请先选择方案'); return }
  const id = uid('sc')
  store.addScenario({ id, name: src.name + ' (副本)', data: JSON.parse(JSON.stringify(src.data)) })
  selectedScenarioId.value = id
}

async function onDelete() {
  if (!selectedScenarioId.value) return
  try {
    await ElMessageBox.confirm('确定删除该方案？', '确认')
    store.removeScenario(selectedScenarioId.value)
    selectedScenarioId.value = store.activeScenarioId
  } catch { }
}

async function onRename() {
  const scenario = store.activeScenario
  if (!scenario) { ElMessage.warning('请先选择方案'); return }
  try {
    const { value } = await ElMessageBox.prompt('输入新名称', '重命名', { inputValue: scenario.name })
    if (value) { scenario.name = value; ElMessage.success('已重命名') }
  } catch { }
}

function onSelectAction(action: TimelineAction) {
  selectedAction.value = action
  selectedLibrarySkill.value = null
  rightPanelCollapsed.value = false
}

function onDeselectAction() {
  selectedAction.value = null
  rightPanelCollapsed.value = true
}

function onSelectLibrarySkill(data: { character: any; skill: any }) {
  selectedLibrarySkill.value = data.skill
  selectedAction.value = null
  rightPanelCollapsed.value = false
  console.log('选中库技能:', data.skill?.name, data.character?.name)
}

function onEnemiesUpdate(list: TimelineEnemy[]) {
  enemies.value = list
  const scenario = store.activeScenario
  if (scenario) scenario.data.enemies = list
}

function onUpdateAction(trackId: string, instanceId: string, patch: Partial<TimelineAction>) {
  store.updateAction(trackId, instanceId, patch)
  pushHistory()
}

function onPropertiesUpdate(action: TimelineAction) {
  const scenario = store.activeScenario
  if (!scenario) return
  for (const track of scenario.data.tracks) {
    const a = track.actions.find(x => x.instanceId === action.instanceId)
    if (a) { Object.assign(a, action); pushHistory(); break }
  }
}

function onDropBuff(trackId: string, buffData: Partial<TimelineAction>, time: number) {
  const scenario = store.activeScenario
  if (!scenario) { ElMessage.warning('请先新建或选择一个排轴方案'); return }
  store.ensureBuffTrackExists(trackId.replace('_buff', ''))
  const instanceId = 'buff_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6)
  const buff: TimelineAction = {
    id: buffData.id!,
    type: 'skill',
    name: buffData.name!,
    librarySource: 'buff',
    element: 'physical',
    icon: '',
    duration: buffData.duration ?? 5,
    cooldown: 0,
    startTime: snapFn.value(time),
    logicalStartTime: snapFn.value(time),
    damageTicks: [],
    allowedTypes: [],
    physicalAnomaly: [],
    instanceId,
  }
  const ok = store.addBuffToTrack(trackId, buff)
  if (ok) pushHistory()
}

function onDropSkill(charId: string, actionData: Partial<TimelineAction>, time: number) {
  const scenario = store.activeScenario
  if (!scenario) { ElMessage.warning('请先新建或选择一个排轴方案'); return }
  store.ensureTrackExists(charId)
  const instanceId = 'inst_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6)
  const action: TimelineAction = {
    id: actionData.id!,
    type: actionData.type!,
    name: actionData.name!,
    librarySource: actionData.librarySource ?? 'character',
    element: actionData.element!,
    icon: actionData.icon ?? '',
    duration: actionData.duration ?? 1,
    cooldown: actionData.cooldown ?? 0,
    spCost: actionData.spCost,
    gaugeCost: actionData.gaugeCost,
    gaugeGain: actionData.gaugeGain ?? 0,
    teamGaugeGain: actionData.teamGaugeGain,
    damageTicks: actionData.damageTicks ?? [{ offset: 0.5, stagger: 10, sp: 0, boundEffects: [] }],
    allowedTypes: actionData.allowedTypes ?? [],
    physicalAnomaly: actionData.physicalAnomaly ?? [],
    sourceWeaponId: actionData.sourceWeaponId,
    weaponId: actionData.weaponId,
    instanceId,
    logicalStartTime: time,
    startTime: time,
  }
  const ok = store.addActionToTrack(charId, action, snapFn.value)
  if (ok) {
    pushHistory()
  } else {
    ElMessage.warning('该时间点有冲突，请选择其他位置')
  }
}

function onDeleteActions(instanceIds: string[]) {
  const scenario = store.activeScenario
  if (!scenario) return
  for (const track of scenario.data.tracks) {
    const ids = instanceIds.filter(id => track.actions.some(a => a.instanceId === id))
    if (ids.length > 0) track.actions = track.actions.filter(a => !ids.includes(a.instanceId))
  }
  pushHistory()
}

function onAddBuff(trackId: string, buff: TimelineAction) {
  const ok = store.addBuffToTrack(trackId, buff)
  if (ok) pushHistory()
}

function onAddState(trackId: string, state: TimelineAction) {
  const ok = store.addStateToTrack(trackId, state)
  if (ok) pushHistory()
}

function goToDpsSim() {
  const scenarioId = store.activeScenarioId
  if (scenarioId) {
    router.push(`/damage?scenarioId=${scenarioId}`)
  } else {
    ElMessage.warning('请先选择或创建一个排轴方案')
  }
}

function runAll() {
  // Re-run simulation on next tick
  nextTick(() => {})
}

function onGlobalKeydown(e: KeyboardEvent) {
  if (e.code === 'Space' && !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
    e.preventDefault()
    runAll()
  }
}
onMounted(() => window.addEventListener('keydown', onGlobalKeydown))
const _cleanup = () => window.removeEventListener('keydown', onGlobalKeydown)

function onUndo() {
  const state = history.undo()
  if (state) applyTracks(state)
}

function onRedo() {
  const state = history.redo()
  if (state) applyTracks(state)
}

async function onFileDrop(e: DragEvent) {
  dragOver.value = false
  const file = e.dataTransfer?.files?.[0]
  if (!file || !file.name.endsWith('.json')) return
  try {
    const text = await file.text()
    const data: TimelineExport = JSON.parse(text)
    store.importFromExport(data)
    selectedScenarioId.value = store.activeScenarioId
    ElMessage.success(`已导入 ${data.scenarioList.length} 个方案`)
    loadTeamFromScenario()
  } catch (err) { ElMessage.error('导入失败: ' + (err as Error).message) }
}

function onImport() {
  const input = document.createElement('input')
  input.type = 'file'; input.accept = '.json'
  input.onchange = async (e: any) => {
    const file = e.target?.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      const data: TimelineExport = JSON.parse(text)
      store.importFromExport(data)
      selectedScenarioId.value = store.activeScenarioId
      ElMessage.success(`已导入 ${data.scenarioList.length} 个方案`)
      loadTeamFromScenario()
    } catch (err) { ElMessage.error('导入失败: ' + (err as Error).message) }
  }
  input.click()
}

function onExport() {
  const data = store.toExport()
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = `Endaxis_Timeline_${new Date().toISOString().slice(0, 10)}.json`
  a.click(); URL.revokeObjectURL(url)
}

async function onSaveScenario() {
  saving.value = true
  try {
    const scenario = store.activeScenario
    if (!scenario) { ElMessage.warning('没有可保存的方案'); return }
    const tracksData = typeof scenario.data.tracks === 'string' ? scenario.data.tracks : JSON.stringify(scenario.data.tracks)
    const enemyParams = scenario.data.customEnemyParams
      ? (typeof scenario.data.customEnemyParams === 'string' ? scenario.data.customEnemyParams : JSON.stringify(scenario.data.customEnemyParams))
      : null
    const enemiesData = enemies.value.length > 0 ? JSON.stringify(enemies.value) : null
    const enemyBuffsData = scenario.data.enemyBuffs && Object.keys(scenario.data.enemyBuffs).length
      ? JSON.stringify(scenario.data.enemyBuffs) : null
    const payload: Record<string, any> = {
      name: scenario.name, teamId: selectedTeamId.value || props.teamId || null,
      systemConstants: JSON.stringify(store.systemConstants),
      prepDuration: scenario.data.prepDuration ?? 5,
      activeEnemyId: scenario.data.activeEnemyId ?? null,
      customEnemyParams: enemyParams,
      tracks: tracksData,
      enemies: enemiesData,
      enemyBuffs: enemyBuffsData,
    }
    if (savedScenarioIds.value.has(scenario.id)) {
      await api.put('/timelines/' + scenario.id, { ...payload, id: scenario.id })
    } else {
      const res = await api.post('/timelines', payload)
      const newId: string = res.data?.data?.id || res.data?.id
      if (newId && newId !== scenario.id) {
        const oldId = scenario.id
        const scList = store.scenarios
        const idx = scList.findIndex(s => s.id === oldId)
        if (idx >= 0) {
          const updated = { ...scList[idx], id: newId }
          scList[idx] = updated as any
          store.scenarios = [...scList]
        }
        selectedScenarioId.value = newId
      }
      savedScenarioIds.value.add(newId || scenario.id)
    }
    ElMessage.success('方案已保存')
  } catch (err) { ElMessage.error('保存失败: ' + (err as Error).message) }
  finally { saving.value = false }
}

function onTeamSelect(teamId: string) {
  if (teamId) loadTeamById(teamId, true)
}

async function refreshTeam() {
  if (teamData.value?.id) await loadTeamById(teamData.value.id)
}

async function loadTeamFromScenario() {
  const scenario = store.activeScenario
  if (!scenario) return
  teamChars.value = []
  teamBuildIds.value = []
  teamData.value = null
  selectedTeamId.value = ''
  activeCharSlot.value = null
}

async function loadTeamById(teamId: string, clearExisting = false) {
  loadingTeam.value = true
  try {
    const team = await TeamApi.get(teamId)
    teamData.value = team
    selectedTeamId.value = teamId
    const ids: string[] = []
    const bIds: string[] = []
    for (const key of slotKeys) {
      ids.push((team as any)[key] ?? '')
    }
    for (const key of buildSlotKeys) {
      bIds.push((team as any)[key] ?? '')
    }
    const chars = await Promise.all(
      ids.filter(Boolean).map(id => CharacterApi.get(id))
    )
    const charMap = new Map(chars.map(c => [c.id, c]))
    teamChars.value = ids.map(id => id ? (charMap.get(id) ?? null) : null)
    teamBuildIds.value = bIds
    const scenario = store.activeScenario
    if (scenario) {
      if (clearExisting) scenario.data.tracks = []
      scenario.teamId = teamId
    }
    if (clearExisting) history.clear()
    for (const charId of ids) {
      if (charId) {
        store.ensureStateTrackExists(charId)
        store.ensureTrackExists(charId)
        store.ensureBuffTrackExists(charId)
      }
    }
    try { await loadTeamSkills() } catch (e) { console.error('技能加载失败', e) }
    const firstValid = teamChars.value.findIndex(c => c !== null)
    activeCharSlot.value = firstValid >= 0 ? firstValid : null
  } catch { }
  finally { loadingTeam.value = false }
}

async function loadTeamSkills() {
  const raw = await Promise.all([
    WeaponApi.listAll().catch(() => { console.warn('WeaponApi.listAll 失败'); return null }),
    SkillApi.listAll().catch(() => { console.warn('SkillApi.listAll 失败'); return null }),
    SkillActionApi.listAll().catch(() => { console.warn('SkillActionApi.listAll 失败'); return null }),
    SkillLevelApi.listAll().catch(() => { console.warn('SkillLevelApi.listAll 失败'); return null }),
  ])
  const allWeapons = raw[0] || []
  const allSkills = raw[1] || []
  const allActions = raw[2] || []
  const allLevels = raw[3] || []

  console.log('loadTeamSkills: 武器', allWeapons.length, '技能', allSkills.length, '动作', allActions.length, '等级', allLevels.length)

  const wn: Record<string, string> = {}
  for (const w of allWeapons) wn[w.id] = w.name
  teamWeaponNames.value = wn

  const sk: Record<string, Skill[]> = {}
  const sa: Record<string, Record<string, SkillAction>> = {}
  const sl12: Record<string, number> = {}

  for (const c of teamChars.value) {
    if (!c) continue
    const skills = allSkills.filter((s: Skill) => s.characterId === c.id)
    console.log(`角色 ${c.name}(${c.id}): 匹配到 ${skills.length} 个技能`)
    sk[c.id] = skills
    const saMap: Record<string, SkillAction> = {}
    for (const skill of skills) {
      const a = allActions.find((x: SkillAction) => x.skillId === skill.id)
      if (a) saMap[skill.id] = a
    }
    sa[c.id] = saMap
  }
  for (const lv of allLevels) {
    if (lv.level === 12) sl12[lv.skillId] = lv.multiplier
  }
  teamSkills.value = sk
  teamSkillActions.value = sa
  teamSkillLevel12.value = sl12
  console.log('teamSkills keys:', Object.keys(sk), '长度:', Object.values(sk).map(a => a.length))
}

onMounted(async () => {
  try {
    teamList.value = await TeamApi.listAll()
  } catch { }

  if (store.scenarios.length === 0) {
    try {
      const list = await TimelineApi.list(props.teamId)
      if (list.length > 0) {
        const scenarios = list.map(t => ({
          id: t.id!, name: t.name,
          teamId: t.teamId ?? undefined,
          data: {
            tracks: t.tracks ? JSON.parse(t.tracks) : [],
            activeEnemyId: t.activeEnemyId ?? undefined,
            customEnemyParams: t.customEnemyParams ? JSON.parse(t.customEnemyParams) : undefined,
            prepDuration: t.prepDuration ?? undefined,
            enemies: t.enemies ? JSON.parse(t.enemies) : undefined,
            enemyBuffs: t.enemyBuffs ? JSON.parse(t.enemyBuffs) : undefined,
          },
          scenarioConstants: t.systemConstants ? JSON.parse(t.systemConstants) : undefined,
        }))
        store.setScenarios(scenarios)
        for (const sc of scenarios) savedScenarioIds.value.add(sc.id)
      } else if (props.teamId) {
        store.addScenario({ id: uid('sc'), name: '新排轴方案', data: { tracks: [] } })
      }
    } catch {
      if (props.teamId) {
        store.addScenario({ id: uid('sc'), name: '新排轴方案', data: { tracks: [] } })
      }
    }
  }
  if (store.scenarios.length > 0) {
    selectedScenarioId.value = store.activeScenarioId || store.scenarios[0].id
    store.setActiveScenario(selectedScenarioId.value)
    restoreEnemiesFromScenario()
  }
  if (props.teamId) {
    await loadTeamById(props.teamId)
  } else if (store.activeScenario?.teamId) {
    await loadTeamById(store.activeScenario.teamId)
  }
})
</script>

<style scoped>
.timeline-editor {
  display: flex; gap: 8px; height: calc(100vh - 130px);
}
.left-panel {
  flex: 0 0 300px; display: flex; flex-direction: column; gap: 6px; overflow: hidden;
  transition: flex 0.2s, opacity 0.2s;
}
.left-panel.collapsed {
  flex: 0 0 0px; opacity: 0; padding: 0; overflow: hidden;
}
.drop-overlay {
  position: fixed; inset: 0; z-index: 9999;
  background: rgba(64, 158, 255, 0.1); border: 3px dashed #409eff;
  display: flex; align-items: center; justify-content: center;
}
.drop-overlay-text {
  background: #fff; padding: 16px 32px; border-radius: 8px;
  font-size: 16px; color: #409eff; font-weight: 600;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
.left-toggle {
  flex: 0 0 20px; width: 20px; padding: 0; border: 1px solid #e4e7ed; border-radius: 4px 0 0 4px;
  background: #f5f7fa; cursor: pointer; font-size: 10px; color: #909399; display: flex;
  align-items: center; justify-content: center; writing-mode: vertical-lr; user-select: none;
  transition: background 0.15s;
}
.left-toggle:hover { background: #e4e7ed; }
.panel-section {
  background: #fff; border-radius: 6px; border: 1px solid #e4e7ed; padding: 10px 12px;
}
.section-header {
  display: flex; justify-content: space-between; align-items: center; font-weight: 600; font-size: 13px; color: #303133; margin-bottom: 8px;
}
.section-actions { display: flex; gap: 2px; }
.scenario-row { display: flex; gap: 4px; align-items: center; margin-bottom: 6px; }
.action-row { display: flex; gap: 4px; flex-wrap: wrap; }
.card-panel {
  flex: 1; overflow-y: auto;
}
.full-panel {
  flex: 1 1 0; display: flex; flex-direction: column; overflow: hidden;
}
.full-panel :deep(.char-library) { height: 100%; }
.full-panel :deep(.buff-library) { height: 100%; }
.full-panel :deep(.library-tabs) { height: 100%; display: flex; flex-direction: column; }
.full-panel :deep(.library-tabs .el-tabs__content) { flex: 1; overflow: hidden; }
.full-panel :deep(.library-tabs .el-tab-pane) { height: 100%; overflow: hidden; }
.empty-state { color: #909399; font-size: 12px; text-align: center; padding: 16px 0; }
.main-area {
  flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0;
}
.main-scroll {
  flex: 1; display: flex; flex-direction: column; overflow-y: auto; overflow-x: hidden; min-height: 0;
}
.canvas-area {
  flex: none; overflow: visible; min-height: 200px;
}
.bottom-area {
  flex: 1 1 0; display: flex; flex-direction: column;
  background: #fff; border: 1px solid #e4e7ed; border-radius: 6px; overflow: hidden; margin-top: 6px;
  transition: flex 0.35s ease, min-height 0.35s ease;
  min-height: 180px;
  max-height: 40vh;
}
.collapsed.bottom-area {
  flex: 0 0 auto;
  min-height: 0;
  max-height: none;
}
.bottom-wrap {
  flex: 1;
  overflow: hidden;
  transition: max-height 0.35s ease;
  max-height: calc(40vh - 41px);
}
.collapsed .bottom-wrap {
  max-height: 0;
}
.bottom-toolbar {
  display: flex; align-items: center; gap: 8px; padding: 6px 12px;
  border-bottom: 1px solid #e4e7ed; background: #fafafa;
}
.bottom-content {
  overflow-y: auto; padding: 8px 12px;
}
</style>
