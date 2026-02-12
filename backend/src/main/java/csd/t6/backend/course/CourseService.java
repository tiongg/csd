package csd.t6.backend.course;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import csd.t6.backend.course.dto.CourseCreateRequest;
import csd.t6.backend.course.dto.CourseResponseDTO;
import csd.t6.backend.course.dto.CourseUpdateRequest;
import csd.t6.backend.exceptions.BadRequestException;
import csd.t6.backend.team.TeamService;
import csd.t6.jooq.courses.tables.records.CourseRecord;

@Service
public class CourseService {
  private final CourseRepository courseRepository;
  private final TeamService teamService;

  public CourseService(CourseRepository courseRepository, TeamService teamService) {
    this.courseRepository = courseRepository;
    this.teamService = teamService;
  }

  @Transactional
  public CourseResponseDTO createCourse(CourseCreateRequest request, UUID creatorId) {
    if (request.teamId() != null) {
      if (!teamService.isTeamMember(request.teamId(), creatorId)) {
        throw new BadRequestException("You must be a member of the team to create a course for it");
      }
    }

    CourseRecord course = courseRepository.create(request.title(), request.description(), creatorId, request.teamId());
    return toDTO(course);
  }

  @Transactional(readOnly = true)
  public CourseResponseDTO getCourseById(UUID id) {
    CourseRecord course = courseRepository.findById(id)
        .orElseThrow(() -> new BadRequestException("Course not found"));
    return toDTO(course);
  }

  @Transactional(readOnly = true)
  public List<CourseResponseDTO> getAllCourses() {
    return courseRepository.findAll().stream()
        .map(this::toDTO)
        .collect(Collectors.toList());
  }

  @Transactional
  public CourseResponseDTO updateCourse(UUID id, CourseUpdateRequest request, UUID requesterId) {
    CourseRecord existing = courseRepository.findById(id)
        .orElseThrow(() -> new BadRequestException("Course not found"));

    boolean canEdit = existing.getCreatorId().equals(requesterId);

    if (!canEdit && existing.getTeamId() != null) {
      canEdit = teamService.isTeamMember(existing.getTeamId(), requesterId);
    }

    if (!canEdit) {
      throw new BadRequestException("Only the course creator or team members can update the course");
    }

    if (request.teamId() != null && !request.teamId().equals(existing.getTeamId())) {
      if (!teamService.isTeamMember(request.teamId(), requesterId)) {
        throw new BadRequestException("You must be a member of the team to assign the course to it");
      }
    }

    CourseRecord updated = courseRepository.update(id, request.title(), request.description(), request.teamId(),
        request.isPublished());
    return toDTO(updated);
  }

  @Transactional
  public void deleteCourse(UUID id, UUID requesterId) {
    CourseRecord course = courseRepository.findById(id)
        .orElseThrow(() -> new BadRequestException("Course not found"));

    if (!course.getCreatorId().equals(requesterId)) {
      throw new BadRequestException("Only course creator can delete the course");
    }

    courseRepository.delete(id);
  }

  private CourseResponseDTO toDTO(CourseRecord course) {
    return new CourseResponseDTO(
        course.getId(),
        course.getTitle(),
        course.getDescription(),
        course.getCreatorId(),
        course.getTeamId(),
        course.getIsPublished(),
        course.getCreatedAt(),
        course.getUpdatedAt());
  }
}