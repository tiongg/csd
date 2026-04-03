package csd.t6.backend.approval;

import static csd.t6.jooq.public_.tables.ContentVersion.CONTENT_VERSION;

import java.time.Duration;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import csd.t6.backend.approval.dto.response.ContentVersionResponse;
import csd.t6.backend.approval.dto.response.LatestContentVersionResponse;
import csd.t6.backend.approval.dto.response.ReviewVersionResponse;
import csd.t6.backend.approval.util.ContentVersionWithCourseRecord;
import csd.t6.backend.course.CourseRepository;
import csd.t6.backend.course.CourseService;
import csd.t6.backend.course.dto.response.CourseResponse;
import csd.t6.backend.exceptions.BadRequestException;
import csd.t6.backend.notification.NotificationService;
import csd.t6.backend.tag.TagService;
import csd.t6.backend.team.TeamService;
import csd.t6.backend.utils.FileService;
import csd.t6.backend.utils.dto.PresignedUrlResponse;
import csd.t6.jooq.accounts.enums.Roles;
import csd.t6.jooq.public_.enums.ContentStatus;
import csd.t6.jooq.public_.enums.NotificationType;
import csd.t6.jooq.public_.tables.records.ContentVersionRecord;
import csd.t6.jooq.public_.tables.records.CourseRecord;

@Service
public class ContentVersionService {
  private static final String TAKEDOWN_REASON_PREFIX = "[TAKEDOWN] ";
  private final ContentVersionRepository contentVersionRepository;
  private final CourseRepository courseRepository;
  private final TeamService teamService;
  private final FileService fileService;
  private final CourseService courseService;
  private final NotificationService notificationService;
  private final TagService tagService;

  public ContentVersionService(ContentVersionRepository contentVersionRepository, CourseRepository courseRepository,
      TeamService teamService, FileService fileService, CourseService courseService,
      NotificationService notificationService, TagService tagService) {
    this.contentVersionRepository = contentVersionRepository;
    this.courseRepository = courseRepository;
    this.teamService = teamService;
    this.fileService = fileService;
    this.courseService = courseService;
    this.notificationService = notificationService;
    this.tagService = tagService;
  }

  public ContentVersionRecord createNewContentVersion(UUID courseId, String description) {
    int versionNumber = this.contentVersionRepository.getLatestVersionNumberForCourse(courseId) + 1;
    return this.contentVersionRepository.create(courseId, versionNumber, description);
  }

  @Transactional
  public PresignedUrlResponse generateCourseMaterialUploadUrl(UUID courseId, UUID requesterId, String description) {
    CourseRecord course = courseRepository.findById(courseId)
        .orElseThrow(() -> new BadRequestException("Course not found"));

    if (!teamService.isTeamMember(course.getTeamId(), requesterId)) {
      throw new BadRequestException("You must be a member of the team to upload course materials");
    }

    this.contentVersionRepository.rejectAllPendingVersions(courseId);
    ContentVersionRecord newVersion = this.createNewContentVersion(courseId, description);

    notificationService.sendToRole(Roles.ADMIN, NotificationType.COURSE_AWAITING_REVIEW, "Course Review",
        "Course: " + course.getTitle(), newVersion.getId());

    String key = this.getVersionKey(courseId, newVersion.getId());
    return new PresignedUrlResponse(this.fileService.generatePresignedUploadUrl(key, Duration.ofMinutes(5)), key);
  }

  public List<ContentVersionRecord> getPastVersions(UUID courseId) {
    return this.contentVersionRepository.findBy(CONTENT_VERSION.COURSE_ID, courseId).stream()
        .sorted((v1, v2) -> v2.getVersion() - v1.getVersion()).toList();
  }

  public void rejectAllPendingVersions(UUID courseId) {
    this.contentVersionRepository.rejectAllPendingVersions(courseId);
  }

  public LatestContentVersionResponse getLatestApprovedVersion(UUID courseId) {
    ContentVersionRecord version = this.contentVersionRepository.findBy(CONTENT_VERSION.COURSE_ID, courseId).stream()
        .sorted((v1, v2) -> v2.getVersion() - v1.getVersion())
        .filter((v) -> v.getStatus().equals(ContentStatus.APPROVED)).findFirst()
        .orElseThrow(() -> new BadRequestException("No content version found for the course"));

    String key = this.getVersionKey(courseId, version.getId());
    String url = this.fileService.generatePresignedDownloadUrl(key, Duration.ofMinutes(5));

    CourseResponse course = courseRepository.findById(courseId)
        .map((record) -> new CourseResponse(record, courseService.getImageUrlForCourse(record),
            tagService.getTagsForCourse(record.getId())))
        .orElseThrow(() -> new BadRequestException("Course not found"));

    return new LatestContentVersionResponse(url, course);
  }

  public ReviewVersionResponse getReviewVersion(UUID contentVersionId) {
    ContentVersionRecord version = this.contentVersionRepository.findOneBy(CONTENT_VERSION.ID, contentVersionId)
        .orElseThrow(() -> new BadRequestException("Content version not found"));

    String key = this.getVersionKey(version.getCourseId(), version.getId());
    String url = this.fileService.generatePresignedDownloadUrl(key, Duration.ofMinutes(10));

    CourseResponse course = courseRepository.findById(version.getCourseId())
        .map((record) -> new CourseResponse(record, courseService.getImageUrlForCourse(record),
            tagService.getTagsForCourse(record.getId())))
        .orElseThrow(() -> new BadRequestException("Course not found"));

    return new ReviewVersionResponse(url, new ContentVersionResponse(version), course);
  }

  public List<ContentVersionWithCourseRecord> getAllPendingVersions() {
    return this.contentVersionRepository.findByStatusWithCourse(ContentStatus.PENDING);
  }

  public String getCourseImageUrl(CourseRecord course) {
    return this.courseService.getImageUrlForCourse(course);
  }

  @Transactional
  public void approveVersion(UUID contentVersionId) {
    ContentVersionRecord version = this.contentVersionRepository.findOneBy(CONTENT_VERSION.ID, contentVersionId)
        .orElseThrow(() -> new BadRequestException("Content version not found"));

    if (!version.getStatus().equals(ContentStatus.PENDING)) {
      throw new BadRequestException("Can only approve pending versions");
    }

    // Reject all other pending versions for this course
    this.contentVersionRepository.rejectAllPendingVersions(version.getCourseId());

    // Approve this version (clear rejected reason since it's approved)
    this.contentVersionRepository.updateStatus(contentVersionId, ContentStatus.APPROVED, null);

    CourseRecord course = courseRepository.findById(version.getCourseId())
        .orElseThrow(() -> new BadRequestException("Course not found"));

    notificationService.sendToTeam(course.getTeamId(), NotificationType.COURSE_APPROVED, "Course Approved",
        "Your course: " + course.getTitle() + " has been approved", course.getId());
  }

  @Transactional
  public void rejectVersion(UUID contentVersionId, String rejectedReason) {
    ContentVersionRecord version = this.contentVersionRepository.findOneBy(CONTENT_VERSION.ID, contentVersionId)
        .orElseThrow(() -> new BadRequestException("Content version not found"));
    boolean wasApproved = version.getStatus().equals(ContentStatus.APPROVED);

    if (!(version.getStatus().equals(ContentStatus.PENDING) || wasApproved)) {
      throw new BadRequestException("Can only reject pending or approved versions");
    }

    String finalRejectedReason = rejectedReason;
    if (wasApproved) {
      finalRejectedReason = TAKEDOWN_REASON_PREFIX + rejectedReason;
    }

    this.contentVersionRepository.updateStatus(contentVersionId, ContentStatus.REJECTED, finalRejectedReason);

    if (wasApproved) {
      CourseRecord course = courseRepository.findById(version.getCourseId())
          .orElseThrow(() -> new BadRequestException("Course not found"));

      notificationService.sendToTeam(course.getTeamId(), NotificationType.COURSE_APPROVED, "Course Taken Down",
          "Your course: " + course.getTitle() + " has been taken down by an admin", course.getId());
    }
  }

  private String getVersionKey(UUID courseId, UUID versionId) {
    return String.format("course-materials/%s/%s.json", courseId, versionId);
  }
}
