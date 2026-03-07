package csd.t6.backend.approval;

import java.time.Duration;
import java.util.UUID;

import org.springframework.stereotype.Service;

import csd.t6.backend.course.CourseRepository;
import csd.t6.backend.exceptions.BadRequestException;
import csd.t6.backend.team.TeamService;
import csd.t6.backend.utils.FileService;
import csd.t6.backend.utils.dto.PresignedUrlResponse;
import csd.t6.jooq.public_.tables.records.ContentVersionRecord;
import csd.t6.jooq.public_.tables.records.CourseRecord;

@Service
public class ContentVersionService {
  private final ContentVersionRepository contentVersionRepository;
  private final CourseRepository courseRepository;
  private final TeamService teamService;
  private final FileService fileService;

  public ContentVersionService(ContentVersionRepository contentVersionRepository, CourseRepository courseRepository,
      TeamService teamService, FileService fileService) {
    this.contentVersionRepository = contentVersionRepository;
    this.courseRepository = courseRepository;
    this.teamService = teamService;
    this.fileService = fileService;
  }

  public ContentVersionRecord createNewContentVersion(UUID courseId, String description) {
    int versionNumber = this.contentVersionRepository.getLatestVersionNumberForCourse(courseId) + 1;
    return this.contentVersionRepository.create(courseId, versionNumber, description);
  }

  public PresignedUrlResponse generateCourseMaterialUploadUrl(UUID courseId, UUID requesterId, String description) {
    CourseRecord course = courseRepository.findById(courseId)
        .orElseThrow(() -> new BadRequestException("Course not found"));

    if (!teamService.isTeamMember(course.getTeamId(), requesterId)) {
      throw new BadRequestException("You must be a member of the team to upload course materials");
    }
    ContentVersionRecord latestVersion = this.createNewContentVersion(courseId, description);

    String key = String.format("course-materials/%s/%s.json", courseId, latestVersion.getId().toString());
    return new PresignedUrlResponse(this.fileService.generatePresignedUploadUrl(key, Duration.ofMinutes(5)), key);
  }
}
