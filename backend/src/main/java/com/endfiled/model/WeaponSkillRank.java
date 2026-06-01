package com.endfiled.model;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("weapon_skill_rank")
public class WeaponSkillRank {
    @TableId
    private String id;
    private String weaponSkillId;
    private Integer rankLevel;
    private String valueDesc;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
