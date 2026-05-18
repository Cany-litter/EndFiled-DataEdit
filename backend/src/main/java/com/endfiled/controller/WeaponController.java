package com.endfiled.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.endfiled.model.Weapon;
import com.endfiled.service.WeaponService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/weapons")
@CrossOrigin
public class WeaponController {
    private final WeaponService weaponService;
    public WeaponController(WeaponService weaponService) { this.weaponService = weaponService; }

    @GetMapping
    public List<Weapon> list(@RequestParam(required = false) String name,
                             @RequestParam(required = false) String type) {
        var q = new LambdaQueryWrapper<Weapon>();
        if (name != null && !name.isEmpty()) q.like(Weapon::getName, name);
        if (type != null && !type.isEmpty()) q.eq(Weapon::getType, type);
        return weaponService.list(q);
    }

    @GetMapping("/{id}")
    public Weapon get(@PathVariable String id) { return weaponService.getById(id); }

    @PostMapping
    public Weapon create(@RequestBody Weapon w) { weaponService.save(w); return w; }

    @PutMapping("/{id}")
    public Weapon update(@PathVariable String id, @RequestBody Weapon w) { w.setId(id); weaponService.updateById(w); return w; }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) { weaponService.removeById(id); }
}
