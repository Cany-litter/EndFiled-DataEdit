package com.endfiled.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.endfiled.mapper.GainMapper;
import com.endfiled.model.Gain;
import com.endfiled.service.GainService;
import org.springframework.stereotype.Service;

@Service
public class GainServiceImpl extends ServiceImpl<GainMapper, Gain> implements GainService {}
