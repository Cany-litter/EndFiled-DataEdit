#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
终末地数据编辑器 - 全量数据导入脚本
==============================
导入来源:
  1. data/mapped/*.json         - 结构化映射数据(角色/武器/装备/增益/敌人/修饰符模板)
  2. data/extracted/*.json      - 战斗数据(攻击分段/技能动作)
  3. data/华法琳Wiki/*.txt      - 华法琳Wiki文本数据(角色/武器/装备详情)

用法: python scripts/import_all_data.py
"""

import json
import os
import re
import sys
import glob as glob_mod

import pymysql
from pymysql.cursors import DictCursor

# ===========================================================================
# 数据库配置
# ===========================================================================
DB_CONFIG = {
    "host": "127.0.0.1",
    "port": 3306,
    "user": "root",
    "password": "1234",
    "database": "endfiled",
    "charset": "utf8mb4",
    "cursorclass": DictCursor,
}

# ===========================================================================
# 路径配置
# ===========================================================================
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")

WIKI_CHAR_DIR = os.path.join(DATA_DIR, "华法琳Wiki", "角色")
WIKI_WEAPON_DIR = os.path.join(DATA_DIR, "华法琳Wiki", "武器")
WIKI_EQUIP_DIR = os.path.join(DATA_DIR, "华法琳Wiki", "装备", "这个是终末地数据库里的")
WIKI_ENEMY_DIR = os.path.join(DATA_DIR, "华法琳Wiki", "敌人")
EXTRACTED_DIR = os.path.join(DATA_DIR, "extracted")
MAPPED_DIR = os.path.join(DATA_DIR, "mapped")


# ===========================================================================
# 工具函数
# ===========================================================================
def connect():
    return pymysql.connect(**DB_CONFIG)


def parse_num(text):
    """解析数字, 支持 1.6k -> 1600 等格式"""
    text = str(text).strip().replace(",", "").replace(" ", "")
    if not text:
        return None
    if text.endswith("k"):
        return int(float(text[:-1]) * 1000)
    if text.endswith("w"):
        return int(float(text[:-1]) * 10000)
    try:
        return int(text)
    except ValueError:
        try:
            return int(float(text))
        except ValueError:
            return None


def parse_decimal(text):
    """解析带%的数值"""
    text = str(text).strip()
    if not text:
        return None
    try:
        return float(text.replace("%", ""))
    except ValueError:
        return None


def clean_text(text):
    """清理文本中的多余空白"""
    return re.sub(r'\s+', ' ', text).strip()


# ===========================================================================
# 第一部分: 从 mapped/*.json 导入基础数据
# ===========================================================================
def import_modifier_defs(conn):
    """导入修饰符定义 data/mapped/modifier-defs.json"""
    path = os.path.join(MAPPED_DIR, "modifier-defs.json")
    if not os.path.exists(path):
        print("[跳过] modifier-defs.json 不存在")
        return
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    cursor = conn.cursor()
    inserted = 0
    for item in data:
        cursor.execute(
            "INSERT IGNORE INTO modifier_def (id, label, unit) VALUES (%s, %s, %s)",
            (item["id"], item["label"], item["unit"]),
        )
        inserted += cursor.rowcount
    conn.commit()
    print(f"[OK] modifier_def: 新增 {inserted} 条")


def import_weapon_modifier_templates(conn):
    """导入武器词条模板 data/mapped/weapon-modifier-templates.json"""
    path = os.path.join(MAPPED_DIR, "weapon-modifier-templates.json")
    if not os.path.exists(path):
        print("[跳过] weapon-modifier-templates.json 不存在")
        return
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    cursor = conn.cursor()
    inserted = 0
    for item in data:
        cursor.execute(
            "INSERT IGNORE INTO weapon_modifier_template (modifier_id, size, level, value) VALUES (%s, %s, %s, %s)",
            (item["modifierId"], item["size"], item["level"], item["value"]),
        )
        inserted += cursor.rowcount
    conn.commit()
    print(f"[OK] weapon_modifier_template: 新增 {inserted} 条")


def import_equipment_adapter_templates(conn):
    """导入装备适配槽模板 data/mapped/equipment-adapter-templates.json"""
    path = os.path.join(MAPPED_DIR, "equipment-adapter-templates.json")
    if not os.path.exists(path):
        print("[跳过] equipment-adapter-templates.json 不存在")
        return
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    cursor = conn.cursor()
    inserted = 0
    for item in data:
        cursor.execute(
            "INSERT IGNORE INTO equipment_adapter_template (modifier_id, slot, config, refine, value) VALUES (%s, %s, %s, %s, %s)",
            (item["modifierId"], item["slot"], item["config"], item["refine"], item["value"]),
        )
        inserted += cursor.rowcount
    conn.commit()
    print(f"[OK] equipment_adapter_template: 新增 {inserted} 条")


def import_enemies(conn):
    """导入敌人数据 data/mapped/enemies.json"""
    path = os.path.join(MAPPED_DIR, "enemies.json")
    if not os.path.exists(path):
        print("[跳过] enemies.json 不存在")
        return
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    cursor = conn.cursor()
    inserted = 0
    for item in data:
        cursor.execute(
            """INSERT IGNORE INTO enemy (id, name, category, tier, max_stagger, stagger_node_count,
               stagger_node_duration, stagger_break_duration, execution_recovery)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)""",
            (
                item["id"],
                item["name"],
                item.get("category"),
                item.get("tier"),
                item.get("max_stagger", 0),
                item.get("stagger_node_count", 1),
                item.get("stagger_node_duration"),
                item.get("stagger_break_duration"),
                item.get("execution_recovery"),
            ),
        )
        inserted += cursor.rowcount
    conn.commit()
    print(f"[OK] enemy: 新增 {inserted} 条")


def import_gains(conn):
    """导入增益效果 data/mapped/gains.json"""
    path = os.path.join(MAPPED_DIR, "gains.json")
    if not os.path.exists(path):
        print("[跳过] gains.json 不存在")
        return
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    cursor = conn.cursor()
    inserted = 0
    for item in data:
        cursor.execute(
            """INSERT IGNORE INTO gain (id, name, source, gain_type, effect_category, effect_type,
               effect_value, value_type, stack_rule, target_scope, target_char_id,
               trigger_condition, duration, max_stacks, source_type, source_ref_id)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
            (
                item["id"],
                item["name"],
                item.get("source", ""),
                item.get("gainType", "permanent"),
                item.get("effectCategory", ""),
                item.get("effectType", ""),
                item.get("effectValue", 0),
                item.get("valueType", "percentage"),
                item.get("stackRule", "add_same"),
                item.get("targetScope", "self"),
                item.get("targetCharId"),
                item.get("triggerCondition"),
                item.get("duration"),
                item.get("maxStacks", 1),
                item.get("sourceType"),
                item.get("sourceRefId"),
            ),
        )
        inserted += cursor.rowcount
    conn.commit()
    print(f"[OK] gain: 新增 {inserted} 条")


def import_characters_from_mapped(conn):
    """导入角色基础数据 data/mapped/characters.json"""
    path = os.path.join(MAPPED_DIR, "characters.json")
    if not os.path.exists(path):
        print("[跳过] characters.json 不存在")
        return
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)

    # 只导入 base entry (不包含 _ 后缀的)
    base_entries = [item for item in data if "_" not in item.get("id", "")]
    cursor = conn.cursor()
    inserted = 0
    updated = 0

    # ID 映射: mapped ID -> Wiki ID (用于后续关联)
    id_map = {}

    for item in base_entries:
        char_id = item["id"]
        name = item.get("name", "")
        rarity = item.get("rarity", 4)
        element_map = {
            "pyro": "灼热", "cryo": "寒冷", "electro": "电磁",
            "natural": "自然", "physical": "物理", "wind": "风", "light": "光"
        }

        element = item.get("charType", "physical")
        element_cn = element_map.get(element.lower(), element)

        profession_map = {
            "assault": "突击", "guard": "近卫", "caster": "术师",
            "heavy": "重装", "vanguard": "先锋", "support": "辅助", "healer": "医疗"
        }
        profession = item.get("profession", "")
        profession_cn = profession_map.get(profession.lower(), profession)

        weapon_type = item.get("weaponType", "")
        main_attr = item.get("mainAttrType", "")
        sub_attr = item.get("subAttrType", "")

        # 从 growth 获取 1 级属性
        growth = item.get("growth", {})
        stats = growth if isinstance(growth, dict) else {}

        battle_tags = item.get("charBattleTag", None)

        try:
            result = cursor.execute(
                """INSERT INTO `character` (id, name, rarity, element, profession, weapon_type,
                   main_attr, sub_attr, char_battle_tags)
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                   ON DUPLICATE KEY UPDATE
                   name = VALUES(name), rarity = VALUES(rarity), element = VALUES(element),
                   profession = VALUES(profession), weapon_type = VALUES(weapon_type),
                   main_attr = VALUES(main_attr), sub_attr = VALUES(sub_attr),
                   char_battle_tags = VALUES(char_battle_tags)""",
                (char_id, name, rarity, element_cn, profession_cn, weapon_type,
                 main_attr, sub_attr,
                 json.dumps(battle_tags, ensure_ascii=False) if battle_tags else None),
            )
            if result == 1:
                inserted += 1
            else:
                updated += 1
        except pymysql.err.IntegrityError:
            pass

        id_map[char_id] = name

    conn.commit()
    print(f"[OK] character: 新增 {inserted} 条, 更新 {updated} 条")


def import_weapons_from_mapped(conn):
    """导入武器基础数据 data/mapped/weapons.json"""
    path = os.path.join(MAPPED_DIR, "weapons.json")
    if not os.path.exists(path):
        print("[跳过] weapons.json 不存在")
        return
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    cursor = conn.cursor()
    inserted = 0
    updated = 0
    for item in data:
        cursor.execute(
            """INSERT INTO weapon (id, name, rarity, type, base_atk)
               VALUES (%s, %s, %s, %s, %s)
               ON DUPLICATE KEY UPDATE name=VALUES(name), rarity=VALUES(rarity),
               type=VALUES(type)""",
            (item["id"], item.get("name", ""), item.get("rarity", 4),
             item.get("weaponType", ""), item.get("baseAtk", [0])[0] if isinstance(item.get("baseAtk"), list) else item.get("baseAtk", 0)),
        )
        if cursor.rowcount == 1:
            inserted += 1
        else:
            updated += 1
    conn.commit()
    print(f"[OK] weapon: 新增 {inserted} 条, 更新 {updated} 条")


def import_equips_from_mapped(conn):
    """导入装备套组数据 data/mapped/equips.json"""
    path = os.path.join(MAPPED_DIR, "equips.json")
    if not os.path.exists(path):
        print("[跳过] equips.json 不存在")
        return
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    cursor = conn.cursor()
    set_inserted = 0
    equip_inserted = 0
    for item in data:
        suit_id = item.get("suitID", "")
        set_name = item.get("套组名称", "")
        set_desc = item.get("技能描述", "")

        # 插入套组
        if suit_id:
            cursor.execute(
                "INSERT IGNORE INTO equipment_set (id, name, set_effect_desc) VALUES (%s, %s, %s)",
                (suit_id, set_name, set_desc),
            )
            set_inserted += cursor.rowcount

        # 插入装备部件
        for eq in item.get("items", []):
            eq_id = eq.get("id", "")
            eq_name = eq.get("name", "")
            slot = eq.get("部位", "")
            slot_map = {"护甲": "armor", "护手": "glove", "配件": "accessory"}
            slot_en = slot_map.get(slot, slot)

            main_stat = eq.get("主词条", {})
            base_def = parse_num(main_stat.get("value", 0)) if main_stat.get("desc") == "防御力" else 0

            sub_stats = eq.get("副词条", [])
            attr1_type = sub_stats[0].get("desc", "") if len(sub_stats) > 0 else ""
            attr1_values = sub_stats[0].get("value", []) if len(sub_stats) > 0 else []
            attr2_type = sub_stats[1].get("desc", "") if len(sub_stats) > 1 else ""
            attr2_values = sub_stats[1].get("value", []) if len(sub_stats) > 1 else []
            attr3_type = sub_stats[2].get("desc", "") if len(sub_stats) > 2 else ""
            attr3_values = sub_stats[2].get("value", []) if len(sub_stats) > 2 else []

            cursor.execute(
                """INSERT IGNORE INTO equipment (id, name, slot, base_def, set_name,
                   attr1_type, attr1_value, attr1_v1, attr1_v2, attr1_v3,
                   attr2_type, attr2_value, attr2_v1, attr2_v2, attr2_v3,
                   attr3_type, attr3_value, attr3_v1, attr3_v2, attr3_v3)
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
                (
                    eq_id, eq_name, slot_en, base_def, set_name,
                    attr1_type,
                    float(attr1_values[0]) if len(attr1_values) > 0 else None,
                    float(attr1_values[1]) if len(attr1_values) > 1 else None,
                    float(attr1_values[2]) if len(attr1_values) > 2 else None,
                    float(attr1_values[3]) if len(attr1_values) > 3 else None,
                    attr2_type,
                    float(attr2_values[0]) if len(attr2_values) > 0 else None,
                    float(attr2_values[1]) if len(attr2_values) > 1 else None,
                    float(attr2_values[2]) if len(attr2_values) > 2 else None,
                    float(attr2_values[3]) if len(attr2_values) > 3 else None,
                    attr3_type,
                    float(attr3_values[0]) if len(attr3_values) > 0 else None,
                    float(attr3_values[1]) if len(attr3_values) > 1 else None,
                    float(attr3_values[2]) if len(attr3_values) > 2 else None,
                    float(attr3_values[3]) if len(attr3_values) > 3 else None,
                ),
            )
            equip_inserted += cursor.rowcount

    conn.commit()
    print(f"[OK] equipment_set: 新增 {set_inserted} 条")
    print(f"[OK] equipment: 新增 {equip_inserted} 条")


# ===========================================================================
# 第二部分: 从 extracted/*.json 导入战斗数据
# ===========================================================================
def import_attack_segments(conn):
    """导入攻击分段数据 data/extracted/attack_segments.json"""
    path = os.path.join(EXTRACTED_DIR, "attack_segments.json")
    if not os.path.exists(path):
        print("[跳过] attack_segments.json 不存在")
        return
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    cursor = conn.cursor()
    seg_inserted = 0
    tick_inserted = 0
    for char_id, char_data in data.items():
        char_name = char_data.get("character_name", "")
        for seg in char_data.get("segments", []):
            seg_idx = seg["segment_index"]
            try:
                cursor.execute(
                    """INSERT IGNORE INTO attack_segment (character_id, segment_index, duration, gauge_gain, allowed_types)
                       VALUES (%s, %s, %s, %s, %s)""",
                    (
                        char_id,
                        seg_idx,
                        seg.get("duration", 0),
                        seg.get("gauge_gain", 0),
                        json.dumps(seg.get("allowed_types", []), ensure_ascii=False),
                    ),
                )
                seg_inserted += cursor.rowcount
            except pymysql.err.IntegrityError:
                pass

            for ti, tick in enumerate(seg.get("damage_ticks", [])):
                try:
                    cursor.execute(
                        """INSERT IGNORE INTO attack_segment_tick (character_id, segment_index, tick_index, offset, stagger, sp)
                           VALUES (%s, %s, %s, %s, %s, %s)""",
                        (char_id, seg_idx, ti, tick.get("offset", 0),
                         tick.get("stagger", 0), tick.get("sp", 0)),
                    )
                    tick_inserted += cursor.rowcount
                except pymysql.err.IntegrityError:
                    pass
    conn.commit()
    print(f"[OK] attack_segment: 新增 {seg_inserted} 条")
    print(f"[OK] attack_segment_tick: 新增 {tick_inserted} 条")


def import_skill_actions(conn):
    """导入技能动作数据 data/extracted/skill_actions.json"""
    path = os.path.join(EXTRACTED_DIR, "skill_actions.json")
    if not os.path.exists(path):
        print("[跳过] skill_actions.json 不存在")
        return
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    cursor = conn.cursor()

    action_inserted = 0
    tick_inserted = 0
    anomaly_inserted = 0

    for skill_id, skill_data in data.items():
        char_id = skill_data.get("character_id", "")
        skill_type = skill_data.get("skill_type", "")
        skill_type_label = skill_data.get("skill_type_label", "")

        # 确定skill类型映射
        type_map = {
            "normal": "normal", "skill": "skill", "chain": "chain",
            "ultimate": "ultimate", "execution": "other",
            "variant_0": "other", "variant_1": "other", "variant_2": "other",
            "variant_3": "other", "variant_4": "other", "variant_5": "other", "variant_6": "other",
        }
        mapped_type = type_map.get(skill_type, "other")

        # 先确保 skill 表有记录
        cursor.execute(
            "INSERT IGNORE INTO skill (id, character_id, name, type, damage_type) VALUES (%s, %s, %s, %s, %s)",
            (skill_id, char_id, skill_type_label or skill_type, mapped_type, "other"),
        )

        # 插入 skill_action
        allowed_types = skill_data.get("allowed_types", [])
        cursor.execute(
            """INSERT IGNORE INTO skill_action (skill_id, duration, cast_time, sp_cost,
               gauge_gain, team_gauge_gain, cooldown,
               allowed_types, ultimate_gauge_max, ultimate_gauge_reply)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
            (
                skill_id,
                skill_data.get("duration"),
                skill_data.get("cast_time"),
                skill_data.get("sp_cost"),
                skill_data.get("gauge_gain"),
                skill_data.get("team_gauge_gain"),
                skill_data.get("cooldown"),
                json.dumps(allowed_types, ensure_ascii=False) if allowed_types else None,
                skill_data.get("ultimate_gauge_max"),
                skill_data.get("ultimate_gauge_reply"),
            ),
        )
        action_inserted += cursor.rowcount

        # 导入 damage_ticks
        for ti, tick in enumerate(skill_data.get("damage_ticks", [])):
            try:
                cursor.execute(
                    """INSERT IGNORE INTO skill_damage_tick (skill_id, tick_index, offset, stagger, sp)
                       VALUES (%s, %s, %s, %s, %s)""",
                    (skill_id, ti, tick.get("offset", 0),
                     tick.get("stagger", 0), tick.get("sp", 0)),
                )
                tick_inserted += cursor.rowcount
            except pymysql.err.IntegrityError:
                pass

        # 导入 anomalies
        for gi, anom_group in enumerate(skill_data.get("anomalies", [])):
            for ti, anom in enumerate(anom_group.get("types", [])):
                anom_id = f"{skill_id}_{gi}_{ti}"
                cursor.execute(
                    """INSERT IGNORE INTO skill_anomaly (skill_id, anomaly_index, group_index, type, stacks, duration, offset, delay)
                       VALUES (%s, %s, %s, %s, %s, %s, %s, %s)""",
                    (
                        skill_id,
                        ti,
                        anom_group.get("group_index", gi),
                        anom.get("type", ""),
                        anom.get("stacks", 1),
                        anom.get("duration", 0),
                        anom.get("offset", 0),
                        0,
                    ),
                )
                anomaly_inserted += cursor.rowcount

    conn.commit()
    print(f"[OK] skill_action: 新增 {action_inserted} 条")
    print(f"[OK] skill_damage_tick: 新增 {tick_inserted} 条")
    print(f"[OK] skill_anomaly: 新增 {anomaly_inserted} 条")


# ===========================================================================
# 第三部分: 从华法琳Wiki TXT解析角色数据
# ===========================================================================
def parse_wiki_character_file(filepath):
    """解析单个角色Wiki文本文件, 返回结构化数据"""
    with open(filepath, "r", encoding="utf-8") as f:
        lines = [line.rstrip("\n\r") for line in f.readlines()]

    result = {
        "overview": {},
        "promotions": [],
        "talents": [],
        "potentials": [],
        "skills": [],
        "logistics": [],
        "profile": [],
        "archives": [],
        "voices": [],
        "voice_section": False,
        "archive_section": False,
    }

    filename = os.path.splitext(os.path.basename(filepath))[0]
    result["filename"] = filename

    i = 0
    current_section = None
    voice_lines = []
    archive_parts = []
    current_archive = None

    while i < len(lines):
        line = lines[i]

        # 跳过导航头
        if "华法琳Wiki" in line:
            i += 1
            continue

        # ---- 总览 ----
        if line == "总览":
            current_section = "overview"
            i += 1
            continue

        if current_section == "overview":
            if line == "":
                i += 1
                continue
            if line in ("属性", "干员升级", "天赋", "潜能", "技能", "后勤技能", "立绘", "干员情报", "档案", "语音记录"):
                current_section = {"档案": "archive", "语音记录": "voice"}.get(line, line)
                i += 1
                continue

            # 总览字段: 使用制表符分割, 每两列一组 key\tvalue
            if "\t" in line:
                parts = line.split("\t")
                # 每两列一组: key\tvalue
                for pi in range(0, len(parts) - 1, 2):
                    key = parts[pi].strip()
                    val = parts[pi + 1].strip()
                    if key and val and not key.isdigit():
                        result["overview"][key] = val
                # 如果是奇数个, 多出的那列附加到前一个值
                if len(parts) % 2 == 1 and len(parts) > 1:
                    last_key = parts[-2].strip()
                    result["overview"][last_key] = parts[-1].strip()
            elif "配音演员" in line:
                # 配音演员的下一行开始是具体配音
                pass
            i += 1
            continue

        # ---- 属性 ----
        if line == "属性":
            current_section = "stats"
            i += 1
            continue

        # ---- 干员升级 (Promotion) ----
        if line == "干员升级":
            current_section = "promotion"
            i += 1
            continue

        if current_section == "promotion":
            # 解析 elite stages
            elite_match = re.match(r"精英化·([一二三四])", line)
            if elite_match:
                stage_map = {"一": 1, "二": 2, "三": 3, "四": 4}
                stage = stage_map[elite_match.group(1)]
                promo = {"stage": stage, "description": "", "materials": [], "gold_cost": 0}
                if i + 1 < len(lines):
                    promo["description"] = lines[i + 1]
                # 读取材料直到遇到空行或下一个section
                j = i + 2
                materials = []
                while j < len(lines) and lines[j] != "" and not lines[j].startswith("精英化·") and \
                        lines[j] not in ("天赋", "潜能", "技能", "后勤技能", "立绘", "干员情报", "档案", "语音记录"):
                    text = lines[j].strip()
                    if text:
                        materials.append(text)
                    j += 1
                promo["materials_raw"] = materials
                result["promotions"].append(promo)
                i = j
                continue
            if line in ("天赋", "潜能", "技能", "后勤技能", "立绘", "干员情报", "档案", "语音记录"):
                current_section = {"档案": "archive", "语音记录": "voice"}.get(line, line)
                i += 1
                continue
            i += 1
            continue

        # ---- 天赋 ----
        if line == "天赋":
            current_section = "talent"
            i += 1
            continue

        if current_section == "talent":
            if line in ("潜能", "技能", "后勤技能", "立绘", "干员情报", "档案", "语音记录"):
                current_section = {"档案": "archive", "语音记录": "voice"}.get(line, line)
                i += 1
                continue
            # 天赋块: 天赋名 + 解锁条件 + 效果
            if line and not line.startswith("天赋") and not line.startswith("突破"):
                # 收集天赋块(可能多行)
                talent_name = line
                talent_desc_lines = []
                j = i + 1
                while j < len(lines) and lines[j] != "" and \
                        lines[j] not in ("潜能", "技能", "后勤技能", "立绘", "干员情报", "档案", "语音记录"):
                    if not lines[j].startswith("突破") and not lines[j].startswith("天赋"):
                        talent_desc_lines.append(lines[j])
                    j += 1
                if talent_desc_lines:
                    result["talents"].append({
                        "name": talent_name,
                        "description": " ".join(talent_desc_lines),
                    })
            i += 1
            continue

        # ---- 潜能 ----
        if line == "潜能":
            current_section = "potential"
            i += 1
            continue

        if current_section == "potential":
            if line in ("技能", "后勤技能", "立绘", "干员情报", "档案", "语音记录"):
                current_section = {"档案": "archive", "语音记录": "voice"}.get(line, line)
                i += 1
                continue
            # 潜能编号
            pot_match = re.match(r"(\d+)", line.strip())
            if pot_match:
                pot_idx = int(pot_match.group(1))
                # 下一行是潜能名称, 再下一行开始是效果
                name = lines[i + 1] if i + 1 < len(lines) else ""
                effect_lines = []
                j = i + 2
                while j < len(lines) and lines[j] != "" and \
                        not re.match(r"\d+", lines[j].strip()) and \
                        lines[j] not in ("技能", "后勤技能", "立绘", "干员情报", "档案", "语音记录"):
                    effect_lines.append(lines[j])
                    j += 1
                result["potentials"].append({
                    "index": pot_idx,
                    "name": name.strip(),
                    "effect": " ".join(effect_lines).strip(),
                })
            i += 1
            continue

        # ---- 技能 ----
        if line == "技能":
            current_section = "skill"
            i += 1
            continue

        if current_section == "skill":
            if line in ("后勤技能", "立绘", "干员情报", "档案", "语音记录"):
                current_section = {"档案": "archive", "语音记录": "voice"}.get(line, line)
                i += 1
                continue

            # 普通攻击/战技/连携技/终结技
            skill_type_match = re.match(r"(.+)\n(普通攻击|战技|连携技|终结技)", line)
            # Check multi-line pattern
            skill_name = line.strip()
            if i + 1 < len(lines):
                next_line = lines[i + 1]
                if next_line in ("普通攻击", "战技", "连携技", "终结技"):
                    skill_type_label = next_line
                    desc_lines = []
                    j = i + 2
                    # 跳过空行 收集描述直到数字行(倍率表)
                    while j < len(lines) and lines[j] != "":
                        desc_lines.append(lines[j])
                        j += 1
                    result["skills"].append({
                        "name": skill_name,
                        "type": skill_type_label,
                        "description": " ".join([l for l in desc_lines if not re.match(r"[\dM\t%]+", l)]),
                    })
            i += 1
            continue

        # ---- 后勤技能 ----
        if line == "后勤技能":
            current_section = "logistics"
            i += 1
            continue

        if current_section == "logistics":
            if line in ("立绘", "干员情报", "档案", "语音记录"):
                current_section = {"档案": "archive", "语音记录": "voice"}.get(line, line)
                i += 1
                continue
            # 后勤技能名 + 解锁条件 + 效果
            if line and not line.startswith("后勤"):
                log_name = line
                unlock_line = lines[i + 1] if i + 1 < len(lines) else ""
                effect_line = lines[i + 2] if i + 2 < len(lines) else ""
                if unlock_line.startswith("精英化") or "解锁" in unlock_line or "激活" in unlock_line:
                    result["logistics"].append({
                        "name": log_name,
                        "unlock": unlock_line.strip(),
                        "effect": effect_line.strip() if "进驻" in effect_line else "",
                    })
            i += 1
            continue

        # ---- 干员情报 ----
        if line == "干员情报":
            current_section = "profile"
            i += 1
            continue

        if current_section == "profile":
            if line in ("档案", "语音记录"):
                current_section = "archive" if line == "档案" else "voice"
                i += 1
                continue
            if line.startswith("阵营") or line.startswith("种族") or line.startswith("专长") or line.startswith("爱好"):
                label_text = line
                desc = lines[i + 1] if i + 1 < len(lines) else ""
                result["profile"].append({
                    "type": label_text.split(" ")[0] if " " in label_text else label_text,
                    "label": label_text,
                    "description": desc.strip(),
                })
            i += 1
            continue

        # ---- 档案 ----
        if line == "档案":
            current_section = "archive"
            i += 1
            continue

        if current_section == "archive":
            if line == "语音记录":
                current_section = "voice"
                result["archive_section"] = True
                i += 1
                continue

            # 档案标题
            archive_match = re.match(r"(基础档案|档案资料·[一二三四])", line)
            if archive_match:
                title = archive_match.group(1)
                content_lines = []
                j = i + 1
                while j < len(lines) and \
                        not re.match(r"(基础档案|档案资料·[一二三四]|语音记录)", lines[j]):
                    content_lines.append(lines[j])
                    j += 1
                result["archives"].append({
                    "title": title,
                    "content": "\n".join(content_lines).strip(),
                })
            i += 1
            continue

        # ---- 语音记录 ----
        if line == "语音记录":
            current_section = "voice"
            i += 1
            continue

        if current_section == "voice":
            # 语音分类: 常见有 行动准备, 编入队伍, 交谈, 等
            voice_categories = [
                "行动准备", "编入队伍", "更换武器", "更换装备", "激活天赋阵列",
                "观看作战记录", "精英化晋升", "干员报到", "待命", "进驻设施",
                "打招呼", "帝江号闲聊", "赠送礼物", "接收礼物", "信赖对话",
                "交谈", "话题", "发现资源", "发现未探索区域", "发现强敌",
                "采集矿物", "打开储藏箱", "获得醚质", "消除侵蚀", "休整",
                "使用战术物品", "危险提醒", "负伤", "力竭", "小队激励",
                "回应激励", "作战开始", "作战胜利", "作战失败",
                "重击", "战技", "连携技就绪", "连携技", "处决", "终结技",
            ]
            is_category = any(line.startswith(cat) for cat in voice_categories) or \
                          any(line.strip() == cat for cat in voice_categories)

            if is_category:
                category = line.strip()
                text_lines = []
                j = i + 1
                while j < len(lines) and lines[j] != "" and \
                        not any(lines[j].startswith(cat) for cat in voice_categories) and \
                        lines[j] not in ("EN", "JP", "CN", "KR"):
                    if not lines[j].startswith("目录"):
                        text_lines.append(lines[j])
                    j += 1
                voice_text = "\n".join(text_lines).strip()
                if voice_text:
                    result["voices"].append({
                        "category": category,
                        "text": voice_text,
                    })
            i += 1
            continue

        i += 1

    return result


def get_character_id_by_name(conn, name):
    """根据角色名查找角色ID"""
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM `character` WHERE name = %s", (name,))
    row = cursor.fetchone()
    if row:
        return row["id"]
    # 尝试模糊匹配
    cursor.execute("SELECT id FROM `character` WHERE name LIKE %s", (f"%{name}%",))
    row = cursor.fetchone()
    return row["id"] if row else None


def import_wiki_characters(conn):
    """导入华法琳Wiki角色数据到新表"""
    if not os.path.exists(WIKI_CHAR_DIR):
        print("[跳过] 华法琳Wiki/角色 目录不存在")
        return

    files = [f for f in os.listdir(WIKI_CHAR_DIR) if f.endswith(".txt")]
    print(f"[处理] 共发现 {len(files)} 个角色文件")

    cursor = conn.cursor()
    total_promotions = 0
    total_talents = 0
    total_potentials = 0
    total_logistics = 0
    total_profiles = 0
    total_archives = 0
    total_voices = 0

    for fname in sorted(files):
        filepath = os.path.join(WIKI_CHAR_DIR, fname)
        parsed = parse_wiki_character_file(filepath)
        char_name = parsed["overview"].get("名字", parsed["filename"])
        char_id = get_character_id_by_name(conn, char_name)

        if not char_id:
            # 部分角色名可能不匹配, 尝试文件名的前半部分
            print(f"  [警告] 未找到角色 '{char_name}', 跳过")
            continue

        print(f"  [处理] {char_name} (id={char_id})")

        # ---- 更新角色基本信息 ----
        ov = parsed["overview"]
        update_fields = {}
        if ov.get("英语名字"):
            update_fields["english_name"] = ov["英语名字"]
        if ov.get("简介"):
            update_fields["description"] = ov["简介"]
        if ov.get("特点"):
            update_fields["specialty"] = ov["特点"]

        # 配音演员
        va_text = " ".join([v for k, v in ov.items() if "配音" in k])
        if "日语" in ov:
            update_fields["va_jp"] = ov.get("日语", "")
        if "英语" in ov:
            update_fields["va_en"] = ov.get("英语", "")
        if "中文" in ov:
            update_fields["va_cn"] = ov.get("中文", "")
        if "韩语" in ov:
            update_fields["va_kr"] = ov.get("韩语", "")

        if update_fields:
            set_clause = ", ".join([f"`{k}` = %s" for k in update_fields])
            values = list(update_fields.values())
            values.append(char_id)
            cursor.execute(f"UPDATE `character` SET {set_clause} WHERE id = %s", values)

        # ---- 晋升材料 ----
        for promo in parsed["promotions"]:
            # 解析材料
            raw = promo.get("materials_raw", [])
            mat1_name = raw[0] if len(raw) > 0 else None
            mat1_count = parse_num(raw[1]) if len(raw) > 1 else None
            mat2_name = raw[2] if len(raw) > 2 else None
            mat2_count = parse_num(raw[3]) if len(raw) > 3 else None
            mat3_name = raw[4] if len(raw) > 4 else None
            mat3_count = parse_num(raw[5]) if len(raw) > 5 else None
            gold_cost = None
            for r in raw:
                if "折金票" in str(r) or "k" in str(r):
                    gold_cost = parse_num(r)
                    break

            promo_id = f"{char_id}_promo_{promo['stage']}"
            level_cap = {1: 40, 2: 60, 3: 80, 4: 90}.get(promo["stage"], 40)
            cursor.execute(
                """INSERT IGNORE INTO character_promotion
                   (id, character_id, elite_stage, level_cap,
                    material1_id, material1_count,
                    material2_id, material2_count,
                    material3_id, material3_count, gold_cost)
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
                (promo_id, char_id, promo["stage"], level_cap,
                 mat1_name, mat1_count,
                 mat2_name, mat2_count,
                 mat3_name, mat3_count, gold_cost),
            )
            total_promotions += cursor.rowcount

        # ---- 天赋 ----
        for ti, talent in enumerate(parsed["talents"]):
            talent_id = f"{char_id}_talent_wiki_{ti}"
            cursor.execute(
                """INSERT IGNORE INTO character_talent
                   (id, character_id, name, talent_index, stage, description)
                   VALUES (%s, %s, %s, %s, %s, %s)""",
                (talent_id, char_id, talent["name"], ti + 1, 1, talent["description"]),
            )
            total_talents += cursor.rowcount

        # ---- 潜能 ----
        for pot in parsed["potentials"]:
            pot_id = f"{char_id}_pot_{pot['index']}"
            cursor.execute(
                """INSERT IGNORE INTO character_potential
                   (id, character_id, potential_index, name, effect)
                   VALUES (%s, %s, %s, %s, %s)""",
                (pot_id, char_id, pot["index"], pot["name"], pot["effect"]),
            )
            total_potentials += cursor.rowcount

        # ---- 后勤技能 ----
        for li, log in enumerate(parsed["logistics"]):
            log_id = f"{char_id}_logi_{li}"
            unlock_stage = None
            if "精英化阶段一" in log["unlock"] or "精英化·一" in log["unlock"]:
                unlock_stage = 1
            elif "精英化阶段二" in log["unlock"] or "精英化·二" in log["unlock"]:
                unlock_stage = 2
            elif "精英化阶段三" in log["unlock"] or "精英化·三" in log["unlock"]:
                unlock_stage = 3
            elif "精英化阶段四" in log["unlock"] or "精英化·四" in log["unlock"]:
                unlock_stage = 4
            cursor.execute(
                """INSERT IGNORE INTO character_logistics
                   (id, character_id, name, unlock_stage, description)
                   VALUES (%s, %s, %s, %s, %s)""",
                (log_id, char_id, log["name"], unlock_stage,
                 f"{log['unlock']} {log['effect']}".strip()),
            )
            total_logistics += cursor.rowcount

        # ---- 干员情报 ----
        for prof in parsed["profile"]:
            prof_id = f"{char_id}_prof_{prof['type']}"
            cursor.execute(
                """INSERT IGNORE INTO character_profile
                   (id, character_id, profile_type, label, description)
                   VALUES (%s, %s, %s, %s, %s)""",
                (prof_id, char_id, prof["type"], prof["label"], prof["description"]),
            )
            total_profiles += cursor.rowcount

        # ---- 档案 ----
        for ai, archive in enumerate(parsed["archives"]):
            archive_id = f"{char_id}_archive_{ai}"
            cursor.execute(
                """INSERT IGNORE INTO character_archive
                   (id, character_id, archive_index, title, content)
                   VALUES (%s, %s, %s, %s, %s)""",
                (archive_id, char_id, ai, archive["title"], archive["content"]),
            )
            total_archives += cursor.rowcount

        # ---- 语音记录 ----
        for vi, voice in enumerate(parsed["voices"]):
            voice_id = f"{char_id}_voice_{vi}"
            cursor.execute(
                """INSERT IGNORE INTO character_voice
                   (id, character_id, category, language, text)
                   VALUES (%s, %s, %s, %s, %s)""",
                (voice_id, char_id, voice["category"], "CN", voice["text"]),
            )
            total_voices += cursor.rowcount

    conn.commit()
    print(f"[OK] character_promotion: 新增 {total_promotions} 条")
    print(f"[OK] character_talent(Wiki): 新增 {total_talents} 条")
    print(f"[OK] character_potential: 新增 {total_potentials} 条")
    print(f"[OK] character_logistics: 新增 {total_logistics} 条")
    print(f"[OK] character_profile: 新增 {total_profiles} 条")
    print(f"[OK] character_archive: 新增 {total_archives} 条")
    print(f"[OK] character_voice: 新增 {total_voices} 条")


# ===========================================================================
# 第四部分: 从华法琳Wiki TXT解析武器数据
# ===========================================================================
def parse_wiki_weapon_file(filepath):
    """解析单个武器Wiki文本文件"""
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    filename = os.path.splitext(os.path.basename(filepath))[0]
    # 去掉 .txt
    result = {
        "filename": filename,
        "description": "",
        "lore": "",
        "exp_costs": [],
        "gold_costs": [],
        "ascensions": [],
        "skills": [],
    }

    lines = content.split("\n")

    # 提取描述: 星级行后的文本
    in_desc = False
    desc_lines = []
    in_lore = False
    lore_lines = []

    for i, line in enumerate(lines):
        line_s = line.strip()

        # 星级+描述行
        if "★" in line_s and "武器" in line_s:
            in_desc = True
            continue

        # 属性 section
        if line_s == "属性":
            in_desc = False
            continue
        if line_s == "描述":
            in_lore = True
            in_desc = False
            continue

        if in_desc and line_s:
            desc_lines.append(line_s)
        if in_lore and line_s and line_s not in ("描述",):
            lore_lines.append(line_s)

    if desc_lines:
        result["description"] = desc_lines[0] if desc_lines else ""
    if lore_lines:
        result["lore"] = "\n".join(lore_lines)

    # 解析经验消耗
    exp_section = re.search(r"经验消耗\s*\n([\d\t, \.k]+)", content)
    if exp_section:
        nums = re.findall(r"[\d]+(?:,\d+)*(?:\.\d+)?k?", exp_section.group(1))
        result["exp_costs"] = [parse_num(n) or 0 for n in nums]

    # 解析折金票消耗
    gold_section = re.search(r"折金票消耗\s*\n([\d\t, \.k]+)", content)
    if gold_section:
        nums = re.findall(r"[\d]+(?:,\d+)*(?:\.\d+)?k?", gold_section.group(1))
        result["gold_costs"] = [parse_num(n) or 0 for n in nums]

    # 解析升阶
    asc_section = re.findall(
        r"(\d+)\s+(\d+)\s*\n(.*?)(?=\d+\s+\d+\s*\n|\s*技能\s*\n|$)",
        content, re.DOTALL
    )
    for match in re.finditer(
            r"(\d+)\t(\d+)\t*(.*?)(?=\d+\t\d+\t|\n技能\s*\n|\Z)",
            content, re.DOTALL
    ):
        phase = int(match.group(1))
        level_req = int(match.group(2))
        rest = match.group(3).strip()
        materials = re.findall(r"(\D+?)(\d+\.?\d*k?|\d+)", rest)
        mat_list = [f"{m[0]}{m[1]}" for m in materials[:6]]

        result["ascensions"].append({
            "phase": phase,
            "level_required": level_req,
            "materials": mat_list,
        })

    # 从升阶部分提取技能名
    skill_section = re.findall(r"([\u4e00-\u9fff]+·[\u4e00-\u9fff]+)\s*:\s*(\d+)/(\d+)", content)
    seen_skills = set()
    for skill_name, cur, mx in skill_section:
        if skill_name not in seen_skills:
            seen_skills.add(skill_name)
            result["skills"].append({
                "name": skill_name,
                "rank_current": int(cur),
                "rank_max": int(mx),
            })

    # 技能Rank数值表
    rank_table = re.search(r"Rank\t(.+)\n([\s\S]+?)(?=\n\n|\Z)", content)
    if rank_table:
        header = rank_table.group(1).strip()
        skill_names = [s.strip() for s in header.split("\t") if s.strip()]
        rows_text = rank_table.group(2).strip()
        for row_line in rows_text.split("\n"):
            row_line = row_line.strip()
            if not row_line:
                continue
            parts = re.split(r"\t+", row_line)
            if len(parts) >= 2:
                rank = parts[0].strip()
                values = parts[1:]
                for si, sk_name in enumerate(skill_names):
                    if si < len(values):
                        result["skills"].append({
                            "name": sk_name,
                            "rank_level": rank,
                            "value_desc": values[si].strip(),
                        })

    return result


def get_weapon_id_by_name(conn, name):
    """根据武器名查找武器ID"""
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM weapon WHERE name = %s", (name,))
    row = cursor.fetchone()
    if row:
        return row["id"]
    # 模糊匹配
    cursor.execute("SELECT id FROM weapon WHERE name LIKE %s", (f"%{name}%",))
    row = cursor.fetchone()
    return row["id"] if row else None


def import_wiki_weapons(conn):
    """导入华法琳Wiki武器数据"""
    if not os.path.exists(WIKI_WEAPON_DIR):
        print("[跳过] 华法琳Wiki/武器 目录不存在")
        return

    files = [f for f in os.listdir(WIKI_WEAPON_DIR) if f.endswith(".txt")]
    print(f"[处理] 共发现 {len(files)} 个武器文件")

    cursor = conn.cursor()
    total_ascensions = 0
    total_skills = 0
    total_skill_ranks = 0
    total_costs = 0

    for fname in sorted(files):
        filepath = os.path.join(WIKI_WEAPON_DIR, fname)
        parsed = parse_wiki_weapon_file(filepath)
        wpn_name = parsed["filename"]
        wpn_id = get_weapon_id_by_name(conn, wpn_name)

        if not wpn_id:
            print(f"  [警告] 未找到武器 '{wpn_name}', 跳过")
            continue

        print(f"  [处理] {wpn_name} (id={wpn_id})")

        # ---- 更新描述 ----
        if parsed.get("description") or parsed.get("lore"):
            cursor.execute(
                "UPDATE weapon SET description = %s, lore = %s WHERE id = %s",
                (parsed.get("description", ""), parsed.get("lore", ""), wpn_id),
            )

        # ---- 等级消耗 ----
        for lv in range(1, min(len(parsed["exp_costs"]), 90) + 1):
            exp_cost = parsed["exp_costs"][lv - 1] if lv - 1 < len(parsed["exp_costs"]) else None
            gold_cost = parsed["gold_costs"][lv - 1] if lv - 1 < len(parsed["gold_costs"]) else None
            if exp_cost is not None or gold_cost is not None:
                cursor.execute(
                    "INSERT IGNORE INTO weapon_level_cost (weapon_id, level, exp_cost, gold_cost) VALUES (%s, %s, %s, %s)",
                    (wpn_id, lv, exp_cost, gold_cost),
                )
                total_costs += cursor.rowcount

        # ---- 升阶 ----
        for asc in parsed["ascensions"]:
            asc_id = f"{wpn_id}_asc_{asc['phase']}"
            mat1 = asc["materials"][0] if len(asc["materials"]) > 0 else None
            mat2 = asc["materials"][1] if len(asc["materials"]) > 1 else None
            mat3 = asc["materials"][2] if len(asc["materials"]) > 2 else None
            cursor.execute(
                """INSERT IGNORE INTO weapon_ascension
                   (id, weapon_id, phase, level_required, material1_id, material2_id, material3_id)
                   VALUES (%s, %s, %s, %s, %s, %s, %s)""",
                (asc_id, wpn_id, asc["phase"], asc["level_required"], mat1, mat2, mat3),
            )
            total_ascensions += cursor.rowcount

        # ---- 武器技能 ----
        seen_skill_names = set()
        for skill in parsed["skills"]:
            sk_name = skill.get("name", "")
            if not sk_name:
                continue

            if "rank_level" not in skill:
                # 这是技能定义
                if sk_name not in seen_skill_names:
                    seen_skill_names.add(sk_name)
                    sk_idx = len([s for s in seen_skill_names if s == sk_name])  # use index
                    sk_id = f"{wpn_id}_sk_{sk_name}"
                    cursor.execute(
                        """INSERT IGNORE INTO weapon_skill
                           (id, weapon_id, skill_name, skill_index, rank_current, rank_max)
                           VALUES (%s, %s, %s, %s, %s, %s)""",
                        (sk_id, wpn_id, sk_name, len(seen_skill_names),
                         skill.get("rank_current"), skill.get("rank_max")),
                    )
                    total_skills += cursor.rowcount
            else:
                # 这是Rank数值
                rank_lv = skill.get("rank_level", "")
                try:
                    rl = int(rank_lv)
                except ValueError:
                    continue
                sk_id = f"{wpn_id}_sk_{sk_name}"
                # 先确保技能存在
                cursor.execute(
                    "INSERT IGNORE INTO weapon_skill (id, weapon_id, skill_name, skill_index) VALUES (%s, %s, %s, %s)",
                    (sk_id, wpn_id, sk_name, 0),
                )
                # 插入Rank
                rank_id = f"{sk_id}_rank_{rl}"
                cursor.execute(
                    "INSERT IGNORE INTO weapon_skill_rank (id, weapon_skill_id, rank_level, value_desc) VALUES (%s, %s, %s, %s)",
                    (rank_id, sk_id, rl, skill.get("value_desc", "")),
                )
                total_skill_ranks += cursor.rowcount

    conn.commit()
    print(f"[OK] weapon_level_cost: 新增 {total_costs} 条")
    print(f"[OK] weapon_ascension: 新增 {total_ascensions} 条")
    print(f"[OK] weapon_skill: 新增 {total_skills} 条")
    print(f"[OK] weapon_skill_rank: 新增 {total_skill_ranks} 条")


# ===========================================================================
# 第五部分: 从华法琳Wiki TXT解析装备数据
# ===========================================================================
def import_wiki_equipment(conn):
    """导入华法琳Wiki装备套组数据"""
    if not os.path.exists(WIKI_EQUIP_DIR):
        print("[跳过] 华法琳Wiki/装备 目录不存在")
        return

    files = [f for f in os.listdir(WIKI_EQUIP_DIR) if f.endswith(".txt")]
    print(f"[处理] 共发现 {len(files)} 个装备文件")

    cursor = conn.cursor()
    total_sets = 0

    for fname in sorted(files):
        filepath = os.path.join(WIKI_EQUIP_DIR, fname)
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()

        # 提取套组ID
        suit_match = re.search(r"(suit_\w+)", content)
        set_name = os.path.splitext(fname)[0]
        if suit_match:
            suit_id = suit_match.group(1)
            # 查找套装效果
            effect_match = re.search(r"(\d+)件套组效果：([^\n]+)", content)
            effect_desc = effect_match.group(0) if effect_match else ""

            cursor.execute(
                "INSERT IGNORE INTO equipment_set (id, name, set_effect_desc) VALUES (%s, %s, %s)",
                (suit_id, set_name, effect_desc),
            )
            total_sets += cursor.rowcount

    conn.commit()
    print(f"[OK] equipment_set: 新增 {total_sets} 条(来自Wiki)")


# ===========================================================================
# 第六部分: 导入系统推荐武器(角色总览中)
# ===========================================================================
def import_recommended_weapons(conn):
    """从角色文件解析系统推荐武器"""
    if not os.path.exists(WIKI_CHAR_DIR):
        return

    cursor = conn.cursor()
    total_rec = 0

    for fname in os.listdir(WIKI_CHAR_DIR):
        if not fname.endswith(".txt"):
            continue
        filepath = os.path.join(WIKI_CHAR_DIR, fname)
        parsed = parse_wiki_character_file(filepath)
        char_name = parsed["overview"].get("名字", "")
        char_id = get_character_id_by_name(conn, char_name)
        if not char_id:
            continue

        # 推荐武器在总览 "系统推荐武器" 部分
        # 从原始文本提取更好
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()

        # 查找"系统推荐武器"后的武器名
        rec_section = re.search(r"系统推荐武器\s*\n.*?\n(.+?)(?=\n注：|\Z)", content, re.DOTALL)
        if rec_section:
            weapons_text = rec_section.group(1)
            # 可能有两列: 技能适配 和 属性适配
            parts = re.split(r"技能适配|属性适配", weapons_text)
            for pi, part in enumerate(parts):
                if not part.strip():
                    continue
                rec_type = "attr_adapt" if pi > 0 else "skill_adapt"
                wpn_names = re.findall(r"(\S+)", part.strip())
                for wpn_name in wpn_names:
                    wpn_name = wpn_name.strip()
                    if not wpn_name or wpn_name in ("技能适配", "属性适配", "注：武器推荐由游戏生成，仅供参考展示。"):
                        continue
                    wpn_id = get_weapon_id_by_name(conn, wpn_name)
                    rec_id = f"{char_id}_rec_{wpn_name}"
                    cursor.execute(
                        """INSERT IGNORE INTO character_recommended_weapon
                           (id, character_id, weapon_id, weapon_name, recommend_type)
                           VALUES (%s, %s, %s, %s, %s)""",
                        (rec_id, char_id, wpn_id, wpn_name if not wpn_id else None, rec_type),
                    )
                    total_rec += cursor.rowcount

    conn.commit()
    print(f"[OK] character_recommended_weapon: 新增 {total_rec} 条")


# ===========================================================================
# 第七部分: 从华法琳Wiki TXT解析敌人数据
# ===========================================================================
def import_wiki_enemies(conn):
    """导入华法琳Wiki敌人数据到enemy表(补充字段)和enemy_stat表"""
    if not os.path.exists(WIKI_ENEMY_DIR):
        print("[跳过] 华法琳Wiki/敌人 目录不存在")
        return
    files = [f for f in os.listdir(WIKI_ENEMY_DIR) if f.endswith(".txt")]
    print(f"[处理] 共发现 {len(files)} 个敌人文件")
    cursor = conn.cursor()
    updated = 0
    stat_inserted = 0

    for fname in sorted(files):
        filepath = os.path.join(WIKI_ENEMY_DIR, fname)
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
        lines = [line.rstrip("\n\r") for line in content.split("\n")]

        # 用文件名作为敌人名称
        enemy_name = os.path.splitext(fname)[0]
        # 特殊字符处理: 移除引号
        for c in ['\u201c', '\u201d', '"', "'", '\uff02']:
            enemy_name = enemy_name.replace(c, '')

        # 从现有数据查找 enemy ID (优先精确匹配)
        cursor.execute("SELECT id FROM enemy WHERE name = %s", (enemy_name,))
        row = cursor.fetchone()
        if not row:
            # 模糊匹配: 文件名可能包含-后缀(如"白垩界卫-核心"→"白垩界卫")
            base_name = enemy_name.split("-")[0].split("·")[0] if "-" in enemy_name or "·" in enemy_name else None
            if base_name and base_name != enemy_name:
                cursor.execute("SELECT id FROM enemy WHERE name = %s", (base_name,))
                row = cursor.fetchone()
            if not row:
                # 去引号后匹配(如"聂菲斯，碾骨")
                clean = enemy_name.replace("，", "").replace(",", "")
                if clean != enemy_name:
                    cursor.execute("SELECT id FROM enemy WHERE name = %s", (clean,))
                    row = cursor.fetchone()
            if not row:
                print(f"  [跳过] 未找到敌人 '{enemy_name}'")
                continue
        enemy_id = row["id"]

        # 提取描述: 类别行后的第一段文本
        description = ""
        for i, line in enumerate(lines):
            if line in ("普通敌人", "进阶敌人", "领袖敌人"):
                if i + 1 < len(lines) and lines[i + 1].strip():
                    description = lines[i + 1].strip()
                break

        # 提取各项数值
        stat_block = "\n".join(lines)
        stats = {}

        # 从 key-value 行提取(失衡值/处决攻击增幅/失衡硬直时间/处决恢复技力/暴击率/暴击伤害/攻击距离/重量)
        kv_patterns = [
            (r"失衡值\t([\d.]+)\t处决攻击增幅\t([\d.]+)x?", "max_stagger", "execution_atk_mult"),
            (r"失衡硬直时间\t([\d.]+)s?\t处决恢复技力\t([\d.]+)", "stagger_break_duration", "execution_recovery"),
            (r"暴击率\t([\d.]+)%\t攻击距离\t([\d.]+)m", "crit_rate", "attack_range"),
            (r"暴击伤害\t([\d.]+)%\t重量\t([\d.]+)", "crit_damage", "weight"),
        ]
        for pattern, k1, k2 in kv_patterns:
            m = re.search(pattern, stat_block)
            if m:
                stats[k1] = float(m.group(1))
                stats[k2] = float(m.group(2))

        # 提取抗性(格式: 5个标签后, 10行依次为grade1,pct1,...,grade5,pct5)
        resist_order = ["physical", "burn", "electro", "cold", "nature"]
        for ri, label in enumerate(["物理抗性", "灼热抗性", "电磁抗性", "寒冷抗性", "自然抗性"]):
            for i, line in enumerate(lines):
                if line.strip() == label:
                    # 从"自然抗性"行之后找10个非空行作5组grade+pct
                    if label == "自然抗性":
                        grade_pct_lines = []
                        for j in range(i + 1, min(i + 30, len(lines))):
                            if lines[j].strip() and not lines[j].strip().startswith("%"):
                                grade_pct_lines.append(lines[j].strip())
                            if len(grade_pct_lines) >= 10:
                                break
                        # 5组grade+pct, 按出现顺序对应 resist_order
                        for ri2 in range(5):
                            if ri2 * 2 + 1 < len(grade_pct_lines):
                                grade = grade_pct_lines[ri2 * 2]
                                pct_str = grade_pct_lines[ri2 * 2 + 1].replace("%", "")
                                pct = float(pct_str) if pct_str else 100
                                # 转换: 抗性值 = 100 - 伤害倍率
                                resist_val = 100 - int(pct)
                                stats[f"{resist_order[ri2]}_resist_val"] = resist_val
                    break

        # 提取特性
        traits_match = re.search(r"特性\n([\s\S]+?)$", stat_block)
        traits = traits_match.group(1).strip() if traits_match else None

        # 提取 HP/ATK/DEF 每级详细数据
        full_section = re.search(r"详细\n([\d\t ]+)\n\n生命值\n([\d\t,]+)\n\n攻击力\n([\d\t,]+)\n\n防御力\n([\d\t,]+)", stat_block)

        hp_levels = []
        atk_levels = []
        def_levels = []
        if full_section:
            def parse_num_list(text):
                return [int(v.replace(",", "")) for v in re.split(r"[\t ]+", text.strip()) if v]

            hp_levels = parse_num_list(full_section.group(2))
            atk_levels = parse_num_list(full_section.group(3))
            def_levels = parse_num_list(full_section.group(4))

        # 更新 enemy 表
        cursor.execute(
            """UPDATE enemy SET description=%s, crit_rate=%s, crit_damage=%s,
               attack_range=%s, weight=%s, execution_atk_mult=%s,
               physical_resist=%s, burn_resist=%s, electro_resist=%s,
               cold_resist=%s, nature_resist=%s, traits=%s
               WHERE id=%s""",
            (
                description or None,
                stats.get("crit_rate"),
                stats.get("crit_damage"),
                stats.get("attack_range"),
                int(stats["weight"]) if "weight" in stats else None,
                stats.get("execution_atk_mult"),
                stats.get("physical_resist_val"),
                stats.get("burn_resist_val"),
                stats.get("electro_resist_val"),
                stats.get("cold_resist_val"),
                stats.get("nature_resist_val"),
                traits,
                enemy_id,
            ),
        )
        updated += cursor.rowcount

        # 插入 enemy_stat 每级数据
        min_len = min(len(hp_levels), len(atk_levels), len(def_levels))
        for lv in range(min_len):
            cursor.execute(
                """INSERT IGNORE INTO enemy_stat (enemy_id, level, hp, atk, def) VALUES (%s, %s, %s, %s, %s)""",
                (enemy_id, lv + 1, hp_levels[lv], atk_levels[lv], def_levels[lv]),
            )
            stat_inserted += cursor.rowcount

        if min_len > 0:
            print(f"  [OK] {enemy_name}: {min_len}级数据导入")

    conn.commit()
    print(f"[OK] enemy: 更新 {updated} 条")
    print(f"[OK] enemy_stat: 新增 {stat_inserted} 条")


# ===========================================================================
# 主流程
# ===========================================================================
def main():
    print("=" * 60)
    print("终末地数据编辑器 - 全量数据导入工具")
    print("=" * 60)

    conn = connect()
    print(f"[连接] MySQL {DB_CONFIG['host']}:{DB_CONFIG['port']}/{DB_CONFIG['database']}")

    print("\n--- 第一部分: mapped JSON 基础数据 ---")
    import_modifier_defs(conn)
    import_weapon_modifier_templates(conn)
    import_equipment_adapter_templates(conn)
    import_enemies(conn)
    import_gains(conn)
    import_characters_from_mapped(conn)
    import_weapons_from_mapped(conn)
    import_equips_from_mapped(conn)

    print("\n--- 第二部分: extracted JSON 战斗数据 ---")
    import_attack_segments(conn)
    import_skill_actions(conn)

    print("\n--- 第三部分: 华法琳Wiki 角色数据 ---")
    import_wiki_characters(conn)

    print("\n--- 第四部分: 华法琳Wiki 武器数据 ---")
    import_wiki_weapons(conn)

    print("\n--- 第五部分: 华法琳Wiki 装备数据 ---")
    import_wiki_equipment(conn)

    print("\n--- 第六部分: 系统推荐武器 ---")
    import_recommended_weapons(conn)

    print("\n--- 第七部分: 华法琳Wiki 敌人数据 ---")
    import_wiki_enemies(conn)

    conn.close()
    print("\n" + "=" * 60)
    print("全部导入完成!")
    print("=" * 60)


if __name__ == "__main__":
    main()
