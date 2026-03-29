package csd.t6.backend.notification;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

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
import csd.t6.jooq.public_.tables.records.TeamMemberRecord;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

  @Mock
  private NotificationRepository notificationRepository;

  @Mock
  private AccountRepository accountRepository;

  @Mock
  private TeamMemberRepository teamMemberRepository;

  @InjectMocks
  private NotificationService notificationService;

  private UUID accountId;
  private UUID notificationId;
  private NotificationRecord mockNotification;
  private AccountRecord mockAccount;
  private TeamMemberRecord mockTeamMember;

  @BeforeEach
  void setUp() {
    accountId = UUID.randomUUID();
    notificationId = UUID.randomUUID();

    mockNotification = mock(NotificationRecord.class);
    lenient().when(mockNotification.getId()).thenReturn(notificationId);
    lenient().when(mockNotification.getAccountId()).thenReturn(accountId);
    lenient().when(mockNotification.getTitle()).thenReturn("Test Notification");
    lenient().when(mockNotification.getMessage()).thenReturn("Test message");
    lenient().when(mockNotification.getIsRead()).thenReturn(false);
    lenient().when(mockNotification.getCreatedAt()).thenReturn(OffsetDateTime.now());

    mockAccount = mock(AccountRecord.class);
    lenient().when(mockAccount.getId()).thenReturn(accountId);

    mockTeamMember = mock(TeamMemberRecord.class);
    lenient().when(mockTeamMember.getAccountId()).thenReturn(accountId);
  }

  @Test
  @DisplayName("Should return all notifications when unreadOnly is false")
  void shouldReturnAllNotifications() {
    when(accountRepository.exists(any(), any())).thenReturn(true);
    when(notificationRepository.findByAccountId(accountId, 10, 0)).thenReturn(List.of(mockNotification));

    List<NotificationResponse> result = notificationService.getNotifications(accountId, false, 10, 0);

    assertThat(result).hasSize(1);
    assertThat(result.get(0).id()).isEqualTo(notificationId);
  }

  @Test
  @DisplayName("Should return unread notifications only when unreadOnly is true")
  void shouldReturnUnreadOnlyNotifications() {
    when(accountRepository.exists(any(), any())).thenReturn(true);
    when(notificationRepository.findUnreadByAccountId(accountId, 10, 0)).thenReturn(List.of(mockNotification));

    List<NotificationResponse> result = notificationService.getNotifications(accountId, true, 10, 0);

    assertThat(result).hasSize(1);
  }

  @Test
  @DisplayName("Should throw when account not found for getNotifications")
  void shouldThrowWhenAccountNotFoundForGetNotifications() {
    when(accountRepository.exists(any(), any())).thenReturn(false);

    assertThatThrownBy(() -> notificationService.getNotifications(accountId, false, 10, 0))
        .isInstanceOf(BadRequestException.class).hasMessageContaining("Account not found");
  }

  @Test
  @DisplayName("Should mark specific notifications as read")
  void shouldMarkSpecificNotificationsAsRead() {
    when(accountRepository.exists(any(), any())).thenReturn(true);
    when(notificationRepository.findByIdAndAccountId(notificationId, accountId))
        .thenReturn(Optional.of(mockNotification));

    notificationService.markAsRead(List.of(notificationId), accountId);

    verify(notificationRepository).markAsRead(notificationId, accountId);
  }

  @Test
  @DisplayName("Should mark all notifications as read when list is empty")
  void shouldMarkAllAsRead() {
    when(accountRepository.exists(any(), any())).thenReturn(true);

    notificationService.markAsRead(new ArrayList<>(), accountId);

    verify(notificationRepository).markAllAsRead(accountId);
  }

  @Test
  @DisplayName("Should mark all notifications as read when list is null")
  void shouldMarkAllAsReadWhenNull() {
    when(accountRepository.exists(any(), any())).thenReturn(true);

    notificationService.markAsRead(null, accountId);

    verify(notificationRepository).markAllAsRead(accountId);
  }

  @Test
  @DisplayName("Should throw when marking non-owned notification as read")
  void shouldThrowWhenMarkingNonOwnedNotification() {
    when(accountRepository.exists(any(), any())).thenReturn(true);
    when(notificationRepository.findByIdAndAccountId(notificationId, accountId)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> notificationService.markAsRead(List.of(notificationId), accountId))
        .isInstanceOf(ForbiddenException.class);
  }

  @Test
  @DisplayName("Should return unread count")
  void shouldReturnUnreadCount() {
    when(accountRepository.exists(any(), any())).thenReturn(true);
    when(notificationRepository.countUnreadByAccountId(accountId)).thenReturn(5L);

    UnreadCountResponse result = notificationService.getUnreadCount(accountId);

    assertThat(result.count()).isEqualTo(5);
  }

  @Test
  @DisplayName("Should delete notification when owner requests it")
  void shouldDeleteNotification() {
    when(accountRepository.exists(any(), any())).thenReturn(true);
    when(notificationRepository.findByIdAndAccountId(notificationId, accountId))
        .thenReturn(Optional.of(mockNotification));
    when(notificationRepository.delete(notificationId, accountId)).thenReturn(1);

    notificationService.deleteNotification(notificationId, accountId);

    verify(notificationRepository).delete(notificationId, accountId);
  }

  @Test
  @DisplayName("Should throw when deleting non-existent notification")
  void shouldThrowWhenDeletingNonExistentNotification() {
    when(accountRepository.exists(any(), any())).thenReturn(true);
    when(notificationRepository.findByIdAndAccountId(notificationId, accountId))
        .thenReturn(Optional.of(mockNotification));
    when(notificationRepository.delete(notificationId, accountId)).thenReturn(0);

    assertThatThrownBy(() -> notificationService.deleteNotification(notificationId, accountId))
        .isInstanceOf(BadRequestException.class).hasMessageContaining("Notification not found");
  }

  @Test
  @DisplayName("Should throw when deleting non-owned notification")
  void shouldThrowWhenDeletingNonOwnedNotification() {
    when(accountRepository.exists(any(), any())).thenReturn(true);
    when(notificationRepository.findByIdAndAccountId(notificationId, accountId)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> notificationService.deleteNotification(notificationId, accountId))
        .isInstanceOf(ForbiddenException.class);
  }

  @Test
  @DisplayName("Should send notification to account")
  void shouldSendNotificationToAccount() {
    when(accountRepository.exists(any(), any())).thenReturn(true);

    notificationService.sendToAccount(accountId, NotificationType.COURSE_APPROVED, "Title", "Message", UUID.randomUUID());

    verify(notificationRepository).insert(eq(accountId), eq(NotificationType.COURSE_APPROVED), eq("Title"),
        eq("Message"), any());
  }

  @Test
  @DisplayName("Should send notification to team members")
  void shouldSendNotificationToTeam() {
    UUID teamId = UUID.randomUUID();
    when(teamMemberRepository.findByTeamId(teamId)).thenReturn(List.of(mockTeamMember));

    notificationService.sendToTeam(teamId, NotificationType.COURSE_APPROVED, "Title", "Message", UUID.randomUUID());

    verify(notificationRepository).insert(eq(accountId), eq(NotificationType.COURSE_APPROVED), eq("Title"), eq("Message"),
        any());
  }

  @Test
  @DisplayName("Should not send notification when team has no members")
  void shouldNotSendNotificationWhenTeamHasNoMembers() {
    UUID teamId = UUID.randomUUID();
    when(teamMemberRepository.findByTeamId(teamId)).thenReturn(List.of());

    notificationService.sendToTeam(teamId, NotificationType.COURSE_APPROVED, "Title", "Message", UUID.randomUUID());

    verify(notificationRepository, org.mockito.Mockito.never()).insert(any(), any(), any(), any(), any());
  }

  @Test
  @DisplayName("Should send notification to all users with role")
  void shouldSendNotificationToRole() {
    when(accountRepository.findBy(any(), any())).thenReturn(List.of(mockAccount));

    notificationService.sendToRole(Roles.CONTRIBUTOR, NotificationType.COURSE_APPROVED, "Title", "Message",
        UUID.randomUUID());

    verify(notificationRepository).insert(eq(accountId), eq(NotificationType.COURSE_APPROVED), eq("Title"),
        eq("Message"), any());
  }

  @Test
  @DisplayName("Should not send notification when no users have role")
  void shouldNotSendNotificationWhenNoUsersHaveRole() {
    when(accountRepository.findBy(any(), any())).thenReturn(List.of());

    notificationService.sendToRole(Roles.CONTRIBUTOR, NotificationType.COURSE_APPROVED, "Title", "Message",
        UUID.randomUUID());

    verify(notificationRepository, org.mockito.Mockito.never()).insert(any(), any(), any(), any(), any());
  }
}
