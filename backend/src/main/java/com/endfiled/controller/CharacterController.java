package com.endfiled.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.UpdateWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.endfiled.common.PageResult;
import com.endfiled.common.RelationInfo;
import com.endfiled.common.Result;
import com.endfiled.mapper.*;
import com.endfiled.model.*;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/v1/characters")
public class CharacterController extends BaseController<GameCharacter, CharacterMapper> {

    private final SkillMapper skillMapper;
    private final SkillLevelMapper skillLevelMapper;
    private final SkillActionMapper skillActionMapper;
    private final BuildMapper buildMapper;
    private final CharacterArchiveMapper archiveMapper;
    private final CharacterVoiceMapper voiceMapper;
    private final CharacterPotentialMapper potentialMapper;
    private final CharacterPromotionMapper promotionMapper;
    private final CharacterLogisticsMapper logisticsMapper;
    private final CharacterProfileMapper profileMapper;

    public CharacterController(CharacterMapper characterMapper,
                               SkillMapper skillMapper,
                               SkillLevelMapper skillLevelMapper,
                               SkillActionMapper skillActionMapper,
                               BuildMapper buildMapper,
                               CharacterArchiveMapper archiveMapper,
                               CharacterVoiceMapper voiceMapper,
                               CharacterPotentialMapper potentialMapper,
                               CharacterPromotionMapper promotionMapper,
                               CharacterLogisticsMapper logisticsMapper,
                               CharacterProfileMapper profileMapper) {
        super(characterMapper);
        this.skillMapper = skillMapper;
        this.skillLevelMapper = skillLevelMapper;
        this.skillActionMapper = skillActionMapper;
        this.buildMapper = buildMapper;
        this.archiveMapper = archiveMapper;
        this.voiceMapper = voiceMapper;
        this.potentialMapper = potentialMapper;
        this.promotionMapper = promotionMapper;
        this.logisticsMapper = logisticsMapper;
        this.profileMapper = profileMapper;
    }

    @GetMapping("/all")
    public Result<java.util.List<GameCharacter>> all() { return defaultAll(); }

    @GetMapping
    public Result<PageResult<GameCharacter>> list(
            @RequestParam(required = false) String name,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "20") Integer size) {
        var q = new LambdaQueryWrapper<GameCharacter>();
        if (name != null && !name.isEmpty()) q.like(GameCharacter::getName, name);
        return defaultPage(new Page<>(page, size), q);
    }

    @GetMapping("/{id}")
    public Result<GameCharacter> get(@PathVariable String id) { return defaultGet(id); }

    @PostMapping
    public Result<GameCharacter> create(@Valid @RequestBody GameCharacter c) { return defaultCreate(c); }

    @PutMapping("/{id}")
    public Result<GameCharacter> update(@PathVariable String id, @Valid @RequestBody GameCharacter c) { return defaultUpdate(id, c); }

    @GetMapping("/{id}/relations")
    public Result<List<RelationInfo>> relations(@PathVariable String id) {
        List<RelationInfo> list = new ArrayList<>();
        long skillCount = skillMapper.selectCount(new LambdaQueryWrapper<Skill>().eq(Skill::getCharacterId, id));
        if (skillCount > 0) list.add(new RelationInfo("skill", "技能", skillCount));
        long buildCount = buildMapper.selectCount(new LambdaQueryWrapper<Build>().eq(Build::getCharacterId, id));
        if (buildCount > 0) list.add(new RelationInfo("build", "配装方案", buildCount));
        return Result.success(list);
    }

    // ---- 子表查询端点 ----
    @GetMapping("/{id}/archives")
    public Result<List<CharacterArchive>> archives(@PathVariable String id) {
        return Result.success(archiveMapper.selectList(
                new LambdaQueryWrapper<CharacterArchive>().eq(CharacterArchive::getCharacterId, id)
                        .orderByAsc(CharacterArchive::getArchiveIndex)));
    }

    @GetMapping("/{id}/voices")
    public Result<List<CharacterVoice>> voices(@PathVariable String id) {
        return Result.success(voiceMapper.selectList(
                new LambdaQueryWrapper<CharacterVoice>().eq(CharacterVoice::getCharacterId, id)));
    }

    @GetMapping("/{id}/potentials")
    public Result<List<CharacterPotential>> potentials(@PathVariable String id) {
        return Result.success(potentialMapper.selectList(
                new LambdaQueryWrapper<CharacterPotential>().eq(CharacterPotential::getCharacterId, id)
                        .orderByAsc(CharacterPotential::getPotentialIndex)));
    }

    @GetMapping("/{id}/promotions")
    public Result<List<CharacterPromotion>> promotions(@PathVariable String id) {
        return Result.success(promotionMapper.selectList(
                new LambdaQueryWrapper<CharacterPromotion>().eq(CharacterPromotion::getCharacterId, id)
                        .orderByAsc(CharacterPromotion::getEliteStage)));
    }

    @GetMapping("/{id}/logistics")
    public Result<List<CharacterLogistics>> logistics(@PathVariable String id) {
        return Result.success(logisticsMapper.selectList(
                new LambdaQueryWrapper<CharacterLogistics>().eq(CharacterLogistics::getCharacterId, id)));
    }

    @GetMapping("/{id}/profiles")
    public Result<List<CharacterProfile>> profiles(@PathVariable String id) {
        return Result.success(profileMapper.selectList(
                new LambdaQueryWrapper<CharacterProfile>().eq(CharacterProfile::getCharacterId, id)));
    }

    @Transactional
    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable String id,
                               @RequestParam(required = false, defaultValue = "false") boolean cascade) {
        if (cascade) {
            List<Skill> skills = skillMapper.selectList(new LambdaQueryWrapper<Skill>().eq(Skill::getCharacterId, id));
            for (Skill sk : skills) {
                skillActionMapper.deleteById(sk.getId());
                skillLevelMapper.delete(new LambdaQueryWrapper<SkillLevel>().eq(SkillLevel::getSkillId, sk.getId()));
                skillMapper.deleteById(sk.getId());
            }
            buildMapper.delete(new LambdaQueryWrapper<Build>().eq(Build::getCharacterId, id));
            archiveMapper.delete(new LambdaQueryWrapper<CharacterArchive>().eq(CharacterArchive::getCharacterId, id));
            voiceMapper.delete(new LambdaQueryWrapper<CharacterVoice>().eq(CharacterVoice::getCharacterId, id));
            potentialMapper.delete(new LambdaQueryWrapper<CharacterPotential>().eq(CharacterPotential::getCharacterId, id));
            promotionMapper.delete(new LambdaQueryWrapper<CharacterPromotion>().eq(CharacterPromotion::getCharacterId, id));
            logisticsMapper.delete(new LambdaQueryWrapper<CharacterLogistics>().eq(CharacterLogistics::getCharacterId, id));
            profileMapper.delete(new LambdaQueryWrapper<CharacterProfile>().eq(CharacterProfile::getCharacterId, id));
        }
        return defaultDelete(id);
    }
}
