package com.endfiled.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.endfiled.model.Skill;
import com.endfiled.service.SkillService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/skills")
@CrossOrigin
public class SkillController {
    private final SkillService skillService;
    public SkillController(SkillService skillService) { this.skillService = skillService; }

    @GetMapping
    public List<Skill> list(@RequestParam(required = false) String characterId) {
        if (characterId != null) {
            return skillService.list(new LambdaQueryWrapper<Skill>()
                    .eq(Skill::getCharacterId, characterId));
        }
        return skillService.list();
    }

    @GetMapping("/{id}")
    public Skill get(@PathVariable String id) { return skillService.getById(id); }

    @PostMapping
    public Skill create(@RequestBody Skill s) { skillService.save(s); return s; }

    @PutMapping("/{id}")
    public Skill update(@PathVariable String id, @RequestBody Skill s) { s.setId(id); skillService.updateById(s); return s; }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) { skillService.removeById(id); }
}
