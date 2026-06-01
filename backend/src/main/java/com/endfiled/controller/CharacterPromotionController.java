package com.endfiled.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.endfiled.common.PageResult;
import com.endfiled.common.Result;
import com.endfiled.mapper.CharacterPromotionMapper;
import com.endfiled.model.CharacterPromotion;
import org.springframework.web.bind.annotation.*;
import javax.validation.Valid;

@RestController
@RequestMapping("/api/v1/character-promotions")
public class CharacterPromotionController extends BaseController<CharacterPromotion, CharacterPromotionMapper> {
    public CharacterPromotionController(CharacterPromotionMapper mapper) { super(mapper); }

    @GetMapping("/all")
    public Result<java.util.List<CharacterPromotion>> all() { return defaultAll(); }

    @GetMapping
    public Result<PageResult<CharacterPromotion>> list(
            @RequestParam(required = false) String characterId,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "20") Integer size) {
        var q = new LambdaQueryWrapper<CharacterPromotion>().orderByAsc(CharacterPromotion::getEliteStage);
        if (characterId != null) q.eq(CharacterPromotion::getCharacterId, characterId);
        return defaultPage(new Page<>(page, size), q);
    }

    @GetMapping("/{id}")
    public Result<CharacterPromotion> get(@PathVariable String id) { return defaultGet(id); }

    @PostMapping
    public Result<CharacterPromotion> create(@Valid @RequestBody CharacterPromotion e) { return defaultCreate(e); }

    @PutMapping("/{id}")
    public Result<CharacterPromotion> update(@PathVariable String id, @Valid @RequestBody CharacterPromotion e) { return defaultUpdate(id, e); }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable String id) { return defaultDelete(id); }
}
