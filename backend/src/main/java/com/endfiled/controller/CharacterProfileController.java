package com.endfiled.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.endfiled.common.PageResult;
import com.endfiled.common.Result;
import com.endfiled.mapper.CharacterProfileMapper;
import com.endfiled.model.CharacterProfile;
import org.springframework.web.bind.annotation.*;
import javax.validation.Valid;

@RestController
@RequestMapping("/api/v1/character-profiles")
public class CharacterProfileController extends BaseController<CharacterProfile, CharacterProfileMapper> {
    public CharacterProfileController(CharacterProfileMapper mapper) { super(mapper); }

    @GetMapping("/all")
    public Result<java.util.List<CharacterProfile>> all() { return defaultAll(); }

    @GetMapping
    public Result<PageResult<CharacterProfile>> list(
            @RequestParam(required = false) String characterId,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "20") Integer size) {
        var q = new LambdaQueryWrapper<CharacterProfile>();
        if (characterId != null) q.eq(CharacterProfile::getCharacterId, characterId);
        return defaultPage(new Page<>(page, size), q);
    }

    @GetMapping("/{id}")
    public Result<CharacterProfile> get(@PathVariable String id) { return defaultGet(id); }

    @PostMapping
    public Result<CharacterProfile> create(@Valid @RequestBody CharacterProfile e) { return defaultCreate(e); }

    @PutMapping("/{id}")
    public Result<CharacterProfile> update(@PathVariable String id, @Valid @RequestBody CharacterProfile e) { return defaultUpdate(id, e); }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable String id) { return defaultDelete(id); }
}
