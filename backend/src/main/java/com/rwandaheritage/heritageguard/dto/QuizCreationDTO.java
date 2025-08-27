package com.rwandaheritage.heritageguard.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizCreationDTO {

    @NotNull
    @Valid
    private QuizDTO quiz;

    @Valid
    private List<QuizQuestionDTO> questions;
}

