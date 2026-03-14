package csd.t6.backend.approval.dto.request;

import jakarta.validation.constraints.NotNull;

public record RejectVersionRequest(@NotNull String rejectedReason) {}
