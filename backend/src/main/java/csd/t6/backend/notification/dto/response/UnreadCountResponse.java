package csd.t6.backend.notification.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(name = "UnreadCount")
public record UnreadCountResponse(long count) {}
