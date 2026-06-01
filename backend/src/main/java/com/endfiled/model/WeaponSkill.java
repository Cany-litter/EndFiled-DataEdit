package com.endfiled.model;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("weapon_skill")
public class WeaponSkill {
    @TableId
    private String id;
    private String weaponId;
    private String skillName;
    private Integer skillIndex;
    private Integer rankCurrent;
    private Integer rankMax;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
