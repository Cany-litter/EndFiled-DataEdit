package com.endfiled.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.endfiled.common.PageResult;
import com.endfiled.common.Result;
import com.endfiled.mapper.EquipmentMapper;
import com.endfiled.model.Equipment;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("/api/v1/equipment")
public class EquipmentController extends BaseController<Equipment, EquipmentMapper> {
    public EquipmentController(EquipmentMapper equipmentMapper) { super(equipmentMapper); }

    @GetMapping("/all")
    public Result<java.util.List<Equipment>> all() { return defaultAll(); }

    @GetMapping
    public Result<PageResult<Equipment>> list(
            @RequestParam(required = false) String setName,
            @RequestParam(required = false) String slot,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "20") Integer size) {
        var q = new LambdaQueryWrapper<Equipment>();
        if (setName != null && !setName.isEmpty()) q.like(Equipment::getSetName, setName);
        if (slot != null && !slot.isEmpty()) q.eq(Equipment::getSlot, slot);
        return defaultPage(new Page<>(page, size), q);
    }

    @GetMapping("/{id}")
    public Result<Equipment> get(@PathVariable String id) { return defaultGet(id); }

    @PostMapping
    public Result<Equipment> create(@Valid @RequestBody Equipment e) { return defaultCreate(e); }

    @PutMapping("/{id}")
    public Result<Equipment> update(@PathVariable String id, @Valid @RequestBody Equipment e) { return defaultUpdate(id, e); }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable String id) { return defaultDelete(id); }
}
