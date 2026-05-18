<template>
  <div>
    <el-card>
      <div style="margin-bottom: 15px">
        <el-button type="primary" @click="goCreate">新建配装方案</el-button>
        <el-button @click="exportAll">导出所有方案</el-button>
      </div>
      <el-table :data="list" border stripe v-loading="loading">
        <el-table-column prop="id" label="ID" width="150" />
        <el-table-column prop="name" label="方案名称" width="150" />
        <el-table-column label="角色" width="120">
          <template #default="{ row }">{{ charName(row.characterId) }}</template>
        </el-table-column>
        <el-table-column label="武器" width="150">
          <template #default="{ row }">{{ weaponName(row.weaponId) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button size="small" @click="edit(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="del(row)">删除</el-button>
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
import api, { CharacterApi, WeaponApi } from '../../api'
import type { Character, Weapon } from '../../api'
import { exportList } from '../../utils/exportExcel'

const router = useRouter()
const list = ref<any[]>([])
const chars = ref<Character[]>([])
const weapons = ref<Weapon[]>([])
const loading = ref(false)

function charName(id: string) {
  if (!id) return '-'
  return chars.value.find(c => c.id === id)?.name || id
}

function weaponName(id: string) {
  if (!id) return '-'
  return weapons.value.find(w => w.id === id)?.name || id
}

async function load() {
  loading.value = true
  chars.value = await CharacterApi.list()
  weapons.value = await WeaponApi.list()
  list.value = (await api.get('/builds')).data
  loading.value = false
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
