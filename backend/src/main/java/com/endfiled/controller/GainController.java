package com.endfiled.controller;

import com.endfiled.model.Gain;
import com.endfiled.service.GainService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/gains")
@CrossOrigin
public class GainController {
    private final GainService gainService;
    public GainController(GainService gainService) { this.gainService = gainService; }

    @GetMapping
    public List<Gain> list() { return gainService.list(); }

    @GetMapping("/{id}")
    public Gain get(@PathVariable String id) { return gainService.getById(id); }

    @PostMapping
    public Gain create(@RequestBody Gain g) { gainService.save(g); return g; }

    @PutMapping("/{id}")
    public Gain update(@PathVariable String id, @RequestBody Gain g) { g.setId(id); gainService.updateById(g); return g; }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) { gainService.removeById(id); }
}
