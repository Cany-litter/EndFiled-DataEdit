package com.endfiled.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.endfiled.common.PageResult;
import com.endfiled.common.Result;
import com.endfiled.mapper.AttackSegmentTickMapper;
import com.endfiled.model.AttackSegmentTick;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("/api/v1/attack-segment-ticks")
public class AttackSegmentTickController extends BaseController<AttackSegmentTick, AttackSegmentTickMapper> {
    public AttackSegmentTickController(AttackSegmentTickMapper mapper) { super(mapper); }

    @GetMapping("/all")
    public Result<java.util.List<AttackSegmentTick>> all() { return defaultAll(); }

    @GetMapping
    public Result<PageResult<AttackSegmentTick>> list(
            @RequestParam(required = false) String characterId,
            @RequestParam(required = false) Integer segmentIndex,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "50") Integer size) {
        var q = new LambdaQueryWrapper<AttackSegmentTick>().orderByAsc(AttackSegmentTick::getTickIndex);
        if (characterId != null) q.eq(AttackSegmentTick::getCharacterId, characterId);
        if (segmentIndex != null) q.eq(AttackSegmentTick::getSegmentIndex, segmentIndex);
        return defaultPage(new Page<>(page, size), q);
    }

    @PostMapping
    public Result<AttackSegmentTick> create(@Valid @RequestBody AttackSegmentTick t) { return defaultCreate(t); }

    @PutMapping
    public Result<AttackSegmentTick> update(@Valid @RequestBody AttackSegmentTick t) {
        mapper.update(t, new LambdaQueryWrapper<AttackSegmentTick>()
                .eq(AttackSegmentTick::getCharacterId, t.getCharacterId())
                .eq(AttackSegmentTick::getSegmentIndex, t.getSegmentIndex())
                .eq(AttackSegmentTick::getTickIndex, t.getTickIndex()));
        return Result.success(t);
    }

    @DeleteMapping("/{characterId}/{segmentIndex}/{tickIndex}")
    public Result<Void> delete(@PathVariable String characterId, @PathVariable Integer segmentIndex, @PathVariable Integer tickIndex) {
        mapper.deleteById(new AttackSegmentTick() {{ setCharacterId(characterId); setSegmentIndex(segmentIndex); setTickIndex(tickIndex); }});
        return Result.success();
    }
}
