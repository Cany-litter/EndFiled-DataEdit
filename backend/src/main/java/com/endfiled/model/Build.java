package com.endfiled.model;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;
import javax.validation.constraints.NotBlank;

@Data
@TableName("build")
public class Build {
    @TableId
    private String id;
    @NotBlank
    private String name;
    @NotBlank
    private String characterId;
    private String weaponId;
    private String armorId;
    private String gloveId;
    private String accessory1Id;
    private String accessory2Id;
    private Integer charLevel;
    private Integer weaponLevel;
    private Integer equipLevel;
    private Integer affix1Level;
    private Integer affix2Level;
    private Integer affix3Level;
    private String equipRefines;
    private String selectedGains;
    private Integer charPotential;
    private Integer weaponPotential;
    private String reserve1;
    private String reserve2;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
