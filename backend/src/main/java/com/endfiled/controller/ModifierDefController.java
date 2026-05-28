package com.endfiled.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.endfiled.common.PageResult;
import com.endfiled.common.Result;
import com.endfiled.mapper.ModifierDefMapper;
import com.endfiled.model.ModifierDef;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/v1/modifier-defs")
public class ModifierDefController extends BaseController<ModifierDef, ModifierDefMapper> {
    public ModifierDefController(ModifierDefMapper modifierDefMapper) { super(modifierDefMapper); }

    @GetMapping("/all")
    public Result<List<ModifierDef>> all() { return defaultAll(); }

    @GetMapping
    public Result<PageResult<ModifierDef>> list(
            @RequestParam(required = false) String label,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "50") Integer size) {
        var q = new LambdaQueryWrapper<ModifierDef>();
        if (label != null && !label.isEmpty()) q.like(ModifierDef::getLabel, label);
        return defaultPage(new Page<>(page, size), q);
    }

    @GetMapping("/{id}")
    public Result<ModifierDef> get(@PathVariable String id) { return defaultGet(id); }

    @PostMapping
    public Result<ModifierDef> create(@Valid @RequestBody ModifierDef m) { return defaultCreate(m); }

    @PutMapping("/{id}")
    public Result<ModifierDef> update(@PathVariable String id, @Valid @RequestBody ModifierDef m) { return defaultUpdate(id, m); }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable String id) { return defaultDelete(id); }
}
