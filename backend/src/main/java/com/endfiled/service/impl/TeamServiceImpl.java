package com.endfiled.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.endfiled.mapper.TeamMapper;
import com.endfiled.model.Team;
import com.endfiled.service.TeamService;
import org.springframework.stereotype.Service;

@Service
public class TeamServiceImpl extends ServiceImpl<TeamMapper, Team> implements TeamService {}
