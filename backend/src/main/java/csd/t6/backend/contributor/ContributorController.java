package csd.t6.backend.contributor;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import csd.t6.backend.auth.AuthUserDetails;
import csd.t6.backend.decorators.responses.BadRequestResponse;
import csd.t6.backend.decorators.responses.NoContentResponse;

@RestController
@RequestMapping("/api/contributor")
public class ContributorController {
  private final ContributorService contributorService;

  public ContributorController(ContributorService contributorService) {
    this.contributorService = contributorService;
  }

  @PostMapping("/apply")
  @BadRequestResponse()
  @NoContentResponse()
  public void applyContributor(@AuthenticationPrincipal AuthUserDetails user) {
    this.contributorService.insertPendingContributor(user.getAccount().getId());
  }
}
