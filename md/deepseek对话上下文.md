# DeepSeek 对话上下文 — EndFiled 项目

> 此文档为 AI 辅助开发提供项目上下文，减少每次对话的探索成本。

---

## 一、项目速览

EndFiled（终末地数据编辑器）是一个为《明日方舟:终末地》设计的全功能数据编辑器，包含：

- **数据管理**：角色/武器/装备/技能/增益/敌人的 CRUD（Vue + Spring Boot）
- **配装构建**：多角色配装编辑器 + 分层属性计算 + 对比
- **队伍编排**：4 人队伍管理
- **排轴编辑器**：可视化时间轴（Konva.js）+ buff 调度 + DPS 计算
- **DPS 模拟器**：队伍轮转自动模拟
- **伤害引擎**：15 乘区伤害公式 + 8 类别评估 + 异常/反应系统

### 技术栈

| 层 | 技术 |
|---|---|
| 前端 | Vue 3.4 + TypeScript 5.4 + Vite 5.2 + Element Plus + ECharts + Pinia |
| 后端 | Spring Boot 2.7.18 + MyBatis-Plus 3.5.5 + Java 21 |
| 数据库 | MySQL 8.0 (36 表) |
| 测试 | Vitest (111 单元测试) |
| 部署 | Docker + docker-compose |

---

## 二、项目结构

```
EndFiled/
├── backend/src/main/java/com/endfiled/
│   ├── common/           # BaseController, Result, PageResult
│   ├── config/           # CORS, MyBatis 配置
│   ├── controller/       # REST 控制器 (35+)
│   ├── mapper/           # MyBatis Mapper
│   └── model/            # JPA 实体
├── frontend/src/
│   ├── api.ts            # 所有 REST API 客户端 (514 行)
│   ├── engine/           # 核心计算引擎 (核心!)
│   │   ├── types/        # 所有类型定义
│   │   ├── formulas/     # 伤害公式 (6 文件)
│   │   ├── simulation/   # 模拟引擎 (7 文件)
│   │   └── utils/        # 撤销/重做
│   ├── stores/           # Pinia 状态
│   ├── utils/            # 常量/导出/分享码
│   └── views/            # Vue 页面
│       ├── DataManage/   # CRUD 页面
│       ├── LoadoutEditor/ # 配装
│       ├── TeamBuilder/  # 队伍
│       ├── TimelineEditor/ # 排轴 (12 子组件)
│       └── Simulator/    # DPS 模拟
├── data/                 # 原始数据
├── scripts/              # 数据导入脚本
├── md/                   # 文档
└── reference/            # 参考子模块
```

---

## 三、核心引擎架构 — 最重要

引擎是纯 TypeScript，无外部依赖，按功能分层：

```
engine/
├── types/           ← 所有数据模型
│   ├── character.ts   → Character, Profression, ElementType
│   ├── weapon.ts      → Weapon, WeaponAffix
│   ├── equipment.ts   → Equipment, EquipSlot, EquipAttr
│   ├── skill.ts       → Skill, SkillAction, DamageType
│   ├── buff.ts        → Buff, BuffType, StackRule, EffectDef
│   ├── damage.ts      → DamageBreakdown, DamageResult, ReactionType
│   └── timeline.ts    → TimelineAction, Track, EnemyConfig (141 行)
│
├── formulas/        ← 纯函数，无副作用
│   ├── attack.ts        → calcAttack(), calcStat(), calcHp()
│   ├── stats.ts         → calcFinalStats() (5 层聚合)
│   ├── damage.ts        → calcDamage() (15 乘区)
│   ├── damageCategories.ts → calcDamageByCategories() (8 类别)
│   ├── effectResolver.ts   → resolveEffectValue(), piecewiseLinear()
│   └── anomaly.ts      → 异常体系 (元素反应)
│
├── simulation/      ← 有状态模拟
│   ├── types.ts         → SimulationConfig, RotationStep
│   ├── timeSimEngine.ts → runTimelineSimulation() (排轴)
│   ├── teamEngine.ts    → runTeamSimulation() (队伍轮转)
│   ├── buffManager.ts   → TimelineBuffManager (buff 调度)
│   ├── buffReplacement.ts
│   ├── rotationConverter.ts (循环↔排轴)
│   └── staggerEngine.ts (失衡模拟)
│
└── utils/
    └── TimelineHistory.ts (撤销/重做)
```

### 引擎模块依赖

```
timeSimEngine
  ├── buffManager → buffReplacement
  ├── damageCategories → effectResolver
  └── anomaly

teamEngine
  ├── damageCategories
  ├── effectResolver
  └── stats → attack

stats → attack
```

---

## 四、编码规范

### 4.1 TypeScript 命名

| 类别 | 规范 | 示例 |
|------|------|------|
| 类型/接口 | PascalCase | `Character`, `DamageBreakdown` |
| 变量/函数 | camelCase | `calcDamage()`, `buildBaseLayer()` |
| 常量 | UPPER_SNAKE_CASE | `DEFAULT_SYSTEM_CONSTANTS` |
| 枚举 | PascalCase 值 | `BuffType.Permanent` |

### 4.2 Vue 组件

- Composition API：`<script setup lang="ts">`
- 组件名：PascalCase 多词名
- CSS：scoped + kebab-case

### 4.3 后端

- Controller 继承 `BaseController<T, M>`
- 统一路径前缀 `/api/v1/`
- 统一返回 `Result<T>` / `PageResult<T>`
- MySQL 表名/列名蛇形命名

---

## 五、常见模式

### 5.1 前端 API 调用

```typescript
import { CharacterApi } from '@/api'
const list = await CharacterApi.listAll()
```

### 5.2 新增数据管理页面

1. `schema.sql` 加表 → 2. Java Model → 3. Java Mapper → 4. Java Controller → 5. `api.ts` 加接口 → 6. Vue 页面 → 7. 路由

### 5.3 分层属性计算

```
buildBaseLayer → buildWeaponLayer → equipSubStatsToLayer
  → buildSetEffectsLayer → buildGainsLayer → computeDerivedFinal
```

### 5.4 共享类型导入

```typescript
import type { Character, Weapon } from '@/engine/types'
```

所有引擎类型通过 `@/engine/types` 导入（barrel export），不直接从单个文件导入。

---

## 六、常见陷阱与注意事项

1. **中文标识符禁止** — `anomaly.ts` 中的中文函数名（如 `calc法术异常伤害`）正在迁移英文中。新代码一律英文。
2. **Combo 逻辑** — 连击相关函数 (`getComboMultiplier`, `updateCombo`) 在 `timeSimEngine.ts` 和 `teamEngine.ts` 中重复定义，应从 `@/engine/simulation/comboSystem` 导入。
3. **SystemConstants 冲突** — 在 `types/timeline.ts` 和 `simulation/types.ts` 中都有定义，优先使用 `simulation/types.ts` 中的版本。
4. **import 路径** — 使用 `@/` alias 而非相对路径：`@/engine/formulas/damage` 而非 `../../engine/formulas/damage`。
5. **后端无测试** — 修改后端代码后需手动验证。
6. **时间线深拷贝** — `timelineStore.ts` 中用 `JSON.parse(JSON.stringify(...))` 做深拷贝，大数据量可能卡 UI。
7. **英文文档优先** — 所有面向 AI 的文档使用英文，面向人的评估/说明可使用中文。

---

## 七、测试

- 框架：Vitest
- 运行：`cd frontend && npm test`
- 测试文件位置：`frontend/src/engine/formulas/__tests__/` 和 `simulation/__tests__/`
- 共 111 个测试，覆盖 attack/stats/damage/anomaly/damageCategories/effectResolver/timeSimEngine

---

## 八、数据管道

```
AKEDatabase API → fetch-akedb.js → mapped JSON → import-akedb.js → MySQL
游戏提取 JSON  → import-extracted.js → MySQL
华法琳 Wiki   → import_all_data.py → MySQL
EndAxis 导出  → import-endaxis.py → MySQL
```

---

## 九、快速索引

| 问这个问题 | 看这个文件 |
|-----------|-----------|
| 项目整体功能 | `md/PROJECT_INDEX.md` |
| 开发规范 | `md/开发规范与内容说明.md` |
| 伤害公式细节 | `frontend/src/engine/formulas/damage.ts` |
| 属性计算 | `frontend/src/engine/formulas/stats.ts` |
| 排轴模拟 | `frontend/src/engine/simulation/timeSimEngine.ts` |
| 队伍模拟 | `frontend/src/engine/simulation/teamEngine.ts` |
| 数据库 schema | `backend/src/main/resources/schema.sql` |
| 所有 API 端点 | `frontend/src/api.ts` |
