package csd.t6.backend.course;

import java.util.List;
import java.util.UUID;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import csd.t6.backend.auth.AuthUserDetails;
import csd.t6.backend.contributor.dto.response.ImageUploadResponse;
import csd.t6.backend.course.dto.request.CourseCreateRequest;
import csd.t6.backend.course.dto.request.CourseUpdateRequest;
import csd.t6.backend.course.dto.response.CourseResponse;
import csd.t6.backend.course.dto.response.PublishedCourseResponse;
import csd.t6.backend.decorators.responses.BadRequestResponse;
import csd.t6.backend.decorators.responses.CreatedResponse;
import csd.t6.backend.decorators.responses.NoContentResponse;
import csd.t6.backend.decorators.responses.OkResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/courses")
@Tag(name = "Courses", description = "Course management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class CourseController {
  private final CourseService courseService;

  public CourseController(CourseService courseService) {
    this.courseService = courseService;
  }

  @PostMapping("/")
  @CreatedResponse
  @BadRequestResponse
  @Operation(summary = "Create a new course", description = "Creates a new course with the authenticated user as creator")
  public CourseResponse createCourse(@Valid @RequestBody CourseCreateRequest request,
      @AuthenticationPrincipal AuthUserDetails userDetails) {
    return courseService.createCourse(request, userDetails.getId());
  }

  @GetMapping("/{id}")
  @OkResponse
  @BadRequestResponse
  @Operation(summary = "Get course by ID", description = "Retrieves course details")
  public CourseResponse getCourse(@PathVariable UUID id) {
    return courseService.getCourseById(id);
  }

  @GetMapping("/")
  @OkResponse
  @Operation(summary = "Get all courses", description = "Retrieves all courses")
  public List<CourseResponse> getAllCourses() {
    return courseService.getAllCourses();
  }

  @GetMapping("/published")
  public List<PublishedCourseResponse> getPublishedCourses() {
    return courseService.getCoursesWithApprovedVersion();
  }

  @PutMapping("/{id}")
  @OkResponse
  @BadRequestResponse
  @Operation(summary = "Update course", description = "Updates course details. Only creator or team members can update.")
  public CourseResponse updateCourse(@PathVariable UUID id, @Valid @RequestBody CourseUpdateRequest request,
      @AuthenticationPrincipal AuthUserDetails userDetails) {
    return courseService.updateCourse(id, request, userDetails.getId());
  }

  @DeleteMapping("/{id}")
  @NoContentResponse
  @BadRequestResponse
  @Operation(summary = "Delete course", description = "Deletes a course. Only creator can delete.")
  public void deleteCourse(@PathVariable UUID id, @AuthenticationPrincipal AuthUserDetails userDetails) {
    courseService.deleteCourse(id, userDetails.getId());
  }

  @GetMapping("/{courseId}/image-upload-url")
  @OkResponse
  @BadRequestResponse
  @Operation(summary = "Get course image upload URL", description = "Generates a presigned URL for uploading a course thumbnail image. Only team members can upload.")
  public ImageUploadResponse getImageUploadUrl(@PathVariable UUID courseId, @RequestParam String extension,
      @AuthenticationPrincipal AuthUserDetails userDetails) {
    return this.courseService.generateImageUploadUrl(courseId, userDetails.getId(), extension);
  }

  @DeleteMapping("/{courseId}/image")
  @NoContentResponse
  @BadRequestResponse
  @Operation(summary = "Delete course image", description = "Deletes the course thumbnail image. Only team members can delete.")
  public void deleteImage(@PathVariable UUID courseId, @AuthenticationPrincipal AuthUserDetails userDetails) {
    this.courseService.deleteImage(courseId, userDetails.getId());
  }
}
