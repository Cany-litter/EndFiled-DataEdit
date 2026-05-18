package com.endfiled.model;

import com.baomidou.mybatisplus.annotation.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@TableName("equipment")
public class Equipment {
    @TableId
    private String id;
    private String name;
    private String icon;
    private String slot;
    private Integer level;
    private Integer baseDef;
    private String setName;
    private String attr1Type;
    private Integer attr1Refine;
    private BigDecimal attr1Value;
    private BigDecimal attr1V1;
    private BigDecimal attr1V2;
    private BigDecimal attr1V3;
    private String attr2Type;
    private Integer attr2Refine;
    private BigDecimal attr2Value;
    private BigDecimal attr2V1;
    private BigDecimal attr2V2;
    private BigDecimal attr2V3;
    private String attr3Type;
    private Integer attr3Refine;
    private BigDecimal attr3Value;
    private BigDecimal attr3V1;
    private BigDecimal attr3V2;
    private BigDecimal attr3V3;
    private String setEffect1Name;
    private String setEffect1Type;
    private String setEffect1Etype;
    private BigDecimal setEffect1Value;
    private String setEffect1Desc;
    private String setEffect2Name;
    private String setEffect2Type;
    private String setEffect2Etype;
    private BigDecimal setEffect2Value;
    private String setEffect2Condition;
    private BigDecimal setEffect2Duration;
    private String setEffect2Desc;
    private String reserve1;
    private String reserve2;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
