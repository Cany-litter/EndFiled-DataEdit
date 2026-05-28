package com.endfiled.model;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

@Data
@TableName("attack_segment")
public class AttackSegment {
    @NotBlank
    private String characterId;
    @NotNull
    private Integer segmentIndex;
    @NotNull
    private BigDecimal duration;
    private BigDecimal gaugeGain;
    private String allowedTypes;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
