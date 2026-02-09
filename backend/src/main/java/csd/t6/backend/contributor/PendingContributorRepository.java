package csd.t6.backend.contributor;

import static csd.t6.jooq.public_.tables.PendingContributors.PENDING_CONTRIBUTORS;

import java.util.UUID;

import org.jooq.DSLContext;
import org.jooq.Field;
import org.springframework.stereotype.Repository;

import csd.t6.jooq.public_.tables.records.PendingContributorsRecord;

@Repository
public class PendingContributorRepository {
  private final DSLContext dsl;

  public PendingContributorRepository(DSLContext dsl) {
    this.dsl = dsl;
  }

  public void insertPendingContributor(UUID learnerUUID) {
    PendingContributorsRecord record = dsl.newRecord(PENDING_CONTRIBUTORS);
    record.setLearnerId(learnerUUID);
    record.store();
  }

  /**
   * Generic method to check if a value exists in a specified field.
   * 
   * @param pendingContributors - the field to check
   * @param learnerUUID         - the value to look for
   * @return true if an entity with the value in the field exists, false otherwise
   */
  public <T> boolean exists(Field<T> field, T value) {
    return dsl.fetchExists(dsl.selectOne().from(PENDING_CONTRIBUTORS).where(field.eq(value)));
  }
}
