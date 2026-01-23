package csd.t6.backend.account;

import static csd.t6.jooq.auth.tables.Account.ACCOUNT;

import java.util.List;
import java.util.UUID;

import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;

import csd.t6.jooq.auth.enums.Roles;
import csd.t6.jooq.auth.tables.records.AccountRecord;

@Repository
public class AccountRepository {
  private final DSLContext dsl;

  public AccountRepository(DSLContext dsl) {
    this.dsl = dsl;
  }

  public List<AccountRecord> findAll() {
    return dsl.selectFrom(ACCOUNT).fetch();
  }

  public AccountRecord insert(
      String email,
      String username,
      String passwordHash) {
    AccountRecord record = dsl.newRecord(ACCOUNT);
    record.setId(UUID.randomUUID());
    record.setEmail(email);
    record.setPasswordHash(passwordHash);
    record.setUserRole(Roles.LEARNER);
    record.setUsername(username);

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

  public boolean usernameExists(String username) {
    return dsl.fetchExists(dsl.selectOne()
        .from(ACCOUNT)
        .where(ACCOUNT.USERNAME.eq(username)));
  }
}
