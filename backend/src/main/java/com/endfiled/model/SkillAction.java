package com.endfiled.model;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import javax.validation.constraints.NotBlank;

@Data
@TableName("skill_action")
public class SkillAction {
    @TableId
    @NotBlank
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
    private BigDecimal duration;
    private Integer spCost;
    private BigDecimal gaugeGain;
    private BigDecimal teamGaugeGain;
    private BigDecimal cooldown;
    private String allowedTypes;
    private Integer ultimateGaugeMax;
    private Integer ultimateGaugeReply;
    private String damageTicks;
    private String reserve1;
    private String reserve2;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
