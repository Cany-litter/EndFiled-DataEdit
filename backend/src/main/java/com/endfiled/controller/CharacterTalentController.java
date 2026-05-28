package com.endfiled.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.endfiled.common.PageResult;
import com.endfiled.common.Result;
import com.endfiled.mapper.CharacterTalentMapper;
import com.endfiled.model.CharacterTalent;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("/api/v1/character-talents")
public class CharacterTalentController extends BaseController<CharacterTalent, CharacterTalentMapper> {
    public CharacterTalentController(CharacterTalentMapper characterTalentMapper) { super(characterTalentMapper); }

    @GetMapping("/all")
    public Result<java.util.List<CharacterTalent>> all() { return defaultAll(); }

    @GetMapping
    public Result<PageResult<CharacterTalent>> list(
            @RequestParam(required = false) String characterId,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "20") Integer size) {
        var q = new LambdaQueryWrapper<CharacterTalent>()
                .orderByAsc(CharacterTalent::getTalentIndex, CharacterTalent::getStage);
        if (characterId != null) q.eq(CharacterTalent::getCharacterId, characterId);
        return defaultPage(new Page<>(page, size), q);
    }

    @GetMapping("/{id}")
    public Result<CharacterTalent> get(@PathVariable String id) { return defaultGet(id); }

    @PostMapping
    public Result<CharacterTalent> create(@Valid @RequestBody CharacterTalent t) { return defaultCreate(t); }

    @PutMapping("/{id}")
    public Result<CharacterTalent> update(@PathVariable String id, @Valid @RequestBody CharacterTalent t) { return defaultUpdate(id, t); }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable String id) { return defaultDelete(id); }
}
