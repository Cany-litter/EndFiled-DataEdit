package com.endfiled.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.endfiled.common.PageResult;
import com.endfiled.common.Result;
import com.endfiled.mapper.CharacterPotentialMapper;
import com.endfiled.model.CharacterPotential;
import org.springframework.web.bind.annotation.*;
import javax.validation.Valid;

@RestController
@RequestMapping("/api/v1/character-potentials")
public class CharacterPotentialController extends BaseController<CharacterPotential, CharacterPotentialMapper> {
    public CharacterPotentialController(CharacterPotentialMapper mapper) { super(mapper); }

    @GetMapping("/all")
    public Result<java.util.List<CharacterPotential>> all() { return defaultAll(); }

    @GetMapping
    public Result<PageResult<CharacterPotential>> list(
            @RequestParam(required = false) String characterId,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "20") Integer size) {
        var q = new LambdaQueryWrapper<CharacterPotential>().orderByAsc(CharacterPotential::getPotentialIndex);
        if (characterId != null) q.eq(CharacterPotential::getCharacterId, characterId);
        return defaultPage(new Page<>(page, size), q);
    }

    @GetMapping("/{id}")
    public Result<CharacterPotential> get(@PathVariable String id) { return defaultGet(id); }

    @PostMapping
    public Result<CharacterPotential> create(@Valid @RequestBody CharacterPotential e) { return defaultCreate(e); }

    @PutMapping("/{id}")
    public Result<CharacterPotential> update(@PathVariable String id, @Valid @RequestBody CharacterPotential e) { return defaultUpdate(id, e); }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable String id) { return defaultDelete(id); }
}
