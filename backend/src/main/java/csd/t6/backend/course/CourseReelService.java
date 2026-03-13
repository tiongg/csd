package csd.t6.backend.course;

import java.time.Duration;
import java.util.UUID;

import org.springframework.stereotype.Service;

import csd.t6.backend.approval.ContentVersionRepository;
import csd.t6.backend.exceptions.BadRequestException;
import csd.t6.backend.team.TeamService;
import csd.t6.backend.utils.FileService;
import csd.t6.backend.utils.dto.PresignedUrlResponse;
import csd.t6.jooq.public_.tables.records.CourseRecord;

@Service
public class CourseReelService {
  private final CourseRepository courseRepository;
  private final TeamService teamService;
  private final FileService fileService;
  private final ContentVersionRepository contentVersionRepository;

  public CourseReelService(CourseRepository courseRepository, TeamService teamService, FileService fileService,
      ContentVersionRepository contentVersionRepository) {
    this.courseRepository = courseRepository;
    this.teamService = teamService;
    this.fileService = fileService;
    this.contentVersionRepository = contentVersionRepository;
  }

  public void deleteReel(UUID courseId, UUID requesterId) {
    checkTeamMembership(courseId, requesterId);

    String key = this.getReelKeyForCourse(courseId);
    this.fileService.deleteObject(key);
  }

  public PresignedUrlResponse generateReelUploadUrl(UUID courseId, UUID requesterId) {
    checkTeamMembership(courseId, requesterId);

    String key = this.getReelKeyForCourse(courseId);
    return new PresignedUrlResponse(this.fileService.generatePresignedUploadUrl(key, Duration.ofMinutes(5)), key);
  }

  public String getReelUrlForCourse(CourseRecord course) {
    String defaultReelKey = String.format("reels/%s.mp4", course.getId());
    if (this.fileService.exists(getReelKeyForCourse(course.getId()))) {
      return this.fileService.getPublicUrl(defaultReelKey);
    }

    return null;
  }

  private String getReelKeyForCourse(UUID courseId) {
    return String.format("reels/%s.mp4", courseId);
  }

  private void checkTeamMembership(UUID courseId, UUID userId) {
    CourseRecord course = courseRepository.findById(courseId)
        .orElseThrow(() -> new BadRequestException("Course not found"));

    if (!teamService.isTeamMember(course.getTeamId(), userId)) {
      throw new BadRequestException("You must be a member of the team to perform this action");
    }
  }
}
