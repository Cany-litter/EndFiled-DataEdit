package com.endfiled.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.endfiled.mapper.BuildMapper;
import com.endfiled.model.Build;
import com.endfiled.service.BuildService;
import org.springframework.stereotype.Service;

@Service
public class BuildServiceImpl extends ServiceImpl<BuildMapper, Build> implements BuildService {}
