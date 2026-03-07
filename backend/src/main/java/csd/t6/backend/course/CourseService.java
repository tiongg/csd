package csd.t6.backend.course;

import static csd.t6.jooq.public_.tables.Course.COURSE;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import csd.t6.backend.course.dto.request.CourseCreateRequest;
import csd.t6.backend.course.dto.request.CourseUpdateRequest;
import csd.t6.backend.course.dto.response.CourseResponse;
import csd.t6.backend.exceptions.BadRequestException;
import csd.t6.backend.team.TeamService;
import csd.t6.backend.utils.FileService;
import csd.t6.backend.utils.dto.PresignedUrlResponse;
import csd.t6.jooq.public_.tables.records.CourseRecord;

@Service
public class CourseService {
  private final CourseRepository courseRepository;
  private final TeamService teamService;
  private final FileService fileService;

  public CourseService(CourseRepository courseRepository, TeamService teamService, FileService fileService) {
    this.courseRepository = courseRepository;
    this.teamService = teamService;
    this.fileService = fileService;
  }

  @Transactional
  public CourseResponse createCourse(CourseCreateRequest request, UUID creatorId) {
    if (!teamService.isTeamMember(request.teamId(), creatorId)) {
      throw new BadRequestException("You must be a member of the team to create a course for it");
    }

    CourseRecord course = courseRepository.create(request.title(), request.description(), creatorId, request.teamId());
    return new CourseResponse(course);
  }

  public CourseResponse getCourseById(UUID id) {
    CourseRecord course = courseRepository.findById(id).orElseThrow(() -> new BadRequestException("Course not found"));
    return new CourseResponse(course);
  }

  public List<CourseResponse> getAllCourses() {
    return courseRepository.findAll().stream().map(CourseResponse::new).collect(Collectors.toList());
  }

  public List<CourseRecord> getCoursesByTeamId(UUID teamId, UUID requesterId) {
    if (!teamService.isTeamMember(teamId, requesterId)) {
      throw new BadRequestException("You must be a member of the team to view its courses");
    }

    return this.courseRepository.findBy(COURSE.TEAM_ID, teamId);
  }

  @Transactional
  public CourseResponse updateCourse(UUID id, CourseUpdateRequest request, UUID requesterId) {
    CourseRecord existing = courseRepository.findById(id)
        .orElseThrow(() -> new BadRequestException("Course not found"));

    boolean canEdit = existing.getCreatorId().equals(requesterId)
        || teamService.isTeamMember(existing.getTeamId(), requesterId);

    if (!canEdit) {
      throw new BadRequestException("Only the course creator or team members can update the course");
    }

    if (!teamService.isTeamMember(existing.getTeamId(), requesterId)) {
      throw new BadRequestException("You must be a member of the team to update this course");
    }

    CourseRecord updated = courseRepository.update(id, request.title(), request.description(), existing.getTeamId(),
        request.isPublished());
    return new CourseResponse(updated);
  }

  @Transactional
  public void deleteCourse(UUID id, UUID requesterId) {
    CourseRecord course = courseRepository.findById(id).orElseThrow(() -> new BadRequestException("Course not found"));

    if (!course.getCreatorId().equals(requesterId)) {
      throw new BadRequestException("Only course creator can delete the course");
    }

    courseRepository.delete(id);
  }

  public PresignedUrlResponse generateCourseMaterialUploadUrl(UUID courseId, String filename, UUID requesterId) {
    CourseRecord course = courseRepository.findById(courseId)
        .orElseThrow(() -> new BadRequestException("Course not found"));

    if (!teamService.isTeamMember(course.getTeamId(), requesterId)) {
      throw new BadRequestException("You must be a member of the team to upload course materials");
    }

    String key = String.format("course-materials/%s/%s", courseId, filename);
    return new PresignedUrlResponse(fileService.generatePresignedUploadUrl(key), key);
  }
}