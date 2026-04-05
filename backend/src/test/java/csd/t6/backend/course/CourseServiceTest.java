package csd.t6.backend.course;

import static csd.t6.jooq.public_.tables.Course.COURSE;
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

import csd.t6.backend.account.AccountRepository;
import csd.t6.backend.approval.ContentVersionRepository;
import csd.t6.backend.approval.util.ContentVersionWithCourseRecord;
import csd.t6.backend.course.dto.request.CourseCreateRequest;
import csd.t6.backend.course.dto.request.CourseUpdateRequest;
import csd.t6.backend.course.dto.response.CourseResponse;
import csd.t6.backend.course.dto.response.PublishedCourseResponse;
import csd.t6.backend.exceptions.BadRequestException;
import csd.t6.backend.tag.TagService;
import csd.t6.backend.team.TeamService;
import csd.t6.backend.utils.FileService;
import csd.t6.jooq.public_.tables.records.ContentVersionRecord;
import csd.t6.jooq.public_.tables.records.CourseRecord;

@ExtendWith(MockitoExtension.class)
class CourseServiceTest {
  @Mock
  private CourseRepository courseRepository;

  @Mock
  private TeamService teamService;

  @Mock
  private AccountRepository accountRepository;

  @Mock
  private FileService fileService;

  @Mock
  private ContentVersionRepository contentVersionRepository;

  @Mock
  private TagService tagService;

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
    lenient().when(mockCourse.getCreatedAt()).thenReturn(OffsetDateTime.now());
    lenient().when(mockCourse.getUpdatedAt()).thenReturn(OffsetDateTime.now());
    lenient().when(accountRepository.findUsernameById(creatorId)).thenReturn(Optional.of("creator_user"));
  }

  // --- createCourse ---

  @Test
  @DisplayName("Should create course successfully when user is team member")
  void shouldCreateCourseSuccessfully() {
    List<String> tags = List.of("test-tag");
    when(teamService.isTeamMember(teamId, creatorId)).thenReturn(true);
    when(courseRepository.create("Test Course", "This is a test description for the course", creatorId, teamId)).thenReturn(mockCourse);
    when(tagService.updateCourseTags(courseId, tags)).thenReturn(tags);

    CourseResponse result = courseService.createCourse(
        new CourseCreateRequest("Test Course", "This is a test description for the course", teamId, "Others", tags), creatorId);

    assertThat(result).isNotNull();
    assertThat(result.title()).isEqualTo("Test Course");
    assertThat(result.creatorUsername()).isEqualTo("creator_user");
  }

  @Test
  @DisplayName("Should create course with tags")
  void shouldCreateCourseWithTags() {
    List<String> tags = List.of("Skibidi", "Chungus", "Rizz");
    when(teamService.isTeamMember(teamId, creatorId)).thenReturn(true);
    when(courseRepository.create("Test Course", "This is a test description for the course", creatorId, teamId)).thenReturn(mockCourse);
    when(tagService.updateCourseTags(courseId, tags)).thenReturn(tags);

    CourseResponse result = courseService
        .createCourse(new CourseCreateRequest("Test Course", "This is a test description for the course", teamId, "Others", tags), creatorId);

    assertThat(result).isNotNull();
    assertThat(result.tags()).isEqualTo(tags);
  }

  @Test
  @DisplayName("Should throw when creator is not team member")
  void shouldThrowWhenCreatorNotTeamMember() {
    List<String> tags = List.of("test-tag");
    when(teamService.isTeamMember(teamId, creatorId)).thenReturn(false);

    assertThatThrownBy(() -> courseService
        .createCourse(new CourseCreateRequest("Title", "This is a test description for the course", teamId, "Others", tags), creatorId))
            .isInstanceOf(BadRequestException.class).hasMessageContaining("member of the team");
  }

  // --- getCourseById ---

  @Test
  @DisplayName("Should return course by ID")
  void shouldReturnCourseById() {
    when(courseRepository.findById(courseId)).thenReturn(Optional.of(mockCourse));
    when(tagService.getTagsForCourse(courseId)).thenReturn(List.of("test-tag"));

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
    when(tagService.getTagsForCourse(courseId)).thenReturn(List.of("test-tag"));

    List<CourseResponse> result = courseService.getAllCourses();

    assertThat(result).hasSize(1);
  }

  @Test
  @DisplayName("Should return empty list when no courses exist")
  void shouldReturnEmptyListWhenNoCoursesExist() {
    when(courseRepository.findAll()).thenReturn(List.of());

    List<CourseResponse> result = courseService.getAllCourses();

    assertThat(result).isEmpty();
  }

  // --- getCoursesWithApprovedVersion ---

  @Test
  @DisplayName("Should return courses with approved version")
  void shouldReturnCoursesWithApprovedVersion() {
    ContentVersionRecord contentVersionRecord = mock(ContentVersionRecord.class);
    when(contentVersionRecord.getId()).thenReturn(UUID.randomUUID());
    when(contentVersionRecord.getVersion()).thenReturn(1);
    when(contentVersionRecord.getDescription()).thenReturn("Version description");
    when(contentVersionRecord.getPublishedAt()).thenReturn(OffsetDateTime.now().toLocalDateTime());
    when(contentVersionRecord.getStatus()).thenReturn(csd.t6.jooq.public_.enums.ContentStatus.APPROVED);

    ContentVersionWithCourseRecord approvedRecord = new ContentVersionWithCourseRecord(contentVersionRecord, mockCourse,
        List.of("Java", "Backend"));

    when(contentVersionRepository.findCoursesWithApprovedVersion()).thenReturn(List.of(approvedRecord));

    List<PublishedCourseResponse> result = courseService.getCoursesWithApprovedVersion();

    assertThat(result).hasSize(1);
    assertThat(result.get(0).course().tags()).isEqualTo(List.of("Java", "Backend"));
    assertThat(result.get(0).course().creatorUsername()).isEqualTo("creator_user");
  }

  @Test
  @DisplayName("Should return empty list when no courses have approved version")
  void shouldReturnEmptyListWhenNoApprovedVersions() {
    when(contentVersionRepository.findCoursesWithApprovedVersion()).thenReturn(List.of());

    List<PublishedCourseResponse> result = courseService.getCoursesWithApprovedVersion();

    assertThat(result).isEmpty();
  }

  // --- getCoursesByTeamId ---

  @Test
  @DisplayName("Should return courses by team id for team member")
  void shouldReturnCoursesByTeamIdForTeamMember() {
    when(teamService.isTeamMember(teamId, creatorId)).thenReturn(true);
    when(courseRepository.findBy(eq(COURSE.TEAM_ID), eq(teamId))).thenReturn(List.of(mockCourse));
    when(tagService.getTagsForCourse(courseId)).thenReturn(List.of("tag1"));

    List<CourseResponse> result = courseService.getCoursesByTeamId(teamId, creatorId);

    assertThat(result).hasSize(1);
  }

  @Test
  @DisplayName("Should throw when non-team member tries to get team courses")
  void shouldThrowWhenNonTeamMemberGetsTeamCourses() {
    UUID otherId = UUID.randomUUID();
    when(teamService.isTeamMember(teamId, otherId)).thenReturn(false);

    assertThatThrownBy(() -> courseService.getCoursesByTeamId(teamId, otherId)).isInstanceOf(BadRequestException.class)
        .hasMessageContaining("member of the team");
  }

  // --- updateCourse ---

  @Test
  @DisplayName("Should update course when requester is creator")
  void shouldUpdateCourseAsCreator() {
    List<String> tags = List.of("test-tag");
    when(courseRepository.findById(courseId)).thenReturn(Optional.of(mockCourse));
    when(teamService.isTeamMember(teamId, creatorId)).thenReturn(true);
    when(courseRepository.update(eq(courseId), anyString(), anyString(), isNull(), eq(teamId))).thenReturn(mockCourse);
    when(tagService.updateCourseTags(courseId, tags)).thenReturn(tags);

    CourseResponse result = courseService.updateCourse(courseId,
        new CourseUpdateRequest("New Title", "This is a test description for the course", null, tags), creatorId);

    assertThat(result).isNotNull();
  }

  @Test
  @DisplayName("Should update course tags")
  void shouldUpdateCourseTags() {
    List<String> tags = List.of("Java", "Backend");
    when(courseRepository.findById(courseId)).thenReturn(Optional.of(mockCourse));
    when(teamService.isTeamMember(teamId, creatorId)).thenReturn(true);
    when(courseRepository.update(eq(courseId), anyString(), anyString(), isNull(), eq(teamId))).thenReturn(mockCourse);
    when(tagService.updateCourseTags(courseId, tags)).thenReturn(tags);

    CourseResponse result = courseService.updateCourse(courseId, new CourseUpdateRequest("New Title", "This is a test description for the course", null, tags),
        creatorId);

    assertThat(result).isNotNull();
    assertThat(result.tags()).isEqualTo(tags);
  }

  @Test
  @DisplayName("Should throw when updater is not creator or team member")
  void shouldThrowWhenUpdaterHasNoPermission() {
    UUID otherId = UUID.randomUUID();
    List<String> tags = List.of("test-tag");
    when(courseRepository.findById(courseId)).thenReturn(Optional.of(mockCourse));
    when(teamService.isTeamMember(teamId, otherId)).thenReturn(false);

    assertThatThrownBy(() -> courseService.updateCourse(courseId,
        new CourseUpdateRequest("Title", "This is a test description for the course", null, tags), otherId))
            .isInstanceOf(BadRequestException.class);
  }

  @Test
  @DisplayName("Should update course when requester is team member but not creator")
  void shouldUpdateCourseAsTeamMember() {
    UUID otherTeamMemberId = UUID.randomUUID();
    List<String> tags = List.of("test-tag");
    when(courseRepository.findById(courseId)).thenReturn(Optional.of(mockCourse));
    when(teamService.isTeamMember(teamId, otherTeamMemberId)).thenReturn(true);
    when(courseRepository.update(eq(courseId), anyString(), anyString(), isNull(), eq(teamId))).thenReturn(mockCourse);
    when(tagService.updateCourseTags(courseId, tags)).thenReturn(tags);

    CourseResponse result = courseService.updateCourse(courseId,
        new CourseUpdateRequest("New Title", "This is a test description for the course", null, tags), otherTeamMemberId);

    assertThat(result).isNotNull();
  }

  @Test
  @DisplayName("Should throw when course not found for update")
  void shouldThrowWhenCourseNotFoundForUpdate() {
    UUID otherId = UUID.randomUUID();
    List<String> tags = List.of("test-tag");
    when(courseRepository.findById(courseId)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> courseService.updateCourse(courseId,
        new CourseUpdateRequest("Title", "This is a test description for the course", null, tags), otherId))
            .isInstanceOf(BadRequestException.class).hasMessageContaining("Course not found");
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

  @Test
  @DisplayName("Should throw when course not found for delete")
  void shouldThrowWhenCourseNotFoundForDelete() {
    when(courseRepository.findById(courseId)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> courseService.deleteCourse(courseId, creatorId)).isInstanceOf(BadRequestException.class)
        .hasMessageContaining("Course not found");
  }
}
