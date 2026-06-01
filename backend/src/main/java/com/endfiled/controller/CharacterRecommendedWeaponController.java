package com.endfiled.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.endfiled.common.PageResult;
import com.endfiled.common.Result;
import com.endfiled.mapper.CharacterRecommendedWeaponMapper;
import com.endfiled.model.CharacterRecommendedWeapon;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/character-recommended-weapons")
public class CharacterRecommendedWeaponController extends BaseController<CharacterRecommendedWeapon, CharacterRecommendedWeaponMapper> {
    public CharacterRecommendedWeaponController(CharacterRecommendedWeaponMapper mapper) { super(mapper); }

    @GetMapping("/all")
    public Result<java.util.List<CharacterRecommendedWeapon>> all() { return defaultAll(); }

    @GetMapping
    public Result<PageResult<CharacterRecommendedWeapon>> list(
            @RequestParam(required = false) String characterId,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "20") Integer size) {
        var q = new LambdaQueryWrapper<CharacterRecommendedWeapon>();
        if (characterId != null) q.eq(CharacterRecommendedWeapon::getCharacterId, characterId);
        return defaultPage(new Page<>(page, size), q);
    }

    @GetMapping("/{id}")
    public Result<CharacterRecommendedWeapon> get(@PathVariable String id) { return defaultGet(id); }
}
