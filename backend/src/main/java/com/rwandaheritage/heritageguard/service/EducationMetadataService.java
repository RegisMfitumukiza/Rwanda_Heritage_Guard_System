package com.rwandaheritage.heritageguard.service;

import com.rwandaheritage.heritageguard.model.EducationalArticle;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class EducationMetadataService {

    public List<String> getCategories() {
        log.debug("Fetching educational article categories");
        return Arrays.stream(EducationalArticle.ArticleCategory.values())
                .map(Enum::name)
                .collect(Collectors.toList());
    }

    public List<String> getDifficultyLevels() {
        log.debug("Fetching educational article difficulty levels");
        return Arrays.stream(EducationalArticle.DifficultyLevel.values())
                .map(Enum::name)
                .collect(Collectors.toList());
    }
}

