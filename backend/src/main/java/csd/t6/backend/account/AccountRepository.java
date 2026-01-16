package csd.t6.backend.account;

import static csd.t6.jooq.tables.Account.ACCOUNT;

import java.util.List;
import java.util.UUID;

import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;

import csd.t6.jooq.tables.records.AccountRecord;

@Repository
public class AccountRepository {
  private final DSLContext dsl;

  public AccountRepository(DSLContext dsl) {
    this.dsl = dsl;
  }

  // Fetch all accounts
  public List<AccountRecord> findAll() {
    return dsl.selectFrom(ACCOUNT).fetch();
  }

  public AccountRecord insert(UUID id, String email) {
    AccountRecord record = dsl.newRecord(ACCOUNT);
    record.setId(id);
    record.setEmail(email);
    record.store();
    return record;
  }

  public int updateEmail(UUID id, String newEmail) {
    return dsl.update(ACCOUNT)
        .set(ACCOUNT.EMAIL, newEmail)
        .where(ACCOUNT.ID.eq(id))
        .execute();
  }

  public int delete(UUID id) {
    return dsl.deleteFrom(ACCOUNT)
        .where(ACCOUNT.ID.eq(id))
        .execute();
  }
}
