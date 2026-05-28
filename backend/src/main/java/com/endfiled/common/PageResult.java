package com.endfiled.common;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import java.util.List;

public class PageResult<T> {
    private List<T> items;
    private long total;
    private long page;
    private long size;
    private long pages;

    public PageResult() {}

    public PageResult(Page<T> page) {
        this.items = page.getRecords();
        this.total = page.getTotal();
        this.page = page.getCurrent();
        this.size = page.getSize();
        this.pages = page.getPages();
    }

    public List<T> getItems() { return items; }
    public void setItems(List<T> items) { this.items = items; }
    public long getTotal() { return total; }
    public void setTotal(long total) { this.total = total; }
    public long getPage() { return page; }
    public void setPage(long page) { this.page = page; }
    public long getSize() { return size; }
    public void setSize(long size) { this.size = size; }
    public long getPages() { return pages; }
    public void setPages(long pages) { this.pages = pages; }
}
