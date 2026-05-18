package com.endfiled.model;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("gain")
public class Gain {
    @TableId
    private String id;
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
    private String reserve1;
    private String reserve2;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
