package com.endfiled.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.endfiled.common.PageResult;
import com.endfiled.common.Result;
import com.endfiled.mapper.SkillCostMapper;
import com.endfiled.model.SkillCost;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("/api/v1/skill-costs")
public class SkillCostController extends BaseController<SkillCost, SkillCostMapper> {
    public SkillCostController(SkillCostMapper skillCostMapper) { super(skillCostMapper); }

    @GetMapping("/all")
    public Result<java.util.List<SkillCost>> all() { return defaultAll(); }

    @GetMapping
    public Result<PageResult<SkillCost>> list(
            @RequestParam(required = false) String skillId,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "20") Integer size) {
        var q = new LambdaQueryWrapper<SkillCost>().orderByAsc(SkillCost::getLevel);
        if (skillId != null) q.eq(SkillCost::getSkillId, skillId);
        return defaultPage(new Page<>(page, size), q);
    }

    @PostMapping
    public Result<SkillCost> create(@Valid @RequestBody SkillCost c) { return defaultCreate(c); }

    @PutMapping
    public Result<SkillCost> update(@Valid @RequestBody SkillCost c) {
        mapper.update(c, new LambdaQueryWrapper<SkillCost>()
                .eq(SkillCost::getSkillId, c.getSkillId()).eq(SkillCost::getLevel, c.getLevel()));
        return Result.success(c);
    }
}
