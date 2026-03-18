package csd.t6.backend.notification.dto.request;

import java.util.List;
import java.util.UUID;

import jakarta.validation.constraints.NotNull;

public record MarkAsReadRequest(@NotNull List<@NotNull UUID> notificationIds) {}
