package csd.t6.backend.course;

import csd.t6.backend.course.dto.CourseCreateRequest;
import csd.t6.backend.course.dto.CourseResponseDTO;
import csd.t6.backend.course.dto.CourseUpdateRequest;
import csd.t6.backend.exceptions.BadRequestException;
import csd.t6.backend.team.TeamService;
import csd.t6.jooq.public_.tables.records.CourseRecord;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CourseServiceTest {

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private TeamService teamService;

    @InjectMocks
    private CourseService courseService;

    @Test
    @DisplayName("Should create a course when requester is a team member")
    void createCourse_whenMember_ok() {
        // arrange
        UUID teamId = UUID.randomUUID();
        UUID creatorId = UUID.randomUUID();
        CourseCreateRequest req = new CourseCreateRequest("Title", "Desc", teamId);

        when(teamService.isTeamMember(teamId, creatorId)).thenReturn(true);
        CourseRecord created = mock(CourseRecord.class);
        when(courseRepository.create("Title", "Desc", creatorId, teamId)).thenReturn(created);

        // act
        CourseResponseDTO res = courseService.createCourse(req, creatorId);

        // assert
        assertThat(res).isNotNull();
        verify(teamService).isTeamMember(teamId, creatorId);
        verify(courseRepository).create("Title", "Desc", creatorId, teamId);
    }

    @Test
    @DisplayName("Should throw when requester is not a team member on create")
    void createCourse_whenNotMember_badRequest() {
        // arrange
        UUID teamId = UUID.randomUUID();
        UUID requester = UUID.randomUUID();
        CourseCreateRequest req = new CourseCreateRequest("Title", "Desc", teamId);

        when(teamService.isTeamMember(teamId, requester)).thenReturn(false);

        // act + assert
        BadRequestException ex = assertThrows(BadRequestException.class, () -> courseService.createCourse(req, requester));
        assertThat(ex).hasMessageContaining("must be a member of the team");
        verify(courseRepository, never()).create(any(), any(), any(), any());
    }

    @Test
    @DisplayName("Should return CourseResponseDTO when fetching existing id")
    void getCourseById_existing_ok() {
        // arrange
        UUID id = UUID.randomUUID();
        CourseRecord rec = mock(CourseRecord.class);
        when(courseRepository.findById(id)).thenReturn(Optional.of(rec));

        // act
        CourseResponseDTO res = courseService.getCourseById(id);

        // assert
        assertThat(res).isNotNull();
        verify(courseRepository).findById(id);
    }

    @Test
    @DisplayName("Should throw when fetching non-existent course")
    void getCourseById_missing_badRequest() {
        // arrange
        UUID id = UUID.randomUUID();
        when(courseRepository.findById(id)).thenReturn(Optional.empty());

        // act + assert
        BadRequestException ex = assertThrows(BadRequestException.class, () -> courseService.getCourseById(id));
        assertThat(ex).hasMessageContaining("Course not found");
    }

    @Test
    @DisplayName("Should update course when requester is creator")
    void updateCourse_byCreator_ok() {
        // arrange
        UUID id = UUID.randomUUID();
        UUID creator = UUID.randomUUID();
        CourseUpdateRequest req = new CourseUpdateRequest("NewTitle", "NewDesc", null, true);

        CourseRecord existing = mock(CourseRecord.class);
        when(existing.getCreatorId()).thenReturn(creator);
        when(courseRepository.findById(id)).thenReturn(Optional.of(existing));

        CourseRecord updated = mock(CourseRecord.class);
        when(courseRepository.update(id, "NewTitle", "NewDesc", null, true)).thenReturn(updated);

        // act
        CourseResponseDTO res = courseService.updateCourse(id, req, creator);

        // assert
        assertThat(res).isNotNull();
        verify(courseRepository).update(id, "NewTitle", "NewDesc", null, true);
    }

    @Test
    @DisplayName("Should update course when requester is a team member")
    void updateCourse_byTeamMember_ok() {
        // arrange
        UUID id = UUID.randomUUID();
        UUID member = UUID.randomUUID();
        UUID teamId = UUID.randomUUID();
        CourseUpdateRequest req = new CourseUpdateRequest(null, "D", teamId, null);

        CourseRecord existing = mock(CourseRecord.class);
        when(existing.getCreatorId()).thenReturn(UUID.randomUUID());
        when(existing.getTeamId()).thenReturn(teamId);
        when(courseRepository.findById(id)).thenReturn(Optional.of(existing));

        when(teamService.isTeamMember(teamId, member)).thenReturn(true);

        CourseRecord updated = mock(CourseRecord.class);
        when(courseRepository.update(id, null, "D", teamId, null)).thenReturn(updated);

        // act
        CourseResponseDTO res = courseService.updateCourse(id, req, member);

        // assert
        assertThat(res).isNotNull();
        verify(courseRepository).update(id, null, "D", teamId, null);
    }

    @Test
    @DisplayName("Should throw when non-member tries to update")
    void updateCourse_byNonMember_badRequest() {
        // arrange
        UUID id = UUID.randomUUID();
        UUID requester = UUID.randomUUID();
        UUID teamId = UUID.randomUUID();
        CourseUpdateRequest req = new CourseUpdateRequest(null, null, teamId, null);

        CourseRecord existing = mock(CourseRecord.class);
        when(existing.getCreatorId()).thenReturn(UUID.randomUUID());
        when(existing.getTeamId()).thenReturn(teamId);
        when(courseRepository.findById(id)).thenReturn(Optional.of(existing));

        when(teamService.isTeamMember(teamId, requester)).thenReturn(false);

        // act + assert
        BadRequestException ex = assertThrows(BadRequestException.class, () -> courseService.updateCourse(id, req, requester));
        assertThat(ex).hasMessageContaining("Only the course creator or team members");
        verify(courseRepository, never()).update(any(), any(), any(), any(), any());
    }

    @Test
    @DisplayName("Should delete course when requester is creator")
    void deleteCourse_byCreator_ok() {
        // arrange
        UUID id = UUID.randomUUID();
        UUID creator = UUID.randomUUID();

        CourseRecord existing = mock(CourseRecord.class);
        when(existing.getCreatorId()).thenReturn(creator);
        when(courseRepository.findById(id)).thenReturn(Optional.of(existing));

        // act
        courseService.deleteCourse(id, creator);

        // assert
        verify(courseRepository).delete(id);
    }

    @Test
    @DisplayName("Should throw when non-creator attempts to delete")
    void deleteCourse_byNonCreator_badRequest() {
        // arrange
        UUID id = UUID.randomUUID();
        UUID creator = UUID.randomUUID();
        UUID requester = UUID.randomUUID();

        CourseRecord existing = mock(CourseRecord.class);
        when(existing.getCreatorId()).thenReturn(creator);
        when(courseRepository.findById(id)).thenReturn(Optional.of(existing));

        // act + assert
        BadRequestException ex = assertThrows(BadRequestException.class, () -> courseService.deleteCourse(id, requester));
        assertThat(ex).hasMessageContaining("Only course creator can delete the course");
        verify(courseRepository, never()).delete(any());
    }
}
