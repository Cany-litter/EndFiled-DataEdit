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
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
