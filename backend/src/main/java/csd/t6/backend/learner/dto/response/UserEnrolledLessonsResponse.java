package csd.t6.backend.learner.dto.response;

import java.util.List;

import jakarta.validation.constraints.NotNull;

public record UserEnrolledLessonsResponse(@NotNull List<LessonSessionFullResponse> enrolledLessons) {}
