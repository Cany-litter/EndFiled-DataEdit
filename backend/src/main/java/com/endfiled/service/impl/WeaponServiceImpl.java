package com.endfiled.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.endfiled.mapper.WeaponMapper;
import com.endfiled.model.Weapon;
import com.endfiled.service.WeaponService;
import org.springframework.stereotype.Service;

@Service
public class WeaponServiceImpl extends ServiceImpl<WeaponMapper, Weapon> implements WeaponService {}
