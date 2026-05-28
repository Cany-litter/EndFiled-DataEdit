package com.endfiled.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.endfiled.common.PageResult;
import com.endfiled.common.Result;
import com.endfiled.mapper.SkillLevelMapper;
import com.endfiled.model.SkillLevel;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("/api/v1/skill-levels")
public class SkillLevelController extends BaseController<SkillLevel, SkillLevelMapper> {
    public SkillLevelController(SkillLevelMapper skillLevelMapper) { super(skillLevelMapper); }

    @GetMapping("/all")
    public Result<java.util.List<SkillLevel>> all() { return defaultAll(); }

    @GetMapping
    public Result<PageResult<SkillLevel>> list(
            @RequestParam(required = false) String skillId,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "20") Integer size) {
        var q = new LambdaQueryWrapper<SkillLevel>().orderByAsc(SkillLevel::getLevel);
        if (skillId != null) q.eq(SkillLevel::getSkillId, skillId);
        return defaultPage(new Page<>(page, size), q);
    }

    @PostMapping
    public Result<SkillLevel> create(@Valid @RequestBody SkillLevel l) { return defaultCreate(l); }

    @PutMapping
    public Result<SkillLevel> update(@Valid @RequestBody SkillLevel l) {
        mapper.update(l, new LambdaQueryWrapper<SkillLevel>()
                .eq(SkillLevel::getSkillId, l.getSkillId()).eq(SkillLevel::getLevel, l.getLevel()));
        return Result.success(l);
    }
}
