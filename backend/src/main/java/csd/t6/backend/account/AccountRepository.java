package csd.t6.backend.account;

import static csd.t6.jooq.accounts.tables.Account.ACCOUNT;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.jooq.DSLContext;
import org.jooq.Field;
import org.springframework.stereotype.Repository;

import csd.t6.jooq.accounts.enums.Roles;
import csd.t6.jooq.accounts.tables.records.AccountRecord;

@Repository
public class AccountRepository {
  private final DSLContext dsl;

  public AccountRepository(DSLContext dsl) {
    this.dsl = dsl;
  }

  public List<AccountRecord> findAll() {
    return dsl.selectFrom(ACCOUNT).fetch();
  }

  public AccountRecord insert(String email, String username, String passwordHash) {
    AccountRecord record = dsl.newRecord(ACCOUNT);
    record.setId(UUID.randomUUID());
    record.setEmail(email);
    record.setPasswordHash(passwordHash);
    record.setUserRole(Roles.LEARNER);
    record.setUsername(username);

    record.store();
    return record;
  }

  public int delete(UUID id) {
    return dsl.deleteFrom(ACCOUNT).where(ACCOUNT.ID.eq(id)).execute();
  }

  /**
   * Generic method to check if a value exists in a specified field.
   * 
   * @param field - the field to check
   * @param value - the value to look for
   * @return true if an entity with the value in the field exists, false otherwise
   */
  public <T> boolean exists(Field<T> field, T value) {
    return dsl.fetchExists(dsl.selectOne().from(ACCOUNT).where(field.eq(value)));
  }

  /**
   * Generic method to find an account by a specified field.
   * 
   * @param field - the field to find by
   * @param value - the value to look for
   * @return the AccountRecord if found, null otherwise
   */
  public <T> Optional<AccountRecord> findBy(Field<T> field, T value) {
    AccountRecord found = dsl.selectFrom(ACCOUNT).where(field.eq(value)).fetchOne();
    return Optional.ofNullable(found);
  }

  public AccountRecord update(AccountRecord accountRecord) {
    accountRecord.store();
    return accountRecord;
  }

  /**
   * Insert a new account via OAuth2 (without password).
   * The username is derived from the email prefix.
   */
  public AccountRecord insertOAuth2(String email, String realName) {
    // Generate username from email (e.g., "user@gmail.com" -> "user_gmail")
    String baseUsername = email.split("@")[0].replaceAll("[^a-zA-Z0-9]", "_");
    String username = baseUsername;
    int counter = 1;
    while (exists(ACCOUNT.USERNAME, username)) {
      username = baseUsername + "_" + counter++;
    }

    AccountRecord record = dsl.newRecord(ACCOUNT);
    record.setId(UUID.randomUUID());
    record.setEmail(email);
    record.setUsername(username);
    record.setRealName(realName);
    record.setUserRole(Roles.LEARNER);
    // password_hash is null for OAuth-only users
    record.store();
    return record;
  }
}
