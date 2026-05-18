package com.endfiled.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.endfiled.model.Equipment;
import com.endfiled.service.EquipmentService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/equipment")
@CrossOrigin
public class EquipmentController {
    private final EquipmentService equipmentService;
    public EquipmentController(EquipmentService equipmentService) { this.equipmentService = equipmentService; }

    @GetMapping
    public List<Equipment> list(@RequestParam(required = false) String setName) {
        if (setName != null && !setName.isEmpty()) {
            return equipmentService.list(new LambdaQueryWrapper<Equipment>()
                    .like(Equipment::getSetName, setName));
        }
        return equipmentService.list();
    }

    @GetMapping("/{id}")
    public Equipment get(@PathVariable String id) { return equipmentService.getById(id); }

    @PostMapping
    public Equipment create(@RequestBody Equipment e) { equipmentService.save(e); return e; }

    @PutMapping("/{id}")
    public Equipment update(@PathVariable String id, @RequestBody Equipment e) { e.setId(id); equipmentService.updateById(e); return e; }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) { equipmentService.removeById(id); }
}
