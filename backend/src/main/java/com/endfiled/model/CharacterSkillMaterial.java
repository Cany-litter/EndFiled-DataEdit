package com.endfiled.model;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("character_skill_material")
public class CharacterSkillMaterial {
    @TableId
    private String id;
    private String characterId;
    private String skillType;
    private Integer level;
    private String material1Id;
    private Integer material1Count;
    private String material2Id;
    private Integer material2Count;
    private BigDecimal goldCost;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
