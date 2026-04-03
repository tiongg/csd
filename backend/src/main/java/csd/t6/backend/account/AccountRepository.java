package csd.t6.backend.account;

import static csd.t6.jooq.accounts.tables.Account.ACCOUNT;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.jooq.DSLContext;
import org.springframework.stereotype.Repository;

import csd.t6.backend.utils.BaseRepository;
import csd.t6.jooq.accounts.enums.Roles;
import csd.t6.jooq.accounts.tables.records.AccountRecord;

@Repository
public class AccountRepository extends BaseRepository<AccountRecord> {
  public AccountRepository(DSLContext dsl) {
    super(dsl, ACCOUNT);
  }

  public AccountRecord insert(String email, String username, String passwordHash) {
    return insert(email, username, passwordHash, null);
  }

  public AccountRecord insert(String email, String username, String passwordHash, String realname) {
    AccountRecord record = dsl.newRecord(ACCOUNT);
    record.setId(UUID.randomUUID());
    record.setEmail(email);
    record.setPasswordHash(passwordHash);
    record.setUserRole(Roles.LEARNER);
    record.setUsername(username);
    record.setRealName(realname);

    return this.save(record);
  }

  public int updateAccountsRole(List<UUID> accountIds, Roles role) {
    return dsl.update(ACCOUNT).set(ACCOUNT.USER_ROLE, role).where(ACCOUNT.ID.in(accountIds)).execute();
  }

  public List<AccountRecord> getAllAdmins(int limit, int offset) {
    return this.findBy(ACCOUNT.USER_ROLE, Roles.ADMIN, limit, offset);
  }

  public List<AccountRecord> getNonAdmins(int limit, int offset) {
    return dsl.select().from(ACCOUNT).where(ACCOUNT.USER_ROLE.ne(Roles.ADMIN)).limit(limit).offset(offset)
        .fetchInto(ACCOUNT);
  }

  public Optional<String> findUsernameById(UUID accountId) {
    return this.findOneBy(ACCOUNT.ID, accountId).map(AccountRecord::getUsername);
  }
}
