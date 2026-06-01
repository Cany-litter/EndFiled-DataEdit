-- ============================================================================
-- 终末地数据编辑器 - 数据库迁移与数据导入脚本
-- 数据来源: data/华法琳Wiki/ (华法琳Wiki文本数据)
--           data/extracted/ (攻击分段、技能动作JSON)
--           data/mapped/ (结构化映射JSON数据)
-- 
-- 目标数据库: endfiled (localhost:3306)
-- 迁移策略: 以新数据为准，补全缺失字段、新增表结构，保留已有数据完整性
-- ============================================================================

-- ============================================================================
-- 第一部分: 角色相关表结构增强
-- ============================================================================

-- -----------------------------------------------
-- 1.1 角色表 - 补充字段(华法琳Wiki总览信息)
-- -----------------------------------------------
ALTER TABLE `character`
  ADD COLUMN `english_name` varchar(50) DEFAULT NULL COMMENT '角色英文名',
  ADD COLUMN `description` text COMMENT '角色简介',
  ADD COLUMN `specialty` varchar(200) DEFAULT NULL COMMENT '角色特点描述',
  ADD COLUMN `va_jp` varchar(50) DEFAULT NULL COMMENT '日语配音演员',
  ADD COLUMN `va_en` varchar(50) DEFAULT NULL COMMENT '英语配音演员',
  ADD COLUMN `va_cn` varchar(50) DEFAULT NULL COMMENT '中文配音演员',
  ADD COLUMN `va_kr` varchar(50) DEFAULT NULL COMMENT '韩语配音演员',
  ADD COLUMN `faction` varchar(50) DEFAULT NULL COMMENT '阵营(干员情报)',
  ADD COLUMN `race` varchar(50) DEFAULT NULL COMMENT '种族(干员情报)',
  ADD COLUMN `specialties` json DEFAULT NULL COMMENT '专长列表JSON(干员情报)',
  ADD COLUMN `hobbies` json DEFAULT NULL COMMENT '爱好列表JSON(干员情报)',
  ADD COLUMN `char_battle_tags` json DEFAULT NULL COMMENT '战斗标签列表(来自mapped数据)';

-- -----------------------------------------------
-- 1.2 角色档案表 - 存储华法琳Wiki档案资料
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS `character_archive` (
  `id` varchar(64) NOT NULL COMMENT '档案ID: character_id + archive_index',
  `character_id` varchar(32) NOT NULL COMMENT '关联角色ID',
  `archive_index` tinyint NOT NULL COMMENT '档案编号 0=基础档案, 1~4=档案资料一至四',
  `title` varchar(100) DEFAULT NULL COMMENT '档案标题',
  `content` text NOT NULL COMMENT '档案正文内容',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_character` (`character_id`),
  CONSTRAINT `fk_archive_character` FOREIGN KEY (`character_id`) REFERENCES `character` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='角色档案资料(档案章节)';

-- -----------------------------------------------
-- 1.3 角色语音记录表 - 存储华法琳Wiki语音数据
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS `character_voice` (
  `id` varchar(64) NOT NULL COMMENT '语音ID: character_id + voice_category',
  `character_id` varchar(32) NOT NULL COMMENT '关联角色ID',
  `category` varchar(50) NOT NULL COMMENT '语音分类(如: 行动准备1, 交谈1, 编入队伍1等)',
  `language` varchar(5) DEFAULT 'CN' COMMENT '语言: CN/JP/EN/KR',
  `text` text NOT NULL COMMENT '语音文本内容',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_character` (`character_id`),
  CONSTRAINT `fk_voice_character` FOREIGN KEY (`character_id`) REFERENCES `character` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='角色语音记录(语音记录章节)';

-- -----------------------------------------------
-- 1.4 角色干员情报表 - 阵营/种族/专长/爱好
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS `character_profile` (
  `id` varchar(64) NOT NULL COMMENT '情报ID: character_id + profile_type',
  `character_id` varchar(32) NOT NULL COMMENT '关联角色ID',
  `profile_type` varchar(30) NOT NULL COMMENT '情报类型: faction/race/specialty/hobby',
  `label` varchar(50) NOT NULL COMMENT '情报标签',
  `description` text COMMENT '情报描述',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_character` (`character_id`),
  CONSTRAINT `fk_profile_character` FOREIGN KEY (`character_id`) REFERENCES `character` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='角色干员情报(阵营/种族/专长/爱好)';

-- -----------------------------------------------
-- 1.5 角色晋升消耗表 - 精英化材料
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS `character_promotion` (
  `id` varchar(64) NOT NULL COMMENT '晋升ID: character_id + elite_stage',
  `character_id` varchar(32) NOT NULL COMMENT '关联角色ID',
  `elite_stage` tinyint NOT NULL COMMENT '精英化阶段 1~4(对应一至四)',
  `level_cap` tinyint NOT NULL COMMENT '解锁等级上限',
  `material1_id` varchar(50) DEFAULT NULL COMMENT '材料1ID/名称',
  `material1_count` smallint DEFAULT NULL COMMENT '材料1数量',
  `material2_id` varchar(50) DEFAULT NULL COMMENT '材料2ID/名称',
  `material2_count` smallint DEFAULT NULL COMMENT '材料2数量',
  `material3_id` varchar(50) DEFAULT NULL COMMENT '材料3ID/名称',
  `material3_count` smallint DEFAULT NULL COMMENT '材料3数量',
  `gold_cost` decimal(12,2) DEFAULT NULL COMMENT '折金票消耗',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_character` (`character_id`),
  CONSTRAINT `fk_promotion_character` FOREIGN KEY (`character_id`) REFERENCES `character` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='角色精英化晋升消耗材料表(干员升级章节)';

-- -----------------------------------------------
-- 1.6 角色技能升级材料表 - 技能升级消耗
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS `character_skill_material` (
  `id` varchar(64) NOT NULL COMMENT '材料ID: character_id + skill_type + level',
  `character_id` varchar(32) NOT NULL COMMENT '关联角色ID',
  `skill_type` varchar(20) NOT NULL COMMENT '技能类型: normal/skill/chain/ultimate',
  `level` tinyint NOT NULL COMMENT '技能等级 1~12(含M1/M2/M3)',
  `material1_id` varchar(50) DEFAULT NULL COMMENT '材料1ID/名称',
  `material1_count` smallint DEFAULT NULL COMMENT '材料1数量',
  `material2_id` varchar(50) DEFAULT NULL COMMENT '材料2ID/名称',
  `material2_count` smallint DEFAULT NULL COMMENT '材料2数量',
  `gold_cost` decimal(12,2) DEFAULT NULL COMMENT '折金票消耗',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_character` (`character_id`),
  CONSTRAINT `fk_skillmat_character` FOREIGN KEY (`character_id`) REFERENCES `character` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='角色技能升级材料消耗表(技能升级材料章节)';

-- -----------------------------------------------
-- 1.7 角色后勤技能表 - 基建/后勤技能
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS `character_logistics` (
  `id` varchar(64) NOT NULL COMMENT '后勤技能ID: character_id + skill_name',
  `character_id` varchar(32) NOT NULL COMMENT '关联角色ID',
  `name` varchar(50) NOT NULL COMMENT '后勤技能名称',
  `unlock_stage` tinyint DEFAULT NULL COMMENT '解锁阶段(精英阶段)',
  `description` text COMMENT '后勤技能效果描述',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_character` (`character_id`),
  CONSTRAINT `fk_logistics_character` FOREIGN KEY (`character_id`) REFERENCES `character` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='角色后勤/基建技能表(后勤技能章节)';

-- -----------------------------------------------
-- 1.8 角色潜能效果表 - 详细潜能效果
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS `character_potential` (
  `id` varchar(64) NOT NULL COMMENT '潜能ID: character_id + potential_index',
  `character_id` varchar(32) NOT NULL COMMENT '关联角色ID',
  `potential_index` tinyint NOT NULL COMMENT '潜能序号 1~5',
  `name` varchar(50) DEFAULT NULL COMMENT '潜能名称',
  `effect` text COMMENT '潜能效果描述',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_character` (`character_id`),
  CONSTRAINT `fk_potential_character` FOREIGN KEY (`character_id`) REFERENCES `character` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='角色潜能详细信息(潜能章节)';


-- ============================================================================
-- 第二部分: 武器相关表结构增强
-- ============================================================================

-- -----------------------------------------------
-- 2.1 武器表 - 补充字段
-- -----------------------------------------------
ALTER TABLE `weapon`
  ADD COLUMN `description` text COMMENT '武器描述/背景故事',
  ADD COLUMN `lore` text COMMENT '武器背景故事长文(描述章节)',
  ADD COLUMN `sort_order` int DEFAULT NULL COMMENT '排序序号';

-- -----------------------------------------------
-- 2.2 武器升阶消耗表 - 武器突破材料
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS `weapon_ascension` (
  `id` varchar(64) NOT NULL COMMENT '升阶ID: weapon_id + phase',
  `weapon_id` varchar(32) NOT NULL COMMENT '关联武器ID',
  `phase` tinyint NOT NULL COMMENT '升阶阶段 0~4',
  `level_required` tinyint NOT NULL COMMENT '所需等级',
  `material1_id` varchar(50) DEFAULT NULL COMMENT '材料1ID/名称',
  `material1_count` smallint DEFAULT NULL COMMENT '材料1数量',
  `material2_id` varchar(50) DEFAULT NULL COMMENT '材料2ID/名称',
  `material2_count` smallint DEFAULT NULL COMMENT '材料2数量',
  `material3_id` varchar(50) DEFAULT NULL COMMENT '材料3ID/名称',
  `material3_count` smallint DEFAULT NULL COMMENT '材料3数量',
  `gold_cost` decimal(12,2) DEFAULT NULL COMMENT '折金票消耗',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_weapon` (`weapon_id`),
  CONSTRAINT `fk_ascension_weapon` FOREIGN KEY (`weapon_id`) REFERENCES `weapon` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='武器升阶突破消耗材料表(升阶章节)';

-- -----------------------------------------------
-- 2.3 武器技能表 - 武器词条/技能(与现有affix不同)
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS `weapon_skill` (
  `id` varchar(64) NOT NULL COMMENT '武器技能ID: weapon_id + skill_name',
  `weapon_id` varchar(32) NOT NULL COMMENT '关联武器ID',
  `skill_name` varchar(50) NOT NULL COMMENT '技能名称',
  `skill_index` tinyint NOT NULL COMMENT '技能序号 1~3',
  `rank_current` tinyint DEFAULT NULL COMMENT '当前等级(如 小:x/y 中的x)',
  `rank_max` tinyint DEFAULT NULL COMMENT '最大等级(如 小:x/y 中的y)',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_weapon` (`weapon_id`),
  CONSTRAINT `fk_weaponskill_weapon` FOREIGN KEY (`weapon_id`) REFERENCES `weapon` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='武器技能/词条列表(升阶章节)';

-- -----------------------------------------------
-- 2.4 武器技能等级数值表 - 武器技能每级数值
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS `weapon_skill_rank` (
  `id` varchar(64) NOT NULL COMMENT '等级ID: weapon_skill_id + rank_level',
  `weapon_skill_id` varchar(64) NOT NULL COMMENT '关联武器技能ID',
  `rank_level` tinyint NOT NULL COMMENT '等级 1~9',
  `value_desc` varchar(200) DEFAULT NULL COMMENT '当前等级效果描述',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_weapon_skill` (`weapon_skill_id`),
  CONSTRAINT `fk_skillrank_weaponskill` FOREIGN KEY (`weapon_skill_id`) REFERENCES `weapon_skill` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='武器技能各等级数值详情(技能Rank表格)';

-- -----------------------------------------------
-- 2.5 武器等级消耗表 - 经验与折金票消耗
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS `weapon_level_cost` (
  `weapon_id` varchar(32) NOT NULL COMMENT '关联武器ID',
  `level` tinyint NOT NULL COMMENT '等级 1~90',
  `exp_cost` int DEFAULT NULL COMMENT '所需经验值',
  `gold_cost` int DEFAULT NULL COMMENT '所需折金票',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`weapon_id`, `level`),
  CONSTRAINT `fk_levelcost_weapon` FOREIGN KEY (`weapon_id`) REFERENCES `weapon` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='武器每级升级消耗(经验/折金票)(经验消耗/折金票消耗章节)';


-- ============================================================================
-- 第三部分: 装备相关表结构增强
-- ============================================================================

-- -----------------------------------------------
-- 3.1 装备套组定义表 - 装备套组信息和套装效果
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS `equipment_set` (
  `id` varchar(32) NOT NULL COMMENT '套组ID(如 suit_agi01)',
  `name` varchar(50) NOT NULL COMMENT '套组名称',
  `piece_count` tinyint DEFAULT 3 COMMENT '套组件数',
  `set_effect_desc` text COMMENT '套组效果描述',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='装备套组定义/套装效果(装备数据及mapped/equips.json)';


-- ============================================================================
-- 第四部分: 战斗数据表(来自extracted JSON)
-- ============================================================================

-- 注: attack_segment 和 attack_segment_tick 表已存在，仅补充注释
ALTER TABLE `attack_segment`
  MODIFY COLUMN `character_id` varchar(64) NOT NULL COMMENT '所属角色ID(来自extracted/attack_segments.json)',
  MODIFY COLUMN `segment_index` tinyint NOT NULL COMMENT '攻击分段序号 0起(0=第1段,4=重击)',
  MODIFY COLUMN `duration` decimal(8,4) NOT NULL COMMENT '该段动画时长(秒)',
  MODIFY COLUMN `gauge_gain` decimal(8,4) DEFAULT '0.0000' COMMENT '连携量表获取值',
  MODIFY COLUMN `allowed_types` json DEFAULT NULL COMMENT '允许触发的异常/反应类型列表';

ALTER TABLE `attack_segment_tick`
  MODIFY COLUMN `character_id` varchar(64) NOT NULL COMMENT '所属角色ID',
  MODIFY COLUMN `segment_index` tinyint NOT NULL COMMENT '所属分段序号',
  MODIFY COLUMN `tick_index` tinyint NOT NULL COMMENT '伤害帧序号(在该分段内)',
  MODIFY COLUMN `offset` decimal(8,4) NOT NULL COMMENT '相对段开始时间偏移(秒)',
  MODIFY COLUMN `stagger` int DEFAULT '0' COMMENT '失衡值',
  MODIFY COLUMN `sp` int DEFAULT '0' COMMENT '技力获取';

-- -----------------------------------------------
-- 4.1 技能动作补充: 增加missing字段(已有skill_action)
-- -----------------------------------------------
ALTER TABLE `skill_action`
  MODIFY COLUMN `skill_id` varchar(64) NOT NULL COMMENT '技能ID(来自extracted/skill_actions.json)',
  MODIFY COLUMN `duration` decimal(8,4) DEFAULT NULL COMMENT '技能动作时长(秒)',
  MODIFY COLUMN `cast_time` decimal(8,4) DEFAULT '0.0000' COMMENT '施法前摇时间(秒)',
  MODIFY COLUMN `sp_cost` int DEFAULT NULL COMMENT '技能消耗SP(战技消耗)',
  MODIFY COLUMN `gauge_gain` decimal(8,4) DEFAULT NULL COMMENT '连携量表获取',
  MODIFY COLUMN `team_gauge_gain` decimal(8,4) DEFAULT NULL COMMENT '队伍连携量表获取',
  MODIFY COLUMN `cooldown` decimal(8,4) DEFAULT NULL COMMENT '技能冷却时间(秒)',
  MODIFY COLUMN `allowed_types` text COMMENT '允许触发的异常/反应类型列表',
  MODIFY COLUMN `ultimate_gauge_max` int DEFAULT NULL COMMENT '终结技能量上限',
  MODIFY COLUMN `ultimate_gauge_reply` int DEFAULT NULL COMMENT '终结技能量回复';


-- ============================================================================
-- 第五部分: 系统推荐武器表(角色→武器关联)
-- ============================================================================

CREATE TABLE IF NOT EXISTS `character_recommended_weapon` (
  `id` varchar(64) NOT NULL COMMENT '推荐ID: character_id + weapon_id + type',
  `character_id` varchar(32) NOT NULL COMMENT '角色ID',
  `weapon_id` varchar(32) DEFAULT NULL COMMENT '推荐武器ID',
  `weapon_name` varchar(50) DEFAULT NULL COMMENT '推荐武器名称(如无ID匹配时使用)',
  `recommend_type` varchar(20) NOT NULL COMMENT '推荐类型: skill_adapt(技能适配)/attr_adapt(属性适配)',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_character` (`character_id`),
  KEY `idx_weapon` (`weapon_id`),
  CONSTRAINT `fk_recweapon_char` FOREIGN KEY (`character_id`) REFERENCES `character` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_recweapon_wpn` FOREIGN KEY (`weapon_id`) REFERENCES `weapon` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='系统推荐武器(角色→武器关联)(总览系统推荐武器)';


-- ============================================================================
-- 第六部分: 数据导入 - 从mapped JSON 导入结构化数据
-- ============================================================================

-- 注意: 以下INSERT语句需要在Python/Node脚本中解析JSON后逐条执行。
-- 此处提供模板SQL，实际导入时使用脚本循环执行。

-- -----------------------------------------------
-- 6.1 导入 modifier_def (修饰符定义)
-- -----------------------------------------------
-- 来源: data/mapped/modifier-defs.json
-- 数据已由 import-gamedata.sql 导入，此处仅做校验
SELECT '--> 校验 modifier_def 数据完整性' AS `--`;
SELECT COUNT(*) AS `修饰符定义总数` FROM modifier_def;

-- -----------------------------------------------
-- 6.2 导入 weapon_modifier_template (武器词条模板)
-- -----------------------------------------------
-- 来源: data/mapped/weapon-modifier-templates.json
SELECT '--> 校验 weapon_modifier_template 数据完整性' AS `--`;
SELECT COUNT(*) AS `武器词条模板总数` FROM weapon_modifier_template;

-- -----------------------------------------------
-- 6.3 导入 equipment_adapter_template (装备适配模板)
-- -----------------------------------------------
-- 来源: data/mapped/equipment-adapter-templates.json
SELECT '--> 校验 equipment_adapter_template 数据完整性' AS `--`;
SELECT COUNT(*) AS `装备适配模板总数` FROM equipment_adapter_template;

-- -----------------------------------------------
-- 6.4 导入敌人数据
-- -----------------------------------------------
-- 来源: data/mapped/enemies.json (66条)
-- 注: 目标字段与现有enemy表结构匹配
-- 模板INSERT (实际执行时用Python脚本批量插入):
/*
INSERT INTO enemy (id, name, category, tier, max_stagger, stagger_node_count, stagger_node_duration, stagger_break_duration, execution_recovery)
VALUES
('eny_0045_agtrinit', '三位一体', '天使', 'boss', 280, 1, 2.0, 11.0, 100);
*/

-- -----------------------------------------------
-- 6.5 导入增益效果数据
-- -----------------------------------------------
-- 来源: data/mapped/gains.json (132条)
/*
INSERT INTO gain (id, name, source, gain_type, effect_category, effect_type, effect_value, value_type, stack_rule, target_scope, trigger_condition, duration, max_stacks, source_type, source_ref_id)
VALUES
('gain_chr_chr_0002_endminm_potential4_Agi', '角色-管理员-潜能4+敏捷值+25', '角色-管理员-潜能4', 'permanent', '能力值', '敏捷', 25, 'absolute', 'add_same', 'self', NULL, NULL, 1, 'character', 'chr_0002_endminm');
*/


-- ============================================================================
-- 第七部分: 数据导入 - 从extracted JSON导入战斗数据
-- ============================================================================

-- -----------------------------------------------
-- 7.1 导入攻击分段数据
-- -----------------------------------------------
-- 来源: data/extracted/attack_segments.json (25角色, 每角色5段, 共120段+166个tick)
-- 
-- 表attack_segment: 每角色5段 (segment_index 0~4)
-- 表attack_segment_tick: 每段1~9个伤害帧
-- 
-- 模板INSERT (实际执行时用Python脚本批量插入):
/*
-- attack_segment
INSERT INTO attack_segment (character_id, segment_index, duration, gauge_gain, allowed_types)
VALUES ('ENDMINISTRATOR', 0, 0.3300, 0, '["break","armor_break","ice_shatter","stagger","knockdown","knockup","nature_attach","corrosion","nature_burst","cold_attach","frozen","cold_burst","emag_attach","conductive","emag_burst","blaze_burst","burning","blaze_attach","default"]');

-- attack_segment_tick
INSERT INTO attack_segment_tick (character_id, segment_index, tick_index, offset, stagger, sp)
VALUES ('ENDMINISTRATOR', 0, 0, 0.2000, 0, 0);
*/

-- -----------------------------------------------
-- 7.2 导入技能动作数据
-- -----------------------------------------------
-- 来源: data/extracted/skill_actions.json
-- 涵盖: skill(战技), link(连携技), ultimate(终结技), execution(处决), variant(变体)
-- 表skill_action已存在
--
-- 模板INSERT:
/*
INSERT INTO skill_action (skill_id, duration, cast_time, sp_cost, gauge_gain, team_gauge_gain, cooldown, allowed_types, ultimate_gauge_max, ultimate_gauge_reply)
VALUES ('ENDMINISTRATOR_skill', 0.8000, 0.8000, 100, 6.5000, 6.5000, NULL, '["stagger","break","ice_shatter"]', NULL, NULL);
*/

-- -----------------------------------------------
-- 7.3 导入技能伤害帧数据
-- -----------------------------------------------
-- 来源: extracted JSON中每个skill的damage_ticks数组
-- 表skill_damage_tick已存在
-- 
-- 模板INSERT:
/*
INSERT INTO skill_damage_tick (skill_id, tick_index, offset, stagger, sp)
VALUES ('ENDMINISTRATOR_skill', 0, 0.3700, 10, 0);
*/

-- -----------------------------------------------
-- 7.4 导入技能异常效果数据
-- -----------------------------------------------
-- 来源: extracted JSON中每个skill的anomalies数组
-- 表skill_anomaly已存在
-- 
-- 模板INSERT:
/*
INSERT INTO skill_anomaly (skill_id, anomaly_index, group_index, type, stacks, duration, offset, delay)
VALUES ('ENDMINISTRATOR_skill', 0, 0, 'stagger', 1, 0, 0.3700, 0.0000);
*/


-- ============================================================================
-- 第八部分: 数据导入 - 从mapped JSON导入角色/武器/装备数据
-- ============================================================================

-- -----------------------------------------------
-- 8.1 导入角色基础数据
-- -----------------------------------------------
-- 来源: data/mapped/characters.json (基础角色条目)
-- 注: mapped JSON中的角色名与Wiki名称需要做匹配映射
-- 
-- mapped ID → Wiki名称映射关系:
-- chr_0002_endminm → 管理员(男)
-- chr_0003_endminf → 管理员(女) 
-- chr_0004_pelica → 佩丽卡
-- chr_0005_chen → 陈千语
-- chr_0006_wolfgd → 狼卫
-- chr_0012_avywen → 艾维文娜
-- chr_0015_lifeng → 黎风
-- chr_0016_laevat → 莱万汀
-- chr_0017_yvonne → 伊冯
-- chr_0018_dapan → 大潘
-- chr_0023_antal → 安塔尔
-- chr_0025_ardelia → 艾尔黛拉
-- chr_0026_lastrite → 别礼
-- chr_0027_tangtang → 汤汤
-- chr_0029_pograni → 骏卫
-- chr_0030_zhuangfy → 庄方宜
-- 注: 部分mapped角色(WIP角色)在Wiki中可能没有对应文件
--
-- 模板INSERT:
/*
INSERT INTO `character` (id, name, rarity, profession, element, weapon_type, main_attr, sub_attr, base_hp, base_atk, base_str, base_agi, base_int, base_wil)
VALUES ('chr_0002_endminm', '管理员', 6, '近卫', '物理', '单手剑', '敏捷', '力量', 500, 30, 14, 14, 9, 10);
*/

-- -----------------------------------------------
-- 8.2 导入武器基础数据
-- -----------------------------------------------
-- 来源: data/mapped/weapons.json
-- mapped ID → 武器名称映射(部分):
-- wpn_claym_0003 → 工业零点一, wpn_claym_0004 → 典范, wpn_claym_0005 → 骑士精神
-- wpn_claym_0006 → 昔日精品, wpn_claym_0007 → 热熔切割器, wpn_claym_0008 → 破碎君王
-- wpn_funnel_0001 → 长息, wpn_funnel_0004 → 迷失荒野, wpn_funnel_0005 → 悼亡诗
-- wpn_funnel_0006 → 作品:蚀迹, wpn_funnel_0007 → 莫奈何, wpn_funnel_0008 → 爆破单元
-- wpn_lance_0003 → 楔子, wpn_lance_0004 → 嵌合正义, wpn_pistol_0001 → 显锋
-- wpn_sword_0003 → 长路, wpn_sword_0004 → 骁勇, wpn_sword_0005 → 落草
--
-- 模板INSERT:
/*
INSERT INTO weapon (id, name, rarity, type, base_atk)
VALUES ('wpn_claym_0003', '工业零点一', 4, 'greatsword', 34);
*/

-- -----------------------------------------------
-- 8.3 导入装备数据
-- -----------------------------------------------
-- 来源: data/mapped/equips.json
-- 注: mapped JSON中的套组名与Wiki装备套组有名称差异，需要映射
-- 例如: suit_agi01 → mapped名"巡行信使" vs Wiki名"巡行信使" (相同)
-- suit_atk01 → mapped名"战术规划者" vs Wiki名"阿伯莉遗声" (不同!)
-- suit_stragi01 → mapped名"共振传播" vs Wiki名"集成重型" (不同!)
--
-- 模板INSERT:
/*
INSERT INTO equipment_set (id, name, set_effect_desc, piece_count)
VALUES ('suit_agi01', '巡行信使', '3件套组效果：装备者敏捷+50。', 3);
*/


-- ============================================================================
-- 第九部分: 华法琳Wiki TXT解析指导
-- ============================================================================

-- 华法琳Wiki数据为网页抓取后的文本格式(TXT)，需使用Python/Node脚本解析后入库。
-- 以下是解析规则概要:

-- 9.1 角色TXT解析规则:
--   1) 头部过滤: 跳过"华法琳Wiki"到"首页 / 干员 / {角色名}"之间的导航行
--   2) 总览字段: 使用制表符\t分割的"字段名\t值"格式, 如"名字\t佩丽卡"
--   3) 属性表格: "简略"子表为等级1/20/40/60/80/90的6列,
--      "详细"子表为等级1-90的90列, 各属性行紧随等级行
--   4) 晋升材料: "精英化·一"至"精英化·四"各段包含材料名和数量
--   5) 天赋: "天赋"标题后为天赋名、解锁条件和效果
--   6) 潜能: "潜能"标题后为1-5编号, 每个有名称和效果
--   7) 技能: 分为普通攻击/战技/连携技/终结技, 含倍率表格(Rank 1-M3)
--   8) 后勤技能: 技能名+解锁阶段+效果
--   9) 干员情报: 阵营/种族/专长/爱好各段
--   10) 档案: 基础档案+档案资料一至四
--   11) 语音记录: 各类别语音文本

-- 9.2 武器TXT解析规则:
--   1) 属性: 攻��力简要(6个关键等级值)和详细(90级逐级值)
--   2) 经验消耗: 90个数字
--   3) 折金票消耗: 90个数字
--   4) 升阶: 阶段0-4, 每个含等级需求、材料、技能(3个, 每个有当前/最大等级)

-- 9.3 装备TXT解析规则:
--   1) 套组ID: 从套组名称下一行获取(suit_xxx)
--   2) 套装效果: "3件套组效果"后的文本
--   3) 部件: 每个部件含名称、类型(护甲/护手/配件)、等级、防御力、Lv.1-Lv.4属性表

-- 推荐使用Python脚本解析流程:
--   1. 使用glob遍历data/华法琳Wiki/角色/*.txt
--   2. 逐文件解析文本, 提取结构化数据
--   3. 连接MySQL执行INSERT/UPDATE
--   4. 武器和装备同理


-- ============================================================================
-- 第十部分: 数据一致性校验
-- ============================================================================

-- 10.1 校验角色数据完整性
SELECT '角色数据完整性校验' AS `--`;
SELECT 
  c.id AS `角色ID`,
  c.name AS `角色名`,
  c.rarity AS `稀有度`,
  c.element AS `元素`,
  c.profession AS `职业`
FROM `character` c
ORDER BY c.rarity DESC, c.name;

-- 10.2 校验武器数据完整性
SELECT '武器数据完整性校验' AS `--`;
SELECT 
  w.id AS `武器ID`,
  w.name AS `武器名`,
  w.rarity AS `稀有度`,
  w.type AS `武器类型`
FROM weapon w
ORDER BY w.name;

-- 10.3 校验装备数据完整性
SELECT '装备数据完整性校验' AS `--`;
SELECT 
  DISTINCT e.set_name AS `套组名称`,
  COUNT(*) AS `部件数量`
FROM equipment e
WHERE e.set_name IS NOT NULL AND e.set_name != ''
GROUP BY e.set_name
ORDER BY e.set_name;

-- 10.4 校验攻击分段数据
SELECT '攻击分段数据校验' AS `--`;
SELECT 
  a.character_id AS `角色ID`,
  c.name AS `角色名`,
  COUNT(*) AS `分段数量`
FROM attack_segment a
LEFT JOIN `character` c ON a.character_id = c.id
GROUP BY a.character_id, c.name
ORDER BY c.name;

-- 10.5 校验技能数据
SELECT '技能数据校验' AS `--`;
SELECT 
  s.character_id AS `角色ID`,
  s.name AS `技能名称`,
  s.type AS `技能类型`,
  s.damage_type AS `伤害类型`
FROM skill s
ORDER BY s.character_id, s.type;

-- 10.6 校验敌人数据
SELECT '敌人数据校验' AS `--`;
SELECT 
  e.category AS `敌人类型`,
  COUNT(*) AS `数量`,
  GROUP_CONCAT(DISTINCT e.tier ORDER BY e.tier) AS `等级分布`
FROM enemy e
GROUP BY e.category
ORDER BY e.category;

-- 10.7 校验增益效果数据
SELECT '增益效果数据校验' AS `--`;
SELECT 
  g.effect_category AS `效果分类`,
  g.gain_type AS `增益类型`,
  COUNT(*) AS `数量`
FROM gain g
GROUP BY g.effect_category, g.gain_type
ORDER BY g.effect_category, g.gain_type;


-- ============================================================================
-- 第十一部分: 数据库注释更新(补充已有表的中文注释)
-- ============================================================================

ALTER TABLE `character` COMMENT = '角色基本信息(包含角色ID、名称、稀有度、职业、元素、属性等核心数据，及mapped数据)';
ALTER TABLE `character_stat` COMMENT = '角色等级属性(记录角色1-90级各等级的HP、ATK、STR、AGI、INT、WIL详细数值)';
ALTER TABLE `character_talent` COMMENT = '角色天赋(记录角色的被动天赋能力、突破阶段效果及数值)';
ALTER TABLE `weapon` COMMENT = '武器基本信息(包含武器名称、稀有度、类型、基础攻击力及词条信息，及mapped数据)';
ALTER TABLE `weapon_stat` COMMENT = '武器等级属性(记录武器1-90级各等级的基础攻击力数值)';
ALTER TABLE `weapon_affix` COMMENT = '武器词条潜能(记录武器各词条在不同潜能等级下的数值变化)';
ALTER TABLE `equipment` COMMENT = '装备详细信息(包含装备名称、部位、等级、防御力、套装名称、词条属性及精炼数值、套装效果等)';
ALTER TABLE `skill` COMMENT = '技能基本信息(记录技能的ID、名称、类型、伤害类型、描述等基本信息)';
ALTER TABLE `skill_action` COMMENT = '技能动作参数(记录技能的施法时间、冷却、SP消耗、连携量表获取、伤害帧、异常效果等详细战斗参数)';
ALTER TABLE `skill_cost` COMMENT = '技能消耗参数(记录技能各等级的消耗值、冷却时间、终结技能量、失衡倍率等)';
ALTER TABLE `skill_level` COMMENT = '技能等级倍率(记录技能在1-12级(M3)各等级的倍率值)';
ALTER TABLE `skill_anomaly` COMMENT = '技能异常效果(记录技能附加的异常状态类型、层数、持续时间等参数)';
ALTER TABLE `skill_damage_tick` COMMENT = '技能伤害判定帧(记录技能伤害在时间轴上的判定点偏移、失衡值、技力获取)';
ALTER TABLE `attack_segment` COMMENT = '普攻分段参数(记录普通攻击的段数、动画时长、连携量表、允许异常类型等)';
ALTER TABLE `attack_segment_tick` COMMENT = '普攻分段伤害(记录普通攻击各段的伤害判定帧偏移、失衡值和技力获取)';
ALTER TABLE `modifier_def` COMMENT = '修饰符定义(装备/武器词条的修饰符类型定义，如主能力提升、暴击率提升等)';
ALTER TABLE `weapon_modifier_template` COMMENT = '武器词条模板数值(各修饰符在不同尺寸small/medium/large和等级0-8下的数值模板)';
ALTER TABLE `equipment_adapter_template` COMMENT = '装备适配槽模板(各修饰符在不同部位、单双槽配置和精炼等级下的数值模板)';
ALTER TABLE `gain` COMMENT = '增益效果(记录角色潜能、武器词条、装备套装等来源的增益效果数值和触发条件)';
ALTER TABLE `enemy` COMMENT = '敌人数据(记录敌人的类型、等级、失衡值、失衡节点等战斗属性)';
ALTER TABLE `build` COMMENT = '配装方案(角色的武器、装备、潜能、增益等完整配置方案)';
ALTER TABLE `team` COMMENT = '队伍方案(最多4名角色及其配装方案的队伍配置)';
ALTER TABLE `timeline_scenario` COMMENT = '排轴方案(队伍在战斗中的时间轴序列规划，含敌人配置和自定义参数)';

SELECT '数据库迁移脚本执行完毕' AS `执行结果`;
SELECT '请使用Python/Node脚本解析JSON文件(extracted/skill_actions.json, attack_segments.json)和mapped JSON文件后执行数据INSERT' AS `后续步骤`;
