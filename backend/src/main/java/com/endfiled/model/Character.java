package com.endfiled.model;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("`character`")
public class Character {
    @TableId
    private String id;
    private String name;
    private String icon;
    private Integer rarity;
    private Integer level;
    private BigDecimal baseHp;
    private BigDecimal baseAtk;
    private BigDecimal baseStr;
    private BigDecimal baseAgi;
    private BigDecimal baseInt;
    private BigDecimal baseWil;
    private String mainAttr;
    private String subAttr;
    private String profession;
    private String element;
    private String weaponType;
    private Integer potential;
    private Integer trustTalent;
    private String reserve1;
    private String reserve2;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
