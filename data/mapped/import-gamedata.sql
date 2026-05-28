-- modifier_def
INSERT INTO `modifier_def` (`id`, `label`, `unit`) VALUES
('primary_ability', '主能力提升', 'flat'),
('secondary_ability', '副能力提升', 'flat'),
('strength', '力量提升', 'flat'),
('agility', '敏捷提升', 'flat'),
('intellect', '智识提升', 'flat'),
('will', '意志提升', 'flat'),
('attack', '攻击提升', 'percent'),
('hp', '生命提升', 'percent'),
('crit_rate', '暴击率提升', 'percent'),
('blaze_dmg', '灼热伤害提升', 'percent'),
('emag_dmg', '电磁伤害提升', 'percent'),
('cold_dmg', '寒冷伤害提升', 'percent'),
('nature_dmg', '自然伤害提升', 'percent'),
('healing_effect', '治疗效果提升', 'percent'),
('physical_dmg', '物理伤害提升', 'percent'),
('arts_dmg', '法术伤害提升', 'percent'),
('originium_arts_power', '源石技艺强度提升', 'flat'),
('ult_charge_eff', '终结技充能效率提升', 'percent'),
('link_cd_reduction', '连携冷却缩减提升', 'flat'),
('attack_dmg_bonus', '普通攻击伤害加成提升', 'flat'),
('skill_dmg_bonus', '战技伤害加成提升', 'flat'),
('link_dmg_bonus', '连携技伤害加成提升', 'flat'),
('ultimate_dmg_bonus', '终结技伤害加成提升', 'flat'),
('all_skill_dmg_bonus', '所有技能伤害加成提升', 'flat'),
('broken_dmg_bonus', '对失衡目标伤害加成提升', 'flat');

-- weapon_modifier_template
INSERT INTO `weapon_modifier_template` (`modifier_id`, `size`, `level`, `value`) VALUES
(NULL, 'small', 0, 8),
(NULL, 'small', 1, 15),
(NULL, 'small', 2, 21),
(NULL, 'small', 3, 28),
(NULL, 'small', 4, 35),
(NULL, 'small', 5, 42),
(NULL, 'small', 6, 48),
(NULL, 'small', 7, 55),
(NULL, 'small', 8, 65),
(NULL, 'large', 0, 14),
(NULL, 'large', 1, 25),
(NULL, 'large', 2, 36),
(NULL, 'large', 3, 47),
(NULL, 'large', 4, 58),
(NULL, 'large', 5, 70),
(NULL, 'large', 6, 81),
(NULL, 'large', 7, 92),
(NULL, 'large', 8, 109),
(NULL, 'small', 0, 12),
(NULL, 'small', 1, 21),
(NULL, 'small', 2, 31),
(NULL, 'small', 3, 40),
(NULL, 'small', 4, 50),
(NULL, 'small', 5, 60),
(NULL, 'small', 6, 69),
(NULL, 'small', 7, 79),
(NULL, 'small', 8, 93),
(NULL, 'medium', 0, 16),
(NULL, 'medium', 1, 28),
(NULL, 'medium', 2, 41),
(NULL, 'medium', 3, 54),
(NULL, 'medium', 4, 67),
(NULL, 'medium', 5, 80),
(NULL, 'medium', 6, 92),
(NULL, 'medium', 7, 105),
(NULL, 'medium', 8, 124),
(NULL, 'large', 0, 20),
(NULL, 'large', 1, 36),
(NULL, 'large', 2, 52),
(NULL, 'large', 3, 68),
(NULL, 'large', 4, 84),
(NULL, 'large', 5, 100),
(NULL, 'large', 6, 116),
(NULL, 'large', 7, 132),
(NULL, 'large', 8, 156),
(NULL, 'small', 0, 12),
(NULL, 'small', 1, 21),
(NULL, 'small', 2, 31),
(NULL, 'small', 3, 40),
(NULL, 'small', 4, 50);
INSERT INTO `weapon_modifier_template` (`modifier_id`, `size`, `level`, `value`) VALUES
(NULL, 'small', 5, 60),
(NULL, 'small', 6, 69),
(NULL, 'small', 7, 79),
(NULL, 'small', 8, 93),
(NULL, 'medium', 0, 16),
(NULL, 'medium', 1, 28),
(NULL, 'medium', 2, 41),
(NULL, 'medium', 3, 54),
(NULL, 'medium', 4, 67),
(NULL, 'medium', 5, 80),
(NULL, 'medium', 6, 92),
(NULL, 'medium', 7, 105),
(NULL, 'medium', 8, 124),
(NULL, 'large', 0, 20),
(NULL, 'large', 1, 36),
(NULL, 'large', 2, 52),
(NULL, 'large', 3, 68),
(NULL, 'large', 4, 84),
(NULL, 'large', 5, 100),
(NULL, 'large', 6, 116),
(NULL, 'large', 7, 132),
(NULL, 'large', 8, 156),
(NULL, 'small', 0, 12),
(NULL, 'small', 1, 21),
(NULL, 'small', 2, 31),
(NULL, 'small', 3, 40),
(NULL, 'small', 4, 50),
(NULL, 'small', 5, 60),
(NULL, 'small', 6, 69),
(NULL, 'small', 7, 79),
(NULL, 'small', 8, 93),
(NULL, 'medium', 0, 16),
(NULL, 'medium', 1, 28),
(NULL, 'medium', 2, 41),
(NULL, 'medium', 3, 54),
(NULL, 'medium', 4, 67),
(NULL, 'medium', 5, 80),
(NULL, 'medium', 6, 92),
(NULL, 'medium', 7, 105),
(NULL, 'medium', 8, 124),
(NULL, 'large', 0, 20),
(NULL, 'large', 1, 36),
(NULL, 'large', 2, 52),
(NULL, 'large', 3, 68),
(NULL, 'large', 4, 84),
(NULL, 'large', 5, 100),
(NULL, 'large', 6, 116),
(NULL, 'large', 7, 132),
(NULL, 'large', 8, 156),
(NULL, 'small', 0, 12);
INSERT INTO `weapon_modifier_template` (`modifier_id`, `size`, `level`, `value`) VALUES
(NULL, 'small', 1, 21),
(NULL, 'small', 2, 31),
(NULL, 'small', 3, 40),
(NULL, 'small', 4, 50),
(NULL, 'small', 5, 60),
(NULL, 'small', 6, 69),
(NULL, 'small', 7, 79),
(NULL, 'small', 8, 93),
(NULL, 'medium', 0, 16),
(NULL, 'medium', 1, 28),
(NULL, 'medium', 2, 41),
(NULL, 'medium', 3, 54),
(NULL, 'medium', 4, 67),
(NULL, 'medium', 5, 80),
(NULL, 'medium', 6, 92),
(NULL, 'medium', 7, 105),
(NULL, 'medium', 8, 124),
(NULL, 'large', 0, 20),
(NULL, 'large', 1, 36),
(NULL, 'large', 2, 52),
(NULL, 'large', 3, 68),
(NULL, 'large', 4, 84),
(NULL, 'large', 5, 100),
(NULL, 'large', 6, 116),
(NULL, 'large', 7, 132),
(NULL, 'large', 8, 156),
(NULL, 'small', 0, 3),
(NULL, 'small', 1, 5.4),
(NULL, 'small', 2, 7.8),
(NULL, 'small', 3, 10.2),
(NULL, 'small', 4, 12.6),
(NULL, 'small', 5, 15),
(NULL, 'small', 6, 17.4),
(NULL, 'small', 7, 19.8),
(NULL, 'small', 8, 23.4),
(NULL, 'medium', 0, 4),
(NULL, 'medium', 1, 7.2),
(NULL, 'medium', 2, 10.4),
(NULL, 'medium', 3, 13.6),
(NULL, 'medium', 4, 16.8),
(NULL, 'medium', 5, 20),
(NULL, 'medium', 6, 23.2),
(NULL, 'medium', 7, 26.4),
(NULL, 'medium', 8, 31.2),
(NULL, 'large', 0, 5),
(NULL, 'large', 1, 9),
(NULL, 'large', 2, 13),
(NULL, 'large', 3, 17),
(NULL, 'large', 4, 21),
(NULL, 'large', 5, 25);
INSERT INTO `weapon_modifier_template` (`modifier_id`, `size`, `level`, `value`) VALUES
(NULL, 'large', 6, 29),
(NULL, 'large', 7, 33),
(NULL, 'large', 8, 39),
(NULL, 'small', 0, 6),
(NULL, 'small', 1, 10.8),
(NULL, 'small', 2, 15.6),
(NULL, 'small', 3, 20.4),
(NULL, 'small', 4, 25.2),
(NULL, 'small', 5, 30),
(NULL, 'small', 6, 34.8),
(NULL, 'small', 7, 39.6),
(NULL, 'small', 8, 46.8),
(NULL, 'medium', 0, 8),
(NULL, 'medium', 1, 14.4),
(NULL, 'medium', 2, 20.8),
(NULL, 'medium', 3, 27.2),
(NULL, 'medium', 4, 33.6),
(NULL, 'medium', 5, 40),
(NULL, 'medium', 6, 46.4),
(NULL, 'medium', 7, 52.8),
(NULL, 'medium', 8, 62.4),
(NULL, 'large', 0, 10),
(NULL, 'large', 1, 18),
(NULL, 'large', 2, 26),
(NULL, 'large', 3, 34),
(NULL, 'large', 4, 42),
(NULL, 'large', 5, 50),
(NULL, 'large', 6, 58),
(NULL, 'large', 7, 66),
(NULL, 'large', 8, 78),
(NULL, 'large', 0, 2.5),
(NULL, 'large', 1, 4.5),
(NULL, 'large', 2, 6.5),
(NULL, 'large', 3, 8.5),
(NULL, 'large', 4, 10.5),
(NULL, 'large', 5, 12.5),
(NULL, 'large', 6, 14.5),
(NULL, 'large', 7, 16.5),
(NULL, 'large', 8, 19.5),
(NULL, 'medium', 0, 4.4),
(NULL, 'medium', 1, 8),
(NULL, 'medium', 2, 11.6),
(NULL, 'medium', 3, 15.1),
(NULL, 'medium', 4, 18.7),
(NULL, 'medium', 5, 22.2),
(NULL, 'medium', 6, 25.8),
(NULL, 'medium', 7, 29.3),
(NULL, 'medium', 8, 34.7),
(NULL, 'large', 0, 5.6),
(NULL, 'large', 1, 10);
INSERT INTO `weapon_modifier_template` (`modifier_id`, `size`, `level`, `value`) VALUES
(NULL, 'large', 2, 14.4),
(NULL, 'large', 3, 18.9),
(NULL, 'large', 4, 23.3),
(NULL, 'large', 5, 27.8),
(NULL, 'large', 6, 32.2),
(NULL, 'large', 7, 36.7),
(NULL, 'large', 8, 43.3),
(NULL, 'medium', 0, 4.4),
(NULL, 'medium', 1, 8),
(NULL, 'medium', 2, 11.6),
(NULL, 'medium', 3, 15.1),
(NULL, 'medium', 4, 18.7),
(NULL, 'medium', 5, 22.2),
(NULL, 'medium', 6, 25.8),
(NULL, 'medium', 7, 29.3),
(NULL, 'medium', 8, 34.7),
(NULL, 'large', 0, 5.6),
(NULL, 'large', 1, 10),
(NULL, 'large', 2, 14.4),
(NULL, 'large', 3, 18.9),
(NULL, 'large', 4, 23.3),
(NULL, 'large', 5, 27.8),
(NULL, 'large', 6, 32.2),
(NULL, 'large', 7, 36.7),
(NULL, 'large', 8, 43.3),
(NULL, 'large', 0, 6),
(NULL, 'large', 1, 10.7),
(NULL, 'large', 2, 15.5),
(NULL, 'large', 3, 20.2),
(NULL, 'large', 4, 25),
(NULL, 'large', 5, 29.8),
(NULL, 'large', 6, 34.5),
(NULL, 'large', 7, 39.3),
(NULL, 'large', 8, 46.4),
(NULL, 'small', 0, 3.3),
(NULL, 'small', 1, 6),
(NULL, 'small', 2, 8.7),
(NULL, 'small', 3, 11.3),
(NULL, 'small', 4, 14),
(NULL, 'small', 5, 16.7),
(NULL, 'small', 6, 19.3),
(NULL, 'small', 7, 22),
(NULL, 'small', 8, 26),
(NULL, 'medium', 0, 4.4),
(NULL, 'medium', 1, 8),
(NULL, 'medium', 2, 11.6),
(NULL, 'medium', 3, 15.1),
(NULL, 'medium', 4, 18.7),
(NULL, 'medium', 5, 22.2),
(NULL, 'medium', 6, 25.8);
INSERT INTO `weapon_modifier_template` (`modifier_id`, `size`, `level`, `value`) VALUES
(NULL, 'medium', 7, 29.3),
(NULL, 'medium', 8, 34.7),
(NULL, 'large', 0, 5.6),
(NULL, 'large', 1, 10),
(NULL, 'large', 2, 14.4),
(NULL, 'large', 3, 18.9),
(NULL, 'large', 4, 23.3),
(NULL, 'large', 5, 27.8),
(NULL, 'large', 6, 32.2),
(NULL, 'large', 7, 36.7),
(NULL, 'large', 8, 43.3),
(NULL, 'small', 0, 3.3),
(NULL, 'small', 1, 6),
(NULL, 'small', 2, 8.7),
(NULL, 'small', 3, 11.3),
(NULL, 'small', 4, 14),
(NULL, 'small', 5, 16.7),
(NULL, 'small', 6, 19.3),
(NULL, 'small', 7, 22),
(NULL, 'small', 8, 26),
(NULL, 'medium', 0, 4.4),
(NULL, 'medium', 1, 8),
(NULL, 'medium', 2, 11.6),
(NULL, 'medium', 3, 15.1),
(NULL, 'medium', 4, 18.7),
(NULL, 'medium', 5, 22.2),
(NULL, 'medium', 6, 25.8),
(NULL, 'medium', 7, 29.3),
(NULL, 'medium', 8, 34.7),
(NULL, 'medium', 0, 8),
(NULL, 'medium', 1, 14),
(NULL, 'medium', 2, 20),
(NULL, 'medium', 3, 27),
(NULL, 'medium', 4, 33),
(NULL, 'medium', 5, 40),
(NULL, 'medium', 6, 46),
(NULL, 'medium', 7, 52),
(NULL, 'medium', 8, 62),
(NULL, 'large', 0, 10),
(NULL, 'large', 1, 18),
(NULL, 'large', 2, 26),
(NULL, 'large', 3, 34),
(NULL, 'large', 4, 42),
(NULL, 'large', 5, 50),
(NULL, 'large', 6, 58),
(NULL, 'large', 7, 66),
(NULL, 'large', 8, 78),
(NULL, 'medium', 0, 4.8),
(NULL, 'medium', 1, 8.6),
(NULL, 'medium', 2, 12.4);
INSERT INTO `weapon_modifier_template` (`modifier_id`, `size`, `level`, `value`) VALUES
(NULL, 'medium', 3, 16.2),
(NULL, 'medium', 4, 20),
(NULL, 'medium', 5, 23.8),
(NULL, 'medium', 6, 27.6),
(NULL, 'medium', 7, 31.4),
(NULL, 'medium', 8, 37.1),
(NULL, 'large', 0, 6),
(NULL, 'large', 1, 10.7),
(NULL, 'large', 2, 15.5),
(NULL, 'large', 3, 20.2),
(NULL, 'large', 4, 25),
(NULL, 'large', 5, 29.8),
(NULL, 'large', 6, 34.5),
(NULL, 'large', 7, 39.3),
(NULL, 'large', 8, 46.4);

-- equipment_adapter_template
INSERT INTO `equipment_adapter_template` (`modifier_id`, `slot`, `config`, `refine`, `value`) VALUES
(NULL, 'accessory', 'Dual', 0, 20.7),
(NULL, 'accessory', 'Dual', 1, 22.8),
(NULL, 'accessory', 'Dual', 2, 24.8),
(NULL, 'accessory', 'Dual', 3, 26.9),
(NULL, 'armor', 'Dual', 0, 10.4),
(NULL, 'armor', 'Dual', 1, 11.4),
(NULL, 'armor', 'Dual', 2, 12.4),
(NULL, 'armor', 'Dual', 3, 13.5),
(NULL, 'accessory', 'Dual', 0, 20.7),
(NULL, 'accessory', 'Dual', 1, 22.8),
(NULL, 'accessory', 'Dual', 2, 24.8),
(NULL, 'accessory', 'Dual', 3, 26.9),
(NULL, 'armor', 'Dual', 0, 5.2),
(NULL, 'armor', 'Dual', 1, 5.7),
(NULL, 'armor', 'Dual', 2, 6.2),
(NULL, 'armor', 'Dual', 3, 6.7),
(NULL, 'gloves', 'Dual', 0, 8.6),
(NULL, 'gloves', 'Dual', 1, 9.5),
(NULL, 'gloves', 'Dual', 2, 10.3),
(NULL, 'gloves', 'Dual', 3, 11.2),
(NULL, 'accessory', 'Single', 0, 10.8),
(NULL, 'accessory', 'Single', 1, 11.9),
(NULL, 'accessory', 'Single', 2, 13),
(NULL, 'accessory', 'Single', 3, 14),
(NULL, 'accessory', 'Dual', 0, 10.3),
(NULL, 'accessory', 'Dual', 1, 11.4),
(NULL, 'accessory', 'Dual', 2, 12.4),
(NULL, 'accessory', 'Dual', 3, 13.5),
(NULL, 'armor', 'Dual', 0, 20),
(NULL, 'armor', 'Dual', 1, 22),
(NULL, 'armor', 'Dual', 2, 24),
(NULL, 'armor', 'Dual', 3, 26),
(NULL, 'gloves', 'Dual', 0, 34),
(NULL, 'gloves', 'Dual', 1, 37),
(NULL, 'gloves', 'Dual', 2, 41),
(NULL, 'gloves', 'Dual', 3, 44),
(NULL, 'accessory', 'Dual', 0, 41),
(NULL, 'accessory', 'Dual', 1, 45),
(NULL, 'accessory', 'Dual', 2, 49),
(NULL, 'accessory', 'Dual', 3, 53),
(NULL, 'armor', 'Single', 0, 12.9),
(NULL, 'armor', 'Single', 1, 14.1),
(NULL, 'armor', 'Single', 2, 15.4),
(NULL, 'armor', 'Single', 3, 16.7),
(NULL, 'armor', 'Dual', 0, 12.3),
(NULL, 'armor', 'Dual', 1, 13.6),
(NULL, 'armor', 'Dual', 2, 14.8),
(NULL, 'armor', 'Dual', 3, 16),
(NULL, 'gloves', 'Dual', 0, 20.5),
(NULL, 'gloves', 'Dual', 1, 22.6);
INSERT INTO `equipment_adapter_template` (`modifier_id`, `slot`, `config`, `refine`, `value`) VALUES
(NULL, 'gloves', 'Dual', 2, 24.6),
(NULL, 'gloves', 'Dual', 3, 26.7),
(NULL, 'accessory', 'Single', 0, 25.7),
(NULL, 'accessory', 'Single', 1, 28.3),
(NULL, 'accessory', 'Single', 2, 30.9),
(NULL, 'accessory', 'Single', 3, 33.4),
(NULL, 'accessory', 'Dual', 0, 24.6),
(NULL, 'accessory', 'Dual', 1, 27.1),
(NULL, 'accessory', 'Dual', 2, 29.6),
(NULL, 'accessory', 'Dual', 3, 32),
(NULL, 'armor', 'Single', 0, 14.4),
(NULL, 'armor', 'Single', 1, 15.8),
(NULL, 'armor', 'Single', 2, 17.3),
(NULL, 'armor', 'Single', 3, 18.7),
(NULL, 'armor', 'Dual', 0, 13.8),
(NULL, 'armor', 'Dual', 1, 15.2),
(NULL, 'armor', 'Dual', 2, 16.6),
(NULL, 'armor', 'Dual', 3, 17.9),
(NULL, 'gloves', 'Dual', 0, 23),
(NULL, 'gloves', 'Dual', 1, 25.3),
(NULL, 'gloves', 'Dual', 2, 27.6),
(NULL, 'gloves', 'Dual', 3, 29.9),
(NULL, 'accessory', 'Dual', 0, 27.6),
(NULL, 'accessory', 'Dual', 1, 30.4),
(NULL, 'accessory', 'Dual', 2, 33.1),
(NULL, 'accessory', 'Dual', 3, 35.9),
(NULL, 'armor', 'Dual', 0, 20.7),
(NULL, 'armor', 'Dual', 1, 22.8),
(NULL, 'armor', 'Dual', 2, 24.8),
(NULL, 'armor', 'Dual', 3, 26.9),
(NULL, 'gloves', 'Dual', 0, 34.5),
(NULL, 'gloves', 'Dual', 1, 38),
(NULL, 'gloves', 'Dual', 2, 41.4),
(NULL, 'gloves', 'Dual', 3, 44.9),
(NULL, 'accessory', 'Dual', 0, 41.4),
(NULL, 'accessory', 'Dual', 1, 45.5),
(NULL, 'accessory', 'Dual', 2, 49.7),
(NULL, 'accessory', 'Dual', 3, 53.8),
(NULL, 'armor', 'Dual', 0, 20.7),
(NULL, 'armor', 'Dual', 1, 22.8),
(NULL, 'armor', 'Dual', 2, 24.8),
(NULL, 'armor', 'Dual', 3, 26.9),
(NULL, 'gloves', 'Dual', 0, 34.5),
(NULL, 'gloves', 'Dual', 1, 38),
(NULL, 'gloves', 'Dual', 2, 41.4),
(NULL, 'gloves', 'Dual', 3, 44.9),
(NULL, 'accessory', 'Single', 0, 43.2),
(NULL, 'accessory', 'Single', 1, 47.5),
(NULL, 'accessory', 'Single', 2, 51.8),
(NULL, 'accessory', 'Single', 3, 56.2);
INSERT INTO `equipment_adapter_template` (`modifier_id`, `slot`, `config`, `refine`, `value`) VALUES
(NULL, 'accessory', 'Dual', 0, 41.4),
(NULL, 'accessory', 'Dual', 1, 45.5),
(NULL, 'accessory', 'Dual', 2, 49.7),
(NULL, 'accessory', 'Dual', 3, 53.8),
(NULL, 'armor', 'Dual', 0, 25.9),
(NULL, 'armor', 'Dual', 1, 28.5),
(NULL, 'armor', 'Dual', 2, 31.1),
(NULL, 'armor', 'Dual', 3, 33.6),
(NULL, 'gloves', 'Single', 0, 45),
(NULL, 'gloves', 'Single', 1, 49.5),
(NULL, 'gloves', 'Single', 2, 54),
(NULL, 'gloves', 'Single', 3, 58.5),
(NULL, 'gloves', 'Dual', 0, 43.1),
(NULL, 'gloves', 'Dual', 1, 47.4),
(NULL, 'gloves', 'Dual', 2, 51.7),
(NULL, 'gloves', 'Dual', 3, 56.1),
(NULL, 'accessory', 'Dual', 0, 51.7),
(NULL, 'accessory', 'Dual', 1, 56.9),
(NULL, 'accessory', 'Dual', 2, 62.1),
(NULL, 'accessory', 'Dual', 3, 67.3),
(NULL, 'armor', 'Dual', 0, 20.7),
(NULL, 'armor', 'Dual', 1, 22.8),
(NULL, 'armor', 'Dual', 2, 24.8),
(NULL, 'armor', 'Dual', 3, 26.9),
(NULL, 'accessory', 'Dual', 0, 41.4),
(NULL, 'accessory', 'Dual', 1, 45.5),
(NULL, 'accessory', 'Dual', 2, 49.7),
(NULL, 'accessory', 'Dual', 3, 53.8),
(NULL, 'armor', 'Dual', 0, 13.8),
(NULL, 'armor', 'Dual', 1, 15.2),
(NULL, 'armor', 'Dual', 2, 16.6),
(NULL, 'armor', 'Dual', 3, 17.9),
(NULL, 'gloves', 'Single', 0, 24),
(NULL, 'gloves', 'Single', 1, 26.4),
(NULL, 'gloves', 'Single', 2, 28.8),
(NULL, 'gloves', 'Single', 3, 31.2),
(NULL, 'gloves', 'Dual', 0, 23),
(NULL, 'gloves', 'Dual', 1, 25.3),
(NULL, 'gloves', 'Dual', 2, 27.6),
(NULL, 'gloves', 'Dual', 3, 29.9),
(NULL, 'accessory', 'Dual', 0, 27.6),
(NULL, 'accessory', 'Dual', 1, 30.4),
(NULL, 'accessory', 'Dual', 2, 33.1),
(NULL, 'accessory', 'Dual', 3, 35.9),
(NULL, 'armor', 'Dual', 0, 11.5),
(NULL, 'armor', 'Dual', 1, 12.7),
(NULL, 'armor', 'Dual', 2, 13.8),
(NULL, 'armor', 'Dual', 3, 14.9),
(NULL, 'gloves', 'Dual', 0, 19.2),
(NULL, 'gloves', 'Dual', 1, 21.1);
INSERT INTO `equipment_adapter_template` (`modifier_id`, `slot`, `config`, `refine`, `value`) VALUES
(NULL, 'gloves', 'Dual', 2, 23),
(NULL, 'gloves', 'Dual', 3, 24.9),
(NULL, 'accessory', 'Dual', 0, 23),
(NULL, 'accessory', 'Dual', 1, 25.3),
(NULL, 'accessory', 'Dual', 2, 27.6),
(NULL, 'accessory', 'Dual', 3, 29.9),
(NULL, 'armor', 'Dual', 0, 11.5),
(NULL, 'armor', 'Dual', 1, 12.7),
(NULL, 'armor', 'Dual', 2, 13.8),
(NULL, 'armor', 'Dual', 3, 14.9),
(NULL, 'gloves', 'Dual', 0, 19.2),
(NULL, 'gloves', 'Dual', 1, 21.1),
(NULL, 'gloves', 'Dual', 2, 23),
(NULL, 'gloves', 'Dual', 3, 24.9),
(NULL, 'accessory', 'Dual', 0, 23),
(NULL, 'accessory', 'Dual', 1, 25.3),
(NULL, 'accessory', 'Dual', 2, 27.6),
(NULL, 'accessory', 'Dual', 3, 29.9),
(NULL, 'armor', 'Dual', 0, 11.5),
(NULL, 'armor', 'Dual', 1, 12.7),
(NULL, 'armor', 'Dual', 2, 13.8),
(NULL, 'armor', 'Dual', 3, 14.9),
(NULL, 'gloves', 'Dual', 0, 19.2),
(NULL, 'gloves', 'Dual', 1, 21.1),
(NULL, 'gloves', 'Dual', 2, 23),
(NULL, 'gloves', 'Dual', 3, 24.9),
(NULL, 'accessory', 'Dual', 0, 23),
(NULL, 'accessory', 'Dual', 1, 25.3),
(NULL, 'accessory', 'Dual', 2, 27.6),
(NULL, 'accessory', 'Dual', 3, 29.9),
(NULL, 'armor', 'Dual', 0, 11.5),
(NULL, 'armor', 'Dual', 1, 12.7),
(NULL, 'armor', 'Dual', 2, 13.8),
(NULL, 'armor', 'Dual', 3, 14.9),
(NULL, 'gloves', 'Dual', 0, 19.2),
(NULL, 'gloves', 'Dual', 1, 21.1),
(NULL, 'gloves', 'Dual', 2, 23),
(NULL, 'gloves', 'Dual', 3, 24.9),
(NULL, 'accessory', 'Dual', 0, 23),
(NULL, 'accessory', 'Dual', 1, 25.3),
(NULL, 'accessory', 'Dual', 2, 27.6),
(NULL, 'accessory', 'Dual', 3, 29.9),
(NULL, 'armor', 'Dual', 0, 11.5),
(NULL, 'armor', 'Dual', 1, 12.7),
(NULL, 'armor', 'Dual', 2, 13.8),
(NULL, 'armor', 'Dual', 3, 14.9),
(NULL, 'gloves', 'Dual', 0, 19.2),
(NULL, 'gloves', 'Dual', 1, 21.1),
(NULL, 'gloves', 'Dual', 2, 23),
(NULL, 'gloves', 'Dual', 3, 24.9);
INSERT INTO `equipment_adapter_template` (`modifier_id`, `slot`, `config`, `refine`, `value`) VALUES
(NULL, 'accessory', 'Dual', 0, 23),
(NULL, 'accessory', 'Dual', 1, 25.3),
(NULL, 'accessory', 'Dual', 2, 27.6),
(NULL, 'accessory', 'Dual', 3, 29.9),
(NULL, 'accessory', 'Dual', 0, 41.4),
(NULL, 'accessory', 'Dual', 1, 45.5),
(NULL, 'accessory', 'Dual', 2, 49.7),
(NULL, 'accessory', 'Dual', 3, 53.8),
(NULL, 'armor', 'Dual', 0, 10.3),
(NULL, 'armor', 'Dual', 1, 11.4),
(NULL, 'armor', 'Dual', 2, 12.4),
(NULL, 'armor', 'Dual', 3, 13.5),
(NULL, 'gloves', 'Dual', 0, 17.3),
(NULL, 'gloves', 'Dual', 1, 19),
(NULL, 'gloves', 'Dual', 2, 20.7),
(NULL, 'gloves', 'Dual', 3, 22.4),
(NULL, 'accessory', 'Dual', 0, 20.7),
(NULL, 'accessory', 'Dual', 1, 22.8),
(NULL, 'accessory', 'Dual', 2, 24.8),
(NULL, 'accessory', 'Dual', 3, 26.9);

-- enemy
INSERT INTO `enemy` (`id`, `name`, `category`, `tier`, `max_stagger`, `stagger_node_count`, `stagger_node_duration`, `stagger_break_duration`, `execution_recovery`) VALUES
('eny_0045_agtrinit', '三位一体', '天使', 'boss', 280, 1, 2, 11, 100),
('eny_0051_rodin', '“碾骨之拳”罗丹', '裂地者', 'boss', 280, 1, 2, 10, 100),
('eny_0053_hsmob', '莫留财', '沧贼', 'normal', 80, 0, 0, 6, 25),
('eny_0093_hshog', '球刺兽', '野外生物', 'elite', 200, 0, 0, 7, 35),
('eny_0107_wgshoal2', '潮行天使δ', '天使', 'champion', 320, 1, 2, 9, 50),
('eny_0007_mimicw', '潜地虬兽', '野外生物', 'elite', 160, 0, 2, 7, 35),
('eny_0018_lbtough', '碾骨行刑人', '裂地者', 'champion', 320, 1, 2, 9, 50),
('eny_0021_agmelee', '大角天使', '天使', 'normal', 60, 0, 2, 7, 25),
('eny_0023_aghornb', '刚角天使', '天使', 'elite', 160, 0, 2, 10, 35),
('eny_0025_agrange', '钉刺天使', '天使', 'normal', 60, 0, 2, 6, 25),
('eny_0027_agscorp', '重刺天使', '天使', 'elite', 140, 0, 2, 7, 35),
('eny_0063_agmelee2', '大角天使α', '天使', 'normal', 90, 0, 2, 6, 25),
('eny_0064_agrange2', '钉刺天使α', '天使', 'normal', 90, 0, 2, 6, 25),
('eny_0069_aghornb2', '刚角天使α', '天使', 'elite', 200, 0, 2, 7.5, 35),
('eny_0070_agscorp2', '重刺天使α', '天使', 'elite', 180, 0, 2, 7.5, 35),
('eny_0039_agcanno', '岗哨天使', '天使', 'champion', 200, 1, 2, 9, 50),
('eny_0058_agdisk', '肖像天使', '天使', 'champion', 340, 1, 2, 9, 50),
('eny_0076_agfly', '仿生翅天使', '天使', 'normal', 60, 0, 2, 6, 25),
('eny_0101_agfly2', '仿生翅天使α', '天使', 'normal', 180, 0, 2, 7.5, 35),
('eny_0077_agshield', '跂步晶城', '天使', 'head', 320, 1, 2, 10, 50),
('eny_0087_wgslime', '浊流天使', '天使', 'normal', 60, 0, 2, 6, 25),
('eny_0088_wgthorns', '晶锥天使', '天使', 'normal', 60, 0, 2, 6, 25),
('eny_0089_wgreflec', '棱镜天使', '天使', 'normal', 60, 0, 2, 6, 25),
('eny_0091_wgshoal', '潮行天使', '天使', 'champion', 320, 1, 2, 9, 50),
('eny_0090_wgabyss', '破潮之像', '天使', 'head', 640, 1, 2, 13, 50),
('eny_0105_wgslime2', '浊流天使δ', '天使', 'normal', 90, 0, 2, 6, 25),
('eny_0106_wgthorns2', '晶锥天使δ', '天使', 'normal', 90, 0, 2, 6, 25),
('eny_0061_palecore', '白垩核心', '天使', 'boss', 200, 0, 2, 24, 100),
('eny_0062_paletent', '白垩附肢', '天使', 'boss', 0, 0, 2, 6, 100),
('eny_0052_palesent', '白垩界卫', '天使', 'boss', 320, 2, 2, 11, 100),
('eny_0029_lbmob', '碾骨劫掠者', '裂地者', 'normal', 80, 0, 2, 6, 25),
('eny_0033_lbhunt', '碾骨伏击射手', '裂地者', 'normal', 80, 0, 2, 6, 25),
('eny_0046_lbshamman', '碾骨焰术师', '裂地者', 'elite', 160, 0, 2, 7, 35),
('eny_0047_firebat', '碾骨清道夫', '裂地者', 'elite', 170, 0, 2, 7, 35),
('eny_0048_hvybow', '碾骨射手', '裂地者', 'champion', 320, 1, 2, 9, 50),
('eny_0049_rogue', '碾骨渗透者', '裂地者', 'normal', 80, 0, 2, 6, 25),
('eny_0060_lbmad', '雾火爪牙', '裂地者', 'normal', 100, 0, 2, 6, 25),
('eny_0050_hound', '碾骨撕裂牙兽', '裂地者', 'normal', 60, 0, 2, 6, 25),
('eny_0059_erhound', '雾火牙兽', '裂地者', 'normal', 80, 0, 2, 6, 25),
('eny_0065_lbmob2', '精锐劫掠者', '裂地者', 'normal', 110, 0, 2, 6, 25),
('eny_0066_lbhunt2', '精锐伏击射手', '裂地者', 'normal', 110, 0, 2, 6, 25),
('eny_0067_hound2', '精锐撕裂牙兽', '裂地者', 'normal', 90, 0, 2, 6, 25),
('eny_0068_lbtough2', '精锐行刑人', '裂地者', 'champion', 340, 1, 2, 9, 50),
('eny_0074_lbshield', '碾骨先锋', '裂地者', 'normal', 80, 0, 2, 6, 25),
('eny_0075_lbroshan', '碾骨破城者', '裂地者', 'champion', 320, 1, 2, 6, 50),
('eny_0084_hshunt', '穿林箭', '沧贼', 'normal', 80, 0, 2, 6, 25),
('eny_0071_sandb', '斧甲兽', '野外生物', 'champion', 280, 0, 2, 9, 50),
('eny_0072_slimeml', '原生钳兽', '野外生物', 'normal', 60, 0, 2, 6, 25),
('eny_0073_slimerg', '酸液源石虫', '野外生物', 'normal', 60, 0, 2, 6, 25),
('eny_0083_hstiger', '百眼彪兽', '野外生物', 'champion', 320, 0, 2, 9, 50);
INSERT INTO `enemy` (`id`, `name`, `category`, `tier`, `max_stagger`, `stagger_node_count`, `stagger_node_duration`, `stagger_break_duration`, `execution_recovery`) VALUES
('eny_0092_slbomb', '火雾源石虫', '野外生物', 'normal', 80, 0, 2, 6, 25),
('eny_0094_hsfly', '水灯虫', '野外生物', 'normal', 80, 0, 2, 6, 25),
('eny_0098_sandb2', '雾火斧甲兽', '野外生物', 'champion', 320, 0, 2, 9, 50),
('eny_0099_slimeml2', '残暴原生钳兽', '野外生物', 'normal', 60, 0, 2, 6, 25),
('eny_0100_slimerg2', '酸液源石虫·α', '野外生物', 'normal', 60, 0, 2, 6, 25),
('eny_0102_hstiger2', '怒目彪兽', '野外生物', 'champion', 320, 0, 2, 9, 50),
('eny_0108_slbomb2', '焚雾源石虫', '野外生物', 'normal', 60, 0, 2, 6, 25),
('eny_0109_hshog2', '充能球刺兽', '野外生物', 'elite', 200, 0, 2, 7, 35),
('eny_0081_ruanyi', '阮一', '沧贼', 'boss', 300, 3, 2, 15, 100),
('eny_0054_hsmino', '摧山将', '沧贼', 'champion', 320, 0, 2, 9, 50),
('eny_0055_hscrane', '劫云客', '沧贼', 'elite', 110, 0, 2, 7, 35),
('eny_0085_hsrogue', '割云翁', '沧贼', 'elite', 110, 0, 2, 7, 35),
('eny_0096_hsmob2', '莫惜命', '沧贼', 'normal', 80, 0, 2, 6, 25),
('eny_0103_hshunt2', '过堂风', '沧贼', 'normal', 110, 0, 2, 6, 25),
('eny_0097_hsmino2', '开天将', '沧贼', 'champion', 320, 0, 2, 9, 50),
('eny_0104_hsrogue2', '断云叟', '沧贼', 'champion', 110, 0, 2, 7, 35);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('ENDMINISTRATOR_skill', 0.8, 100, 6.5, 6.5, NULL, '["stagger","break","ice_shatter"]', NULL, NULL, 0.8);

-- skill_damage_tick
INSERT INTO `skill_damage_tick` (`skill_id`, `tick_index`, `offset`, `stagger`, `sp`, `bound_effects`) VALUES
('ENDMINISTRATOR_skill', 0, 0.37, 10, 0, '["zqa9wpe"]');

-- skill_anomaly
INSERT INTO `skill_anomaly` (`skill_id`, `anomaly_index`, `group_index`, `type`, `stacks`, `duration`, `offset`, `delay`) VALUES
('ENDMINISTRATOR_skill', 0, 0, 'stagger', 1, 0, 0.37, 0.5);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('ENDMINISTRATOR_chain', 0.77, NULL, 10, NULL, 16, '["endmin_debuff"]', NULL, NULL, 0.77);

-- skill_damage_tick
INSERT INTO `skill_damage_tick` (`skill_id`, `tick_index`, `offset`, `stagger`, `sp`, `bound_effects`) VALUES
('ENDMINISTRATOR_chain', 0, 0.77, 10, 0, '["4b1lhjx"]');

-- skill_anomaly
INSERT INTO `skill_anomaly` (`skill_id`, `anomaly_index`, `group_index`, `type`, `stacks`, `duration`, `offset`, `delay`) VALUES
('ENDMINISTRATOR_chain', 0, 0, 'endmin_debuff', 1, 4, 0.77, 0.8);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('ENDMINISTRATOR_ultimate', 1.83, NULL, NULL, NULL, NULL, '["default"]', 80, 0, 1.83);

-- skill_damage_tick
INSERT INTO `skill_damage_tick` (`skill_id`, `tick_index`, `offset`, `stagger`, `sp`, `bound_effects`) VALUES
('ENDMINISTRATOR_ultimate', 0, 1.67, 25, 0, NULL);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('ENDMINISTRATOR_normal', 1.5, NULL, NULL, NULL, NULL, '["conductive","emag_attach","emag_burst","blaze_burst","burning","blaze_attach","knockup","break","ice_shatter","nature_attach","corrosion","nature_burst","knockdown","cold_attach","frozen","cold_burst","stagger","armor_break"]', NULL, NULL, 1.5);

-- attack_segment
INSERT INTO `attack_segment` (`character_id`, `segment_index`, `duration`, `gauge_gain`, `allowed_types`) VALUES
('ENDMINISTRATOR', 0, 0.33, 0, '["break","armor_break","ice_shatter","stagger","knockdown","knockup","nature_attach","corrosion","nature_burst","cold_attach","frozen","cold_burst","emag_attach","conductive","emag_burst","blaze_burst","burning","blaze_attach","default"]'),
('ENDMINISTRATOR', 1, 0.43, 0, '["break","armor_break","ice_shatter","stagger","knockdown","knockup","nature_attach","corrosion","nature_burst","cold_attach","frozen","cold_burst","emag_attach","conductive","emag_burst","blaze_burst","burning","blaze_attach","default"]'),
('ENDMINISTRATOR', 2, 0.6, 0, '["break","armor_break","ice_shatter","stagger","knockdown","knockup","nature_attach","corrosion","nature_burst","cold_attach","frozen","cold_burst","emag_attach","conductive","emag_burst","blaze_burst","burning","blaze_attach","default"]'),
('ENDMINISTRATOR', 3, 1.1, 0, '["break","armor_break","ice_shatter","stagger","knockdown","knockup","nature_attach","corrosion","nature_burst","cold_attach","frozen","cold_burst","emag_attach","conductive","emag_burst","blaze_burst","burning","blaze_attach","default"]'),
('ENDMINISTRATOR', 4, 0.867, 0, '["break","armor_break","ice_shatter","stagger","knockdown","knockup","nature_attach","corrosion","nature_burst","cold_attach","frozen","cold_burst","emag_attach","conductive","emag_burst","blaze_burst","burning","blaze_attach","default"]');

-- attack_segment_tick
INSERT INTO `attack_segment_tick` (`character_id`, `segment_index`, `tick_index`, `offset`, `stagger`, `sp`) VALUES
('ENDMINISTRATOR', 0, 0, 0.2, 0, 0),
('ENDMINISTRATOR', 1, 0, 0.17, 0, 0),
('ENDMINISTRATOR', 2, 0, 0.17, 0, 0),
('ENDMINISTRATOR', 2, 1, 0.4, 0, 0),
('ENDMINISTRATOR', 3, 0, 0.23, 0, 0),
('ENDMINISTRATOR', 3, 1, 0.3, 0, 0),
('ENDMINISTRATOR', 3, 2, 0.6, 0, 0),
('ENDMINISTRATOR', 3, 3, 0.63, 0, 0),
('ENDMINISTRATOR', 4, 0, 0.6, 18, 20);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('POGRANICHNK_skill', 1.5, 100, 6.5, 6.5, NULL, '["armor_break","break","ice_shatter"]', NULL, NULL, 1.5);

-- skill_damage_tick
INSERT INTO `skill_damage_tick` (`skill_id`, `tick_index`, `offset`, `stagger`, `sp`, `bound_effects`) VALUES
('POGRANICHNK_skill', 0, 0.93, 5, 0, NULL),
('POGRANICHNK_skill', 1, 1.27, 5, 0, NULL);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('POGRANICHNK_chain', 2.2, NULL, 10, NULL, 18, NULL, NULL, NULL, 2.2);

-- skill_damage_tick
INSERT INTO `skill_damage_tick` (`skill_id`, `tick_index`, `offset`, `stagger`, `sp`, `bound_effects`) VALUES
('POGRANICHNK_chain', 0, 0.77, 3, 5, NULL),
('POGRANICHNK_chain', 1, 1.23, 3, 7, NULL),
('POGRANICHNK_chain', 2, 2.03, 9, 23, NULL);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('POGRANICHNK_ultimate', 3, NULL, NULL, NULL, NULL, '["pograni_buff"]', 90, 0, 3);

-- skill_damage_tick
INSERT INTO `skill_damage_tick` (`skill_id`, `tick_index`, `offset`, `stagger`, `sp`, `bound_effects`) VALUES
('POGRANICHNK_ultimate', 0, 2.47, 10, 0, NULL),
('POGRANICHNK_ultimate', 1, 2.53, 0, 7.5, '["m9q4vrs"]'),
('POGRANICHNK_ultimate', 2, 2.53, 0, 7.5, '["dy0miki"]'),
('POGRANICHNK_ultimate', 3, 2.53, 0, 7.5, '["jnrk1xi"]'),
('POGRANICHNK_ultimate', 4, 2.53, 0, 7.5, '["vv7yqfc"]'),
('POGRANICHNK_ultimate', 5, 2.53, 15, 30, '["vkah20e"]');

-- skill_anomaly
INSERT INTO `skill_anomaly` (`skill_id`, `anomaly_index`, `group_index`, `type`, `stacks`, `duration`, `offset`, `delay`) VALUES
('POGRANICHNK_ultimate', 0, 0, 'pograni_buff', 1, 0, 2.53, 0.5),
('POGRANICHNK_ultimate', 1, 0, 'pograni_buff', 2, 0, 2.53, 0.5),
('POGRANICHNK_ultimate', 2, 0, 'pograni_buff', 3, 0, 2.53, 0.5),
('POGRANICHNK_ultimate', 3, 0, 'pograni_buff', 4, 0, 2.53, 0.5),
('POGRANICHNK_ultimate', 4, 0, 'pograni_buff', 5, 0, 2.53, 0.5);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('POGRANICHNK_normal', 1.5, NULL, NULL, NULL, NULL, '["burning","blaze_attach","blaze_burst","nature_attach","corrosion","nature_burst","knockup","break","ice_shatter","knockdown","cold_attach","frozen","cold_burst","stagger","armor_break","emag_attach","conductive","emag_burst"]', NULL, NULL, 1.5);

-- attack_segment
INSERT INTO `attack_segment` (`character_id`, `segment_index`, `duration`, `gauge_gain`, `allowed_types`) VALUES
('POGRANICHNK', 0, 0.43, 0, '["armor_break","break","ice_shatter","stagger","knockdown","knockup","blaze_burst","burning","blaze_attach","nature_attach","corrosion","nature_burst","cold_attach","frozen","cold_burst","emag_attach","conductive","emag_burst"]'),
('POGRANICHNK', 1, 0.67, 0, '["armor_break","break","ice_shatter","stagger","knockdown","knockup","blaze_burst","burning","blaze_attach","nature_attach","corrosion","nature_burst","cold_attach","frozen","cold_burst","emag_attach","conductive","emag_burst"]'),
('POGRANICHNK', 2, 0.67, 0, '["armor_break","break","ice_shatter","stagger","knockdown","knockup","blaze_burst","burning","blaze_attach","nature_attach","corrosion","nature_burst","cold_attach","frozen","cold_burst","emag_attach","conductive","emag_burst"]'),
('POGRANICHNK', 3, 0.63, 0, '["armor_break","break","ice_shatter","stagger","knockdown","knockup","blaze_burst","burning","blaze_attach","nature_attach","corrosion","nature_burst","cold_attach","frozen","cold_burst","emag_attach","conductive","emag_burst"]'),
('POGRANICHNK', 4, 0.83, 0, '["armor_break","break","ice_shatter","stagger","knockdown","knockup","blaze_burst","burning","blaze_attach","nature_attach","corrosion","nature_burst","cold_attach","frozen","cold_burst","emag_attach","conductive","emag_burst"]');

-- attack_segment_tick
INSERT INTO `attack_segment_tick` (`character_id`, `segment_index`, `tick_index`, `offset`, `stagger`, `sp`) VALUES
('POGRANICHNK', 0, 0, 0.27, 0, 0),
('POGRANICHNK', 1, 0, 0.23, 0, 0),
('POGRANICHNK', 1, 1, 0.47, 0, 0),
('POGRANICHNK', 2, 0, 0.3, 0, 0),
('POGRANICHNK', 2, 1, 0.5, 0, 0),
('POGRANICHNK', 3, 0, 0.1, 0, 0),
('POGRANICHNK', 3, 1, 0.17, 0, 0),
('POGRANICHNK', 3, 2, 0.23, 0, 0),
('POGRANICHNK', 3, 3, 0.37, 0, 0),
('POGRANICHNK', 3, 4, 0.43, 0, 0),
('POGRANICHNK', 3, 5, 0.5, 0, 0),
('POGRANICHNK', 4, 0, 0.53, 18, 20);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('ARDELIA_skill', 1.57, 100, 6.5, 6.5, NULL, '["spell_vulnerable","physical_vulnerable"]', NULL, NULL, 1.57);

-- skill_damage_tick
INSERT INTO `skill_damage_tick` (`skill_id`, `tick_index`, `offset`, `stagger`, `sp`, `bound_effects`) VALUES
('ARDELIA_skill', 0, 1.07, 10, 0, NULL);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('ARDELIA_chain', 0.77, NULL, 10, NULL, 18, '["corrosion","nature_attach","nature_burst"]', NULL, NULL, 0.77);

-- skill_damage_tick
INSERT INTO `skill_damage_tick` (`skill_id`, `tick_index`, `offset`, `stagger`, `sp`, `bound_effects`) VALUES
('ARDELIA_chain', 0, 0.67, 0, 0, NULL),
('ARDELIA_chain', 1, 2.4, 10, 0, '["gfmw370"]');

-- skill_anomaly
INSERT INTO `skill_anomaly` (`skill_id`, `anomaly_index`, `group_index`, `type`, `stacks`, `duration`, `offset`, `delay`) VALUES
('ARDELIA_chain', 0, 0, 'corrosion', 1, 10, 2.4, 2.6);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('ARDELIA_ultimate', 6.97, NULL, NULL, NULL, NULL, NULL, 90, 0, 6.97);

-- skill_damage_tick
INSERT INTO `skill_damage_tick` (`skill_id`, `tick_index`, `offset`, `stagger`, `sp`, `bound_effects`) VALUES
('ARDELIA_ultimate', 0, 2.7, 2, 0, NULL),
('ARDELIA_ultimate', 1, 1.8, 2, 0, NULL),
('ARDELIA_ultimate', 2, 6.7, 2, 0, NULL);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('ARDELIA_normal', 1.5, NULL, NULL, NULL, NULL, '["conductive","emag_attach","emag_burst","corrosion","nature_attach","nature_burst","burning","blaze_attach","blaze_burst","knockup","break","ice_shatter","knockdown","cold_attach","frozen","cold_burst","stagger","armor_break"]', NULL, NULL, 1.5);

-- attack_segment
INSERT INTO `attack_segment` (`character_id`, `segment_index`, `duration`, `gauge_gain`, `allowed_types`) VALUES
('ARDELIA', 0, 0.4, 0, '["knockup","break","ice_shatter","knockdown","stagger","armor_break","emag_attach","conductive","emag_burst","cold_attach","frozen","cold_burst","nature_attach","corrosion","nature_burst","blaze_burst","burning","blaze_attach"]'),
('ARDELIA', 1, 0.7, 0, '["knockup","break","ice_shatter","knockdown","stagger","armor_break","emag_attach","conductive","emag_burst","cold_attach","frozen","cold_burst","nature_attach","corrosion","nature_burst","blaze_burst","burning","blaze_attach"]'),
('ARDELIA', 2, 1.53, 0, '["knockup","break","ice_shatter","knockdown","stagger","armor_break","emag_attach","conductive","emag_burst","cold_attach","frozen","cold_burst","nature_attach","corrosion","nature_burst","blaze_burst","burning","blaze_attach"]'),
('ARDELIA', 3, 2.167, 0, '["knockup","break","ice_shatter","knockdown","stagger","armor_break","emag_attach","conductive","emag_burst","cold_attach","frozen","cold_burst","nature_attach","corrosion","nature_burst","blaze_burst","burning","blaze_attach"]'),
('ARDELIA', 4, 0, 0, '["knockup","break","ice_shatter","knockdown","stagger","armor_break","emag_attach","conductive","emag_burst","cold_attach","frozen","cold_burst","nature_attach","corrosion","nature_burst","blaze_burst","burning","blaze_attach"]');

-- attack_segment_tick
INSERT INTO `attack_segment_tick` (`character_id`, `segment_index`, `tick_index`, `offset`, `stagger`, `sp`) VALUES
('ARDELIA', 0, 0, 0.2, 0, 0),
('ARDELIA', 1, 0, 0.267, 0, 0),
('ARDELIA', 1, 1, 0.33, 0, 0),
('ARDELIA', 2, 0, 0.367, 0, 0),
('ARDELIA', 2, 1, 0.43, 0, 0),
('ARDELIA', 2, 2, 1.3, 0, 0),
('ARDELIA', 3, 0, 2.167, 18, 18);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('LASTRITE_skill', 0.5, 100, 16, 0, NULL, '["lastrite_buff"]', NULL, NULL, 0.5);

-- skill_damage_tick
INSERT INTO `skill_damage_tick` (`skill_id`, `tick_index`, `offset`, `stagger`, `sp`, `bound_effects`) VALUES
('LASTRITE_skill', 0, 0.2, 0, 30, '["wi0g4uk"]');

-- skill_anomaly
INSERT INTO `skill_anomaly` (`skill_id`, `anomaly_index`, `group_index`, `type`, `stacks`, `duration`, `offset`, `delay`) VALUES
('LASTRITE_skill', 0, 0, 'lastrite_buff', 1, 15, 0, 0);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('LASTRITE_chain', 2.17, NULL, 85, NULL, 9, NULL, NULL, NULL, 2.17);

-- skill_damage_tick
INSERT INTO `skill_damage_tick` (`skill_id`, `tick_index`, `offset`, `stagger`, `sp`, `bound_effects`) VALUES
('LASTRITE_chain', 0, 0.43, 0, 0, NULL),
('LASTRITE_chain', 1, 2.1, 15, 0, NULL);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('LASTRITE_ultimate', 4.67, NULL, NULL, NULL, NULL, NULL, 240, 0, 4.67);

-- skill_damage_tick
INSERT INTO `skill_damage_tick` (`skill_id`, `tick_index`, `offset`, `stagger`, `sp`, `bound_effects`) VALUES
('LASTRITE_ultimate', 0, 2.87, 5, 0, NULL),
('LASTRITE_ultimate', 1, 3.5, 5, 0, NULL),
('LASTRITE_ultimate', 2, 4.47, 10, 0, NULL);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('LASTRITE_normal', 1.5, NULL, NULL, NULL, NULL, '["burning","blaze_attach","blaze_burst","conductive","emag_attach","emag_burst","nature_attach","corrosion","nature_burst","knockdown","break","ice_shatter","knockup","stagger","cold_attach","frozen","cold_burst","armor_break"]', NULL, NULL, 1.5);

-- attack_segment
INSERT INTO `attack_segment` (`character_id`, `segment_index`, `duration`, `gauge_gain`, `allowed_types`) VALUES
('LASTRITE', 0, 0.7, 0, '["conductive","emag_attach","emag_burst","blaze_burst","burning","blaze_attach","knockup","break","ice_shatter","knockdown","nature_attach","corrosion","nature_burst","stagger","armor_break","cold_attach","frozen","cold_burst"]'),
('LASTRITE', 1, 1, 0, '["conductive","emag_attach","emag_burst","blaze_burst","burning","blaze_attach","knockup","break","ice_shatter","knockdown","nature_attach","corrosion","nature_burst","stagger","armor_break","cold_attach","frozen","cold_burst"]'),
('LASTRITE', 2, 1.23, 0, '["conductive","emag_attach","emag_burst","blaze_burst","burning","blaze_attach","knockup","break","ice_shatter","knockdown","nature_attach","corrosion","nature_burst","stagger","armor_break","cold_attach","frozen","cold_burst"]'),
('LASTRITE', 3, 1.567, 0, '["conductive","emag_attach","emag_burst","blaze_burst","burning","blaze_attach","knockup","break","ice_shatter","knockdown","nature_attach","corrosion","nature_burst","stagger","armor_break","cold_attach","frozen","cold_burst"]'),
('LASTRITE', 4, 0, 0, '["conductive","emag_attach","emag_burst","blaze_burst","burning","blaze_attach","knockup","break","ice_shatter","knockdown","nature_attach","corrosion","nature_burst","stagger","armor_break","cold_attach","frozen","cold_burst"]');

-- attack_segment_tick
INSERT INTO `attack_segment_tick` (`character_id`, `segment_index`, `tick_index`, `offset`, `stagger`, `sp`) VALUES
('LASTRITE', 0, 0, 0.4, 0, 0),
('LASTRITE', 1, 0, 0.33, 0, 0),
('LASTRITE', 1, 1, 0.8, 0, 0),
('LASTRITE', 2, 0, 0.3, 0, 0),
('LASTRITE', 2, 1, 0.9, 0, 0),
('LASTRITE', 3, 0, 0.7, 25, 30);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('GILBERTA_skill', 4.1, 100, 6.5, 6.5, NULL, '["corrosion","nature_attach","nature_burst"]', NULL, NULL, 4.1);

-- skill_damage_tick
INSERT INTO `skill_damage_tick` (`skill_id`, `tick_index`, `offset`, `stagger`, `sp`, `bound_effects`) VALUES
('GILBERTA_skill', 0, 0.97, 0, 0, NULL),
('GILBERTA_skill', 1, 1.53, 0, 0, NULL),
('GILBERTA_skill', 2, 2.067, 0, 0, NULL),
('GILBERTA_skill', 3, 2.6, 0, 0, NULL),
('GILBERTA_skill', 4, 3.6, 10, 0, '["4epihyj"]');

-- skill_anomaly
INSERT INTO `skill_anomaly` (`skill_id`, `anomaly_index`, `group_index`, `type`, `stacks`, `duration`, `offset`, `delay`) VALUES
('GILBERTA_skill', 0, 0, 'nature_attach', 1, 0, 3.6, 3.6);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('GILBERTA_chain', 1.77, NULL, 10, NULL, 20, '["knockup","break","ice_shatter"]', NULL, NULL, 1.77);

-- skill_damage_tick
INSERT INTO `skill_damage_tick` (`skill_id`, `tick_index`, `offset`, `stagger`, `sp`, `bound_effects`) VALUES
('GILBERTA_chain', 0, 1.6, 5, 0, '["rf28nuz"]');

-- skill_anomaly
INSERT INTO `skill_anomaly` (`skill_id`, `anomaly_index`, `group_index`, `type`, `stacks`, `duration`, `offset`, `delay`) VALUES
('GILBERTA_chain', 0, 0, 'knockup', 1, 0, 1.6, 1.6);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('GILBERTA_ultimate', 2.13, NULL, NULL, NULL, NULL, '["nature_attach","corrosion","nature_burst","affix_slow","spell_vulnerable"]', 90, 0, 2.13);

-- skill_damage_tick
INSERT INTO `skill_damage_tick` (`skill_id`, `tick_index`, `offset`, `stagger`, `sp`, `bound_effects`) VALUES
('GILBERTA_ultimate', 0, 2, 20, 0, '["i0pv4fq","lybx0u9","qse77jj"]');

-- skill_anomaly
INSERT INTO `skill_anomaly` (`skill_id`, `anomaly_index`, `group_index`, `type`, `stacks`, `duration`, `offset`, `delay`) VALUES
('GILBERTA_ultimate', 0, 0, 'affix_slow', 1, 5, 2, 0),
('GILBERTA_ultimate', 1, 1, 'spell_vulnerable', 1, 5, 2, 0),
('GILBERTA_ultimate', 2, 2, 'nature_attach', 1, 0, 2, 0);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('GILBERTA_normal', 1.5, NULL, NULL, NULL, NULL, '["conductive","emag_attach","emag_burst","blaze_burst","burning","blaze_attach","knockup","break","ice_shatter","nature_attach","corrosion","nature_burst","knockdown","cold_attach","frozen","cold_burst","stagger","armor_break"]', NULL, NULL, 1.5);

-- attack_segment
INSERT INTO `attack_segment` (`character_id`, `segment_index`, `duration`, `gauge_gain`, `allowed_types`) VALUES
('GILBERTA', 0, 0.63, 0, '["break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion"]'),
('GILBERTA', 1, 0.767, 0, '["break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion"]'),
('GILBERTA', 2, 0.8, 0, '["break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion"]'),
('GILBERTA', 3, 1.367, 0, '["break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion"]'),
('GILBERTA', 4, 0, 0, '["break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion"]');

-- attack_segment_tick
INSERT INTO `attack_segment_tick` (`character_id`, `segment_index`, `tick_index`, `offset`, `stagger`, `sp`) VALUES
('GILBERTA', 0, 0, 0.23, 0, 0),
('GILBERTA', 1, 0, 0.13, 0, 0),
('GILBERTA', 1, 1, 0.267, 0, 0),
('GILBERTA', 2, 0, 0.233, 0, 0),
('GILBERTA', 2, 1, 0.333, 0, 0),
('GILBERTA', 2, 2, 0.467, 0, 0),
('GILBERTA', 3, 0, 0.767, 0, 0),
('GILBERTA', 3, 1, 0.833, 0, 0),
('GILBERTA', 3, 2, 0.9, 16, 16);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('YVONNE_skill', 1.13, 100, 6.5, 6.5, NULL, '["frozen","cold_attach","cold_burst"]', NULL, NULL, 1.13);

-- skill_damage_tick
INSERT INTO `skill_damage_tick` (`skill_id`, `tick_index`, `offset`, `stagger`, `sp`, `bound_effects`) VALUES
('YVONNE_skill', 0, 0.17, 10, 0, '["gee3uz8"]');

-- skill_anomaly
INSERT INTO `skill_anomaly` (`skill_id`, `anomaly_index`, `group_index`, `type`, `stacks`, `duration`, `offset`, `delay`) VALUES
('YVONNE_skill', 0, 0, 'frozen', 1, 5, 0.17, 1);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('YVONNE_chain', 0.63, NULL, 20, NULL, 22, '["cold_burst","frozen","cold_attach"]', NULL, NULL, 0.63);

-- skill_damage_tick
INSERT INTO `skill_damage_tick` (`skill_id`, `tick_index`, `offset`, `stagger`, `sp`, `bound_effects`) VALUES
('YVONNE_chain', 0, 0.63, 10, 0, '["k8ha3dm"]');

-- skill_anomaly
INSERT INTO `skill_anomaly` (`skill_id`, `anomaly_index`, `group_index`, `type`, `stacks`, `duration`, `offset`, `delay`) VALUES
('YVONNE_chain', 0, 0, 'frozen', 1, 0, 0.63, 4.2);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('YVONNE_ultimate', 2.13, NULL, NULL, NULL, NULL, '["frozen","cold_attach","cold_burst"]', 200, 0, 2.13);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('YVONNE_normal', 1.5, NULL, NULL, NULL, NULL, '["burning","blaze_attach","blaze_burst","conductive","emag_attach","emag_burst","nature_attach","corrosion","nature_burst","knockup","break","ice_shatter","knockdown","cold_attach","frozen","cold_burst","stagger","armor_break"]', NULL, NULL, 1.5);

-- attack_segment
INSERT INTO `attack_segment` (`character_id`, `segment_index`, `duration`, `gauge_gain`, `allowed_types`) VALUES
('YVONNE', 0, 0.567, 0, '["break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion"]'),
('YVONNE', 1, 0.5, 0, '["break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion"]'),
('YVONNE', 2, 0.53, 0, '["break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion"]'),
('YVONNE', 3, 0.83, 0, '["break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion"]'),
('YVONNE', 4, 1.167, 0, '["break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion"]');

-- attack_segment_tick
INSERT INTO `attack_segment_tick` (`character_id`, `segment_index`, `tick_index`, `offset`, `stagger`, `sp`) VALUES
('YVONNE', 0, 0, 0.367, 0, 0),
('YVONNE', 1, 0, 0.467, 0, 0),
('YVONNE', 2, 0, 0.2, 0, 0),
('YVONNE', 3, 0, 0.367, 0, 0),
('YVONNE', 4, 0, 0.7, 17, 17);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('LAEVATAIN_skill', 2.2, 100, 6.5, 6.5, NULL, '["burning","blaze_attach","blaze_burst","magma_1","magma_2","magma_3","magma_4","magma_0"]', NULL, NULL, 2.2);

-- skill_damage_tick
INSERT INTO `skill_damage_tick` (`skill_id`, `tick_index`, `offset`, `stagger`, `sp`, `bound_effects`) VALUES
('LAEVATAIN_skill', 0, 0.73, 0, 0, '["devsn6j"]'),
('LAEVATAIN_skill', 1, 0.967, 0, 0, NULL),
('LAEVATAIN_skill', 2, 1.1, 0, 0, NULL),
('LAEVATAIN_skill', 3, 1.23, 0, 0, NULL),
('LAEVATAIN_skill', 4, 1.367, 0, 0, NULL),
('LAEVATAIN_skill', 5, 1.5, 0, 0, NULL),
('LAEVATAIN_skill', 6, 1.63, 0, 0, NULL),
('LAEVATAIN_skill', 7, 1.8, 0, 0, NULL),
('LAEVATAIN_skill', 8, 1.93, 0, 0, NULL),
('LAEVATAIN_skill', 9, 2.067, 10, 0, NULL);

-- skill_anomaly
INSERT INTO `skill_anomaly` (`skill_id`, `anomaly_index`, `group_index`, `type`, `stacks`, `duration`, `offset`, `delay`) VALUES
('LAEVATAIN_skill', 0, 0, 'magma_1', 1, 0, 0.73, 0.7);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('LAEVATAIN_chain', 1.37, NULL, 30, NULL, 10, '["magma_1","magma_2","magma_3","magma_4","magma_0"]', NULL, NULL, 1.37);

-- skill_damage_tick
INSERT INTO `skill_damage_tick` (`skill_id`, `tick_index`, `offset`, `stagger`, `sp`, `bound_effects`) VALUES
('LAEVATAIN_chain', 0, 0.67, 10, 0, NULL);

-- skill_anomaly
INSERT INTO `skill_anomaly` (`skill_id`, `anomaly_index`, `group_index`, `type`, `stacks`, `duration`, `offset`, `delay`) VALUES
('LAEVATAIN_chain', 0, 0, 'magma_1', 1, 0, 0.67, 1.3);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('LAEVATAIN_ultimate', 2.37, NULL, NULL, NULL, NULL, '["magma_1","magma_2","magma_3","magma_4","blaze_attach","burning","blaze_burst","magma_0"]', 300, 0, 2.37);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('LAEVATAIN_normal', 1.5, NULL, NULL, NULL, NULL, '["magma_1","magma_2","magma_3","magma_4","conductive","emag_attach","emag_burst","nature_attach","corrosion","nature_burst","blaze_burst","burning","blaze_attach","knockdown","break","ice_shatter","knockup","cold_attach","frozen","cold_burst","stagger","armor_break","magma_0"]', NULL, NULL, 1.5);

-- attack_segment
INSERT INTO `attack_segment` (`character_id`, `segment_index`, `duration`, `gauge_gain`, `allowed_types`) VALUES
('LAEVATAIN', 0, 0.367, 0, '["magma_1","magma_2","magma_3","magma_4","break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion","magma_0"]'),
('LAEVATAIN', 1, 0.567, 0, '["magma_1","magma_2","magma_3","magma_4","break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion","magma_0"]'),
('LAEVATAIN', 2, 0.43, 0, '["magma_1","magma_2","magma_3","magma_4","break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion","magma_0"]'),
('LAEVATAIN', 3, 0.76, 0, '["magma_1","magma_2","magma_3","magma_4","break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion","magma_0"]'),
('LAEVATAIN', 4, 1.167, 0, '["magma_1","magma_2","magma_3","magma_4","break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion","magma_0"]');

-- attack_segment_tick
INSERT INTO `attack_segment_tick` (`character_id`, `segment_index`, `tick_index`, `offset`, `stagger`, `sp`) VALUES
('LAEVATAIN', 0, 0, 0.2, 0, 0),
('LAEVATAIN', 1, 0, 0.2, 0, 0),
('LAEVATAIN', 1, 1, 0.43, 0, 0),
('LAEVATAIN', 2, 0, 0.3, 0, 0),
('LAEVATAIN', 3, 0, 0.2, 0, 0),
('LAEVATAIN', 3, 1, 0.4, 0, 0),
('LAEVATAIN', 3, 2, 0.63, 0, 0),
('LAEVATAIN', 4, 0, 0.77, 0, 0),
('LAEVATAIN', 4, 1, 0.87, 18, 20);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('LIFENG_skill', 2.23, 100, 6.5, 6.5, NULL, '["knockdown","break","ice_shatter","physical_vulnerable"]', NULL, NULL, 2.23);

-- skill_damage_tick
INSERT INTO `skill_damage_tick` (`skill_id`, `tick_index`, `offset`, `stagger`, `sp`, `bound_effects`) VALUES
('LIFENG_skill', 0, 0.23, 0, 0, NULL),
('LIFENG_skill', 1, 0.67, 0, 0, NULL),
('LIFENG_skill', 2, 1.8, 10, 0, NULL);

-- skill_anomaly
INSERT INTO `skill_anomaly` (`skill_id`, `anomaly_index`, `group_index`, `type`, `stacks`, `duration`, `offset`, `delay`) VALUES
('LIFENG_skill', 0, 0, 'knockdown', 1, 0, 1.8, 1.9),
('LIFENG_skill', 1, 1, 'physical_vulnerable', 1, 10, 1.8, 0);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('LIFENG_chain', 1.67, NULL, 10, NULL, 16, '["combo"]', NULL, NULL, 1.67);

-- skill_damage_tick
INSERT INTO `skill_damage_tick` (`skill_id`, `tick_index`, `offset`, `stagger`, `sp`, `bound_effects`) VALUES
('LIFENG_chain', 0, 0.63, 0, 0, NULL),
('LIFENG_chain', 1, 1.6, 10, 0, NULL);

-- skill_anomaly
INSERT INTO `skill_anomaly` (`skill_id`, `anomaly_index`, `group_index`, `type`, `stacks`, `duration`, `offset`, `delay`) VALUES
('LIFENG_chain', 0, 0, 'combo', 1, 20, 0.63, 0.7);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('LIFENG_ultimate', 2.2, NULL, NULL, NULL, NULL, '["knockdown","break","ice_shatter"]', 90, 0, 2.2);

-- skill_damage_tick
INSERT INTO `skill_damage_tick` (`skill_id`, `tick_index`, `offset`, `stagger`, `sp`, `bound_effects`) VALUES
('LIFENG_ultimate', 0, 2.13, 5, 0, '["dftx2lj"]'),
('LIFENG_ultimate', 1, 4.13, 5, 0, '["glkyop9"]');

-- skill_anomaly
INSERT INTO `skill_anomaly` (`skill_id`, `anomaly_index`, `group_index`, `type`, `stacks`, `duration`, `offset`, `delay`) VALUES
('LIFENG_ultimate', 0, 0, 'knockdown', 1, 2, 2.13, 0),
('LIFENG_ultimate', 1, 0, 'knockdown', 1, 1.9, 4.13, 0);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('LIFENG_normal', 1.5, NULL, NULL, NULL, NULL, '["break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion"]', NULL, NULL, 1.5);

-- attack_segment
INSERT INTO `attack_segment` (`character_id`, `segment_index`, `duration`, `gauge_gain`, `allowed_types`) VALUES
('LIFENG', 0, 0.83, 0, '["break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion"]'),
('LIFENG', 1, 0.63, 0, '["break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion"]'),
('LIFENG', 2, 0.5, 0, '["break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion"]'),
('LIFENG', 3, 1.2, 0, '["break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion"]'),
('LIFENG', 4, 0, 0, '["break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion"]');

-- attack_segment_tick
INSERT INTO `attack_segment_tick` (`character_id`, `segment_index`, `tick_index`, `offset`, `stagger`, `sp`) VALUES
('LIFENG', 0, 0, 0.3, 0, 0),
('LIFENG', 0, 1, 0.57, 0, 0),
('LIFENG', 1, 0, 0.13, 0, 0),
('LIFENG', 2, 0, 0.37, 0, 0),
('LIFENG', 3, 0, 0.43, 0, 0),
('LIFENG', 3, 1, 0.8, 19, 21);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('EMBER_skill', 1.7, 100, 6.5, 6.5, NULL, '["knockdown","break","ice_shatter"]', NULL, NULL, 1.7);

-- skill_damage_tick
INSERT INTO `skill_damage_tick` (`skill_id`, `tick_index`, `offset`, `stagger`, `sp`, `bound_effects`) VALUES
('EMBER_skill', 0, 0.33, 0, 0, NULL),
('EMBER_skill', 1, 1.27, 10, 0, '["48p1bap"]');

-- skill_anomaly
INSERT INTO `skill_anomaly` (`skill_id`, `anomaly_index`, `group_index`, `type`, `stacks`, `duration`, `offset`, `delay`) VALUES
('EMBER_skill', 0, 0, 'knockdown', 1, 0, 1.27, 1.6);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('EMBER_chain', 1.27, NULL, 10, NULL, 19, '["knockdown","break","ice_shatter"]', NULL, NULL, 1.27);

-- skill_damage_tick
INSERT INTO `skill_damage_tick` (`skill_id`, `tick_index`, `offset`, `stagger`, `sp`, `bound_effects`) VALUES
('EMBER_chain', 0, 0.87, 10, 0, '["4vguv4b"]');

-- skill_anomaly
INSERT INTO `skill_anomaly` (`skill_id`, `anomaly_index`, `group_index`, `type`, `stacks`, `duration`, `offset`, `delay`) VALUES
('EMBER_chain', 0, 0, 'knockdown', 1, 0, 0.87, 0.9);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('EMBER_ultimate', 1.67, NULL, NULL, NULL, NULL, NULL, 100, 0, 1.67);

-- skill_damage_tick
INSERT INTO `skill_damage_tick` (`skill_id`, `tick_index`, `offset`, `stagger`, `sp`, `bound_effects`) VALUES
('EMBER_ultimate', 0, 1.67, 0, 0, NULL);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('EMBER_normal', 1.5, NULL, NULL, NULL, NULL, '["break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion"]', NULL, NULL, 1.5);

-- attack_segment
INSERT INTO `attack_segment` (`character_id`, `segment_index`, `duration`, `gauge_gain`, `allowed_types`) VALUES
('EMBER', 0, 0.83, 0, '["break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion"]'),
('EMBER', 1, 0.63, 0, '["break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion"]'),
('EMBER', 2, 1.2, 0, '["break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion"]'),
('EMBER', 3, 1.767, 0, '["break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion"]'),
('EMBER', 4, 0, 0, '["break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion"]');

-- attack_segment_tick
INSERT INTO `attack_segment_tick` (`character_id`, `segment_index`, `tick_index`, `offset`, `stagger`, `sp`) VALUES
('EMBER', 0, 0, 0.43, 0, 0),
('EMBER', 1, 0, 0.2, 0, 0),
('EMBER', 2, 0, 0.6, 0, 0),
('EMBER', 3, 0, 0.87, 25, 28);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('TANGTANG_skill', 1.67, 100, 6.5, 6.5, NULL, '["cold_attach","frozen","cold_burst","skillwater","spell_vulnerable"]', NULL, NULL, 1.67);

-- skill_damage_tick
INSERT INTO `skill_damage_tick` (`skill_id`, `tick_index`, `offset`, `stagger`, `sp`, `bound_effects`) VALUES
('TANGTANG_skill', 0, 0.77, 0, 0, '["0gbmca2","kvisxy3"]'),
('TANGTANG_skill', 1, 0.9, 10, 0, NULL);

-- skill_anomaly
INSERT INTO `skill_anomaly` (`skill_id`, `anomaly_index`, `group_index`, `type`, `stacks`, `duration`, `offset`, `delay`) VALUES
('TANGTANG_skill', 0, 0, 'cold_attach', 1, 0, 0.77, 0),
('TANGTANG_skill', 1, 1, 'skillwater', 1, 0, 0.77, 0);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('TANGTANG_chain', 1.03, NULL, 10, NULL, 13, '["comboskillwater"]', NULL, NULL, 1.03);

-- skill_damage_tick
INSERT INTO `skill_damage_tick` (`skill_id`, `tick_index`, `offset`, `stagger`, `sp`, `bound_effects`) VALUES
('TANGTANG_chain', 0, 0.87, 10, 0, '["srcvyfw"]');

-- skill_anomaly
INSERT INTO `skill_anomaly` (`skill_id`, `anomaly_index`, `group_index`, `type`, `stacks`, `duration`, `offset`, `delay`) VALUES
('TANGTANG_chain', 0, 0, 'comboskillwater', 1, 0, 0.87, 0);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('TANGTANG_ultimate', 2.8, NULL, NULL, NULL, NULL, '["ultskilldebuff","skillwater","spell_vulnerable","cold_burst","frozen","cold_attach"]', 100, 0, 2.8);

-- skill_damage_tick
INSERT INTO `skill_damage_tick` (`skill_id`, `tick_index`, `offset`, `stagger`, `sp`, `bound_effects`) VALUES
('TANGTANG_ultimate', 0, 2.53, 0, 0, '["dbii4zc"]'),
('TANGTANG_ultimate', 1, 6.97, 15, 0, NULL);

-- skill_anomaly
INSERT INTO `skill_anomaly` (`skill_id`, `anomaly_index`, `group_index`, `type`, `stacks`, `duration`, `offset`, `delay`) VALUES
('TANGTANG_ultimate', 0, 0, 'ultskilldebuff', 1, 4, 2.53, 0);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('TANGTANG_normal', 1.5, NULL, NULL, NULL, NULL, '["break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion"]', NULL, NULL, 1.5);

-- attack_segment
INSERT INTO `attack_segment` (`character_id`, `segment_index`, `duration`, `gauge_gain`, `allowed_types`) VALUES
('TANGTANG', 0, 0.27, 0, '["break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion"]'),
('TANGTANG', 1, 0.63, 0, '["break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion"]'),
('TANGTANG', 2, 0.9, 0, '["break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion"]'),
('TANGTANG', 3, 0.83, 0, '["break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion"]'),
('TANGTANG', 4, 1.23, 0, '["break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion"]');

-- attack_segment_tick
INSERT INTO `attack_segment_tick` (`character_id`, `segment_index`, `tick_index`, `offset`, `stagger`, `sp`) VALUES
('TANGTANG', 0, 0, 0.1, 0, 0),
('TANGTANG', 1, 0, 0.2, 0, 0),
('TANGTANG', 1, 1, 0.33, 0, 0),
('TANGTANG', 2, 0, 0.17, 0, 0),
('TANGTANG', 2, 1, 0.23, 0, 0),
('TANGTANG', 2, 2, 0.29, 0, 0),
('TANGTANG', 2, 3, 0.35, 0, 0),
('TANGTANG', 2, 4, 0.41, 0, 0),
('TANGTANG', 2, 5, 0.57, 0, 0),
('TANGTANG', 2, 6, 0.57, 0, 0),
('TANGTANG', 2, 7, 0.6, 0, 0),
('TANGTANG', 2, 8, 0.6, 0, 0),
('TANGTANG', 3, 0, 0.2, 0, 0),
('TANGTANG', 3, 1, 0.33, 0, 0),
('TANGTANG', 3, 2, 0.77, 0, 0),
('TANGTANG', 4, 0, 1, 18, 18);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('ROSSI_skill', 1.27, 100, 6.5, 6.5, NULL, '["knockup","break","ice_shatter","wulfa_blood","talent_wulfa_02"]', NULL, NULL, 1.27);

-- skill_damage_tick
INSERT INTO `skill_damage_tick` (`skill_id`, `tick_index`, `offset`, `stagger`, `sp`, `bound_effects`) VALUES
('ROSSI_skill', 0, 0.53, 0, 0, NULL),
('ROSSI_skill', 1, 0.73, 0, 0, NULL),
('ROSSI_skill', 2, 1.17, 5, 0, '["po2hqi8"]');

-- skill_anomaly
INSERT INTO `skill_anomaly` (`skill_id`, `anomaly_index`, `group_index`, `type`, `stacks`, `duration`, `offset`, `delay`) VALUES
('ROSSI_skill', 0, 0, 'knockup', 1, 0, 1.17, 0);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('ROSSI_chain', 0.7, NULL, 0, NULL, 0, NULL, NULL, NULL, 0.7);

-- skill_damage_tick
INSERT INTO `skill_damage_tick` (`skill_id`, `tick_index`, `offset`, `stagger`, `sp`, `bound_effects`) VALUES
('ROSSI_chain', 0, 0.4, 0, 0, NULL),
('ROSSI_chain', 1, 0.63, 0, 0, NULL),
('ROSSI_chain', 2, 0.67, 0, 0, NULL),
('ROSSI_chain', 3, 0.7, 0, 0, NULL);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('ROSSI_ultimate', 5.17, NULL, NULL, NULL, NULL, '["blaze_burst","burning","blaze_attach","talent_wulfa_02"]', 100, 0, 5.17);

-- skill_damage_tick
INSERT INTO `skill_damage_tick` (`skill_id`, `tick_index`, `offset`, `stagger`, `sp`, `bound_effects`) VALUES
('ROSSI_ultimate', 0, 2.1, 0, 0, NULL),
('ROSSI_ultimate', 1, 2.17, 0, 0, NULL),
('ROSSI_ultimate', 2, 2.2, 0, 0, NULL),
('ROSSI_ultimate', 3, 2.3, 0, 0, NULL),
('ROSSI_ultimate', 4, 2.37, 0, 0, NULL),
('ROSSI_ultimate', 5, 2.47, 0, 0, NULL),
('ROSSI_ultimate', 6, 2.5, 0, 0, NULL),
('ROSSI_ultimate', 7, 2.567, 0, 0, NULL),
('ROSSI_ultimate', 8, 2.6, 0, 0, NULL),
('ROSSI_ultimate', 9, 2.67, 0, 0, NULL),
('ROSSI_ultimate', 10, 2.77, 0, 0, NULL),
('ROSSI_ultimate', 11, 2.8, 0, 0, NULL),
('ROSSI_ultimate', 12, 2.9, 0, 0, NULL),
('ROSSI_ultimate', 13, 2.93, 0, 0, NULL),
('ROSSI_ultimate', 14, 3, 0, 0, NULL),
('ROSSI_ultimate', 15, 3.07, 0, 0, NULL),
('ROSSI_ultimate', 16, 3.13, 0, 0, NULL),
('ROSSI_ultimate', 17, 3.2, 0, 0, NULL),
('ROSSI_ultimate', 18, 3.23, 0, 0, NULL),
('ROSSI_ultimate', 19, 3.3, 0, 0, NULL),
('ROSSI_ultimate', 20, 3.4, 0, 0, NULL),
('ROSSI_ultimate', 21, 3.43, 0, 0, NULL),
('ROSSI_ultimate', 22, 3.53, 0, 0, NULL),
('ROSSI_ultimate', 23, 3.6, 0, 0, NULL),
('ROSSI_ultimate', 24, 3.7, 0, 0, NULL),
('ROSSI_ultimate', 25, 4.07, 0, 0, NULL),
('ROSSI_ultimate', 26, 4.37, 25, 0, '["35u8nuo"]');

-- skill_anomaly
INSERT INTO `skill_anomaly` (`skill_id`, `anomaly_index`, `group_index`, `type`, `stacks`, `duration`, `offset`, `delay`) VALUES
('ROSSI_ultimate', 0, 0, 'blaze_attach', 1, 0, 4.37, 0);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('ROSSI_normal', 1.5, NULL, NULL, NULL, NULL, '["break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion","talent_wulfa_02"]', NULL, NULL, 1.5);

-- attack_segment
INSERT INTO `attack_segment` (`character_id`, `segment_index`, `duration`, `gauge_gain`, `allowed_types`) VALUES
('ROSSI', 0, 0.53, 0, '["break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion"]'),
('ROSSI', 1, 0.7, 0, '["break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion"]'),
('ROSSI', 2, 0.87, 0, '["break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion"]'),
('ROSSI', 3, 1.03, 0, '["break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion"]'),
('ROSSI', 4, 1.03, 0, '["break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion","talent_wulfa_02"]');

-- attack_segment_tick
INSERT INTO `attack_segment_tick` (`character_id`, `segment_index`, `tick_index`, `offset`, `stagger`, `sp`) VALUES
('ROSSI', 0, 0, 0.27, 0, 0),
('ROSSI', 1, 0, 0.03, 0, 0),
('ROSSI', 1, 1, 0.23, 0, 0),
('ROSSI', 2, 0, 0.03, 0, 0),
('ROSSI', 2, 1, 0.13, 0, 0),
('ROSSI', 3, 0, 0.2, 0, 0),
('ROSSI', 3, 1, 0.23, 0, 0),
('ROSSI', 3, 2, 0.267, 0, 0),
('ROSSI', 3, 3, 0.43, 0, 0),
('ROSSI', 3, 4, 0.467, 0, 0),
('ROSSI', 4, 0, 0.5, 18, 21);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('XAIHI_skill', 1, 100, 6.5, 6.5, NULL, '["skill_seraph","spell_enhance"]', NULL, NULL, 1);

-- skill_anomaly
INSERT INTO `skill_anomaly` (`skill_id`, `anomaly_index`, `group_index`, `type`, `stacks`, `duration`, `offset`, `delay`) VALUES
('XAIHI_skill', 0, 0, 'skill_seraph', 1, 20, 0.23, 0),
('XAIHI_skill', 1, 1, 'spell_enhance', 1, 25, 0.23, 0);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('XAIHI_chain', 0.83, NULL, 10, NULL, 8, '["cold_attach","frozen","cold_burst"]', NULL, NULL, 0.83);

-- skill_damage_tick
INSERT INTO `skill_damage_tick` (`skill_id`, `tick_index`, `offset`, `stagger`, `sp`, `bound_effects`) VALUES
('XAIHI_chain', 0, 0.8, 10, 0, '["uacfsvo"]');

-- skill_anomaly
INSERT INTO `skill_anomaly` (`skill_id`, `anomaly_index`, `group_index`, `type`, `stacks`, `duration`, `offset`, `delay`) VALUES
('XAIHI_chain', 0, 0, 'cold_attach', 1, 0, 0.8, 1);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('XAIHI_ultimate', 2.23, NULL, NULL, NULL, NULL, '["cryst_enhance","natural_enhance"]', 72, 0, 2.23);

-- skill_anomaly
INSERT INTO `skill_anomaly` (`skill_id`, `anomaly_index`, `group_index`, `type`, `stacks`, `duration`, `offset`, `delay`) VALUES
('XAIHI_ultimate', 0, 0, 'cryst_enhance', 1, 12, 1.93, 0),
('XAIHI_ultimate', 1, 1, 'natural_enhance', 1, 12, 1.93, 0);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('XAIHI_normal', 1.5, NULL, NULL, NULL, NULL, '["break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion"]', NULL, NULL, 1.5);

-- attack_segment
INSERT INTO `attack_segment` (`character_id`, `segment_index`, `duration`, `gauge_gain`, `allowed_types`) VALUES
('XAIHI', 0, 0.467, 0, '["break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion"]'),
('XAIHI', 1, 0.6, 0, '["break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion"]'),
('XAIHI', 2, 0.5, 0, '["break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion"]'),
('XAIHI', 3, 0.73, 0, '["break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion"]'),
('XAIHI', 4, 1.13, 0, '["break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion"]');

-- attack_segment_tick
INSERT INTO `attack_segment_tick` (`character_id`, `segment_index`, `tick_index`, `offset`, `stagger`, `sp`) VALUES
('XAIHI', 0, 0, 0.33, 0, 0),
('XAIHI', 1, 0, 0.23, 0, 0),
('XAIHI', 2, 0, 0.267, 0, 0),
('XAIHI', 3, 0, 0.23, 0, 0),
('XAIHI', 3, 1, 0.4, 0, 0),
('XAIHI', 4, 0, 0.63, 15, 15);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('SNOWSHINE_skill', 4.5, 100, 6.5, 6.5, NULL, '["cold_attach","frozen","cold_burst","shelter"]', NULL, NULL, 4.5);

-- skill_damage_tick
INSERT INTO `skill_damage_tick` (`skill_id`, `tick_index`, `offset`, `stagger`, `sp`, `bound_effects`) VALUES
('SNOWSHINE_skill', 0, 3.57, 20, 30, NULL);

-- skill_anomaly
INSERT INTO `skill_anomaly` (`skill_id`, `anomaly_index`, `group_index`, `type`, `stacks`, `duration`, `offset`, `delay`) VALUES
('SNOWSHINE_skill', 0, 0, 'cold_attach', 1, 0, 3.57, 0);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('SNOWSHINE_chain', 0.5, NULL, 10, NULL, 25, '["combo_skill_aurora"]', NULL, NULL, 0.5);

-- skill_anomaly
INSERT INTO `skill_anomaly` (`skill_id`, `anomaly_index`, `group_index`, `type`, `stacks`, `duration`, `offset`, `delay`) VALUES
('SNOWSHINE_chain', 0, 0, 'combo_skill_aurora', 1, 3, 0.4, 0);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('SNOWSHINE_ultimate', 2.37, NULL, NULL, NULL, NULL, '["frozen","cold_attach","cold_burst"]', 80, 0, 2.37);

-- skill_damage_tick
INSERT INTO `skill_damage_tick` (`skill_id`, `tick_index`, `offset`, `stagger`, `sp`, `bound_effects`) VALUES
('SNOWSHINE_ultimate', 0, 2.07, 15, 0, NULL);

-- skill_anomaly
INSERT INTO `skill_anomaly` (`skill_id`, `anomaly_index`, `group_index`, `type`, `stacks`, `duration`, `offset`, `delay`) VALUES
('SNOWSHINE_ultimate', 0, 0, 'frozen', 1, 0, 2.07, 2);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('SNOWSHINE_normal', 1.5, NULL, NULL, NULL, NULL, '["break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion"]', NULL, NULL, 1.5);

-- attack_segment
INSERT INTO `attack_segment` (`character_id`, `segment_index`, `duration`, `gauge_gain`, `allowed_types`) VALUES
('SNOWSHINE', 0, 1.1, 0, '["break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion"]'),
('SNOWSHINE', 1, 0.967, 0, '["break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion"]'),
('SNOWSHINE', 2, 2.067, 0, '["break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion"]'),
('SNOWSHINE', 3, 0, 0, '["break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion"]'),
('SNOWSHINE', 4, 0, 0, '["break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion"]');

-- attack_segment_tick
INSERT INTO `attack_segment_tick` (`character_id`, `segment_index`, `tick_index`, `offset`, `stagger`, `sp`) VALUES
('SNOWSHINE', 0, 0, 0.63, 0, 0),
('SNOWSHINE', 1, 0, 0.63, 0, 0),
('SNOWSHINE', 2, 0, 0.7, 0, 0),
('SNOWSHINE', 2, 1, 1.3, 23, 25);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('ARCLIGHT_skill', 1.2, 100, 6.5, 6.5, NULL, NULL, NULL, NULL, 1.2);

-- skill_damage_tick
INSERT INTO `skill_damage_tick` (`skill_id`, `tick_index`, `offset`, `stagger`, `sp`, `bound_effects`) VALUES
('ARCLIGHT_skill', 0, 0.63, 0, 0, NULL),
('ARCLIGHT_skill', 1, 0.8, 5, 0, NULL);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('ARCLIGHT_chain', 0.9, NULL, 5, NULL, 3, NULL, NULL, NULL, 0.9);

-- skill_damage_tick
INSERT INTO `skill_damage_tick` (`skill_id`, `tick_index`, `offset`, `stagger`, `sp`, `bound_effects`) VALUES
('ARCLIGHT_chain', 0, 0.57, 0, 0, NULL),
('ARCLIGHT_chain', 1, 0.7, 0, 0, NULL),
('ARCLIGHT_chain', 2, 0.83, 5, 8, NULL);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('ARCLIGHT_ultimate', 2.57, NULL, NULL, NULL, NULL, '["emag_attach","conductive","emag_burst"]', 76.5, 0, 2.57);

-- skill_damage_tick
INSERT INTO `skill_damage_tick` (`skill_id`, `tick_index`, `offset`, `stagger`, `sp`, `bound_effects`) VALUES
('ARCLIGHT_ultimate', 0, 2.03, 7, 0, NULL),
('ARCLIGHT_ultimate', 1, 3.9, 7, 0, NULL);

-- skill_anomaly
INSERT INTO `skill_anomaly` (`skill_id`, `anomaly_index`, `group_index`, `type`, `stacks`, `duration`, `offset`, `delay`) VALUES
('ARCLIGHT_ultimate', 0, 0, 'emag_attach', 1, 0, 2.03, 0),
('ARCLIGHT_ultimate', 1, 0, 'conductive', 1, 0, 3.9, 0);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('ARCLIGHT_normal', 1.5, NULL, NULL, NULL, NULL, '["break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion"]', NULL, NULL, 1.5);

-- attack_segment
INSERT INTO `attack_segment` (`character_id`, `segment_index`, `duration`, `gauge_gain`, `allowed_types`) VALUES
('ARCLIGHT', 0, 0.33, 0, '["break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion"]'),
('ARCLIGHT', 1, 0.367, 0, '["break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion"]'),
('ARCLIGHT', 2, 0.7, 0, '["break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion"]'),
('ARCLIGHT', 3, 0.93, 0, '["break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion"]'),
('ARCLIGHT', 4, 1, 0, '["break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion"]');

-- attack_segment_tick
INSERT INTO `attack_segment_tick` (`character_id`, `segment_index`, `tick_index`, `offset`, `stagger`, `sp`) VALUES
('ARCLIGHT', 0, 0, 0.17, 0, 0),
('ARCLIGHT', 1, 0, 0.17, 0, 0),
('ARCLIGHT', 2, 0, 0.23, 0, 0),
('ARCLIGHT', 2, 1, 0.43, 0, 0),
('ARCLIGHT', 3, 0, 0.17, 0, 0),
('ARCLIGHT', 4, 0, 0.4, 16, 17);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('AVYWENNA_skill', 1.13, 100, 6.5, 6.5, NULL, '["emag_burst","conductive","emag_attach"]', NULL, NULL, 1.13);

-- skill_damage_tick
INSERT INTO `skill_damage_tick` (`skill_id`, `tick_index`, `offset`, `stagger`, `sp`, `bound_effects`) VALUES
('AVYWENNA_skill', 0, 0.6, 5, 0, NULL);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('AVYWENNA_chain', 0.7, NULL, 10, NULL, 13, '["Thunderlances"]', NULL, NULL, 0.7);

-- skill_damage_tick
INSERT INTO `skill_damage_tick` (`skill_id`, `tick_index`, `offset`, `stagger`, `sp`, `bound_effects`) VALUES
('AVYWENNA_chain', 0, 0.47, 10, 0, '["u4et5cu"]');

-- skill_anomaly
INSERT INTO `skill_anomaly` (`skill_id`, `anomaly_index`, `group_index`, `type`, `stacks`, `duration`, `offset`, `delay`) VALUES
('AVYWENNA_chain', 0, 0, 'Thunderlances', 3, 0, 0.47, 0);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('AVYWENNA_ultimate', 1.9, NULL, NULL, NULL, NULL, '["Thunderlances EX"]', 85, 0, 1.9);

-- skill_damage_tick
INSERT INTO `skill_damage_tick` (`skill_id`, `tick_index`, `offset`, `stagger`, `sp`, `bound_effects`) VALUES
('AVYWENNA_ultimate', 0, 1.7, 0, 0, '["0e8kj85"]');

-- skill_anomaly
INSERT INTO `skill_anomaly` (`skill_id`, `anomaly_index`, `group_index`, `type`, `stacks`, `duration`, `offset`, `delay`) VALUES
('AVYWENNA_ultimate', 0, 0, 'Thunderlances EX', 1, 0, 1.7, 0);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('AVYWENNA_normal', 1.5, NULL, NULL, NULL, NULL, '["break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion"]', NULL, NULL, 1.5);

-- attack_segment
INSERT INTO `attack_segment` (`character_id`, `segment_index`, `duration`, `gauge_gain`, `allowed_types`) VALUES
('AVYWENNA', 0, 0.3, 0, '["break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion"]'),
('AVYWENNA', 1, 0.5, 0, '["break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion"]'),
('AVYWENNA', 2, 0.367, 0, '["break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion"]'),
('AVYWENNA', 3, 0.767, 0, '["break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion"]'),
('AVYWENNA', 4, 1.53, 0, '["break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion"]');

-- attack_segment_tick
INSERT INTO `attack_segment_tick` (`character_id`, `segment_index`, `tick_index`, `offset`, `stagger`, `sp`) VALUES
('AVYWENNA', 0, 0, 0.23, 0, 0),
('AVYWENNA', 1, 0, 0.23, 0, 0),
('AVYWENNA', 2, 0, 0.23, 0, 0),
('AVYWENNA', 3, 0, 0.17, 0, 0),
('AVYWENNA', 3, 1, 0.6, 0, 0),
('AVYWENNA', 4, 0, 0.8, 17, 19);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('DAPAN_skill', 2.17, 100, 6.5, 6.5, NULL, '["knockup","break","ice_shatter"]', NULL, NULL, 2.17);

-- skill_damage_tick
INSERT INTO `skill_damage_tick` (`skill_id`, `tick_index`, `offset`, `stagger`, `sp`, `bound_effects`) VALUES
('DAPAN_skill', 0, 0.27, 0, 0, NULL),
('DAPAN_skill', 1, 1.43, 10, 0, '["u1eh47y"]');

-- skill_anomaly
INSERT INTO `skill_anomaly` (`skill_id`, `anomaly_index`, `group_index`, `type`, `stacks`, `duration`, `offset`, `delay`) VALUES
('DAPAN_skill', 0, 0, 'knockup', 1, 0, 1.43, 1.5);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('DAPAN_chain', 0.8, NULL, 10, NULL, 20, '["stagger","break","ice_shatter"]', NULL, NULL, 0.8);

-- skill_damage_tick
INSERT INTO `skill_damage_tick` (`skill_id`, `tick_index`, `offset`, `stagger`, `sp`, `bound_effects`) VALUES
('DAPAN_chain', 0, 1.76, 15, 0, '["r58y37u"]');

-- skill_anomaly
INSERT INTO `skill_anomaly` (`skill_id`, `anomaly_index`, `group_index`, `type`, `stacks`, `duration`, `offset`, `delay`) VALUES
('DAPAN_chain', 0, 0, 'stagger', 4, 0, 0.77, 0);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('DAPAN_ultimate', 2.87, NULL, NULL, NULL, NULL, '["knockdown","break","ice_shatter","knockup","dapan_buff"]', 76.5, 0, 2.87);

-- skill_damage_tick
INSERT INTO `skill_damage_tick` (`skill_id`, `tick_index`, `offset`, `stagger`, `sp`, `bound_effects`) VALUES
('DAPAN_ultimate', 0, 1.4, 0, 0, '["vyen6bq"]'),
('DAPAN_ultimate', 1, 2.67, 0, 0, '["lzwjaou"]');

-- skill_anomaly
INSERT INTO `skill_anomaly` (`skill_id`, `anomaly_index`, `group_index`, `type`, `stacks`, `duration`, `offset`, `delay`) VALUES
('DAPAN_ultimate', 0, 0, 'knockup', 1, 0, 1.4, 0),
('DAPAN_ultimate', 1, 0, 'knockdown', 1, 0, 2.67, 0),
('DAPAN_ultimate', 2, 1, 'dapan_buff', 1, 20, 2.67, 0);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('DAPAN_normal', 1.5, NULL, NULL, NULL, NULL, '["break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion"]', NULL, NULL, 1.5);

-- attack_segment
INSERT INTO `attack_segment` (`character_id`, `segment_index`, `duration`, `gauge_gain`, `allowed_types`) VALUES
('DAPAN', 0, 0.53, 0, '["break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion"]'),
('DAPAN', 1, 0.7, 0, '["break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion"]'),
('DAPAN', 2, 0.867, 0, '["break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion"]'),
('DAPAN', 3, 1.53, 0, '["break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion"]'),
('DAPAN', 4, 0, 0, '["break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion"]');

-- attack_segment_tick
INSERT INTO `attack_segment_tick` (`character_id`, `segment_index`, `tick_index`, `offset`, `stagger`, `sp`) VALUES
('DAPAN', 0, 0, 0.43, 0, 0),
('DAPAN', 1, 0, 0.23, 0, 0),
('DAPAN', 2, 0, 0.33, 0, 0),
('DAPAN', 2, 1, 0.77, 0, 0),
('DAPAN', 3, 0, 1.07, 20, 21);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('WULFGARD_skill', 1.07, 100, 6.5, 6.5, NULL, '["blaze_attach","burning","blaze_burst"]', NULL, NULL, 1.07);

-- skill_damage_tick
INSERT INTO `skill_damage_tick` (`skill_id`, `tick_index`, `offset`, `stagger`, `sp`, `bound_effects`) VALUES
('WULFGARD_skill', 0, 0.2, 0, 0, NULL),
('WULFGARD_skill', 1, 0.53, 0, 0, NULL),
('WULFGARD_skill', 2, 0.767, 5, 0, '["ukuwp86"]');

-- skill_anomaly
INSERT INTO `skill_anomaly` (`skill_id`, `anomaly_index`, `group_index`, `type`, `stacks`, `duration`, `offset`, `delay`) VALUES
('WULFGARD_skill', 0, 0, 'blaze_attach', 1, 0, 0.767, 0.9);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('WULFGARD_chain', 1, NULL, 10, NULL, 20, '["blaze_attach","burning","blaze_burst"]', NULL, NULL, 1);

-- skill_damage_tick
INSERT INTO `skill_damage_tick` (`skill_id`, `tick_index`, `offset`, `stagger`, `sp`, `bound_effects`) VALUES
('WULFGARD_chain', 0, 0.9, 10, 0, '["1944zas"]');

-- skill_anomaly
INSERT INTO `skill_anomaly` (`skill_id`, `anomaly_index`, `group_index`, `type`, `stacks`, `duration`, `offset`, `delay`) VALUES
('WULFGARD_chain', 0, 0, 'blaze_attach', 1, 0, 0.9, 0.9);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('WULFGARD_ultimate', 2.5, NULL, NULL, NULL, NULL, '["burning","blaze_attach","blaze_burst"]', 76.5, 0, 2.5);

-- skill_damage_tick
INSERT INTO `skill_damage_tick` (`skill_id`, `tick_index`, `offset`, `stagger`, `sp`, `bound_effects`) VALUES
('WULFGARD_ultimate', 0, 1.53, 0, 0, NULL),
('WULFGARD_ultimate', 1, 1.73, 0, 0, NULL),
('WULFGARD_ultimate', 2, 1.967, 0, 0, NULL),
('WULFGARD_ultimate', 3, 1.13, 0, 0, NULL),
('WULFGARD_ultimate', 4, 2.3, 15, 0, '["mvoxwl3"]');

-- skill_anomaly
INSERT INTO `skill_anomaly` (`skill_id`, `anomaly_index`, `group_index`, `type`, `stacks`, `duration`, `offset`, `delay`) VALUES
('WULFGARD_ultimate', 0, 0, 'burning', 1, 0, 2.3, 0);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('WULFGARD_normal', 1.5, NULL, NULL, NULL, NULL, '["break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion"]', NULL, NULL, 1.5);

-- attack_segment
INSERT INTO `attack_segment` (`character_id`, `segment_index`, `duration`, `gauge_gain`, `allowed_types`) VALUES
('WULFGARD', 0, 0.83, 0, '["break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion"]'),
('WULFGARD', 1, 0.8, 0, '["break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion"]'),
('WULFGARD', 2, 1.1, 0, '["break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion"]'),
('WULFGARD', 3, 1.767, 0, '["break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion"]'),
('WULFGARD', 4, 0, 0, '["break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion"]');

-- attack_segment_tick
INSERT INTO `attack_segment_tick` (`character_id`, `segment_index`, `tick_index`, `offset`, `stagger`, `sp`) VALUES
('WULFGARD', 0, 0, 0.23, 0, 0),
('WULFGARD', 0, 1, 0.467, 0, 0),
('WULFGARD', 1, 0, 0.33, 0, 0),
('WULFGARD', 1, 1, 0.53, 0, 0),
('WULFGARD', 2, 0, 0.4, 0, 0),
('WULFGARD', 2, 1, 0.6, 0, 0),
('WULFGARD', 2, 2, 0.8, 0, 0),
('WULFGARD', 3, 0, 0.767, 18, 18);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('PERLICA_skill', 0.93, 100, 6.5, 6.5, NULL, '["emag_attach","conductive","emag_burst"]', NULL, NULL, 0.93);

-- skill_damage_tick
INSERT INTO `skill_damage_tick` (`skill_id`, `tick_index`, `offset`, `stagger`, `sp`, `bound_effects`) VALUES
('PERLICA_skill', 0, 0.43, 10, 0, '["ein5itj"]');

-- skill_anomaly
INSERT INTO `skill_anomaly` (`skill_id`, `anomaly_index`, `group_index`, `type`, `stacks`, `duration`, `offset`, `delay`) VALUES
('PERLICA_skill', 0, 0, 'emag_attach', 1, 0, 0.43, 0.5);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('PERLICA_chain', 0.83, NULL, 10, NULL, 20, '["conductive","emag_attach","emag_burst"]', NULL, NULL, 0.83);

-- skill_damage_tick
INSERT INTO `skill_damage_tick` (`skill_id`, `tick_index`, `offset`, `stagger`, `sp`, `bound_effects`) VALUES
('PERLICA_chain', 0, 0.8, 10, 0, '["ufb12al"]');

-- skill_anomaly
INSERT INTO `skill_anomaly` (`skill_id`, `anomaly_index`, `group_index`, `type`, `stacks`, `duration`, `offset`, `delay`) VALUES
('PERLICA_chain', 0, 0, 'conductive', 1, 8.75, 0.8, 0.9);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('PERLICA_ultimate', 2.1, NULL, NULL, NULL, NULL, NULL, 68, 0, 2.1);

-- skill_damage_tick
INSERT INTO `skill_damage_tick` (`skill_id`, `tick_index`, `offset`, `stagger`, `sp`, `bound_effects`) VALUES
('PERLICA_ultimate', 0, 1.93, 0, 0, NULL);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('PERLICA_normal', 1.5, NULL, NULL, NULL, NULL, '["break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion"]', NULL, NULL, 1.5);

-- attack_segment
INSERT INTO `attack_segment` (`character_id`, `segment_index`, `duration`, `gauge_gain`, `allowed_types`) VALUES
('PERLICA', 0, 0.53, 0, '["break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion"]'),
('PERLICA', 1, 0.63, 0, '["break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion"]'),
('PERLICA', 2, 0.9, 0, '["break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion"]'),
('PERLICA', 3, 1.467, 0, '["break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion"]'),
('PERLICA', 4, 0, 0, '["break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion"]');

-- attack_segment_tick
INSERT INTO `attack_segment_tick` (`character_id`, `segment_index`, `tick_index`, `offset`, `stagger`, `sp`) VALUES
('PERLICA', 0, 0, 0.267, 0, 0),
('PERLICA', 1, 0, 0.3, 0, 0),
('PERLICA', 1, 1, 0.4, 0, 0),
('PERLICA', 2, 0, 0.53, 0, 0),
('PERLICA', 2, 1, 0.63, 0, 0),
('PERLICA', 2, 2, 0.73, 0, 0),
('PERLICA', 3, 0, 0.9, 15, 15);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('CHENQIANYU_skill', 0.83, 100, 6.5, 6.5, NULL, '["knockup","break","ice_shatter"]', NULL, NULL, 0.83);

-- skill_damage_tick
INSERT INTO `skill_damage_tick` (`skill_id`, `tick_index`, `offset`, `stagger`, `sp`, `bound_effects`) VALUES
('CHENQIANYU_skill', 0, 0.43, 10, 0, '["ovn2n9y"]');

-- skill_anomaly
INSERT INTO `skill_anomaly` (`skill_id`, `anomaly_index`, `group_index`, `type`, `stacks`, `duration`, `offset`, `delay`) VALUES
('CHENQIANYU_skill', 0, 0, 'knockup', 1, 0, 0.43, 0.5);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('CHENQIANYU_chain', 0.77, NULL, 10, NULL, 16, '["knockup","break","ice_shatter"]', NULL, NULL, 0.77);

-- skill_damage_tick
INSERT INTO `skill_damage_tick` (`skill_id`, `tick_index`, `offset`, `stagger`, `sp`, `bound_effects`) VALUES
('CHENQIANYU_chain', 0, 0.57, 10, 0, '["0eap175"]');

-- skill_anomaly
INSERT INTO `skill_anomaly` (`skill_id`, `anomaly_index`, `group_index`, `type`, `stacks`, `duration`, `offset`, `delay`) VALUES
('CHENQIANYU_chain', 0, 0, 'knockup', 1, 0, 0.57, 0.6);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('CHENQIANYU_ultimate', 3.73, NULL, NULL, NULL, NULL, NULL, 59.5, 0, 3.73);

-- skill_damage_tick
INSERT INTO `skill_damage_tick` (`skill_id`, `tick_index`, `offset`, `stagger`, `sp`, `bound_effects`) VALUES
('CHENQIANYU_ultimate', 0, 1.93, 15, 0, NULL),
('CHENQIANYU_ultimate', 1, 2.1, 0, 0, NULL),
('CHENQIANYU_ultimate', 2, 2.267, 0, 0, NULL),
('CHENQIANYU_ultimate', 3, 2.4, 0, 0, NULL),
('CHENQIANYU_ultimate', 4, 2.53, 0, 0, NULL),
('CHENQIANYU_ultimate', 5, 2.67, 0, 0, NULL),
('CHENQIANYU_ultimate', 6, 3.43, 20, 0, NULL);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('CHENQIANYU_normal', 2.5, NULL, NULL, NULL, NULL, '["break","blaze_attach","burning","blaze_burst","emag_burst","conductive","emag_attach","frozen","cold_attach","cold_burst","ice_shatter","corrosion","nature_attach","nature_burst","knockdown","knockup","stagger","armor_break"]', NULL, NULL, 2.5);

-- attack_segment
INSERT INTO `attack_segment` (`character_id`, `segment_index`, `duration`, `gauge_gain`, `allowed_types`) VALUES
('CHENQIANYU', 0, 0.5, 0, '["conductive","emag_attach","emag_burst","burning","blaze_attach","blaze_burst","knockup","break","ice_shatter","nature_attach","corrosion","nature_burst","knockdown","cold_attach","frozen","cold_burst","stagger","armor_break"]'),
('CHENQIANYU', 1, 0.367, 0, '["conductive","emag_attach","emag_burst","burning","blaze_attach","blaze_burst","knockup","break","ice_shatter","nature_attach","corrosion","nature_burst","knockdown","cold_attach","frozen","cold_burst","stagger","armor_break"]'),
('CHENQIANYU', 2, 0.63, 0, '["conductive","emag_attach","emag_burst","burning","blaze_attach","blaze_burst","knockup","break","ice_shatter","nature_attach","corrosion","nature_burst","knockdown","cold_attach","frozen","cold_burst","stagger","armor_break"]'),
('CHENQIANYU', 3, 0.73, 0, '["conductive","emag_attach","emag_burst","burning","blaze_attach","blaze_burst","knockup","break","ice_shatter","nature_attach","corrosion","nature_burst","knockdown","cold_attach","frozen","cold_burst","stagger","armor_break"]'),
('CHENQIANYU', 4, 1.1, 0, '["conductive","emag_attach","emag_burst","burning","blaze_attach","blaze_burst","knockup","break","ice_shatter","nature_attach","corrosion","nature_burst","knockdown","cold_attach","frozen","cold_burst","stagger","armor_break"]');

-- attack_segment_tick
INSERT INTO `attack_segment_tick` (`character_id`, `segment_index`, `tick_index`, `offset`, `stagger`, `sp`) VALUES
('CHENQIANYU', 0, 0, 0.27, 0, 0),
('CHENQIANYU', 0, 1, 0.37, 0, 0),
('CHENQIANYU', 1, 0, 0.23, 0, 0),
('CHENQIANYU', 2, 0, 0.3, 0, 0),
('CHENQIANYU', 2, 1, 0.4, 0, 0),
('CHENQIANYU', 3, 0, 0.13, 0, 0),
('CHENQIANYU', 3, 1, 0.33, 0, 0),
('CHENQIANYU', 4, 0, 0.53, 16, 18);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('ALESH_skill', 1.67, 100, 17, 8.5, NULL, '["frozen","cold_attach","cold_burst"]', NULL, NULL, 1.67);

-- skill_damage_tick
INSERT INTO `skill_damage_tick` (`skill_id`, `tick_index`, `offset`, `stagger`, `sp`, `bound_effects`) VALUES
('ALESH_skill', 0, 0.9, 10, 0, NULL);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('ALESH_chain', 1.3, NULL, 10, NULL, 9, NULL, NULL, NULL, 1.3);

-- skill_damage_tick
INSERT INTO `skill_damage_tick` (`skill_id`, `tick_index`, `offset`, `stagger`, `sp`, `bound_effects`) VALUES
('ALESH_chain', 0, 1.27, 10, 10, NULL);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('ALESH_ultimate', 3.2, NULL, NULL, NULL, NULL, '["cold_burst","frozen","cold_attach"]', 85, 0, 3.2);

-- skill_damage_tick
INSERT INTO `skill_damage_tick` (`skill_id`, `tick_index`, `offset`, `stagger`, `sp`, `bound_effects`) VALUES
('ALESH_ultimate', 0, 3, 20, 20, '["9tboxfr"]');

-- skill_anomaly
INSERT INTO `skill_anomaly` (`skill_id`, `anomaly_index`, `group_index`, `type`, `stacks`, `duration`, `offset`, `delay`) VALUES
('ALESH_ultimate', 0, 0, 'cold_attach', 1, 0, 3, 0);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('ALESH_normal', 1.5, NULL, NULL, NULL, NULL, '["frozen","cold_attach","cold_burst","emag_burst","conductive","emag_attach","blaze_attach","burning","blaze_burst","break","armor_break","ice_shatter","knockdown","knockup","stagger","corrosion","nature_attach","nature_burst"]', NULL, NULL, 1.5);

-- attack_segment
INSERT INTO `attack_segment` (`character_id`, `segment_index`, `duration`, `gauge_gain`, `allowed_types`) VALUES
('ALESH', 0, 0.43, 0, '["corrosion","nature_attach","nature_burst","burning","blaze_attach","blaze_burst","conductive","emag_attach","emag_burst","knockup","break","ice_shatter","knockdown","cold_attach","frozen","cold_burst","stagger","armor_break"]'),
('ALESH', 1, 0.367, 0, '["corrosion","nature_attach","nature_burst","burning","blaze_attach","blaze_burst","conductive","emag_attach","emag_burst","knockup","break","ice_shatter","knockdown","cold_attach","frozen","cold_burst","stagger","armor_break"]'),
('ALESH', 2, 0.567, 0, '["corrosion","nature_attach","nature_burst","burning","blaze_attach","blaze_burst","conductive","emag_attach","emag_burst","knockup","break","ice_shatter","knockdown","cold_attach","frozen","cold_burst","stagger","armor_break"]'),
('ALESH', 3, 0.767, 0, '["corrosion","nature_attach","nature_burst","burning","blaze_attach","blaze_burst","conductive","emag_attach","emag_burst","knockup","break","ice_shatter","knockdown","cold_attach","frozen","cold_burst","stagger","armor_break"]'),
('ALESH', 4, 1.067, 0, '["corrosion","nature_attach","nature_burst","burning","blaze_attach","blaze_burst","conductive","emag_attach","emag_burst","knockup","break","ice_shatter","knockdown","cold_attach","frozen","cold_burst","stagger","armor_break"]');

-- attack_segment_tick
INSERT INTO `attack_segment_tick` (`character_id`, `segment_index`, `tick_index`, `offset`, `stagger`, `sp`) VALUES
('ALESH', 0, 0, 0.23, 0, 0),
('ALESH', 1, 0, 0.17, 0, 0),
('ALESH', 2, 0, 0.43, 0, 0),
('ALESH', 3, 0, 0.5, 0, 0),
('ALESH', 4, 0, 0.6, 17, 19),
('ALESH', 4, 1, 0.63, 0, 0);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('CATCHER_skill', 3.17, 100, 6.5, 6.5, NULL, '["break"]', NULL, NULL, 3.17);

-- skill_damage_tick
INSERT INTO `skill_damage_tick` (`skill_id`, `tick_index`, `offset`, `stagger`, `sp`, `bound_effects`) VALUES
('CATCHER_skill', 0, 2.77, 20, 30, '["6rva6qe"]');

-- skill_anomaly
INSERT INTO `skill_anomaly` (`skill_id`, `anomaly_index`, `group_index`, `type`, `stacks`, `duration`, `offset`, `delay`) VALUES
('CATCHER_skill', 0, 0, 'break', 1, 0, 2.77, 0);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('CATCHER_chain', 0.8, NULL, 10, NULL, 15, NULL, NULL, NULL, 0.8);

-- skill_damage_tick
INSERT INTO `skill_damage_tick` (`skill_id`, `tick_index`, `offset`, `stagger`, `sp`, `bound_effects`) VALUES
('CATCHER_chain', 0, 0.57, 10, 0, NULL);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('CATCHER_ultimate', 3.43, NULL, NULL, NULL, NULL, '["knockdown","break","ice_shatter","weak"]', 72, 0, 3.43);

-- skill_damage_tick
INSERT INTO `skill_damage_tick` (`skill_id`, `tick_index`, `offset`, `stagger`, `sp`, `bound_effects`) VALUES
('CATCHER_ultimate', 0, 1.53, 5, 0, NULL),
('CATCHER_ultimate', 1, 2.13, 5, 0, NULL),
('CATCHER_ultimate', 2, 2.83, 10, 0, '["tkbxsng","o2u8r8e"]');

-- skill_anomaly
INSERT INTO `skill_anomaly` (`skill_id`, `anomaly_index`, `group_index`, `type`, `stacks`, `duration`, `offset`, `delay`) VALUES
('CATCHER_ultimate', 0, 0, 'knockdown', 1, 0, 2.83, 0),
('CATCHER_ultimate', 1, 1, 'weak', 1, 8, 2.83, 0);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('CATCHER_normal', 1.5, NULL, NULL, NULL, NULL, '["break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion"]', NULL, NULL, 1.5);

-- attack_segment
INSERT INTO `attack_segment` (`character_id`, `segment_index`, `duration`, `gauge_gain`, `allowed_types`) VALUES
('CATCHER', 0, 0.73, 0, '["break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion"]'),
('CATCHER', 1, 0.73, 0, '["break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion"]'),
('CATCHER', 2, 0.967, 0, '["break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion"]'),
('CATCHER', 3, 1.53, 0, '["break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion"]'),
('CATCHER', 4, 0, 0, '["break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion"]');

-- attack_segment_tick
INSERT INTO `attack_segment_tick` (`character_id`, `segment_index`, `tick_index`, `offset`, `stagger`, `sp`) VALUES
('CATCHER', 0, 0, 0.4, 0, 0),
('CATCHER', 1, 0, 0.33, 0, 0),
('CATCHER', 2, 0, 0.53, 0, 0),
('CATCHER', 3, 0, 0.77, 22, 25);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('FLUORITE_skill', 1.13, 100, 6.5, 6.5, NULL, '["nature_attach","corrosion","nature_burst"]', NULL, NULL, 1.13);

-- skill_damage_tick
INSERT INTO `skill_damage_tick` (`skill_id`, `tick_index`, `offset`, `stagger`, `sp`, `bound_effects`) VALUES
('FLUORITE_skill', 0, 0.33, 0, 0, NULL),
('FLUORITE_skill', 1, 2.97, 10, 0, '["4ykrgr4"]');

-- skill_anomaly
INSERT INTO `skill_anomaly` (`skill_id`, `anomaly_index`, `group_index`, `type`, `stacks`, `duration`, `offset`, `delay`) VALUES
('FLUORITE_skill', 0, 0, 'nature_attach', 1, 0, 2.97, 0);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('FLUORITE_chain', 0.57, NULL, 10, NULL, 25, '["cold_attach","cold_burst","nature_attach","nature_burst"]', NULL, NULL, 0.57);

-- skill_damage_tick
INSERT INTO `skill_damage_tick` (`skill_id`, `tick_index`, `offset`, `stagger`, `sp`, `bound_effects`) VALUES
('FLUORITE_chain', 0, 0.5, 10, 0, NULL);

-- skill_anomaly
INSERT INTO `skill_anomaly` (`skill_id`, `anomaly_index`, `group_index`, `type`, `stacks`, `duration`, `offset`, `delay`) VALUES
('FLUORITE_chain', 0, 0, 'cold_attach', 1, 0, 0.5, 0),
('FLUORITE_chain', 1, 1, 'nature_attach', 1, 0, 0.5, 0);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('FLUORITE_ultimate', 2.57, NULL, NULL, NULL, NULL, '["nature_attach","cold_attach"]', 72, 0, 2.57);

-- skill_damage_tick
INSERT INTO `skill_damage_tick` (`skill_id`, `tick_index`, `offset`, `stagger`, `sp`, `bound_effects`) VALUES
('FLUORITE_ultimate', 0, 1.97, 0, 0, NULL),
('FLUORITE_ultimate', 1, 2.1, 0, 0, NULL),
('FLUORITE_ultimate', 2, 2.23, 0, 0, NULL),
('FLUORITE_ultimate', 3, 2.4, 20, 0, NULL);

-- skill_anomaly
INSERT INTO `skill_anomaly` (`skill_id`, `anomaly_index`, `group_index`, `type`, `stacks`, `duration`, `offset`, `delay`) VALUES
('FLUORITE_ultimate', 0, 0, 'nature_attach', 1, 0, 2.4, 0),
('FLUORITE_ultimate', 1, 1, 'nature_attach', 1, 0, 2.4, 0);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('FLUORITE_normal', 1.5, NULL, NULL, NULL, NULL, '["break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion"]', NULL, NULL, 1.5);

-- attack_segment
INSERT INTO `attack_segment` (`character_id`, `segment_index`, `duration`, `gauge_gain`, `allowed_types`) VALUES
('FLUORITE', 0, 0.767, 0, '["break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion"]'),
('FLUORITE', 1, 0.53, 0, '["break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion"]'),
('FLUORITE', 2, 0.63, 0, '["break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion"]'),
('FLUORITE', 3, 1.767, 0, '["break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion"]'),
('FLUORITE', 4, 0, 0, '["break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion"]');

-- attack_segment_tick
INSERT INTO `attack_segment_tick` (`character_id`, `segment_index`, `tick_index`, `offset`, `stagger`, `sp`) VALUES
('FLUORITE', 0, 0, 0.43, 0, 0),
('FLUORITE', 1, 0, 0.3, 0, 0),
('FLUORITE', 2, 0, 0.3, 0, 0),
('FLUORITE', 3, 0, 0.967, 15, 15);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('ANTAL_skill', 1, 100, 6.5, 6.5, NULL, '["antal_buff"]', NULL, NULL, 1);

-- skill_damage_tick
INSERT INTO `skill_damage_tick` (`skill_id`, `tick_index`, `offset`, `stagger`, `sp`, `bound_effects`) VALUES
('ANTAL_skill', 0, 0.67, 0, 0, '["wfb8wtw"]');

-- skill_anomaly
INSERT INTO `skill_anomaly` (`skill_id`, `anomaly_index`, `group_index`, `type`, `stacks`, `duration`, `offset`, `delay`) VALUES
('ANTAL_skill', 0, 0, 'antal_buff', 1, 60, 0.67, 0);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('ANTAL_chain', 0.8, NULL, 10, NULL, 15, '["emag_attach","conductive","emag_burst","cold_attach","frozen","cold_burst","burning","blaze_attach","blaze_burst","nature_burst","corrosion","nature_attach"]', NULL, NULL, 0.8);

-- skill_damage_tick
INSERT INTO `skill_damage_tick` (`skill_id`, `tick_index`, `offset`, `stagger`, `sp`, `bound_effects`) VALUES
('ANTAL_chain', 0, 0.7, 10, 0, NULL);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('ANTAL_ultimate', 1.87, NULL, NULL, NULL, NULL, '["pulse_enhance","fire_enhance"]', 90, 0, 1.87);

-- skill_anomaly
INSERT INTO `skill_anomaly` (`skill_id`, `anomaly_index`, `group_index`, `type`, `stacks`, `duration`, `offset`, `delay`) VALUES
('ANTAL_ultimate', 0, 0, 'pulse_enhance', 1, 12, 1.63, 0),
('ANTAL_ultimate', 1, 1, 'fire_enhance', 1, 12, 1.63, 0);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('ANTAL_normal', 1.5, NULL, NULL, NULL, NULL, '["break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion"]', NULL, NULL, 1.5);

-- attack_segment
INSERT INTO `attack_segment` (`character_id`, `segment_index`, `duration`, `gauge_gain`, `allowed_types`) VALUES
('ANTAL', 0, 0.53, 0, '["break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion"]'),
('ANTAL', 1, 0.7, 0, '["break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion"]'),
('ANTAL', 2, 0.767, 0, '["break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion"]'),
('ANTAL', 3, 1.3, 0, '["break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion"]'),
('ANTAL', 4, 0, 0, '["break","armor_break","stagger","knockdown","knockup","blaze_attach","emag_attach","cold_attach","nature_attach","blaze_burst","emag_burst","cold_burst","nature_burst","burning","conductive","frozen","ice_shatter","corrosion"]');

-- attack_segment_tick
INSERT INTO `attack_segment_tick` (`character_id`, `segment_index`, `tick_index`, `offset`, `stagger`, `sp`) VALUES
('ANTAL', 0, 0, 0.267, 0, 0),
('ANTAL', 1, 0, 0.4, 0, 0),
('ANTAL', 2, 0, 0.467, 0, 0),
('ANTAL', 2, 1, 0.6, 0, 0),
('ANTAL', 3, 0, 0.9, 15, 15);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('ESTELLA_skill', 1.5, 100, 6.5, 6.5, NULL, '["cold_burst","frozen","cold_attach"]', NULL, NULL, 1.5);

-- skill_damage_tick
INSERT INTO `skill_damage_tick` (`skill_id`, `tick_index`, `offset`, `stagger`, `sp`, `bound_effects`) VALUES
('ESTELLA_skill', 0, 0.7, 10, 0, '["crb1yuu"]');

-- skill_anomaly
INSERT INTO `skill_anomaly` (`skill_id`, `anomaly_index`, `group_index`, `type`, `stacks`, `duration`, `offset`, `delay`) VALUES
('ESTELLA_skill', 0, 0, 'cold_attach', 1, 0, 0.7, 0);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('ESTELLA_chain', 0.67, NULL, 10, NULL, 15, '["knockup","break","ice_shatter","physical_vulnerable"]', NULL, NULL, 0.67);

-- skill_damage_tick
INSERT INTO `skill_damage_tick` (`skill_id`, `tick_index`, `offset`, `stagger`, `sp`, `bound_effects`) VALUES
('ESTELLA_chain', 0, 0.63, 10, 0, '["dblcris","om9bwx4","x64qg8i"]');

-- skill_anomaly
INSERT INTO `skill_anomaly` (`skill_id`, `anomaly_index`, `group_index`, `type`, `stacks`, `duration`, `offset`, `delay`) VALUES
('ESTELLA_chain', 0, 0, 'ice_shatter', 1, 0, 0.63, 0),
('ESTELLA_chain', 1, 1, 'knockup', 1, 0, 0.63, 0),
('ESTELLA_chain', 2, 2, 'physical_vulnerable', 1, 6, 0.63, 0);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('ESTELLA_ultimate', 2, NULL, NULL, NULL, NULL, '["knockup","break","ice_shatter"]', 63, 0, 2);

-- skill_damage_tick
INSERT INTO `skill_damage_tick` (`skill_id`, `tick_index`, `offset`, `stagger`, `sp`, `bound_effects`) VALUES
('ESTELLA_ultimate', 0, 1.8, 0, 0, '["g4j5v8z"]');

-- skill_anomaly
INSERT INTO `skill_anomaly` (`skill_id`, `anomaly_index`, `group_index`, `type`, `stacks`, `duration`, `offset`, `delay`) VALUES
('ESTELLA_ultimate', 0, 0, 'knockup', 1, 0, 1.8, 0);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('ESTELLA_normal', 1.5, NULL, NULL, NULL, NULL, '["armor_break","break","ice_shatter","stagger","knockdown","knockup","blaze_burst","burning","blaze_attach","nature_attach","corrosion","nature_burst","cold_attach","frozen","cold_burst","emag_attach","conductive","emag_burst"]', NULL, NULL, 1.5);

-- attack_segment
INSERT INTO `attack_segment` (`character_id`, `segment_index`, `duration`, `gauge_gain`, `allowed_types`) VALUES
('ESTELLA', 0, 0.467, 0, '["corrosion","nature_attach","nature_burst","burning","blaze_attach","blaze_burst","conductive","emag_attach","emag_burst","cold_attach","frozen","cold_burst","knockdown","break","ice_shatter","knockup","stagger","armor_break"]'),
('ESTELLA', 1, 0.567, 0, '["corrosion","nature_attach","nature_burst","burning","blaze_attach","blaze_burst","conductive","emag_attach","emag_burst","cold_attach","frozen","cold_burst","knockdown","break","ice_shatter","knockup","stagger","armor_break"]'),
('ESTELLA', 2, 0.967, 0, '["corrosion","nature_attach","nature_burst","burning","blaze_attach","blaze_burst","conductive","emag_attach","emag_burst","cold_attach","frozen","cold_burst","knockdown","break","ice_shatter","knockup","stagger","armor_break"]'),
('ESTELLA', 3, 1.567, 0, '["corrosion","nature_attach","nature_burst","burning","blaze_attach","blaze_burst","conductive","emag_attach","emag_burst","cold_attach","frozen","cold_burst","knockdown","break","ice_shatter","knockup","stagger","armor_break"]'),
('ESTELLA', 4, 0, 0, '["corrosion","nature_attach","nature_burst","burning","blaze_attach","blaze_burst","conductive","emag_attach","emag_burst","cold_attach","frozen","cold_burst","knockdown","break","ice_shatter","knockup","stagger","armor_break"]');

-- attack_segment_tick
INSERT INTO `attack_segment_tick` (`character_id`, `segment_index`, `tick_index`, `offset`, `stagger`, `sp`) VALUES
('ESTELLA', 0, 0, 0.2, 0, 0),
('ESTELLA', 1, 0, 0.2, 0, 0),
('ESTELLA', 2, 0, 0.23, 0, 0),
('ESTELLA', 2, 1, 0.6, 0, 0),
('ESTELLA', 3, 0, 0.7, 17, 19);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('AKEKURI_skill', 1.33, 100, 6.5, 6.5, NULL, '["blaze_attach","burning","blaze_burst"]', NULL, NULL, 1.33);

-- skill_damage_tick
INSERT INTO `skill_damage_tick` (`skill_id`, `tick_index`, `offset`, `stagger`, `sp`, `bound_effects`) VALUES
('AKEKURI_skill', 0, 0.67, 10, 0, '["s5610of"]');

-- skill_anomaly
INSERT INTO `skill_anomaly` (`skill_id`, `anomaly_index`, `group_index`, `type`, `stacks`, `duration`, `offset`, `delay`) VALUES
('AKEKURI_skill', 0, 0, 'blaze_attach', 1, 0, 0.67, 0);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('AKEKURI_chain', 1.27, NULL, 10, NULL, 15, NULL, NULL, NULL, 1.27);

-- skill_damage_tick
INSERT INTO `skill_damage_tick` (`skill_id`, `tick_index`, `offset`, `stagger`, `sp`, `bound_effects`) VALUES
('AKEKURI_chain', 0, 0.73, 5, 7.5, NULL),
('AKEKURI_chain', 1, 1.03, 5, 7.5, NULL);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('AKEKURI_ultimate', 4.3, NULL, NULL, NULL, NULL, '["combo"]', 108, 0, 4.3);

-- skill_anomaly
INSERT INTO `skill_anomaly` (`skill_id`, `anomaly_index`, `group_index`, `type`, `stacks`, `duration`, `offset`, `delay`) VALUES
('AKEKURI_ultimate', 0, 0, 'combo', 1, 20, 0.03, 0);

-- skill_action
INSERT INTO `skill_action` (`skill_id`, `duration`, `sp_cost`, `gauge_gain`, `team_gauge_gain`, `cooldown`, `allowed_types`, `ultimate_gauge_max`, `ultimate_gauge_reply`, `cast_time`) VALUES
('AKEKURI_normal', 1.5, NULL, NULL, NULL, NULL, '["ice_shatter","corrosion","nature_attach","nature_burst","burning","blaze_attach","blaze_burst","conductive","emag_attach","emag_burst","cold_attach","frozen","cold_burst","knockdown","break","knockup","stagger","armor_break"]', NULL, NULL, 1.5);

-- attack_segment
INSERT INTO `attack_segment` (`character_id`, `segment_index`, `duration`, `gauge_gain`, `allowed_types`) VALUES
('AKEKURI', 0, 0.5, 0, '["corrosion","nature_attach","nature_burst","burning","blaze_attach","blaze_burst","conductive","emag_attach","emag_burst","cold_attach","frozen","cold_burst","ice_shatter","knockdown","break","knockup","stagger","armor_break"]'),
('AKEKURI', 1, 0.767, 0, '["corrosion","nature_attach","nature_burst","burning","blaze_attach","blaze_burst","conductive","emag_attach","emag_burst","cold_attach","frozen","cold_burst","ice_shatter","knockdown","break","knockup","stagger","armor_break"]'),
('AKEKURI', 2, 0.733, 0, '["corrosion","nature_attach","nature_burst","burning","blaze_attach","blaze_burst","conductive","emag_attach","emag_burst","cold_attach","frozen","cold_burst","ice_shatter","knockdown","break","knockup","stagger","armor_break"]'),
('AKEKURI', 3, 1.2, 0, '["corrosion","nature_attach","nature_burst","burning","blaze_attach","blaze_burst","conductive","emag_attach","emag_burst","cold_attach","frozen","cold_burst","ice_shatter","knockdown","break","knockup","stagger","armor_break"]'),
('AKEKURI', 4, 0, 0, '["corrosion","nature_attach","nature_burst","burning","blaze_attach","blaze_burst","conductive","emag_attach","emag_burst","cold_attach","frozen","cold_burst","ice_shatter","knockdown","break","knockup","stagger","armor_break"]');

-- attack_segment_tick
INSERT INTO `attack_segment_tick` (`character_id`, `segment_index`, `tick_index`, `offset`, `stagger`, `sp`) VALUES
('AKEKURI', 0, 0, 0.3, 0, 0),
('AKEKURI', 1, 0, 0.27, 0, 0),
('AKEKURI', 1, 1, 0.53, 0, 0),
('AKEKURI', 2, 0, 0.33, 0, 0),
('AKEKURI', 3, 0, 0.63, 0, 0),
('AKEKURI', 3, 1, 0.67, 0, 0),
('AKEKURI', 3, 2, 0.7, 17, 19);
