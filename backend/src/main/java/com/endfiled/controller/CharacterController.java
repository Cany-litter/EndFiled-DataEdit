package com.endfiled.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.endfiled.model.Character;
import com.endfiled.service.CharacterService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/characters")
@CrossOrigin
public class CharacterController {
    private final CharacterService characterService;
    public CharacterController(CharacterService characterService) { this.characterService = characterService; }

    @GetMapping
    public List<Character> list(@RequestParam(required = false) String name) {
        if (name != null && !name.isEmpty()) {
            return characterService.list(new LambdaQueryWrapper<Character>()
                    .like(Character::getName, name));
        }
        return characterService.list();
    }

    @GetMapping("/{id}")
    public Character get(@PathVariable String id) { return characterService.getById(id); }

    @PostMapping
    public Character create(@RequestBody Character c) { characterService.save(c); return c; }

    @PutMapping("/{id}")
    public Character update(@PathVariable String id, @RequestBody Character c) { c.setId(id); characterService.updateById(c); return c; }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) { characterService.removeById(id); }
}
