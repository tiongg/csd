package csd.t6.backend.contributor;

import static csd.t6.jooq.accounts.tables.Account.ACCOUNT;
import static csd.t6.jooq.public_.tables.PendingContributors.PENDING_CONTRIBUTORS;

import java.util.List;
import java.util.UUID;

import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;

import csd.t6.backend.utils.BaseRepository;
import csd.t6.jooq.accounts.tables.records.AccountRecord;
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

  public List<AccountRecord> getPendingContributorAccounts(int limit, int offset) {
    return dsl.select(ACCOUNT.fields()).from(PENDING_CONTRIBUTORS).join(ACCOUNT)
        .on(PENDING_CONTRIBUTORS.LEARNER_ID.eq(ACCOUNT.ID)).limit(limit).offset(offset).fetchInto(ACCOUNT);
  }

  public int deletePendingContributors(List<UUID> learnerUuids) {
    return dsl.deleteFrom(PENDING_CONTRIBUTORS).where(PENDING_CONTRIBUTORS.LEARNER_ID.in(learnerUuids)).execute();
  }
}
