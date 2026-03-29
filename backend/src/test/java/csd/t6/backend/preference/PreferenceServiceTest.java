package csd.t6.backend.preference;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import csd.t6.backend.exceptions.BadRequestException;
import csd.t6.jooq.accounts.tables.records.PreferenceRecord;

@ExtendWith(MockitoExtension.class)
class PreferenceServiceTest {

  @Mock
  private PreferenceRepository preferenceRepository;

  @InjectMocks
  private PreferenceService preferenceService;

  private UUID accountId;
  private PreferenceRecord mockPreference;

  @BeforeEach
  void setUp() {
    accountId = UUID.randomUUID();
    mockPreference = mock(PreferenceRecord.class);
    lenient().when(mockPreference.getAccountId()).thenReturn(accountId);
    lenient().when(mockPreference.getTopic()).thenReturn("Java");
  }

  @Test
  @DisplayName("Should return topics for account")
  void shouldReturnTopics() {
    List<String> topics = List.of("Java", "Python", "JavaScript");
    when(preferenceRepository.findTopics(accountId)).thenReturn(topics);

    List<String> result = preferenceService.getTopics(accountId);

    assertThat(result).isEqualTo(topics);
  }

  @Test
  @DisplayName("Should return empty list when no topics found")
  void shouldReturnEmptyListWhenNoTopicsFound() {
    when(preferenceRepository.findTopics(accountId)).thenReturn(List.of());

    List<String> result = preferenceService.getTopics(accountId);

    assertThat(result).isEmpty();
  }

  @Test
  @DisplayName("Should create new preferences")
  void shouldCreateNewPreferences() {
    List<String> preferences = List.of("Java", "Python");
    when(preferenceRepository.addPreference(accountId, preferences)).thenReturn(List.of(mockPreference));

    List<PreferenceRecord> result = preferenceService.createNewPreference(accountId, preferences);

    verify(preferenceRepository).delete(any(), eq(accountId));
    verify(preferenceRepository).addPreference(accountId, preferences);
    assertThat(result).hasSize(1);
  }

  @Test
  @DisplayName("Should throw when preference list is empty")
  void shouldThrowWhenPreferenceListIsEmpty() {
    assertThatThrownBy(() -> preferenceService.createNewPreference(accountId, List.of()))
        .isInstanceOf(BadRequestException.class).hasMessageContaining("No preference selected");
  }

  @Test
  @DisplayName("Should throw when preference list is null")
  void shouldThrowWhenPreferenceListIsNull() {
    assertThatThrownBy(() -> preferenceService.createNewPreference(accountId, null))
        .isInstanceOf(BadRequestException.class);
  }
}
