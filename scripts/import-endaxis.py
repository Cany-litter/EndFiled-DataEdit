#!/usr/bin/env python3
"""
Import action data from Endaxis Timeline JSON into MySQL database.

Usage: python scripts/import-endaxis.py
"""

import json
import os
import sys
from decimal import Decimal

import pymysql

# ── Configuration ──
DB_CONFIG = {
    'host': 'localhost',
    'port': 3306,
    'user': 'root',
    'password': '1234',
    'database': 'endfiled',
    'charset': 'utf8mb4',
    'autocommit': False,
}

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)
JSON_PATH = os.path.join(PROJECT_DIR, 'data', 'end-axis', 'Endaxis_Timeline_2026-05-22.json')
FPS = 60

TYPE_MAP = {
    'skill': 'skill',
    'link': 'chain',
    'ultimate': 'ultimate',
    'execution': 'other',
    'attack': None,
}


def frames_to_sec(frames):
    if frames is None:
        return None
    return float(Decimal(str(frames)) / Decimal(str(FPS)))


def element_to_damage_type(element):
    return element if element else 'other'


def main():
    print(f"[INFO] Loading JSON from {JSON_PATH}")
    with open(JSON_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    scenarios = data.get('scenarioList', [])
    print(f"[INFO] Found {len(scenarios)} scenarios")

    # Collect all actions across all scenarios, dedup by id
    actions = {}

    for scenario in scenarios:
        for track in scenario.get('data', {}).get('tracks', []):
            char_id = track['id']
            for act in track.get('actions', []):
                aid = act.get('id')
                if not aid:
                    continue
                if aid not in actions:
                    actions[aid] = {'action': act, 'char_id': char_id}

    print(f"[INFO] Collected {len(actions)} unique actions")

    # Classify
    skill_actions = []
    attack_actions = []
    for aid, entry in actions.items():
        atype = entry['action'].get('type', 'other')
        if atype == 'attack':
            attack_actions.append((aid, entry))
        else:
            skill_actions.append((aid, entry))

    print(f"[INFO] Skills/chain/ultimate: {len(skill_actions)}, Attack segments: {len(attack_actions)}")

    # ── Connect to DB ──
    conn = pymysql.connect(**DB_CONFIG)
    cursor = conn.cursor()

    try:
        # ── Widen columns for longer IDs from endaxis ──
        cursor.execute("SET FOREIGN_KEY_CHECKS = 0")
        widen_sql = [
            "ALTER TABLE `skill` MODIFY COLUMN `id` VARCHAR(64) NOT NULL",
            "ALTER TABLE `skill` MODIFY COLUMN `character_id` VARCHAR(64) NOT NULL",
            "ALTER TABLE `skill_level` MODIFY COLUMN `skill_id` VARCHAR(64) NOT NULL",
            "ALTER TABLE `skill_cost` MODIFY COLUMN `skill_id` VARCHAR(64) NOT NULL",
            "ALTER TABLE `skill_action` MODIFY COLUMN `skill_id` VARCHAR(64) NOT NULL",
            "ALTER TABLE `skill_damage_tick` MODIFY COLUMN `skill_id` VARCHAR(64) NOT NULL",
            "ALTER TABLE `skill_anomaly` MODIFY COLUMN `skill_id` VARCHAR(64) NOT NULL",
            "ALTER TABLE `attack_segment` MODIFY COLUMN `character_id` VARCHAR(64) NOT NULL",
            "ALTER TABLE `attack_segment_tick` MODIFY COLUMN `character_id` VARCHAR(64) NOT NULL",
        ]
        for sql in widen_sql:
            try:
                cursor.execute(sql)
                print(f"[INFO] Widened column: {sql.split('`')[1]}.{sql.split('`')[3]}")
            except Exception as e:
                print(f"[WARN] Skipping column widen: {e}")
        cursor.execute("SET FOREIGN_KEY_CHECKS = 1")
        conn.commit()

        # ── Ensure characters exist ──
        cursor.execute("SELECT id FROM `character`")
        existing_chars = {row[0] for row in cursor.fetchall()}

        needed_chars = set()
        for _, entry in actions.items():
            needed_chars.add(entry['char_id'])

        new_chars = needed_chars - existing_chars
        if new_chars:
            print(f"[INFO] Inserting {len(new_chars)} missing characters")
            for cid in sorted(new_chars):
                sql = """INSERT IGNORE INTO `character`
                    (id, name, rarity, level, base_hp, base_atk, base_str, base_agi, base_int, base_wil,
                     main_attr, sub_attr, profession, element, weapon_type, potential)
                    VALUES (%s, %s, 4, 1, 0, 0, 0, 0, 0, 0,
                            'str', 'agi', 'vanguard', 'physical', 'sword', 0)"""
                cursor.execute(sql, (cid, cid))
            conn.commit()

        # Re-fetch to get all char IDs including newly inserted
        cursor.execute("SELECT id FROM `character`")
        existing_chars = {row[0] for row in cursor.fetchall()}

        # ── Import skill-type actions ──
        stats = {'skill': 0, 'action': 0, 'tick': 0, 'anomaly': 0, 'segment': 0, 'seg_tick': 0}

        for aid, entry in skill_actions:
            act = entry['action']
            char_id = entry['char_id']
            atype = act.get('type', 'other')
            db_type = TYPE_MAP.get(atype, 'other')
            if db_type is None:
                continue  # should not happen

            damage_type = element_to_damage_type(act.get('element'))
            name = act.get('name', aid)

            # 1. skill
            sql = """INSERT INTO `skill` (id, character_id, name, type, damage_type)
                     VALUES (%s, %s, %s, %s, %s)
                     ON DUPLICATE KEY UPDATE name=VALUES(name), type=VALUES(type), damage_type=VALUES(damage_type)"""
            cursor.execute(sql, (aid, char_id, name, db_type, damage_type))
            stats['skill'] += 1

            # 2. skill_action
            duration = frames_to_sec(act.get('duration'))
            cooldown_val = frames_to_sec(act.get('cooldown'))
            sp_cost = act.get('spCost')
            gauge_gain = act.get('gaugeGain')
            team_gauge_gain = act.get('teamGaugeGain')
            allowed_types = json.dumps(act.get('allowedTypes', []), ensure_ascii=False)

            cursor.execute("SELECT COUNT(*) FROM skill_action WHERE skill_id = %s", (aid,))
            if cursor.fetchone()[0] > 0:
                sql = """UPDATE skill_action
                         SET duration=%s, sp_cost=%s, gauge_gain=%s, team_gauge_gain=%s,
                             cooldown=%s, allowed_types=%s
                         WHERE skill_id=%s"""
                cursor.execute(sql, (duration, sp_cost, gauge_gain, team_gauge_gain, cooldown_val, allowed_types, aid))
            else:
                sql = """INSERT INTO skill_action
                         (skill_id, duration, sp_cost, gauge_gain, team_gauge_gain, cooldown, allowed_types)
                         VALUES (%s, %s, %s, %s, %s, %s, %s)"""
                cursor.execute(sql, (aid, duration, sp_cost, gauge_gain, team_gauge_gain, cooldown_val, allowed_types))
            stats['action'] += 1

            # 3. damage ticks (only if none exist yet)
            cursor.execute("SELECT COUNT(*) FROM skill_damage_tick WHERE skill_id = %s", (aid,))
            if cursor.fetchone()[0] == 0:
                for ti, tick in enumerate(act.get('damageTicks', [])):
                    offset = frames_to_sec(tick.get('offset'))
                    stagger = tick.get('stagger', 0)
                    sp = tick.get('sp', 0)
                    bound_effects = json.dumps(tick.get('boundEffects', []), ensure_ascii=False)
                    sql = """INSERT INTO skill_damage_tick (skill_id, tick_index, offset, stagger, sp, bound_effects)
                             VALUES (%s, %s, %s, %s, %s, %s)"""
                    cursor.execute(sql, (aid, ti, offset, stagger, sp, bound_effects))
                    stats['tick'] += 1

            # 4. anomalies (only if none exist yet)
            cursor.execute("SELECT COUNT(*) FROM skill_anomaly WHERE skill_id = %s", (aid,))
            if cursor.fetchone()[0] == 0:
                ai = 0
                for gi, group in enumerate(act.get('physicalAnomaly', [])):
                    for anom in group:
                        sql = """INSERT INTO skill_anomaly
                                 (skill_id, anomaly_index, group_index, type, stacks, duration, offset, delay)
                                 VALUES (%s, %s, %s, %s, %s, %s, %s, %s)"""
                        cursor.execute(sql, (
                            aid, ai, gi,
                            anom.get('type', ''),
                            anom.get('stacks', 1),
                            frames_to_sec(anom.get('duration')),
                            frames_to_sec(anom.get('offset')),
                            frames_to_sec(anom.get('delay')),
                        ))
                        ai += 1
                        stats['anomaly'] += 1

        # ── Import attack segments ──
        for aid, entry in attack_actions:
            act = entry['action']
            char_id = entry['char_id']
            seg_idx = act.get('attackSegmentIndex', 0)

            if char_id not in existing_chars:
                print(f"[WARN] Character {char_id} not found, skipping attack segment")
                continue

            duration = frames_to_sec(act.get('duration'))
            gauge_gain = act.get('gaugeGain')
            allowed_types = json.dumps(act.get('allowedTypes', []), ensure_ascii=False)

            cursor.execute("SELECT COUNT(*) FROM attack_segment WHERE character_id=%s AND segment_index=%s",
                           (char_id, seg_idx))
            if cursor.fetchone()[0] == 0:
                sql = """INSERT INTO attack_segment (character_id, segment_index, duration, gauge_gain, allowed_types)
                         VALUES (%s, %s, %s, %s, %s)"""
                cursor.execute(sql, (char_id, seg_idx, duration, gauge_gain, allowed_types))
                stats['segment'] += 1

                # ticks
                cursor.execute("SELECT COUNT(*) FROM attack_segment_tick WHERE character_id=%s AND segment_index=%s",
                               (char_id, seg_idx))
                if cursor.fetchone()[0] == 0:
                    for ti, tick in enumerate(act.get('damageTicks', [])):
                        offset = frames_to_sec(tick.get('offset'))
                        stagger = tick.get('stagger', 0)
                        sp = tick.get('sp', 0)
                        sql = """INSERT INTO attack_segment_tick
                                 (character_id, segment_index, tick_index, offset, stagger, sp)
                                 VALUES (%s, %s, %s, %s, %s, %s)"""
                        cursor.execute(sql, (char_id, seg_idx, ti, offset, stagger, sp))
                        stats['seg_tick'] += 1

        conn.commit()

        print(f"[DONE] Import completed!")
        print(f"  Skills:          {stats['skill']}")
        print(f"  SkillActions:    {stats['action']}")
        print(f"  DamageTicks:     {stats['tick']}")
        print(f"  Anomalies:       {stats['anomaly']}")
        print(f"  AttackSegments:  {stats['segment']}")
        print(f"  SegTicks:        {stats['seg_tick']}")

    except Exception as e:
        conn.rollback()
        print(f"[ERROR] {e}", file=sys.stderr)
        raise
    finally:
        cursor.close()
        conn.close()


if __name__ == '__main__':
    main()
