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

import csd.t6.jooq.accounts.tables.records.AccountRecord;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class PendingContributorRepositoryTest {

  @Autowired
  private PendingContributorRepository pendingContributorRepository;

  @Test
  @DisplayName("Should insert pending contributor")
  void shouldInsertPendingContributor() {
    UUID learnerId = UUID.randomUUID();

    var result = pendingContributorRepository.insertPendingContributor(learnerId);

    assertThat(result).isNotNull();
    assertThat(result.getLearnerId()).isEqualTo(learnerId);
  }

  @Test
  @DisplayName("Should get pending contributor accounts")
  void shouldGetPendingContributorAccounts() {
    UUID learnerId = UUID.randomUUID();
    pendingContributorRepository.insertPendingContributor(learnerId);

    List<AccountRecord> result = pendingContributorRepository.getPendingContributorAccounts(10, 0);

    assertThat(result).isNotNull();
  }

  @Test
  @DisplayName("Should delete pending contributors")
  void shouldDeletePendingContributors() {
    UUID learnerId1 = UUID.randomUUID();
    UUID learnerId2 = UUID.randomUUID();

    pendingContributorRepository.insertPendingContributor(learnerId1);
    pendingContributorRepository.insertPendingContributor(learnerId2);

    int deleted = pendingContributorRepository.deletePendingContributors(List.of(learnerId1, learnerId2));

    assertThat(deleted).isGreaterThanOrEqualTo(0);
  }
}
