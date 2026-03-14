package csd.t6.backend.learner.dto.request;

import java.util.Map;

import jakarta.validation.constraints.NotNull;

public record UpdateLessonSessionRequest(@NotNull Map<String, Object> metadata) {

}
