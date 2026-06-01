package com.endfiled.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.endfiled.common.PageResult;
import com.endfiled.common.Result;
import com.endfiled.mapper.CharacterVoiceMapper;
import com.endfiled.model.CharacterVoice;
import org.springframework.web.bind.annotation.*;
import javax.validation.Valid;

@RestController
@RequestMapping("/api/v1/character-voices")
public class CharacterVoiceController extends BaseController<CharacterVoice, CharacterVoiceMapper> {
    public CharacterVoiceController(CharacterVoiceMapper mapper) { super(mapper); }

    @GetMapping("/all")
    public Result<java.util.List<CharacterVoice>> all() { return defaultAll(); }

    @GetMapping
    public Result<PageResult<CharacterVoice>> list(
            @RequestParam(required = false) String characterId,
            @RequestParam(required = false) String language,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "50") Integer size) {
        var q = new LambdaQueryWrapper<CharacterVoice>().orderByAsc(CharacterVoice::getCategory);
        if (characterId != null) q.eq(CharacterVoice::getCharacterId, characterId);
        if (language != null) q.eq(CharacterVoice::getLanguage, language);
        return defaultPage(new Page<>(page, size), q);
    }

    @GetMapping("/{id}")
    public Result<CharacterVoice> get(@PathVariable String id) { return defaultGet(id); }

    @PostMapping
    public Result<CharacterVoice> create(@Valid @RequestBody CharacterVoice e) { return defaultCreate(e); }

    @PutMapping("/{id}")
    public Result<CharacterVoice> update(@PathVariable String id, @Valid @RequestBody CharacterVoice e) { return defaultUpdate(id, e); }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable String id) { return defaultDelete(id); }
}
