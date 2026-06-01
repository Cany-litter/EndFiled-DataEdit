package com.endfiled.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.endfiled.common.PageResult;
import com.endfiled.common.Result;
import com.endfiled.mapper.CharacterSkillMaterialMapper;
import com.endfiled.model.CharacterSkillMaterial;
import org.springframework.web.bind.annotation.*;
import javax.validation.Valid;

@RestController
@RequestMapping("/api/v1/character-skill-materials")
public class CharacterSkillMaterialController extends BaseController<CharacterSkillMaterial, CharacterSkillMaterialMapper> {
    public CharacterSkillMaterialController(CharacterSkillMaterialMapper mapper) { super(mapper); }

    @GetMapping("/all")
    public Result<java.util.List<CharacterSkillMaterial>> all() { return defaultAll(); }

    @GetMapping
    public Result<PageResult<CharacterSkillMaterial>> list(
            @RequestParam(required = false) String characterId,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "20") Integer size) {
        var q = new LambdaQueryWrapper<CharacterSkillMaterial>();
        if (characterId != null) q.eq(CharacterSkillMaterial::getCharacterId, characterId);
        return defaultPage(new Page<>(page, size), q);
    }

    @GetMapping("/{id}")
    public Result<CharacterSkillMaterial> get(@PathVariable String id) { return defaultGet(id); }

    @PostMapping
    public Result<CharacterSkillMaterial> create(@Valid @RequestBody CharacterSkillMaterial e) { return defaultCreate(e); }

    @PutMapping("/{id}")
    public Result<CharacterSkillMaterial> update(@PathVariable String id, @Valid @RequestBody CharacterSkillMaterial e) { return defaultUpdate(id, e); }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable String id) { return defaultDelete(id); }
}
