package com.endfiled.model;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;
import javax.validation.constraints.NotBlank;

@Data
@TableName("modifier_def")
public class ModifierDef {
    @TableId
    @NotBlank
    private String id;
    @NotBlank
    private String label;
    private String unit;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
