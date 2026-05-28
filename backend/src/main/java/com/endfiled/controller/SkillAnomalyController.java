package com.endfiled.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.endfiled.common.PageResult;
import com.endfiled.common.Result;
import com.endfiled.mapper.SkillAnomalyMapper;
import com.endfiled.model.SkillAnomaly;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("/api/v1/skill-anomalies")
public class SkillAnomalyController extends BaseController<SkillAnomaly, SkillAnomalyMapper> {
    public SkillAnomalyController(SkillAnomalyMapper mapper) { super(mapper); }

    @GetMapping("/all")
    public Result<java.util.List<SkillAnomaly>> all() { return defaultAll(); }

    @GetMapping
    public Result<PageResult<SkillAnomaly>> list(
            @RequestParam(required = false) String skillId,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "50") Integer size) {
        var q = new LambdaQueryWrapper<SkillAnomaly>().orderByAsc(SkillAnomaly::getAnomalyIndex);
        if (skillId != null) q.eq(SkillAnomaly::getSkillId, skillId);
        return defaultPage(new Page<>(page, size), q);
    }

    @PostMapping
    public Result<SkillAnomaly> create(@Valid @RequestBody SkillAnomaly a) { return defaultCreate(a); }

    @PutMapping
    public Result<SkillAnomaly> update(@Valid @RequestBody SkillAnomaly a) {
        mapper.update(a, new LambdaQueryWrapper<SkillAnomaly>()
                .eq(SkillAnomaly::getSkillId, a.getSkillId())
                .eq(SkillAnomaly::getAnomalyIndex, a.getAnomalyIndex()));
        return Result.success(a);
    }

    @DeleteMapping("/{skillId}/{anomalyIndex}")
    public Result<Void> delete(@PathVariable String skillId, @PathVariable Integer anomalyIndex) {
        mapper.deleteById(new SkillAnomaly() {{ setSkillId(skillId); setAnomalyIndex(anomalyIndex); }});
        return Result.success();
    }
}
