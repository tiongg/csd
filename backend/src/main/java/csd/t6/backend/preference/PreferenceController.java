package csd.t6.backend.preference;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import csd.t6.backend.auth.AuthUserDetails;
import csd.t6.backend.decorators.auth.PublicDecorator;
import csd.t6.backend.decorators.responses.BadRequestResponse;
import csd.t6.backend.decorators.responses.OkResponse;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("/api/preference")
public class PreferenceController {
  private final PreferenceService preferenceService;

  public PreferenceController(PreferenceService preferenceService) {
    this.preferenceService = preferenceService;
  }

  @PostMapping("/")
  @PublicDecorator
  @OkResponse
  @BadRequestResponse
  public void createNewPreference(@AuthenticationPrincipal AuthUserDetails userDetails,
      @RequestBody List<String> preferences) {
    this.preferenceService.createNewPreference(userDetails.getId(), preferences);
  }

}
