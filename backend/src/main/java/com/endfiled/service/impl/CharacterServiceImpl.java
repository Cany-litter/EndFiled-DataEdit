package com.endfiled.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.endfiled.mapper.CharacterMapper;
import com.endfiled.model.Character;
import com.endfiled.service.CharacterService;
import org.springframework.stereotype.Service;

@Service
public class CharacterServiceImpl extends ServiceImpl<CharacterMapper, Character> implements CharacterService {}
