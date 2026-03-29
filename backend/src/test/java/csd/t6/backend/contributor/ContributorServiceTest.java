package csd.t6.backend.contributor;

import static csd.t6.jooq.public_.tables.PendingContributors.PENDING_CONTRIBUTORS;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import csd.t6.backend.contributor.dto.response.ImageUploadResponse;
import csd.t6.backend.exceptions.BadRequestException;
import csd.t6.backend.notification.NotificationService;
import csd.t6.backend.utils.FileService;
import csd.t6.jooq.public_.tables.records.PendingContributorsRecord;

@ExtendWith(MockitoExtension.class)
class ContributorServiceTest {

  @Mock
  private PendingContributorRepository pendingContributorRepository;

  @Mock
  private FileService fileService;

  @Mock
  private NotificationService notificationService;

  @InjectMocks
  private ContributorService contributorService;

  private UUID courseId;

  @BeforeEach
  void setUp() {
    courseId = UUID.randomUUID();
  }

  // --- insertPendingContributor ---

  @Test
  @DisplayName("Should insert pending contributor successfully")
  void shouldInsertPendingContributor() {
    UUID learnerId = UUID.randomUUID();
    when(pendingContributorRepository.exists(PENDING_CONTRIBUTORS.LEARNER_ID, learnerId)).thenReturn(false);
    when(pendingContributorRepository.insertPendingContributor(learnerId))
        .thenReturn(mock(PendingContributorsRecord.class));

    contributorService.insertPendingContributor(learnerId);

    verify(pendingContributorRepository).insertPendingContributor(learnerId);
  }

  @Test
  @DisplayName("Should throw when user is already pending")
  void shouldThrowWhenAlreadyPending() {
    UUID learnerId = UUID.randomUUID();
    when(pendingContributorRepository.exists(PENDING_CONTRIBUTORS.LEARNER_ID, learnerId)).thenReturn(true);

    assertThatThrownBy(() -> contributorService.insertPendingContributor(learnerId))
        .isInstanceOf(BadRequestException.class).hasMessageContaining("pending approval");

    verify(pendingContributorRepository, never()).insertPendingContributor(any());
  }

  // --- getFileUploadUrl ---
  //
  // FIX: The service generates its own UUID internally when building the S3 key,
  // so we cannot predict the exact key string at test-setup time. The old tests
  // stubbed a hardcoded UUID that never matched the service-generated one, causing
  // PotentialStubbingProblem. We now use argThat() to match on key prefix + extension.

  @Test
  @DisplayName("Should generate file upload URL for png")
  void shouldGenerateFileUploadUrlForPng() {
    String prefix = "editor/" + courseId + "/";
    when(fileService.generatePresignedUploadUrl(argThat(k -> k.startsWith(prefix) && k.endsWith(".png"))))
        .thenReturn("presigned-url");
    when(fileService.getPublicUrl(argThat(k -> k.startsWith(prefix) && k.endsWith(".png"))))
        .thenReturn("public-url");

    ImageUploadResponse result = contributorService.getFileUploadUrl(courseId, "png");

    assertThat(result.url()).isEqualTo("presigned-url");
    assertThat(result.publicUrl()).isEqualTo("public-url");
    assertThat(result.key()).matches("editor/" + courseId + "/[a-f0-9\\-]+\\.png");
  }

  @Test
  @DisplayName("Should generate file upload URL for jpg")
  void shouldGenerateFileUploadUrlForJpg() {
    String prefix = "editor/" + courseId + "/";
    when(fileService.generatePresignedUploadUrl(argThat(k -> k.startsWith(prefix) && k.endsWith(".jpg"))))
        .thenReturn("presigned-url");
    when(fileService.getPublicUrl(argThat(k -> k.startsWith(prefix) && k.endsWith(".jpg"))))
        .thenReturn("public-url");

    ImageUploadResponse result = contributorService.getFileUploadUrl(courseId, "jpg");

    assertThat(result.url()).isEqualTo("presigned-url");
    assertThat(result.publicUrl()).isEqualTo("public-url");
    assertThat(result.key()).matches("editor/" + courseId + "/[a-f0-9\\-]+\\.jpg");
  }

  @Test
  @DisplayName("Should generate file upload URL for jpeg")
  void shouldGenerateFileUploadUrlForJpeg() {
    String prefix = "editor/" + courseId + "/";
    when(fileService.generatePresignedUploadUrl(argThat(k -> k.startsWith(prefix) && k.endsWith(".jpeg"))))
        .thenReturn("presigned-url");
    when(fileService.getPublicUrl(argThat(k -> k.startsWith(prefix) && k.endsWith(".jpeg"))))
        .thenReturn("public-url");

    ImageUploadResponse result = contributorService.getFileUploadUrl(courseId, "jpeg");

    assertThat(result.url()).isEqualTo("presigned-url");
    assertThat(result.publicUrl()).isEqualTo("public-url");
    assertThat(result.key()).matches("editor/" + courseId + "/[a-f0-9\\-]+\\.jpeg");
  }

  @Test
  @DisplayName("Should throw when file type is invalid")
  void shouldThrowWhenFileTypeIsInvalid() {
    assertThatThrownBy(() -> contributorService.getFileUploadUrl(courseId, "gif"))
        .isInstanceOf(BadRequestException.class).hasMessageContaining("Invalid file type");
  }

  @Test
  @DisplayName("Should throw when file type is null")
  void shouldThrowWhenFileTypeIsNull() {
    // FIX: requires ContributorService to use null-safe check (!"png".equals(ext))
    // so null throws BadRequestException instead of NullPointerException.
    assertThatThrownBy(() -> contributorService.getFileUploadUrl(courseId, null))
        .isInstanceOf(BadRequestException.class).hasMessageContaining("Invalid file type");
  }
}