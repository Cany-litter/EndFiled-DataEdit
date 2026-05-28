package com.endfiled.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.endfiled.common.PageResult;
import com.endfiled.common.Result;
import com.endfiled.mapper.SkillDamageTickMapper;
import com.endfiled.model.SkillDamageTick;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("/api/v1/skill-damage-ticks")
public class SkillDamageTickController extends BaseController<SkillDamageTick, SkillDamageTickMapper> {
    public SkillDamageTickController(SkillDamageTickMapper mapper) { super(mapper); }

    @GetMapping("/all")
    public Result<java.util.List<SkillDamageTick>> all() { return defaultAll(); }

    @GetMapping
    public Result<PageResult<SkillDamageTick>> list(
            @RequestParam(required = false) String skillId,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "50") Integer size) {
        var q = new LambdaQueryWrapper<SkillDamageTick>().orderByAsc(SkillDamageTick::getTickIndex);
        if (skillId != null) q.eq(SkillDamageTick::getSkillId, skillId);
        return defaultPage(new Page<>(page, size), q);
    }

    @PostMapping
    public Result<SkillDamageTick> create(@Valid @RequestBody SkillDamageTick t) { return defaultCreate(t); }

    @PutMapping
    public Result<SkillDamageTick> update(@Valid @RequestBody SkillDamageTick t) {
        mapper.update(t, new LambdaQueryWrapper<SkillDamageTick>()
                .eq(SkillDamageTick::getSkillId, t.getSkillId())
                .eq(SkillDamageTick::getTickIndex, t.getTickIndex()));
        return Result.success(t);
    }

    @DeleteMapping("/{skillId}/{tickIndex}")
    public Result<Void> delete(@PathVariable String skillId, @PathVariable Integer tickIndex) {
        mapper.deleteById(new SkillDamageTick() {{ setSkillId(skillId); setTickIndex(tickIndex); }});
        return Result.success();
    }
}
