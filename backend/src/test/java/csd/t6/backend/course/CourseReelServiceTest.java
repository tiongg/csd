package csd.t6.backend.course;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Duration;
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
import csd.t6.backend.team.TeamService;
import csd.t6.backend.utils.FileService;
import csd.t6.backend.utils.dto.PresignedUrlResponse;
import csd.t6.jooq.public_.tables.records.CourseRecord;

@ExtendWith(MockitoExtension.class)
class CourseReelServiceTest {

  @Mock
  private CourseRepository courseRepository;

  @Mock
  private TeamService teamService;

  @Mock
  private FileService fileService;

  @InjectMocks
  private CourseReelService courseReelService;

  private UUID courseId;
  private UUID requesterId;
  private UUID teamId;
  private CourseRecord mockCourse;

  @BeforeEach
  void setUp() {
    courseId = UUID.randomUUID();
    requesterId = UUID.randomUUID();
    teamId = UUID.randomUUID();
    mockCourse = mock(CourseRecord.class);
    lenient().when(mockCourse.getId()).thenReturn(courseId);
    lenient().when(mockCourse.getTeamId()).thenReturn(teamId);
  }

  // --- deleteReel ---

  @Test
  @DisplayName("Should delete reel successfully when user is team member")
  void shouldDeleteReelWhenUserIsTeamMember() {
    when(courseRepository.findById(courseId)).thenReturn(Optional.of(mockCourse));
    when(teamService.isTeamMember(teamId, requesterId)).thenReturn(true);
    String expectedKey = String.format("reels/%s.mp4", courseId);

    courseReelService.deleteReel(courseId, requesterId);

    verify(fileService).deleteObject(expectedKey);
  }

  @Test
  @DisplayName("Should throw when user is not team member")
  void shouldThrowWhenUserIsNotTeamMember() {
    when(courseRepository.findById(courseId)).thenReturn(Optional.of(mockCourse));
    when(teamService.isTeamMember(teamId, requesterId)).thenReturn(false);

    assertThatThrownBy(() -> courseReelService.deleteReel(courseId, requesterId))
        .isInstanceOf(BadRequestException.class)
        .hasMessageContaining("must be a member of team");
    verify(fileService, never()).deleteObject(any());
  }

  @Test
  @DisplayName("Should throw when course not found")
  void shouldThrowWhenCourseNotFound() {
    when(courseRepository.findById(courseId)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> courseReelService.deleteReel(courseId, requesterId))
        .isInstanceOf(BadRequestException.class)
        .hasMessageContaining("Course not found");
    verify(fileService, never()).deleteObject(any());
  }

  // --- generateReelUploadUrl ---

  @Test
  @DisplayName("Should generate upload URL successfully when user is team member")
  void shouldGenerateUploadUrlWhenUserIsTeamMember() {
    when(courseRepository.findById(courseId)).thenReturn(Optional.of(mockCourse));
    when(teamService.isTeamMember(teamId, requesterId)).thenReturn(true);
    String expectedKey = String.format("reels/%s.mp4", courseId);
    String expectedUrl = "presigned-upload-url";
    when(fileService.generatePresignedUploadUrl(expectedKey, Duration.ofMinutes(5))).thenReturn(expectedUrl);

    PresignedUrlResponse result = courseReelService.generateReelUploadUrl(courseId, requesterId);

    assertThat(result.url()).isEqualTo(expectedUrl);
    assertThat(result.key()).isEqualTo(expectedKey);
  }

  @Test
  @DisplayName("Should throw when user is not team member for upload")
  void shouldThrowWhenUserIsNotTeamMemberForUpload() {
    when(courseRepository.findById(courseId)).thenReturn(Optional.of(mockCourse));
    when(teamService.isTeamMember(teamId, requesterId)).thenReturn(false);

    assertThatThrownBy(() -> courseReelService.generateReelUploadUrl(courseId, requesterId))
        .isInstanceOf(BadRequestException.class)
        .hasMessageContaining("must be a member of team");
    verify(fileService, never()).generatePresignedUploadUrl(any(), any());
  }

  @Test
  @DisplayName("Should throw when course not found for upload")
  void shouldThrowWhenCourseNotFoundForUpload() {
    when(courseRepository.findById(courseId)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> courseReelService.generateReelUploadUrl(courseId, requesterId))
        .isInstanceOf(BadRequestException.class)
        .hasMessageContaining("Course not found");
    verify(fileService, never()).generatePresignedUploadUrl(any(), any());
  }

  // --- getReelUrlForCourse ---

  @Test
  @DisplayName("Should return public URL when reel exists")
  void shouldReturnPublicUrlWhenReelExists() {
    String expectedKey = String.format("reels/%s.mp4", courseId);
    String expectedUrl = "public-url";
    when(fileService.exists(expectedKey)).thenReturn(true);
    when(fileService.getPublicUrl(expectedKey)).thenReturn(expectedUrl);

    String result = courseReelService.getReelUrlForCourse(mockCourse);

    assertThat(result).isEqualTo(expectedUrl);
    verify(fileService).exists(expectedKey);
    verify(fileService).getPublicUrl(expectedKey);
  }

  @Test
  @DisplayName("Should return null when reel does not exist")
  void shouldReturnNullWhenReelDoesNotExist() {
    String expectedKey = String.format("reels/%s.mp4", courseId);
    when(fileService.exists(expectedKey)).thenReturn(false);

    String result = courseReelService.getReelUrlForCourse(mockCourse);

    assertThat(result).isNull();
    verify(fileService).exists(expectedKey);
    verify(fileService, never()).getPublicUrl(any());
  }
}
