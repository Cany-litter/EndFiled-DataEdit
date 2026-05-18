import * as XLSX from 'xlsx'

export function downloadWorkbook(wb: XLSX.WorkBook, filename: string) {
  XLSX.writeFile(wb, `${filename}.xlsx`)
}

export function jsonToSheet(data: Record<string, any>[], sheetName: string): XLSX.WorkSheet {
  return XLSX.utils.json_to_sheet(data)
}

export function createWorkbook(sheets: Record<string, XLSX.WorkSheet>): XLSX.WorkBook {
  const wb = XLSX.utils.book_new()
  for (const [name, sheet] of Object.entries(sheets)) {
    XLSX.utils.book_append_sheet(wb, sheet, name)
  }
  return wb
}

export function exportBuild(build: Record<string, any>, damageRows: Record<string, any[]>, stats: Record<string, any>) {
  const infoSheet = jsonToSheet([
    { 字段: '方案名称', 值: build.name || '' },
    { 字段: '角色ID', 值: build.characterId || '' },
    { 字段: '武器ID', 值: build.weaponId || '' },
    { 字段: '攻击力', 值: stats.attack },
    { 字段: '生命值', 值: stats.hp },
    { 字段: '力量', 值: stats.str },
    { 字段: '敏捷', 值: stats.agi },
    { 字段: '智识', 值: stats.int },
    { 字段: '意志', 值: stats.wil },
    { 字段: '属性加成', 值: stats.attrBonus },
  ], '方案信息')

  const sheets: Record<string, XLSX.WorkSheet> = { '方案信息': infoSheet }
  for (const [skillLabel, rows] of Object.entries(damageRows)) {
    sheets[skillLabel] = jsonToSheet(rows, skillLabel)
  }
  const wb = createWorkbook(sheets)
  downloadWorkbook(wb, `配装方案_${build.name || build.id}`)
}

export function exportList(data: Record<string, any>[], filename: string, sheetName: string = 'Sheet1') {
  const sheet = jsonToSheet(data, sheetName)
  const wb = createWorkbook({ [sheetName]: sheet })
  downloadWorkbook(wb, filename)
}

export function exportTeams(data: Record<string, any>[], charMap: Record<string, string>) {
  const rows = data.map(t => ({
    ID: t.id,
    名称: t.name,
    角色A: charMap[t.charAId] || t.charAId || '-',
    角色B: charMap[t.charBId] || t.charBId || '-',
    角色C: charMap[t.charCId] || t.charCId || '-',
    角色D: charMap[t.charDId] || t.charDId || '-',
  }))
  const sheet = jsonToSheet(rows, '配队')
  const wb = createWorkbook({ '配队': sheet })
  downloadWorkbook(wb, '配队列表')
}
