import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import CharacterList from '../views/DataManage/CharacterList.vue'
import WeaponList from '../views/DataManage/WeaponList.vue'
import EquipmentList from '../views/DataManage/EquipmentList.vue'
import GainList from '../views/DataManage/GainList.vue'
import SkillList from '../views/DataManage/SkillList.vue'
import EnemyList from '../views/DataManage/EnemyList.vue'
import BuildList from '../views/LoadoutEditor/LoadoutList.vue'
import LoadoutEditor from '../views/LoadoutEditor/LoadoutEditor.vue'
import TeamList from '../views/TeamBuilder/TeamList.vue'
import TeamDetail from '../views/TeamBuilder/TeamDetail.vue'
import TimelineEditor from '../views/TimelineEditor/TimelineEditor.vue'
import DpsSimulator from '../views/Simulator/DpsSimulator.vue'

const routes = [
  { path: '/', name: 'Dashboard', component: Dashboard, meta: { title: '仪表盘' } },
  { path: '/characters', name: 'CharacterList', component: CharacterList, meta: { title: '角色管理' } },
  { path: '/weapons', name: 'WeaponList', component: WeaponList, meta: { title: '武器管理' } },
  { path: '/equipment', name: 'EquipmentList', component: EquipmentList, meta: { title: '装备管理' } },
  { path: '/gains', name: 'GainList', component: GainList, meta: { title: '增益管理' } },
  { path: '/skills', name: 'SkillList', component: SkillList, meta: { title: '技能管理' } },
  { path: '/enemies', name: 'EnemyList', component: EnemyList, meta: { title: '敌人管理' } },
  { path: '/builds', name: 'BuildList', component: BuildList, meta: { title: '配装方案' } },
  { path: '/loadout', name: 'LoadoutEditor', component: LoadoutEditor, meta: { title: '配装编辑器' } },
  { path: '/loadout/:id', name: 'LoadoutEditorEdit', component: LoadoutEditor, meta: { title: '配装编辑器' } },
  { path: '/teams', name: 'TeamList', component: TeamList, meta: { title: '配队管理' } },
  { path: '/team/:id', name: 'TeamDetail', component: TeamDetail, meta: { title: '配队详情' } },
  { path: '/timeline', name: 'TimelineEditor', component: TimelineEditor, meta: { title: '排轴模拟' }, props: route => ({ teamId: route.query.teamId as string }) },
  { path: '/damage', name: 'DpsSimulator', component: DpsSimulator, meta: { title: '排轴伤害' } },
]

export default createRouter({ history: createWebHistory(), routes })
