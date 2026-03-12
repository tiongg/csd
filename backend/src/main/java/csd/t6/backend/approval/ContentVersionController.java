package csd.t6.backend.approval;

import java.util.List;
import java.util.UUID;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import csd.t6.backend.approval.dto.request.UploadCourseRequest;
import csd.t6.backend.approval.dto.response.ContentVersionResponse;
import csd.t6.backend.auth.AuthUserDetails;
import csd.t6.backend.utils.dto.PresignedUrlResponse;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/content-versions")
public class ContentVersionController {
  private final ContentVersionService contentVersionService;

  public ContentVersionController(ContentVersionService contentVersionService) {
    this.contentVersionService = contentVersionService;
  }

  @PostMapping("/{courseId}/upload-url")
  public PresignedUrlResponse getMaterialUploadUrl(@PathVariable UUID courseId,
      @AuthenticationPrincipal AuthUserDetails userDetails, @Valid @RequestBody UploadCourseRequest request) {
    return this.contentVersionService.generateCourseMaterialUploadUrl(courseId, userDetails.getId(),
        request.description());
  }

  @PostMapping("/{courseId}/upload-reel-url")
  public PresignedUrlResponse getReelUploadUrl(@PathVariable UUID courseId,
      @AuthenticationPrincipal AuthUserDetails userDetails, @Valid @RequestBody UploadCourseRequest request) {
    return this.contentVersionService.generateReelUploadUrl(courseId, userDetails.getId(),
        request.description());
  }

  @GetMapping("/{courseId}")
  public List<ContentVersionResponse> getContentVersions(@PathVariable UUID courseId) {
    return this.contentVersionService.getPastVersions(courseId).stream().map(ContentVersionResponse::new).toList();
  }

  @GetMapping("/{courseId}/reel")
  public String getReelUrl(@PathVariable UUID courseId) {
    System.out.println(this.contentVersionService.getReelPublicUrl(courseId));
    return this.contentVersionService.getReelPublicUrl(courseId);
  }
}
