package csd.t6.backend.learner;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import csd.t6.backend.auth.AuthUserDetails;
import csd.t6.backend.learner.dto.response.LearnerAnalyticsResponse;

@RestController
@RequestMapping("/api/learner/analytics")
public class LearnerAnalyticsController {
  private final LearnerAnalyticsService learnerAnalyticsService;

  public LearnerAnalyticsController(LearnerAnalyticsService learnerAnalyticsService) {
    this.learnerAnalyticsService = learnerAnalyticsService;
  }

  @GetMapping
  public LearnerAnalyticsResponse getAnalytics(@AuthenticationPrincipal AuthUserDetails requesterDetails) {
    return this.learnerAnalyticsService.getAnalytics(requesterDetails.getId());
  }
}
