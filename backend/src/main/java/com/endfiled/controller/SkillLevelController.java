package com.endfiled.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.endfiled.model.SkillLevel;
import com.endfiled.service.SkillLevelService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/skill-levels")
@CrossOrigin
public class SkillLevelController {
    private final SkillLevelService skillLevelService;
    public SkillLevelController(SkillLevelService skillLevelService) { this.skillLevelService = skillLevelService; }

    @GetMapping
    public List<SkillLevel> list(@RequestParam(required = false) String skillId) {
        if (skillId != null) {
            return skillLevelService.list(new LambdaQueryWrapper<SkillLevel>()
                    .eq(SkillLevel::getSkillId, skillId).orderByAsc(SkillLevel::getLevel));
        }
        return skillLevelService.list();
    }
}
