package csd.t6.backend.approval.dto.request;

import jakarta.validation.constraints.NotNull;

public record UploadCourseRequest(@NotNull String description) {}
