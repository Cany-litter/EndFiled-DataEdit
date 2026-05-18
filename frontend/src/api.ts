import axios from 'axios'

const api = axios.create({ baseURL: 'http://localhost:8080/api' })

export interface Character {
  id: string; name: string; icon?: string; rarity: number; level: number;
  baseHp: number; baseAtk: number; baseStr: number; baseAgi: number;
  baseInt: number; baseWil: number; mainAttr: string; subAttr: string;
  profession: string; element: string; weaponType: string;
  potential: number; trustTalent: number;
}

export interface Weapon {
  id: string; name: string; icon?: string; rarity: number; potential: number;
  type: string; level: number; baseAtk: number;
  affix1Name?: string; affix1Type?: string; affix1Size?: string; affix1Level?: number; affix1Value?: number;
  affix2Name?: string; affix2Type?: string; affix2Size?: string; affix2Level?: number; affix2Value?: number;
  affix3Name?: string; affix3Type?: string;
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
  setEffect1Name?: string; setEffect1Value?: number;
  setEffect2Name?: string; setEffect2Value?: number;
}

export interface Skill {
  id: string; characterId: string; name: string; type: string;
  damageType: string; description?: string;
}

export interface SkillLevel {
  skillId: string; level: number; multiplier: number;
}

export interface Build {
  id?: string; name: string; characterId: string;
  weaponId?: string; armorId?: string; gloveId?: string;
  accessory1Id?: string; accessory2Id?: string;
  charLevel?: number; weaponLevel?: number; equipLevel?: number;
}

export const CharacterApi = {
  list: (name?: string) => api.get('/characters', { params: { name } }).then(r => r.data as Character[]),
  get: (id: string) => api.get(`/characters/${id}`).then(r => r.data as Character),
}

export const WeaponApi = {
  list: (params?: { name?: string; type?: string }) => api.get('/weapons', { params }).then(r => r.data as Weapon[]),
  get: (id: string) => api.get(`/weapons/${id}`).then(r => r.data as Weapon),
}

export const EquipmentApi = {
  list: (params?: { setName?: string; slot?: string }) => api.get('/equipment', { params }).then(r => r.data as Equipment[]),
  get: (id: string) => api.get(`/equipment/${id}`).then(r => r.data as Equipment),
}

export const SkillApi = {
  list: (characterId?: string) => api.get('/skills', { params: { characterId } }).then(r => r.data as Skill[]),
}

export const SkillLevelApi = {
  list: (skillId?: string) => api.get('/skill-levels', { params: { skillId } }).then(r => r.data as SkillLevel[]),
}

export const BuildApi = {
  list: (characterId?: string) => api.get('/builds', { params: { characterId } }).then(r => r.data as Build[]),
  get: (id: string) => api.get(`/builds/${id}`).then(r => r.data as Build),
  save: (b: Build) => b.id ? api.put(`/builds/${b.id}`, b) : api.post('/builds', b),
  delete: (id: string) => api.delete(`/builds/${id}`),
}

export interface Team {
  id?: string; name: string;
  charAId?: string; buildAId?: string;
  charBId?: string; buildBId?: string;
  charCId?: string; buildCId?: string;
  charDId?: string; buildDId?: string;
}

export const TeamApi = {
  list: () => api.get('/teams').then(r => r.data as Team[]),
  get: (id: string) => api.get(`/teams/${id}`).then(r => r.data as Team),
  save: (t: Team) => t.id ? api.put(`/teams/${t.id}`, t) : api.post('/teams', t),
  delete: (id: string) => api.delete(`/teams/${id}`),
}

export default api
