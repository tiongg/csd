package csd.t6.backend.admin;

import java.util.List;

import org.springframework.stereotype.Service;

import csd.t6.backend.contributor.PendingContributorRepository;
import csd.t6.jooq.accounts.tables.records.AccountRecord;

@Service
public class AdminService {
  private final PendingContributorRepository pendingContributorRepository;

  public AdminService(PendingContributorRepository pendingContributorRepository) {
    this.pendingContributorRepository = pendingContributorRepository;
  }

  public List<AccountRecord> getAllPendingContributors() {
    return this.pendingContributorRepository.getPendingContributorAccounts(100, 0);
  }
}
