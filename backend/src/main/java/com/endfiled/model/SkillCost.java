package com.endfiled.model;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

@Data
@TableName("skill_cost")
public class SkillCost {
    @NotBlank
    private String skillId;
    @NotNull
    private Integer level;
    private Integer costValue;
    private BigDecimal coolDown;
    private Integer usp;
    private BigDecimal poise;
    private BigDecimal airborneScale;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
