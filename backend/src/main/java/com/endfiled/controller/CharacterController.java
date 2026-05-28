package com.endfiled.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.endfiled.common.PageResult;
import com.endfiled.common.Result;
import com.endfiled.mapper.CharacterMapper;
import com.endfiled.model.GameCharacter;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("/api/v1/characters")
public class CharacterController extends BaseController<GameCharacter, CharacterMapper> {
    public CharacterController(CharacterMapper characterMapper) { super(characterMapper); }

    @GetMapping("/all")
    public Result<java.util.List<GameCharacter>> all() { return defaultAll(); }

    @GetMapping
    public Result<PageResult<GameCharacter>> list(
            @RequestParam(required = false) String name,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "20") Integer size) {
        var q = new LambdaQueryWrapper<GameCharacter>();
        if (name != null && !name.isEmpty()) q.like(GameCharacter::getName, name);
        return defaultPage(new Page<>(page, size), q);
    }

    @GetMapping("/{id}")
    public Result<GameCharacter> get(@PathVariable String id) { return defaultGet(id); }

    @PostMapping
    public Result<GameCharacter> create(@Valid @RequestBody GameCharacter c) { return defaultCreate(c); }

    @PutMapping("/{id}")
    public Result<GameCharacter> update(@PathVariable String id, @Valid @RequestBody GameCharacter c) { return defaultUpdate(id, c); }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable String id) { return defaultDelete(id); }
}
