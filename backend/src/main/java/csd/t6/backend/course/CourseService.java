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
    // Validate team membership if teamId is provided
    if (request.teamId() != null) {
      if (!teamService.isTeamMember(request.teamId(), creatorId)) {
        throw new BadRequestException("You must be a member of the team to create a course for it");
      }
    }

    Course course = courseRepository.create(request.title(), request.description(), creatorId, request.teamId());
    return toDTO(course);
  }

  @Transactional(readOnly = true)
  public CourseResponseDTO getCourseById(UUID id) {
    Course course = courseRepository.findById(id)
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
    Course existing = courseRepository.findById(id)
        .orElseThrow(() -> new BadRequestException("Course not found"));

    // Check if user can edit this course
    boolean canEdit = existing.getCreatorId().equals(requesterId);
    
    // If course belongs to a team, check if user is a team member
    if (!canEdit && existing.getTeamId() != null) {
      canEdit = teamService.isTeamMember(existing.getTeamId(), requesterId);
    }

    if (!canEdit) {
      throw new BadRequestException("Only the course creator or team members can update the course");
    }

    // Validate team change - user must be member of new team
    if (request.teamId() != null && !request.teamId().equals(existing.getTeamId())) {
      if (!teamService.isTeamMember(request.teamId(), requesterId)) {
        throw new BadRequestException("You must be a member of the team to assign the course to it");
      }
    }

    Course updated = courseRepository.update(id, request.title(), request.description(), request.teamId(),
        request.isPublished());
    return toDTO(updated);
  }

  @Transactional
  public void deleteCourse(UUID id, UUID requesterId) {
    Course course = courseRepository.findById(id)
        .orElseThrow(() -> new BadRequestException("Course not found"));

    // Only creator can delete
    if (!course.getCreatorId().equals(requesterId)) {
      throw new BadRequestException("Only course creator can delete the course");
    }

    courseRepository.delete(id);
  }

  private CourseResponseDTO toDTO(Course course) {
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