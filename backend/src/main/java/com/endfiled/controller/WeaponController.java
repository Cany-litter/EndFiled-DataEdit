package com.endfiled.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.endfiled.common.PageResult;
import com.endfiled.common.Result;
import com.endfiled.mapper.WeaponMapper;
import com.endfiled.model.Weapon;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("/api/v1/weapons")
public class WeaponController extends BaseController<Weapon, WeaponMapper> {
    public WeaponController(WeaponMapper weaponMapper) { super(weaponMapper); }

    @GetMapping("/all")
    public Result<java.util.List<Weapon>> all() { return defaultAll(); }

    @GetMapping
    public Result<PageResult<Weapon>> list(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String type,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "20") Integer size) {
        var q = new LambdaQueryWrapper<Weapon>();
        if (name != null && !name.isEmpty()) q.like(Weapon::getName, name);
        if (type != null && !type.isEmpty()) q.eq(Weapon::getType, type);
        return defaultPage(new Page<>(page, size), q);
    }

    @GetMapping("/{id}")
    public Result<Weapon> get(@PathVariable String id) { return defaultGet(id); }

    @PostMapping
    public Result<Weapon> create(@Valid @RequestBody Weapon w) { return defaultCreate(w); }

    @PutMapping("/{id}")
    public Result<Weapon> update(@PathVariable String id, @Valid @RequestBody Weapon w) { return defaultUpdate(id, w); }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable String id) { return defaultDelete(id); }
}
