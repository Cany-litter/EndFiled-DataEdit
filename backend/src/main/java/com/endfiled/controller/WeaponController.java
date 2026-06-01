package com.endfiled.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.UpdateWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.endfiled.common.PageResult;
import com.endfiled.common.RelationInfo;
import com.endfiled.common.Result;
import com.endfiled.mapper.BuildMapper;
import com.endfiled.mapper.WeaponAscensionMapper;
import com.endfiled.mapper.WeaponLevelCostMapper;
import com.endfiled.mapper.WeaponMapper;
import com.endfiled.model.Build;
import com.endfiled.model.Weapon;
import com.endfiled.model.WeaponAscension;
import com.endfiled.model.WeaponLevelCost;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/v1/weapons")
public class WeaponController extends BaseController<Weapon, WeaponMapper> {

    private final BuildMapper buildMapper;
    private final WeaponLevelCostMapper levelCostMapper;
    private final WeaponAscensionMapper ascensionMapper;

    public WeaponController(WeaponMapper weaponMapper, BuildMapper buildMapper,
                            WeaponLevelCostMapper levelCostMapper, WeaponAscensionMapper ascensionMapper) {
        super(weaponMapper);
        this.buildMapper = buildMapper;
        this.levelCostMapper = levelCostMapper;
        this.ascensionMapper = ascensionMapper;
    }

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

    @GetMapping("/{id}/relations")
    public Result<List<RelationInfo>> relations(@PathVariable String id) {
        List<RelationInfo> list = new ArrayList<>();
        long buildCount = buildMapper.selectCount(new LambdaQueryWrapper<Build>().eq(Build::getWeaponId, id));
        if (buildCount > 0) list.add(new RelationInfo("build", "配装方案", buildCount));
        return Result.success(list);
    }

    // ---- 子表查询端点 ----
    @GetMapping("/{id}/level-costs")
    public Result<List<WeaponLevelCost>> levelCosts(@PathVariable String id) {
        return Result.success(levelCostMapper.selectList(
                new LambdaQueryWrapper<WeaponLevelCost>().eq(WeaponLevelCost::getWeaponId, id)
                        .orderByAsc(WeaponLevelCost::getLevel)));
    }

    @GetMapping("/{id}/ascensions")
    public Result<List<WeaponAscension>> ascensions(@PathVariable String id) {
        return Result.success(ascensionMapper.selectList(
                new LambdaQueryWrapper<WeaponAscension>().eq(WeaponAscension::getWeaponId, id)
                        .orderByAsc(WeaponAscension::getPhase)));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable String id,
                               @RequestParam(required = false, defaultValue = "false") boolean cascade) {
        if (cascade) {
            buildMapper.update(null, new UpdateWrapper<Build>()
                    .eq("weapon_id", id).set("weapon_id", null));
            levelCostMapper.delete(new LambdaQueryWrapper<WeaponLevelCost>().eq(WeaponLevelCost::getWeaponId, id));
            ascensionMapper.delete(new LambdaQueryWrapper<WeaponAscension>().eq(WeaponAscension::getWeaponId, id));
        }
        return defaultDelete(id);
    }
}
