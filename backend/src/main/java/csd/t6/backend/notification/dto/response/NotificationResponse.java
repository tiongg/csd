package csd.t6.backend.notification.dto.response;

import java.time.OffsetDateTime;
import java.util.UUID;

import csd.t6.jooq.public_.enums.NotificationType;
import csd.t6.jooq.public_.tables.records.NotificationRecord;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(name = "Notification")
public record NotificationResponse(@NotNull UUID id, @NotNull NotificationType type, @NotNull String title,
    @NotNull String message, UUID itemId, @NotNull boolean isRead, @NotNull OffsetDateTime createdAt) {
  public NotificationResponse(NotificationRecord record) {
    this(record.getId(), record.getNotificationType(), record.getTitle(), record.getMessage(), record.getItemId(),
        record.getIsRead(), record.getCreatedAt());
  }
}
