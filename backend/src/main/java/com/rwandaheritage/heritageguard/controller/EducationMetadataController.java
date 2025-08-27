package com.rwandaheritage.heritageguard.controller;

import com.rwandaheritage.heritageguard.service.EducationMetadataService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/education")
@RequiredArgsConstructor
@Slf4j
public class EducationMetadataController {

    private final EducationMetadataService metadataService;

    @GetMapping("/categories")
    public ResponseEntity<List<String>> getCategories() {
        log.debug("Request to get educational categories");
        return ResponseEntity.ok(metadataService.getCategories());
    }

    @GetMapping("/difficulty-levels")
    public ResponseEntity<List<String>> getDifficultyLevels() {
        log.debug("Request to get educational difficulty levels");
        return ResponseEntity.ok(metadataService.getDifficultyLevels());
    }
}

