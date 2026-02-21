package csd.t6.backend.account;

import csd.t6.backend.account.dto.request.AccountUpdateRequest;
import csd.t6.backend.auth.oauth.OAuth2ProviderRepository;
import csd.t6.backend.exceptions.BadRequestException;
import csd.t6.jooq.accounts.enums.OauthProvider;
import csd.t6.jooq.accounts.tables.records.AccountRecord;
import csd.t6.jooq.accounts.tables.records.OauthConnectionRecord;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static csd.t6.jooq.accounts.tables.Account.ACCOUNT;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AccountServiceTest {

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private OAuth2ProviderRepository oAuthProviderRepository;

    @InjectMocks
    private AccountService accountService;

    private AccountRecord mockAccount;

    @BeforeEach
    void setUp() {
        mockAccount = mock(AccountRecord.class);
        lenient().when(mockAccount.getId()).thenReturn(UUID.randomUUID());
        lenient().when(mockAccount.getEmail()).thenReturn("test@example.com");
        lenient().when(mockAccount.getUsername()).thenReturn("testuser");
    }

    // --- createNewAccount ---

    @Test
    @DisplayName("Should create account successfully")
    void shouldCreateAccountSuccessfully() {
        when(accountRepository.exists(ACCOUNT.USERNAME, "testuser")).thenReturn(false);
        when(accountRepository.exists(ACCOUNT.EMAIL, "test@example.com")).thenReturn(false);
        when(accountRepository.insert("test@example.com", "testuser", "hashedpw")).thenReturn(mockAccount);

        AccountRecord result = accountService.createNewAccount("testuser", "test@example.com", "hashedpw");

        assertThat(result).isNotNull();
        verify(accountRepository).insert("test@example.com", "testuser", "hashedpw");
    }

    @Test
    @DisplayName("Should throw BadRequestException when username already exists")
    void shouldThrowWhenUsernameExists() {
        when(accountRepository.exists(ACCOUNT.USERNAME, "testuser")).thenReturn(true);

        assertThatThrownBy(() ->
            accountService.createNewAccount("testuser", "test@example.com", "hashedpw"))
            .isInstanceOf(BadRequestException.class)
            .hasMessageContaining("Username already exists");
    }

    @Test
    @DisplayName("Should throw BadRequestException when email already exists")
    void shouldThrowWhenEmailExists() {
        when(accountRepository.exists(ACCOUNT.USERNAME, "testuser")).thenReturn(false);
        when(accountRepository.exists(ACCOUNT.EMAIL, "test@example.com")).thenReturn(true);

        assertThatThrownBy(() ->
            accountService.createNewAccount("testuser", "test@example.com", "hashedpw"))
            .isInstanceOf(BadRequestException.class)
            .hasMessageContaining("Email already exists");
    }

    // --- getAllAccounts ---

    @Test
    @DisplayName("Should return all accounts")
    void shouldReturnAllAccounts() {
        when(accountRepository.findAll()).thenReturn(List.of(mockAccount));

        List<AccountRecord> result = accountService.getAllAccounts();

        assertThat(result).hasSize(1);
    }

    // --- deleteAccount ---

    @Test
    @DisplayName("Should delete account successfully")
    void shouldDeleteAccountSuccessfully() {
        UUID id = UUID.randomUUID();
        when(accountRepository.delete(ACCOUNT.ID, id)).thenReturn(1);

        assertThatNoException().isThrownBy(() -> accountService.deleteAccount(id));
    }

    @Test
    @DisplayName("Should throw BadRequestException when deleting non-existent account")
    void shouldThrowWhenDeletingNonExistentAccount() {
        UUID id = UUID.randomUUID();
        when(accountRepository.delete(ACCOUNT.ID, id)).thenReturn(0);

        assertThatThrownBy(() -> accountService.deleteAccount(id))
            .isInstanceOf(BadRequestException.class)
            .hasMessageContaining("Account does not exist");
    }

    // --- updateAccount ---

    @Test
    @DisplayName("Should update username successfully")
    void shouldUpdateUsernameSuccessfully() {
        UUID id = UUID.randomUUID();
        AccountRecord existing = mock(AccountRecord.class);
        when(existing.getUsername()).thenReturn("olduser");
        when(accountRepository.findOneBy(ACCOUNT.ID, id)).thenReturn(Optional.of(existing));
        when(accountRepository.exists(ACCOUNT.USERNAME, "newuser")).thenReturn(false);
        when(accountRepository.save(existing)).thenReturn(existing);

        AccountUpdateRequest request = new AccountUpdateRequest("newuser", null);
        accountService.updateAccount(id, request);

        verify(existing).setUsername("newuser");
        verify(accountRepository).save(existing);
    }

    @Test
    @DisplayName("Should throw when updating to existing username")
    void shouldThrowWhenUpdatingToExistingUsername() {
        UUID id = UUID.randomUUID();
        AccountRecord existing = mock(AccountRecord.class);
        when(existing.getUsername()).thenReturn("olduser");
        when(accountRepository.findOneBy(ACCOUNT.ID, id)).thenReturn(Optional.of(existing));
        when(accountRepository.exists(ACCOUNT.USERNAME, "takenuser")).thenReturn(true);

        AccountUpdateRequest request = new AccountUpdateRequest("takenuser", null);

        assertThatThrownBy(() -> accountService.updateAccount(id, request))
            .isInstanceOf(BadRequestException.class)
            .hasMessageContaining("Username already exists");
    }

    @Test
    @DisplayName("Should update realName successfully")
    void shouldUpdateRealNameSuccessfully() {
        UUID id = UUID.randomUUID();
        AccountRecord existing = mock(AccountRecord.class);
        lenient().when(existing.getUsername()).thenReturn("testuser");
        when(accountRepository.findOneBy(ACCOUNT.ID, id)).thenReturn(Optional.of(existing));
        when(accountRepository.save(existing)).thenReturn(existing);

        AccountUpdateRequest request = new AccountUpdateRequest(null, "John Doe");
        accountService.updateAccount(id, request);

        verify(existing).setRealName("John Doe");
        verify(accountRepository).save(existing);
    }

    @Test
    @DisplayName("Should throw when updating non-existent account")
    void shouldThrowWhenUpdatingNonExistentAccount() {
        UUID id = UUID.randomUUID();
        when(accountRepository.findOneBy(ACCOUNT.ID, id)).thenReturn(Optional.empty());

        assertThatThrownBy(() ->
            accountService.updateAccount(id, new AccountUpdateRequest("newuser", null)))
            .isInstanceOf(BadRequestException.class)
            .hasMessageContaining("Account does not exist");
    }

    // --- createWithOAuthLogin ---

    @Test
    @DisplayName("Should create new account for OAuth login when email not found")
    void shouldCreateNewAccountForOAuthLogin() {
        when(accountRepository.findOneBy(ACCOUNT.EMAIL, "oauth@example.com"))
            .thenReturn(Optional.empty());
        when(accountRepository.exists(ACCOUNT.USERNAME, "oauth")).thenReturn(false);
        when(accountRepository.insert("oauth@example.com", "oauth", null, "OAuth User"))
            .thenReturn(mockAccount);

        OauthConnectionRecord oauthRecord = mock(OauthConnectionRecord.class);
        when(oAuthProviderRepository.insert(any(), eq(OauthProvider.GOOGLE), eq("google123"), eq("oauth@example.com")))
            .thenReturn(oauthRecord);

        OauthConnectionRecord result = accountService.createWithOAuthLogin(
            "oauth@example.com", "OAuth User", OauthProvider.GOOGLE, "google123");

        assertThat(result).isNotNull();
    }

    @Test
    @DisplayName("Should use existing account for OAuth login when email found")
    void shouldUseExistingAccountForOAuthLogin() {
        when(accountRepository.findOneBy(ACCOUNT.EMAIL, "existing@example.com"))
            .thenReturn(Optional.of(mockAccount));

        OauthConnectionRecord oauthRecord = mock(OauthConnectionRecord.class);
        when(oAuthProviderRepository.insert(any(), eq(OauthProvider.GOOGLE), eq("google456"), eq("existing@example.com")))
            .thenReturn(oauthRecord);

        OauthConnectionRecord result = accountService.createWithOAuthLogin(
            "existing@example.com", "Existing User", OauthProvider.GOOGLE, "google456");

        assertThat(result).isNotNull();
        verify(accountRepository, never()).insert(anyString(), anyString(), isNull(), anyString());
    }
}