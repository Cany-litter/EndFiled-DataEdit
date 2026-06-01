package com.endfiled.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.endfiled.common.PageResult;
import com.endfiled.common.Result;
import com.endfiled.mapper.EnemyMapper;
import com.endfiled.mapper.EnemyStatMapper;
import com.endfiled.model.Enemy;
import com.endfiled.model.EnemyStat;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/v1/enemies")
public class EnemyController extends BaseController<Enemy, EnemyMapper> {

    private final EnemyStatMapper enemyStatMapper;

    public EnemyController(EnemyMapper enemyMapper, EnemyStatMapper enemyStatMapper) {
        super(enemyMapper);
        this.enemyStatMapper = enemyStatMapper;
    }

    @GetMapping("/all")
    public Result<List<Enemy>> all() { return defaultAll(); }

    @GetMapping
    public Result<PageResult<Enemy>> list(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "20") Integer size) {
        var q = new LambdaQueryWrapper<Enemy>();
        if (name != null && !name.isEmpty()) q.like(Enemy::getName, name);
        if (category != null && !category.isEmpty()) q.eq(Enemy::getCategory, category);
        return defaultPage(new Page<>(page, size), q);
    }

    @GetMapping("/{id}")
    public Result<Enemy> get(@PathVariable String id) { return defaultGet(id); }

    @PostMapping
    public Result<Enemy> create(@Valid @RequestBody Enemy e) { return defaultCreate(e); }

    @PutMapping("/{id}")
    public Result<Enemy> update(@PathVariable String id, @Valid @RequestBody Enemy e) { return defaultUpdate(id, e); }

    @GetMapping("/{id}/stats")
    public Result<List<EnemyStat>> stats(@PathVariable String id) {
        return Result.success(enemyStatMapper.selectList(
                new LambdaQueryWrapper<EnemyStat>().eq(EnemyStat::getEnemyId, id)
                        .orderByAsc(EnemyStat::getLevel)));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable String id) { return defaultDelete(id); }
}
