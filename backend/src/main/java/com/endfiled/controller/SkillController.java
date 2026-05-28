package com.endfiled.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.endfiled.common.PageResult;
import com.endfiled.common.Result;
import com.endfiled.mapper.SkillMapper;
import com.endfiled.model.Skill;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("/api/v1/skills")
public class SkillController extends BaseController<Skill, SkillMapper> {
    public SkillController(SkillMapper skillMapper) { super(skillMapper); }

    @GetMapping("/all")
    public Result<java.util.List<Skill>> all() { return defaultAll(); }

    @GetMapping
    public Result<PageResult<Skill>> list(
            @RequestParam(required = false) String characterId,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "20") Integer size) {
        var q = new LambdaQueryWrapper<Skill>();
        if (characterId != null) q.eq(Skill::getCharacterId, characterId);
        return defaultPage(new Page<>(page, size), q);
    }

    @GetMapping("/{id}")
    public Result<Skill> get(@PathVariable String id) { return defaultGet(id); }

    @PostMapping
    public Result<Skill> create(@Valid @RequestBody Skill s) { return defaultCreate(s); }

    @PutMapping("/{id}")
    public Result<Skill> update(@PathVariable String id, @Valid @RequestBody Skill s) { return defaultUpdate(id, s); }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable String id) { return defaultDelete(id); }
}
