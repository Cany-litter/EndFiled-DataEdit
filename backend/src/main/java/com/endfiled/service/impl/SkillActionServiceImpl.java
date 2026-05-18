package com.endfiled.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.endfiled.mapper.SkillActionMapper;
import com.endfiled.model.SkillAction;
import com.endfiled.service.SkillActionService;
import org.springframework.stereotype.Service;

@Service
public class SkillActionServiceImpl extends ServiceImpl<SkillActionMapper, SkillAction> implements SkillActionService {}
