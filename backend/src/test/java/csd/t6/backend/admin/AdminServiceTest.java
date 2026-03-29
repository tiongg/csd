package csd.t6.backend.admin;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import csd.t6.backend.account.AccountRepository;
import csd.t6.backend.contributor.PendingContributorRepository;
import csd.t6.jooq.accounts.enums.Roles;
import csd.t6.jooq.accounts.tables.records.AccountRecord;

@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

  @Mock
  private PendingContributorRepository pendingContributorRepository;

  @Mock
  private AccountRepository accountRepository;

  @InjectMocks
  private AdminService adminService;

  @BeforeEach
  void setUp() {
    // Setup if needed
  }

  // --- getAllPendingContributors ---

  @Test
  @DisplayName("Should return all pending contributors")
  void shouldReturnAllPendingContributors() {
    List<AccountRecord> expectedContributors = List.of(mock(AccountRecord.class), mock(AccountRecord.class));
    when(pendingContributorRepository.getPendingContributorAccounts(10, 0)).thenReturn(expectedContributors);

    List<AccountRecord> result = adminService.getAllPendingContributors(10, 0);

    assertThat(result).isEqualTo(expectedContributors);
    verify(pendingContributorRepository).getPendingContributorAccounts(10, 0);
  }

  @Test
  @DisplayName("Should return empty list when no pending contributors")
  void shouldReturnEmptyListWhenNoPendingContributors() {
    when(pendingContributorRepository.getPendingContributorAccounts(10, 0)).thenReturn(List.of());

    List<AccountRecord> result = adminService.getAllPendingContributors(10, 0);

    assertThat(result).isEmpty();
  }

  // --- getAllAdmins ---

  @Test
  @DisplayName("Should return all admins")
  void shouldReturnAllAdmins() {
    List<AccountRecord> expectedAdmins = List.of(mock(AccountRecord.class), mock(AccountRecord.class));
    when(accountRepository.getAllAdmins(10, 0)).thenReturn(expectedAdmins);

    List<AccountRecord> result = adminService.getAllAdmins(10, 0);

    assertThat(result).isEqualTo(expectedAdmins);
    verify(accountRepository).getAllAdmins(10, 0);
  }

  @Test
  @DisplayName("Should return empty list when no admins")
  void shouldReturnEmptyListWhenNoAdmins() {
    when(accountRepository.getAllAdmins(10, 0)).thenReturn(List.of());

    List<AccountRecord> result = adminService.getAllAdmins(10, 0);

    assertThat(result).isEmpty();
  }

  // --- approveContributors ---

  @Test
  @DisplayName("Should approve contributors")
  void shouldApproveContributors() {
    UUID learner1 = UUID.randomUUID();
    UUID learner2 = UUID.randomUUID();
    UUID learner3 = UUID.randomUUID();
    List<UUID> learnerUuids = List.of(learner1, learner2, learner3);

    lenient().when(accountRepository.updateAccountsRole(learnerUuids, Roles.CONTRIBUTOR)).thenReturn(3);
    when(pendingContributorRepository.deletePendingContributors(learnerUuids)).thenReturn(3);

    int result = adminService.approveContributors(learnerUuids);

    assertThat(result).isEqualTo(3);
    verify(accountRepository).updateAccountsRole(learnerUuids, Roles.CONTRIBUTOR);
    verify(pendingContributorRepository).deletePendingContributors(learnerUuids);
  }

  @Test
  @DisplayName("Should approve single contributor")
  void shouldApproveSingleContributor() {
    UUID learner1 = UUID.randomUUID();
    List<UUID> learnerUuids = List.of(learner1);

    lenient().when(accountRepository.updateAccountsRole(learnerUuids, Roles.CONTRIBUTOR)).thenReturn(1);
    when(pendingContributorRepository.deletePendingContributors(learnerUuids)).thenReturn(1);

    int result = adminService.approveContributors(learnerUuids);

    assertThat(result).isEqualTo(1);
    verify(accountRepository).updateAccountsRole(learnerUuids, Roles.CONTRIBUTOR);
    verify(pendingContributorRepository).deletePendingContributors(learnerUuids);
  }

  @Test
  @DisplayName("Should return 0 when approving empty list")
  void shouldReturnZeroWhenApprovingEmptyList() {
    List<UUID> emptyList = List.of();

    when(accountRepository.updateAccountsRole(emptyList, Roles.CONTRIBUTOR)).thenReturn(0);
    when(pendingContributorRepository.deletePendingContributors(emptyList)).thenReturn(0);

    int result = adminService.approveContributors(emptyList);

    assertThat(result).isEqualTo(0);
    verify(accountRepository).updateAccountsRole(emptyList, Roles.CONTRIBUTOR);
    verify(pendingContributorRepository).deletePendingContributors(emptyList);
  }

  // --- rejectContributors ---

  @Test
  @DisplayName("Should reject contributors")
  void shouldRejectContributors() {
    UUID learner1 = UUID.randomUUID();
    UUID learner2 = UUID.randomUUID();
    List<UUID> learnerUuids = List.of(learner1, learner2);

    when(pendingContributorRepository.deletePendingContributors(learnerUuids)).thenReturn(2);

    int result = adminService.rejectContributors(learnerUuids);

    assertThat(result).isEqualTo(2);
    verify(pendingContributorRepository).deletePendingContributors(learnerUuids);
    verify(accountRepository, never()).updateAccountsRole(any(), any());
  }

  @Test
  @DisplayName("Should reject single contributor")
  void shouldRejectSingleContributor() {
    UUID learner1 = UUID.randomUUID();
    List<UUID> learnerUuids = List.of(learner1);

    when(pendingContributorRepository.deletePendingContributors(learnerUuids)).thenReturn(1);

    int result = adminService.rejectContributors(learnerUuids);

    assertThat(result).isEqualTo(1);
    verify(pendingContributorRepository).deletePendingContributors(learnerUuids);
    verify(accountRepository, never()).updateAccountsRole(any(), any());
  }

  @Test
  @DisplayName("Should return 0 when rejecting empty list")
  void shouldReturnZeroWhenRejectingEmptyList() {
    List<UUID> emptyList = List.of();

    when(pendingContributorRepository.deletePendingContributors(emptyList)).thenReturn(0);

    int result = adminService.rejectContributors(emptyList);

    assertThat(result).isEqualTo(0);
    verify(pendingContributorRepository).deletePendingContributors(emptyList);
    verify(accountRepository, never()).updateAccountsRole(any(), any());
  }
}
