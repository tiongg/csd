package csd.t6.backend.contributor;

import static csd.t6.jooq.public_.tables.PendingContributors.PENDING_CONTRIBUTORS;

import java.util.UUID;

import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;

import csd.t6.backend.utils.BaseRepository;
import csd.t6.jooq.public_.tables.records.PendingContributorsRecord;

@Repository
public class PendingContributorRepository extends BaseRepository<PendingContributorsRecord> {
  public PendingContributorRepository(DSLContext dsl) {
    super(dsl, PENDING_CONTRIBUTORS);
  }

  public PendingContributorsRecord insertPendingContributor(UUID learnerUUID) {
    PendingContributorsRecord record = dsl.newRecord(PENDING_CONTRIBUTORS);
    record.setLearnerId(learnerUUID);
    return this.save(record);
  }
}
