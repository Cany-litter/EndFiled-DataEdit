package com.endfiled.model;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;
import javax.validation.constraints.NotBlank;

@Data
@TableName("team")
public class Team {
    @TableId
    private String id;
    @NotBlank
    private String name;
    private String charAId;
    private String buildAId;
    private String charBId;
    private String buildBId;
    private String charCId;
    private String buildCId;
    private String charDId;
    private String buildDId;
    private String reserve1;
    private String reserve2;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}
