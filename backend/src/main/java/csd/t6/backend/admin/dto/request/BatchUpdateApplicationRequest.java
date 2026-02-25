package csd.t6.backend.admin.dto.request;

import java.util.List;
import java.util.UUID;

import jakarta.validation.constraints.NotNull;

public record BatchUpdateApplicationRequest(@NotNull List<@NotNull UUID> learnerUuids) {}
