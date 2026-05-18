package com.endfiled.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.endfiled.model.Build;
import com.endfiled.service.BuildService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/builds")
@CrossOrigin
public class BuildController {
    private final BuildService buildService;
    public BuildController(BuildService buildService) { this.buildService = buildService; }

    @GetMapping
    public List<Build> list(@RequestParam(required = false) String characterId) {
        if (characterId != null) {
            return buildService.list(new LambdaQueryWrapper<Build>()
                    .eq(Build::getCharacterId, characterId));
        }
        return buildService.list();
    }

    @GetMapping("/{id}")
    public Build get(@PathVariable String id) { return buildService.getById(id); }

    @PostMapping
    public Build create(@RequestBody Build b) { buildService.save(b); return b; }

    @PutMapping("/{id}")
    public Build update(@PathVariable String id, @RequestBody Build b) { b.setId(id); buildService.updateById(b); return b; }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) { buildService.removeById(id); }
}
