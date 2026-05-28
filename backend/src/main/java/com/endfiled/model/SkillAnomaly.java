package com.endfiled.model;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

@Data
@TableName("skill_anomaly")
public class SkillAnomaly {
    @NotBlank
    private String skillId;
    @NotNull
    private Integer anomalyIndex;
    @NotNull
    private Integer groupIndex;
    @NotBlank
    private String type;
    private Integer stacks;
    private BigDecimal duration;
    private BigDecimal offset;
    private BigDecimal delay;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
