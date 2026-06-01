package com.endfiled.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.endfiled.common.PageResult;
import com.endfiled.common.Result;
import com.endfiled.mapper.WeaponLevelCostMapper;
import com.endfiled.model.WeaponLevelCost;
import org.springframework.web.bind.annotation.*;
import javax.validation.Valid;

@RestController
@RequestMapping("/api/v1/weapon-level-costs")
public class WeaponLevelCostController extends BaseController<WeaponLevelCost, WeaponLevelCostMapper> {
    public WeaponLevelCostController(WeaponLevelCostMapper mapper) { super(mapper); }

    @GetMapping("/all")
    public Result<java.util.List<WeaponLevelCost>> all() { return defaultAll(); }

    @GetMapping
    public Result<PageResult<WeaponLevelCost>> list(
            @RequestParam(required = false) String weaponId,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "90") Integer size) {
        var q = new LambdaQueryWrapper<WeaponLevelCost>().orderByAsc(WeaponLevelCost::getLevel);
        if (weaponId != null) q.eq(WeaponLevelCost::getWeaponId, weaponId);
        return defaultPage(new Page<>(page, size), q);
    }

    @GetMapping("/{weaponId}/{level}")
    public Result<WeaponLevelCost> get(@PathVariable String weaponId, @PathVariable Integer level) {
        var q = new LambdaQueryWrapper<WeaponLevelCost>()
                .eq(WeaponLevelCost::getWeaponId, weaponId)
                .eq(WeaponLevelCost::getLevel, level);
        return Result.success(mapper.selectOne(q));
    }

    @PostMapping
    public Result<WeaponLevelCost> create(@Valid @RequestBody WeaponLevelCost e) { return defaultCreate(e); }

    @PutMapping("/{weaponId}/{level}")
    public Result<WeaponLevelCost> update(@PathVariable String weaponId, @PathVariable Integer level,
                                           @Valid @RequestBody WeaponLevelCost e) {
        var q = new LambdaQueryWrapper<WeaponLevelCost>()
                .eq(WeaponLevelCost::getWeaponId, weaponId)
                .eq(WeaponLevelCost::getLevel, level);
        mapper.update(e, q);
        return Result.success(e);
    }

    @DeleteMapping("/{weaponId}/{level}")
    public Result<Void> delete(@PathVariable String weaponId, @PathVariable Integer level) {
        var q = new LambdaQueryWrapper<WeaponLevelCost>()
                .eq(WeaponLevelCost::getWeaponId, weaponId)
                .eq(WeaponLevelCost::getLevel, level);
        mapper.delete(q);
        return Result.success();
    }
}
