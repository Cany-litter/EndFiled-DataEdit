package com.endfiled.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.endfiled.common.PageResult;
import com.endfiled.common.RelationInfo;
import com.endfiled.common.Result;
import com.endfiled.mapper.SkillActionMapper;
import com.endfiled.mapper.SkillLevelMapper;
import com.endfiled.mapper.SkillMapper;
import com.endfiled.model.Skill;
import com.endfiled.model.SkillAction;
import com.endfiled.model.SkillLevel;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/v1/skills")
public class SkillController extends BaseController<Skill, SkillMapper> {

    private final SkillLevelMapper skillLevelMapper;
    private final SkillActionMapper skillActionMapper;

    public SkillController(SkillMapper skillMapper,
                           SkillLevelMapper skillLevelMapper,
                           SkillActionMapper skillActionMapper) {
        super(skillMapper);
        this.skillLevelMapper = skillLevelMapper;
        this.skillActionMapper = skillActionMapper;
    }

    @GetMapping("/all")
    public Result<java.util.List<Skill>> all() { return defaultAll(); }

    @GetMapping
    public Result<PageResult<Skill>> list(
            @RequestParam(required = false) String characterId,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "20") Integer size) {
        var q = new LambdaQueryWrapper<Skill>();
        if (characterId != null) q.eq(Skill::getCharacterId, characterId);
        return defaultPage(new Page<>(page, size), q);
    }

    @GetMapping("/{id}")
    public Result<Skill> get(@PathVariable String id) { return defaultGet(id); }

    @PostMapping
    public Result<Skill> create(@Valid @RequestBody Skill s) { return defaultCreate(s); }

    @PutMapping("/{id}")
    public Result<Skill> update(@PathVariable String id, @Valid @RequestBody Skill s) { return defaultUpdate(id, s); }

    @GetMapping("/{id}/relations")
    public Result<List<RelationInfo>> relations(@PathVariable String id) {
        List<RelationInfo> list = new ArrayList<>();
        long levelCount = skillLevelMapper.selectCount(new LambdaQueryWrapper<SkillLevel>().eq(SkillLevel::getSkillId, id));
        if (levelCount > 0) list.add(new RelationInfo("skill_level", "技能等级倍率", levelCount));
        long actionCount = skillActionMapper.selectCount(new LambdaQueryWrapper<SkillAction>().eq(SkillAction::getSkillId, id));
        if (actionCount > 0) list.add(new RelationInfo("skill_action", "技能动作", actionCount));
        return Result.success(list);
    }

    @Transactional
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable String id,
                               @RequestParam(required = false, defaultValue = "false") boolean cascade) {
        if (cascade) {
            skillActionMapper.deleteById(id);
            skillLevelMapper.delete(new LambdaQueryWrapper<SkillLevel>().eq(SkillLevel::getSkillId, id));
        }
        return defaultDelete(id);
    }
}
