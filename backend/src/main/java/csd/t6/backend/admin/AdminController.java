package csd.t6.backend.admin;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import csd.t6.backend.account.dto.response.AccountResponse;
import csd.t6.backend.admin.dto.BatchUpdateApplicationDto;
import csd.t6.backend.decorators.responses.NoContentResponse;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admins")
public class AdminController {
  private final AdminService adminService;

  public AdminController(AdminService adminService) {
    this.adminService = adminService;
  }

  @GetMapping("/")
  public List<AccountResponse> getAllAdmins(@RequestParam(defaultValue = "100") int limit,
      @RequestParam(defaultValue = "0") int offset) {
    return this.adminService.getAllAdmins(limit, offset).stream().map(AccountResponse::new).toList();
  }

  @GetMapping("/contributor-applications")
  public List<AccountResponse> getAllPendingApplications(@RequestParam(defaultValue = "100") int limit,
      @RequestParam(defaultValue = "0") int offset) {
    return this.adminService.getAllPendingContributors(limit, offset).stream().map(AccountResponse::new).toList();
  }

  @PostMapping("/contributor-applications/approve")
  @NoContentResponse
  public void batchApproveContributors(@RequestBody @Valid BatchUpdateApplicationDto batchUpdateDto) {
    this.adminService.approveContributors(batchUpdateDto.learnerUuids());
  }

  @PostMapping("/contributor-applications/reject")
  @NoContentResponse
  public void batchRejectContributors(@RequestBody @Valid BatchUpdateApplicationDto batchUpdateDto) {
    this.adminService.rejectContributors(batchUpdateDto.learnerUuids());
  }
}
