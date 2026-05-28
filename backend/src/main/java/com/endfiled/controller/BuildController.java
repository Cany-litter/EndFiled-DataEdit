package com.endfiled.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.endfiled.common.PageResult;
import com.endfiled.common.Result;
import com.endfiled.mapper.BuildMapper;
import com.endfiled.model.Build;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("/api/v1/builds")
public class BuildController extends BaseController<Build, BuildMapper> {
    public BuildController(BuildMapper buildMapper) { super(buildMapper); }

    @GetMapping("/all")
    public Result<java.util.List<Build>> all() { return defaultAll(); }

    @GetMapping
    public Result<PageResult<Build>> list(
            @RequestParam(required = false) String characterId,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "20") Integer size) {
        var q = new LambdaQueryWrapper<Build>();
        if (characterId != null) q.eq(Build::getCharacterId, characterId);
        return defaultPage(new Page<>(page, size), q);
    }

    @GetMapping("/{id}")
    public Result<Build> get(@PathVariable String id) { return defaultGet(id); }

    @PostMapping
    public Result<Build> create(@Valid @RequestBody Build b) { return defaultCreate(b); }

    @PutMapping("/{id}")
    public Result<Build> update(@PathVariable String id, @Valid @RequestBody Build b) { return defaultUpdate(id, b); }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable String id) { return defaultDelete(id); }
}
