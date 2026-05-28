package com.endfiled.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.endfiled.common.PageResult;
import com.endfiled.common.Result;
import com.endfiled.mapper.CharacterStatMapper;
import com.endfiled.model.CharacterStat;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("/api/v1/character-stats")
public class CharacterStatController extends BaseController<CharacterStat, CharacterStatMapper> {
    public CharacterStatController(CharacterStatMapper characterStatMapper) { super(characterStatMapper); }

    @GetMapping("/all")
    public Result<java.util.List<CharacterStat>> all() { return defaultAll(); }

    @GetMapping
    public Result<PageResult<CharacterStat>> list(
            @RequestParam(required = false) String characterId,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "20") Integer size) {
        var q = new LambdaQueryWrapper<CharacterStat>()
                .orderByAsc(CharacterStat::getLevel);
        if (characterId != null) q.eq(CharacterStat::getCharacterId, characterId);
        return defaultPage(new Page<>(page, size), q);
    }

    @PostMapping
    public Result<CharacterStat> create(@Valid @RequestBody CharacterStat s) { return defaultCreate(s); }

    @PutMapping
    public Result<CharacterStat> update(@Valid @RequestBody CharacterStat s) {
        mapper.update(s, new LambdaQueryWrapper<CharacterStat>()
                .eq(CharacterStat::getCharacterId, s.getCharacterId()).eq(CharacterStat::getLevel, s.getLevel()));
        return Result.success(s);
    }

    @DeleteMapping
    public Result<Void> delete(@RequestParam String characterId, @RequestParam Integer level) {
        mapper.delete(new LambdaQueryWrapper<CharacterStat>()
                .eq(CharacterStat::getCharacterId, characterId).eq(CharacterStat::getLevel, level));
        return Result.success();
    }
}
