-- 终末地数据编辑器 完整 DDL
-- 适用: MySQL 8.0

-- 1. 角色表
CREATE TABLE IF NOT EXISTS `character` (
    `id`            VARCHAR(32)     NOT NULL PRIMARY KEY COMMENT '角色ID',
    `name`          VARCHAR(50)     NOT NULL COMMENT '角色名称',
    `icon`          TEXT COMMENT '角色图标 Base64 128x128',
    `rarity`        TINYINT         NOT NULL CHECK (`rarity` BETWEEN 4 AND 6) COMMENT '稀有度 4~6',
    `level`         INT             NOT NULL DEFAULT 90 COMMENT '等级 1~90',
    `base_hp`       DECIMAL(12,4)   NOT NULL COMMENT '基础生命值',
    `base_atk`      DECIMAL(12,4)   NOT NULL COMMENT '基础攻击力',
    `base_str`      DECIMAL(10,4)   NOT NULL COMMENT '基础力量',
    `base_agi`      DECIMAL(10,4)   NOT NULL COMMENT '基础敏捷',
    `base_int`      DECIMAL(10,4)   NOT NULL COMMENT '基础智识',
    `base_wil`      DECIMAL(10,4)   NOT NULL COMMENT '基础意志',
    `main_attr`     VARCHAR(10)     NOT NULL COMMENT '主能力 str/agi/int/wil',
    `sub_attr`      VARCHAR(10)     NOT NULL COMMENT '副能力 str/agi/int/wil',
    `profession`    VARCHAR(20)     NOT NULL COMMENT '职业 assault/guard/caster/heavy/vanguard/support',
    `element`       VARCHAR(20)     NOT NULL COMMENT '属性 pyro/cryo/electro/natural/physical',
    `weapon_type`   VARCHAR(20)     NOT NULL COMMENT '可用武器类型',
    `potential`     TINYINT         NOT NULL DEFAULT 0 CHECK (`potential` BETWEEN 0 AND 5) COMMENT '潜能 0~5',
    `reserve1`      VARCHAR(255)    COMMENT '备用1',
    `reserve2`      VARCHAR(255)    COMMENT '备用2',
    `created_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_name` (`name`),
    INDEX `idx_profession` (`profession`),
    INDEX `idx_element` (`element`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色基础数据';

-- 2. 武器表
CREATE TABLE IF NOT EXISTS `weapon` (
    `id`                VARCHAR(32)     NOT NULL PRIMARY KEY COMMENT '武器ID',
    `name`              VARCHAR(50)     NOT NULL COMMENT '武器名称',
    `icon`              TEXT COMMENT '武器图标 Base64',
    `rarity`            TINYINT         NOT NULL CHECK (`rarity` BETWEEN 3 AND 6) COMMENT '稀有度 3~6',
    `potential`         TINYINT         NOT NULL DEFAULT 0 CHECK (`potential` BETWEEN 0 AND 5) COMMENT '潜能 0~5',
    `type`              VARCHAR(20)     NOT NULL COMMENT '武器类型',
    `level`             INT             NOT NULL DEFAULT 90 COMMENT '等级 1~90',
    `base_atk`          DECIMAL(12,4)   NOT NULL COMMENT '基础攻击力',
    `affix1_name`       VARCHAR(50)     COMMENT '词条1名称',
    `affix1_type`       VARCHAR(20)     COMMENT '词条1类型',
    `affix1_size`       VARCHAR(10)     COMMENT '词条1规格 small/medium/large',
    `affix1_level`      TINYINT         DEFAULT 0 COMMENT '词条1等级 0~9',
    `affix1_value`      DECIMAL(12,4)   COMMENT '词条1数值',
    `affix2_name`       VARCHAR(50)     COMMENT '词条2名称',
    `affix2_type`       VARCHAR(30)     COMMENT '词条2类型',
    `affix2_size`       VARCHAR(10)     COMMENT '词条2规格',
    `affix2_level`      TINYINT         DEFAULT 0 COMMENT '词条2等级',
    `affix2_value`      DECIMAL(10,4)   COMMENT '词条2数值',
    `affix3_name`       VARCHAR(50)     COMMENT '词条3名称',
    `affix3_type`       VARCHAR(30)     COMMENT '词条3类型',
    `affix3_level`      TINYINT         DEFAULT 0 COMMENT '词条3等级',
    `affix3_effect1`    VARCHAR(100)    COMMENT '词条3效果1',
    `affix3_effect2`    VARCHAR(100)    COMMENT '词条3效果2',
    `affix3_effect3`    VARCHAR(100)    COMMENT '词条3效果3',
    `affix3_desc`       TEXT            COMMENT '词条3描述',
    `reserve1`          VARCHAR(255)    COMMENT '备用1',
    `reserve2`          VARCHAR(255)    COMMENT '备用2',
    `created_at`        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_name` (`name`),
    INDEX `idx_type` (`type`),
    INDEX `idx_rarity` (`rarity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='武器基础数据';

-- 3. 装备表
CREATE TABLE IF NOT EXISTS `equipment` (
    `id`                    VARCHAR(64)     NOT NULL PRIMARY KEY COMMENT '装备ID',
    `name`                  VARCHAR(50)     NOT NULL COMMENT '装备名称',
    `icon`                  TEXT COMMENT '装备图标',
    `slot`                  VARCHAR(10)     NOT NULL COMMENT '部位 armor/glove/accessory',
    `level`                 INT             NOT NULL COMMENT '等级 10/20/28/36/50/70',
    `base_def`              INT             NOT NULL COMMENT '基础防御力',
    `set_name`              VARCHAR(50)     COMMENT '套装名称',
    `attr1_type`            VARCHAR(20)     COMMENT '属性1类型',
    `attr1_refine`          TINYINT         DEFAULT 0 CHECK (`attr1_refine` BETWEEN 0 AND 3) COMMENT '属性1精锻',
    `attr1_value`           DECIMAL(12,4)   COMMENT '属性1精锻0值',
    `attr1_v1`              DECIMAL(12,4)   COMMENT '属性1精锻1值',
    `attr1_v2`              DECIMAL(12,4)   COMMENT '属性1精锻2值',
    `attr1_v3`              DECIMAL(12,4)   COMMENT '属性1精锻3值',
    `attr2_type`            VARCHAR(20)     COMMENT '属性2类型',
    `attr2_refine`          TINYINT         DEFAULT 0 CHECK (`attr2_refine` BETWEEN 0 AND 3),
    `attr2_value`           DECIMAL(12,4)   COMMENT '属性2精锻0值',
    `attr2_v1`              DECIMAL(12,4)   COMMENT '属性2精锻1值',
    `attr2_v2`              DECIMAL(12,4)   COMMENT '属性2精锻2值',
    `attr2_v3`              DECIMAL(12,4)   COMMENT '属性2精锻3值',
    `attr3_type`            VARCHAR(50)     COMMENT '属性3类型',
    `attr3_refine`          TINYINT         DEFAULT 0 CHECK (`attr3_refine` BETWEEN 0 AND 3),
    `attr3_value`           DECIMAL(10,4)   COMMENT '属性3精锻0值',
    `attr3_v1`              DECIMAL(10,4)   COMMENT '属性3精锻1值',
    `attr3_v2`              DECIMAL(10,4)   COMMENT '属性3精锻2值',
    `attr3_v3`              DECIMAL(10,4)   COMMENT '属性3精锻3值',
    `set_effect1_name`      VARCHAR(100)    COMMENT '套装效果1名称',
    `set_effect1_type`      VARCHAR(10)     COMMENT '套装效果1类型 permanent/limited',
    `set_effect1_etype`     VARCHAR(50)     COMMENT '套装效果1效果类型',
    `set_effect1_value`     DECIMAL(10,4)   COMMENT '套装效果1数值',
    `set_effect1_desc`      TEXT            COMMENT '套装效果1描述',
    `set_effect2_name`      VARCHAR(100)    COMMENT '套装效果2名称',
    `set_effect2_type`      VARCHAR(10)     COMMENT '套装效果2类型',
    `set_effect2_etype`     VARCHAR(50)     COMMENT '套装效果2效果类型',
    `set_effect2_value`     DECIMAL(10,4)   COMMENT '套装效果2数值',
    `set_effect2_condition` VARCHAR(200)    COMMENT '套装效果2触发条件',
    `set_effect2_duration`  DECIMAL(8,4)    COMMENT '套装效果2持续秒',
    `set_effect2_desc`      TEXT            COMMENT '套装效果2描述',
    `reserve1`              VARCHAR(255)    COMMENT '备用1',
    `reserve2`              VARCHAR(255)    COMMENT '备用2',
    `created_at`            DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`            DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_name` (`name`),
    INDEX `idx_slot` (`slot`),
    INDEX `idx_set_name` (`set_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='装备基础数据';

-- 4. 增益表
CREATE TABLE IF NOT EXISTS `gain` (
    `id`                VARCHAR(64)     NOT NULL PRIMARY KEY COMMENT '增益ID',
    `name`              VARCHAR(100)    NOT NULL COMMENT '增益名称',
    `source`            VARCHAR(200)    NOT NULL COMMENT '增益来源',
    `gain_type`         VARCHAR(10)     NOT NULL COMMENT 'permanent/limited',
    `effect_category`   VARCHAR(50)     NOT NULL COMMENT '效果大类(乘区分组)',
    `effect_type`       VARCHAR(50)     NOT NULL COMMENT '效果具体类型',
    `effect_value`      DECIMAL(12,4)   NOT NULL COMMENT '效果数值',
    `value_type`        VARCHAR(10)     DEFAULT 'percentage' COMMENT 'absolute/percentage',
    `stack_rule`        VARCHAR(10)     DEFAULT 'add_same' COMMENT 'add_same/multi_diff',
    `target_scope`      VARCHAR(10)     NOT NULL COMMENT 'self/team/character',
    `target_char_id`    VARCHAR(32)     COMMENT '指定角色ID',
    `trigger_condition` VARCHAR(200)    COMMENT '触发条件',
    `duration`          DECIMAL(8,4)    COMMENT '持续秒',
    `max_stacks`        INT             DEFAULT 1 COMMENT '最大叠加',
    `source_type`       VARCHAR(255)    COMMENT '来源类型: character/weapon/set/other',
    `source_ref_id`     VARCHAR(255)    COMMENT '来源引用ID',
    `created_at`        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_name` (`name`),
    INDEX `idx_gain_type` (`gain_type`),
    INDEX `idx_effect_category` (`effect_category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='增益数据';

-- 5. 技能表
CREATE TABLE IF NOT EXISTS `skill` (
    `id`            VARCHAR(32)     NOT NULL PRIMARY KEY COMMENT '技能ID',
    `character_id`  VARCHAR(32)     NOT NULL COMMENT '所属角色ID',
    `name`          VARCHAR(50)     NOT NULL COMMENT '技能名称',
    `type`          VARCHAR(20)     NOT NULL COMMENT '技能类型 normal/skill/chain/ultimate/talent1/talent2/other',
    `damage_type`   VARCHAR(20)     NOT NULL COMMENT '伤害类型 pyro/cryo/electro/natural/physical/ultra/true/other',
    `description`   TEXT            COMMENT '技能描述',
    `reserve1`      VARCHAR(255)    COMMENT '备用1',
    `reserve2`      VARCHAR(255)    COMMENT '备用2',
    `created_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_character` (`character_id`),
    INDEX `idx_type` (`type`),
    INDEX `idx_damage_type` (`damage_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='技能基础数据';

-- 6. 技能等级倍率表
CREATE TABLE IF NOT EXISTS `skill_level` (
    `skill_id`      VARCHAR(32)     NOT NULL COMMENT '技能ID',
    `level`         TINYINT         NOT NULL CHECK (`level` BETWEEN 1 AND 12) COMMENT '等级 1~12',
    `multiplier`    DECIMAL(10,4)   NOT NULL COMMENT '倍率%',
    `created_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`skill_id`, `level`),
    FOREIGN KEY (`skill_id`) REFERENCES `skill`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='技能等级倍率';

-- 7. 技能动作资源表 (v2.0+)
CREATE TABLE IF NOT EXISTS `skill_action` (
    `skill_id`              VARCHAR(32)     NOT NULL PRIMARY KEY COMMENT '技能ID',
    `cast_time`             DECIMAL(8,4)    DEFAULT 0 COMMENT '施法耗时秒',
    `pre_cast`              DECIMAL(8,4)    DEFAULT 0 COMMENT '前摇秒',
    `post_cast`             DECIMAL(8,4)    DEFAULT 0 COMMENT '后摇秒',
    `tech_cost`             INT             DEFAULT 100 COMMENT '技力消耗',
    `tech_return`           INT             DEFAULT 0 COMMENT '技力返还',
    `tech_regen`            INT             DEFAULT 0 COMMENT '技力回复',
    `chain_cd`              DECIMAL(8,4)    COMMENT '连携技CD',
    `ultimate_cd`           DECIMAL(8,4)    COMMENT '终结技CD',
    `energy_regen_self`     INT             COMMENT '自我能量回复',
    `energy_regen_cond`     TEXT            COMMENT '能量回复条件',
    `apply_attachment`      VARCHAR(100)    COMMENT '施加法术附着',
    `apply_break`           INT             DEFAULT 0 COMMENT '施加破防层数',
    `consume_attachment`    VARCHAR(100)    COMMENT '消耗法术附着',
    `consume_break`         INT             DEFAULT 0 COMMENT '消耗破防层数',
    `chain_trigger`         TEXT            COMMENT '连携技触发条件',
    `reserve1`              VARCHAR(255)    COMMENT '备用1',
    `reserve2`              VARCHAR(255)    COMMENT '备用2',
    `created_at`            DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`            DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`skill_id`) REFERENCES `skill`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='技能动作资源参数';

-- 8. 配装方案表
CREATE TABLE IF NOT EXISTS `build` (
    `id`                VARCHAR(32)     NOT NULL PRIMARY KEY COMMENT '方案ID',
    `name`              VARCHAR(100)    NOT NULL COMMENT '方案名称',
    `character_id`      VARCHAR(32)     NOT NULL COMMENT '角色ID',
    `weapon_id`         VARCHAR(32)     COMMENT '武器ID',
    `armor_id`          VARCHAR(64)     COMMENT '护甲ID',
    `glove_id`          VARCHAR(64)     COMMENT '护手ID',
    `accessory1_id`     VARCHAR(64)     COMMENT '配件1ID',
    `accessory2_id`     VARCHAR(64)     COMMENT '配件2ID',
    `char_level`        INT             COMMENT '角色等级快照',
    `weapon_level`      INT             COMMENT '武器等级快照',
    `equip_level`       INT             COMMENT '装备等级快照',
    `affix1_level`      TINYINT         DEFAULT 1 COMMENT '武器词条1等级',
    `affix2_level`      TINYINT         DEFAULT 1 COMMENT '武器词条2等级',
    `affix3_level`      TINYINT         DEFAULT 1 COMMENT '武器词条3等级',
    `equip_refines`     JSON            COMMENT '装备精锻数据',
    `selected_gains`    JSON            COMMENT '已选增益ID列表',
    `char_potential`    TINYINT         DEFAULT 0 COMMENT '角色潜能',
    `weapon_potential`  TINYINT         DEFAULT 0 COMMENT '武器潜能',
    `reserve1`          VARCHAR(255)    COMMENT '备用1',
    `reserve2`          VARCHAR(255)    COMMENT '备用2',
    `created_at`        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_character` (`character_id`),
    FOREIGN KEY (`character_id`) REFERENCES `character`(`id`),
    FOREIGN KEY (`weapon_id`) REFERENCES `weapon`(`id`),
    FOREIGN KEY (`armor_id`) REFERENCES `equipment`(`id`),
    FOREIGN KEY (`glove_id`) REFERENCES `equipment`(`id`),
    FOREIGN KEY (`accessory1_id`) REFERENCES `equipment`(`id`),
    FOREIGN KEY (`accessory2_id`) REFERENCES `equipment`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='配装方案';

-- 9. 配队方案表 (v1.2+)
CREATE TABLE IF NOT EXISTS `team` (
    `id`                VARCHAR(32)     NOT NULL PRIMARY KEY COMMENT '配队ID',
    `name`              VARCHAR(100)    NOT NULL COMMENT '配队名称',
    `char_a_id`         VARCHAR(32)     COMMENT '角色A',
    `build_a_id`        VARCHAR(32)     COMMENT '角色A方案',
    `char_b_id`         VARCHAR(32)     COMMENT '角色B',
    `build_b_id`        VARCHAR(32)     COMMENT '角色B方案',
    `char_c_id`         VARCHAR(32)     COMMENT '角色C',
    `build_c_id`        VARCHAR(32)     COMMENT '角色C方案',
    `char_d_id`         VARCHAR(32)     COMMENT '角色D',
    `build_d_id`        VARCHAR(32)     COMMENT '角色D方案',
    `reserve1`          VARCHAR(255)    COMMENT '备用1',
    `reserve2`          VARCHAR(255)    COMMENT '备用2',
    `created_at`        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='配队方案';

-- 10. 角色等级属性表 (v1.2+)
CREATE TABLE IF NOT EXISTS `character_stat` (
    `character_id`      VARCHAR(32)     NOT NULL COMMENT '角色ID',
    `level`             TINYINT         NOT NULL CHECK (`level` BETWEEN 1 AND 90) COMMENT '等级 1~90',
    `hp`                DECIMAL(12,4)   NOT NULL COMMENT '生命值',
    `atk`               DECIMAL(12,4)   NOT NULL COMMENT '攻击力',
    `str`               DECIMAL(10,4)   NOT NULL COMMENT '力量',
    `agi`               DECIMAL(10,4)   NOT NULL COMMENT '敏捷',
    `int`               DECIMAL(10,4)   NOT NULL COMMENT '智识',
    `wil`               DECIMAL(10,4)   NOT NULL COMMENT '意志',
    `phys_dmg_coeff`    DECIMAL(10,4)   COMMENT '物理异常伤害系数',
    `magic_dmg_coeff`   DECIMAL(10,4)   COMMENT '法术异常伤害系数',
    `created_at`        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`character_id`, `level`),
    FOREIGN KEY (`character_id`) REFERENCES `character`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色等级属性';

-- 11. 武器等级属性表 (v1.2+)
CREATE TABLE IF NOT EXISTS `weapon_stat` (
    `weapon_id`         VARCHAR(32)     NOT NULL COMMENT '武器ID',
    `level`             TINYINT         NOT NULL CHECK (`level` BETWEEN 1 AND 90) COMMENT '等级 1~90',
    `base_atk`          DECIMAL(12,4)   NOT NULL COMMENT '基础攻击力',
    `created_at`        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`weapon_id`, `level`),
    FOREIGN KEY (`weapon_id`) REFERENCES `weapon`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='武器等级属性';

-- 12. 武器词条潜能表 (v1.2+)
CREATE TABLE IF NOT EXISTS `weapon_affix` (
    `weapon_id`         VARCHAR(32)     NOT NULL COMMENT '武器ID',
    `affix_index`       TINYINT         NOT NULL COMMENT '词条序号 1/2/3',
    `potential`         TINYINT         NOT NULL CHECK (`potential` BETWEEN 0 AND 8) COMMENT '潜能等级 0~8',
    `name`              VARCHAR(50)     COMMENT '词条名称',
    `type`              VARCHAR(20)     COMMENT '词条类型(键)',
    `size`              VARCHAR(10)     COMMENT '规格 small/medium/large',
    `value`             DECIMAL(12,4)   COMMENT '词条数值',
    `effect1`           VARCHAR(100)    COMMENT '词条3效果1',
    `effect2`           VARCHAR(100)    COMMENT '词条3效果2',
    `effect3`           VARCHAR(100)    COMMENT '词条3效果3',
    `created_at`        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`weapon_id`, `affix_index`, `potential`),
    FOREIGN KEY (`weapon_id`) REFERENCES `weapon`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='武器词条潜能';

-- 13. 角色天赋表 (v1.2+)
CREATE TABLE IF NOT EXISTS `character_talent` (
    `id`                VARCHAR(32)     NOT NULL PRIMARY KEY COMMENT '天赋ID',
    `character_id`      VARCHAR(32)     NOT NULL COMMENT '角色ID',
    `name`              VARCHAR(50)     NOT NULL COMMENT '天赋名称',
    `talent_index`      TINYINT         NOT NULL CHECK (`talent_index` BETWEEN 1 AND 4) COMMENT '天赋序号 1~4',
    `stage`             TINYINT         NOT NULL DEFAULT 1 CHECK (`stage` BETWEEN 1 AND 4) COMMENT '天赋阶段 1~4',
    `description`       TEXT            COMMENT '天赋描述',
    `values`            JSON            COMMENT '天赋数值',
    `created_at`        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_character` (`character_id`),
    FOREIGN KEY (`character_id`) REFERENCES `character`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色天赋';

-- 15. 排轴方案表 (v1.3+)
CREATE TABLE IF NOT EXISTS `timeline_scenario` (
    `id`                    VARCHAR(32)     NOT NULL PRIMARY KEY COMMENT '排轴方案ID',
    `name`                  VARCHAR(100)    NOT NULL COMMENT '方案名称',
    `team_id`               VARCHAR(32)     COMMENT '关联配队ID',
    `system_constants`      TEXT            COMMENT '战斗常量JSON (maxSp, spRegenRate等)',
    `prep_duration`         DECIMAL(8,4)    DEFAULT 0 COMMENT '准备时间(秒)',
    `active_enemy_id`       VARCHAR(32)     COMMENT '当前敌人ID',
    `custom_enemy_params`   TEXT            COMMENT '自定义敌人参数JSON',
    `tracks`                 LONGTEXT        COMMENT '干员轨道与动作数据JSON',
    `enemies`                LONGTEXT        COMMENT '敌人配置JSON(TimelineEnemy[])',
    `sort_order`            INT             DEFAULT 0 COMMENT '排序序号',
    `enemy_buffs`           TEXT            COMMENT '敌人增益JSON',
    `reserve2`              TEXT            COMMENT '备用2',
    `reserve3`              TEXT            COMMENT '备用3',
    `reserve4`              TEXT            COMMENT '备用4',
    `created_at`            DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`            DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_team_id` (`team_id`),
    INDEX `idx_name` (`name`),
    FOREIGN KEY (`team_id`) REFERENCES `team`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='排轴方案数据';

-- 14. 技能消耗表 (v1.2+)
CREATE TABLE IF NOT EXISTS `skill_cost` (
    `skill_id`          VARCHAR(32)     NOT NULL COMMENT '技能ID',
    `level`             TINYINT         NOT NULL CHECK (`level` BETWEEN 1 AND 12) COMMENT '等级 1~12',
    `cost_value`        INT             COMMENT '技力消耗',
    `cool_down`         DECIMAL(8,4)    COMMENT '冷却时间(秒)',
    `usp`               INT             COMMENT '终结技能量',
    `poise`             DECIMAL(8,4)    COMMENT '失衡倍率',
    `airborne_scale`    DECIMAL(8,4)    COMMENT '浮空倍率',
    `created_at`        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`skill_id`, `level`),
    FOREIGN KEY (`skill_id`) REFERENCES `skill`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='技能消耗参数';

-- 16. 技能动作表扩展 (v1.4+ 排轴模拟)
ALTER TABLE `skill_action`
    ADD COLUMN IF NOT EXISTS `duration`              DECIMAL(8,4)    COMMENT '技能动画时长(秒)',
    ADD COLUMN IF NOT EXISTS `sp_cost`               INT              COMMENT '技力消耗',
    ADD COLUMN IF NOT EXISTS `gauge_gain`            DECIMAL(8,4)    COMMENT '连携量表获取',
    ADD COLUMN IF NOT EXISTS `team_gauge_gain`       DECIMAL(8,4)    COMMENT '队伍连携量表获取',
    ADD COLUMN IF NOT EXISTS `cooldown`              DECIMAL(8,4)    COMMENT '冷却时间(秒)',
    ADD COLUMN IF NOT EXISTS `allowed_types`         JSON             COMMENT '允许的异常/攻击类型列表',
    ADD COLUMN IF NOT EXISTS `ultimate_gauge_max`    INT              COMMENT '终结技能量上限',
    ADD COLUMN IF NOT EXISTS `ultimate_gauge_reply`  INT              COMMENT '终结技能量回复',
    ADD COLUMN IF NOT EXISTS `damage_ticks`          TEXT             COMMENT '伤害判定帧JSON';

-- 17. 技能伤害判定帧表 (v1.4+)
CREATE TABLE IF NOT EXISTS `skill_damage_tick` (
    `skill_id`          VARCHAR(32)     NOT NULL COMMENT '技能ID',
    `tick_index`        TINYINT         NOT NULL COMMENT '伤害帧序号',
    `offset`            DECIMAL(8,4)    NOT NULL COMMENT '相对技能开始时间偏移(秒)',
    `stagger`           INT             DEFAULT 0 COMMENT '失衡值',
    `sp`                INT             DEFAULT 0 COMMENT '技力获取',
    `bound_effects`     JSON            COMMENT '绑定的效果ID列表',
    `created_at`        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`skill_id`, `tick_index`),
    FOREIGN KEY (`skill_id`) REFERENCES `skill_action`(`skill_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='技能伤害判定帧';

-- 18. 技能异常附着表 (v1.4+)
CREATE TABLE IF NOT EXISTS `skill_anomaly` (
    `skill_id`          VARCHAR(32)     NOT NULL COMMENT '技能ID',
    `anomaly_index`     TINYINT         NOT NULL COMMENT '异常序号',
    `group_index`       TINYINT         NOT NULL DEFAULT 0 COMMENT '异常组索引',
    `type`              VARCHAR(32)     NOT NULL COMMENT '异常类型',
    `stacks`            INT             DEFAULT 1 COMMENT '叠加层数',
    `duration`          DECIMAL(8,4)    DEFAULT 0 COMMENT '持续时间(秒)',
    `offset`            DECIMAL(8,4)    DEFAULT 0 COMMENT '触发偏移(秒)',
    `delay`             DECIMAL(8,4)    DEFAULT 0 COMMENT '异常延迟(秒)',
    `created_at`        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`skill_id`, `anomaly_index`),
    FOREIGN KEY (`skill_id`) REFERENCES `skill_action`(`skill_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='技能异常附着';

-- 19. 普攻分段表 (v1.4+)
CREATE TABLE IF NOT EXISTS `attack_segment` (
    `character_id`      VARCHAR(32)     NOT NULL COMMENT '角色ID',
    `segment_index`     TINYINT         NOT NULL COMMENT '段数 0开始',
    `duration`          DECIMAL(8,4)    NOT NULL COMMENT '本段动画时长(秒)',
    `gauge_gain`        DECIMAL(8,4)    DEFAULT 0 COMMENT '连携量表获取',
    `allowed_types`     JSON            COMMENT '允许的异常类型列表',
    `created_at`        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`character_id`, `segment_index`),
    FOREIGN KEY (`character_id`) REFERENCES `character`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='普攻分段参数';

-- 20. 普攻分段伤害帧表 (v1.4+)
CREATE TABLE IF NOT EXISTS `attack_segment_tick` (
    `character_id`      VARCHAR(32)     NOT NULL COMMENT '角色ID',
    `segment_index`     TINYINT         NOT NULL COMMENT '段数',
    `tick_index`        TINYINT         NOT NULL COMMENT '伤害帧序号',
    `offset`            DECIMAL(8,4)    NOT NULL COMMENT '相对段开始偏移(秒)',
    `stagger`           INT             DEFAULT 0 COMMENT '失衡值',
    `sp`                INT             DEFAULT 0 COMMENT '技力获取',
    `created_at`        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`character_id`, `segment_index`, `tick_index`),
    FOREIGN KEY (`character_id`, `segment_index`) REFERENCES `attack_segment`(`character_id`, `segment_index`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='普攻分段伤害帧';

-- 21. 敌人数据库表 (v1.4+)
CREATE TABLE IF NOT EXISTS `enemy` (
    `id`                    VARCHAR(32)     NOT NULL PRIMARY KEY COMMENT '敌人ID',
    `name`                  VARCHAR(50)     NOT NULL COMMENT '敌人名称',
    `category`              VARCHAR(32)     COMMENT '敌人类型',
    `tier`                  VARCHAR(10)     COMMENT '等级 tier',
    `max_stagger`           INT             DEFAULT 0 COMMENT '最大失衡值',
    `stagger_node_count`    INT             DEFAULT 1 COMMENT '失衡节点数',
    `stagger_node_duration` DECIMAL(8,4)    COMMENT '失衡节点持续时间(秒)',
    `stagger_break_duration` DECIMAL(8,4)   COMMENT '失衡击破持续时间(秒)',
    `execution_recovery`    DECIMAL(8,4)    COMMENT '处决回复',
    `created_at`            DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`            DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_name` (`name`),
    INDEX `idx_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='敌人数据库';

-- 22. 修饰符定义表 (v1.4+)
CREATE TABLE IF NOT EXISTS `modifier_def` (
    `id`            VARCHAR(32)     NOT NULL PRIMARY KEY COMMENT '修饰符ID',
    `label`         VARCHAR(50)     NOT NULL COMMENT '中文标签',
    `unit`          VARCHAR(10)     DEFAULT 'flat' COMMENT '单位: flat/percent',
    `created_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='修饰符定义';

-- 23. 武器词条模板数值表 (v1.4+)
CREATE TABLE IF NOT EXISTS `weapon_modifier_template` (
    `modifier_id`   VARCHAR(32)     NOT NULL COMMENT '修饰符ID',
    `size`          VARCHAR(10)     NOT NULL COMMENT 'small/medium/large',
    `level`         TINYINT         NOT NULL CHECK (`level` BETWEEN 0 AND 8) COMMENT '词条等级 0~8',
    `value`         DECIMAL(10,4)   NOT NULL COMMENT '数值',
    `created_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`modifier_id`, `size`, `level`),
    FOREIGN KEY (`modifier_id`) REFERENCES `modifier_def`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='武器词条模板数值';

-- 24. 装备适配槽模板数值表 (v1.4+)
CREATE TABLE IF NOT EXISTS `equipment_adapter_template` (
    `modifier_id`   VARCHAR(32)     NOT NULL COMMENT '修饰符ID',
    `slot`          VARCHAR(10)     NOT NULL COMMENT 'armor/gloves/accessory',
    `config`        VARCHAR(10)     NOT NULL COMMENT 'Single/Dual',
    `refine`        TINYINT         NOT NULL CHECK (`refine` BETWEEN 0 AND 3) COMMENT '精锻等级 0~3',
    `value`         DECIMAL(10,4)   NOT NULL COMMENT '数值',
    `created_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`modifier_id`, `slot`, `config`, `refine`),
    FOREIGN KEY (`modifier_id`) REFERENCES `modifier_def`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='装备适配槽模板数值';
