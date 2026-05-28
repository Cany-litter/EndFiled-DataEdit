package com.endfiled.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.endfiled.common.PageResult;
import com.endfiled.common.Result;
import com.endfiled.mapper.TeamMapper;
import com.endfiled.model.Team;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("/api/v1/teams")
public class TeamController extends BaseController<Team, TeamMapper> {
    public TeamController(TeamMapper teamMapper) { super(teamMapper); }

    @GetMapping("/all")
    public Result<java.util.List<Team>> all() { return defaultAll(); }

    @GetMapping
    public Result<PageResult<Team>> list(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "20") Integer size) {
        return defaultPage(new Page<>(page, size), null);
    }

    @GetMapping("/{id}")
    public Result<Team> get(@PathVariable String id) { return defaultGet(id); }

    @PostMapping
    public Result<Team> create(@Valid @RequestBody Team t) { return defaultCreate(t); }

    @PutMapping("/{id}")
    public Result<Team> update(@PathVariable String id, @Valid @RequestBody Team t) { return defaultUpdate(id, t); }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable String id) { return defaultDelete(id); }
}
