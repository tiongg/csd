package csd.t6.backend.auth.oauth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import csd.t6.backend.exceptions.BadRequestException;
import csd.t6.jooq.accounts.tables.records.OauthCodeRecord;

@ExtendWith(MockitoExtension.class)
class OAuthCodeServiceTest {

  @Mock
  private OAuthCodeRepository oauthCodeRepository;

  @InjectMocks
  private OAuthCodeService oauthCodeService;

  private UUID accountId;
  private String validCode;

  @BeforeEach
  void setUp() {
    accountId = UUID.randomUUID();
    validCode = "valid-code-32-chars-long-enough";
  }

  // --- createCode ---

  @Test
  @DisplayName("Should create code successfully")
  void shouldCreateCodeSuccessfully() {
    OauthCodeRecord mockRecord = mock(OauthCodeRecord.class);
    when(oauthCodeRepository.insert(any(), eq(accountId), any(OffsetDateTime.class)))
        .thenReturn(mockRecord);

    String result = oauthCodeService.createCode(accountId);

    assertThat(result).isNotNull();
    assertThat(result.length()).isEqualTo(32); // Base64 encoded 24 bytes = 32 chars
    verify(oauthCodeRepository).insert(any(), eq(accountId), any(OffsetDateTime.class));
  }

  @Test
  @DisplayName("Should create unique codes")
  void shouldCreateUniqueCodes() {
    when(oauthCodeRepository.insert(any(), eq(accountId), any(OffsetDateTime.class)))
        .thenReturn(mock(OauthCodeRecord.class));

    String code1 = oauthCodeService.createCode(accountId);
    String code2 = oauthCodeService.createCode(accountId);
    String code3 = oauthCodeService.createCode(accountId);

    assertThat(code1).isNotEqualTo(code2);
    assertThat(code2).isNotEqualTo(code3);
    assertThat(code1).isNotEqualTo(code3);
    verify(oauthCodeRepository, times(3)).insert(any(), eq(accountId), any(OffsetDateTime.class));
  }

  @Test
  @DisplayName("Should use URL-safe Base64 encoding")
  void shouldUseUrlSafeBase64Encoding() {
    when(oauthCodeRepository.insert(any(), eq(accountId), any(OffsetDateTime.class)))
        .thenReturn(mock(OauthCodeRecord.class));

    String code = oauthCodeService.createCode(accountId);

    // URL-safe Base64 doesn't contain +, /, or = padding
    assertThat(code).doesNotContain("+");
    assertThat(code).doesNotContain("/");
    assertThat(code).doesNotContain("=");
  }

  // --- consumeCode ---

  @Test
  @DisplayName("Should consume valid code successfully")
  void shouldConsumeValidCodeSuccessfully() {
    OauthCodeRecord mockRecord = mock(OauthCodeRecord.class);
    when(mockRecord.getAccountId()).thenReturn(accountId);
    when(oauthCodeRepository.findValidByCode(validCode)).thenReturn(Optional.of(mockRecord));

    UUID result = oauthCodeService.consumeCode(validCode);

    assertThat(result).isEqualTo(accountId);
    verify(oauthCodeRepository).findValidByCode(validCode);
    verify(oauthCodeRepository).deleteByCode(validCode);
  }

  @Test
  @DisplayName("Should throw when code is invalid")
  void shouldThrowWhenCodeIsInvalid() {
    when(oauthCodeRepository.findValidByCode("invalid-code")).thenReturn(Optional.empty());

    assertThatThrownBy(() -> oauthCodeService.consumeCode("invalid-code"))
        .isInstanceOf(BadRequestException.class)
        .hasMessageContaining("Invalid or expired code");
    verify(oauthCodeRepository).findValidByCode("invalid-code");
    verify(oauthCodeRepository, never()).deleteByCode(any());
  }

  @Test
  @DisplayName("Should throw when code is expired")
  void shouldThrowWhenCodeIsExpired() {
    when(oauthCodeRepository.findValidByCode(validCode)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> oauthCodeService.consumeCode(validCode))
        .isInstanceOf(BadRequestException.class)
        .hasMessageContaining("Invalid or expired code");
    verify(oauthCodeRepository).findValidByCode(validCode);
    verify(oauthCodeRepository, never()).deleteByCode(any());
  }

  @Test
  @DisplayName("Should delete code after consuming")
  void shouldDeleteCodeAfterConsuming() {
    OauthCodeRecord mockRecord = mock(OauthCodeRecord.class);
    when(mockRecord.getAccountId()).thenReturn(accountId);
    when(oauthCodeRepository.findValidByCode(validCode)).thenReturn(Optional.of(mockRecord));

    oauthCodeService.consumeCode(validCode);

    verify(oauthCodeRepository).deleteByCode(validCode);
  }

  @Test
  @DisplayName("Should handle same code consumed twice")
  void shouldHandleSameCodeConsumedTwice() {
    OauthCodeRecord mockRecord = mock(OauthCodeRecord.class);
    when(mockRecord.getAccountId()).thenReturn(accountId);
    when(oauthCodeRepository.findValidByCode(validCode)).thenReturn(Optional.of(mockRecord));

    // First consumption succeeds
    UUID result1 = oauthCodeService.consumeCode(validCode);
    assertThat(result1).isEqualTo(accountId);

    // Second consumption fails because code is deleted
    when(oauthCodeRepository.findValidByCode(validCode)).thenReturn(Optional.empty());
    assertThatThrownBy(() -> oauthCodeService.consumeCode(validCode))
        .isInstanceOf(BadRequestException.class)
        .hasMessageContaining("Invalid or expired code");

    verify(oauthCodeRepository, times(2)).findValidByCode(validCode);
    verify(oauthCodeRepository, times(1)).deleteByCode(validCode);
  }
}
