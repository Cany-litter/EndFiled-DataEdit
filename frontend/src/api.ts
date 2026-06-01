import axios from 'axios'

/** Axios instance targeting the Spring Boot backend at `/api/v1/` */
const api = axios.create({ baseURL: 'http://localhost:8080/api/v1' })

/** Generic paginated response wrapper matching backend PageResult */
export interface PageResult<T> {
  items: T[]
  total: number
  page: number
  size: number
  pages: number
}

/** Unwraps the backend's `Result.data` so callers receive the entity directly */
api.interceptors.response.use(
  res => { res.data = res.data?.data; return res },
  err => Promise.reject(err)
)

/** Character entity — base stats, attributes, profession, element, voice actors */
export interface Character {
  id: string; name: string; icon?: string; rarity: number; level: number;
  baseHp: number; baseAtk: number; baseStr: number; baseAgi: number;
  baseInt: number; baseWil: number; mainAttr: string; subAttr: string;
  profession: string; element: string; weaponType: string;
  potential: number;
  englishName?: string; description?: string; specialty?: string;
  vaJp?: string; vaEn?: string; vaCn?: string; vaKr?: string;
  faction?: string; race?: string;
  specialties?: string; hobbies?: string; charBattleTags?: string;
}

/** Weapon entity — base atk, rarity, type, 3 affixes with potential levels */
export interface Weapon {
  id: string; name: string; icon?: string; rarity: number; potential: number;
  type: string; level: number; baseAtk: number;
  affix1Name?: string; affix1Type?: string; affix1Size?: string; affix1Level?: number; affix1Value?: number;
  affix2Name?: string; affix2Type?: string; affix2Size?: string; affix2Level?: number; affix2Value?: number;
  affix3Name?: string; affix3Type?: string; affix3Level?: number;
  affix3Effect1?: string; affix3Effect2?: string; affix3Effect3?: string; affix3Desc?: string;
  description?: string; lore?: string; sortOrder?: number;
}

export interface Equipment {
  id: string; name: string; icon?: string; slot: string; level: number; baseDef: number;
  setName?: string;
  attr1Type?: string; attr1Refine?: number; attr1Value?: number;
  attr1V1?: number; attr1V2?: number; attr1V3?: number;
  attr2Type?: string; attr2Refine?: number; attr2Value?: number;
  attr2V1?: number; attr2V2?: number; attr2V3?: number;
  attr3Type?: string; attr3Refine?: number; attr3Value?: number;
  attr3V1?: number; attr3V2?: number; attr3V3?: number;
  setEffect1Name?: string; setEffect1Type?: string; setEffect1Etype?: string;
  setEffect1Value?: number; setEffect1Desc?: string;
  setEffect2Name?: string; setEffect2Type?: string; setEffect2Etype?: string;
  setEffect2Value?: number; setEffect2Condition?: string;
  setEffect2Duration?: number; setEffect2Desc?: string;
}

/** Skill entity — links a character to a skill with type and damage type */
export interface Skill {
  id: string; characterId: string; name: string; type: string;
  damageType: string; description?: string;
}

export interface SkillLevel {
  skillId: string; level: number; multiplier: number;
}

export interface SkillAction {
  skillId: string; castTime?: number; preCast?: number; postCast?: number;
  techCost?: number; techReturn?: number; techRegen?: number;
  chainCd?: number; ultimateCd?: number;
  energyRegenSelf?: number; energyRegenCond?: string;
  applyAttachment?: string; applyBreak?: number;
  consumeAttachment?: string; consumeBreak?: number;
  chainTrigger?: string;
  duration?: number; spCost?: number; gaugeGain?: number;
  teamGaugeGain?: number; cooldown?: number;
  allowedTypes?: string; ultimateGaugeMax?: number;
  ultimateGaugeReply?: number; damageTicks?: string;
}

/** Build/loadout — character + weapon + 4 equipment slots + selected gains */
export interface Build {
  id?: string; name: string; characterId: string;
  weaponId?: string; armorId?: string; gloveId?: string;
  accessory1Id?: string; accessory2Id?: string;
  charLevel?: number; weaponLevel?: number; equipLevel?: number;
  charPotential?: number; weaponPotential?: number;
  affix1Level?: number; affix2Level?: number; affix3Level?: number;
  equipRefines?: string; selectedGains?: string;
  reserve1?: string;
}

/** Gain/buff entity — category, effect value, stacking rules, target scope */
export interface Gain {
  id: string; name: string; source?: string; gainType: string;
  effectCategory?: string; effectType?: string; effectValue?: number;
  valueType?: string; stackRule?: string; targetScope?: string;
  targetCharId?: string; triggerCondition?: string;
  duration?: number; maxStacks?: number;
  sourceType?: string; sourceRefId?: string;
}

/** Character CRUD + sub-table queries (archives, voices, potentials, promotions, logistics, profiles) */
export const CharacterApi = {
  listAll: () => api.get('/characters/all').then(r => r.data as Character[]),
  list: (name?: string) => api.get('/characters', { params: { name } }).then(r => (r.data as PageResult<Character>).items),
  get: (id: string) => api.get(`/characters/${id}`).then(r => r.data as Character),
  save: (c: Character) => c.id ? api.put(`/characters/${c.id}`, c) : api.post('/characters', c),
  delete: (id: string) => api.delete(`/characters/${id}`),
  archives: (id: string) => api.get(`/characters/${id}/archives`).then(r => r.data as CharacterArchive[]),
  voices: (id: string) => api.get(`/characters/${id}/voices`).then(r => r.data as CharacterVoice[]),
  potentials: (id: string) => api.get(`/characters/${id}/potentials`).then(r => r.data as CharacterPotential[]),
  promotions: (id: string) => api.get(`/characters/${id}/promotions`).then(r => r.data as CharacterPromotion[]),
  logistics: (id: string) => api.get(`/characters/${id}/logistics`).then(r => r.data as CharacterLogistics[]),
  profiles: (id: string) => api.get(`/characters/${id}/profiles`).then(r => r.data as CharacterProfile[]),
}

/** Weapon CRUD + sub-table queries (level-costs, ascensions) */
export const WeaponApi = {
  listAll: () => api.get('/weapons/all').then(r => r.data as Weapon[]),
  list: (params?: { name?: string; type?: string }) => api.get('/weapons', { params }).then(r => (r.data as PageResult<Weapon>).items),
  get: (id: string) => api.get(`/weapons/${id}`).then(r => r.data as Weapon),
  save: (w: Weapon) => w.id ? api.put(`/weapons/${w.id}`, w) : api.post('/weapons', w),
  delete: (id: string) => api.delete(`/weapons/${id}`),
  levelCosts: (id: string) => api.get(`/weapons/${id}/level-costs`).then(r => r.data as WeaponLevelCost[]),
  ascensions: (id: string) => api.get(`/weapons/${id}/ascensions`).then(r => r.data as WeaponAscension[]),
}

export const EquipmentApi = {
  listAll: () => api.get('/equipment/all').then(r => r.data as Equipment[]),
  list: (params?: { setName?: string; slot?: string }) => api.get('/equipment', { params }).then(r => (r.data as PageResult<Equipment>).items),
  get: (id: string) => api.get(`/equipment/${id}`).then(r => r.data as Equipment),
  save: (e: Equipment) => e.id ? api.put(`/equipment/${e.id}`, e) : api.post('/equipment', e),
  delete: (id: string) => api.delete(`/equipment/${id}`),
}

export const SkillApi = {
  listAll: () => api.get('/skills/all').then(r => r.data as Skill[]),
  list: (characterId?: string) => api.get('/skills', { params: { characterId } }).then(r => (r.data as PageResult<Skill>).items),
  get: (id: string) => api.get(`/skills/${id}`).then(r => r.data as Skill),
  save: (s: Skill) => s.id ? api.put(`/skills/${s.id}`, s) : api.post('/skills', s),
  delete: (id: string) => api.delete(`/skills/${id}`),
}

export const SkillLevelApi = {
  listAll: () => api.get('/skill-levels/all').then(r => r.data as SkillLevel[]),
  list: (skillId?: string) => api.get('/skill-levels', { params: { skillId } }).then(r => (r.data as PageResult<SkillLevel>).items),
  save: (l: SkillLevel) => api.post('/skill-levels', l),
  update: (l: SkillLevel) => api.put('/skill-levels', l),
  delete: (skillId: string, level: number) => api.delete(`/skill-levels/${skillId}/${level}`),
}

/** Build/loadout CRUD */
export const BuildApi = {
  listAll: () => api.get('/builds/all').then(r => r.data as Build[]),
  list: (characterId?: string) => api.get('/builds', { params: { characterId } }).then(r => (r.data as PageResult<Build>).items),
  get: (id: string) => api.get(`/builds/${id}`).then(r => r.data as Build),
  save: (b: Build) => b.id ? api.put(`/builds/${b.id}`, b) : api.post('/builds', b),
  delete: (id: string) => api.delete(`/builds/${id}`),
}

/** Team entity — 4 character slots each with a build */
export interface Team {
  id?: string; name: string;
  charAId?: string; buildAId?: string;
  charBId?: string; buildBId?: string;
  charCId?: string; buildCId?: string;
  charDId?: string; buildDId?: string;
}

/** Skill action parameters (cast time, costs, gauge gain, damage ticks) */
export const SkillActionApi = {
  listAll: () => api.get('/skill-actions/all').then(r => r.data as SkillAction[]),
  list: (skillId?: string) => api.get('/skill-actions', { params: { skillId } }).then(r => (r.data as PageResult<SkillAction>).items),
  get: (skillId: string) => api.get(`/skill-actions/${skillId}`).then(r => r.data as SkillAction),
  save: (a: SkillAction) => api.post('/skill-actions', a),
  update: (a: SkillAction) => api.put('/skill-actions', a),
}

/** Team CRUD */
export const TeamApi = {
  listAll: () => api.get('/teams/all').then(r => r.data as Team[]),
  list: () => api.get('/teams').then(r => (r.data as PageResult<Team>).items),
  get: (id: string) => api.get(`/teams/${id}`).then(r => r.data as Team),
  save: (t: Team) => t.id ? api.put(`/teams/${t.id}`, t) : api.post('/teams', t),
  delete: (id: string) => api.delete(`/teams/${id}`),
}

export interface CharacterStat {
  characterId: string; level: number;
  hp: number; atk: number; str: number; agi: number; int: number; wil: number;
  physDmgCoeff?: number; magicDmgCoeff?: number;
}

export interface WeaponStat {
  weaponId: string; level: number; baseAtk: number;
}

export interface WeaponAffix {
  weaponId: string; affixIndex: number; potential: number;
  name?: string; type?: string; size?: string; value?: number;
  effect1?: string; effect2?: string; effect3?: string;
}

export interface CharacterTalent {
  id: string; characterId: string; name: string;
  talentIndex: number; stage: number; description?: string; values?: string;
}

export interface SkillCost {
  skillId: string; level: number;
  costValue?: number; techRegen?: number; techReturn?: number; coolDown?: number; usp?: number; poise?: number;
}

export const CharacterStatApi = {
  listAll: () => api.get('/character-stats/all').then(r => r.data as CharacterStat[]),
  list: (characterId?: string) => api.get('/character-stats', { params: { characterId } }).then(r => (r.data as PageResult<CharacterStat>).items),
  save: (s: CharacterStat) => api.post('/character-stats', s),
}

export const WeaponStatApi = {
  listAll: () => api.get('/weapon-stats/all').then(r => r.data as WeaponStat[]),
  list: (weaponId?: string) => api.get('/weapon-stats', { params: { weaponId } }).then(r => (r.data as PageResult<WeaponStat>).items),
  save: (s: WeaponStat) => api.post('/weapon-stats', s),
}

export const WeaponAffixApi = {
  listAll: () => api.get('/weapon-affixes/all').then(r => r.data as WeaponAffix[]),
  list: (weaponId?: string) => api.get('/weapon-affixes', { params: { weaponId } }).then(r => (r.data as PageResult<WeaponAffix>).items),
  save: (a: WeaponAffix) => api.post('/weapon-affixes', a),
}

export const CharacterTalentApi = {
  listAll: () => api.get('/character-talents/all').then(r => r.data as CharacterTalent[]),
  list: (characterId?: string) => api.get('/character-talents', { params: { characterId } }).then(r => (r.data as PageResult<CharacterTalent>).items),
  save: (t: CharacterTalent) => t.id ? api.put(`/character-talents/${t.id}`, t) : api.post('/character-talents', t),
  delete: (id: string) => api.delete(`/character-talents/${id}`),
}

export const SkillCostApi = {
  listAll: () => api.get('/skill-costs/all').then(r => r.data as SkillCost[]),
  list: (skillId?: string) => api.get('/skill-costs', { params: { skillId } }).then(r => (r.data as PageResult<SkillCost>).items),
  save: (c: SkillCost) => api.post('/skill-costs', c),
  update: (c: SkillCost) => api.put('/skill-costs', c),
  delete: (skillId: string, level: number) => api.delete(`/skill-costs/${skillId}/${level}`),
}

/** Gain/buff CRUD */
export const GainApi = {
  listAll: (params?: Record<string, string>) => api.get('/gains/all', { params }).then(r => r.data as Gain[]),
  list: (params?: Record<string, string>) => api.get('/gains', { params }).then(r => (r.data as PageResult<Gain>).items),
  save: (g: Gain) => g.id ? api.put(`/gains/${g.id}`, g) : api.post('/gains', g),
  delete: (id: string) => api.delete(`/gains/${id}`),
}

/** Timeline scenario — tracks JSON, enemy config, system constants (stored as JSON strings) */
export interface TimelineScenario {
  id?: string
  name: string
  teamId?: string
  systemConstants?: string
  prepDuration?: number
  activeEnemyId?: string
  customEnemyParams?: string
  tracks?: string
  enemies?: string
  enemyBuffs?: string
  reserve2?: string
  reserve3?: string
  reserve4?: string
  sortOrder?: number
  createdAt?: string
  updatedAt?: string
}

/** Timeline scenario CRUD */
export const TimelineApi = {
  listAll: () => api.get('/timelines/all').then(r => r.data as TimelineScenario[]),
  list: (teamId?: string) => api.get('/timelines', { params: teamId ? { teamId } : {} }).then(r => (r.data as PageResult<TimelineScenario>).items),
  get: (id: string) => api.get(`/timelines/${id}`).then(r => r.data as TimelineScenario),
  save: (t: TimelineScenario) => t.id ? api.put(`/timelines/${t.id}`, t) : api.post('/timelines', t),
  delete: (id: string) => api.delete(`/timelines/${id}`),
}

/** Enemy entity — stagger/break parameters for damage simulation */
export interface Enemy {
  id: string; name: string; category?: string; tier?: string;
  maxStagger?: number; staggerNodeCount?: number;
  staggerNodeDuration?: number; staggerBreakDuration?: number;
  executionRecovery?: number;
  description?: string;
  critRate?: number; critDamage?: number;
  attackRange?: number; weight?: number;
  executionAtkMult?: number;
  physicalResist?: string; burnResist?: string;
  electroResist?: string; coldResist?: string; natureResist?: string;
  traits?: string;
}

export interface EnemyStat {
  enemyId: string; level: number;
  hp: number; atk: number; def: number;
}

/** Enemy CRUD */
export const EnemyApi = {
  listAll: () => api.get('/enemies/all').then(r => r.data as Enemy[]),
  list: (params?: { name?: string; category?: string }) => api.get('/enemies', { params }).then(r => (r.data as PageResult<Enemy>).items),
  get: (id: string) => api.get(`/enemies/${id}`).then(r => r.data as Enemy),
  save: (e: Enemy) => e.id ? api.put(`/enemies/${e.id}`, e) : api.post('/enemies', e),
  delete: (id: string) => api.delete(`/enemies/${id}`),
  stats: (id: string) => api.get(`/enemies/${id}/stats`).then(r => r.data as EnemyStat[]),
}

export const EnemyStatApi = {
  listAll: () => api.get('/enemy-stats/all').then(r => r.data as EnemyStat[]),
  list: (enemyId?: string) => api.get('/enemy-stats', { params: { enemyId } }).then(r => (r.data as PageResult<EnemyStat>).items),
}

export interface ModifierDef {
  id: string; label: string; unit?: string;
}

/** Modifier definition (modifier labels/units for weapon/equipment templates) */
export const ModifierDefApi = {
  listAll: () => api.get('/modifier-defs/all').then(r => r.data as ModifierDef[]),
  list: (label?: string) => api.get('/modifier-defs', { params: { label } }).then(r => (r.data as PageResult<ModifierDef>).items),
  get: (id: string) => api.get(`/modifier-defs/${id}`).then(r => r.data as ModifierDef),
  save: (m: ModifierDef) => m.id ? api.put(`/modifier-defs/${m.id}`, m) : api.post('/modifier-defs', m),
  delete: (id: string) => api.delete(`/modifier-defs/${id}`),
}

export interface SkillDamageTick {
  skillId: string; tickIndex: number;
  offset: number; stagger?: number; sp?: number; boundEffects?: string;
}

export const SkillDamageTickApi = {
  listAll: () => api.get('/skill-damage-ticks/all').then(r => r.data as SkillDamageTick[]),
  list: (skillId?: string) => api.get('/skill-damage-ticks', { params: { skillId } }).then(r => (r.data as PageResult<SkillDamageTick>).items),
  save: (t: SkillDamageTick) => api.post('/skill-damage-ticks', t),
  update: (t: SkillDamageTick) => api.put('/skill-damage-ticks', t),
  delete: (skillId: string, tickIndex: number) => api.delete(`/skill-damage-ticks/${skillId}/${tickIndex}`),
}

export interface SkillAnomaly {
  skillId: string; anomalyIndex: number;
  groupIndex: number; type: string; stacks?: number;
  duration?: number; offset?: number; delay?: number;
}

export const SkillAnomalyApi = {
  listAll: () => api.get('/skill-anomalies/all').then(r => r.data as SkillAnomaly[]),
  list: (skillId?: string) => api.get('/skill-anomalies', { params: { skillId } }).then(r => (r.data as PageResult<SkillAnomaly>).items),
  save: (a: SkillAnomaly) => api.post('/skill-anomalies', a),
  update: (a: SkillAnomaly) => api.put('/skill-anomalies', a),
  delete: (skillId: string, anomalyIndex: number) => api.delete(`/skill-anomalies/${skillId}/${anomalyIndex}`),
}

export interface AttackSegment {
  characterId: string; segmentIndex: number;
  duration: number; gaugeGain?: number; allowedTypes?: string;
}

export const AttackSegmentApi = {
  listAll: () => api.get('/attack-segments/all').then(r => r.data as AttackSegment[]),
  list: (characterId?: string) => api.get('/attack-segments', { params: { characterId } }).then(r => (r.data as PageResult<AttackSegment>).items),
  save: (s: AttackSegment) => api.post('/attack-segments', s),
  update: (s: AttackSegment) => api.put('/attack-segments', s),
  delete: (characterId: string, segmentIndex: number) => api.delete(`/attack-segments/${characterId}/${segmentIndex}`),
}

export interface AttackSegmentTick {
  characterId: string; segmentIndex: number; tickIndex: number;
  offset: number; stagger?: number; sp?: number;
}

export const AttackSegmentTickApi = {
  listAll: () => api.get('/attack-segment-ticks/all').then(r => r.data as AttackSegmentTick[]),
  list: (characterId?: string, segmentIndex?: number) => api.get('/attack-segment-ticks', { params: { characterId, segmentIndex } }).then(r => (r.data as PageResult<AttackSegmentTick>).items),
  save: (t: AttackSegmentTick) => api.post('/attack-segment-ticks', t),
  update: (t: AttackSegmentTick) => api.put('/attack-segment-ticks', t),
  delete: (characterId: string, segmentIndex: number, tickIndex: number) => api.delete(`/attack-segment-ticks/${characterId}/${segmentIndex}/${tickIndex}`),
}

// ========== Huafalin Wiki imported data ==========

export interface CharacterArchive {
  id: string; characterId: string; archiveIndex: number;
  title?: string; content: string;
}

export interface CharacterVoice {
  id: string; characterId: string; category: string;
  language?: string; text: string;
}

export interface CharacterPotential {
  id: string; characterId: string; potentialIndex: number;
  name?: string; effect?: string;
}

export interface CharacterPromotion {
  id: string; characterId: string; eliteStage: number; levelCap: number;
  material1Id?: string; material1Count?: number;
  material2Id?: string; material2Count?: number;
  material3Id?: string; material3Count?: number;
  goldCost?: number;
}

export interface CharacterLogistics {
  id: string; characterId: string; name?: string;
  unlockStage?: number; description?: string;
}

export interface CharacterProfile {
  id: string; characterId: string; profileType: string;
  label?: string; description?: string;
}

export interface WeaponLevelCost {
  weaponId: string; level: number;
  expCost?: number; goldCost?: number;
}

export interface WeaponAscension {
  id: string; weaponId: string; phase: number; levelRequired: number;
  material1Id?: string; material1Count?: number;
  material2Id?: string; material2Count?: number;
  material3Id?: string; material3Count?: number;
  goldCost?: number;
}

export interface WeaponSkill {
  id: string; weaponId: string; skillName: string; skillIndex: number;
  rankCurrent?: number; rankMax?: number;
}

export interface WeaponSkillRank {
  id: string; weaponSkillId: string; rankLevel: number;
  valueDesc?: string;
}

export interface EquipmentSet {
  id: string; name: string; pieceCount?: number; setEffectDesc?: string;
}

export interface CharacterSkillMaterial {
  id: string; characterId: string; skillType: string; level: number;
  material1Id?: string; material1Count?: number;
  material2Id?: string; material2Count?: number;
  goldCost?: number;
}

export interface CharacterRecommendedWeapon {
  id: string; characterId: string; weaponId?: string;
  weaponName?: string; recommendType: string;
}

export const CharacterArchiveApi = {
  listAll: () => api.get('/character-archives/all').then(r => r.data as CharacterArchive[]),
  list: (characterId?: string) => api.get('/character-archives', { params: { characterId } }).then(r => (r.data as PageResult<CharacterArchive>).items),
  save: (a: CharacterArchive) => a.id ? api.put(`/character-archives/${a.id}`, a) : api.post('/character-archives', a),
  delete: (id: string) => api.delete(`/character-archives/${id}`),
}

export const CharacterVoiceApi = {
  listAll: () => api.get('/character-voices/all').then(r => r.data as CharacterVoice[]),
  list: (characterId?: string, language?: string) => api.get('/character-voices', { params: { characterId, language } }).then(r => (r.data as PageResult<CharacterVoice>).items),
  save: (v: CharacterVoice) => v.id ? api.put(`/character-voices/${v.id}`, v) : api.post('/character-voices', v),
  delete: (id: string) => api.delete(`/character-voices/${id}`),
}

export const CharacterPotentialApi = {
  listAll: () => api.get('/character-potentials/all').then(r => r.data as CharacterPotential[]),
  list: (characterId?: string) => api.get('/character-potentials', { params: { characterId } }).then(r => (r.data as PageResult<CharacterPotential>).items),
  save: (p: CharacterPotential) => p.id ? api.put(`/character-potentials/${p.id}`, p) : api.post('/character-potentials', p),
  delete: (id: string) => api.delete(`/character-potentials/${id}`),
}

export const CharacterPromotionApi = {
  listAll: () => api.get('/character-promotions/all').then(r => r.data as CharacterPromotion[]),
  list: (characterId?: string) => api.get('/character-promotions', { params: { characterId } }).then(r => (r.data as PageResult<CharacterPromotion>).items),
  save: (p: CharacterPromotion) => p.id ? api.put(`/character-promotions/${p.id}`, p) : api.post('/character-promotions', p),
  delete: (id: string) => api.delete(`/character-promotions/${id}`),
}

export const CharacterLogisticsApi = {
  listAll: () => api.get('/character-logistics/all').then(r => r.data as CharacterLogistics[]),
  list: (characterId?: string) => api.get('/character-logistics', { params: { characterId } }).then(r => (r.data as PageResult<CharacterLogistics>).items),
  save: (l: CharacterLogistics) => l.id ? api.put(`/character-logistics/${l.id}`, l) : api.post('/character-logistics', l),
  delete: (id: string) => api.delete(`/character-logistics/${id}`),
}

export const CharacterProfileApi = {
  listAll: () => api.get('/character-profiles/all').then(r => r.data as CharacterProfile[]),
  list: (characterId?: string) => api.get('/character-profiles', { params: { characterId } }).then(r => (r.data as PageResult<CharacterProfile>).items),
  save: (p: CharacterProfile) => p.id ? api.put(`/character-profiles/${p.id}`, p) : api.post('/character-profiles', p),
  delete: (id: string) => api.delete(`/character-profiles/${id}`),
}

export const WeaponLevelCostApi = {
  listAll: () => api.get('/weapon-level-costs/all').then(r => r.data as WeaponLevelCost[]),
  list: (weaponId?: string) => api.get('/weapon-level-costs', { params: { weaponId } }).then(r => (r.data as PageResult<WeaponLevelCost>).items),
  save: (c: WeaponLevelCost) => api.post('/weapon-level-costs', c),
  delete: (weaponId: string, level: number) => api.delete(`/weapon-level-costs/${weaponId}/${level}`),
}

export const WeaponAscensionApi = {
  listAll: () => api.get('/weapon-ascensions/all').then(r => r.data as WeaponAscension[]),
  list: (weaponId?: string) => api.get('/weapon-ascensions', { params: { weaponId } }).then(r => (r.data as PageResult<WeaponAscension>).items),
  save: (a: WeaponAscension) => a.id ? api.put(`/weapon-ascensions/${a.id}`, a) : api.post('/weapon-ascensions', a),
  delete: (id: string) => api.delete(`/weapon-ascensions/${id}`),
}

export const EquipmentSetApi = {
  listAll: () => api.get('/equipment-sets/all').then(r => r.data as EquipmentSet[]),
  list: (name?: string) => api.get('/equipment-sets', { params: { name } }).then(r => (r.data as PageResult<EquipmentSet>).items),
  save: (e: EquipmentSet) => e.id ? api.put(`/equipment-sets/${e.id}`, e) : api.post('/equipment-sets', e),
  delete: (id: string) => api.delete(`/equipment-sets/${id}`),
}

export const WeaponSkillApi = {
  listAll: () => api.get('/weapon-skills/all').then(r => r.data as WeaponSkill[]),
  list: (weaponId?: string) => api.get('/weapon-skills', { params: { weaponId } }).then(r => (r.data as PageResult<WeaponSkill>).items),
  save: (s: WeaponSkill) => s.id ? api.put(`/weapon-skills/${s.id}`, s) : api.post('/weapon-skills', s),
  delete: (id: string) => api.delete(`/weapon-skills/${id}`),
}

export const WeaponSkillRankApi = {
  listAll: () => api.get('/weapon-skill-ranks/all').then(r => r.data as WeaponSkillRank[]),
  list: (weaponSkillId?: string) => api.get('/weapon-skill-ranks', { params: { weaponSkillId } }).then(r => (r.data as PageResult<WeaponSkillRank>).items),
  save: (r: WeaponSkillRank) => r.id ? api.put(`/weapon-skill-ranks/${r.id}`, r) : api.post('/weapon-skill-ranks', r),
  delete: (id: string) => api.delete(`/weapon-skill-ranks/${id}`),
}

export const CharacterSkillMaterialApi = {
  listAll: () => api.get('/character-skill-materials/all').then(r => r.data as CharacterSkillMaterial[]),
  list: (characterId?: string) => api.get('/character-skill-materials', { params: { characterId } }).then(r => (r.data as PageResult<CharacterSkillMaterial>).items),
  save: (m: CharacterSkillMaterial) => m.id ? api.put(`/character-skill-materials/${m.id}`, m) : api.post('/character-skill-materials', m),
  delete: (id: string) => api.delete(`/character-skill-materials/${id}`),
}

export const CharacterRecommendedWeaponApi = {
  listAll: () => api.get('/character-recommended-weapons/all').then(r => r.data as CharacterRecommendedWeapon[]),
  list: (characterId?: string) => api.get('/character-recommended-weapons', { params: { characterId } }).then(r => (r.data as PageResult<CharacterRecommendedWeapon>).items),
}

export default api
