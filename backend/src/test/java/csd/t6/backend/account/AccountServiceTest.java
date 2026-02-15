package csd.t6.backend.account;

import csd.t6.backend.account.dto.AccountUpdateRequest;
import csd.t6.backend.auth.OAuth2ProviderRepository;
import csd.t6.backend.exceptions.BadRequestException;
import csd.t6.jooq.accounts.tables.records.AccountRecord;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static csd.t6.jooq.accounts.tables.Account.ACCOUNT;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AccountServiceTest {

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private OAuth2ProviderRepository oAuth2ProviderRepository;

    @InjectMocks
    private AccountService accountService;

    @Test
    @DisplayName("Should create a new account when username and email are unique")
    void createNewAccount_unique_ok() {
        // arrange
        String username = "alice";
        String email = "alice@example.com";
        String hashed = "hashed";

        when(accountRepository.exists(ACCOUNT.USERNAME, username)).thenReturn(false);
        when(accountRepository.exists(ACCOUNT.EMAIL, email)).thenReturn(false);

        AccountRecord created = mock(AccountRecord.class);
        when(accountRepository.insert(email, username, hashed)).thenReturn(created);

        // act
        AccountRecord result = accountService.createNewAccount(username, email, hashed);

        // assert
        assertThat(result).isEqualTo(created);
        verify(accountRepository).exists(ACCOUNT.USERNAME, username);
        verify(accountRepository).exists(ACCOUNT.EMAIL, email);
        verify(accountRepository).insert(email, username, hashed);
    }

    @Test
    @DisplayName("Should throw BadRequestException when username already exists")
    void createNewAccount_usernameExists_badRequest() {
        // arrange
        String username = "bob";
        String email = "bob@example.com";

        when(accountRepository.exists(ACCOUNT.USERNAME, username)).thenReturn(true);

        // act + assert
        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> accountService.createNewAccount(username, email, "hash"));
        assertThat(ex).hasMessageContaining("Username already exists");

        verify(accountRepository).exists(ACCOUNT.USERNAME, username);
        verify(accountRepository, never()).exists(eq(ACCOUNT.EMAIL), any());
        verify(accountRepository, never()).insert(any(), any(), any());
    }

    @Test
    @DisplayName("Should throw BadRequestException when email already exists")
    void createNewAccount_emailExists_badRequest() {
        // arrange
        String username = "charlie";
        String email = "charlie@example.com";

        when(accountRepository.exists(ACCOUNT.USERNAME, username)).thenReturn(false);
        when(accountRepository.exists(ACCOUNT.EMAIL, email)).thenReturn(true);

        // act + assert
        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> accountService.createNewAccount(username, email, "hash"));
        assertThat(ex).hasMessageContaining("Email already exists");

        verify(accountRepository).exists(ACCOUNT.USERNAME, username);
        verify(accountRepository).exists(ACCOUNT.EMAIL, email);
        verify(accountRepository, never()).insert(any(), any(), any());
    }

    @Test
    @DisplayName("Should update account username and realName when valid")
    void updateAccount_validChanges_ok() {
        // arrange
        UUID id = UUID.randomUUID();
        AccountRecord existing = mock(AccountRecord.class);
        when(existing.getUsername()).thenReturn("oldname");
        when(accountRepository.findOneBy(ACCOUNT.ID, id)).thenReturn(Optional.of(existing));
        when(accountRepository.exists(ACCOUNT.USERNAME, "newname")).thenReturn(false);

        AccountUpdateRequest req = new AccountUpdateRequest("newname", "New Real Name");

        AccountRecord saved = mock(AccountRecord.class);
        when(accountRepository.save(existing)).thenReturn(saved);

        // act
        AccountRecord result = accountService.updateAccount(id, req);

        // assert
        assertThat(result).isEqualTo(saved);
        verify(existing).setUsername("newname");
        verify(existing).setRealName("New Real Name");
        verify(accountRepository).save(existing);
    }

    @Test
    @DisplayName("Should throw BadRequestException when updating a non-existent account")
    void updateAccount_nonExisting_badRequest() {
        // arrange
        UUID id = UUID.randomUUID();
        when(accountRepository.findOneBy(ACCOUNT.ID, id)).thenReturn(Optional.empty());

        // act + assert
        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> accountService.updateAccount(id, new AccountUpdateRequest("name", "Real")));
        assertThat(ex).hasMessageContaining("Account does not exist");

        verify(accountRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw BadRequestException when updating to an existing username owned by another user")
    void updateAccount_usernameTaken_badRequest() {
        // arrange
        UUID id = UUID.randomUUID();
        AccountRecord existing = mock(AccountRecord.class);
        when(existing.getUsername()).thenReturn("old");
        when(accountRepository.findOneBy(ACCOUNT.ID, id)).thenReturn(Optional.of(existing));
        when(accountRepository.exists(ACCOUNT.USERNAME, "taken")).thenReturn(true);

        // act + assert
        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> accountService.updateAccount(id, new AccountUpdateRequest("taken", null)));
        assertThat(ex).hasMessageContaining("Username already exists");

        verify(accountRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should delete an existing account successfully")
    void deleteAccount_existing_ok() {
        // arrange
        UUID id = UUID.randomUUID();
        when(accountRepository.delete(ACCOUNT.ID, id)).thenReturn(1);

        // act (no exception expected)
        accountService.deleteAccount(id);

        // assert
        verify(accountRepository).delete(ACCOUNT.ID, id);
    }

    @Test
    @DisplayName("Should throw BadRequestException when deleting a non-existent account")
    void deleteAccount_missing_badRequest() {
        // arrange
        UUID id = UUID.randomUUID();
        when(accountRepository.delete(ACCOUNT.ID, id)).thenReturn(0);

        // act + assert
        BadRequestException ex = assertThrows(BadRequestException.class, () -> accountService.deleteAccount(id));
        assertThat(ex).hasMessageContaining("Account does not exist");
    }
}
