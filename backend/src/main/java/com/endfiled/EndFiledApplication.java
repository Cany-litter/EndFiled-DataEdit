package com.endfiled;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.endfiled.mapper")
public class EndFiledApplication {
    public static void main(String[] args) {
        SpringApplication.run(EndFiledApplication.class, args);
    }
}
