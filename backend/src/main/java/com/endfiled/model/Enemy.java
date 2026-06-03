package com.endfiled.model;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import javax.validation.constraints.NotBlank;

@Data
@TableName("enemy")
public class Enemy {
    @TableId
    @NotBlank
    private String id;
    @NotBlank
    private String name;
    private String category;
    private String tier;
    private Integer maxStagger;
    private Integer staggerNodeCount;
    private BigDecimal staggerNodeDuration;
    private BigDecimal staggerBreakDuration;
    private BigDecimal executionRecovery;
    private String description;
    private BigDecimal critRate;
    private BigDecimal critDamage;
    private BigDecimal attackRange;
    private Integer weight;
    private BigDecimal executionAtkMult;
    private String physicalResist;
    private String burnResist;
    private String electroResist;
    private String coldResist;
    private String natureResist;
    private Integer def;
    private String traits;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
