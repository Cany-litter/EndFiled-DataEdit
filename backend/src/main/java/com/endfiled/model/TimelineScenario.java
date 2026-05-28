package com.endfiled.model;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;
import javax.validation.constraints.NotBlank;

@Data
@TableName("timeline_scenario")
public class TimelineScenario {
    @TableId
    private String id;
    @NotBlank
    private String name;
    private String teamId;
    private String systemConstants;
    private Double prepDuration;
    private String activeEnemyId;
    private String customEnemyParams;
    private String tracks;
    private String enemies;
    private Integer sortOrder;
    private String enemyBuffs;
    private String reserve2;
    private String reserve3;
    private String reserve4;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
