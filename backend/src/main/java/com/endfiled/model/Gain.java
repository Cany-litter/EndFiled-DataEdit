package com.endfiled.model;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import javax.validation.constraints.NotBlank;

@Data
@TableName("gain")
public class Gain {
    @TableId
    private String id;
    @NotBlank
    private String name;
    private String source;
    private String gainType;
    private String effectCategory;
    private String effectType;
    private BigDecimal effectValue;
    private String valueType;
    private String stackRule;
    private String targetScope;
    private String targetCharId;
    private String triggerCondition;
    private BigDecimal duration;
    private Integer maxStacks;
    private String sourceType;
    private String sourceRefId;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
