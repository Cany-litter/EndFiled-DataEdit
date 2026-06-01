package com.endfiled.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.endfiled.common.PageResult;
import com.endfiled.common.Result;
import com.endfiled.mapper.CharacterArchiveMapper;
import com.endfiled.model.CharacterArchive;
import org.springframework.web.bind.annotation.*;
import javax.validation.Valid;

@RestController
@RequestMapping("/api/v1/character-archives")
public class CharacterArchiveController extends BaseController<CharacterArchive, CharacterArchiveMapper> {
    public CharacterArchiveController(CharacterArchiveMapper mapper) { super(mapper); }

    @GetMapping("/all")
    public Result<java.util.List<CharacterArchive>> all() { return defaultAll(); }

    @GetMapping
    public Result<PageResult<CharacterArchive>> list(
            @RequestParam(required = false) String characterId,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "20") Integer size) {
        var q = new LambdaQueryWrapper<CharacterArchive>().orderByAsc(CharacterArchive::getArchiveIndex);
        if (characterId != null) q.eq(CharacterArchive::getCharacterId, characterId);
        return defaultPage(new Page<>(page, size), q);
    }

    @GetMapping("/{id}")
    public Result<CharacterArchive> get(@PathVariable String id) { return defaultGet(id); }

    @PostMapping
    public Result<CharacterArchive> create(@Valid @RequestBody CharacterArchive e) { return defaultCreate(e); }

    @PutMapping("/{id}")
    public Result<CharacterArchive> update(@PathVariable String id, @Valid @RequestBody CharacterArchive e) { return defaultUpdate(id, e); }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable String id) { return defaultDelete(id); }
}
