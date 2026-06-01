# EndFiled (终末地数据编辑器) - 项目功能索引

> 本项目为《明日方舟:终末地》的数据编辑器，提供角色/武器/装备/技能/增益的 CRUD 管理、配装构建、队伍编排、排轴编辑以及完整的伤害计算引擎。

---

## 1. 全局基础设施

| 功能 | 文件路径 | 关键类/函数 | 说明 |
|------|----------|-------------|------|
| 前端入口 | `frontend/src/main.ts` | `createApp` + Pinia + ElementPlus + Router | 应用启动 |
| 根布局 | `frontend/src/App.vue` | 侧边栏导航 (11 项) | Element Plus Menu 布局 |
| 路由定义 | `frontend/src/router/index.ts` | 14 条路由 | 含 meta.title |
| API 客户端 | `frontend/src/api.ts` | `CharacterApi`, `WeaponApi`, ... (35+) | 统一 REST 调用，514 行 |
| Pinia 状态 | `frontend/src/stores/timelineStore.ts` | `useTimelineStore` | 排轴场景/轨道/系统常量 |
| 后端入口 | `backend/src/main/java/com/endfiled/EndFiledApplication.java` | `main()`, `@MapperScan` | Spring Boot 启动 |
| 通用 CRUD | `backend/src/main/java/com/endfiled/controller/BaseController.java` | `defaultAll/page/get/create/update/delete` | 所有 Controller 继承 |
| 统一响应 | `backend/src/main/java/com/endfiled/common/Result.java` | `Result.success/error` | API 返回格式 |
| 分页响应 | `backend/src/main/java/com/endfiled/common/PageResult.java` | `PageResult` | 分页包装 |
| 异常处理 | `backend/src/main/java/com/endfiled/common/GlobalExceptionHandler.java` | `@RestControllerAdvice` | 400/500 统一处理 |
| CORS 配置 | `backend/src/main/java/com/endfiled/config/WebConfig.java` | `addCorsMappings` | 跨域配置 |
| MyBatis 配置 | `backend/src/main/java/com/endfiled/config/MybatisPlusConfig.java` | `PaginationInnerInterceptor` | 分页插件 |

---

## 2. 数据管理 (CRUD)

每个模块包含：列表页 + 搜索筛选 + 创建/编辑弹窗 + 级联删除。

| 数据实体 | 前端页面 | 后端 Controller | 后端 Mapper | 后端 Model | 数据库表 |
|----------|----------|-----------------|-------------|------------|----------|
| 角色 | `frontend/src/views/DataManage/CharacterList.vue` | `controller/CharacterController.java` | `mapper/CharacterMapper.java` | `model/GameCharacter.java` | `character` |
| 武器 | `frontend/src/views/DataManage/WeaponList.vue` | `controller/WeaponController.java` | `mapper/WeaponMapper.java` | `model/Weapon.java` | `weapon` |
| 装备 | `frontend/src/views/DataManage/EquipmentList.vue` | `controller/EquipmentController.java` | `mapper/EquipmentMapper.java` | `model/Equipment.java` | `equipment` |
| 技能 | `frontend/src/views/DataManage/SkillList.vue` | `controller/SkillController.java` | `mapper/SkillMapper.java` | `model/Skill.java` | `skill` |
| 增益 | `frontend/src/views/DataManage/GainList.vue` | `controller/GainController.java` | `mapper/GainMapper.java` | `model/Gain.java` | `gain` |
| 敌人 | `frontend/src/views/DataManage/EnemyList.vue` | `controller/EnemyController.java` | `mapper/EnemyMapper.java` | `model/Enemy.java` | `enemy` |

**后端子表 Controller**（每个约 50-100 行）:
- `WeaponStatController`, `WeaponAffixController`, `WeaponLevelCostController`, `WeaponAscensionController`, `WeaponSkillController`, `WeaponSkillRankController`
- `CharacterStatController`, `CharacterTalentController`
- `SkillActionController`, `SkillDamageTickController`, `SkillAnomalyController`, `SkillCostController`, `SkillLevelController`
- `AttackSegmentController`, `EquipmentSetController`, `ModifierDefController`

**级联删除**：`frontend/src/utils/cascadeDelete.ts` → `cascadeDelete()`

---

## 3. 配装构建 (Loadout / Build)

| 功能 | 文件路径 | 关键函数 | 说明 |
|------|----------|----------|------|
| 构建列表 | `frontend/src/views/LoadoutEditor/LoadoutList.vue` | - | 所有配装概览 |
| 构建编辑器 | `frontend/src/views/LoadoutEditor/LoadoutEditor.vue` | - | 角色+武器+4装备+增益组合 |
| 构建对比 | `frontend/src/views/LoadoutEditor/CompareBuild.vue` | - | 多配装并排对比 |
| 后台 API | `backend/.../controller/BuildController.java` | CRUD + relations | `/api/v1/builds` |

**依赖**: `LoadoutEditor.vue` → `engine/formulas/stats.ts` (`calcFinalStats`)

---

## 4. 队伍编排 (Team Builder)

| 功能 | 文件路径 | 说明 |
|------|----------|------|
| 队伍列表 | `frontend/src/views/TeamBuilder/TeamList.vue` | 所有队伍概览 |
| 队伍详情 | `frontend/src/views/TeamBuilder/TeamDetail.vue` | 4 名角色 + 配装槽位 |
| 后台 API | `backend/.../controller/TeamController.java` | `/api/v1/teams` |

---

## 5. 排轴编辑器 (Timeline Editor)

| 功能 | 文件路径 | 说明 |
|------|----------|------|
| 主编辑器 | `frontend/src/views/TimelineEditor/TimelineEditor.vue` | 场景管理 + 子组件编排 |
| 时间线画布 | `frontend/src/views/TimelineEditor/TimelineCanvas.vue` | **Konva.js** 可视化轨道 |
| 角色技能库 | `frontend/src/views/TimelineEditor/CharacterLibrary.vue` | 技能选择面板 |
| 角色卡片 | `frontend/src/views/TimelineEditor/CharacterCard.vue` | 当前角色摘要 |
| 敌人配置 | `frontend/src/views/TimelineEditor/EnemyBar.vue` / `EnemyPanel.vue` | 敌人参数 |
| 曲线面板 | `frontend/src/views/TimelineEditor/CurvePanel.vue` | SP/进度条/失衡 曲线 |
| 属性面板 | `frontend/src/views/TimelineEditor/PropertiesPanel.vue` | 动作属性编辑 |
| 增益库 | `frontend/src/views/TimelineEditor/BuffLibrary.vue` | 增益选择面板 |
| 资源图表 | `frontend/src/views/TimelineEditor/ResourceCharts.vue` | ECharts 可视化 |
| DPS 总览 | `frontend/src/views/TimelineEditor/DpsOverview.vue` | 调用 `timeSimEngine` |
| 伤害详情 | `frontend/src/views/TimelineEditor/DamageDetail.vue` | 细分伤害分解 |
| 动作编辑 | `frontend/src/views/TimelineEditor/ActionEditDialog.vue` | 动作编辑弹窗 |
| 后台 API | `backend/.../controller/TimelineScenarioController.java` | `/api/v1/timelines` |

**依赖**: `TimelineEditor` → `stores/timelineStore.ts` → `engine/simulation/timeSimEngine.ts`

---

## 6. DPS 模拟器

| 功能 | 文件路径 | 关键函数 | 说明 |
|------|----------|----------|------|
| 模拟器页面 | `frontend/src/views/Simulator/DpsSimulator.vue` | - | 799 行，队伍轮转模拟 UI |
| 队伍引擎 | `frontend/src/engine/simulation/teamEngine.ts` | `runTeamSimulation()`, `simulateRows()`, `fireDamage()`, `fireAutoAttack()` | 4 人独立轮转 + 能量/冷却管理 |

**依赖**: `DpsSimulator` → `teamEngine.ts` → `formulas/damageCategories.ts`

---

## 7. 伤害计算引擎 (Engine)

### 7.1 类型定义

| 文件 | 关键类型 | 说明 |
|------|----------|------|
| `frontend/src/engine/types/character.ts` | `Character`, `Rarity`, `Profession`, `ElementType`, `WeaponType`, `AttrType` | 角色数据模型 |
| `frontend/src/engine/types/weapon.ts` | `Weapon`, `WeaponAffix` | 武器 + 3 个词条 |
| `frontend/src/engine/types/equipment.ts` | `Equipment`, `EquipSlot`, `EquipAttr` | 装备 3 槽位各 3 属性 |
| `frontend/src/engine/types/skill.ts` | `Skill`, `SkillLevel`, `SkillAction`, `SkillType`, `DamageType` | 技能 + 等级 + 动作 |
| `frontend/src/engine/types/buff.ts` | `Buff`, `BuffType`, `StackRule`, `TargetScope`, `EffectDef`, `MetaDef` | 增益/效果定义 |
| `frontend/src/engine/types/damage.ts` | `DamageBreakdown`, `DamageResult`, `EnemyState`, `ReactionResult` | 伤害输出模型 (15 乘区) |
| `frontend/src/engine/types/timeline.ts` | `TimelineAction`, `Track`, `TimelineScenario`, `DamageTick`, `EnemyConfig` | 排轴数据模型 (141 行) |
| `frontend/src/engine/types/index.ts` | - | 以上所有类型的桶导出 |

### 7.2 公式模块

| 文件 | 关键函数 | 行号 | 说明 |
|------|----------|------|------|
| `frontend/src/engine/formulas/attack.ts` | `calcAttack()`, `calcStat()`, `calcHp()` | 10, 24, 34 | 基础攻击/属性/HP 公式 |
| `frontend/src/engine/formulas/stats.ts` | `calcFinalStats()`, `buildBaseLayer()`, `buildWeaponLayer()`, `buildSetEffectsLayer()`, `buildGainsLayer()`, `mergeLayers()`, `computeDerivedFinal()` | 472, 267 | **五层属性聚合** (基础/武器/装备/套装/增益)，130+ 属性定义 |
| `frontend/src/engine/formulas/damage.ts` | `calcDamage()` | 44 | **15 乘区伤害公式**: 基础 × 暴击 × 增伤 × 减伤 × 增幅 × 虚弱 × 庇护 × 脆弱 × 易伤 × 防御 × 失衡 × 抗性 × 非控制 × 连击 × 特殊 |
| `frontend/src/engine/formulas/damageCategories.ts` | `calcDamageByCategories()`, `DAMAGE_CATEGORIES` | 41, 14 | **8 伤害类别评估**: 增伤/易伤/脆弱/增幅/抗性/连击/失衡/处决 |
| `frontend/src/engine/formulas/effectResolver.ts` | `resolveEffectValue()`, `matchesCondition()`, `piecewiseLinear()`, `collectCrit()` | 45, 66, 31, 87 | 增益效果解析 + 饱和度缩放 + 分段线性插值 |
| `frontend/src/engine/formulas/anomaly.ts` | `calcAnomalyLevel()`, `calc法术异常伤害()`, `calc物理异常伤害()`, `calc源石技艺强度区()` | 2, 6, 10, 14, 39, 46 | **异常体系**: 元素反应 + 等级缩放 + 连击增伤 |

### 7.3 模拟模块

| 文件 | 关键类/函数 | 行号 | 说明 |
|------|-------------|------|------|
| `frontend/src/engine/simulation/types.ts` | `SimulationConfig`, `TeamSimulationResult`, `RotationStep`, `SystemConstants` | 1-151 | 模拟类型定义 |
| `frontend/src/engine/simulation/timeSimEngine.ts` | `runTimelineSimulation()`, `runTimelineSimulationWithDamage()`, `SimEvent`, `CharSimSnapshot` | 216, 314 | **排轴模拟引擎**: SP/进度条/失衡 资源追踪 + 异常累积触发 + 伤害曲线 |
| `frontend/src/engine/simulation/teamEngine.ts` | `runTeamSimulation()`, `simulateRows()`, `MemberState` | 158, 228 | **队伍轮转模拟**: 4 人独立循环 + 自动攻击 + 连击追踪 |
| `frontend/src/engine/simulation/buffManager.ts` | `TimelineBuffManager` 类, `build()`, `getBuffsAt()` | 24, 29, 91 | **排轴 Buff 调度**: 6 类 buff 时间窗口查询 |
| `frontend/src/engine/simulation/buffReplacement.ts` | `applyBuffReplacements()` | 6 | Buff 升级/替换逻辑 |
| `frontend/src/engine/simulation/rotationConverter.ts` | `actionsToRotation()`, `rotationToActions()`, `buildTrackFromRotation()`, `detectCyclePattern()` | 60, 80, 129, 24 | **循环 ↔ 排轴 转换**: 循环检测 + 格式互转 |
| `frontend/src/engine/simulation/staggerEngine.ts` | `runStaggerSimulation()`, `StaggerSimResult` | 46 | **失衡曲线引擎**: 失衡累积 + 打断窗 + SP 生成 |

### 7.4 工具模块

| 文件 | 关键类/函数 | 说明 |
|------|-------------|------|
| `frontend/src/engine/utils/TimelineHistory.ts` | `TimelineHistory` 类, `push/undo/redo/canUndo/canRedo` | 撤销/重做 (最大 50 步) |

---

## 8. 通用工具

| 功能 | 文件路径 | 关键导出 | 说明 |
|------|----------|----------|------|
| 常量映射 | `frontend/src/utils/constants.ts` | `ElementMap`, `WeaponTypeMap`, `ProfessionMap`, `gainCategoryEffectTypes`, `anomalyTypeMap`, `formatPct()`, `cleanSkillDesc()` | 游戏术语中英映射 |
| Excel 导出 | `frontend/src/utils/exportExcel.ts` | `exportBuild()`, `exportList()`, `exportTeams()`, `jsonToSheet()`, `downloadWorkbook()` | 基于 xlsx 库 |
| 分享码 | `frontend/src/utils/shareCode.ts` | `encodeShareCode()`, `decodeShareCode()` | Base64 URL-safe 编解码 |
| 级联删除 | `frontend/src/utils/cascadeDelete.ts` | `cascadeDelete()` | 确认弹窗 + 级联删除 |
| 国际化 | `frontend/src/utils/i18n.ts` | (精简) | i18n 工具 |

---

## 9. 数据管道 (Data Pipeline)

| 功能 | 文件路径 | 数据源 → 目标 |
|------|----------|--------------|
| AKEDB 抓取 | `scripts/fetch-akedb.js` | AKEDatabase API → `data/akedb/*.json` |
| AKEDB 映射 | `scripts/map-akedb.js` | `data/akedb/*.json` → `data/mapped/*.json` |
| AKEDB 导入 | `scripts/import-akedb.js` | `data/mapped/*.json` → MySQL |
| 全量导入 | `scripts/import_all_data.py` (1452 行) | 华法琳 Wiki + JSON → MySQL (13 新表) |
| 游戏数据导入 | `scripts/import-gamedata.js` | 游戏 JSON → MySQL |
| 提取数据导入 | `scripts/import-extracted.js` | `data/extracted/*.json` → MySQL |
| 杂项数据导入 | `scripts/import-misc-data.js` | 杂项 JSON → MySQL |
| 技能动作提取 | `scripts/extract-skill-actions.js` | 原始数据 → `attack_segments`, `skill_actions` |
| EndAxis 导入 | `scripts/import-endaxis.py` | EndAxis 导出 → `timeline_scenario` 表 |
| 增益映射 | `scripts/map-gains.js` | 增益原始数据 → 结构化 |
| 数据库迁移 | `scripts/数据库迁移脚本.sql` | SQL 迁移 |
| SQL 修复 | `scripts/fix-comments.sql` | 注释修复 |

---

## 10. 模块依赖关系

### 前端引擎依赖链

```
api.ts ──────────────────────────────────────────────────> 后端 REST API
  │
  ├── views/Dashboard.vue ──────────────────────────────> 所有 API
  ├── views/DataManage/*.vue ───────────────────────────> 对应实体 API
  ├── views/LoadoutEditor/LoadoutEditor.vue ────────────> engine/formulas/stats.ts
  ├── views/Simulator/DpsSimulator.vue ─────────────────> engine/simulation/teamEngine.ts
  └── views/TimelineEditor/*.vue
       ├── TimelineEditor.vue ──────────────────────────> stores/timelineStore.ts
       ├── DpsOverview.vue ─────────────────────────────> engine/simulation/timeSimEngine.ts
       │                                                  └── buffManager.ts
       │                                                  └── formulas/damageCategories.ts
       │                                                  └── formulas/effectResolver.ts
       │                                                  └── formulas/anomaly.ts
       └── DamageDetail.vue ────────────────────────────> 展示 engine 输出

timeSimEngine.ts
  └── buffManager.ts ───────────────────────────────────> buffReplacement.ts
  └── formulas/damageCategories.ts ─────────────────────> formulas/effectResolver.ts
  └── formulas/anomaly.ts
  └── types/*.ts

teamEngine.ts
  └── formulas/damageCategories.ts
  └── formulas/effectResolver.ts
  └── formulas/stats.ts

stats.ts
  └── formulas/attack.ts (calcAttack, calcStat, calcHp)
```

### 后端依赖链

```
EndFiledApplication.java
  └── @MapperScan ──────────────────────────────────────> mapper/*.java
  └── @SpringBootApplication
       ├── config/MybatisPlusConfig.java
       ├── config/WebConfig.java
       └── model/MyMetaHandler.java (审计时间戳)

Controller extends BaseController<T, M>
  └── BaseController ───────────────────────────────────> Mapper (构造注入)
  └── Controller ───────────────────────────────────────> 子表 Mapper (级联查询)

common/
  Result.java ──────────────────────────────────────────> 所有 Controller
  PageResult.java ──────────────────────────────────────> 分页查询
  GlobalExceptionHandler.java ──────────────────────────> @RestControllerAdvice
```

### 数据管道依赖

```
AKEDatabase API ──> fetch-akedb.js ──> data/akedb/*.json
                       │
                       └──> map-akedb.js ──> data/mapped/*.json
                               │
                               └──> import-akedb.js ──> MySQL

游戏提取 JSON ──> import-extracted.js / extract-skill-actions.js ──> MySQL
              ──> import_all_data.py (Python) ──────────────────────> MySQL

华法琳 Wiki .txt ──> import_all_data.py ────────────────────────────> MySQL (13 新表)

EndAxis 导出 ───> import-endaxis.py ────────────────────────────────> MySQL
```

---

## 11. 仪表盘

| 功能 | 文件路径 | 说明 |
|------|----------|------|
| 仪表盘 | `frontend/src/views/Dashboard.vue` (241 行) | 数据统计卡片、各模块快速链接、分布图表(职业/稀有度/部位)、最近配装/队伍、系统状态表、后端健康检查 |

---

## 12. 数据库架构

`backend/src/main/resources/schema.sql` (464 行, 24+ 表)

| 表名 | 说明 | 关键列 |
|------|------|--------|
| `character` | 角色 | 30 列: 基础属性/职业/元素/声优 |
| `weapon` | 武器 | 28 列: 基础攻击/3 词条 |
| `equipment` | 装备 | 40 列: 3 槽位各 3 属性 + 2 套装效果 |
| `gain` | 增益 | 18 列: 类别/类型/值/范围/叠加规则 |
| `skill` | 技能 | 9 列: 角色关联/类型/伤害类型 |
| `skill_level` | 技能等级乘数 | 等级 1-12 |
| `build` | 配装 | 18 列: 武器 + 4 装备 + 增益 |
| `team` | 队伍 | 12 列: 4 角色+配装 |
| `timeline_scenario` | 排轴场景 | 14 列: 轨道 JSON/敌人 JSON/系统常量 |
| `enemy` | 敌人 | 失衡/打断参数 |
| `skill_action` | 技能动作 | 25 列: 施放时间/消耗/进度条/伤害 tick |
| `character_stat` | 角色等级属性 | 逐级数据 |
| `weapon_stat` | 武器等级攻击 | 逐级数据 |
| `weapon_affix` | 武器词条 | 按潜能等级 |
| `modifier_def` | 修正值定义 | 模板值 |

---

## 13. 测试

| 范围 | 文件路径 |
|------|----------|
| 攻击公式 (14) | `frontend/src/engine/formulas/__tests__/attack.test.ts` |
| 属性聚合 (7) | `frontend/src/engine/formulas/__tests__/stats.test.ts` |
| 伤害公式 (16) | `frontend/src/engine/formulas/__tests__/damage.test.ts` |
| 异常/反应 (26) | `frontend/src/engine/formulas/__tests__/anomaly.test.ts` |
| 伤害类别 (10) | `frontend/src/engine/formulas/__tests__/damageCategories.test.ts` |
| 效果解析 (22) | `frontend/src/engine/formulas/__tests__/effectResolver.test.ts` |
| 排轴模拟 (16) | `frontend/src/engine/simulation/__tests__/timeSimEngine.test.ts` |

---

## 14. 配置与部署

| 文件 | 说明 |
|------|------|
| `docker-compose.yml` | MySQL 8.0 + Backend + Frontend (Nginx) |
| `backend/Dockerfile` | Spring Boot 容器化 |
| `frontend/Dockerfile` | Vue SPA + Nginx |
| `frontend/nginx.conf` | 反向代理配置 |
| `backend/src/main/resources/application.yml` | 数据库/Redis/MyBatis 配置 |
| `.github/workflows/ci.yml` | GitHub Actions CI |
