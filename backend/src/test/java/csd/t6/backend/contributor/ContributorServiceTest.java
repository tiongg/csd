package csd.t6.backend.contributor;

import static csd.t6.jooq.public_.tables.PendingContributors.PENDING_CONTRIBUTORS;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
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

  @Test
  @DisplayName("Should generate file upload URL for png")
  void shouldGenerateFileUploadUrlForPng() {
    String expectedKey = String.format("editor/%s/%s.png", courseId, UUID.randomUUID());
    String expectedUrl = "presigned-url";
    String expectedPublicUrl = "public-url";

    when(fileService.generatePresignedUploadUrl(expectedKey)).thenReturn(expectedUrl);
    when(fileService.getPublicUrl(expectedKey)).thenReturn(expectedPublicUrl);

    ImageUploadResponse result = contributorService.getFileUploadUrl(courseId, "png");

    assertThat(result.url()).isEqualTo(expectedUrl);
    assertThat(result.key()).isEqualTo(expectedKey);
    assertThat(result.publicUrl()).isEqualTo(expectedPublicUrl);
  }

/*************  ✨ Windsurf Command ⭐  *************/
  /**
   * Verifies that the getFileUploadUrl method returns a valid presigned URL for a jpg file.
   * The method should return an ImageUploadResponse containing the presigned URL, the S3 object key, and the public URL.
   */
/*******  bc6fb103-a33f-4a2b-9d9e-964276e564aa  *******/
  @Test
  @DisplayName("Should generate file upload URL for jpg")
  void shouldGenerateFileUploadUrlForJpg() {
    String expectedKey = String.format("editor/%s/%s.jpg", courseId, UUID.randomUUID());
    String expectedUrl = "presigned-url";
    String expectedPublicUrl = "public-url";

    when(fileService.generatePresignedUploadUrl(expectedKey)).thenReturn(expectedUrl);
    when(fileService.getPublicUrl(expectedKey)).thenReturn(expectedPublicUrl);

    ImageUploadResponse result = contributorService.getFileUploadUrl(courseId, "jpg");

    assertThat(result.url()).isEqualTo(expectedUrl);
    assertThat(result.key()).isEqualTo(expectedKey);
    assertThat(result.publicUrl()).isEqualTo(expectedPublicUrl);
  }

  @Test
  @DisplayName("Should generate file upload URL for jpeg")
  void shouldGenerateFileUploadUrlForJpeg() {
    String expectedKey = String.format("editor/%s/%s.jpeg", courseId, UUID.randomUUID());
    String expectedUrl = "presigned-url";
    String expectedPublicUrl = "public-url";

    when(fileService.generatePresignedUploadUrl(expectedKey)).thenReturn(expectedUrl);
    when(fileService.getPublicUrl(expectedKey)).thenReturn(expectedPublicUrl);

    ImageUploadResponse result = contributorService.getFileUploadUrl(courseId, "jpeg");

    assertThat(result.url()).isEqualTo(expectedUrl);
    assertThat(result.key()).isEqualTo(expectedKey);
    assertThat(result.publicUrl()).isEqualTo(expectedPublicUrl);
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
    assertThatThrownBy(() -> contributorService.getFileUploadUrl(courseId, null))
        .isInstanceOf(BadRequestException.class).hasMessageContaining("Invalid file type");
  }
}
