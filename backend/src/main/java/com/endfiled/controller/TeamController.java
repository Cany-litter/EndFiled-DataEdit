package com.endfiled.controller;

import com.endfiled.model.Team;
import com.endfiled.service.TeamService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/teams")
@CrossOrigin
public class TeamController {
    private final TeamService teamService;
    public TeamController(TeamService teamService) { this.teamService = teamService; }

    @GetMapping
    public List<Team> list() { return teamService.list(); }

    @GetMapping("/{id}")
    public Team get(@PathVariable String id) { return teamService.getById(id); }

    @PostMapping
    public Team create(@RequestBody Team t) { teamService.save(t); return t; }

    @PutMapping("/{id}")
    public Team update(@PathVariable String id, @RequestBody Team t) { t.setId(id); teamService.updateById(t); return t; }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) { teamService.removeById(id); }
}
