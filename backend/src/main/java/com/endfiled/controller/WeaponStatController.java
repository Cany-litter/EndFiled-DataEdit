package com.endfiled.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.endfiled.common.PageResult;
import com.endfiled.common.Result;
import com.endfiled.mapper.WeaponStatMapper;
import com.endfiled.model.WeaponStat;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("/api/v1/weapon-stats")
public class WeaponStatController extends BaseController<WeaponStat, WeaponStatMapper> {
    public WeaponStatController(WeaponStatMapper weaponStatMapper) { super(weaponStatMapper); }

    @GetMapping("/all")
    public Result<java.util.List<WeaponStat>> all() { return defaultAll(); }

    @GetMapping
    public Result<PageResult<WeaponStat>> list(
            @RequestParam(required = false) String weaponId,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "20") Integer size) {
        var q = new LambdaQueryWrapper<WeaponStat>().orderByAsc(WeaponStat::getLevel);
        if (weaponId != null) q.eq(WeaponStat::getWeaponId, weaponId);
        return defaultPage(new Page<>(page, size), q);
    }

    @PostMapping
    public Result<WeaponStat> create(@Valid @RequestBody WeaponStat s) { return defaultCreate(s); }

    @PutMapping
    public Result<WeaponStat> update(@Valid @RequestBody WeaponStat s) {
        mapper.update(s, new LambdaQueryWrapper<WeaponStat>()
                .eq(WeaponStat::getWeaponId, s.getWeaponId()).eq(WeaponStat::getLevel, s.getLevel()));
        return Result.success(s);
    }

    @DeleteMapping
    public Result<Void> delete(@RequestParam String weaponId, @RequestParam Integer level) {
        mapper.delete(new LambdaQueryWrapper<WeaponStat>()
                .eq(WeaponStat::getWeaponId, weaponId).eq(WeaponStat::getLevel, level));
        return Result.success();
    }
}
