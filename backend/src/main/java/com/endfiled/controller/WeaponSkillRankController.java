package com.endfiled.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.endfiled.common.PageResult;
import com.endfiled.common.Result;
import com.endfiled.mapper.WeaponSkillRankMapper;
import com.endfiled.model.WeaponSkillRank;
import org.springframework.web.bind.annotation.*;
import javax.validation.Valid;

@RestController
@RequestMapping("/api/v1/weapon-skill-ranks")
public class WeaponSkillRankController extends BaseController<WeaponSkillRank, WeaponSkillRankMapper> {
    public WeaponSkillRankController(WeaponSkillRankMapper mapper) { super(mapper); }

    @GetMapping("/all")
    public Result<java.util.List<WeaponSkillRank>> all() { return defaultAll(); }

    @GetMapping
    public Result<PageResult<WeaponSkillRank>> list(
            @RequestParam(required = false) String weaponSkillId,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "20") Integer size) {
        var q = new LambdaQueryWrapper<WeaponSkillRank>().orderByAsc(WeaponSkillRank::getRankLevel);
        if (weaponSkillId != null) q.eq(WeaponSkillRank::getWeaponSkillId, weaponSkillId);
        return defaultPage(new Page<>(page, size), q);
    }

    @GetMapping("/{id}")
    public Result<WeaponSkillRank> get(@PathVariable String id) { return defaultGet(id); }

    @PostMapping
    public Result<WeaponSkillRank> create(@Valid @RequestBody WeaponSkillRank e) { return defaultCreate(e); }

    @PutMapping("/{id}")
    public Result<WeaponSkillRank> update(@PathVariable String id, @Valid @RequestBody WeaponSkillRank e) { return defaultUpdate(id, e); }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable String id) { return defaultDelete(id); }
}
