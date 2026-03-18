package csd.t6.backend.notification;

import java.util.List;
import java.util.UUID;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import csd.t6.backend.auth.AuthUserDetails;
import csd.t6.backend.decorators.responses.BadRequestResponse;
import csd.t6.backend.decorators.responses.NoContentResponse;
import csd.t6.backend.decorators.responses.OkResponse;
import csd.t6.backend.notification.dto.request.MarkAsReadRequest;
import csd.t6.backend.notification.dto.response.NotificationResponse;
import csd.t6.backend.notification.dto.response.UnreadCountResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/notifications")
@Tag(name = "Notifications", description = "Notification management endpoints")
public class NotificationController {

  private final NotificationService notificationService;

  public NotificationController(NotificationService notificationService) {
    this.notificationService = notificationService;
  }

  @GetMapping("/")
  @Operation(summary = "Get user notifications", description = "Retrieve notifications for the authenticated user")
  @OkResponse
  public List<NotificationResponse> getNotifications(@AuthenticationPrincipal AuthUserDetails user,
      @RequestParam(defaultValue = "false") boolean unreadOnly, @RequestParam(defaultValue = "50") int limit,
      @RequestParam(defaultValue = "0") int offset) {
    return notificationService.getNotifications(user.getAccount().getId(), unreadOnly, limit, offset);
  }

  @GetMapping("/unread-count")
  @Operation(summary = "Get unread count", description = "Get the count of unread notifications for the authenticated user")
  @OkResponse
  public UnreadCountResponse getUnreadCount(@AuthenticationPrincipal AuthUserDetails user) {
    return notificationService.getUnreadCount(user.getAccount().getId());
  }

  @PatchMapping("/mark-read")
  @Operation(summary = "Mark notifications as read", description = "Mark notifications as read. Provide an empty array to mark all as read, or specific IDs to mark only those.")
  @NoContentResponse
  @BadRequestResponse()
  public void markAsRead(@AuthenticationPrincipal AuthUserDetails user, @RequestBody @Valid MarkAsReadRequest request) {
    notificationService.markAsRead(request.notificationIds(), user.getAccount().getId());
  }

  @DeleteMapping("/{notificationId}")
  @Operation(summary = "Delete notification", description = "Delete a specific notification")
  @NoContentResponse
  @BadRequestResponse()
  public void deleteNotification(@AuthenticationPrincipal AuthUserDetails user, @PathVariable UUID notificationId) {
    notificationService.deleteNotification(notificationId, user.getAccount().getId());
  }
}
