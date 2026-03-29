package csd.t6.backend.account;

import static csd.t6.jooq.accounts.tables.Account.ACCOUNT;
import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import csd.t6.jooq.accounts.enums.Roles;
import csd.t6.jooq.accounts.tables.records.AccountRecord;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class AccountRepositoryTest {

    @Autowired
    private AccountRepository accountRepository;

    private static final String TEST_EMAIL = "test@example.com";
    private static final String TEST_USERNAME = "testuser";
    private static final String TEST_PASSWORD_HASH = "$2a$12$hashedpassword";

    @Test
    @DisplayName("Should insert account with email, username, and password hash")
    void shouldInsertAccount() {
        AccountRecord record = accountRepository.insert(TEST_EMAIL, TEST_USERNAME, TEST_PASSWORD_HASH);

        assertThat(record).isNotNull();
        assertThat(record.getId()).isNotNull();
        assertThat(record.getEmail()).isEqualTo(TEST_EMAIL);
        assertThat(record.getUsername()).isEqualTo(TEST_USERNAME);
        assertThat(record.getPasswordHash()).isEqualTo(TEST_PASSWORD_HASH);
        assertThat(record.getUserRole()).isEqualTo(Roles.LEARNER);
        assertThat(record.getRealName()).isNull();
    }

    @Test
    @DisplayName("Should insert account with realname")
    void shouldInsertAccountWithRealName() {
        AccountRecord record = accountRepository.insert(TEST_EMAIL, TEST_USERNAME, TEST_PASSWORD_HASH, "John Doe");

        assertThat(record.getRealName()).isEqualTo("John Doe");
    }

    @Test
    @DisplayName("Should find account by username")
    void shouldFindByUsername() {
        accountRepository.insert(TEST_EMAIL, TEST_USERNAME, TEST_PASSWORD_HASH);

        Optional<AccountRecord> found = accountRepository
                .findOneBy(csd.t6.jooq.accounts.tables.Account.ACCOUNT.USERNAME, TEST_USERNAME);

        assertThat(found).isPresent();
        assertThat(found.get().getUsername()).isEqualTo(TEST_USERNAME);
    }

    @Test
    @DisplayName("Should find account by email")
    void shouldFindByEmail() {
        accountRepository.insert(TEST_EMAIL, TEST_USERNAME, TEST_PASSWORD_HASH);

        Optional<AccountRecord> found = accountRepository.findOneBy(ACCOUNT.EMAIL, TEST_EMAIL);

        assertThat(found).isPresent();
        assertThat(found.get().getEmail()).isEqualTo(TEST_EMAIL);
    }

    @Test
    @DisplayName("Should find account by ID")
    void shouldFindById() {
        AccountRecord inserted = accountRepository.insert(TEST_EMAIL, TEST_USERNAME, TEST_PASSWORD_HASH);

        Optional<AccountRecord> found = accountRepository.findOneBy(ACCOUNT.ID, inserted.getId());

        assertThat(found).isPresent();
        assertThat(found.get().getId()).isEqualTo(inserted.getId());
    }

    @Test
    @DisplayName("Should return empty Optional when account not found")
    void shouldReturnEmptyWhenNotFound() {
        Optional<AccountRecord> found = accountRepository.findOneBy(ACCOUNT.ID, UUID.randomUUID());

        assertThat(found).isEmpty();
    }

    @Test
    @DisplayName("Should check existence by username")
    void shouldCheckExistenceByUsername() {
        accountRepository.insert(TEST_EMAIL, TEST_USERNAME, TEST_PASSWORD_HASH);

        boolean exists = accountRepository.exists(ACCOUNT.USERNAME, TEST_USERNAME);
        boolean notExists = accountRepository.exists(ACCOUNT.USERNAME, "nonexistent");

        assertThat(exists).isTrue();
        assertThat(notExists).isFalse();
    }

    @Test
    @DisplayName("Should return all accounts")
    void shouldFindAllAccounts() {
        accountRepository.insert("a@test.com", "user1", "hash1");
        accountRepository.insert("b@test.com", "user2", "hash2");

        List<AccountRecord> all = accountRepository.findAll();

        assertThat(all).hasSizeGreaterThanOrEqualTo(2);
    }

    @Test
    @DisplayName("Should delete account by ID")
    void shouldDeleteById() {
        AccountRecord record = accountRepository.insert(TEST_EMAIL, TEST_USERNAME, TEST_PASSWORD_HASH);
        UUID id = record.getId();

        int deleted = accountRepository.delete(ACCOUNT.ID, id);

        assertThat(deleted).isEqualTo(1);
        assertThat(accountRepository.findOneBy(ACCOUNT.ID, id)).isEmpty();
    }

    @Test
    @DisplayName("Should save updated account")
    void shouldSaveUpdatedAccount() {
        AccountRecord record = accountRepository.insert(TEST_EMAIL, TEST_USERNAME, TEST_PASSWORD_HASH);
        record.setRealName("Updated Name");

        AccountRecord saved = accountRepository.save(record);

        assertThat(saved.getRealName()).isEqualTo("Updated Name");
    }
}