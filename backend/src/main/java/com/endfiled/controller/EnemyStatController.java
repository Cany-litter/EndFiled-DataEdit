package com.endfiled.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.endfiled.common.PageResult;
import com.endfiled.common.Result;
import com.endfiled.mapper.EnemyStatMapper;
import com.endfiled.model.EnemyStat;
import org.springframework.web.bind.annotation.*;
import javax.validation.Valid;

@RestController
@RequestMapping("/api/v1/enemy-stats")
public class EnemyStatController extends BaseController<EnemyStat, EnemyStatMapper> {
    public EnemyStatController(EnemyStatMapper mapper) { super(mapper); }

    @GetMapping("/all")
    public Result<java.util.List<EnemyStat>> all() { return defaultAll(); }

    @GetMapping
    public Result<PageResult<EnemyStat>> list(
            @RequestParam(required = false) String enemyId,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "100") Integer size) {
        var q = new LambdaQueryWrapper<EnemyStat>().orderByAsc(EnemyStat::getLevel);
        if (enemyId != null) q.eq(EnemyStat::getEnemyId, enemyId);
        return defaultPage(new Page<>(page, size), q);
    }

    @PostMapping
    public Result<EnemyStat> create(@Valid @RequestBody EnemyStat e) { return defaultCreate(e); }

    @PutMapping("/{enemyId}/{level}")
    public Result<EnemyStat> update(@PathVariable String enemyId, @PathVariable Integer level, @Valid @RequestBody EnemyStat e) {
        var q = new LambdaQueryWrapper<EnemyStat>().eq(EnemyStat::getEnemyId, enemyId).eq(EnemyStat::getLevel, level);
        mapper.update(e, q);
        return Result.success(e);
    }

    @DeleteMapping("/{enemyId}/{level}")
    public Result<Void> delete(@PathVariable String enemyId, @PathVariable Integer level) {
        mapper.delete(new LambdaQueryWrapper<EnemyStat>().eq(EnemyStat::getEnemyId, enemyId).eq(EnemyStat::getLevel, level));
        return Result.success();
    }
}
