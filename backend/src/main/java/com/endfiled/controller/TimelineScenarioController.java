package com.endfiled.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.endfiled.common.PageResult;
import com.endfiled.common.Result;
import com.endfiled.mapper.TimelineScenarioMapper;
import com.endfiled.model.TimelineScenario;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("/api/v1/timelines")
public class TimelineScenarioController extends BaseController<TimelineScenario, TimelineScenarioMapper> {
    public TimelineScenarioController(TimelineScenarioMapper timelineScenarioMapper) { super(timelineScenarioMapper); }

    @GetMapping("/all")
    public Result<java.util.List<TimelineScenario>> all() { return defaultAll(); }

    @GetMapping
    public Result<PageResult<TimelineScenario>> list(
            @RequestParam(required = false) String teamId,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "20") Integer size) {
        var q = new LambdaQueryWrapper<TimelineScenario>().orderByAsc(TimelineScenario::getSortOrder);
        if (teamId != null) q.eq(TimelineScenario::getTeamId, teamId);
        return defaultPage(new Page<>(page, size), q);
    }

    @GetMapping("/{id}")
    public Result<TimelineScenario> get(@PathVariable String id) { return defaultGet(id); }

    @PostMapping
    public Result<TimelineScenario> create(@Valid @RequestBody TimelineScenario t) { return defaultCreate(t); }

    @PutMapping("/{id}")
    public Result<TimelineScenario> update(@PathVariable String id, @Valid @RequestBody TimelineScenario t) { return defaultUpdate(id, t); }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable String id) { return defaultDelete(id); }
}
