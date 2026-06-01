import { ElMessage, ElMessageBox } from 'element-plus'
import api from '../api'

interface Relation {
  table: string
  label: string
  count: number
}

export async function cascadeDelete(
  entity: string,
  row: { id: string; name: string },
  displayName: string,
  doDelete: () => Promise<any>,
) {
  try {
    const res = await api.get(`/${entity}/${row.id}/relations`)
    const relations = res.data as Relation[]
    if (relations && relations.length > 0) {
      const rows = relations.map(r => `<tr>
        <td style="padding:8px 12px;border:1px solid #e4e7ed">${r.label}</td>
        <td style="padding:8px 12px;border:1px solid #e4e7ed;text-align:right">${r.count}</td>
      </tr>`).join('')
      const html = `<p style="margin:0 0 12px">${displayName}「${row.name}」与以下数据存在关联，删除将同时清除：</p>
        <table style="width:100%;border-collapse:collapse">
          <tr style="background:#f5f7fa">
            <th style="padding:8px 12px;border:1px solid #e4e7ed;text-align:left">关联表</th>
            <th style="padding:8px 12px;border:1px solid #e4e7ed;text-align:right">关联数量</th>
          </tr>
          ${rows}
        </table>`
      await ElMessageBox.confirm(html, '级联删除确认', {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'warning',
        dangerouslyUseHTMLString: true,
      })
      await api.delete(`/${entity}/${row.id}?cascade=true`)
    } else {
      await doDelete()
    }
    ElMessage.success('已删除')
    return true
  } catch {
    return false
  }
}
