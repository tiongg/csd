package csd.t6.backend.approval;

import java.util.UUID;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

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

  @GetMapping("/{courseId}/upload-url")
  public PresignedUrlResponse getMaterialUploadUrl(@PathVariable UUID courseId,
      @AuthenticationPrincipal AuthUserDetails userDetails, @Valid @RequestParam String description) {
    return this.contentVersionService.generateCourseMaterialUploadUrl(courseId, userDetails.getId(), description);
  }
}
