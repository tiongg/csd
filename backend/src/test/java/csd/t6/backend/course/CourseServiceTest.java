package csd.t6.backend.course;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatNoException;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.OffsetDateTime;
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

import csd.t6.backend.approval.ContentVersionRepository;
import csd.t6.backend.course.dto.request.CourseCreateRequest;
import csd.t6.backend.course.dto.request.CourseUpdateRequest;
import csd.t6.backend.course.dto.response.CourseResponse;
import csd.t6.backend.exceptions.BadRequestException;
import csd.t6.backend.team.TeamService;
import csd.t6.backend.utils.FileService;
import csd.t6.jooq.public_.tables.records.CourseRecord;

@ExtendWith(MockitoExtension.class)
class CourseServiceTest {
  @Mock
  private CourseRepository courseRepository;

  @Mock
  private TeamService teamService;

  @Mock
  private FileService fileService;

  @Mock
  private ContentVersionRepository contentVersionRepository;

  @Mock
  private CourseReelService courseReelService;

  @InjectMocks
  private CourseService courseService;

  private UUID creatorId;
  private UUID teamId;
  private UUID courseId;
  private CourseRecord mockCourse;

  @BeforeEach
  void setUp() {
    creatorId = UUID.randomUUID();
    teamId = UUID.randomUUID();
    courseId = UUID.randomUUID();

    mockCourse = mock(CourseRecord.class);
    lenient().when(mockCourse.getId()).thenReturn(courseId);
    lenient().when(mockCourse.getTitle()).thenReturn("Test Course");
    lenient().when(mockCourse.getCreatorId()).thenReturn(creatorId);
    lenient().when(mockCourse.getTeamId()).thenReturn(teamId);
    lenient().when(mockCourse.getIsPublished()).thenReturn(false);
    lenient().when(mockCourse.getCreatedAt()).thenReturn(OffsetDateTime.now());
    lenient().when(mockCourse.getUpdatedAt()).thenReturn(OffsetDateTime.now());
  }

  // --- createCourse ---

  @Test
  @DisplayName("Should create course successfully when user is team member")
  void shouldCreateCourseSuccessfully() {
    when(teamService.isTeamMember(teamId, creatorId)).thenReturn(true);
    when(courseRepository.create("Test Course", "Desc", creatorId, teamId)).thenReturn(mockCourse);

    CourseResponse result = courseService.createCourse(new CourseCreateRequest("Test Course", "Desc", teamId),
        creatorId);

    assertThat(result).isNotNull();
    assertThat(result.title()).isEqualTo("Test Course");
  }

  @Test
  @DisplayName("Should throw when creator is not team member")
  void shouldThrowWhenCreatorNotTeamMember() {
    when(teamService.isTeamMember(teamId, creatorId)).thenReturn(false);

    assertThatThrownBy(() -> courseService.createCourse(new CourseCreateRequest("Title", "Desc", teamId), creatorId))
        .isInstanceOf(BadRequestException.class).hasMessageContaining("member of the team");
  }

  // --- getCourseById ---

  @Test
  @DisplayName("Should return course by ID")
  void shouldReturnCourseById() {
    when(courseRepository.findById(courseId)).thenReturn(Optional.of(mockCourse));

    CourseResponse result = courseService.getCourseById(courseId);

    assertThat(result).isNotNull();
    assertThat(result.id()).isEqualTo(courseId);
  }

  @Test
  @DisplayName("Should throw when course not found")
  void shouldThrowWhenCourseNotFound() {
    when(courseRepository.findById(courseId)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> courseService.getCourseById(courseId)).isInstanceOf(BadRequestException.class)
        .hasMessageContaining("Course not found");
  }

  // --- getAllCourses ---

  @Test
  @DisplayName("Should return all courses")
  void shouldReturnAllCourses() {
    when(courseRepository.findAll()).thenReturn(List.of(mockCourse));

    List<CourseResponse> result = courseService.getAllCourses();

    assertThat(result).hasSize(1);
  }

  // --- updateCourse ---

  @Test
  @DisplayName("Should update course when requester is creator")
  void shouldUpdateCourseAsCreator() {
    when(courseRepository.findById(courseId)).thenReturn(Optional.of(mockCourse));
    when(teamService.isTeamMember(teamId, creatorId)).thenReturn(true);
    when(courseRepository.update(eq(courseId), anyString(), isNull(), eq(teamId), isNull())).thenReturn(mockCourse);

    CourseResponse result = courseService.updateCourse(courseId, new CourseUpdateRequest("New Title", null, null),
        creatorId);

    assertThat(result).isNotNull();
  }

  @Test
  @DisplayName("Should throw when updater is not creator or team member")
  void shouldThrowWhenUpdaterHasNoPermission() {
    UUID otherId = UUID.randomUUID();
    when(courseRepository.findById(courseId)).thenReturn(Optional.of(mockCourse));
    when(teamService.isTeamMember(teamId, otherId)).thenReturn(false);

    assertThatThrownBy(
        () -> courseService.updateCourse(courseId, new CourseUpdateRequest("Title", null, null), otherId))
            .isInstanceOf(BadRequestException.class);
  }

  // --- deleteCourse ---

  @Test
  @DisplayName("Should delete course when requester is creator")
  void shouldDeleteCourseAsCreator() {
    when(courseRepository.findById(courseId)).thenReturn(Optional.of(mockCourse));

    assertThatNoException().isThrownBy(() -> courseService.deleteCourse(courseId, creatorId));
    verify(courseRepository).delete(courseId);
  }

  @Test
  @DisplayName("Should throw when non-creator tries to delete course")
  void shouldThrowWhenNonCreatorDeletesCourse() {
    UUID nonCreatorId = UUID.randomUUID();
    when(courseRepository.findById(courseId)).thenReturn(Optional.of(mockCourse));

    assertThatThrownBy(() -> courseService.deleteCourse(courseId, nonCreatorId)).isInstanceOf(BadRequestException.class)
        .hasMessageContaining("Only course creator");
  }
}