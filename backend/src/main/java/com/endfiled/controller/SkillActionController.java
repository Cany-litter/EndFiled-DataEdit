package com.endfiled.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.endfiled.common.PageResult;
import com.endfiled.common.Result;
import com.endfiled.mapper.SkillActionMapper;
import com.endfiled.model.SkillAction;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("/api/v1/skill-actions")
public class SkillActionController extends BaseController<SkillAction, SkillActionMapper> {
    public SkillActionController(SkillActionMapper skillActionMapper) { super(skillActionMapper); }

    @GetMapping("/all")
    public Result<java.util.List<SkillAction>> all() { return defaultAll(); }

    @GetMapping
    public Result<PageResult<SkillAction>> list(
            @RequestParam(required = false) String skillId,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "20") Integer size) {
        var q = new LambdaQueryWrapper<SkillAction>();
        if (skillId != null) q.eq(SkillAction::getSkillId, skillId);
        return defaultPage(new Page<>(page, size), q);
    }

    @GetMapping("/{skillId}")
    public Result<SkillAction> get(@PathVariable String skillId) { return defaultGet(skillId); }

    @PostMapping
    public Result<SkillAction> create(@Valid @RequestBody SkillAction a) { return defaultCreate(a); }

    @PutMapping
    public Result<SkillAction> update(@Valid @RequestBody SkillAction a) {
        mapper.updateById(a);
        return Result.success(a);
    }

    @DeleteMapping("/{skillId}")
    public Result<Void> delete(@PathVariable String skillId) { return defaultDelete(skillId); }
}
