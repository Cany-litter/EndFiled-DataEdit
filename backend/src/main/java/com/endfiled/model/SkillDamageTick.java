package com.endfiled.model;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

@Data
@TableName("skill_damage_tick")
public class SkillDamageTick {
    @NotBlank
    private String skillId;
    @NotNull
    private Integer tickIndex;
    @NotNull
    private BigDecimal offset;
    private Integer stagger;
    private Integer sp;
    private String boundEffects;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
