package com.endfiled.model;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import javax.validation.constraints.NotBlank;

@Data
@TableName("weapon_affix")
public class WeaponAffix {
    @NotBlank
    private String weaponId;
    private Integer affixIndex;
    private Integer potential;
    private String name;
    private String type;
    private String size;
    private BigDecimal value;
    private String effect1;
    private String effect2;
    private String effect3;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
