package csd.t6.backend.learner.dto.response;

import java.util.List;

import jakarta.validation.constraints.NotNull;

public record LearnerAnalyticsResponse(
    @NotNull List<Integer> weeklyCadence,
    @NotNull Integer activeDays,
    @NotNull Integer focusScore,
    @NotNull Integer completedCoursesCount,
    @NotNull Integer currentStreak
) {}
