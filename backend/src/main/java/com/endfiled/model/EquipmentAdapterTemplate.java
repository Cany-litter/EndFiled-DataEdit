package com.endfiled.model;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

@Data
@TableName("equipment_adapter_template")
public class EquipmentAdapterTemplate {
    @NotBlank
    private String modifierId;
    @NotBlank
    private String slot;
    @NotBlank
    private String config;
    @NotNull
    private Integer refine;
    @NotNull
    private BigDecimal value;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
