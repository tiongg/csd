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

@Service
public class CourseService {
  private final CourseRepository courseRepository;

  public CourseService(CourseRepository courseRepository) {
    this.courseRepository = courseRepository;
  }

  @Transactional
  public CourseResponseDTO createCourse(CourseCreateRequest request, UUID creatorId) {
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

    // Only creator can update
    if (!existing.getCreatorId().equals(requesterId)) {
      throw new BadRequestException("Only course creator can update the course");
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