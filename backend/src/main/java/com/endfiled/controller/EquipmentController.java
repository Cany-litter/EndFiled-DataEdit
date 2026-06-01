package com.endfiled.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.UpdateWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.endfiled.common.PageResult;
import com.endfiled.common.RelationInfo;
import com.endfiled.common.Result;
import com.endfiled.mapper.BuildMapper;
import com.endfiled.mapper.EquipmentMapper;
import com.endfiled.model.Build;
import com.endfiled.model.Equipment;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/v1/equipment")
public class EquipmentController extends BaseController<Equipment, EquipmentMapper> {

    private final BuildMapper buildMapper;

    public EquipmentController(EquipmentMapper equipmentMapper, BuildMapper buildMapper) {
        super(equipmentMapper);
        this.buildMapper = buildMapper;
    }

    @GetMapping("/all")
    public Result<java.util.List<Equipment>> all() { return defaultAll(); }

    @GetMapping
    public Result<PageResult<Equipment>> list(
            @RequestParam(required = false) String setName,
            @RequestParam(required = false) String slot,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "20") Integer size) {
        var q = new LambdaQueryWrapper<Equipment>();
        if (setName != null && !setName.isEmpty()) q.like(Equipment::getSetName, setName);
        if (slot != null && !slot.isEmpty()) q.eq(Equipment::getSlot, slot);
        return defaultPage(new Page<>(page, size), q);
    }

    @GetMapping("/{id}")
    public Result<Equipment> get(@PathVariable String id) { return defaultGet(id); }

    @PostMapping
    public Result<Equipment> create(@Valid @RequestBody Equipment e) { return defaultCreate(e); }

    @PutMapping("/{id}")
    public Result<Equipment> update(@PathVariable String id, @Valid @RequestBody Equipment e) { return defaultUpdate(id, e); }

    @GetMapping("/{id}/relations")
    public Result<List<RelationInfo>> relations(@PathVariable String id) {
        List<RelationInfo> list = new ArrayList<>();
        long buildCount = buildMapper.selectCount(new LambdaQueryWrapper<Build>()
                .eq(Build::getArmorId, id)
                .or().eq(Build::getGloveId, id)
                .or().eq(Build::getAccessory1Id, id)
                .or().eq(Build::getAccessory2Id, id));
        if (buildCount > 0) list.add(new RelationInfo("build", "配装方案", buildCount));
        return Result.success(list);
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable String id,
                               @RequestParam(required = false, defaultValue = "false") boolean cascade) {
        if (cascade) {
            buildMapper.update(null, new UpdateWrapper<Build>()
                    .eq("armor_id", id).set("armor_id", null));
            buildMapper.update(null, new UpdateWrapper<Build>()
                    .eq("glove_id", id).set("glove_id", null));
            buildMapper.update(null, new UpdateWrapper<Build>()
                    .eq("accessory1_id", id).set("accessory1_id", null));
            buildMapper.update(null, new UpdateWrapper<Build>()
                    .eq("accessory2_id", id).set("accessory2_id", null));
        }
        return defaultDelete(id);
    }
}
