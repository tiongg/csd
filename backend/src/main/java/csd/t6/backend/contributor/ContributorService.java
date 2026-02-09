package csd.t6.backend.contributor;

import static csd.t6.jooq.public_.tables.PendingContributors.PENDING_CONTRIBUTORS;

import java.util.UUID;

import org.springframework.stereotype.Service;

import csd.t6.backend.exceptions.BadRequestException;

@Service
public class ContributorService {
  private final PendingContributorRepository pendingContributorRepository;

  public ContributorService(PendingContributorRepository pendingContributorRepository) {
    this.pendingContributorRepository = pendingContributorRepository;
  }

  public void insertPendingContributor(UUID learnerUUID) {
    if (this.pendingContributorRepository.exists(PENDING_CONTRIBUTORS.LEARNER_ID, learnerUUID)) {
      throw new BadRequestException("User is pending approval!");
    }

    this.pendingContributorRepository.insertPendingContributor(learnerUUID);
  }
}
