package io.github.acosentini.dms.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;

@RestController
@RequestMapping("/hello")
@CrossOrigin(origins = "*", maxAge = 3600)
public class HelloController {
    
    @GetMapping
    public String hello() {
        return "Hello from DMS Backend!!";
    }
} 