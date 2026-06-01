package com.endfiled.model;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("character_recommended_weapon")
public class CharacterRecommendedWeapon {
    @TableId
    private String id;
    private String characterId;
    private String weaponId;
    private String weaponName;
    private String recommendType;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
