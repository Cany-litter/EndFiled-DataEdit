package com.endfiled.common;

public class RelationInfo {
    private String table;
    private String label;
    private long count;

    public RelationInfo() {}

    public RelationInfo(String table, String label, long count) {
        this.table = table;
        this.label = label;
        this.count = count;
    }

    public String getTable() { return table; }
    public void setTable(String table) { this.table = table; }
    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }
    public long getCount() { return count; }
    public void setCount(long count) { this.count = count; }
}
