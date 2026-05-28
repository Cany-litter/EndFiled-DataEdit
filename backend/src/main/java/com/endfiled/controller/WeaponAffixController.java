package com.endfiled.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.endfiled.common.PageResult;
import com.endfiled.common.Result;
import com.endfiled.mapper.WeaponAffixMapper;
import com.endfiled.model.WeaponAffix;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("/api/v1/weapon-affixes")
public class WeaponAffixController extends BaseController<WeaponAffix, WeaponAffixMapper> {
    public WeaponAffixController(WeaponAffixMapper weaponAffixMapper) { super(weaponAffixMapper); }

    @GetMapping("/all")
    public Result<java.util.List<WeaponAffix>> all() { return defaultAll(); }

    @GetMapping
    public Result<PageResult<WeaponAffix>> list(
            @RequestParam(required = false) String weaponId,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "20") Integer size) {
        var q = new LambdaQueryWrapper<WeaponAffix>()
                .orderByAsc(WeaponAffix::getAffixIndex, WeaponAffix::getPotential);
        if (weaponId != null) q.eq(WeaponAffix::getWeaponId, weaponId);
        return defaultPage(new Page<>(page, size), q);
    }

    @PostMapping
    public Result<WeaponAffix> create(@Valid @RequestBody WeaponAffix a) { return defaultCreate(a); }

    @PutMapping
    public Result<WeaponAffix> update(@Valid @RequestBody WeaponAffix a) {
        mapper.update(a, new LambdaQueryWrapper<WeaponAffix>()
                .eq(WeaponAffix::getWeaponId, a.getWeaponId())
                .eq(WeaponAffix::getAffixIndex, a.getAffixIndex())
                .eq(WeaponAffix::getPotential, a.getPotential()));
        return Result.success(a);
    }

    @DeleteMapping
    public Result<Void> delete(@RequestParam String weaponId, @RequestParam Integer affixIndex, @RequestParam Integer potential) {
        mapper.delete(new LambdaQueryWrapper<WeaponAffix>()
                .eq(WeaponAffix::getWeaponId, weaponId)
                .eq(WeaponAffix::getAffixIndex, affixIndex)
                .eq(WeaponAffix::getPotential, potential));
        return Result.success();
    }
}
