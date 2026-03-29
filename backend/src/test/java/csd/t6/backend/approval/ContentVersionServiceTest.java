package csd.t6.backend.approval;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Duration;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import csd.t6.backend.approval.dto.response.LatestContentVersionResponse;
import csd.t6.backend.approval.dto.response.ReviewVersionResponse;
import csd.t6.backend.approval.util.ContentVersionWithCourseRecord;
import csd.t6.backend.course.CourseReelService;
import csd.t6.backend.course.CourseRepository;
import csd.t6.backend.exceptions.BadRequestException;
import csd.t6.backend.notification.NotificationService;
import csd.t6.backend.tag.TagService;
import csd.t6.backend.team.TeamService;
import csd.t6.backend.utils.FileService;
import csd.t6.backend.utils.dto.PresignedUrlResponse;
import csd.t6.jooq.accounts.enums.Roles;
import csd.t6.jooq.public_.enums.ContentStatus;
import csd.t6.jooq.public_.enums.NotificationType;
import csd.t6.jooq.public_.tables.records.ContentVersionRecord;
import csd.t6.jooq.public_.tables.records.CourseRecord;

@ExtendWith(MockitoExtension.class)
class ContentVersionServiceTest {

  @Mock
  private ContentVersionRepository contentVersionRepository;

  @Mock
  private CourseRepository courseRepository;

  @Mock
  private TeamService teamService;

  @Mock
  private FileService fileService;

  @Mock
  private CourseReelService courseReelService;

  @Mock
  private NotificationService notificationService;

  @Mock
  private TagService tagService;

  @InjectMocks
  private ContentVersionService contentVersionService;

  private UUID courseId;
  private UUID contentVersionId;
  private UUID teamId;
  private UUID requesterId;
  private ContentVersionRecord mockVersion;
  private CourseRecord mockCourse;

  @BeforeEach
  void setUp() {
    courseId = UUID.randomUUID();
    contentVersionId = UUID.randomUUID();
    teamId = UUID.randomUUID();
    requesterId = UUID.randomUUID();
    mockVersion = mock(ContentVersionRecord.class);
    mockCourse = mock(CourseRecord.class);

    lenient().when(mockVersion.getId()).thenReturn(contentVersionId);
    lenient().when(mockVersion.getCourseId()).thenReturn(courseId);
    lenient().when(mockVersion.getVersion()).thenReturn(1);
    lenient().when(mockVersion.getStatus()).thenReturn(ContentStatus.PENDING);
    lenient().when(mockVersion.getDescription()).thenReturn("Test version");
    lenient().when(mockVersion.getPublishedAt()).thenReturn(java.time.LocalDateTime.now());
    lenient().when(mockCourse.getId()).thenReturn(courseId);
    lenient().when(mockCourse.getTeamId()).thenReturn(teamId);
    lenient().when(mockCourse.getTitle()).thenReturn("Test Course");
  }

  // --- createNewContentVersion ---

  @Test
  @DisplayName("Should create new content version with incrementing version number")
  void shouldCreateNewContentVersionWithIncrementingVersion() {
    ContentVersionRecord mockRecord = mock(ContentVersionRecord.class);
    when(contentVersionRepository.getLatestVersionNumberForCourse(courseId)).thenReturn(3);
    when(contentVersionRepository.create(eq(courseId), eq(4), eq("New description"))).thenReturn(mockRecord);

    ContentVersionRecord result = contentVersionService.createNewContentVersion(courseId, "New description");

    assertThat(result).isNotNull();
    verify(contentVersionRepository).getLatestVersionNumberForCourse(courseId);
    verify(contentVersionRepository).create(courseId, 4, "New description");
  }

  @Test
  @DisplayName("Should create version 1 when no versions exist")
  void shouldCreateVersionOneWhenNoVersionsExist() {
    ContentVersionRecord mockRecord = mock(ContentVersionRecord.class);
    when(contentVersionRepository.getLatestVersionNumberForCourse(courseId)).thenReturn(0);
    when(contentVersionRepository.create(eq(courseId), eq(1), eq("First version"))).thenReturn(mockRecord);

    ContentVersionRecord result = contentVersionService.createNewContentVersion(courseId, "First version");

    assertThat(result).isNotNull();
    verify(contentVersionRepository).create(courseId, 1, "First version");
  }

  // --- generateCourseMaterialUploadUrl ---

  @Test
  @DisplayName("Should generate upload URL when user is team member")
  void shouldGenerateUploadUrlWhenUserIsTeamMember() {
    when(courseRepository.findById(courseId)).thenReturn(Optional.of(mockCourse));
    when(teamService.isTeamMember(teamId, requesterId)).thenReturn(true);
    lenient().when(mockVersion.getId()).thenReturn(contentVersionId);
    when(contentVersionRepository.create(eq(courseId), eq(1), any())).thenReturn(mockVersion);
    String expectedKey = String.format("course-materials/%s/%s.json", courseId, contentVersionId);
    String expectedUrl = "presigned-url";
    when(fileService.generatePresignedUploadUrl(expectedKey, Duration.ofMinutes(5))).thenReturn(expectedUrl);

    PresignedUrlResponse result = contentVersionService.generateCourseMaterialUploadUrl(courseId, requesterId, "Test upload");

    assertThat(result.url()).isEqualTo(expectedUrl);
    assertThat(result.key()).isEqualTo(expectedKey);
    verify(contentVersionRepository).rejectAllPendingVersions(courseId);
    verify(notificationService).sendToRole(Roles.ADMIN, NotificationType.COURSE_AWAITING_REVIEW,
        "Course Review", "Course: Test Course", contentVersionId);
  }

  @Test
  @DisplayName("Should throw when user is not team member for upload")
  void shouldThrowWhenUserIsNotTeamMemberForUpload() {
    when(courseRepository.findById(courseId)).thenReturn(Optional.of(mockCourse));
    when(teamService.isTeamMember(teamId, requesterId)).thenReturn(false);

    assertThatThrownBy(() -> contentVersionService.generateCourseMaterialUploadUrl(courseId, requesterId, "Test"))
        .isInstanceOf(BadRequestException.class)
        .hasMessageContaining("member of the team");
    verify(contentVersionRepository, never()).rejectAllPendingVersions(any());
    verify(contentVersionRepository, never()).create(any(), any(), any());
  }

  @Test
  @DisplayName("Should throw when course not found for upload")
  void shouldThrowWhenCourseNotFoundForUpload() {
    when(courseRepository.findById(courseId)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> contentVersionService.generateCourseMaterialUploadUrl(courseId, requesterId, "Test"))
        .isInstanceOf(BadRequestException.class)
        .hasMessageContaining("Course not found");
  }

  // --- getPastVersions ---

  @Test
  @DisplayName("Should get past versions sorted by version number descending")
  void shouldGetPastVersionsSortedByVersion() {
    ContentVersionRecord version1 = mock(ContentVersionRecord.class);
    ContentVersionRecord version2 = mock(ContentVersionRecord.class);
    ContentVersionRecord version3 = mock(ContentVersionRecord.class);
    lenient().when(version1.getVersion()).thenReturn(1);
    lenient().when(version2.getVersion()).thenReturn(2);
    lenient().when(version3.getVersion()).thenReturn(3);

    when(contentVersionRepository.findBy(any(), eq(courseId)))
        .thenReturn(List.of(version1, version2, version3));

    List<ContentVersionRecord> result = contentVersionService.getPastVersions(courseId);

    assertThat(result).hasSize(3);
    assertThat(result.get(0)).isEqualTo(version3); // Highest version first
    assertThat(result.get(1)).isEqualTo(version2);
    assertThat(result.get(2)).isEqualTo(version1);
  }

  @Test
  @DisplayName("Should return empty list when no versions exist")
  void shouldReturnEmptyListWhenNoVersionsExist() {
    when(contentVersionRepository.findBy(any(), eq(courseId))).thenReturn(List.of());

    List<ContentVersionRecord> result = contentVersionService.getPastVersions(courseId);

    assertThat(result).isEmpty();
  }

  // --- getLatestApprovedVersion ---

  @Test
  @DisplayName("Should get latest approved version successfully")
  void shouldGetLatestApprovedVersionSuccessfully() {
    ContentVersionRecord approvedVersion = mock(ContentVersionRecord.class);
    lenient().when(approvedVersion.getId()).thenReturn(UUID.randomUUID());
    lenient().when(approvedVersion.getVersion()).thenReturn(2);
    lenient().when(approvedVersion.getStatus()).thenReturn(ContentStatus.APPROVED);

    ContentVersionRecord pendingVersion = mock(ContentVersionRecord.class);
    lenient().when(pendingVersion.getVersion()).thenReturn(3);
    lenient().when(pendingVersion.getStatus()).thenReturn(ContentStatus.PENDING);

    when(contentVersionRepository.findBy(any(), eq(courseId)))
        .thenReturn(List.of(approvedVersion, pendingVersion));
    String expectedKey = String.format("course-materials/%s/%s.json", courseId, approvedVersion.getId());
    String expectedUrl = "download-url";
    when(fileService.generatePresignedDownloadUrl(expectedKey, Duration.ofMinutes(5))).thenReturn(expectedUrl);

    when(courseRepository.findById(courseId)).thenReturn(Optional.of(mockCourse));
    when(courseReelService.getReelUrlForCourse(mockCourse)).thenReturn("reel-url");
    when(tagService.getTagsForCourse(courseId)).thenReturn(List.of("tag1", "tag2"));

    LatestContentVersionResponse result = contentVersionService.getLatestApprovedVersion(courseId);

    assertThat(result).isNotNull();
    assertThat(result.downloadUrl()).isEqualTo(expectedUrl);
    assertThat(result.course()).isNotNull();
    verify(contentVersionRepository).findBy(any(), eq(courseId));
    verify(fileService).generatePresignedDownloadUrl(expectedKey, Duration.ofMinutes(5));
  }

  @Test
  @DisplayName("Should throw when no approved version exists")
  void shouldThrowWhenNoApprovedVersionExists() {
    ContentVersionRecord pendingVersion = mock(ContentVersionRecord.class);
    lenient().when(pendingVersion.getStatus()).thenReturn(ContentStatus.PENDING);

    when(contentVersionRepository.findBy(any(), eq(courseId))).thenReturn(List.of(pendingVersion));

    assertThatThrownBy(() -> contentVersionService.getLatestApprovedVersion(courseId))
        .isInstanceOf(BadRequestException.class)
        .hasMessageContaining("No content version found");
  }

  // --- getReviewVersion ---

  @Test
  @DisplayName("Should get review version successfully")
  void shouldGetReviewVersionSuccessfully() {
    lenient().when(mockVersion.getStatus()).thenReturn(ContentStatus.PENDING);
    String expectedKey = String.format("course-materials/%s/%s.json", courseId, contentVersionId);
    String expectedUrl = "review-url";
    when(fileService.generatePresignedDownloadUrl(expectedKey, Duration.ofMinutes(10))).thenReturn(expectedUrl);
    when(contentVersionRepository.findOneBy(any(), eq(contentVersionId))).thenReturn(Optional.of(mockVersion));

    when(courseRepository.findById(courseId)).thenReturn(Optional.of(mockCourse));
    when(courseReelService.getReelUrlForCourse(mockCourse)).thenReturn("reel-url");
    when(tagService.getTagsForCourse(courseId)).thenReturn(List.of("tag1"));

    ReviewVersionResponse result = contentVersionService.getReviewVersion(contentVersionId);

    assertThat(result).isNotNull();
    assertThat(result.downloadUrl()).isEqualTo(expectedUrl);
    assertThat(result.contentVersion()).isNotNull();
    assertThat(result.course()).isNotNull();
    verify(contentVersionRepository).findOneBy(any(), eq(contentVersionId));
    verify(fileService).generatePresignedDownloadUrl(expectedKey, Duration.ofMinutes(10));
  }

  @Test
  @DisplayName("Should throw when review version not found")
  void shouldThrowWhenReviewVersionNotFound() {
    when(contentVersionRepository.findOneBy(any(), eq(contentVersionId))).thenReturn(Optional.empty());

    assertThatThrownBy(() -> contentVersionService.getReviewVersion(contentVersionId))
        .isInstanceOf(BadRequestException.class)
        .hasMessageContaining("Content version not found");
  }

  // --- getAllPendingVersions ---

  @Test
  @DisplayName("Should get all pending versions with course info")
  void shouldGetAllPendingVersionsWithCourseInfo() {
    ContentVersionRecord version1 = mock(ContentVersionRecord.class);
    ContentVersionRecord version2 = mock(ContentVersionRecord.class);
    CourseRecord course1 = mock(CourseRecord.class);
    CourseRecord course2 = mock(CourseRecord.class);

    lenient().when(version1.getCourseId()).thenReturn(courseId);
    lenient().when(version2.getCourseId()).thenReturn(courseId);
    lenient().when(version1.getStatus()).thenReturn(ContentStatus.PENDING);
    lenient().when(version2.getStatus()).thenReturn(ContentStatus.PENDING);

    ContentVersionWithCourseRecord record1 = new ContentVersionWithCourseRecord(version1, course1, List.of());
    ContentVersionWithCourseRecord record2 = new ContentVersionWithCourseRecord(version2, course2, List.of());

    when(contentVersionRepository.findByStatusWithCourse(ContentStatus.PENDING))
        .thenReturn(List.of(record1, record2));

    List<ContentVersionWithCourseRecord> result = contentVersionService.getAllPendingVersions();

    assertThat(result).hasSize(2);
    verify(contentVersionRepository).findByStatusWithCourse(ContentStatus.PENDING);
  }

  @Test
  @DisplayName("Should return empty list when no pending versions")
  void shouldReturnEmptyListWhenNoPendingVersions() {
    when(contentVersionRepository.findByStatusWithCourse(ContentStatus.PENDING)).thenReturn(List.of());

    List<ContentVersionWithCourseRecord> result = contentVersionService.getAllPendingVersions();

    assertThat(result).isEmpty();
  }

  // --- approveVersion ---

  @Test
  @DisplayName("Should approve pending version successfully")
  void shouldApprovePendingVersionSuccessfully() {
    when(contentVersionRepository.findOneBy(any(), eq(contentVersionId))).thenReturn(Optional.of(mockVersion));
    when(courseRepository.findById(courseId)).thenReturn(Optional.of(mockCourse));

    contentVersionService.approveVersion(contentVersionId);

    verify(contentVersionRepository).rejectAllPendingVersions(courseId);
    verify(contentVersionRepository).updateStatus(contentVersionId, ContentStatus.APPROVED, null);
    verify(notificationService).sendToTeam(teamId, NotificationType.COURSE_APPROVED,
        "Course Approved", "Your course: Test Course has been approved", courseId);
  }

  @Test
  @DisplayName("Should throw when approving non-pending version")
  void shouldThrowWhenApprovingNonPendingVersion() {
    lenient().when(mockVersion.getStatus()).thenReturn(ContentStatus.APPROVED);
    when(contentVersionRepository.findOneBy(any(), eq(contentVersionId))).thenReturn(Optional.of(mockVersion));

    assertThatThrownBy(() -> contentVersionService.approveVersion(contentVersionId))
        .isInstanceOf(BadRequestException.class)
        .hasMessageContaining("Can only approve pending versions");
    verify(contentVersionRepository, never()).updateStatus();
  }

  @Test
  @DisplayName("Should reject other pending versions when approving one")
  void shouldRejectOtherPendingVersionsWhenApproving() {
    when(contentVersionRepository.findOneBy(any(), eq(contentVersionId))).thenReturn(Optional.of(mockVersion));
    when(courseRepository.findById(courseId)).thenReturn(Optional.of(mockCourse));

    contentVersionService.approveVersion(contentVersionId);

    verify(contentVersionRepository).rejectAllPendingVersions(courseId);
  }

  // --- rejectVersion ---

  @Test
  @DisplayName("Should reject pending version successfully")
  void shouldRejectPendingVersionSuccessfully() {
    String rejectedReason = "Quality issues found";

    when(contentVersionRepository.findOneBy(any(), eq(contentVersionId))).thenReturn(Optional.of(mockVersion));

    contentVersionService.rejectVersion(contentVersionId, rejectedReason);

    verify(contentVersionRepository).updateStatus(contentVersionId, ContentStatus.REJECTED, rejectedReason);
  }

  @Test
  @DisplayName("Should throw when rejecting non-pending version")
  void shouldThrowWhenRejectingNonPendingVersion() {
    lenient().when(mockVersion.getStatus()).thenReturn(ContentStatus.APPROVED);
    when(contentVersionRepository.findOneBy(any(), eq(contentVersionId))).thenReturn(Optional.of(mockVersion));

    assertThatThrownBy(() -> contentVersionService.rejectVersion(contentVersionId, "reason"))
        .isInstanceOf(BadRequestException.class)
        .hasMessageContaining("Can only reject pending versions");
    verify(contentVersionRepository, never()).updateStatus(any(), any(), any());
  }

  @Test
  @DisplayName("Should reject version with reason")
  void shouldRejectVersionWithReason() {
    String rejectedReason = "Incomplete content";

    when(contentVersionRepository.findOneBy(any(), eq(contentVersionId))).thenReturn(Optional.of(mockVersion));

    contentVersionService.rejectVersion(contentVersionId, rejectedReason);

    verify(contentVersionRepository).updateStatus(contentVersionId, ContentStatus.REJECTED, rejectedReason);
  }
}
