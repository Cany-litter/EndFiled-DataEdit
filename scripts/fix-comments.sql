-- Fix garbled column comments for character_stat table
-- Run with: mysql -u root -p endfiled < scripts/fix-comments.sql

ALTER TABLE character_stat
  MODIFY COLUMN character_id     VARCHAR(32)  NOT NULL COMMENT '角色ID',
  MODIFY COLUMN level            TINYINT      NOT NULL COMMENT '等级 1~90',
  MODIFY COLUMN hp               DECIMAL(12,4) NOT NULL COMMENT '生命值',
  MODIFY COLUMN atk              DECIMAL(12,4) NOT NULL COMMENT '攻击力',
  MODIFY COLUMN str              DECIMAL(10,4) NOT NULL COMMENT '力量',
  MODIFY COLUMN agi              DECIMAL(10,4) NOT NULL COMMENT '敏捷',
  MODIFY COLUMN `int`            DECIMAL(10,4) NOT NULL COMMENT '智识',
  MODIFY COLUMN wil              DECIMAL(10,4) NOT NULL COMMENT '意志',
  MODIFY COLUMN phys_dmg_coeff   DECIMAL(10,4) COMMENT '物理异常伤害系数',
  MODIFY COLUMN magic_dmg_coeff  DECIMAL(10,4) COMMENT '法术异常伤害系数';
