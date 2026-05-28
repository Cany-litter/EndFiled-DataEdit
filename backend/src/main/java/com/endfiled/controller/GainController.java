package com.endfiled.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.endfiled.common.PageResult;
import com.endfiled.common.Result;
import com.endfiled.mapper.GainMapper;
import com.endfiled.model.Gain;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("/api/v1/gains")
public class GainController extends BaseController<Gain, GainMapper> {
    public GainController(GainMapper gainMapper) { super(gainMapper); }

    @GetMapping("/all")
    public Result<java.util.List<Gain>> all(
            @RequestParam(required = false) String gainType) {
        if (gainType != null) {
            var q = new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<Gain>();
            q.eq(Gain::getGainType, gainType);
            return Result.success(mapper.selectList(q));
        }
        return defaultAll();
    }

    @GetMapping
    public Result<PageResult<Gain>> list(
            @RequestParam(required = false) String gainType,
            @RequestParam(required = false) String effectCategory,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "20") Integer size) {
        var q = new LambdaQueryWrapper<Gain>();
        if (gainType != null) q.eq(Gain::getGainType, gainType);
        if (effectCategory != null) q.eq(Gain::getEffectCategory, effectCategory);
        return defaultPage(new Page<>(page, size), q);
    }

    @GetMapping("/{id}")
    public Result<Gain> get(@PathVariable String id) { return defaultGet(id); }

    @PostMapping
    public Result<Gain> create(@Valid @RequestBody Gain g) { return defaultCreate(g); }

    @PutMapping("/{id}")
    public Result<Gain> update(@PathVariable String id, @Valid @RequestBody Gain g) { return defaultUpdate(id, g); }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable String id) { return defaultDelete(id); }
}
