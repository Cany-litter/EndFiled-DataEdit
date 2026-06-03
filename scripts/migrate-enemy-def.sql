-- 将防御从 enemy_stat 迁移到 enemy 表
ALTER TABLE enemy ADD COLUMN IF NOT EXISTS def INT DEFAULT 100 COMMENT '防御力(固定值，不随等级变化)';

-- 从 enemy_stat 中取最高等级的 def 作为默认值
UPDATE enemy e SET e.def = (
  SELECT es.def FROM enemy_stat es
  WHERE es.enemy_id = e.id
  ORDER BY es.level DESC LIMIT 1
) WHERE e.def IS NULL OR e.def = 0;

-- 未匹配到的设为 100
UPDATE enemy SET def = 100 WHERE def IS NULL OR def = 0;
