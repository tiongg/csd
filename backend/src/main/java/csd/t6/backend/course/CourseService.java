package csd.t6.backend.course;

import static csd.t6.jooq.public_.tables.Course.COURSE;

import java.time.Duration;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import csd.t6.backend.account.AccountRepository;
import csd.t6.backend.approval.ContentVersionRepository;
import csd.t6.backend.contributor.dto.response.ImageUploadResponse;
import csd.t6.backend.course.dto.request.CourseCreateRequest;
import csd.t6.backend.course.dto.request.CourseUpdateRequest;
import csd.t6.backend.course.dto.response.CourseResponse;
import csd.t6.backend.course.dto.response.PublishedCourseResponse;
import csd.t6.backend.exceptions.BadRequestException;
import csd.t6.backend.tag.TagService;
import csd.t6.backend.team.TeamService;
import csd.t6.backend.utils.FileService;
import csd.t6.jooq.public_.tables.records.CourseRecord;

@Service
public class CourseService {
  private final CourseRepository courseRepository;
  private final TeamService teamService;
  private final AccountRepository accountRepository;
  private final ContentVersionRepository contentVersionRepository;
  private final FileService fileService;
  private final TagService tagService;

  public CourseService(CourseRepository courseRepository, TeamService teamService, AccountRepository accountRepository,
      ContentVersionRepository contentVersionRepository, FileService fileService, TagService tagService) {
    this.courseRepository = courseRepository;
    this.teamService = teamService;
    this.accountRepository = accountRepository;
    this.contentVersionRepository = contentVersionRepository;
    this.fileService = fileService;
    this.tagService = tagService;
  }

  @Transactional
  public CourseResponse createCourse(CourseCreateRequest request, UUID creatorId) {
    if (!teamService.isTeamMember(request.teamId(), creatorId)) {
      throw new BadRequestException("You must be a member of the team to create a course for it");
    }

    CourseRecord course = courseRepository.create(request.title(), request.description(), creatorId, request.teamId());

    // Handle tags
    List<String> tags = tagService.updateCourseTags(course.getId(), request.tags());

    return new CourseResponse(course, this.getImageUrlForCourse(course), tags,
        this.getCreatorUsername(course.getCreatorId()));
  }

  public CourseResponse getCourseById(UUID id) {
    CourseRecord course = courseRepository.findById(id).orElseThrow(() -> new BadRequestException("Course not found"));
    List<String> tags = tagService.getTagsForCourse(id);
    return new CourseResponse(course, this.getImageUrlForCourse(course), tags,
        this.getCreatorUsername(course.getCreatorId()));
  }

  public List<CourseResponse> getAllCourses() {
    return courseRepository.findAll().stream().map(record -> {
      List<String> tags = tagService.getTagsForCourse(record.getId());
      return new CourseResponse(record, this.getImageUrlForCourse(record), tags,
          this.getCreatorUsername(record.getCreatorId()));
    }).collect(Collectors.toList());
  }

  public List<PublishedCourseResponse> getCoursesWithApprovedVersion() {
    return contentVersionRepository.findCoursesWithApprovedVersion().stream().map(record -> {
      String imageUrl = this.getImageUrlForCourse(record.course());
      return new PublishedCourseResponse(record, imageUrl, this.getCreatorUsername(record.course().getCreatorId()));
    }).collect(Collectors.toList());
  }

  public List<CourseResponse> getCoursesByTeamId(UUID teamId, UUID requesterId) {
    if (!teamService.isTeamMember(teamId, requesterId)) {
      throw new BadRequestException("You must be a member of the team to view its courses");
    }

    return this.courseRepository.findBy(COURSE.TEAM_ID, teamId).stream().map(record -> {
      List<String> tags = tagService.getTagsForCourse(record.getId());
      return new CourseResponse(record, this.getImageUrlForCourse(record), tags,
          this.getCreatorUsername(record.getCreatorId()));
    }).collect(Collectors.toList());
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

    CourseRecord updated = courseRepository.update(id, request.title(), request.description(), existing.getTeamId());

    // Handle tags
    List<String> tags = tagService.updateCourseTags(id, request.tags());

    return new CourseResponse(updated, this.getImageUrlForCourse(updated), tags,
        this.getCreatorUsername(updated.getCreatorId()));
  }

  @Transactional
  public void deleteCourse(UUID id, UUID requesterId) {
    CourseRecord course = courseRepository.findById(id).orElseThrow(() -> new BadRequestException("Course not found"));

    if (!course.getCreatorId().equals(requesterId)) {
      throw new BadRequestException("Only course creator can delete the course");
    }

    courseRepository.delete(id);
  }

  public ImageUploadResponse generateImageUploadUrl(UUID courseId, UUID requesterId, String extension) {
    // Validate file type
    String extLower = extension.toLowerCase();
    if (!"png".equals(extLower) && !"jpg".equals(extLower) && !"jpeg".equals(extLower)) {
      throw new BadRequestException("Invalid file type. Only PNG, JPG, and JPEG are supported.");
    }

    checkTeamMembership(courseId, requesterId);

    String key = getImageKeyForCourse(courseId, extLower);
    String url = this.fileService.generatePresignedUploadUrl(key, Duration.ofMinutes(5));
    String publicUrl = this.fileService.getPublicUrl(key);
    return new ImageUploadResponse(url, key, publicUrl);
  }

  public void deleteImage(UUID courseId, UUID requesterId) {
    checkTeamMembership(courseId, requesterId);

    // Try all supported extensions
    String[] extensions = {
        "png", "jpg", "jpeg"
    };
    for (String ext : extensions) {
      String key = getImageKeyForCourse(courseId, ext);
      if (this.fileService.exists(key)) {
        this.fileService.deleteObject(key);
        return; // Delete only the first found image
      }
    }
  }

  public String getImageUrlForCourse(CourseRecord course) {
    // Check all supported extensions, return first found
    String[] extensions = {
        "png", "jpg", "jpeg"
    };
    for (String ext : extensions) {
      String key = getImageKeyForCourse(course.getId(), ext);
      if (this.fileService.exists(key)) {
        return this.fileService.getPublicUrl(key);
      }
    }
    return null;
  }

  private String getImageKeyForCourse(UUID courseId, String extension) {
    return String.format("thumbnails/%s.%s", courseId, extension);
  }

  public String getCreatorUsername(UUID creatorId) {
    return this.accountRepository.findUsernameById(creatorId).orElse(null);
  }

  private void checkTeamMembership(UUID courseId, UUID userId) {
    CourseRecord course = courseRepository.findById(courseId)
        .orElseThrow(() -> new BadRequestException("Course not found"));

    if (!teamService.isTeamMember(course.getTeamId(), userId)) {
      throw new BadRequestException("You must be a member of the team to perform this action");
    }
  }

}
