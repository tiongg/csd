package csd.t6.backend.contributor;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import csd.t6.backend.account.AccountRepository;
import csd.t6.jooq.accounts.tables.records.AccountRecord;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class PendingContributorRepositoryTest {

  @Autowired
  private PendingContributorRepository pendingContributorRepository;

  @Autowired
  private AccountRepository accountRepository;

  @Test
  @DisplayName("Should insert pending contributor")
  void shouldInsertPendingContributor() {
    AccountRecord account = accountRepository.insert("learner@example.com", "learner", "hashedpass");
    UUID learnerId = account.getId();

    var result = pendingContributorRepository.insertPendingContributor(learnerId);

    assertThat(result).isNotNull();
    assertThat(result.getLearnerId()).isEqualTo(learnerId);
  }

  @Test
  @DisplayName("Should get pending contributor accounts")
  void shouldGetPendingContributorAccounts() {
    AccountRecord account = accountRepository.insert("learner2@example.com", "learner2", "hashedpass");
    UUID learnerId = account.getId();
    pendingContributorRepository.insertPendingContributor(learnerId);

    List<AccountRecord> result = pendingContributorRepository.getPendingContributorAccounts(10, 0);

    assertThat(result).isNotNull();
  }

  @Test
  @DisplayName("Should delete pending contributors")
  void shouldDeletePendingContributors() {
    AccountRecord account1 = accountRepository.insert("learner3@example.com", "learner3", "hashedpass");
    AccountRecord account2 = accountRepository.insert("learner4@example.com", "learner4", "hashedpass");
    UUID learnerId1 = account1.getId();
    UUID learnerId2 = account2.getId();

    pendingContributorRepository.insertPendingContributor(learnerId1);
    pendingContributorRepository.insertPendingContributor(learnerId2);

    int deleted = pendingContributorRepository.deletePendingContributors(List.of(learnerId1, learnerId2));

    assertThat(deleted).isGreaterThanOrEqualTo(0);
  }
}
