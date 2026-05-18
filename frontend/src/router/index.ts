import { createRouter, createWebHistory } from 'vue-router'
import CharacterList from '../views/DataManage/CharacterList.vue'
import WeaponList from '../views/DataManage/WeaponList.vue'
import EquipmentList from '../views/DataManage/EquipmentList.vue'
import GainList from '../views/DataManage/GainList.vue'
import SkillList from '../views/DataManage/SkillList.vue'
import BuildList from '../views/LoadoutEditor/LoadoutList.vue'
import LoadoutEditor from '../views/LoadoutEditor/LoadoutEditor.vue'
import TeamList from '../views/TeamBuilder/TeamList.vue'
import TeamDetail from '../views/TeamBuilder/TeamDetail.vue'
import TimelineEditor from '../views/Simulator/TimelineEditor.vue'
import TeamSimulator from '../views/Simulator/TeamSimulator.vue'

const routes = [
  { path: '/', redirect: '/characters' },
  { path: '/characters', name: 'CharacterList', component: CharacterList },
  { path: '/weapons', name: 'WeaponList', component: WeaponList },
  { path: '/equipment', name: 'EquipmentList', component: EquipmentList },
  { path: '/gains', name: 'GainList', component: GainList },
  { path: '/skills', name: 'SkillList', component: SkillList },
  { path: '/builds', name: 'BuildList', component: BuildList },
  { path: '/loadout', name: 'LoadoutEditor', component: LoadoutEditor },
  { path: '/loadout/:id', name: 'LoadoutEditorEdit', component: LoadoutEditor },
  { path: '/teams', name: 'TeamList', component: TeamList },
  { path: '/team/:id', name: 'TeamDetail', component: TeamDetail },
  { path: '/simulator', name: 'TimelineEditor', component: TimelineEditor },
  { path: '/team-sim', name: 'TeamSimulator', component: TeamSimulator },
]

export default createRouter({ history: createWebHistory(), routes })
