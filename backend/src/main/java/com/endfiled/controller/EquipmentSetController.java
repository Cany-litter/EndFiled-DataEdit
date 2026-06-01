package com.endfiled.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.endfiled.common.PageResult;
import com.endfiled.common.Result;
import com.endfiled.mapper.EquipmentSetMapper;
import com.endfiled.model.EquipmentSet;
import org.springframework.web.bind.annotation.*;
import javax.validation.Valid;

@RestController
@RequestMapping("/api/v1/equipment-sets")
public class EquipmentSetController extends BaseController<EquipmentSet, EquipmentSetMapper> {
    public EquipmentSetController(EquipmentSetMapper mapper) { super(mapper); }

    @GetMapping("/all")
    public Result<java.util.List<EquipmentSet>> all() { return defaultAll(); }

    @GetMapping
    public Result<PageResult<EquipmentSet>> list(
            @RequestParam(required = false) String name,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "20") Integer size) {
        var q = new LambdaQueryWrapper<EquipmentSet>().orderByAsc(EquipmentSet::getName);
        if (name != null) q.like(EquipmentSet::getName, name);
        return defaultPage(new Page<>(page, size), q);
    }

    @GetMapping("/{id}")
    public Result<EquipmentSet> get(@PathVariable String id) { return defaultGet(id); }

    @PostMapping
    public Result<EquipmentSet> create(@Valid @RequestBody EquipmentSet e) { return defaultCreate(e); }

    @PutMapping("/{id}")
    public Result<EquipmentSet> update(@PathVariable String id, @Valid @RequestBody EquipmentSet e) { return defaultUpdate(id, e); }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable String id) { return defaultDelete(id); }
}
