package com.endfiled.model;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("weapon")
public class Weapon {
    @TableId
    private String id;
    private String name;
    private String icon;
    private Integer rarity;
    private Integer potential;
    private String type;
    private Integer level;
    private BigDecimal baseAtk;
    private String affix1Name;
    private String affix1Type;
    private String affix1Size;
    private Integer affix1Level;
    private BigDecimal affix1Value;
    private String affix2Name;
    private String affix2Type;
    private String affix2Size;
    private Integer affix2Level;
    private BigDecimal affix2Value;
    private String affix3Name;
    private String affix3Type;
    private Integer affix3Level;
    private String affix3Effect1;
    private String affix3Effect2;
    private String affix3Effect3;
    private String affix3Desc;
    private String reserve1;
    private String reserve2;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
