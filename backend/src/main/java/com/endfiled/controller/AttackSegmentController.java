package com.endfiled.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.endfiled.common.PageResult;
import com.endfiled.common.Result;
import com.endfiled.mapper.AttackSegmentMapper;
import com.endfiled.model.AttackSegment;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("/api/v1/attack-segments")
public class AttackSegmentController extends BaseController<AttackSegment, AttackSegmentMapper> {
    public AttackSegmentController(AttackSegmentMapper mapper) { super(mapper); }

    @GetMapping("/all")
    public Result<java.util.List<AttackSegment>> all() { return defaultAll(); }

    @GetMapping
    public Result<PageResult<AttackSegment>> list(
            @RequestParam(required = false) String characterId,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "20") Integer size) {
        var q = new LambdaQueryWrapper<AttackSegment>().orderByAsc(AttackSegment::getSegmentIndex);
        if (characterId != null) q.eq(AttackSegment::getCharacterId, characterId);
        return defaultPage(new Page<>(page, size), q);
    }

    @PostMapping
    public Result<AttackSegment> create(@Valid @RequestBody AttackSegment s) { return defaultCreate(s); }

    @PutMapping
    public Result<AttackSegment> update(@Valid @RequestBody AttackSegment s) {
        mapper.update(s, new LambdaQueryWrapper<AttackSegment>()
                .eq(AttackSegment::getCharacterId, s.getCharacterId())
                .eq(AttackSegment::getSegmentIndex, s.getSegmentIndex()));
        return Result.success(s);
    }

    @DeleteMapping("/{characterId}/{segmentIndex}")
    public Result<Void> delete(@PathVariable String characterId, @PathVariable Integer segmentIndex) {
        mapper.deleteById(new AttackSegment() {{ setCharacterId(characterId); setSegmentIndex(segmentIndex); }});
        return Result.success();
    }
}
