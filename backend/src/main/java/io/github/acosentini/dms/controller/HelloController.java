package io.github.acosentini.dms.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;
@RestController
@CrossOrigin(origins = "*", maxAge = 3600)
public class HelloController {
    
    @GetMapping("/hello")
    public String hello() {
        return "Hello from DMS Backend!!";
    }
} 