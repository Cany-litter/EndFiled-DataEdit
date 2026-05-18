package com.endfiled.model;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("skill_action")
public class SkillAction {
    @TableId
    private String skillId;
    private BigDecimal castTime;
    private BigDecimal preCast;
    private BigDecimal postCast;
    private Integer techCost;
    private Integer techReturn;
    private Integer techRegen;
    private BigDecimal chainCd;
    private BigDecimal ultimateCd;
    private Integer energyRegenSelf;
    private String energyRegenCond;
    private String applyAttachment;
    private Integer applyBreak;
    private String consumeAttachment;
    private Integer consumeBreak;
    private String chainTrigger;
    private String reserve1;
    private String reserve2;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
