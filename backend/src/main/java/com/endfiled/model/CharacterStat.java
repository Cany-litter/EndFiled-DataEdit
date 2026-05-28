package com.endfiled.model;

import com.baomidou.mybatisplus.annotation.*;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

@Data
@TableName("character_stat")
public class CharacterStat {
    @NotBlank
    private String characterId;
    @NotNull
    private Integer level;
    private BigDecimal hp;
    private BigDecimal atk;
    private BigDecimal str;
    private BigDecimal agi;
    @TableField("`int`")
    @JsonProperty("int")
    private BigDecimal intel;
    private BigDecimal wil;
    private BigDecimal physDmgCoeff;
    private BigDecimal magicDmgCoeff;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
