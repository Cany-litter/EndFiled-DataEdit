package com.endfiled.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.endfiled.mapper.SkillLevelMapper;
import com.endfiled.model.SkillLevel;
import com.endfiled.service.SkillLevelService;
import org.springframework.stereotype.Service;

@Service
public class SkillLevelServiceImpl extends ServiceImpl<SkillLevelMapper, SkillLevel> implements SkillLevelService {}
