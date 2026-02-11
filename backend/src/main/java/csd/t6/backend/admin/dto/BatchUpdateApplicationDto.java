package csd.t6.backend.admin.dto;

import java.util.List;
import java.util.UUID;

import jakarta.validation.constraints.NotNull;

public record BatchUpdateApplicationDto(@NotNull List<@NotNull UUID> learnerUuids) {}
