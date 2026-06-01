package com.endfiled.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.endfiled.common.PageResult;
import com.endfiled.common.Result;
import com.endfiled.mapper.CharacterLogisticsMapper;
import com.endfiled.model.CharacterLogistics;
import org.springframework.web.bind.annotation.*;
import javax.validation.Valid;

@RestController
@RequestMapping("/api/v1/character-logistics")
public class CharacterLogisticsController extends BaseController<CharacterLogistics, CharacterLogisticsMapper> {
    public CharacterLogisticsController(CharacterLogisticsMapper mapper) { super(mapper); }

    @GetMapping("/all")
    public Result<java.util.List<CharacterLogistics>> all() { return defaultAll(); }

    @GetMapping
    public Result<PageResult<CharacterLogistics>> list(
            @RequestParam(required = false) String characterId,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "20") Integer size) {
        var q = new LambdaQueryWrapper<CharacterLogistics>();
        if (characterId != null) q.eq(CharacterLogistics::getCharacterId, characterId);
        return defaultPage(new Page<>(page, size), q);
    }

    @GetMapping("/{id}")
    public Result<CharacterLogistics> get(@PathVariable String id) { return defaultGet(id); }

    @PostMapping
    public Result<CharacterLogistics> create(@Valid @RequestBody CharacterLogistics e) { return defaultCreate(e); }

    @PutMapping("/{id}")
    public Result<CharacterLogistics> update(@PathVariable String id, @Valid @RequestBody CharacterLogistics e) { return defaultUpdate(id, e); }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable String id) { return defaultDelete(id); }
}
