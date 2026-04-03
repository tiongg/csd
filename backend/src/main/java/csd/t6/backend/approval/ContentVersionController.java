package csd.t6.backend.approval;

import java.util.List;
import java.util.UUID;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import csd.t6.backend.approval.dto.request.RejectVersionRequest;
import csd.t6.backend.approval.dto.request.UploadCourseRequest;
import csd.t6.backend.approval.dto.response.ContentVersionResponse;
import csd.t6.backend.approval.dto.response.LatestContentVersionResponse;
import csd.t6.backend.approval.dto.response.PendingVersionResponse;
import csd.t6.backend.approval.dto.response.ReviewVersionResponse;
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

  @GetMapping("/{courseId}/latest")
  public LatestContentVersionResponse getLatestApprovedVersion(@PathVariable UUID courseId) {
    return this.contentVersionService.getLatestApprovedVersion(courseId);
  }

  @GetMapping("/review/{contentVersionId}")
  public ReviewVersionResponse getReviewVersion(@PathVariable UUID contentVersionId) {
    return this.contentVersionService.getReviewVersion(contentVersionId);
  }

  @GetMapping("/{courseId}")
  public List<ContentVersionResponse> getContentVersions(@PathVariable UUID courseId) {
    return this.contentVersionService.getPastVersions(courseId).stream().map(ContentVersionResponse::new).toList();
  }

  @GetMapping("/pending")
  public List<PendingVersionResponse> getPendingCourses() {
    return this.contentVersionService.getAllPendingVersions().stream()
        .map((record) -> new PendingVersionResponse(
            record,
            this.contentVersionService.getCourseImageUrl(record.course()),
            this.contentVersionService.getCourseCreatorUsername(record.course())))
        .toList();
  }

  @PostMapping("/{contentVersionId}/approve")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void approveVersion(@PathVariable UUID contentVersionId) {
    this.contentVersionService.approveVersion(contentVersionId);
  }

  @PostMapping("/{contentVersionId}/reject")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void rejectVersion(@PathVariable UUID contentVersionId, @Valid @RequestBody RejectVersionRequest request) {
    this.contentVersionService.rejectVersion(contentVersionId, request.rejectedReason());
  }
}
