package com.endfiled.model;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;
import javax.validation.constraints.NotBlank;

@Data
@TableName("character_talent")
public class CharacterTalent {
    @TableId
    private String id;
    @NotBlank
    private String characterId;
    private String name;
    private Integer talentIndex;
    private Integer stage;
    private String description;
    private String values;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
