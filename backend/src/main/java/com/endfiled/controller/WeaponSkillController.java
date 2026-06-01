package com.endfiled.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.endfiled.common.PageResult;
import com.endfiled.common.Result;
import com.endfiled.mapper.WeaponSkillMapper;
import com.endfiled.model.WeaponSkill;
import org.springframework.web.bind.annotation.*;
import javax.validation.Valid;

@RestController
@RequestMapping("/api/v1/weapon-skills")
public class WeaponSkillController extends BaseController<WeaponSkill, WeaponSkillMapper> {
    public WeaponSkillController(WeaponSkillMapper mapper) { super(mapper); }

    @GetMapping("/all")
    public Result<java.util.List<WeaponSkill>> all() { return defaultAll(); }

    @GetMapping
    public Result<PageResult<WeaponSkill>> list(
            @RequestParam(required = false) String weaponId,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "20") Integer size) {
        var q = new LambdaQueryWrapper<WeaponSkill>().orderByAsc(WeaponSkill::getSkillIndex);
        if (weaponId != null) q.eq(WeaponSkill::getWeaponId, weaponId);
        return defaultPage(new Page<>(page, size), q);
    }

    @GetMapping("/{id}")
    public Result<WeaponSkill> get(@PathVariable String id) { return defaultGet(id); }

    @PostMapping
    public Result<WeaponSkill> create(@Valid @RequestBody WeaponSkill e) { return defaultCreate(e); }

    @PutMapping("/{id}")
    public Result<WeaponSkill> update(@PathVariable String id, @Valid @RequestBody WeaponSkill e) { return defaultUpdate(id, e); }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable String id) { return defaultDelete(id); }
}
