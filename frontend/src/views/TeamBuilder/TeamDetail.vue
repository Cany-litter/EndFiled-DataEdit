<template>
  <el-card>
    <template #header>
      <div style="display:flex;justify-content:space-between;align-items:center">
        <span>{{ isNew ? '新建配队' : '编辑配队' }}</span>
        <div>
          <el-button type="primary" size="small" @click="save">保存</el-button>
          <el-button size="small" @click="$router.push('/teams')">返回</el-button>
        </div>
      </div>
    </template>
    <el-form label-width="100px">
      <el-form-item label="配队名称">
        <el-input v-model="form.name" style="width:300px" />
      </el-form-item>
    </el-form>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
      <el-card v-for="(slot,i) in slots" :key="i" :body-style="{padding:'14px'}">
        <template #header><span style="font-weight:600">{{ slot.label }}</span></template>
        <el-form label-width="60px" size="small">
          <el-form-item label="角色">
            <el-select v-model="slot.charId" filterable placeholder="选择角色" style="width:100%" @change="onCharSlotChange(slot)">
              <el-option v-for="c in characters" :key="c.id" :label="`[${c.rarity}★] ${c.name}`" :value="c.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="配装">
            <el-select v-model="slot.buildId" filterable placeholder="选择配装方案" style="width:100%">
              <el-option v-for="b in filteredBuilds(slot.charId)" :key="b.id"
                :label="b.name || b.id" :value="b.id" />
            </el-select>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { TeamApi, CharacterApi, BuildApi } from '../../api'
import type { Character, Build } from '../../api'

const route = useRoute()
const router = useRouter()
const isNew = route.params.id === 'new'

const characters = ref<Character[]>([])
const allBuilds = ref<Build[]>([])

const form = reactive({ name: '' })
const slots = reactive([
  { label: '角色A', charId: '', buildId: '', charField: 'charAId' as const, buildField: 'buildAId' as const },
  { label: '角色B', charId: '', buildId: '', charField: 'charBId' as const, buildField: 'buildBId' as const },
  { label: '角色C', charId: '', buildId: '', charField: 'charCId' as const, buildField: 'buildCId' as const },
  { label: '角色D', charId: '', buildId: '', charField: 'charDId' as const, buildField: 'buildDId' as const },
])

function filteredBuilds(charId: string | undefined) {
  if (!charId) return []
  return allBuilds.value.filter(b => b.characterId === charId)
}

function clearBuildOnCharChange(slot: typeof slots[0]) {
  slot.buildId = ''
}

const onCharSlotChange = clearBuildOnCharChange

async function save() {
  const data: Record<string, any> = { name: form.name }
  for (const s of slots) {
    data[s.charField] = s.charId || null
    data[s.buildField] = s.buildId || null
  }
  try {
    if (isNew) {
      await TeamApi.save(data as any)
    } else {
      data.id = route.params.id as string
      await TeamApi.save(data as any)
    }
    ElMessage.success('已保存')
    router.push('/teams')
  } catch { ElMessage.error('保存失败') }
}

onMounted(async () => {
  characters.value = await CharacterApi.list()
  allBuilds.value = await BuildApi.list()
  if (!isNew) {
    const team = await TeamApi.get(route.params.id as string)
    if (team) {
      form.name = team.name || ''
      for (const s of slots) {
        s.charId = (team as any)[s.charField] || ''
        s.buildId = (team as any)[s.buildField] || ''
      }
    }
  }
})
</script>
