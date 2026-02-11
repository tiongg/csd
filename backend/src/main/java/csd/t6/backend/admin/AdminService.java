package csd.t6.backend.admin;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import csd.t6.backend.account.AccountRepository;
import csd.t6.backend.contributor.PendingContributorRepository;
import csd.t6.jooq.accounts.enums.Roles;
import csd.t6.jooq.accounts.tables.records.AccountRecord;

@Service
public class AdminService {
  private final PendingContributorRepository pendingContributorRepository;
  private final AccountRepository accountRepository;

  public AdminService(PendingContributorRepository pendingContributorRepository, AccountRepository accountRepository) {
    this.pendingContributorRepository = pendingContributorRepository;
    this.accountRepository = accountRepository;
  }

  public List<AccountRecord> getAllPendingContributors() {
    return this.pendingContributorRepository.getPendingContributorAccounts(100, 0);
  }

  @Transactional
  public int approveContributors(List<UUID> learnerUuids) {
    this.accountRepository.updateAccountsRole(learnerUuids, Roles.CONTRIBUTOR);
    return this.pendingContributorRepository.deletePendingContributors(learnerUuids);
  }

  public int rejectContributors(List<UUID> learnerUuids) {
    return this.pendingContributorRepository.deletePendingContributors(learnerUuids);
  }
}
