<template>
  <div>
    <el-card>
      <div style="margin-bottom: 15px">
        <el-button type="primary" @click="dialogVisible = true">新建技能</el-button>
      </div>
      <el-table :data="list" border stripe v-loading="loading">
        <el-table-column prop="id" label="ID" width="150" />
        <el-table-column prop="name" label="名称" width="120" />
        <el-table-column prop="characterId" label="角色ID" width="140" />
        <el-table-column prop="type" label="类型" width="100" />
        <el-table-column prop="damageType" label="伤害类型" width="100" />
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button size="small" @click="edit(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="del(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <el-dialog v-model="dialogVisible" :title="editing ? '编辑技能' : '新建技能'" width="500px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="ID"><el-input v-model="form.id" :disabled="!!editing" /></el-form-item>
        <el-form-item label="名称"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="角色ID"><el-input v-model="form.characterId" /></el-form-item>
        <el-form-item label="类型"><el-input v-model="form.type" /></el-form-item>
        <el-form-item label="伤害类型"><el-input v-model="form.damageType" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '../../api'

const list = ref<any[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const editing = ref<any>(null)
const form = ref<any>({})

async function load() { loading.value = true; list.value = (await api.get('/skills')).data; loading.value = false }
function edit(row: any) { editing.value = row; form.value = { ...row }; dialogVisible.value = true }
function del(row: any) { api.delete(`/skills/${row.id}`).then(load) }
async function save() {
  if (editing.value) await api.put(`/skills/${form.value.id}`, form.value)
  else await api.post('/skills', form.value)
  dialogVisible.value = false; editing.value = null; form.value = {}; load()
}
onMounted(load)
</script>
