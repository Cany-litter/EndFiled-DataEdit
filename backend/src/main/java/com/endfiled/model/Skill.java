package com.endfiled.model;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;
import javax.validation.constraints.NotBlank;

@Data
@TableName("skill")
public class Skill {
    @TableId
    private String id;
    @NotBlank
    private String characterId;
    @NotBlank
    private String name;
    private String type;
    private String damageType;
    private String description;
    private String reserve1;
    private String reserve2;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
