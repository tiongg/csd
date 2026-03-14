package csd.t6.backend.learner;

import java.util.UUID;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import csd.t6.backend.auth.AuthUserDetails;
import csd.t6.backend.learner.dto.request.UpdateLessonSessionRequest;
import csd.t6.backend.learner.dto.response.LessonSessionResponse;
import csd.t6.backend.learner.dto.response.UserEnrolledLessonsResponse;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/learner/lesson")
public class LearnerLessonController {
  private final LearnerLessonService learnerLessonService;

  public LearnerLessonController(LearnerLessonService learnerLessonService) {
    this.learnerLessonService = learnerLessonService;
  }

  @PostMapping("/{courseId}/enroll")
  public LessonSessionResponse enrollToCourse(@PathVariable UUID courseId,
      @AuthenticationPrincipal AuthUserDetails requesterDetails) {
    return new LessonSessionResponse(this.learnerLessonService.enrollToCourse(courseId, requesterDetails.getId()));
  }

  @PutMapping("/{lessonId}/metadata")
  public LessonSessionResponse updateLessonSessionMetadata(@PathVariable UUID lessonId,
      @AuthenticationPrincipal AuthUserDetails requesterDetails,
      @Valid @RequestBody UpdateLessonSessionRequest request) {
    return new LessonSessionResponse(
        this.learnerLessonService.updateLessonSessionMetadata(lessonId, requesterDetails.getId(), request.metadata()));
  }

  @GetMapping("/enrolled")
  public UserEnrolledLessonsResponse getEnrolledLessons(@AuthenticationPrincipal AuthUserDetails requesterDetails) {
    return this.learnerLessonService.getEnrolledLessons(requesterDetails.getId());
  }

  @PostMapping("/{lessonId}/drop")
  public void dropCourse(@PathVariable UUID lessonId) {
    this.learnerLessonService.dropCourse(lessonId);
  }

  @PostMapping("/{lessonId}/complete")
  public LessonSessionResponse completeLesson(@PathVariable UUID lessonId) {
    return new LessonSessionResponse(this.learnerLessonService.completeLesson(lessonId));
  }

}
