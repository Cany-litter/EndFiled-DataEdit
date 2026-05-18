<template>
  <div>
    <el-card>
      <div style="margin-bottom: 15px">
        <el-button type="primary" @click="dialogVisible = true">新建增益</el-button>
      </div>
      <el-table :data="list" border stripe v-loading="loading">
        <el-table-column prop="id" label="ID" width="150" />
        <el-table-column prop="name" label="名称" width="150" />
        <el-table-column prop="gainType" label="类型" width="80" />
        <el-table-column prop="effectCategory" label="效果大类" width="120" />
        <el-table-column prop="effectType" label="效果类型" width="120" />
        <el-table-column prop="effectValue" label="数值" width="80" />
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button size="small" @click="edit(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="del(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <el-dialog v-model="dialogVisible" :title="editing ? '编辑增益' : '新建增益'" width="500px">
      <el-form :model="form" label-width="120px">
        <el-form-item label="ID"><el-input v-model="form.id" :disabled="!!editing" /></el-form-item>
        <el-form-item label="名称"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="类型"><el-select v-model="form.gainType"><el-option label="常驻" value="permanent" /><el-option label="限定" value="limited" /></el-select></el-form-item>
        <el-form-item label="效果大类"><el-input v-model="form.effectCategory" /></el-form-item>
        <el-form-item label="效果类型"><el-input v-model="form.effectType" /></el-form-item>
        <el-form-item label="数值"><el-input-number v-model="form.effectValue" /></el-form-item>
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
const form = ref<any>({ gainType: 'permanent' })

async function load() { loading.value = true; list.value = (await api.get('/gains')).data; loading.value = false }
function edit(row: any) { editing.value = row; form.value = { ...row }; dialogVisible.value = true }
function del(row: any) { api.delete(`/gains/${row.id}`).then(load) }
async function save() {
  if (editing.value) await api.put(`/gains/${form.value.id}`, form.value)
  else await api.post('/gains', form.value)
  dialogVisible.value = false; editing.value = null; form.value = { gainType: 'permanent' }; load()
}
onMounted(load)
</script>
