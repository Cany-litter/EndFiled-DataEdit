package com.endfiled.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.endfiled.common.PageResult;
import com.endfiled.common.Result;
import com.endfiled.mapper.WeaponAscensionMapper;
import com.endfiled.model.WeaponAscension;
import org.springframework.web.bind.annotation.*;
import javax.validation.Valid;

@RestController
@RequestMapping("/api/v1/weapon-ascensions")
public class WeaponAscensionController extends BaseController<WeaponAscension, WeaponAscensionMapper> {
    public WeaponAscensionController(WeaponAscensionMapper mapper) { super(mapper); }

    @GetMapping("/all")
    public Result<java.util.List<WeaponAscension>> all() { return defaultAll(); }

    @GetMapping
    public Result<PageResult<WeaponAscension>> list(
            @RequestParam(required = false) String weaponId,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "20") Integer size) {
        var q = new LambdaQueryWrapper<WeaponAscension>().orderByAsc(WeaponAscension::getPhase);
        if (weaponId != null) q.eq(WeaponAscension::getWeaponId, weaponId);
        return defaultPage(new Page<>(page, size), q);
    }

    @GetMapping("/{id}")
    public Result<WeaponAscension> get(@PathVariable String id) { return defaultGet(id); }

    @PostMapping
    public Result<WeaponAscension> create(@Valid @RequestBody WeaponAscension e) { return defaultCreate(e); }

    @PutMapping("/{id}")
    public Result<WeaponAscension> update(@PathVariable String id, @Valid @RequestBody WeaponAscension e) { return defaultUpdate(id, e); }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable String id) { return defaultDelete(id); }
}
