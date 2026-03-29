package csd.t6.backend.approval;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.lenient;

import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ContentVersionRepositoryTest {

  @Mock
  private ContentVersionRepository contentVersionRepository;

  private UUID courseId;

  @BeforeEach
  void setUp() {
    courseId = UUID.randomUUID();
  }

  // --- getLatestVersionNumberForCourse ---

  @Test
  @DisplayName("Should return latest version number")
  void shouldReturnLatestVersionNumber() {
    lenient().when(contentVersionRepository.getLatestVersionNumberForCourse(courseId)).thenReturn(3);

    int result = contentVersionRepository.getLatestVersionNumberForCourse(courseId);

    assertThat(result).isEqualTo(3);
  }

  @Test
  @DisplayName("Should return 0 when no versions exist")
  void shouldReturnZeroWhenNoVersionsExist() {
    lenient().when(contentVersionRepository.getLatestVersionNumberForCourse(courseId)).thenReturn(0);

    int result = contentVersionRepository.getLatestVersionNumberForCourse(courseId);

    assertThat(result).isEqualTo(0);
  }
}