package csd.t6.backend.approval.dto.response;

import csd.t6.jooq.public_.enums.ContentStatus;
import csd.t6.jooq.public_.tables.records.ContentVersionRecord;
import jakarta.validation.constraints.NotNull;

public record ContentVersionResponse(@NotNull String id, @NotNull int versionNumber, @NotNull String description,
    @NotNull String publishedAt, @NotNull ContentStatus status, String rejectedReason) {
  public ContentVersionResponse(ContentVersionRecord record) {
    this(record.getId().toString(), record.getVersion(), record.getDescription(), record.getPublishedAt().toString(),
        record.getStatus(), record.getRejectedReason());
  }
}
