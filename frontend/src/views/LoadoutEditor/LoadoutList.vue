<template>
  <div>
    <el-card>
      <div style="margin-bottom: 15px">
        <el-button type="primary" @click="goCreate">新建配装方案</el-button>
        <el-button @click="exportAll">导出所有方案</el-button>
      </div>
      <el-table :data="list" border stripe v-loading="loading" style="width:100%" max-height="calc(100vh - 180px)" header-row-class-name="fixed-header">
        <el-table-column type="index" label="序号" width="50" fixed="left" />
        <el-table-column prop="name" label="方案名称" min-width="140" fixed="left" show-overflow-tooltip />
        <el-table-column label="角色" min-width="80">
          <template #default="{ row }">{{ charName(row.characterId) }}</template>
        </el-table-column>
        <el-table-column label="角色等级" min-width="80">
          <template #default="{ row }">{{ row.charLevel ?? '-' }}</template>
        </el-table-column>
        <el-table-column label="角色潜能" min-width="80">
          <template #default="{ row }">{{ row.charPotential ?? '-' }}</template>
        </el-table-column>
        <el-table-column label="武器" min-width="80">
          <template #default="{ row }">{{ weaponName(row.weaponId) }}</template>
        </el-table-column>
        <el-table-column label="武器等级" min-width="80">
          <template #default="{ row }">{{ row.weaponLevel ?? '-' }}</template>
        </el-table-column>
        <el-table-column label="武器潜能" min-width="80">
          <template #default="{ row }">{{ row.weaponPotential ?? '-' }}</template>
        </el-table-column>
        <el-table-column label="护甲" min-width="160">
          <template #default="{ row }">{{ equipName(row.armorId) }} {{ refineText(row, 'armor') }}</template>
        </el-table-column>
        <el-table-column label="护手" min-width="160">
          <template #default="{ row }">{{ equipName(row.gloveId) }} {{ refineText(row, 'glove') }}</template>
        </el-table-column>
        <el-table-column label="配件1" min-width="160">
          <template #default="{ row }">{{ equipName(row.accessory1Id) }} {{ refineText(row, 'accessory') }}</template>
        </el-table-column>
        <el-table-column label="配件2" min-width="160">
          <template #default="{ row }">{{ equipName(row.accessory2Id) }} {{ refineText(row, 'accessory2') }}</template>
        </el-table-column>
        <el-table-column label="操作" min-width="180" fixed="right">
          <template #default="{ row }">
            <span style="white-space:nowrap">
              <el-button size="small" type="info" @click="edit(row)">编辑</el-button>
              <el-button size="small" type="primary" @click="clone(row)">复制</el-button>
              <el-button size="small" type="danger" @click="del(row)">删除</el-button>
            </span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import api, { CharacterApi, WeaponApi, EquipmentApi, BuildApi } from '../../api'
import type { Character, Weapon, Equipment } from '../../api'
import { exportList } from '../../utils/exportExcel'

const router = useRouter()
const list = ref<any[]>([])
const chars = ref<Character[]>([])
const weapons = ref<Weapon[]>([])
const equipMap = ref<Record<string, string>>({})
const loading = ref(false)

function charName(id: string) {
  if (!id) return '-'
  return chars.value.find(c => c.id === id)?.name || id
}

function weaponName(id: string) {
  if (!id) return '-'
  return weapons.value.find(w => w.id === id)?.name || id
}

function equipName(id: string) {
  if (!id) return '-'
  return equipMap.value[id] || id
}

function refineText(row: any, slotKey: string) {
  if (!row.equipRefines) return ''
  try {
    const ref = JSON.parse(row.equipRefines)
    const r1 = ref[slotKey + 'r1'] ?? '-'
    const r2 = ref[slotKey + 'r2'] ?? '-'
    const r3 = ref[slotKey + 'r3'] ?? '-'
    return `[${r1}/${r2}/${r3}]`
  } catch {
    return ''
  }
}

async function load() {
  loading.value = true
  chars.value = await CharacterApi.listAll()
  weapons.value = await WeaponApi.listAll()
  const equipmentList = await EquipmentApi.listAll()
  equipMap.value = {}
  for (const e of equipmentList) {
    equipMap.value[e.id] = e.name + (e.setName ? ` [${e.setName}]` : '')
  }
  list.value = await BuildApi.list()
  loading.value = false
}

function clone(row: any) {
  const data = { ...row, id: undefined, name: row.name + ' - 副本' }
  delete data.id
  BuildApi.save(data).then(() => { ElMessage.success('已复制'); load() })
}

function del(row: any) { api.delete(`/builds/${row.id}`).then(load).then(() => ElMessage.success('已删除')) }
function edit(row: any) { router.push(`/loadout/${row.id}`) }
function goCreate() { router.push('/loadout') }

function exportAll() {
  const rows = list.value.map(r => ({
    ...r,
    characterName: charName(r.characterId),
    weaponName: weaponName(r.weaponId),
  }))
  exportList(rows, '配装方案列表', '配装方案')
  ElMessage.success('已导出')
}

onMounted(load)
</script>
