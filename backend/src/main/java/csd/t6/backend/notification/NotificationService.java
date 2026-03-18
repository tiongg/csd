package csd.t6.backend.notification;

import static csd.t6.jooq.accounts.tables.Account.ACCOUNT;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import csd.t6.backend.account.AccountRepository;
import csd.t6.backend.exceptions.BadRequestException;
import csd.t6.backend.exceptions.ForbiddenException;
import csd.t6.backend.notification.dto.response.NotificationResponse;
import csd.t6.backend.notification.dto.response.UnreadCountResponse;
import csd.t6.backend.team.TeamMemberRepository;
import csd.t6.jooq.accounts.enums.Roles;
import csd.t6.jooq.accounts.tables.records.AccountRecord;
import csd.t6.jooq.public_.enums.NotificationType;
import csd.t6.jooq.public_.tables.records.NotificationRecord;

@Service
public class NotificationService {

  private final NotificationRepository notificationRepository;
  private final AccountRepository accountRepository;
  private final TeamMemberRepository teamMemberRepository;

  public NotificationService(NotificationRepository notificationRepository, AccountRepository accountRepository,
      TeamMemberRepository teamMemberRepository) {
    this.notificationRepository = notificationRepository;
    this.accountRepository = accountRepository;
    this.teamMemberRepository = teamMemberRepository;
  }

  public List<NotificationResponse> getNotifications(UUID accountId, boolean unreadOnly, int limit, int offset) {
    validateAccountExists(accountId);

    List<NotificationRecord> records = unreadOnly
        ? notificationRepository.findUnreadByAccountId(accountId, limit, offset)
        : notificationRepository.findByAccountId(accountId, limit, offset);

    return records.stream().map(NotificationResponse::new).collect(Collectors.toList());
  }

  @Transactional
  public void markAsRead(List<UUID> notificationIds, UUID accountId) {
    validateAccountExists(accountId);

    if (notificationIds == null || notificationIds.isEmpty()) {
      // Mark all as read
      notificationRepository.markAllAsRead(accountId);
    } else {
      // Mark specific notifications as read
      for (UUID notificationId : notificationIds) {
        validateNotificationOwnership(notificationId, accountId);
        notificationRepository.markAsRead(notificationId, accountId);
      }
    }
  }

  public UnreadCountResponse getUnreadCount(UUID accountId) {
    validateAccountExists(accountId);
    long count = notificationRepository.countUnreadByAccountId(accountId);
    return new UnreadCountResponse(count);
  }

  @Transactional
  public void deleteNotification(UUID notificationId, UUID accountId) {
    validateAccountExists(accountId);
    validateNotificationOwnership(notificationId, accountId);

    int deleted = notificationRepository.delete(notificationId, accountId);
    if (deleted == 0) {
      throw new BadRequestException("Notification not found");
    }
  }

  /**
   * Send a notification to a specific account.
   */
  public void sendToAccount(UUID accountId, NotificationType type, String title, String message, UUID itemId) {
    validateAccountExists(accountId);
    notificationRepository.insert(accountId, type, title, message, itemId);
  }

  /**
   * Send a notification to all members of a team. Creates individual notification
   * records for each team member.
   */
  @Transactional
  public void sendToTeam(UUID teamId, NotificationType type, String title, String message, UUID itemId) {
    List<UUID> memberIds = teamMemberRepository.findByTeamId(teamId).stream().map(tm -> tm.getAccountId())
        .collect(Collectors.toList());

    if (memberIds.isEmpty()) {
      return;
    }

    memberIds.forEach(memberId -> notificationRepository.insert(memberId, type, title, message, itemId));
  }

  /**
   * Send a notification to all users with a specific role. Creates individual
   * notification records for each matching user.
   */
  @Transactional
  public void sendToRole(Roles role, NotificationType type, String title, String message, UUID itemId) {
    List<AccountRecord> accounts = accountRepository.findBy(ACCOUNT.USER_ROLE, role);

    if (accounts.isEmpty()) {
      return;
    }

    accounts.forEach(account -> notificationRepository.insert(account.getId(), type, title, message, itemId));
  }

  private void validateAccountExists(UUID accountId) {
    if (!accountRepository.exists(ACCOUNT.ID, accountId)) {
      throw new BadRequestException("Account not found");
    }
  }

  private void validateNotificationOwnership(UUID notificationId, UUID accountId) {
    if (notificationRepository.findByIdAndAccountId(notificationId, accountId).isEmpty()) {
      throw new ForbiddenException("You can only access your own notifications");
    }
  }
}
