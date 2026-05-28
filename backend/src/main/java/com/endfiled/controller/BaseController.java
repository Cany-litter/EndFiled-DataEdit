package com.endfiled.controller;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.endfiled.common.PageResult;
import com.endfiled.common.Result;
import java.util.List;

public abstract class BaseController<T, M extends BaseMapper<T>> {

    protected final M mapper;

    public BaseController(M mapper) {
        this.mapper = mapper;
    }

    protected Result<List<T>> defaultAll() {
        return Result.success(mapper.selectList(null));
    }

    protected Result<PageResult<T>> defaultPage(Page<T> page, Wrapper<T> wrapper) {
        return Result.success(new PageResult<>(mapper.selectPage(page, wrapper)));
    }

    protected Result<T> defaultGet(String id) {
        return Result.success(mapper.selectById(id));
    }

    protected Result<T> defaultCreate(T entity) {
        mapper.insert(entity);
        return Result.success(entity);
    }

    protected Result<T> defaultUpdate(String id, T entity) {
        setId(entity, id);
        mapper.updateById(entity);
        return Result.success(entity);
    }

    protected Result<Void> defaultDelete(String id) {
        mapper.deleteById(id);
        return Result.success();
    }

    @SuppressWarnings("unchecked")
    private void setId(T entity, String id) {
        try {
            entity.getClass().getMethod("setId", String.class).invoke(entity, id);
        } catch (Exception e) {
            throw new IllegalArgumentException("Entity must have setId(String)", e);
        }
    }
}
