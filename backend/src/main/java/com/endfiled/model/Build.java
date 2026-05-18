package com.endfiled.model;

import com.baomidou.mybatisplus.annotation.*;
import java.time.LocalDateTime;

@TableName("build")
public class Build {
    @TableId
    private String id;
    private String name;
    private String characterId;
    private String weaponId;
    private String armorId;
    private String gloveId;
    private String accessory1Id;
    private String accessory2Id;
    private Integer charLevel;
    private Integer weaponLevel;
    private Integer equipLevel;
    private String reserve1;
    private String reserve2;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
